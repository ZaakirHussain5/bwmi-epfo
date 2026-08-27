import { mockServiceStatus, mockServices } from "@/lib/mock-data/member-account";
import { DEFAULT_UAN, findSeedMember } from "@/lib/mock-data/seed-members";
import { buildAccountHealthReport } from "@/features/account-health/engine";
import type {
  Claim,
  ExplainabilityNote,
  MemberProfile,
  MemberSummary,
  MedicalClaimDraftInput,
  PassbookEntry,
  PassbookFilters,
  ServiceStatus,
  SupportTicket,
  SupportTicketInput,
} from "@/types/epf";
import type { EPFDataProvider } from "./types";

const NETWORK_DELAY_MS = process.env.VITEST ? 0 : 250;

const withDelay = async <T>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
  return value;
};

const toMonthlyTotal = (item: { employeeContribution: number; employerContribution: number }) =>
  item.employeeContribution + item.employerContribution;

const claimStages: Array<{
  key: Claim["currentStage"];
  label: string;
  detail: string;
  owner: "user" | "employer" | "bank" | "epfo" | "system";
  requiresUserAction: boolean;
  userAction: string;
  expectedDuration: string;
  nextStep: string;
  explainability: ExplainabilityNote;
}> = [
  {
    key: "submitted",
    label: "Claim submitted",
    detail: "Claim request is captured.",
    owner: "user",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "Immediately",
    nextStep: "Automated eligibility checks",
    explainability: {
      owner: "user",
      whatHappened: "Your claim was submitted.",
      whyItHappened: "Basic form validations passed.",
      userImpact: "Claim tracking is now active.",
      nextSteps: ["Wait for automated checks to complete."],
    },
  },
  {
    key: "initial_checks",
    label: "Automated eligibility checks",
    detail: "Basic KYC and member-account checks are performed.",
    owner: "system",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "Within a few hours",
    nextStep: "Identity and KYC verification",
    explainability: {
      owner: "system",
      whatHappened: "The claim entered automated checks.",
      whyItHappened: "Eligibility and data consistency are checked before officer review.",
      userImpact: "No action is needed unless mismatches are detected.",
      nextSteps: ["Keep KYC and bank details accurate."],
    },
  },
  {
    key: "kyc_verification",
    label: "Identity and KYC verification",
    detail: "Aadhaar, PAN, and bank linkage checks are being validated.",
    owner: "epfo",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "1 business day",
    nextStep: "Employer verification",
    explainability: {
      owner: "epfo",
      whatHappened: "KYC verification is in progress.",
      whyItHappened: "Identity matching is required before payout approvals.",
      userImpact: "Claim can pause if there is mismatch.",
      nextSteps: ["Open Profile if mismatch alerts appear."],
    },
  },
  {
    key: "employer_verification",
    label: "Employer verification",
    detail: "Employer service and contribution records are being cross-checked.",
    owner: "employer",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "1-2 business days",
    nextStep: "Assigned for processing",
    explainability: {
      owner: "employer",
      whatHappened: "Employer-linked data checks are in progress.",
      whyItHappened: "Payroll and service records must be verified.",
      userImpact: "Delays are possible when records are incomplete.",
      nextSteps: ["Contact employer if this stage remains stuck."],
    },
  },
  {
    key: "assigned_processing",
    label: "Assigned for processing",
    detail: "Claim has been assigned to an EPFO processing queue.",
    owner: "epfo",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "Within 1 business day",
    nextStep: "Under review",
    explainability: {
      owner: "epfo",
      whatHappened: "Claim moved from checks to processing queue.",
      whyItHappened: "Pre-checks finished successfully.",
      userImpact: "Claim is moving forward normally.",
      nextSteps: ["Monitor timeline for the review stage."],
    },
  },
  {
    key: "under_review",
    label: "Under review",
    detail: "Claim is reviewed against available account records.",
    owner: "epfo",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "2-4 business days",
    nextStep: "Processing",
    explainability: {
      owner: "epfo",
      whatHappened: "Claim is under review by EPFO.",
      whyItHappened: "Officer-level verification is being completed.",
      userImpact: "No action is required right now.",
      nextSteps: ["Wait for processing update."],
    },
  },
  {
    key: "processing",
    label: "Processing",
    detail: "Approved claim is being processed for disbursal.",
    owner: "epfo",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "1-2 business days",
    nextStep: "Payment initiated",
    explainability: {
      owner: "epfo",
      whatHappened: "Claim is approved and payout processing has started.",
      whyItHappened: "All review checks were completed.",
      userImpact: "Payment should move soon.",
      nextSteps: ["Ensure linked bank remains verified."],
    },
  },
  {
    key: "payment_initiated",
    label: "Payment initiated",
    detail: "Payment request is initiated to the linked bank account.",
    owner: "bank",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "Up to 24 hours",
    nextStep: "Completed",
    explainability: {
      owner: "bank",
      whatHappened: "Payout instruction was sent to your bank.",
      whyItHappened: "Claim processing has completed on EPFO side.",
      userImpact: "Credit should reflect shortly.",
      nextSteps: ["Check your bank account and report delays if needed."],
    },
  },
  {
    key: "completed",
    label: "Completed",
    detail: "Claim lifecycle is complete.",
    owner: "epfo",
    requiresUserAction: false,
    userAction: "None required",
    expectedDuration: "Completed",
    nextStep: "No further action",
    explainability: {
      owner: "epfo",
      whatHappened: "Claim has completed successfully.",
      whyItHappened: "All validations and payout workflows were finished.",
      userImpact: "No additional action is required.",
      nextSteps: ["Keep the reference number for records."],
    },
  },
];

const buildClaimTimeline = (
  currentStage: Claim["currentStage"],
  submittedDate: string,
): Claim["timeline"] => {
  const currentIndex = claimStages.findIndex((stage) => stage.key === currentStage);
  return claimStages.map((stage, index) => ({
    ...stage,
    timestamp:
      index <= currentIndex
        ? new Date(new Date(submittedDate).getTime() + index * 7_200_000).toISOString()
        : undefined,
    state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
  }));
};

const buildClaimActivity = (
  currentStage: Claim["currentStage"],
  submittedDate: string,
): Claim["activity"] =>
  buildClaimTimeline(currentStage, submittedDate).map((stage) => ({
    id: `ACT-${stage.key}`,
    key: stage.key,
    occurredAt: stage.timestamp,
    title: stage.label,
    owner: stage.owner,
    status:
      stage.state === "done" ? "completed" : stage.state === "current" ? "current" : "upcoming",
    detail: stage.detail,
    explainability: stage.explainability,
  }));

export class MockEPFDataProvider implements EPFDataProvider {
  private claims: Claim[];
  private profile: MemberProfile;
  private tickets: SupportTicket[];
  private passbook: PassbookEntry[];
  private serviceStatus: ServiceStatus[];

  constructor(uan = DEFAULT_UAN) {
    const member = findSeedMember(uan) ?? findSeedMember(DEFAULT_UAN);
    if (!member) {
      throw new Error("Seed members are missing.");
    }
    this.claims = structuredClone(member.claims);
    this.profile = structuredClone(member.profile);
    this.tickets = structuredClone(member.tickets);
    this.passbook = structuredClone(member.passbook);
    this.serviceStatus = structuredClone(mockServiceStatus);
  }

  async getMemberSummary(): Promise<MemberSummary> {
    const employeeContributionTotal = this.passbook.reduce(
      (total, entry) => total + entry.employeeContribution,
      0,
    );
    const employerContributionTotal = this.passbook.reduce(
      (total, entry) => total + entry.employerContribution,
      0,
    );
    const epsContributionTotal = this.passbook.reduce(
      (total, entry) => total + entry.epsContribution,
      0,
    );
    const interestCreditTotal = this.passbook.reduce(
      (total, entry) => total + entry.interestCredit,
      0,
    );
    const latestEntry = this.passbook.at(-1);

    if (!latestEntry) {
      throw new Error("No passbook entries available for summary generation.");
    }

    const baseSummary: MemberSummary = {
      memberId: this.profile.memberId,
      name: this.profile.name,
      uan: this.profile.uan,
      status: this.profile.uanStatus === "active" ? "active" : "inactive",
      totalBalance:
        employeeContributionTotal +
        employerContributionTotal +
        interestCreditTotal +
        epsContributionTotal,
      employeeContributionTotal,
      employerContributionTotal,
      epsContributionTotal,
      recentContribution: toMonthlyTotal(latestEntry),
      recentContributionMonth: latestEntry.wageMonth,
      pendingActions: [],
    };
    const health = buildAccountHealthReport({
      summary: baseSummary,
      profile: this.profile,
      passbook: this.passbook,
      claims: this.claims,
    });
    baseSummary.accountHealth = health;
    baseSummary.pendingActions = health.anomalies
      .slice(0, 3)
      .map((item) => `${item.title}: ${item.explainability.nextSteps[0] ?? item.detail}`);
    return withDelay(baseSummary);
  }

  async getPassbook(filters?: PassbookFilters) {
    const query = filters?.query?.trim().toLowerCase();

    const filtered = this.passbook.filter((entry) => {
      const matchesYear = filters?.year
        ? new Date(entry.postedAt).getUTCFullYear() === filters.year
        : true;
      const matchesQuery = query
        ? entry.wageMonth.includes(query) ||
          entry.note?.toLowerCase().includes(query) ||
          entry.id.toLowerCase().includes(query)
        : true;

      return matchesYear && matchesQuery;
    });

    return withDelay(structuredClone(filtered));
  }

  async getClaims() {
    return withDelay(structuredClone(this.claims));
  }

  async getClaimById(id: string) {
    const claim = this.claims.find(
      (entry) => entry.id === id || entry.referenceNumber === id,
    );

    if (!claim) {
      throw new Error(`Claim ${id} not found in account data.`);
    }

    return withDelay(structuredClone(claim));
  }

  async saveMedicalAdvanceDraft(input: MedicalClaimDraftInput) {
    const now = new Date().toISOString();

    if (input.draftId) {
      const draftIndex = this.claims.findIndex(
        (claim) => claim.id === input.draftId && claim.status === "draft",
      );

      if (draftIndex >= 0) {
        const existing = this.claims[draftIndex];
        const updatedDraft: Claim = {
          ...existing,
          amount: input.amount,
          lastUpdated: now,
          statusCategory: "informational",
          currentOwner: "user",
          actionRequired: true,
          userAction: "Review and submit this draft claim.",
          expectedNextStep: "Submit claim",
          expectedProcessingTime: "Immediately after confirmation",
          timeline: buildClaimTimeline("submitted", existing.createdAt),
          activity: buildClaimActivity("submitted", existing.createdAt),
          context: {
            purpose: input.purpose,
            notes: input.notes,
            hospitalizationDate: input.hospitalizationDate,
            claimFormType: input.claimFormType,
            bankVerificationState: input.bankVerificationState,
            selectedEmploymentMemberId: input.selectedEmploymentMemberId,
            selectedEmploymentEmployer: input.selectedEmploymentEmployer,
          },
          nextAction: "Review and confirm to submit this draft claim.",
        };
        this.claims[draftIndex] = updatedDraft;
        return withDelay(updatedDraft);
      }
    }

    const newDraft: Claim = {
      id: `CLM-DRAFT-${Date.now()}`,
      referenceNumber: `NIDHI-DR-${new Date().getUTCFullYear()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`,
      type: "medical_advance",
      amount: input.amount,
      createdAt: now,
      lastUpdated: now,
      status: "draft",
      statusCategory: "informational",
      currentOwner: "user",
      actionRequired: true,
      userAction: "Review and submit this draft claim.",
      expectedNextStep: "Submit claim",
      expectedProcessingTime: "Immediately after confirmation",
      currentStage: "submitted",
      timeline: buildClaimTimeline("submitted", now),
      activity: buildClaimActivity("submitted", now),
      nextAction: "Review and confirm to submit this draft claim.",
      context: {
        purpose: input.purpose,
        notes: input.notes,
        hospitalizationDate: input.hospitalizationDate,
        claimFormType: input.claimFormType,
        bankVerificationState: input.bankVerificationState,
        selectedEmploymentMemberId: input.selectedEmploymentMemberId,
        selectedEmploymentEmployer: input.selectedEmploymentEmployer,
      },
    };

    this.claims = [newDraft, ...this.claims];
    return withDelay(newDraft);
  }

  async submitMedicalAdvanceClaim(draftId: string) {
    const draftIndex = this.claims.findIndex(
      (claim) => claim.id === draftId && claim.status === "draft",
    );

    if (draftIndex < 0) {
      throw new Error("Draft claim not found for submission.");
    }

    const submittedAt = new Date().toISOString();
    const existingDraft = this.claims[draftIndex];
    const activeClaim: Claim = {
      ...existingDraft,
      referenceNumber: `NIDHI-${new Date().getUTCFullYear()}-${Math.floor(
        10000 + Math.random() * 90000,
      )}`,
      lastUpdated: submittedAt,
      status: "active",
      statusCategory: "in_progress",
      currentOwner: "epfo",
      actionRequired: false,
      userAction: "None required",
      expectedNextStep: "Identity and KYC verification",
      expectedProcessingTime: "2-4 business days",
      currentStage: "initial_checks",
      timeline: buildClaimTimeline("initial_checks", submittedAt),
      activity: buildClaimActivity("initial_checks", submittedAt),
      nextAction: "Initial checks have started. EPFO will update the next stage shortly.",
      createdAt: submittedAt,
    };

    this.claims[draftIndex] = activeClaim;
    return withDelay(activeClaim);
  }

  async getProfile() {
    return withDelay(structuredClone(this.profile));
  }

  async updateProfile(data: Partial<MemberProfile>) {
    this.profile = {
      ...this.profile,
      ...data,
      kyc: {
        ...this.profile.kyc,
        ...(data.kyc ?? {}),
      },
      bank: {
        ...this.profile.bank,
        ...(data.bank ?? {}),
      },
      employment: data.employment ?? this.profile.employment,
      nominees: data.nominees ?? this.profile.nominees,
    };

    return withDelay(structuredClone(this.profile));
  }

  async getServices() {
    return withDelay([...mockServices]);
  }

  async getServiceStatus() {
    return withDelay(structuredClone(this.serviceStatus));
  }

  async getSupportTickets() {
    return withDelay(structuredClone(this.tickets));
  }

  async getSupportTicketById(id: string) {
    const ticket = this.tickets.find(
      (entry) => entry.id === id || entry.referenceNumber === id,
    );

    if (!ticket) {
      throw new Error(`Support ticket ${id} not found in account data.`);
    }

    return withDelay(structuredClone(ticket));
  }

  async createSupportTicket(input: SupportTicketInput) {
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: `TCK-${Date.now()}`,
      referenceNumber: `SUP-${new Date().getUTCFullYear()}-${Math.floor(
        1000 + Math.random() * 9000,
      )}`,
      subject: input.subject.trim(),
      category: input.category,
      description: input.description.trim(),
      status: "open",
      statusCategory: "action_required",
      currentOwner: "epfo",
      createdAt: now,
      lastUpdate: now,
      nextExpectedAction: "EPFO triage expected within 1 business day.",
      timeline: [
        {
          id: `TCK-EVT-${Date.now()}`,
          occurredAt: now,
          owner: "user",
          status: "open",
          detail: "Case submitted by member.",
        },
      ],
    };

    this.tickets = [ticket, ...this.tickets];
    return withDelay(ticket);
  }

  async updateSupportTicket(
    id: string,
    data: Partial<
      Pick<
        SupportTicket,
        "status" | "statusCategory" | "currentOwner" | "nextExpectedAction" | "closureReason"
      >
    >,
  ) {
    const ticketIndex = this.tickets.findIndex((entry) => entry.id === id);
    if (ticketIndex < 0) {
      throw new Error(`Support ticket ${id} not found.`);
    }
    const current = this.tickets[ticketIndex];
    const now = new Date().toISOString();
    const updated: SupportTicket = {
      ...current,
      ...data,
      lastUpdate: now,
      timeline: [
        ...current.timeline,
        {
          id: `TCK-EVT-${Date.now()}`,
          occurredAt: now,
          owner: data.currentOwner ?? current.currentOwner,
          status: data.status ?? current.status,
          detail:
            data.status === "resolved"
              ? "Case marked resolved."
              : data.status === "open"
                ? "Case reopened by member feedback."
                : "Case status updated.",
        },
      ],
    };
    this.tickets[ticketIndex] = updated;
    return withDelay(structuredClone(updated));
  }
}

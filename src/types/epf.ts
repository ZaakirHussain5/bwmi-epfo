export type VerificationState = "verified" | "pending" | "needs_attention";
export type StatusCategory =
  | "action_required"
  | "important"
  | "in_progress"
  | "informational"
  | "resolved";
export type ActionOwner = "user" | "employer" | "bank" | "epfo" | "system";

export interface ActionCTA {
  label: string;
  href: string;
}

export interface ExplainabilityNote {
  whatHappened: string;
  whyItHappened: string;
  userImpact: string;
  nextSteps: string[];
  owner: ActionOwner;
}

export interface AccountAnomaly {
  id: string;
  title: string;
  detail: string;
  impact: string;
  detectedAt: string;
  severity: "low" | "medium" | "high";
  category: StatusCategory;
  owner: ActionOwner;
  cta?: ActionCTA;
  explainability: ExplainabilityNote;
}

export interface AccountHealthCheck {
  id: string;
  title: string;
  status: "ok" | "warning" | "blocked";
  readinessWeight: number;
  summary: string;
  impact: string;
  owner: ActionOwner;
  cta?: ActionCTA;
  explainability: ExplainabilityNote;
}

export interface AccountHealthReport {
  score: number;
  claimReadinessPercent: number;
  checks: AccountHealthCheck[];
  anomalies: AccountAnomaly[];
  primaryIssue?: AccountAnomaly;
  proactiveAlerts: string[];
}

export interface MemberSummary {
  memberId: string;
  name: string;
  uan: string;
  status: "active" | "inactive";
  totalBalance: number;
  employeeContributionTotal: number;
  employerContributionTotal: number;
  epsContributionTotal: number;
  recentContribution: number;
  recentContributionMonth: string;
  pendingActions: string[];
  accountHealth?: AccountHealthReport;
}

export interface PassbookFilters {
  year?: number;
  query?: string;
}

export interface PassbookEntry {
  id: string;
  postedAt: string;
  wageMonth: string;
  employerName?: string;
  employeeContribution: number;
  employerContribution: number;
  epsContribution: number;
  interestCredit: number;
  transferIn?: number;
  withdrawal?: number;
  adjustment?: number;
  note?: string;
}

export type ClaimStageKey =
  | "submitted"
  | "initial_checks"
  | "eligibility_checks"
  | "kyc_verification"
  | "employer_verification"
  | "assigned_processing"
  | "under_review"
  | "processing"
  | "payment_initiated"
  | "completed"
  | "rejected";

export interface ClaimStage {
  key: ClaimStageKey;
  label: string;
  timestamp?: string;
  state: "done" | "current" | "upcoming";
  owner: ActionOwner;
  requiresUserAction: boolean;
  userAction: string;
  expectedDuration: string;
  nextStep: string;
  detail: string;
  explainability: ExplainabilityNote;
}

export interface ClaimActivityEvent {
  id: string;
  key: ClaimStageKey;
  occurredAt?: string;
  title: string;
  owner: ActionOwner;
  status: "completed" | "current" | "upcoming";
  detail: string;
  explainability: ExplainabilityNote;
}

export interface ClaimRejection {
  code: string;
  rawMessage: string;
  owner: ActionOwner;
  resolutionSteps: string[];
  ctas: ActionCTA[];
  explainability: ExplainabilityNote;
}

export interface Claim {
  id: string;
  referenceNumber: string;
  type: "medical_advance" | "final_settlement" | "transfer";
  amount: number;
  createdAt: string;
  lastUpdated: string;
  status: "draft" | "active" | "completed" | "rejected";
  statusCategory: StatusCategory;
  currentOwner: ActionOwner;
  actionRequired: boolean;
  userAction: string;
  expectedNextStep: string;
  expectedProcessingTime: string;
  currentStage: ClaimStageKey;
  timeline: ClaimStage[];
  activity: ClaimActivityEvent[];
  nextAction: string;
  rejection?: ClaimRejection;
  context?: {
    purpose?: string;
    notes?: string;
    hospitalizationDate?: string;
    claimFormType?: ClaimFormType;
    bankVerificationState?: VerificationState;
    selectedEmploymentMemberId?: string;
    selectedEmploymentEmployer?: string;
  };
}

export type ClaimFormType = "form_19" | "form_10d" | "form_31" | "form_16c";

export interface MedicalClaimDraftInput {
  draftId?: string;
  amount: number;
  purpose: string;
  notes: string;
  hospitalizationDate?: string;
  claimFormType: ClaimFormType;
  bankVerificationState: VerificationState;
  selectedEmploymentMemberId: string;
  selectedEmploymentEmployer: string;
}

export interface EmploymentRecord {
  employerName: string;
  memberId: string;
  uanLinked: string;
  dojEpf: string;
  doeEpf?: string;
  status: "current" | "past";
  transferStatus: "not_applicable" | "completed" | "in_progress" | "needs_attention";
  serviceHistoryStatus: "complete" | "missing" | "needs_review";
  integrityFlags: string[];
}

export interface Nominee {
  id: string;
  name: string;
  relationship: string;
  sharePercent: number;
  dob: string;
}

export interface MemberProfile {
  memberId: string;
  name: string;
  uan: string;
  uanStatus: "active" | "inactive" | "needs_attention";
  dateOfBirth: string;
  mobile: string;
  email: string;
  kyc: {
    aadhaarMasked: string;
    panMasked: string;
    aadhaarStatus: VerificationState;
    panStatus: VerificationState;
    pipeline: Array<{
      id: string;
      label: string;
      status: "completed" | "in_progress" | "blocked";
      owner: ActionOwner;
      detail: string;
    }>;
    mismatches: Array<{
      id: string;
      field: string;
      epfoValue: string;
      sourceValue: string;
      owner: ActionOwner;
      cta: ActionCTA;
      explainability: ExplainabilityNote;
    }>;
  };
  employment: EmploymentRecord[];
  bank: {
    accountMasked: string;
    ifscMasked: string;
    status: VerificationState;
    pipeline: Array<{
      id: string;
      label: string;
      status: "completed" | "in_progress" | "blocked";
      owner: ActionOwner;
      detail: string;
    }>;
    mismatches: Array<{
      id: string;
      field: string;
      epfoValue: string;
      sourceValue: string;
      owner: ActionOwner;
      cta: ActionCTA;
      explainability: ExplainabilityNote;
    }>;
    readyForClaims: boolean;
  };
  nominees: Nominee[];
  careerSummary: {
    totalEligibleServiceMonths: number;
    totalPfAccountsDetected: number;
    reconciledAccounts: number;
    accountsRequiringAttention: number;
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  estimatedSteps: number;
  isAvailable: boolean;
}

export type SupportTicketCategory =
  | "claim"
  | "passbook"
  | "profile"
  | "account"
  | "other";

export type SupportTicketStatus = "open" | "in_progress" | "resolved";

export interface SupportTicketEvent {
  id: string;
  occurredAt: string;
  owner: ActionOwner;
  status: SupportTicketStatus;
  detail: string;
  documents?: string[];
}

export interface SupportTicket {
  id: string;
  referenceNumber: string;
  subject: string;
  category: SupportTicketCategory;
  description: string;
  status: SupportTicketStatus;
  statusCategory: StatusCategory;
  currentOwner: ActionOwner;
  createdAt: string;
  lastUpdate: string;
  nextExpectedAction: string;
  closureReason?: string;
  timeline: SupportTicketEvent[];
}

export interface SupportTicketInput {
  subject: string;
  category: SupportTicketCategory;
  description: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage";
  owner: ActionOwner;
  lastUpdated: string;
  detail: string;
  estimatedRestoration?: string;
  draftsSafe: boolean;
}

import type {
  AccountAnomaly,
  AccountHealthCheck,
  AccountHealthReport,
  Claim,
  ExplainabilityNote,
  MemberProfile,
  MemberSummary,
  PassbookEntry,
} from "@/types/epf";

const DAY_MS = 86_400_000;

function explainability(input: Omit<ExplainabilityNote, "owner"> & { owner?: ExplainabilityNote["owner"] }) {
  return {
    owner: input.owner ?? "epfo",
    whatHappened: input.whatHappened,
    whyItHappened: input.whyItHappened,
    userImpact: input.userImpact,
    nextSteps: input.nextSteps,
  } satisfies ExplainabilityNote;
}

function severityRank(severity: AccountAnomaly["severity"]) {
  if (severity === "high") {
    return 3;
  }
  if (severity === "medium") {
    return 2;
  }
  return 1;
}

function detectContributionAnomalies(entries: PassbookEntry[]): AccountAnomaly[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime(),
  );
  if (sorted.length < 2) {
    return [];
  }

  const anomalies: AccountAnomaly[] = [];
  const latest = sorted.at(-1);
  const previous = sorted.at(-2);

  if (latest && previous) {
    const latestTotal =
      latest.employeeContribution + latest.employerContribution + latest.interestCredit;
    const previousTotal =
      previous.employeeContribution + previous.employerContribution + previous.interestCredit;
    if (previousTotal > 0) {
      const changePercent = ((latestTotal - previousTotal) / previousTotal) * 100;
      if (Math.abs(changePercent) >= 18) {
        anomalies.push({
          id: "anomaly-contribution-change",
          title: "Unexpected contribution change",
          detail: `Contribution changed by ${changePercent.toFixed(1)}% from ${previous.wageMonth} to ${latest.wageMonth}.`,
          impact:
            "Large contribution shifts can delay claim validation if payroll context is missing.",
          detectedAt: latest.postedAt,
          severity: "medium",
          category: "important",
          owner: "employer",
          cta: { label: "Review passbook", href: "/passbook" },
          explainability: explainability({
            owner: "employer",
            whatHappened:
              "Your latest posted contribution is notably different from the previous month.",
            whyItHappened:
              "This often happens due to payroll changes, partial attendance, or late posting.",
            userImpact:
              "You may be asked for clarification if this period is used in eligibility checks.",
            nextSteps: [
              "Open Passbook and compare the two months.",
              "Keep payroll evidence ready if the difference is valid.",
            ],
          }),
        });
      }
    }
  }

  for (let index = 1; index < sorted.length; index += 1) {
    const previousDate = new Date(sorted[index - 1].postedAt).getTime();
    const currentDate = new Date(sorted[index].postedAt).getTime();
    const gapDays = Math.round((currentDate - previousDate) / DAY_MS);
    if (gapDays > 45) {
      anomalies.push({
        id: `anomaly-gap-${sorted[index].id}`,
        title: "Missing monthly contribution window",
        detail: `There is a ${gapDays}-day gap between ${sorted[index - 1].wageMonth} and ${sorted[index].wageMonth}.`,
        impact:
          "Long contribution gaps can affect service continuity checks during claims or transfers.",
        detectedAt: sorted[index].postedAt,
        severity: "high",
        category: "action_required",
        owner: "employer",
        cta: { label: "Raise a support case", href: "/help" },
        explainability: explainability({
          owner: "employer",
          whatHappened:
            "A monthly contribution window appears to be missing in your account timeline.",
          whyItHappened:
            "This can be caused by non-filing, delayed filing, or member ID transition periods.",
          userImpact:
            "Claims or transfer checks may pause until continuity is validated.",
          nextSteps: [
            "Review the missing period in Passbook.",
            "Contact your employer for missing filing confirmation.",
            "Raise a case if records are still not updated.",
          ],
        }),
      });
      break;
    }
  }

  return anomalies;
}

function detectProfileAnomalies(profile: MemberProfile): AccountAnomaly[] {
  const anomalies: AccountAnomaly[] = [];
  const now = new Date().toISOString();
  const hasMissingExit = profile.employment.some(
    (record) => record.status === "past" && !record.doeEpf,
  );
  const hasTransferIssue = profile.employment.some(
    (record) => record.status === "past" && record.transferStatus !== "completed",
  );
  const hasDuplicateUan = profile.employment.some(
    (record) => record.integrityFlags.includes("duplicate_uan_detected"),
  );

  if (hasMissingExit) {
    anomalies.push({
      id: "anomaly-missing-exit",
      title: "Previous employment record needs review",
      detail: "A previous PF account is missing Date of Exit.",
      impact: "Missing Date of Exit can block transfer processing and final settlement claims.",
      detectedAt: now,
      severity: "high",
      category: "action_required",
      owner: "employer",
      cta: { label: "Review PF Career Map", href: "/profile" },
      explainability: explainability({
        owner: "employer",
        whatHappened: "A previous employer record is incomplete in your service history.",
        whyItHappened: "Date of Exit was not updated in the mapped PF member account.",
        userImpact: "Your future transfer or withdrawal can be delayed until corrected.",
        nextSteps: [
          "Open Profile and check the flagged employer record.",
          "Contact previous employer for Date of Exit update.",
          "Raise a grievance if update is not completed.",
        ],
      }),
    });
  }

  if (hasTransferIssue) {
    anomalies.push({
      id: "anomaly-transfer-stuck",
      title: "Previous PF account transfer is not fully reconciled",
      detail: "At least one historical PF account shows transfer pending or incomplete.",
      impact: "Unreconciled transfers can affect total balance and claim eligibility checks.",
      detectedAt: now,
      severity: "high",
      category: "action_required",
      owner: "epfo",
      cta: { label: "Track transfer readiness", href: "/profile" },
      explainability: explainability({
        owner: "epfo",
        whatHappened: "Your older PF account has not finished transfer reconciliation.",
        whyItHappened:
          "Transfer verification may still be pending between previous and current establishments.",
        userImpact: "Claim and transfer processing may pause until reconciliation is complete.",
        nextSteps: [
          "Review transfer status in the PF Career Map.",
          "Keep previous employer details ready for verification.",
          "Ask Nidhi or open a case if this remains stuck.",
        ],
      }),
    });
  }

  if (hasDuplicateUan) {
    anomalies.push({
      id: "anomaly-duplicate-uan",
      title: "Possible duplicate UAN detected",
      detail: "One or more records indicate potential duplicate UAN linkage.",
      impact: "Duplicate UAN can block claim settlement and service merging.",
      detectedAt: now,
      severity: "high",
      category: "action_required",
      owner: "epfo",
      cta: { label: "Start correction", href: "/help" },
      explainability: explainability({
        owner: "epfo",
        whatHappened: "Your profile hints at a duplicate UAN association.",
        whyItHappened:
          "Separate employer filings may have mapped service under more than one UAN reference.",
        userImpact:
          "Claims and transfers may fail until records are unified under one valid UAN.",
        nextSteps: [
          "Verify all member IDs in Profile.",
          "Raise a case requesting UAN merge/validation.",
        ],
      }),
    });
  }

  return anomalies;
}

function buildChecks(profile: MemberProfile, otpVerified: boolean): AccountHealthCheck[] {
  const nomineeReady = profile.nominees.length > 0;
  const employmentHealthy = !profile.employment.some(
    (record) =>
      record.serviceHistoryStatus !== "complete" || record.integrityFlags.length > 0,
  );
  const transferHealthy = !profile.employment.some(
    (record) => record.status === "past" && record.transferStatus !== "completed",
  );

  return [
    {
      id: "check-login-otp",
      title: "Login OTP verification",
      status: otpVerified ? "ok" : "blocked",
      readinessWeight: 8,
      summary: otpVerified
        ? "OTP verification is complete for this session."
        : "OTP verification is required before secure access.",
      impact: "Without OTP verification, secure login should not proceed.",
      owner: "system",
      cta: { label: "Verify OTP on login", href: "/sign-in" },
      explainability: explainability({
        owner: "system",
        whatHappened: otpVerified
          ? "Your session passed OTP verification."
          : "OTP verification has not been completed.",
        whyItHappened: otpVerified
          ? "You entered the expected OTP during login."
          : "The login OTP step was skipped or failed.",
        userImpact: otpVerified
          ? "Account access and health checks include OTP readiness."
          : "You should verify OTP to complete secure access checks.",
        nextSteps: otpVerified
          ? ["Continue with account actions normally."]
          : ["Return to sign in and complete OTP verification."],
      }),
    },
    {
      id: "check-uan",
      title: "UAN status",
      status: profile.uanStatus === "active" ? "ok" : "blocked",
      readinessWeight: 12,
      summary:
        profile.uanStatus === "active"
          ? "UAN is active and linked to current member records."
          : "UAN requires attention before claims.",
      impact: "Inactive UAN can block most transactions.",
      owner: "user",
      cta: { label: "Review profile", href: "/profile" },
      explainability: explainability({
        owner: "user",
        whatHappened:
          profile.uanStatus === "active"
            ? "Your UAN is currently active."
            : "Your UAN is not fully active for transactions.",
        whyItHappened:
          profile.uanStatus === "active"
            ? "Identity link checks are in good state."
            : "Identity linkage or account integrity checks are pending.",
        userImpact:
          profile.uanStatus === "active"
            ? "You can continue with normal EPF actions."
            : "Claims or transfers may be blocked until this is fixed.",
        nextSteps: ["Open Profile to review UAN-linked records."],
      }),
    },
    {
      id: "check-aadhaar",
      title: "Aadhaar verification",
      status: profile.kyc.aadhaarStatus === "verified" ? "ok" : "blocked",
      readinessWeight: 16,
      summary:
        profile.kyc.aadhaarStatus === "verified"
          ? "Aadhaar is verified."
          : "Aadhaar verification is pending or mismatched.",
      impact: "Aadhaar mismatches can block online claim submission.",
      owner: "user",
      cta: { label: "Check KYC pipeline", href: "/profile" },
      explainability: explainability({
        owner: "user",
        whatHappened:
          profile.kyc.aadhaarStatus === "verified"
            ? "Aadhaar verification is complete."
            : "Aadhaar verification is not complete.",
        whyItHappened:
          profile.kyc.aadhaarStatus === "verified"
            ? "Identity matching checks passed."
            : "Identity details did not fully match or verification is still in progress.",
        userImpact:
          profile.kyc.aadhaarStatus === "verified"
            ? "No Aadhaar-related action is needed."
            : "Claim processing can stop at KYC checks.",
        nextSteps: ["Review mismatch fields and start correction if needed."],
      }),
    },
    {
      id: "check-pan",
      title: "PAN verification",
      status: profile.kyc.panStatus === "verified" ? "ok" : "warning",
      readinessWeight: 10,
      summary:
        profile.kyc.panStatus === "verified"
          ? "PAN verification is complete."
          : "PAN verification still needs attention.",
      impact: "PAN issues can delay higher-value claim settlements.",
      owner: "user",
      cta: { label: "Review PAN details", href: "/profile" },
      explainability: explainability({
        owner: "user",
        whatHappened:
          profile.kyc.panStatus === "verified"
            ? "PAN record is verified."
            : "PAN record is pending or mismatched.",
        whyItHappened:
          profile.kyc.panStatus === "verified"
            ? "PAN details matched successfully."
            : "Name/date details may differ or PAN sync is pending.",
        userImpact:
          profile.kyc.panStatus === "verified"
            ? "No PAN-related claim delay is expected."
            : "Certain claim types may take longer to clear.",
        nextSteps: ["Check PAN-linked details and submit corrections if prompted."],
      }),
    },
    {
      id: "check-bank",
      title: "Bank account verification",
      status: profile.bank.readyForClaims ? "ok" : "blocked",
      readinessWeight: 20,
      summary: profile.bank.readyForClaims
        ? "Bank account is fully verified for claim credit."
        : "Bank verification is still in progress or blocked.",
      impact: "Unverified bank details can stop payment disbursal.",
      owner: "bank",
      cta: { label: "Check bank pipeline", href: "/profile" },
      explainability: explainability({
        owner: "bank",
        whatHappened: profile.bank.readyForClaims
          ? "Your bank account passed all required checks."
          : "Your bank account is not yet marked ready for claim credits.",
        whyItHappened: profile.bank.readyForClaims
          ? "Account validation and identity matching completed."
          : "Either bank validation or identity matching is still pending.",
        userImpact: profile.bank.readyForClaims
          ? "Claim payouts can proceed to your linked account."
          : "Claim approval may complete but payout can be delayed.",
        nextSteps: ["Review pipeline stage details and correct mismatched fields."],
      }),
    },
    {
      id: "check-nominee",
      title: "Nominee status",
      status: nomineeReady ? "ok" : "warning",
      readinessWeight: 8,
      summary: nomineeReady
        ? "Nominee details are available."
        : "No nominee has been recorded yet.",
      impact: "Missing nominee records can slow future family claims.",
      owner: "user",
      cta: { label: "Manage nominees", href: "/profile" },
      explainability: explainability({
        owner: "user",
        whatHappened: nomineeReady
          ? "Nominee data is present."
          : "Nominee details are missing.",
        whyItHappened: nomineeReady
          ? "At least one nominee is configured."
          : "No nominee has been added in the profile.",
        userImpact: nomineeReady
          ? "Family-related claims stay easier to process."
          : "Future dependency/settlement cases may need extra paperwork.",
        nextSteps: ["Add or review nominee allocation in Profile."],
      }),
    },
    {
      id: "check-employment",
      title: "Employment history integrity",
      status: employmentHealthy ? "ok" : "warning",
      readinessWeight: 18,
      summary: employmentHealthy
        ? "Employment history is coherent."
        : "Employment history has unresolved integrity flags.",
      impact: "Service history gaps can impact eligibility and transfer checks.",
      owner: "employer",
      cta: { label: "Open PF Career Map", href: "/profile" },
      explainability: explainability({
        owner: "employer",
        whatHappened: employmentHealthy
          ? "Employment records are internally consistent."
          : "One or more employment records need reconciliation.",
        whyItHappened: employmentHealthy
          ? "Service history checks passed."
          : "Missing dates, transfer tags, or duplicate links were detected.",
        userImpact: employmentHealthy
          ? "Eligibility checks should proceed smoothly."
          : "Claims may move to manual review.",
        nextSteps: ["Check flagged records and contact the relevant employer."],
      }),
    },
    {
      id: "check-transfer",
      title: "Previous PF transfer status",
      status: transferHealthy ? "ok" : "warning",
      readinessWeight: 16,
      summary: transferHealthy
        ? "Previous PF accounts are reconciled."
        : "At least one previous PF transfer is still pending.",
      impact: "Pending transfers can reduce visible balance and delay settlements.",
      owner: "epfo",
      cta: { label: "Track transfer", href: "/profile" },
      explainability: explainability({
        owner: "epfo",
        whatHappened: transferHealthy
          ? "Transfer reconciliation is complete."
          : "One or more transfer chains are incomplete.",
        whyItHappened: transferHealthy
          ? "Historical accounts are successfully merged."
          : "A previous employer record or transfer leg is still under processing.",
        userImpact: transferHealthy
          ? "Your total PF picture is fully consolidated."
          : "Withdrawals or transfers can pause for verification.",
        nextSteps: ["Review pending transfer records and raise a case if needed."],
      }),
    },
  ];
}

export function buildAccountHealthReport(input: {
  summary: MemberSummary;
  profile: MemberProfile;
  passbook: PassbookEntry[];
  claims: Claim[];
  otpVerified?: boolean;
}): AccountHealthReport {
  const checks = buildChecks(input.profile, input.otpVerified ?? true);
  const profileAnomalies = detectProfileAnomalies(input.profile);
  const contributionAnomalies = detectContributionAnomalies(input.passbook);
  const claimAnomalies: AccountAnomaly[] = input.claims
    .filter((claim) => claim.status === "rejected")
    .map((claim) => ({
      id: `anomaly-claim-${claim.id}`,
      title: "Rejected claim requires resolution",
      detail: `${claim.referenceNumber} is currently rejected.`,
      impact: "The same issue can block similar claim attempts until resolved.",
      detectedAt: claim.lastUpdated,
      severity: "high",
      category: "action_required",
      owner: claim.currentOwner,
      cta: { label: "Resolve rejected claim", href: "/claims" },
      explainability: claim.rejection?.explainability ?? explainability({
        owner: claim.currentOwner,
        whatHappened: "A claim was rejected and needs corrective action.",
        whyItHappened: "Required validation failed in claim checks.",
        userImpact: "You cannot complete the same claim path until corrected.",
        nextSteps: ["Open Claims to view resolution steps."],
      }),
    }));

  const anomalies = [...profileAnomalies, ...contributionAnomalies, ...claimAnomalies].sort(
    (a, b) => severityRank(b.severity) - severityRank(a.severity),
  );

  const penalty = checks.reduce((total, check) => {
    if (check.status === "blocked") {
      return total + check.readinessWeight;
    }
    if (check.status === "warning") {
      return total + Math.round(check.readinessWeight * 0.5);
    }
    return total;
  }, 0);
  const anomalyPenalty = anomalies.reduce((total, anomaly) => {
    if (anomaly.severity === "high") {
      return total + 5;
    }
    if (anomaly.severity === "medium") {
      return total + 3;
    }
    return total + 1;
  }, 0);
  const score = Math.max(48, Math.min(100, 100 - penalty - anomalyPenalty));
  const claimReadinessPercent = Math.max(42, Math.min(100, score));

  return {
    score,
    claimReadinessPercent,
    checks,
    anomalies,
    primaryIssue: anomalies[0],
    proactiveAlerts: anomalies.slice(0, 3).map((anomaly) => anomaly.title),
  };
}

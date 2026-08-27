import { retrieveKnowledge } from "@/lib/knowledge/retrieve";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";
import type { EPFDataProvider } from "@/services/epf-data-provider/types";
import type { MedicalClaimDraftInput } from "@/types/epf";
import { claimSubmitPreview, parseTicketCategory, ticketPreview } from "./sensitive";
import type {
  AssistantRoute,
  AssistantToolName,
  ClientAction,
  ToolExecutionResult,
} from "./types";
import { ASSISTANT_ROUTES } from "./types";

const compact = (value: unknown) => JSON.parse(JSON.stringify(value)) as unknown;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asBoolean = (value: unknown) => value === true || value === "true";

const INSIGHT_FOCUS = ["general", "passbook", "claims", "profile", "support"] as const;
type InsightFocus = (typeof INSIGHT_FOCUS)[number];

function asInsightFocus(value: unknown): InsightFocus {
  if (typeof value === "string" && INSIGHT_FOCUS.includes(value as InsightFocus)) {
    return value as InsightFocus;
  }
  return "general";
}

function monthlyTotal(entry: {
  employeeContribution: number;
  employerContribution: number;
  interestCredit: number;
  transferIn?: number;
  withdrawal?: number;
  adjustment?: number;
}) {
  return (
    entry.employeeContribution +
    entry.employerContribution +
    entry.interestCredit +
    (entry.transferIn ?? 0) -
    (entry.withdrawal ?? 0) +
    (entry.adjustment ?? 0)
  );
}

function isAssistantRoute(value: string): value is AssistantRoute {
  return (ASSISTANT_ROUTES as readonly string[]).includes(value);
}

export async function executeAssistantTool(
  name: string,
  rawArgs: unknown,
  options?: { forceConfirm?: boolean; provider?: EPFDataProvider },
): Promise<ToolExecutionResult> {
  const args = asRecord(rawArgs);
  const confirmed = options?.forceConfirm || asBoolean(args.confirmed);
  const provider = options?.provider ?? (await getSessionEpfDataProvider());

  try {
    switch (name as AssistantToolName) {
      case "get_member_summary": {
        const summary = await provider.getMemberSummary();
        return { ok: true, data: compact(summary), clientActions: [] };
      }
      case "get_account_insights": {
        const focus = asInsightFocus(args.focus);
        const [summary, passbook, claims, profile, tickets] = await Promise.all([
          provider.getMemberSummary(),
          provider.getPassbook(),
          provider.getClaims(),
          provider.getProfile(),
          provider.getSupportTickets(),
        ]);

        const sortedPassbook = [...passbook].sort(
          (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime(),
        );
        const latest = sortedPassbook.at(-1);
        const previous = sortedPassbook.at(-2);
        const latestTotal = latest ? monthlyTotal(latest) : 0;
        const previousTotal = previous ? monthlyTotal(previous) : 0;
        const deltaPercent =
          previousTotal > 0 ? Number((((latestTotal - previousTotal) / previousTotal) * 100).toFixed(1)) : 0;

        const claimCounts = claims.reduce(
          (acc, claim) => {
            acc[claim.status] += 1;
            return acc;
          },
          { draft: 0, active: 0, completed: 0, rejected: 0 },
        );
        const ticketCounts = tickets.reduce(
          (acc, ticket) => {
            acc[ticket.status] += 1;
            return acc;
          },
          { open: 0, in_progress: 0, resolved: 0 },
        );

        const health = summary.accountHealth;
        const topRisks = (health?.anomalies ?? []).slice(0, 3).map((anomaly) => ({
          title: anomaly.title,
          severity: anomaly.severity,
          owner: anomaly.owner,
          detail: anomaly.detail,
          nextStep: anomaly.explainability.nextSteps[0] ?? anomaly.impact,
          cta: anomaly.cta,
        }));

        const recommendedActions = [
          ...(health?.checks ?? [])
            .filter((check) => check.status !== "ok")
            .slice(0, 3)
            .map((check) => ({
              title: check.title,
              status: check.status,
              owner: check.owner,
              reason: check.summary,
              href: check.cta?.href,
              ctaLabel: check.cta?.label,
            })),
          ...topRisks
            .filter((risk) => risk.cta?.href)
            .slice(0, 2)
            .map((risk) => ({
              title: risk.title,
              status: risk.severity,
              owner: risk.owner,
              reason: risk.nextStep,
              href: risk.cta?.href,
              ctaLabel: risk.cta?.label,
            })),
        ].slice(0, 4);

        const focusHighlights = (() => {
          if (focus === "passbook") {
            return {
              heading: "Contribution trend",
              notes: [
                latest
                  ? `Latest wage month ${latest.wageMonth} total is ${latestTotal}.`
                  : "No latest passbook month is available.",
                previous
                  ? `Previous wage month ${previous.wageMonth} total is ${previousTotal}.`
                  : "No previous passbook month is available for comparison.",
                `Month-on-month contribution change is ${deltaPercent}%.`,
              ],
            };
          }
          if (focus === "claims") {
            return {
              heading: "Claims flow",
              notes: [
                `${claimCounts.active} active and ${claimCounts.draft} draft claim(s) are in your account.`,
                `${claimCounts.rejected} rejected claim(s) need attention.`,
                claims.find((claim) => claim.status === "active")?.nextAction ??
                  "No active claim next action is pending.",
              ],
            };
          }
          if (focus === "profile") {
            return {
              heading: "Profile readiness",
              notes: [
                `UAN is ${profile.uanStatus}.`,
                `Aadhaar is ${profile.kyc.aadhaarStatus} and PAN is ${profile.kyc.panStatus}.`,
                profile.bank.readyForClaims
                  ? "Bank verification is claim-ready."
                  : "Bank verification still blocks claim payout readiness.",
              ],
            };
          }
          if (focus === "support") {
            return {
              heading: "Support case health",
              notes: [
                `${ticketCounts.open} open, ${ticketCounts.in_progress} in-progress, and ${ticketCounts.resolved} resolved case(s).`,
                tickets[0]
                  ? `Latest case ${tickets[0].referenceNumber} is ${tickets[0].status}.`
                  : "No support tickets are currently open.",
                tickets[0]?.nextExpectedAction ?? "No pending support follow-up is required now.",
              ],
            };
          }
          return {
            heading: "Overall EPF account outlook",
            notes: [
              `Readiness score is ${health?.score ?? 0}% and claim readiness is ${health?.claimReadinessPercent ?? 0}%.`,
              `${claimCounts.active} active claim(s), ${ticketCounts.open} open support case(s).`,
              topRisks[0]?.nextStep ?? "No high-priority risk is currently detected.",
            ],
          };
        })();

        return {
          ok: true,
          data: compact({
            focus,
            summary: {
              memberName: summary.name,
              uan: summary.uan,
              totalBalance: summary.totalBalance,
              pendingActions: summary.pendingActions,
            },
            readiness: {
              score: health?.score ?? 0,
              claimReadinessPercent: health?.claimReadinessPercent ?? 0,
              proactiveAlerts: health?.proactiveAlerts ?? [],
            },
            contributionTrend: {
              latestMonth: latest?.wageMonth,
              latestTotal,
              previousMonth: previous?.wageMonth,
              previousTotal,
              deltaPercent,
            },
            claims: claimCounts,
            tickets: ticketCounts,
            topRisks,
            focusHighlights,
            recommendedActions,
          }),
          clientActions: [],
        };
      }
      case "get_passbook": {
        const entries = await provider.getPassbook({
          year: asNumber(args.year) || undefined,
          query: asString(args.query) || undefined,
        });
        const slim = entries.slice(-12).map((entry) => ({
          id: entry.id,
          wageMonth: entry.wageMonth,
          employeeContribution: entry.employeeContribution,
          employerContribution: entry.employerContribution,
          epsContribution: entry.epsContribution,
          interestCredit: entry.interestCredit,
          note: entry.note,
          monthlyTotal:
            entry.employeeContribution +
            entry.employerContribution +
            entry.interestCredit +
            (entry.transferIn ?? 0) -
            (entry.withdrawal ?? 0) +
            (entry.adjustment ?? 0),
        }));
        return { ok: true, data: slim, clientActions: [] };
      }
      case "get_claims": {
        const claims = await provider.getClaims();
        return { ok: true, data: compact(claims), clientActions: [] };
      }
      case "get_claim_details": {
        const claim = await provider.getClaimById(asString(args.claimId));
        return { ok: true, data: compact(claim), clientActions: [] };
      }
      case "get_profile": {
        const profile = await provider.getProfile();
        return { ok: true, data: compact(profile), clientActions: [] };
      }
      case "save_medical_advance_draft": {
        const amount = asNumber(args.amount);
        const purpose = asString(args.purpose).trim();
        const notes = asString(args.notes).trim();
        if (amount < 1000 || !purpose || !notes) {
          return {
            ok: false,
            data: { error: "Amount must be at least 1000 with purpose and notes." },
            clientActions: [],
          };
        }
        const profile = await provider.getProfile();
        const selectedEmployment =
          profile.employment.find((record) => record.status === "current") ?? profile.employment[0];
        const input: MedicalClaimDraftInput = {
          draftId: asString(args.draftId) || undefined,
          amount,
          purpose,
          notes,
          hospitalizationDate: asString(args.hospitalizationDate) || undefined,
          claimFormType: "form_31",
          bankVerificationState: profile.bank.readyForClaims ? "verified" : "pending",
          selectedEmploymentMemberId: selectedEmployment?.memberId ?? "",
          selectedEmploymentEmployer: selectedEmployment?.employerName ?? "",
        };
        const claim = await provider.saveMedicalAdvanceDraft(input);
        return {
          ok: true,
          data: compact(claim),
          clientActions: [{ type: "refresh", entity: "claims" }],
        };
      }
      case "submit_medical_advance_claim": {
        const draftId = asString(args.draftId);
        const draft = await provider.getClaimById(draftId);
        if (draft.status !== "draft") {
          return {
            ok: false,
            data: { error: "Only draft claims can be submitted." },
            clientActions: [],
          };
        }
        if (!confirmed) {
          return {
            ok: true,
            data: { status: "needs_confirmation" },
            clientActions: [],
            pendingConfirmation: claimSubmitPreview(draft),
          };
        }
        const submitted = await provider.submitMedicalAdvanceClaim(draft.id);
        return {
          ok: true,
          data: compact(submitted),
          clientActions: [
            { type: "refresh", entity: "claims" },
            { type: "navigate", href: "/claims", reason: "Show the submitted claim timeline." },
          ],
        };
      }
      case "create_support_ticket": {
        const subject = asString(args.subject).trim();
        const description = asString(args.description).trim();
        const category = parseTicketCategory(args.category);
        if (!subject || !description) {
          return {
            ok: false,
            data: { error: "Subject and description are required." },
            clientActions: [],
          };
        }
        if (!confirmed) {
          return {
            ok: true,
            data: { status: "needs_confirmation" },
            clientActions: [],
            pendingConfirmation: ticketPreview({ subject, category, description }),
          };
        }
        const ticket = await provider.createSupportTicket({
          subject,
          category,
          description,
        });
        return {
          ok: true,
          data: compact(ticket),
          clientActions: [
            { type: "refresh", entity: "tickets" },
            { type: "navigate", href: "/help", reason: "Open the new support ticket." },
          ],
        };
      }
      case "get_support_tickets": {
        const tickets = await provider.getSupportTickets();
        return { ok: true, data: compact(tickets), clientActions: [] };
      }
      case "search_epf_knowledge": {
        const query = asString(args.query) || "epf";
        const articles = retrieveKnowledge(query);
        return {
          ok: true,
          data: { query, articles },
          clientActions: [],
        };
      }
      case "navigate_ui": {
        const href = asString(args.href);
        if (!isAssistantRoute(href)) {
          return {
            ok: false,
            data: { error: "Unsupported portal route." },
            clientActions: [],
          };
        }
        const action: ClientAction = {
          type: "navigate",
          href,
          reason: asString(args.reason) || undefined,
        };
        return { ok: true, data: action, clientActions: [action] };
      }
      default:
        return {
          ok: false,
          data: { error: `Unknown tool ${name}` },
          clientActions: [],
        };
    }
  } catch (error) {
    return {
      ok: false,
      data: { error: error instanceof Error ? error.message : "Tool failed." },
      clientActions: [],
    };
  }
}

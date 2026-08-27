import { formatCurrency } from "@/lib/utils/format";
import type { Claim, SupportTicket, SupportTicketCategory } from "@/types/epf";
import type { PendingConfirmation } from "./types";
import { TICKET_CATEGORIES } from "./types";

export function isAffirmative(text: string) {
  return /^(yes|yep|yeah|yup|confirm|confirmed|go ahead|please submit|submit it|do it|ok|okay|sure|proceed)\b/i.test(
    text.trim(),
  );
}

export function isNegative(text: string) {
  return /^(no|nope|cancel|don't|do not|stop|never mind|nevermind)\b/i.test(text.trim());
}

export function isSensitiveTool(name: string) {
  return name === "submit_medical_advance_claim" || name === "create_support_ticket";
}

export function parseTicketCategory(value: unknown): SupportTicketCategory {
  if (typeof value === "string" && TICKET_CATEGORIES.includes(value as SupportTicketCategory)) {
    return value as SupportTicketCategory;
  }
  return "other";
}

export function claimSubmitPreview(claim: Claim): PendingConfirmation {
  return {
    tool: "submit_medical_advance_claim",
    args: { draftId: claim.id },
    title: "Submit medical advance claim",
    summary: `Submit draft ${claim.referenceNumber} for ${formatCurrency(claim.amount)}${
      claim.context?.purpose ? ` (${claim.context.purpose})` : ""
    }.`,
  };
}

export function ticketPreview(input: {
  subject: string;
  category: SupportTicketCategory;
  description: string;
}): PendingConfirmation {
  return {
    tool: "create_support_ticket",
    args: input,
    title: "Raise support ticket",
    summary: `${input.subject} [${input.category}]: ${input.description}`,
  };
}

export function ticketCreatedSummary(ticket: SupportTicket) {
  return `Ticket ${ticket.referenceNumber} is open for "${ticket.subject}".`;
}

import { NextResponse } from "next/server";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";
import type { SupportTicketInput } from "@/types/epf";

export async function GET() {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const epfDataProvider = await getSessionEpfDataProvider();
  const tickets = await epfDataProvider.getSupportTickets();
  return NextResponse.json(tickets);
}

export async function POST(request: Request) {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const payload = (await request.json()) as SupportTicketInput;
  if (!payload.subject?.trim() || !payload.description?.trim()) {
    return NextResponse.json({ error: "Subject and description are required." }, { status: 400 });
  }

  const epfDataProvider = await getSessionEpfDataProvider();
  const ticket = await epfDataProvider.createSupportTicket({
    subject: payload.subject,
    category: payload.category ?? "other",
    description: payload.description,
  });
  return NextResponse.json(ticket);
}

export async function PATCH(request: Request) {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const epfDataProvider = await getSessionEpfDataProvider();

  const payload = (await request.json()) as {
    ticketId?: string;
    action?: "mark_resolved" | "reopen";
  };

  if (!payload.ticketId || !payload.action) {
    return NextResponse.json({ error: "ticketId and action are required." }, { status: 400 });
  }

  if (payload.action === "mark_resolved") {
    const updated = await epfDataProvider.updateSupportTicket(payload.ticketId, {
      status: "resolved",
      statusCategory: "resolved",
      currentOwner: "epfo",
      nextExpectedAction: "Please confirm whether your issue is actually resolved.",
    });
    return NextResponse.json(updated);
  }

  const reopened = await epfDataProvider.updateSupportTicket(payload.ticketId, {
    status: "open",
    statusCategory: "action_required",
    currentOwner: "epfo",
    nextExpectedAction: "Case reopened. Escalation review expected within 1 business day.",
  });
  return NextResponse.json(reopened);
}

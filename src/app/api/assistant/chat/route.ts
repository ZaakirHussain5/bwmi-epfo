import { NextResponse } from "next/server";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";
import { runAssistantChat } from "@/features/assistant/run-chat";
import type { AssistantChatRequest, ChatTurn, PendingConfirmation } from "@/features/assistant/types";

export const runtime = "nodejs";

function isChatTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") {
    return false;
  }
  const turn = value as ChatTurn;
  return (turn.role === "user" || turn.role === "assistant") && typeof turn.content === "string";
}

export async function POST(request: Request) {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as AssistantChatRequest & {
    pendingConfirmation?: PendingConfirmation;
  };

  const messages = Array.isArray(body.messages) ? body.messages.filter(isChatTurn).slice(-16) : [];
  if (!messages.length && !body.confirmedAction) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  try {
    const result = await runAssistantChat({
      messages,
      currentPath: body.currentPath,
      confirmedAction: body.confirmedAction,
      pendingConfirmation: body.pendingConfirmation,
      locale: body.locale,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Assistant chat failed.", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

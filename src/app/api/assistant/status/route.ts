import { NextResponse } from "next/server";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";
import { getAssistantEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const env = getAssistantEnv();
  return NextResponse.json({
    openaiConfigured: env.openaiConfigured,
    model: env.openaiConfigured ? `OpenAI ${env.model}` : "Local intent router",
    voiceEnabled: env.openaiConfigured,
    transcribeModel: env.transcribeModel,
  });
}

import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";
import { getAssistantEnv } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const env = getAssistantEnv();
  if (!env.openaiConfigured) {
    return NextResponse.json(
      { error: "Set OPENAI_API_KEY to enable voice transcription." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: env.apiKey });
  const file = await toFile(audio, audio.name || "voice.webm");
  const transcription = await client.audio.transcriptions.create({
    file,
    model: env.transcribeModel,
  });

  return NextResponse.json({ text: transcription.text });
}

import { NextResponse } from "next/server";
import type { MedicalClaimDraftInput } from "@/types/epf";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export async function GET() {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const epfDataProvider = await getSessionEpfDataProvider();
  const claims = await epfDataProvider.getClaims();
  return NextResponse.json(claims);
}

export async function POST(request: Request) {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const payload = (await request.json()) as
    | { action: "save_draft"; data: MedicalClaimDraftInput }
    | { action: "submit_claim"; draftId: string };

  const epfDataProvider = await getSessionEpfDataProvider();
  if (payload.action === "save_draft") {
    const claim = await epfDataProvider.saveMedicalAdvanceDraft(payload.data);
    return NextResponse.json(claim);
  }

  if (payload.action === "submit_claim") {
    const claim = await epfDataProvider.submitMedicalAdvanceClaim(payload.draftId);
    return NextResponse.json(claim);
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

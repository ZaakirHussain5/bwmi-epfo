import { NextResponse } from "next/server";
import { hasAuthenticatedSessionFromCookies } from "@/lib/auth/session";
import { getSessionEpfDataProvider } from "@/services/epf-data-provider";

export async function GET() {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const epfDataProvider = await getSessionEpfDataProvider();
  const profile = await epfDataProvider.getProfile();
  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const authenticated = await hasAuthenticatedSessionFromCookies();
  if (!authenticated) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const epfDataProvider = await getSessionEpfDataProvider();
  const profile = await epfDataProvider.updateProfile(payload);
  return NextResponse.json(profile);
}

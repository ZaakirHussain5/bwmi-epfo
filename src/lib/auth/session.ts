import { cookies } from "next/headers";
import { findSeedMember, normalizeUan } from "@/lib/mock-data/seed-members";

export const NIDHI_SESSION_COOKIE = "nidhi-auth-session";
export const NIDHI_OTP_COOKIE = "nidhi-otp-verified";

export async function getSessionUan() {
  const cookieStore = await cookies();
  const uan = cookieStore.get(NIDHI_SESSION_COOKIE)?.value;
  if (!uan || !findSeedMember(uan)) {
    return null;
  }
  return normalizeUan(uan);
}

export async function hasAuthenticatedSessionFromCookies() {
  const cookieStore = await cookies();
  const uan = cookieStore.get(NIDHI_SESSION_COOKIE)?.value;
  return Boolean(
    uan &&
      findSeedMember(uan) &&
      cookieStore.get(NIDHI_OTP_COOKIE)?.value === "true",
  );
}

export async function hasOtpVerifiedFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(NIDHI_OTP_COOKIE)?.value === "true";
}

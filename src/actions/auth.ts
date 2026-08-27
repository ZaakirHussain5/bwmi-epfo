"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NIDHI_OTP_COOKIE, NIDHI_SESSION_COOKIE } from "@/lib/auth/session";
import {
  findSeedMember,
  isValidOtp,
  normalizeUan,
} from "@/lib/mock-data/seed-members";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8,
};

function otpStepPath(uan: string, error?: "invalid_otp") {
  const params = new URLSearchParams({ step: "otp", uan });
  if (error) {
    params.set("error", error);
  }
  return `/sign-in?${params.toString()}`;
}

export async function startMemberSignIn(formData: FormData) {
  const uan = normalizeUan(String(formData.get("uan") ?? ""));
  if (!findSeedMember(uan)) {
    redirect("/sign-in?error=invalid_uan");
  }
  redirect(otpStepPath(uan));
}

export async function verifyMemberOtp(formData: FormData) {
  const uan = normalizeUan(String(formData.get("uan") ?? ""));
  const otp = String(formData.get("otp") ?? "").trim();

  if (!findSeedMember(uan)) {
    redirect("/sign-in?error=invalid_uan");
  }

  if (!isValidOtp(otp)) {
    redirect(otpStepPath(uan, "invalid_otp"));
  }

  const cookieStore = await cookies();
  cookieStore.set(NIDHI_SESSION_COOKIE, uan, cookieOptions);
  cookieStore.set(NIDHI_OTP_COOKIE, "true", cookieOptions);

  redirect("/dashboard");
}

export async function signOutMemberAccount() {
  const cookieStore = await cookies();
  cookieStore.delete(NIDHI_SESSION_COOKIE);
  cookieStore.delete(NIDHI_OTP_COOKIE);
  redirect("/");
}

export async function hasAuthenticatedSession() {
  const cookieStore = await cookies();
  const uan = cookieStore.get(NIDHI_SESSION_COOKIE)?.value;
  return Boolean(
    uan &&
      findSeedMember(uan) &&
      cookieStore.get(NIDHI_OTP_COOKIE)?.value === "true",
  );
}

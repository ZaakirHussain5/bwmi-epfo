import { redirect } from "next/navigation";
import { hasAuthenticatedSession } from "@/actions/auth";
import { SignInView } from "@/components/auth/SignInView";
import { findSeedMember, listAccounts } from "@/lib/mock-data/seed-members";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; step?: string; uan?: string }>;
}) {
  const params = await searchParams;
  const alreadySignedIn = await hasAuthenticatedSession();

  if (alreadySignedIn) {
    redirect("/dashboard");
  }

  const selectedMember = params.uan ? findSeedMember(params.uan) : undefined;
  const otpStep = params.step === "otp" && Boolean(selectedMember);
  const invalidUan = params.error === "invalid_uan";
  const invalidOtp = params.error === "invalid_otp";
  const accounts = listAccounts();

  return (
    <SignInView
      otpStep={otpStep}
      invalidUan={invalidUan}
      invalidOtp={invalidOtp}
      accounts={accounts}
      selectedMember={
        selectedMember
          ? { uan: selectedMember.uan, name: selectedMember.name, activation: selectedMember.activation }
          : undefined
      }
    />
  );
}

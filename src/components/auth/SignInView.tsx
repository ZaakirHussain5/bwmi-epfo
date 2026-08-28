"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { startMemberSignIn, verifyMemberOtp } from "@/actions/auth";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { BusyOverlay } from "@/components/common/BusyOverlay";
import { IconSpinner } from "@/components/common/icons";
import { NidhiMark } from "@/components/layout/NidhiLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import type { AccountPreview } from "@/lib/mock-data/seed-members";
import { LOGIN_OTP } from "@/lib/mock-data/seed-members";

type SignInViewProps = {
  otpStep: boolean;
  invalidUan: boolean;
  invalidOtp: boolean;
  accounts: AccountPreview[];
  selectedMember?: AccountPreview;
};

export function SignInView({
  otpStep,
  invalidUan,
  invalidOtp,
  accounts,
  selectedMember,
}: SignInViewProps) {
  const { t } = useLocale();
  const pendingRef = useRef(false);
  const otpFormRef = useRef<HTMLFormElement>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const pending = pendingLabel !== null;

  const submitOtpForm = useCallback(() => {
    otpFormRef.current?.requestSubmit();
  }, []);

  const beginPending = (label: string) => (event: FormEvent<HTMLFormElement>) => {
    if (pendingRef.current) {
      event.preventDefault();
      return;
    }
    pendingRef.current = true;
    setPendingLabel(label);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-zinc-100 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="absolute right-4 top-4 flex items-center gap-2" inert={pending ? true : undefined}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <main
        className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10"
        aria-busy={pending}
        inert={pending ? true : undefined}
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-3">
            <NidhiMark className="h-12 w-12" />
            <p className="text-2xl font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">NIDHI</p>
          </div>
          <h1 className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">{t.auth.tagline}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {otpStep ? t.auth.otpHint : t.auth.uanHint}
          </p>
        </div>

        {otpStep && selectedMember ? (
          <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <p className="font-medium">{selectedMember.name}</p>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {t.common.uan}: {selectedMember.uan}
            </p>
            <p
              className={
                selectedMember.activation === "fully_activated"
                  ? "mt-1 text-emerald-700 dark:text-emerald-300"
                  : "mt-1 text-amber-700 dark:text-amber-300"
              }
            >
              {t.activation[selectedMember.activation]}
            </p>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {t.common.otp}: {LOGIN_OTP}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.auth.availableAccounts}
            </p>
            <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
              {accounts.map((account) => (
                <form action={startMemberSignIn} key={account.uan} onSubmit={beginPending(t.auth.continuing)}>
                  <input type="hidden" name="uan" value={account.uan} />
                  <button
                    type="submit"
                    disabled={pending}
                    aria-busy={pending}
                    className="w-full rounded-xl bg-zinc-100 px-4 py-3 text-left text-sm text-zinc-800 transition hover:bg-zinc-200 hover:ring-1 hover:ring-teal-500/40 disabled:cursor-wait disabled:opacity-70 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:ring-teal-400/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="mt-0.5 text-zinc-500 dark:text-zinc-400">
                          {t.common.uan}: {account.uan}
                        </p>
                      </div>
                      <p
                        className={
                          account.activation === "fully_activated"
                            ? "shrink-0 text-xs text-emerald-700 dark:text-emerald-300"
                            : "shrink-0 text-xs text-amber-700 dark:text-amber-300"
                        }
                      >
                        {t.activation[account.activation]}
                      </p>
                    </div>
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}

        {invalidUan ? (
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {t.auth.invalidUan}
          </p>
        ) : null}

        {invalidOtp ? (
          <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {interpolate(t.auth.invalidOtp, { otp: LOGIN_OTP })}
          </p>
        ) : null}

        {otpStep && selectedMember ? (
          <form ref={otpFormRef} action={verifyMemberOtp} onSubmit={beginPending(t.auth.verifyingOtp)}>
            <input type="hidden" name="uan" value={selectedMember.uan} />
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="otp-input">
              {t.common.otp}
            </label>
            <OtpCodeInput
              id="otp-input"
              name="otp"
              defaultValue=""
              disabled={pending}
              onComplete={submitOtpForm}
            />
            <SubmitButton idleLabel={t.auth.verifyEnter} pendingLabel={t.auth.verifyingOtp} pending={pending} />
            {pending ? (
              <span className="mt-3 block text-center text-sm text-zinc-400 dark:text-zinc-500">{t.auth.changeUan}</span>
            ) : (
              <Link
                href="/sign-in"
                className="mt-3 block text-center text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {t.auth.changeUan}
              </Link>
            )}
          </form>
        ) : (
          <form action={startMemberSignIn} onSubmit={beginPending(t.auth.continuing)}>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="uan-input">
              {t.common.uan}
            </label>
            <input
              id="uan-input"
              name="uan"
              required
              autoComplete="username"
              placeholder={t.auth.enterUan}
              readOnly={pending}
              aria-busy={pending}
              className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-teal-500 read-only:cursor-wait dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-teal-400"
            />
            <SubmitButton idleLabel={t.auth.continue} pendingLabel={t.auth.continuing} pending={pending} />
          </form>
        )}

        <Link
          href="/"
          className="block text-center text-sm text-zinc-500 transition hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {t.auth.backHome}
        </Link>
      </main>
      {pendingLabel ? <BusyOverlay label={pendingLabel} /> : null}
    </div>
  );
}

function SubmitButton({
  idleLabel,
  pendingLabel,
  pending,
}: {
  idleLabel: string;
  pendingLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? <IconSpinner className="h-4 w-4" /> : null}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

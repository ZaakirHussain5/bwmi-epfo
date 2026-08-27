"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AskNidhiButton } from "@/components/assistant/AskNidhiButton";
import { ExplainabilityPanel } from "@/components/common/ExplainabilityPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { NIDHI_REFRESH_EVENT } from "@/lib/events";
import { formatDate } from "@/lib/utils/format";
import type { MemberProfile } from "@/types/epf";

interface ProfileManagerProps {
  initialProfile: MemberProfile;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function buildTicketHref(subject: string, description: string, category: "profile" | "account" = "account") {
  const params = new URLSearchParams({
    subject,
    description,
    category,
  });
  return `/help?${params.toString()}#raise-ticket`;
}

function ActivationStepActions({
  askPrompt,
  ticketSubject,
  ticketDescription,
  ticketCategory = "profile",
  resolveHref,
  resolveLabel,
}: {
  askPrompt: string;
  ticketSubject: string;
  ticketDescription: string;
  ticketCategory?: "profile" | "account";
  resolveHref?: string;
  resolveLabel?: string;
}) {
  const { t } = useLocale();
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {resolveHref ? (
        <Link
          href={resolveHref}
          className="rounded-lg border border-teal-300 px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-950/40"
        >
          {resolveLabel ?? t.profile.resolveNow}
        </Link>
      ) : null}
      <AskNidhiButton prompt={askPrompt} label={t.common.askNidhi} compact />
      <Link
        href={buildTicketHref(ticketSubject, ticketDescription, ticketCategory)}
        className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
      >
        {t.common.raiseTicket}
      </Link>
    </div>
  );
}

export function ProfileManager({ initialProfile }: ProfileManagerProps) {
  const { locale, t } = useLocale();
  const [profile, setProfile] = useState(initialProfile);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    const onRefresh = (event: Event) => {
      const entity = (event as CustomEvent<{ entity?: string }>).detail?.entity;
      if (entity !== "profile") {
        return;
      }
      void fetch("/api/profile")
        .then((response) => response.json())
        .then((data: MemberProfile) => setProfile(data));
    };
    window.addEventListener(NIDHI_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NIDHI_REFRESH_EVENT, onRefresh);
  }, []);

  const saveProfile = async (next: Partial<MemberProfile>) => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const updated = (await response.json()) as MemberProfile;
      setProfile(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const onBasicSubmit = (formData: FormData) => {
    const mobile = String(formData.get("mobile") ?? "");
    const email = String(formData.get("email") ?? "");
    void saveProfile({ mobile, email });
  };

  const onNomineeSubmit = (formData: FormData) => {
    const nomineeName = String(formData.get("nomineeName") ?? "").trim();
    const relationship = String(formData.get("relationship") ?? "").trim();
    const sharePercent = Number(formData.get("sharePercent") ?? 0);

    if (!nomineeName || !relationship || !sharePercent) {
      return;
    }

    void saveProfile({
      nominees: [
        ...profile.nominees,
        {
          id: `NOM-${Date.now()}`,
          name: nomineeName,
          relationship,
          sharePercent,
          dob: "1995-01-01",
        },
      ],
    });
  };

  const totalFlags = profile.employment.flatMap((record) => record.integrityFlags);
  const uniqueFlags = [...new Set(totalFlags)];

  return (
    <section className="space-y-4">
      <header className="nidhi-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{t.profile.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {t.profile.subtitle}
            </p>
          </div>
          <StatusBadge
            category={profile.bank.readyForClaims ? "resolved" : "important"}
            label={profile.bank.readyForClaims ? t.profile.claimReady : t.profile.readinessNeeds}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <strong>
            {saveState === "saving"
              ? t.profile.saveSaving
              : saveState === "saved"
                ? t.profile.saveSaved
                : saveState === "error"
                  ? t.profile.saveError
                  : t.profile.saveIdle}
          </strong>
        </p>
      </header>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.profile.personal}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t.profile.name}</dt>
            <dd className="font-medium">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t.common.uan}</dt>
            <dd className="flex items-center gap-2 font-medium">
              <span>{profile.uan}</span>
              <StatusBadge
                category={profile.uanStatus === "active" ? "resolved" : "action_required"}
                label={profile.uanStatus === "active" ? t.profile.active : t.profile.needsAttention}
              />
            </dd>
          </div>
        </dl>
        {profile.uanStatus !== "active" ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              {t.profile.uanAttention}
            </p>
            <ActivationStepActions
              askPrompt={t.profile.uanPrompt}
              ticketSubject={t.profile.uanTicketSubject}
              ticketDescription={t.profile.uanTicketBody}
            />
          </div>
        ) : null}
        <form
          action={onBasicSubmit}
          className="mt-4 grid gap-3 rounded-xl border border-zinc-200 p-3 md:grid-cols-2 dark:border-zinc-700"
        >
          <label className="text-sm">
            <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.profile.mobile}</span>
            <input
              name="mobile"
              defaultValue={profile.mobile}
              className="nidhi-input"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-zinc-600 dark:text-zinc-300">{t.profile.email}</span>
            <input
              name="email"
              defaultValue={profile.email}
              className="nidhi-input"
            />
          </label>
          <button type="submit" className="nidhi-btn-primary md:col-span-2">
            {t.profile.saveContact}
          </button>
        </form>
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.profile.careerMap}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {t.profile.careerSubtitle}
        </p>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">{t.profile.eligibleService}</p>
            <p className="font-semibold">{profile.careerSummary.totalEligibleServiceMonths} {t.common.months}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">{t.profile.pfAccounts}</p>
            <p className="font-semibold">{profile.careerSummary.totalPfAccountsDetected}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">{t.profile.reconciled}</p>
            <p className="font-semibold">{profile.careerSummary.reconciledAccounts}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">{t.profile.needAttention}</p>
            <p className="font-semibold">{profile.careerSummary.accountsRequiringAttention}</p>
          </div>
        </div>
        <ol className="mt-4 space-y-3 border-l border-zinc-200 pl-4 dark:border-zinc-700">
          {profile.employment.map((job) => (
            <li
              key={job.memberId}
              className="relative rounded-xl border border-zinc-200 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <span className="absolute -left-[1.2rem] top-5 h-2.5 w-2.5 rounded-full bg-teal-600 dark:bg-teal-400" />
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{job.employerName}</p>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    job.status === "current"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                  ].join(" ")}
                >
                  {job.status === "current" ? t.profile.currentEmployer : t.profile.previousEmployer}
                </span>
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                {interpolate(t.profile.memberId, { id: job.memberId })}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                {interpolate(t.profile.uanLinked, { uan: job.uanLinked })}
              </p>
              <p className="text-zinc-600 dark:text-zinc-300">
                {formatDate(job.dojEpf, locale)} - {job.doeEpf ? formatDate(job.doeEpf, locale) : t.common.present}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <StatusBadge
                  category={
                    job.transferStatus === "completed"
                      ? "resolved"
                      : job.transferStatus === "not_applicable"
                        ? "informational"
                        : "important"
                  }
                  label={interpolate(t.profile.transfer, { status: job.transferStatus.replaceAll("_", " ") })}
                />
                <StatusBadge
                  category={
                    job.serviceHistoryStatus === "complete" ? "resolved" : "action_required"
                  }
                  label={interpolate(t.profile.serviceHistory, {
                    status: job.serviceHistoryStatus.replaceAll("_", " "),
                  })}
                />
              </div>
              {job.integrityFlags.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-rose-700 dark:text-rose-300">
                  {job.integrityFlags.map((flag) => (
                    <li key={flag}>{t.profile.flags[flag as keyof typeof t.profile.flags] ?? flag.replaceAll("_", " ")}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        {uniqueFlags.length ? (
          <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="font-semibold text-amber-900 dark:text-amber-100">{t.profile.inconsistencies}</p>
            <ul className="list-disc space-y-1 pl-4 text-amber-900 dark:text-amber-100">
              {uniqueFlags.map((flag) => (
                <li key={flag}>{t.profile.flags[flag as keyof typeof t.profile.flags] ?? flag.replaceAll("_", " ")}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <AskNidhiButton prompt={t.profile.reviewEmployment} />
              <Link
                href={buildTicketHref(
                  t.profile.employmentTicketSubject,
                  t.profile.employmentTicketBody,
                  "account",
                )}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
              >
                {t.common.raiseTicket}
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.profile.kycPipeline}</h3>
        <ul className="mt-3 space-y-2">
          {profile.kyc.pipeline.map((step) => (
            <li
              key={step.id}
              className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{step.label}</p>
                <StatusBadge
                  category={
                    step.status === "completed"
                      ? "resolved"
                      : step.status === "blocked"
                        ? "action_required"
                        : "in_progress"
                  }
                />
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                {t.profile.owner}: {step.owner.toUpperCase()} · {step.detail}
              </p>
              {step.status !== "completed" ? (
                <ActivationStepActions
                  askPrompt={`Help me resolve this KYC step: ${step.label}`}
                  ticketSubject={`KYC step needs attention: ${step.label}`}
                  ticketDescription={`KYC step "${step.label}" is ${step.status}. Owner: ${step.owner.toUpperCase()}. Detail: ${step.detail}`}
                  resolveHref={profile.kyc.mismatches.length ? "#kyc-mismatch-details" : undefined}
                  resolveLabel={t.profile.reviewMismatch}
                />
              ) : null}
            </li>
          ))}
        </ul>
        {profile.kyc.mismatches.length ? (
          <div
            id="kyc-mismatch-details"
            className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20"
          >
            <p className="font-semibold text-amber-900 dark:text-amber-100">{t.profile.kycMismatch}</p>
            {profile.kyc.mismatches.map((mismatch) => (
              <div key={mismatch.id} className="rounded-lg bg-white/70 p-3 text-sm dark:bg-zinc-900/60">
                <p>
                  <span className="font-semibold">{mismatch.field}</span> {t.profile.doesNotMatch}
                </p>
                <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                  {t.profile.epfoRecord}: {mismatch.epfoValue}
                </p>
                <p className="text-zinc-700 dark:text-zinc-200">
                  {t.profile.sourceRecord}: {mismatch.sourceValue}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={mismatch.cta.href}
                    className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:border-amber-700 dark:text-amber-100"
                  >
                    {mismatch.cta.label}
                  </Link>
                  <AskNidhiButton
                    prompt={`Help me fix KYC mismatch: ${mismatch.field}`}
                    label={t.common.askNidhi}
                    compact
                  />
                  <Link
                    href={buildTicketHref(
                      `KYC mismatch support: ${mismatch.field}`,
                      `Mismatch in ${mismatch.field}. EPFO value: ${mismatch.epfoValue}. Source value: ${mismatch.sourceValue}.`,
                      "profile",
                    )}
                    className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                  >
                    {t.common.raiseTicket}
                  </Link>
                </div>
                <div className="mt-2">
                  <ExplainabilityPanel note={mismatch.explainability} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.profile.bankPipeline}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t.profile.account}</dt>
            <dd className="font-medium">{profile.bank.accountMasked}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t.profile.ifsc}</dt>
            <dd className="font-medium">{profile.bank.ifscMasked}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t.profile.bankStatus}</dt>
            <dd className="font-medium capitalize">{profile.bank.status.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        <ul className="mt-3 space-y-2">
          {profile.bank.pipeline.map((step) => (
            <li
              key={step.id}
              className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{step.label}</p>
                <StatusBadge
                  category={
                    step.status === "completed"
                      ? "resolved"
                      : step.status === "blocked"
                        ? "action_required"
                        : "in_progress"
                  }
                />
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                {t.profile.owner}: {step.owner.toUpperCase()} · {step.detail}
              </p>
              {step.status !== "completed" ? (
                <ActivationStepActions
                  askPrompt={`Help me resolve this bank verification step: ${step.label}`}
                  ticketSubject={`Bank verification step needs attention: ${step.label}`}
                  ticketDescription={`Bank step "${step.label}" is ${step.status}. Owner: ${step.owner.toUpperCase()}. Detail: ${step.detail}`}
                  ticketCategory="account"
                  resolveHref="/claims?start=1"
                  resolveLabel={t.profile.resolveClaimFlow}
                />
              ) : null}
            </li>
          ))}
        </ul>
        {profile.bank.mismatches.length ? (
          <div className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="font-semibold text-amber-900 dark:text-amber-100">{t.profile.bankMismatch}</p>
            {profile.bank.mismatches.map((mismatch) => (
              <div key={mismatch.id} className="rounded-lg bg-white/70 p-3 text-sm dark:bg-zinc-900/60">
                <p>
                  <span className="font-semibold">{mismatch.field}</span> {t.profile.doesNotMatch}
                </p>
                <p className="mt-1 text-zinc-700 dark:text-zinc-200">
                  {t.profile.epfoRecord}: {mismatch.epfoValue}
                </p>
                <p className="text-zinc-700 dark:text-zinc-200">
                  {t.profile.bankAadhaarRecord}: {mismatch.sourceValue}
                </p>
                <Link
                  href={mismatch.cta.href}
                  className="mt-2 inline-flex rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:border-amber-700 dark:text-amber-100"
                >
                  {mismatch.cta.label}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AskNidhiButton
                    prompt={`Help me resolve bank mismatch: ${mismatch.field}`}
                    label={t.common.askNidhi}
                    compact
                  />
                  <Link
                    href={buildTicketHref(
                      `Bank mismatch support: ${mismatch.field}`,
                      `Mismatch in ${mismatch.field}. EPFO value: ${mismatch.epfoValue}. Source value: ${mismatch.sourceValue}.`,
                      "account",
                    )}
                    className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                  >
                    {t.common.raiseTicket}
                  </Link>
                </div>
                <div className="mt-2">
                  <ExplainabilityPanel note={mismatch.explainability} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.profile.nominees}</h3>
        <ul className="mt-3 space-y-2">
          {profile.nominees.map((nominee) => (
            <li key={nominee.id} className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="font-medium">{nominee.name}</p>
              <p className="text-zinc-600 dark:text-zinc-300">
                {nominee.relationship} - {nominee.sharePercent}% {t.profile.share}
              </p>
            </li>
          ))}
        </ul>
        <form action={onNomineeSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="nomineeName"
            placeholder={t.profile.nomineeName}
            className="nidhi-input"
          />
          <input
            name="relationship"
            placeholder={t.profile.relationship}
            className="nidhi-input"
          />
          <input
            name="sharePercent"
            type="number"
            min={1}
            max={100}
            placeholder={t.profile.sharePercent}
            className="nidhi-input"
          />
          <button
            type="submit"
            className="nidhi-btn-primary md:col-span-3"
          >
            {t.profile.addNominee}
          </button>
        </form>
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.profile.askTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            t.profile.promptReady,
            t.profile.promptKyc,
            t.profile.promptEmployment,
          ].map((prompt) => (
            <li key={prompt}>
              <AskNidhiButton prompt={prompt} />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

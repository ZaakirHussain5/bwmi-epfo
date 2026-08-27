"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AskNidhiButton } from "@/components/assistant/AskNidhiButton";
import {
  IconBank,
  IconBell,
  IconBook,
  IconBriefcase,
  IconChevronRight,
  IconFingerprint,
  IconGrid,
  IconIdCard,
  IconInfo,
  IconSearch,
  IconShield,
  IconShieldAlert,
  IconTransfer,
  IconUser,
  IconUsers,
  IconWarning,
} from "@/components/common/icons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { claimStageLabel } from "@/features/claims/utils";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { formatCurrency, formatDateTime, formatMonthLabel, formatRelativeTime } from "@/lib/utils/format";
import { usePrivacyMode } from "@/hooks/usePrivacyMode";
import type {
  AccountHealthCheck,
  AccountHealthReport,
  Claim,
  MemberSummary,
  ServiceStatus,
  StatusCategory,
} from "@/types/epf";

const QUICK_ACTION_KEYS = [
  { href: "/passbook", labelKey: "viewPassbook", icon: IconBook },
  { href: "/claims", labelKey: "trackClaimAction", icon: IconSearch },
  { href: "/profile", labelKey: "manageProfile", icon: IconUser },
  { href: "/profile", labelKey: "checkKyc", icon: IconFingerprint },
  { href: "/services", labelKey: "transferPf", icon: IconTransfer },
  { href: "/services", labelKey: "exploreServices", icon: IconGrid },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function checkStatusLabel(
  check: AccountHealthCheck,
  t: ReturnType<typeof useLocale>["t"],
) {
  if (check.status === "ok") {
    return check.id === "check-nominee" ? t.common.available : t.common.verified;
  }
  if (check.status === "blocked") {
    return t.common.actionRequired;
  }
  return t.common.important;
}

function checkStatusClass(status: AccountHealthCheck["status"]) {
  if (status === "ok") {
    return "text-emerald-700 dark:text-emerald-300";
  }
  if (status === "blocked") {
    return "text-rose-700 dark:text-rose-300";
  }
  return "text-amber-700 dark:text-amber-300";
}

function healthScoreBand(score: number) {
  if (score >= 100) {
    return "green";
  }
  if (score <= 40) {
    return "red";
  }
  return "orange";
}

function healthScoreTextClass(score: number) {
  const band = healthScoreBand(score);
  if (band === "green") {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (band === "red") {
    return "text-rose-600 dark:text-rose-400";
  }
  return "text-amber-600 dark:text-amber-400";
}

function healthScoreBarClass(score: number) {
  const band = healthScoreBand(score);
  if (band === "green") {
    return "bg-emerald-500 dark:bg-emerald-400";
  }
  if (band === "red") {
    return "bg-rose-500 dark:bg-rose-400";
  }
  return "bg-amber-500 dark:bg-amber-400";
}

function healthScoreStatusCategory(score: number): StatusCategory {
  const band = healthScoreBand(score);
  if (band === "green") {
    return "resolved";
  }
  if (band === "red") {
    return "action_required";
  }
  return "important";
}

function checkIcon(id: string) {
  switch (id) {
    case "check-aadhaar":
      return IconFingerprint;
    case "check-pan":
      return IconIdCard;
    case "check-bank":
      return IconBank;
    case "check-nominee":
      return IconUsers;
    case "check-employment":
      return IconBriefcase;
    case "check-transfer":
      return IconTransfer;
    default:
      return IconUser;
  }
}

function timelineDotClass(category: StatusCategory) {
  if (category === "resolved") {
    return "bg-emerald-500";
  }
  if (category === "action_required") {
    return "bg-rose-500";
  }
  if (category === "in_progress") {
    return "bg-blue-500";
  }
  if (category === "important") {
    return "bg-amber-500";
  }
  return "bg-zinc-400";
}

function buildTicketHref(subject: string, description: string) {
  const params = new URLSearchParams({
    subject,
    description,
    category: "account",
  });
  return `/help?${params.toString()}#raise-ticket`;
}

function CardHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h3 className="min-w-0 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <div className="min-w-0 max-w-full">{action}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  valueClassName = "text-xl text-zinc-900 sm:text-2xl dark:text-zinc-100",
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`mt-1 font-semibold tabular-nums tracking-tight ${valueClassName}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
    </div>
  );
}

function localizedHealthCheck(
  check: AccountHealthCheck,
  t: ReturnType<typeof useLocale>["t"],
) {
  const copy = t.healthChecks[check.id];
  return {
    ...check,
    title: copy?.title ?? check.title,
    summary: copy?.summary ?? check.summary,
    cta: check.cta
      ? { ...check.cta, label: copy?.cta ?? check.cta.label }
      : check.cta,
  };
}

export function DashboardWorkspace({
  summary,
  claims,
  accountHealth,
  serviceStatus,
}: {
  summary: MemberSummary;
  claims: Claim[];
  accountHealth: AccountHealthReport;
  serviceStatus: ServiceStatus[];
}) {
  const { locale, t } = useLocale();
  const { hidden: hideSensitiveValues } = usePrivacyMode();
  const activeClaim = claims.find((claim) => claim.status === "active");
  const unresolvedIssue = accountHealth.primaryIssue;
  const blockedChecks = accountHealth.checks.filter((check) => check.status !== "ok");
  const resolvedCount = accountHealth.checks.filter((check) => check.status === "ok").length;
  const attentionCount = accountHealth.checks.filter((check) => check.status === "blocked").length;
  const importantCount = accountHealth.checks.filter((check) => check.status === "warning").length;
  const degradedServices = serviceStatus.filter((item) => item.status !== "operational");
  const allOperational = degradedServices.length === 0;

  const actionItems = [
    ...accountHealth.anomalies.map((anomaly) => ({
      id: anomaly.id,
      title: anomaly.title,
      detail: anomaly.detail,
      href: anomaly.cta?.href ?? "/profile",
    })),
    ...blockedChecks
      .filter((check) => !accountHealth.anomalies.some((anomaly) => anomaly.title.includes(check.title)))
      .map((check) => {
        const localized = localizedHealthCheck(check, t);
        return {
          id: localized.id,
          title: localized.title,
          detail: localized.summary,
          href: localized.cta?.href ?? "/profile",
        };
      }),
  ].slice(0, 2);

  const claimActivity = [...claims]
    .filter((claim) => claim.status !== "draft")
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  const latestUpdates = [
    ...degradedServices.map((item) => {
      const serviceCopy = t.serviceStatus[item.id];
      const name = serviceCopy?.name ?? item.name;
      const detail = serviceCopy?.detail ?? item.detail;
      const restoration = serviceCopy?.restoration ?? item.estimatedRestoration;
      return {
        id: item.id,
        title: interpolate(t.dashboard.serviceIs, {
          name,
          status: t.status[item.status],
        }),
        detail: `${detail}${restoration ? ` · ${restoration}` : ""}`,
        at: item.lastUpdated,
        category: "important" as const,
        href: "/help",
      };
    }),
    ...claims
      .filter((claim) => claim.status === "active" || claim.status === "rejected")
      .map((claim) => ({
        id: `claim-update-${claim.id}`,
        title: `${claim.referenceNumber}: ${claimStageLabel(claim.currentStage, locale)}`,
        detail: interpolate(t.dashboard.claimOwnerAction, {
          owner: claim.currentOwner.toUpperCase(),
          action: claim.userAction,
        }),
        at: claim.lastUpdated,
        category: claim.statusCategory,
        href: "/claims",
      })),
    ...accountHealth.anomalies.map((anomaly) => ({
      id: `health-${anomaly.id}`,
      title: anomaly.title,
      detail: anomaly.detail,
      at: anomaly.detectedAt,
      category: anomaly.category,
      href: anomaly.cta?.href ?? "/profile",
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 6);

  const notificationCount = accountHealth.anomalies.length + attentionCount + degradedServices.length;
  const healthChecks = accountHealth.checks.slice(0, 6).map((check) => localizedHealthCheck(check, t));
  const notificationItems = latestUpdates.slice(0, 3);
  const healthScore = Math.max(0, Math.min(100, Math.round(accountHealth.score)));

  return (
    <section className="dashboard-grid @container space-y-4">
      <article className="nidhi-card">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-700 text-lg font-semibold text-white dark:bg-teal-600"
                aria-hidden="true"
              >
                {initials(summary.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.dashboard.welcome}</p>
                <h2 className="truncate text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {summary.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t.common.uan}: {summary.uan}</p>
              </div>
            </div>

            <div className="min-w-0 sm:w-44 sm:shrink-0">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.dashboard.accountHealth}</p>
              <p className={`mt-1 text-2xl font-semibold tabular-nums ${healthScoreTextClass(healthScore)}`}>
                {healthScore}%
              </p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${healthScoreBarClass(healthScore)}`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <Link
                href="#account-health"
                className="mt-2 inline-flex text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
              >
                {t.common.viewDetails}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-zinc-200/70 pt-5 min-[480px]:grid-cols-2 @4xl:grid-cols-4 dark:border-zinc-800">
            <Metric
              label={t.dashboard.epfBalance}
              value={formatCurrency(summary.totalBalance, locale, hideSensitiveValues)}
              hint={interpolate(t.dashboard.asOn, { month: formatMonthLabel(summary.recentContributionMonth, locale) })}
              valueClassName="text-2xl text-zinc-900 sm:text-3xl dark:text-zinc-100"
            />
            <Metric
              label={t.dashboard.employeeContribution}
              value={formatCurrency(summary.employeeContributionTotal, locale, hideSensitiveValues)}
              valueClassName="text-emerald-600 dark:text-emerald-300"
            />
            <Metric
              label={t.dashboard.employerContribution}
              value={formatCurrency(summary.employerContributionTotal, locale, hideSensitiveValues)}
              valueClassName="text-sky-600 dark:text-sky-300"
            />
            <Metric
              label={t.dashboard.epsBalance}
              value={formatCurrency(summary.epsContributionTotal, locale, hideSensitiveValues)}
              valueClassName="text-fuchsia-600 dark:text-fuchsia-300"
            />
          </div>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-2 @5xl:grid-cols-3 @5xl:items-stretch">
        <article className="nidhi-card h-full">
          <CardHeading
            title={t.dashboard.actionRequired}
            action={<StatusBadge category={unresolvedIssue ? "action_required" : "resolved"} />}
          />
          {actionItems.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {actionItems.map((item) => (
                <li key={item.id}>
                  <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                    <Link
                      href={item.href}
                      className="flex items-start gap-3 p-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                        <IconWarning className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-300">
                          {item.detail}
                        </span>
                      </span>
                      <IconChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-400" />
                    </Link>
                    <div className="flex flex-wrap gap-2 px-3 pb-3">
                      <AskNidhiButton
                        prompt={`Help me resolve this issue: ${item.title}`}
                        label={t.common.askNidhi}
                        compact
                      />
                      <Link
                        href={buildTicketHref(
                          `Action required: ${item.title}`,
                          `Please help resolve this account issue: ${item.detail}`,
                        )}
                        className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                      >
                        {t.common.raiseTicket}
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{t.dashboard.noBlockers}</p>
          )}
          {unresolvedIssue ? (
            <div className="mt-3 space-y-2">
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                {unresolvedIssue.impact}
              </p>
              {unresolvedIssue.cta ? (
                <Link href={unresolvedIssue.cta.href} className="nidhi-btn-primary px-3 py-2">
                  {unresolvedIssue.cta.label}
                </Link>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <AskNidhiButton
                  prompt={`Help me resolve this primary issue: ${unresolvedIssue.title}`}
                  label={t.common.askNidhi}
                  compact
                />
                <Link
                  href={buildTicketHref(
                    `Primary issue unresolved: ${unresolvedIssue.title}`,
                    `Please help resolve this high-priority issue: ${unresolvedIssue.detail}`,
                  )}
                  className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                >
                  {t.common.raiseTicket}
                </Link>
              </div>
            </div>
          ) : null}
          <Link
            href="/profile"
            className="mt-3 inline-flex text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
          >
            {t.dashboard.viewAllActions}
          </Link>
        </article>

        <article className="nidhi-card h-full">
          <CardHeading title={t.dashboard.activeClaim} />
          {activeClaim ? (
            <div className="mt-3 space-y-3 text-[0.96rem]">
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.dashboard.currentStatus}</p>
                <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {claimStageLabel(activeClaim.currentStage, locale)}
                </p>
                <dl className="mt-3 space-y-1.5 text-zinc-600 dark:text-zinc-300">
                  <div className="flex justify-between gap-3">
                    <dt>{t.dashboard.lastUpdated}</dt>
                    <dd className="text-right">{formatRelativeTime(activeClaim.lastUpdated, locale)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t.dashboard.indicativeTime}</dt>
                    <dd className="text-right">{activeClaim.expectedProcessingTime}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t.dashboard.currentOwner}</dt>
                    <dd className="text-right">{activeClaim.currentOwner.toUpperCase()}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t.dashboard.yourAction}</dt>
                    <dd className="text-right">{activeClaim.userAction}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500 dark:text-zinc-400">{t.dashboard.nextStep}</dt>
                    <dd className="mt-0.5">{activeClaim.expectedNextStep}</dd>
                  </div>
                </dl>
              </div>
              <Link href="/claims" className="nidhi-btn-primary px-3 py-2">
                {t.dashboard.trackClaim}
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              {t.dashboard.noActiveClaim}
            </p>
          )}
        </article>

        <article className="nidhi-card h-full md:col-span-2 @5xl:col-span-1">
          <CardHeading
            title={t.dashboard.quickActions}
            action={
              <Link href="/services" className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300">
                {t.dashboard.moreActions}
              </Link>
            }
          />
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 @5xl:grid-cols-2">
            {QUICK_ACTION_KEYS.map((action) => {
              const Icon = action.icon;
              const label = t.dashboard[action.labelKey];
              return (
                <Link
                  key={action.labelKey}
                  href={action.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200 px-2 py-3 text-center text-xs font-medium text-zinc-700 transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-50 hover:shadow-sm dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-50 text-teal-700 transition-transform duration-200 group-hover:scale-110 dark:bg-zinc-900/70 dark:text-teal-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        </article>

        <div className="grid gap-4 md:col-span-2 @5xl:col-span-3 @5xl:grid-cols-2">
          <article id="account-health" className="nidhi-card h-full scroll-mt-24">
            <CardHeading
              title={t.dashboard.healthOverview}
              action={<StatusBadge category={healthScoreStatusCategory(healthScore)} />}
            />
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-full rounded-full ${healthScoreBarClass(healthScore)}`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  {interpolate(t.dashboard.resolvedCount, { count: resolvedCount })}
                </span>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                  {interpolate(t.dashboard.attentionCount, { count: attentionCount })}
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                  {interpolate(t.dashboard.importantCount, { count: importantCount })}
                </span>
              </div>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {healthChecks.map((check) => {
                const Icon = checkIcon(check.id);
                return (
                  <li
                    key={check.id}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-700"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-50 text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{check.title}</p>
                        <StatusBadge
                          category={
                            check.status === "ok"
                              ? "resolved"
                              : check.status === "blocked"
                                ? "action_required"
                                : "important"
                          }
                        />
                      </div>
                      <p className={`mt-1 text-sm font-medium ${checkStatusClass(check.status)}`}>
                        {checkStatusLabel(check, t)}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{check.summary}</p>
                      {check.cta ? (
                        <Link
                          href={check.cta.href}
                          className="mt-2 inline-flex text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
                        >
                          {check.cta.label}
                        </Link>
                      ) : null}
                      {check.status !== "ok" ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <AskNidhiButton
                            prompt={`What should I do to resolve ${check.title}?`}
                            label={t.common.askNidhi}
                            compact
                          />
                          <Link
                            href={buildTicketHref(
                              `Account health check unresolved: ${check.title}`,
                              `I need help resolving this account health step: ${check.summary}`,
                            )}
                            className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                          >
                            {t.common.raiseTicket}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            {accountHealth.checks.length > healthChecks.length ? (
              <Link
                href="/profile"
                className="mt-3 inline-flex text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
              >
                {t.dashboard.viewRemaining}
              </Link>
            ) : null}
          </article>

          <article className="nidhi-card h-full">
            <CardHeading
              title={t.dashboard.recentActivity}
              action={
                <Link href="/claims" className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300">
                  {t.common.viewAll}
                </Link>
              }
            />
            <ol className="relative mt-4 space-y-4 border-l border-zinc-200 pl-4 dark:border-zinc-700">
              {claimActivity.map((claim) => (
                <li key={claim.id} className="relative">
                  <span
                    className={`absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full ${timelineDotClass(claim.statusCategory)}`}
                    aria-hidden="true"
                  />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{claim.referenceNumber}</p>
                    <StatusBadge category={claim.statusCategory} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {claimStageLabel(claim.currentStage, locale)} · {claim.userAction}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(claim.lastUpdated, locale)} ({formatRelativeTime(claim.lastUpdated, locale)})
                  </p>
                  <Link
                    href="/claims"
                    className="mt-2 inline-flex text-xs font-medium text-teal-700 hover:underline dark:text-teal-300"
                  >
                    {t.dashboard.openDetails}
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <article
          id="latest-updates"
          className="nidhi-card h-full scroll-mt-24 md:col-span-2 @5xl:col-span-2 @5xl:row-span-2"
        >
          <CardHeading
            title={t.dashboard.latestUpdates}
            action={
              <Link href="/help" className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300">
                {t.common.viewAll}
              </Link>
            }
          />
          <ul className="mt-3 space-y-2">
            {latestUpdates.map((update) => (
              <li key={update.id}>
                <Link
                  href={update.href}
                  className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3 transition hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
                >
                  <span
                    className={[
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                      update.category === "action_required"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
                        : update.category === "important"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
                    ].join(" ")}
                  >
                    {update.category === "in_progress" ? (
                      <IconInfo className="h-4 w-4" />
                    ) : (
                      <IconWarning className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {update.title}
                      </span>
                      <StatusBadge category={update.category} />
                    </span>
                    <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-300">
                      {update.detail}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(update.at, locale)} ({formatRelativeTime(update.at, locale)})
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="nidhi-card h-full">
          <CardHeading title={t.dashboard.systemStatus} />
          <div className="mt-3 flex items-start gap-3">
            <span
              className={[
                "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                allOperational
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
              ].join(" ")}
            >
              {allOperational ? <IconShield className="h-6 w-6" /> : <IconShieldAlert className="h-6 w-6" />}
            </span>
            <div>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {allOperational
                  ? t.dashboard.allOperational
                  : interpolate(t.dashboard.servicesNeedAttention, { count: degradedServices.length })}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {allOperational
                  ? t.dashboard.operationalDetail
                  : degradedServices.map((item) => t.serviceStatus[item.id]?.name ?? item.name).join(", ")}
              </p>
              <Link
                href="/help"
                className="mt-2 inline-flex text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
              >
                {t.dashboard.viewSystemStatus}
              </Link>
            </div>
          </div>
        </article>

        <article className="nidhi-card h-full">
          <CardHeading title={t.dashboard.notifications} />
          <div className="mt-3 flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
              <IconBell className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {interpolate(
                  notificationCount === 1
                    ? t.dashboard.notificationCount
                    : t.dashboard.notificationCountPlural,
                  { count: notificationCount },
                )}
              </p>
              <p className="mt-1 break-words text-sm text-zinc-500 dark:text-zinc-400">
                {t.dashboard.notificationDetail}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                {notificationItems.map((item) => (
                  <li key={item.id} className="break-words leading-snug">
                    • {item.title}
                  </li>
                ))}
              </ul>
              <Link
                href="#latest-updates"
                className="mt-2 inline-flex text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
              >
                {t.dashboard.reviewAlerts}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

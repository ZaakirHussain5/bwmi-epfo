 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AskNidhiButton } from "@/components/assistant/AskNidhiButton";
import { ExplainabilityPanel } from "@/components/common/ExplainabilityPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { claimStageLabel, claimStatusLabel, claimStatusTone, claimTypeLabel } from "@/features/claims/utils";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import { usePrivacyMode } from "@/hooks/usePrivacyMode";
import type { Claim } from "@/types/epf";

interface ClaimsOverviewProps {
  claims: Claim[];
}

const CLAIMS_PAGE_SIZE = 3;

function ownerLabel(owner: Claim["currentOwner"]) {
  return owner.toUpperCase();
}

function ClaimTimeline({ claim }: { claim: Claim }) {
  const { locale, t } = useLocale();
  return (
    <ol className="mt-4 space-y-3 border-l border-zinc-200 pl-4 dark:border-zinc-700">
      {claim.activity.map((stage) => (
        <li
          key={stage.id}
          className="relative rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-700 dark:bg-zinc-900/40"
        >
          <span className="absolute -left-[1.1rem] top-4 h-2.5 w-2.5 rounded-full bg-teal-600 dark:bg-teal-400" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{stage.title}</p>
            <StatusBadge
              category={
                stage.status === "completed"
                  ? "resolved"
                  : stage.status === "current"
                    ? "in_progress"
                    : "informational"
              }
            />
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {stage.occurredAt ? formatDateTime(stage.occurredAt, locale) : t.claims.upcoming} · {t.claims.owner}{" "}
            {stage.owner.toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{stage.detail}</p>
          <div className="mt-2">
            <ExplainabilityPanel note={stage.explainability} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ClaimsOverview({ claims }: ClaimsOverviewProps) {
  const { locale, t } = useLocale();
  const { hidden: hideSensitiveValues } = usePrivacyMode();
  const active = claims.filter((claim) => claim.status === "active");
  const drafts = claims.filter((claim) => claim.status === "draft");
  const completed = claims.filter((claim) => claim.status === "completed");
  const rejected = claims.filter((claim) => claim.status === "rejected");
  const groups = useMemo(
    () => [
      { key: "draft" as const, title: t.claims.draft, items: drafts },
      { key: "active" as const, title: t.claims.active, items: active },
      { key: "rejected" as const, title: t.claims.rejected, items: rejected },
      { key: "completed" as const, title: t.claims.completed, items: completed },
    ],
    [active, drafts, rejected, completed, t.claims.active, t.claims.completed, t.claims.draft, t.claims.rejected],
  );
  const [activeTab, setActiveTab] = useState<(typeof groups)[number]["key"]>("draft");
  const [pageByGroup, setPageByGroup] = useState<Record<string, number>>({
    draft: 1,
    active: 1,
    rejected: 1,
    completed: 1,
  });
  const [openClaimByGroup, setOpenClaimByGroup] = useState<Record<string, string | undefined>>({
    draft: undefined,
    active: undefined,
    rejected: undefined,
    completed: undefined,
  });
  const selectedGroup = groups.find((group) => group.key === activeTab) ?? groups[0];
  const totalPages = Math.max(1, Math.ceil(selectedGroup.items.length / CLAIMS_PAGE_SIZE));
  const page = Math.min(pageByGroup[selectedGroup.key] ?? 1, totalPages);
  const pagedItems = selectedGroup.items.slice((page - 1) * CLAIMS_PAGE_SIZE, page * CLAIMS_PAGE_SIZE);

  return (
    <section className="space-y-4">
      <header className="nidhi-card">
        <h2 className="text-xl font-semibold">{t.claims.title}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {t.claims.subtitle}
        </p>
      </header>

      <section className="nidhi-card">
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
          {groups.map((group) => {
            const isActiveTab = activeTab === group.key;
            return (
              <button
                key={group.key}
                type="button"
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  isActiveTab
                    ? "bg-teal-700 text-white dark:bg-teal-600"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
                ].join(" ")}
                onClick={() => setActiveTab(group.key)}
              >
                <span>{group.title}</span>
                <span
                  className={[
                    "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                    isActiveTab
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100",
                  ].join(" ")}
                  aria-label={interpolate(t.claims.claimsCount, { count: group.items.length })}
                >
                  {group.items.length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">{selectedGroup.title}</h3>
          {selectedGroup.items.length ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {interpolate(t.common.pageOf, { page, total: totalPages })}
            </p>
          ) : null}
        </div>
        {selectedGroup.items.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {interpolate(t.claims.noneYet, { status: selectedGroup.title.toLowerCase() })}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {pagedItems.map((claim) => {
              const isOpen = openClaimByGroup[selectedGroup.key] === claim.id;
              const contentId = `claim-accordion-${selectedGroup.key}-${claim.id}`;
              return (
                <li
                  key={claim.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900/40"
                >
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 p-4 text-left"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() =>
                      setOpenClaimByGroup((current) => ({
                        ...current,
                        [selectedGroup.key]:
                          current[selectedGroup.key] === claim.id ? undefined : claim.id,
                      }))
                    }
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{claimTypeLabel(claim.type, locale)}</p>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${claimStatusTone(claim.status)}`}
                        >
                          {claimStatusLabel(claim.status, locale)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {interpolate(t.claims.refAmount, {
                          ref: claim.referenceNumber,
                          amount: formatCurrency(claim.amount, locale, hideSensitiveValues),
                        })}
                      </p>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {t.claims.currentStage}{" "}
                        <span className="font-medium">{claimStageLabel(claim.currentStage, locale)}</span>
                      </p>
                    </div>
                    <span
                      className={[
                        "mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition-transform dark:border-zinc-700 dark:text-zinc-300",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      ˅
                    </span>
                  </button>

                  <div
                    id={contentId}
                    aria-hidden={!isOpen}
                    className={[
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-zinc-200 p-4 pt-3 dark:border-zinc-800">
                      <div className="grid gap-2 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900/50 md:grid-cols-2">
                        <p>
                          <span className="font-medium">{t.claims.currentStatus}</span>{" "}
                          {claimStageLabel(claim.currentStage, locale)}
                        </p>
                        <p>
                          <span className="font-medium">{t.claims.currentOwner}</span>{" "}
                          {ownerLabel(claim.currentOwner)}
                        </p>
                        <p>
                          <span className="font-medium">{t.claims.yourAction}</span> {claim.userAction}
                        </p>
                        <p>
                          <span className="font-medium">{t.claims.nextStep}</span> {claim.expectedNextStep}
                        </p>
                        <p>
                          <span className="font-medium">{t.claims.lastUpdated}</span>{" "}
                          {formatRelativeTime(claim.lastUpdated, locale)}
                        </p>
                        <p>
                          <span className="font-medium">{t.claims.indicative}</span>{" "}
                          {claim.expectedProcessingTime}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{claim.nextAction}</p>
                      {claim.rejection ? (
                        <section className="mt-3 space-y-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-rose-900 dark:text-rose-100">
                              {t.claims.rejectionTitle}
                            </h4>
                            <StatusBadge category="action_required" />
                          </div>
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-semibold">{t.claims.whatHappened}</span>{" "}
                              {claim.rejection.explainability.whatHappened}
                            </p>
                            <p>
                              <span className="font-semibold">{t.claims.whyHappened}</span>{" "}
                              {claim.rejection.explainability.whyItHappened}
                            </p>
                            <p>
                              <span className="font-semibold">{t.claims.whoFixes}</span>{" "}
                              {claim.rejection.owner.toUpperCase()}
                            </p>
                            <div>
                              <p className="font-semibold">{t.claims.whatNext}</p>
                              <ol className="mt-1 list-decimal space-y-1 pl-4">
                                {claim.rejection.resolutionSteps.map((step) => (
                                  <li key={step}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {claim.rejection.ctas.map((cta) => (
                              <Link
                                key={cta.label}
                                href={cta.href}
                                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
                              >
                                {cta.label}
                              </Link>
                            ))}
                            <AskNidhiButton prompt={interpolate(t.assistant.rejectedPrompt, { ref: claim.referenceNumber })} />
                          </div>
                          <ExplainabilityPanel note={claim.rejection.explainability} />
                        </section>
                      ) : null}
                      <ClaimTimeline claim={claim} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {selectedGroup.items.length > CLAIMS_PAGE_SIZE ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
              disabled={page === 1}
              onClick={() =>
                setPageByGroup((current) => ({
                  ...current,
                  [selectedGroup.key]: Math.max(1, page - 1),
                }))
              }
            >
              {t.common.previous}
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200"
              disabled={page === totalPages}
              onClick={() =>
                setPageByGroup((current) => ({
                  ...current,
                  [selectedGroup.key]: Math.min(totalPages, page + 1),
                }))
              }
            >
              {t.common.next}
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
}

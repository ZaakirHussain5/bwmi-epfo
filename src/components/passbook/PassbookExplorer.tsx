"use client";

import { useMemo, useState } from "react";
import { AskNidhiButton } from "@/components/assistant/AskNidhiButton";
import { ExplainabilityPanel } from "@/components/common/ExplainabilityPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { buildYears, monthLabel, monthlyTotal, percentChange } from "@/features/passbook/analytics";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { formatCurrency } from "@/lib/utils/format";
import type { PassbookEntry } from "@/types/epf";

interface PassbookExplorerProps {
  entries: PassbookEntry[];
}

export function PassbookExplorer({ entries }: PassbookExplorerProps) {
  const { locale, t } = useLocale();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("all");
  const [compareMonth, setCompareMonth] = useState<string>("");

  const years = useMemo(() => buildYears(entries), [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesYear =
        year === "all" || String(new Date(entry.postedAt).getUTCFullYear()) === year;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        entry.wageMonth.includes(normalizedQuery) ||
        entry.note?.toLowerCase().includes(normalizedQuery) ||
        entry.id.toLowerCase().includes(normalizedQuery);

      return matchesYear && matchesQuery;
    });
  }, [entries, query, year]);

  const latest = filteredEntries[filteredEntries.length - 1];
  const previous = filteredEntries[filteredEntries.length - 2];
  const latestDelta = latest && previous ? percentChange(monthlyTotal(latest), monthlyTotal(previous)) : 0;

  const compareResult = useMemo(() => {
    if (!compareMonth || !latest) {
      return null;
    }

    const selected = entries.find((entry) => entry.wageMonth === compareMonth);
    if (!selected) {
      return null;
    }

    const latestTotal = monthlyTotal(latest);
    const selectedTotal = monthlyTotal(selected);
    return {
      selectedMonth: monthLabel(selected.wageMonth, locale),
      selectedTotal,
      latestMonth: monthLabel(latest.wageMonth, locale),
      latestTotal,
      delta: percentChange(latestTotal, selectedTotal),
    };
  }, [compareMonth, entries, latest, locale]);

  const totals = filteredEntries.reduce(
    (acc, entry) => {
      acc.employee += entry.employeeContribution;
      acc.employer += entry.employerContribution;
      acc.eps += entry.epsContribution;
      acc.interest += entry.interestCredit;
      acc.transferIn += entry.transferIn ?? 0;
      acc.withdrawal += entry.withdrawal ?? 0;
      acc.adjustment += entry.adjustment ?? 0;
      return acc;
    },
    { employee: 0, employer: 0, eps: 0, interest: 0, transferIn: 0, withdrawal: 0, adjustment: 0 },
  );
  const currentBalance =
    totals.employee +
    totals.employer +
    totals.eps +
    totals.interest +
    totals.transferIn -
    totals.withdrawal +
    totals.adjustment;
  const contributionAnomalies = useMemo(() => {
    const anomalies: Array<{ id: string; title: string; detail: string; category: "important" | "action_required" }> =
      [];
    for (let index = 1; index < entries.length; index += 1) {
      const current = entries[index];
      const previous = entries[index - 1];
      const currentTotal = monthlyTotal(current);
      const previousTotal = monthlyTotal(previous);
      if (previousTotal > 0) {
        const delta = percentChange(currentTotal, previousTotal);
        if (Math.abs(delta) > 18) {
          anomalies.push({
            id: `anomaly-${current.id}`,
            title: t.passbook.unexpectedChange,
            detail: interpolate(t.passbook.unexpectedChangeDetail, {
              current: monthLabel(current.wageMonth, locale),
              delta: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`,
              previous: monthLabel(previous.wageMonth, locale),
            }),
            category: "important",
          });
        }
      }
      if (current.note?.toLowerCase().includes("partial")) {
        anomalies.push({
          id: `note-${current.id}`,
          title: t.passbook.potentialGap,
          detail: interpolate(t.passbook.potentialGapDetail, {
            month: monthLabel(current.wageMonth, locale),
          }),
          category: "action_required",
        });
      }
    }
    return anomalies.slice(-4).reverse();
  }, [entries, locale, t.passbook]);

  return (
    <section className="space-y-4">
      <header className="nidhi-card space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t.passbook.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.passbook.subtitle}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <span className="text-zinc-500 dark:text-zinc-400">{t.passbook.monthlyChange}</span>{" "}
            <strong className={latestDelta >= 0 ? "text-emerald-700" : "text-rose-700"}>
              {latestDelta >= 0 ? "+" : ""}
              {latestDelta.toFixed(1)}%
            </strong>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.employee}</p>
            <p className="font-semibold">{formatCurrency(totals.employee, locale)}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.employer}</p>
            <p className="font-semibold">{formatCurrency(totals.employer, locale)}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.interest}</p>
            <p className="font-semibold">{formatCurrency(totals.interest, locale)}</p>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.eps}</p>
            <p className="font-semibold">{formatCurrency(totals.eps, locale)}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.transfers}</p>
            <p className="font-semibold">{formatCurrency(totals.transferIn, locale)}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60">
            <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.currentBalance}</p>
            <p className="font-semibold">{formatCurrency(currentBalance, locale)}</p>
          </div>
        </div>
      </header>

      <div className="nidhi-card">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.passbook.searchPlaceholder}
            className="nidhi-input rounded-xl"
          />
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="nidhi-input rounded-xl"
          >
            <option value="all">{t.passbook.allYears}</option>
            {years.map((item) => (
              <option key={item} value={String(item)}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={compareMonth}
            onChange={(event) => setCompareMonth(event.target.value)}
            className="nidhi-input rounded-xl md:col-span-2"
          >
            <option value="">{t.passbook.compareLatest}</option>
            {entries.map((item) => (
              <option key={item.id} value={item.wageMonth}>
                {monthLabel(item.wageMonth, locale)}
              </option>
            ))}
          </select>
        </div>

        {compareResult ? (
          <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
            {compareResult.latestMonth} ({formatCurrency(compareResult.latestTotal, locale)}) vs{" "}
            {compareResult.selectedMonth} ({formatCurrency(compareResult.selectedTotal, locale)}):{" "}
            <strong>
              {compareResult.delta >= 0 ? "+" : ""}
              {compareResult.delta.toFixed(1)}%
            </strong>
          </p>
        ) : null}

        {contributionAnomalies.length ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-semibold">{t.passbook.anomalies}</p>
            {contributionAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{anomaly.title}</p>
                  <StatusBadge category={anomaly.category} />
                </div>
                <p className="mt-1 text-zinc-600 dark:text-zinc-300">{anomaly.detail}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <ul className="space-y-3">
        {filteredEntries.map((entry) => {
          const total = monthlyTotal(entry);
          return (
            <li key={entry.id} className="nidhi-card">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{monthLabel(entry.wageMonth, locale)}</p>
                  <p className="text-lg font-semibold">{formatCurrency(total, locale)}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t.passbook.employer}: {entry.employerName ?? t.passbook.mappedEmployer}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4 md:text-sm">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.employee}</p>
                    <p className="font-medium">{formatCurrency(entry.employeeContribution, locale)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.employer}</p>
                    <p className="font-medium">{formatCurrency(entry.employerContribution, locale)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.interest}</p>
                    <p className="font-medium">{formatCurrency(entry.interestCredit, locale)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">{t.passbook.transferAdj}</p>
                    <p className="font-medium">
                      {formatCurrency((entry.transferIn ?? 0) + (entry.adjustment ?? 0), locale)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ExplainabilityPanel
                  title={t.passbook.explainMoney}
                  note={{
                    owner: "epfo",
                    whatHappened: t.passbook.whatHappened,
                    whyItHappened: entry.note ?? t.passbook.whyHappenedDefault,
                    userImpact: t.passbook.userImpact,
                    nextSteps: [t.passbook.nextCompare, t.passbook.nextAsk],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.passbook.askTitle}</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {[
            t.passbook.promptChange,
            t.passbook.promptCompare,
            t.passbook.promptInterest,
            t.passbook.promptExplain,
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

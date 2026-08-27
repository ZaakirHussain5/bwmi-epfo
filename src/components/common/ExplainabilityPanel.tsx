"use client";

import type { ExplainabilityNote } from "@/types/epf";
import { useLocale } from "@/i18n/useLocale";

export function ExplainabilityPanel({
  note,
  title,
}: {
  note: ExplainabilityNote;
  title?: string;
}) {
  const { t } = useLocale();
  return (
    <details className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
      <summary className="cursor-pointer font-medium text-teal-700 dark:text-teal-300">
        {title ?? t.explain.title}
      </summary>
      <div className="mt-2 space-y-2 text-zinc-700 dark:text-zinc-200">
        <p>
          <span className="font-semibold">{t.explain.what}</span> {note.whatHappened}
        </p>
        <p>
          <span className="font-semibold">{t.explain.why}</span> {note.whyItHappened}
        </p>
        <p>
          <span className="font-semibold">{t.explain.impact}</span> {note.userImpact}
        </p>
        <div>
          <p className="font-semibold">{t.explain.next}</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {note.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

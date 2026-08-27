"use client";

import type { StatusCategory } from "@/types/epf";
import { useLocale } from "@/i18n/useLocale";

const categoryStyles: Record<StatusCategory, string> = {
  action_required: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
  important: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  in_progress: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  informational: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  resolved: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
};

const categoryIcons: Record<StatusCategory, string> = {
  action_required: "!",
  important: "i",
  in_progress: "…",
  informational: "•",
  resolved: "✓",
};

export function StatusBadge({
  category,
  label,
}: {
  category: StatusCategory;
  label?: string;
}) {
  const { t } = useLocale();
  const resolved = label ?? t.status[category];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${categoryStyles[category]}`}
      aria-label={resolved}
    >
      <span aria-hidden="true">{categoryIcons[category]}</span>
      <span>{resolved}</span>
    </span>
  );
}

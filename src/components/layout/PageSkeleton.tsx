"use client";

import { useLocale } from "@/i18n/useLocale";

export function PageSkeleton() {
  const { t } = useLocale();
  return (
    <section className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="nidhi-card h-36 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="nidhi-card h-48 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
        <div className="nidhi-card h-48 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
        <div className="nidhi-card h-48 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="nidhi-card h-64 animate-pulse bg-zinc-100 dark:bg-zinc-900 xl:col-span-2" />
        <div className="nidhi-card h-64 animate-pulse bg-zinc-100 dark:bg-zinc-900" />
      </div>
      <span className="sr-only">{t.common.loading}</span>
    </section>
  );
}

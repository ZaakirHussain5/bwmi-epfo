"use client";

import { useLocale } from "@/i18n/useLocale";

export function SidebarToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={onToggle}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-expanded={open}
      aria-controls="nidhi-assistant-panel"
      aria-label={open ? t.shell.collapseAssistant : t.shell.expandAssistant}
      title={open ? t.shell.hideChat : t.common.askNidhi}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="2.25" />
        <path d="M9 3.25v17.5" />
      </svg>
    </button>
  );
}

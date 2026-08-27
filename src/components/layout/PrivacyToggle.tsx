"use client";

import { usePrivacyMode } from "@/hooks/usePrivacyMode";
import { useLocale } from "@/i18n/useLocale";

export function PrivacyToggle() {
  const { t } = useLocale();
  const { hidden, toggle } = usePrivacyMode();

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative h-10 w-10 overflow-hidden rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:scale-105 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-label={hidden ? t.privacy.show : t.privacy.hide}
      aria-pressed={!hidden}
      title={hidden ? t.privacy.show : t.privacy.hide}
    >
      <span
        className={[
          "absolute inset-0 grid place-items-center transition-all duration-300",
          hidden ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        ].join(" ")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.3A10.8 10.8 0 0 1 12 4c5.2 0 8.6 4.4 9.5 6.1a3.8 3.8 0 0 1 0 3.8 14.8 14.8 0 0 1-2.1 3M6.2 6.2A14.1 14.1 0 0 0 2.5 10a3.8 3.8 0 0 0 0 4C3.4 15.6 6.8 20 12 20c1.4 0 2.7-.3 3.8-.8"
          />
        </svg>
      </span>
      <span
        className={[
          "absolute inset-0 grid place-items-center transition-all duration-300",
          hidden ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        ].join(" ")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M2.5 10.1a3.8 3.8 0 0 0 0 3.8C3.4 15.6 6.8 20 12 20s8.6-4.4 9.5-6.1a3.8 3.8 0 0 0 0-3.8C20.6 8.4 17.2 4 12 4S3.4 8.4 2.5 10.1Z"
          />
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
    </button>
  );
}

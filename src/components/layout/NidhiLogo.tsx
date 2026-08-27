"use client";

import { useLocale } from "@/i18n/useLocale";

interface NidhiMarkProps {
  className?: string;
}

export function NidhiMark({ className = "h-9 w-9" }: NidhiMarkProps) {
  return (
    <svg viewBox="0 0 64 64" className={`block shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="nidhi-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#nidhi-ring)" />
      <circle cx="32" cy="32" r="24" fill="#ecfeff" />
      <circle cx="32" cy="32" r="18" fill="#0f766e" opacity="0.12" />
      <path
        fill="#0f766e"
        d="M23 38a9 9 0 0 1 18 0h4a13 13 0 0 0-26 0h4Zm9-14a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-8 18h16v4H24v-4Z"
      />
      <circle cx="12" cy="32" r="2" fill="#14b8a6" />
      <circle cx="52" cy="32" r="2" fill="#14b8a6" />
      <circle cx="32" cy="12" r="2" fill="#14b8a6" />
      <circle cx="32" cy="52" r="2" fill="#14b8a6" />
    </svg>
  );
}

export function NidhiLogo() {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-3">
      <NidhiMark className="h-10 w-10 md:h-11 md:w-11" />
      <div className="hidden flex-col justify-center gap-0.5 sm:flex">
        <p className="flex items-center gap-1.5 text-sm font-bold leading-none tracking-[0.18em] text-teal-700 md:text-base dark:text-teal-400">
          NIDHI
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            BETA
          </span>
        </p>
        <p className="text-xs font-medium leading-none text-zinc-600 dark:text-zinc-300">
          {t.shell.tagline}
        </p>
      </div>
    </div>
  );
}

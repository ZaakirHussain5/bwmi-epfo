"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/useLocale";

const STORAGE_KEY = "nidhi-theme";

type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem(STORAGE_KEY, mode);
}

export function ThemeToggle() {
  const { t } = useLocale();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved) {
      return saved;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative h-10 w-10 overflow-hidden rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:scale-105 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-label={t.theme.toggle}
      title={theme === "dark" ? t.theme.toLight : t.theme.toDark}
    >
      <span
        className={[
          "absolute inset-0 grid place-items-center transition-all duration-400",
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        ].join(" ")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75Zm0 14.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Zm8.25-6a.75.75 0 0 1-.75.75H18a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75Zm-14.25 0a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75Zm10.46 5.46a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM5.42 6.42a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06L5.42 7.48a.75.75 0 0 1 0-1.06Zm12.12 2.12a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06ZM7.54 17.54a.75.75 0 0 1-1.06 1.06L5.42 17.54a.75.75 0 0 1 1.06-1.06l1.06 1.06ZM12 8.25A3.75 3.75 0 1 0 12 15.75 3.75 3.75 0 0 0 12 8.25Z"
          />
        </svg>
      </span>
      <span
        className={[
          "absolute inset-0 grid place-items-center transition-all duration-400",
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        ].join(" ")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.53 3.66a.75.75 0 0 0-.98.9 7.5 7.5 0 0 1-9 9 .75.75 0 0 0-.9.98A9 9 0 1 0 14.53 3.66Z"
          />
        </svg>
      </span>
    </button>
  );
}

"use client";

import { useEffect } from "react";
import { LOCALE_COOKIE, LOCALE_META } from "./config";
import { APP_LOCALES } from "./config";
import { useLocale } from "./useLocale";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={[
        "inline-flex rounded-full border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900",
        compact ? "scale-95" : "",
      ].join(" ")}
      role="group"
      aria-label={t.language}
    >
      {APP_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={[
            "rounded-full px-2.5 py-1 text-xs font-semibold transition",
            locale === code
              ? "bg-teal-700 text-white dark:bg-teal-500 dark:text-zinc-950"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
          ].join(" ")}
          lang={LOCALE_META[code].htmlLang}
          aria-pressed={locale === code}
        >
          {LOCALE_META[code].native}
        </button>
      ))}
    </div>
  );
}

export function LocaleSync() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
    document.documentElement.dataset.locale = locale;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  return null;
}
export const APP_LOCALES = ["en", "hi", "kn"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const LOCALE_META: Record<
  AppLocale,
  { label: string; native: string; htmlLang: string; intl: string }
> = {
  en: { label: "English", native: "English", htmlLang: "en", intl: "en-IN" },
  hi: { label: "Hindi", native: "हिन्दी", htmlLang: "hi", intl: "hi-IN" },
  kn: { label: "Kannada", native: "ಕನ್ನಡ", htmlLang: "kn", intl: "kn-IN" },
};

export const LOCALE_STORAGE_KEY = "nidhi-locale";
export const LEGACY_LOCALE_STORAGE_KEY = "nidhi-landing-lang";
export const LOCALE_COOKIE = "nidhi-locale";
export const LOCALE_EVENT = "nidhi-locale-change";

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "en" || value === "hi" || value === "kn";
}

export function interpolate(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

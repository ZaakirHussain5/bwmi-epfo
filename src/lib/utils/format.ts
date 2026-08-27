import { LOCALE_META, type AppLocale } from "@/i18n/config";

function intlLocale(locale: AppLocale = "en") {
  return LOCALE_META[locale].intl;
}

export const formatCurrency = (value: number, locale: AppLocale = "en") =>
  new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string, locale: AppLocale = "en") =>
  new Date(value).toLocaleDateString(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const formatDateTime = (value: string, locale: AppLocale = "en") =>
  new Date(value).toLocaleString(intlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

export const formatRelativeTime = (value: string, locale: AppLocale = "en") => {
  const now = Date.now();
  const input = new Date(value).getTime();
  const diffMs = input - now;
  const diffMinutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

export const formatMonthLabel = (value: string, locale: AppLocale = "en") => {
  const date = value.length === 7 ? new Date(`${value}-01T00:00:00.000Z`) : new Date(value);
  return date.toLocaleDateString(intlLocale(locale), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

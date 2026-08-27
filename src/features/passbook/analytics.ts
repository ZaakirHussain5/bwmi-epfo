import type { PassbookEntry } from "@/types/epf";
import { LOCALE_META, type AppLocale } from "@/i18n/config";

export const monthlyTotal = (entry: PassbookEntry) =>
  entry.employeeContribution +
  entry.employerContribution +
  entry.interestCredit +
  (entry.transferIn ?? 0) -
  (entry.withdrawal ?? 0) +
  (entry.adjustment ?? 0);

export const monthLabel = (month: string, locale: AppLocale = "en") =>
  new Date(`${month}-01T00:00:00.000Z`).toLocaleString(LOCALE_META[locale].intl, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const percentChange = (current: number, previous: number) => {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
};

export const buildYears = (entries: PassbookEntry[]) =>
  [...new Set(entries.map((entry) => new Date(entry.postedAt).getUTCFullYear()))].sort(
    (a, b) => b - a,
  );

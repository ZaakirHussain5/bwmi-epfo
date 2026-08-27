import type { Claim } from "@/types/epf";
import type { AppLocale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

export const claimTypeLabel = (type: Claim["type"], locale: AppLocale = "en") =>
  messages[locale].claimType[type];

export const claimStageLabel = (stage: Claim["currentStage"], locale: AppLocale = "en") =>
  messages[locale].claimStage[stage];

export const claimStatusLabel = (status: Claim["status"], locale: AppLocale = "en") =>
  messages[locale].claimStatus[status];

export const claimStatusTone = (status: Claim["status"]) =>
  ({
    draft: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300",
    active: "text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300",
    completed: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
    rejected: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300",
  })[status];

import { en } from "./en";
import { hi } from "./hi";
import { kn } from "./kn";
import type { AppLocale } from "./config";
import type { AppMessages } from "./types";

export const messages: Record<AppLocale, AppMessages> = { en, hi, kn };

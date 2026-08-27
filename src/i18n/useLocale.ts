"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  isAppLocale,
  LEGACY_LOCALE_STORAGE_KEY,
  LOCALE_COOKIE,
  LOCALE_EVENT,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from "./config";
import { messages } from "./messages";
import type { AppMessages } from "./types";

function readStoredLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY) ?? localStorage.getItem(LEGACY_LOCALE_STORAGE_KEY);
  if (isAppLocale(saved)) {
    return saved;
  }
  const language = navigator.language.toLowerCase();
  if (language.startsWith("hi")) {
    return "hi";
  }
  if (language.startsWith("kn")) {
    return "kn";
  }
  return "en";
}

function subscribe(onChange: () => void) {
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function persistLocale(next: AppLocale) {
  localStorage.setItem(LOCALE_STORAGE_KEY, next);
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, readStoredLocale, () => "en" as const);
  const setLocale = useCallback((next: AppLocale) => {
    persistLocale(next);
  }, []);
  return { locale, setLocale, t: messages[locale] as AppMessages };
}

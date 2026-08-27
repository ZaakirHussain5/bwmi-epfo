"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nidhi-sensitive-values";
const PRIVACY_EVENT = "nidhi-privacy-change";

type PrivacyPreference = "hidden" | "visible";

export function usePrivacyMode() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const syncPreference = () => {
      setHidden(localStorage.getItem(STORAGE_KEY) !== "visible");
    };

    syncPreference();
    window.addEventListener(PRIVACY_EVENT, syncPreference);
    window.addEventListener("storage", syncPreference);
    return () => {
      window.removeEventListener(PRIVACY_EVENT, syncPreference);
      window.removeEventListener("storage", syncPreference);
    };
  }, []);

  const setPrivacy = useCallback((preference: PrivacyPreference) => {
    localStorage.setItem(STORAGE_KEY, preference);
    setHidden(preference === "hidden");
    window.dispatchEvent(new Event(PRIVACY_EVENT));
  }, []);

  return {
    hidden,
    hide: () => setPrivacy("hidden"),
    show: () => setPrivacy("visible"),
    toggle: () => setPrivacy(hidden ? "visible" : "hidden"),
  };
}

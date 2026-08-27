"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-config";
import { useLocale } from "@/i18n/useLocale";

const NAV_COPY = {
  "/dashboard": { label: "dashboard", short: "dashboardShort" },
  "/passbook": { label: "passbook", short: "passbookShort" },
  "/claims": { label: "claims", short: "claimsShort" },
  "/profile": { label: "profile", short: "profileShort" },
  "/services": { label: "services", short: "servicesShort" },
  "/help": { label: "help", short: "helpShort" },
} as const;

export function TopNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      className="hidden items-center rounded-full border border-zinc-200 bg-white/80 p-1 shadow-sm md:flex dark:border-zinc-800 dark:bg-zinc-950/70"
      aria-label={t.nav.primary}
    >
      {NAV_ITEMS.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const copyKey = NAV_COPY[link.href as keyof typeof NAV_COPY];

        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
            ].join(" ")}
          >
            {copyKey ? t.nav[copyKey.label] : link.label}
          </Link>
        );
      })}
    </nav>
  );
}

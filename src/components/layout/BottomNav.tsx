"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-config";
import { useLocale } from "@/i18n/useLocale";

const ICONS: Record<string, string> = {
  "/dashboard": "⌂",
  "/passbook": "▤",
  "/claims": "◍",
  "/profile": "◉",
  "/services": "⋯",
  "/help": "?",
};

const NAV_COPY = {
  "/dashboard": "dashboardShort",
  "/passbook": "passbookShort",
  "/claims": "claimsShort",
  "/profile": "profileShort",
  "/services": "servicesShort",
  "/help": "helpShort",
} as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-6 gap-1">
        {NAV_ITEMS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const copyKey = NAV_COPY[link.href as keyof typeof NAV_COPY];
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[
                  "flex flex-col items-center rounded-xl px-2 py-2 text-center text-[11px] font-medium transition-colors",
                  isActive
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                ].join(" ")}
              >
                <span aria-hidden="true" className="text-xs leading-none">
                  {ICONS[link.href] ?? "•"}
                </span>
                <span className="mt-1 leading-none">{copyKey ? t.nav[copyKey] : link.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

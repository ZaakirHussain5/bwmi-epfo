"use client";

import Link from "next/link";
import { useEffect, useState, type PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { signOutMemberAccount } from "@/actions/auth";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { IconLogout } from "@/components/common/icons";
import { BottomNav } from "./BottomNav";
import { NidhiLogo } from "./NidhiLogo";
import { SidebarToggle } from "./SidebarToggle";
import { ThemeToggle } from "./ThemeToggle";
import { PrivacyToggle } from "./PrivacyToggle";
import { TopNav } from "./TopNav";
import { NAV_ITEMS } from "./nav-config";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useLocale } from "@/i18n/useLocale";

const CHAT_OPEN_KEY = "nidhi-chat-open";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { t } = useLocale();
  const [chatOpen, setChatOpen] = useState(false);
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const saved = localStorage.getItem(CHAT_OPEN_KEY);
      if (saved === "true" || saved === "false") {
        setChatOpen(saved === "true");
      } else {
        setChatOpen(window.matchMedia("(min-width: 1024px)").matches);
      }
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const setOpen = (open: boolean) => {
    setChatOpen(open);
    localStorage.setItem(CHAT_OPEN_KEY, String(open));
  };

  const currentPage = NAV_ITEMS.find((item) => pathname.startsWith(item.href)) ?? NAV_ITEMS[0];

  return (
    <div className="flex h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-30 w-full shrink-0 border-b border-zinc-200/80 bg-white/92 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="flex h-16 w-full items-center gap-3 pl-1 pr-4 md:grid md:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 items-center gap-2 md:justify-self-start">
            <NidhiLogo />
            {!chatOpen ? (
              <SidebarToggle open={chatOpen} onToggle={() => setOpen(!chatOpen)} />
            ) : null}
          </div>
          <TopNav />
          <div className="ml-auto flex items-center justify-end gap-2 md:ml-0 md:gap-3 md:justify-self-end">
            <LanguageSwitcher compact />
            <ThemeToggle />
            <PrivacyToggle />
            <form action={signOutMemberAccount}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 md:px-3.5 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                <IconLogout className="h-4 w-4" />
                {t.shell.logOut}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <button
          type="button"
          className={[
            "absolute inset-0 z-40 bg-zinc-950/40 transition-opacity duration-300 lg:hidden",
            chatOpen ? "opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          aria-label={t.shell.closeAssistant}
          onClick={() => setOpen(false)}
        />
        <AssistantPanel open={chatOpen} onOpenChange={setOpen} />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--content-bg)]">
          <main className="w-full px-5 py-6 pb-24 md:px-8 md:py-7 md:pb-8 lg:px-10 xl:px-12">
            {!isDashboard ? (
              <section className="mb-4 rounded-2xl border border-zinc-200/80 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/70">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400">
                      {t.shell.workspaceKicker}
                    </p>
                    <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {currentPage.href === "/passbook"
                        ? t.nav.passbook
                        : currentPage.href === "/claims"
                          ? t.nav.claims
                          : currentPage.href === "/profile"
                            ? t.nav.profile
                            : currentPage.href === "/services"
                              ? t.nav.services
                              : currentPage.href === "/help"
                                ? t.nav.help
                                : t.nav.dashboard}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {currentPage.href === "/passbook"
                        ? t.nav.passbookDescription
                        : currentPage.href === "/claims"
                          ? t.nav.claimsDescription
                          : currentPage.href === "/profile"
                            ? t.nav.profileDescription
                            : currentPage.href === "/services"
                              ? t.nav.servicesDescription
                              : currentPage.href === "/help"
                                ? t.nav.helpDescription
                                : t.nav.dashboardDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-200 dark:hover:bg-teal-950/50"
                    onClick={() => setOpen(true)}
                  >
                    {t.common.askNidhi}
                  </button>
                </div>
              </section>
            ) : (
              <h1 className="sr-only">{t.nav.dashboard}</h1>
            )}
            <section className="space-y-4">
              {children}
            </section>
            <footer className="mt-8 flex flex-col gap-3 border-t border-zinc-200/80 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 NIDHI</p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Footer">
                <a href="#privacy" className="hover:text-zinc-800 dark:hover:text-zinc-200">
                  {t.shell.privacy}
                </a>
                <a href="#terms" className="hover:text-zinc-800 dark:hover:text-zinc-200">
                  {t.shell.terms}
                </a>
                <Link href="/help" className="hover:text-zinc-800 dark:hover:text-zinc-200">
                  {t.nav.help}
                </Link>
              </nav>
            </footer>
          </main>
          <div className="pointer-events-none fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom))] right-4 z-20 rounded-full border border-zinc-200 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 md:bottom-4">
            {t.shell.memberWorkspace}
          </div>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

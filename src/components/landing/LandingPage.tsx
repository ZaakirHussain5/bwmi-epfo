"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { BusyOverlay } from "@/components/common/BusyOverlay";
import { IconSpinner } from "@/components/common/icons";
import { HeroScene } from "@/components/landing/HeroScene";
import {
  FEATURE_ILLUSTRATIONS,
  JourneyPath,
} from "@/components/landing/LandingIllustrations";
import { NidhiMark } from "@/components/layout/NidhiLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { landingCopy } from "@/features/landing/copy";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { useLocale } from "@/i18n/useLocale";

type LandingPageProps = {
  signedIn: boolean;
};

export function LandingPage({ signedIn }: LandingPageProps) {
  const { locale, t } = useLocale();
  const copy = landingCopy[locale];
  const enterHref = signedIn ? "/dashboard" : "/sign-in";
  const enterLabel = signedIn ? copy.nav.openDashboard : copy.nav.enter;
  const heroCta = signedIn ? copy.hero.signedInCta : copy.hero.cta;
  const pendingLabel = signedIn ? t.auth.openingDashboard : t.auth.openingPortal;
  const pendingRef = useRef(false);
  const [portalPending, setPortalPending] = useState(false);

  const handlePortalNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    if (pendingRef.current) {
      event.preventDefault();
      return;
    }
    pendingRef.current = true;
    setPortalPending(true);
  };

  return (
    <div
      className="landing-root landing-mesh min-h-full overflow-x-hidden"
      data-landing-lang={locale}
      aria-busy={portalPending}
    >
      <div inert={portalPending ? true : undefined}>
        <a
          href="#features"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-teal-700 focus:px-3 focus:py-2 focus:text-white"
        >
          {copy.skip}
        </a>

        <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/75">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <NidhiMark className="h-10 w-10" />
            <span className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              Nidhi
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-5 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
            <a className="transition hover:text-teal-700 dark:hover:text-teal-300" href="#features">
              {copy.nav.features}
            </a>
            <a className="transition hover:text-teal-700 dark:hover:text-teal-300" href="#journey">
              {copy.nav.journey}
            </a>
            <a className="transition hover:text-teal-700 dark:hover:text-teal-300" href="#voice">
              {copy.nav.voice}
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <PortalEnterLink
              href={enterHref}
              busy={portalPending}
              busyLabel={pendingLabel}
              onNavigate={handlePortalNavigate}
              className="hidden items-center gap-2 rounded-xl bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:inline-flex dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              {enterLabel}
            </PortalEnterLink>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-8 pt-10 md:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800 dark:border-teal-900/70 dark:bg-teal-950/50 dark:text-teal-200">
              {copy.hero.kicker}
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl dark:text-zinc-50">
              {copy.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 md:text-lg dark:text-zinc-300">
              {copy.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PortalEnterLink
                href={enterHref}
                busy={portalPending}
                busyLabel={pendingLabel}
                onNavigate={handlePortalNavigate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400"
              >
                {heroCta}
              </PortalEnterLink>
              <a
                href="#features"
                className="rounded-2xl border border-zinc-300 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-teal-400 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100"
              >
                {copy.hero.secondary}
              </a>
            </div>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {copy.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <dt className="text-sm font-semibold text-teal-800 dark:text-teal-300">{stat.value}</dt>
                  <dd className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroScene scene={copy.scene} />
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            {copy.features.kicker}
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
            {copy.features.title}
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{copy.features.subtitle}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {copy.features.items.map((item) => {
              const Illustration =
                FEATURE_ILLUSTRATIONS[item.id as keyof typeof FEATURE_ILLUSTRATIONS] ??
                FEATURE_ILLUSTRATIONS.assistant;
              return (
                <article
                  key={item.id}
                  className="group rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <Illustration className="h-16 w-16 transition duration-500 group-hover:rotate-3 group-hover:scale-105" />
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="voice" className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-10 px-4 py-8 md:grid-cols-2 md:px-6 md:py-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-teal-200/70 bg-gradient-to-br from-teal-950 via-zinc-950 to-amber-950 p-8 text-white shadow-2xl">
            <VoiceWave />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
              {copy.voice.kicker}
            </p>
            <h2 className="relative mt-3 text-3xl font-semibold tracking-tight">{copy.voice.title}</h2>
            <p className="relative mt-4 text-sm leading-6 text-teal-50/85">{copy.voice.body}</p>
          </div>
          <ul className="space-y-3">
            {copy.voice.points.map((point) => (
              <li
                key={point}
                className="flex gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200"
              >
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-500" />
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section id="journey" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            {copy.journey.kicker}
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
            {copy.journey.title}
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{copy.journey.subtitle}</p>
          <div className="mt-8 hidden md:block">
            <JourneyPath className="h-24 w-full" />
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-5">
            {copy.journey.steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-3xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            {copy.prompts.kicker}
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {copy.prompts.title}
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{copy.prompts.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {copy.prompts.items.map((prompt) => (
              <p
                key={prompt}
                className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-100"
              >
                “{prompt}”
              </p>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-teal-700/30 bg-teal-900 px-6 py-12 text-center text-white shadow-2xl md:px-12">
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" viewBox="0 0 800 240">
              <path
                d="M0 160 C 120 40, 240 200, 400 100 S 680 40, 800 140"
                fill="none"
                stroke="#5eead4"
                strokeWidth="2"
              />
              <path
                d="M0 190 C 160 80, 280 210, 480 90 S 720 60, 800 180"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
            </svg>
            <h2 className="relative text-3xl font-semibold tracking-tight md:text-4xl">{copy.cta.title}</h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-6 text-teal-50/90">{copy.cta.body}</p>
            <PortalEnterLink
              href={enterHref}
              busy={portalPending}
              busyLabel={pendingLabel}
              onNavigate={handlePortalNavigate}
              className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              {signedIn ? copy.cta.signedInButton : copy.cta.button}
            </PortalEnterLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 px-4 py-8 text-sm text-zinc-600 md:px-6 dark:border-zinc-800 dark:text-zinc-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{copy.footer.home}</p>
            <p className="mt-2 text-xs leading-5">{copy.footer.notice}</p>
            <p className="mt-3 text-xs">© 2026 NIDHI</p>
          </div>
          <nav className="flex gap-4 text-xs" aria-label="Footer">
            <a href="#privacy">{copy.footer.privacy}</a>
            <a href="#terms">{copy.footer.terms}</a>
            <PortalEnterLink
              href={enterHref}
              busy={portalPending}
              busyLabel={pendingLabel}
              onNavigate={handlePortalNavigate}
              className="inline-flex items-center gap-1.5 transition hover:text-teal-700 dark:hover:text-teal-300"
            >
              {enterLabel}
            </PortalEnterLink>
          </nav>
        </div>
      </footer>
      </div>
      {portalPending ? <BusyOverlay label={pendingLabel} /> : null}
    </div>
  );
}

function PortalEnterLink({
  href,
  className,
  children,
  busy,
  busyLabel,
  onNavigate,
}: {
  href: string;
  className: string;
  children: ReactNode;
  busy: boolean;
  busyLabel: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      className={`${busy ? "pointer-events-none cursor-wait" : ""} ${className}`.trim()}
      aria-busy={busy}
      aria-disabled={busy}
      onClick={onNavigate}
    >
      {busy ? <IconSpinner className="h-4 w-4" /> : null}
      {busy ? busyLabel : children}
    </Link>
  );
}

function VoiceWave() {
  return (
    <svg className="absolute inset-x-0 bottom-0 h-24 w-full opacity-40" viewBox="0 0 400 80" aria-hidden="true">
      {Array.from({ length: 32 }, (_, index) => {
        const height = 12 + ((index * 17) % 48);
        return (
          <rect
            key={index}
            x={12 + index * 12}
            y={70 - height}
            width="6"
            height={height}
            rx="3"
            fill="#5eead4"
            className="landing-node"
            style={{ animationDelay: `${index * 0.08}s` }}
          />
        );
      })}
    </svg>
  );
}

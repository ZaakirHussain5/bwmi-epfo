"use client";

import Link from "next/link";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import type { Service } from "@/types/epf";

const SERVICE_HREFS = {
  "svc-track-claim": { href: "/claims", labelKey: "openClaims" },
  "svc-medical-claim": { href: "/claims?start=1", labelKey: "startMedical" },
  "svc-profile": { href: "/profile", labelKey: "openProfile" },
} as const;

export function ServicesCatalog({ services }: { services: Service[] }) {
  const { t } = useLocale();

  return (
    <section className="space-y-4">
      <header className="nidhi-card">
        <h2 className="text-xl font-semibold">{t.services.title}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t.services.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href="/claims?start=1"
            className="rounded-lg border border-teal-300 px-3 py-1.5 text-teal-800 hover:bg-teal-50 dark:border-teal-900/60 dark:text-teal-200 dark:hover:bg-teal-950/40"
          >
            {t.services.precheck}
          </Link>
          <Link
            href="/help"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
          >
            {t.services.openCases}
          </Link>
        </div>
      </header>
      <ul className="grid gap-3 md:grid-cols-2">
        {services.map((service) => {
          const copy = t.services.catalog[service.id as keyof typeof t.services.catalog];
          const cta = SERVICE_HREFS[service.id as keyof typeof SERVICE_HREFS];
          return (
            <li key={service.id} className="nidhi-card">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{copy?.title ?? service.title}</h3>
                <span
                  className={[
                    "rounded-full px-2 py-1 text-xs font-medium",
                    service.isAvailable
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
                  ].join(" ")}
                >
                  {service.isAvailable ? t.services.availableNow : t.services.previewOnly}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {copy?.description ?? service.description}
              </p>
              <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">
                {interpolate(t.services.estimatedSteps, { count: service.estimatedSteps })}
              </p>
              {cta ? (
                <Link href={cta.href} className="nidhi-btn-primary mt-4 px-3 py-2">
                  {t.services[cta.labelKey]}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

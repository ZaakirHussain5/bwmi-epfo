"use client";

import { useEffect, useState } from "react";
import { AskNidhiButton } from "@/components/assistant/AskNidhiButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { EPF_KNOWLEDGE_ARTICLES } from "@/lib/knowledge/epf-kb";
import { retrieveKnowledge } from "@/lib/knowledge/retrieve";
import { emitNidhiAsk, NIDHI_REFRESH_EVENT } from "@/lib/events";
import { formatDateTime } from "@/lib/utils/format";
import type { ServiceStatus, SupportTicket, SupportTicketCategory } from "@/types/epf";

interface HelpWorkspaceProps {
  initialTickets: SupportTicket[];
  initialServiceStatus: ServiceStatus[];
  ticketPrefill?: {
    subject?: string;
    category?: SupportTicketCategory;
    description?: string;
  };
}

const categories: SupportTicketCategory[] = ["claim", "passbook", "profile", "account", "other"];

export function HelpWorkspace({
  initialTickets,
  initialServiceStatus,
  ticketPrefill,
}: HelpWorkspaceProps) {
  const { locale, t } = useLocale();
  const [tickets, setTickets] = useState(initialTickets);
  const serviceStatus = initialServiceStatus;
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(ticketPrefill?.subject ?? "");
  const [category, setCategory] = useState<SupportTicketCategory>(ticketPrefill?.category ?? "other");
  const [description, setDescription] = useState(ticketPrefill?.description ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(initialTickets[0]?.id);
  const [caseActionState, setCaseActionState] = useState<"idle" | "saving" | "error">("idle");

  const articles = query.trim() ? retrieveKnowledge(query, 4) : EPF_KNOWLEDGE_ARTICLES;

  const refreshTickets = async () => {
    const response = await fetch("/api/tickets");
    const data = (await response.json()) as SupportTicket[];
    setTickets(data);
  };

  useEffect(() => {
    const onRefresh = (event: Event) => {
      const entity = (event as CustomEvent<{ entity?: string }>).detail?.entity;
      if (entity === "tickets") {
        void refreshTickets();
      }
    };
    window.addEventListener(NIDHI_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NIDHI_REFRESH_EVENT, onRefresh);
  }, []);

  const submitTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, description }),
      });
      if (!response.ok) {
        throw new Error("Could not create ticket.");
      }
      await refreshTickets();
      setSubject("");
      setDescription("");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  };

  const selectedCase = tickets.find((ticket) => ticket.id === selectedCaseId) ?? tickets[0];
  const degradedServices = serviceStatus.filter((status) => status.status !== "operational");

  const updateCaseStatus = async (ticketId: string, action: "mark_resolved" | "reopen") => {
    setCaseActionState("saving");
    try {
      const response = await fetch("/api/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action }),
      });
      if (!response.ok) {
        throw new Error("Could not update case.");
      }
      await refreshTickets();
      setCaseActionState("idle");
    } catch {
      setCaseActionState("error");
    }
  };

  return (
    <section className="space-y-4">
      <header className="nidhi-card">
        <h2 className="text-xl font-semibold">{t.help.title}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {t.help.subtitle}
        </p>
        <button
          type="button"
          className="nidhi-btn-primary mt-3 px-3 py-2"
          onClick={() => emitNidhiAsk(t.help.askHelp)}
        >
          {t.help.askInstead}
        </button>
      </header>

      <section className="nidhi-card">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">{t.help.systemStatus}</h3>
          <StatusBadge category={degradedServices.length ? "important" : "resolved"} />
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {t.help.systemSubtitle}
        </p>
        <ul className="mt-3 space-y-2">
          {serviceStatus.map((status) => (
            <li
              key={status.id}
              className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{t.serviceStatus[status.id]?.name ?? status.name}</p>
                <StatusBadge
                  category={
                    status.status === "operational"
                      ? "resolved"
                      : status.status === "degraded"
                        ? "important"
                        : "action_required"
                  }
                  label={t.status[status.status]}
                />
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                {t.serviceStatus[status.id]?.detail ?? status.detail}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {interpolate(t.help.lastUpdated, { time: formatDateTime(status.lastUpdated, locale) })}
                {status.estimatedRestoration
                  ? ` · ${t.serviceStatus[status.id]?.restoration ?? status.estimatedRestoration}`
                  : ""}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {status.draftsSafe ? t.help.draftsSafe : t.help.draftsUnsafe}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="nidhi-card space-y-3">
        <h3 className="text-base font-semibold">{t.help.knowledge}</h3>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.help.searchPlaceholder}
          className="nidhi-input"
        />
        <ul className="space-y-3">
          {articles.map((article) => {
            const copy = t.knowledge[article.id];
            return (
            <li key={article.id} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/60">
              <p className="font-medium">{copy?.title ?? article.title}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{copy?.body ?? article.body}</p>
            </li>
            );
          })}
        </ul>
      </section>

      <section id="raise-ticket" className="nidhi-card space-y-3 scroll-mt-24">
        <h3 className="text-base font-semibold">{t.help.raiseTicket}</h3>
        {ticketPrefill?.subject || ticketPrefill?.description ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t.help.prefilled}
          </p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder={t.help.subject}
            className="nidhi-input"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as SupportTicketCategory)}
            className="nidhi-input"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {t.help.categories[item]}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t.help.describe}
          className="nidhi-input min-h-24"
        />
        <button type="button" className="nidhi-btn-primary" onClick={() => void submitTicket()}>
          {t.help.submitTicket}
        </button>
        {saveState === "saving" ? (
          <p className="text-xs text-zinc-500">{t.help.saving}</p>
        ) : null}
        {saveState === "saved" ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-300">{t.help.created}</p>
        ) : null}
        {saveState === "error" ? (
          <p className="text-sm text-rose-600 dark:text-rose-300">{t.help.enterFields}</p>
        ) : null}
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.help.myCases}</h3>
        {tickets.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{t.help.noTickets}</p>
        ) : (
          <div className="mt-3 grid gap-3 lg:grid-cols-[0.95fr_1.2fr]">
            <ul className="space-y-2">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <button
                    type="button"
                    className={[
                      "w-full rounded-xl border p-3 text-left text-sm transition",
                      selectedCase?.id === ticket.id
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20"
                        : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900/40",
                    ].join(" ")}
                    onClick={() => setSelectedCaseId(ticket.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <StatusBadge category={ticket.statusCategory} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {ticket.referenceNumber} · {t.help.currentOwner} {ticket.currentOwner.toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t.help.next}: {ticket.nextExpectedAction}
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {selectedCase ? (
              <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {selectedCase.referenceNumber}
                    </p>
                    <h4 className="text-lg font-semibold">{selectedCase.subject}</h4>
                  </div>
                  <StatusBadge category={selectedCase.statusCategory} />
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  {t.help.category}: {t.help.categories[selectedCase.category]} · {t.help.currentOwner}{" "}
                  {selectedCase.currentOwner.toUpperCase()}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {t.help.lastUpdate}: {formatDateTime(selectedCase.lastUpdate, locale)}
                </p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                  {selectedCase.description}
                </p>

                <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900/50">
                  <p className="font-medium">{t.help.nextAction}</p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-300">{selectedCase.nextExpectedAction}</p>
                </div>

                <h5 className="mt-4 font-semibold">{t.help.timeline}</h5>
                <ol className="mt-2 space-y-2 border-l border-zinc-200 pl-4 dark:border-zinc-700">
                  {selectedCase.timeline.map((event) => (
                    <li key={event.id} className="relative rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900/50">
                      <span className="absolute -left-[1.1rem] top-4 h-2.5 w-2.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{event.detail}</p>
                        <StatusBadge
                          category={
                            event.status === "resolved"
                              ? "resolved"
                              : event.status === "in_progress"
                                ? "in_progress"
                                : "informational"
                          }
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(event.occurredAt, locale)} · {t.common.owner}: {event.owner.toUpperCase()}
                      </p>
                      {event.documents?.length ? (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {t.help.documents}: {event.documents.join(", ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>

                {selectedCase.status === "resolved" ? (
                  <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      {t.help.resolvedQuestion}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="nidhi-btn-primary px-3 py-2"
                        onClick={() => void updateCaseStatus(selectedCase.id, "mark_resolved")}
                        disabled={caseActionState === "saving"}
                      >
                        {t.help.yesResolved}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-700 dark:text-amber-100"
                        onClick={() => void updateCaseStatus(selectedCase.id, "reopen")}
                        disabled={caseActionState === "saving"}
                      >
                        {t.help.stillNeedHelp}
                      </button>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-100">
                      {t.help.reopenHint}
                    </p>
                  </div>
                ) : null}
                {caseActionState === "error" ? (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                    {t.help.updateFailed}
                  </p>
                ) : null}
              </article>
            ) : null}
          </div>
        )}
      </section>

      <section className="nidhi-card">
        <h3 className="text-base font-semibold">{t.help.escalation}</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <AskNidhiButton prompt={t.help.promptEscalate} />
          </li>
          <li>
            <AskNidhiButton prompt={t.help.promptEvidence} />
          </li>
        </ul>
      </section>
    </section>
  );
}

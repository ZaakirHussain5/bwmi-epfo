"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  AssistantChatResponse,
  ChatTurn,
  ClientAction,
  PendingConfirmation,
} from "@/features/assistant/types";
import { IconRobot } from "@/components/common/icons";
import { emitNidhiRefresh, NIDHI_ASK_EVENT, NIDHI_REFRESH_EVENT } from "@/lib/events";
import { interpolate } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import type { Claim, MemberProfile } from "@/types/epf";

type PanelMessage = ChatTurn & {
  id: string;
  source?: "text" | "voice";
  pendingConfirmation?: PendingConfirmation;
};

interface AssistantStatus {
  openaiConfigured: boolean;
  model: string;
  voiceEnabled: boolean;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getPathSuggestions(
  pathname: string,
  t: ReturnType<typeof useLocale>["t"],
) {
  if (pathname.startsWith("/claims")) {
    return t.assistant.claimsSuggestions;
  }
  if (pathname.startsWith("/passbook")) {
    return t.assistant.passbookSuggestions;
  }
  if (pathname.startsWith("/profile")) {
    return t.assistant.profileSuggestions;
  }
  return t.assistant.suggestions;
}

function applyClientActions(actions: ClientAction[], router: ReturnType<typeof useRouter>) {
  for (const action of actions) {
    if (action.type === "refresh") {
      emitNidhiRefresh(action.entity);
    }
    if (action.type === "navigate") {
      router.push(action.href);
    }
    if (action.type === "run_script") {
      const script = document.createElement("script");
      script.type = "module";
      script.textContent = action.script;
      document.body.append(script);
      script.remove();
    }
  }
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => (
          <p {...props} className="mb-3 text-[1.02rem] leading-8 text-zinc-800 last:mb-0 dark:text-zinc-100" />
        ),
        strong: (props) => (
          <strong {...props} className="font-extrabold text-zinc-900 dark:text-zinc-50" />
        ),
        ul: (props) => (
          <ul {...props} className="mb-3 list-disc space-y-1 pl-5 text-[1.02rem] leading-8" />
        ),
        ol: (props) => (
          <ol {...props} className="mb-3 list-decimal space-y-1 pl-5 text-[1.02rem] leading-8" />
        ),
        li: (props) => <li {...props} className="text-zinc-800 dark:text-zinc-100" />,
        h1: (props) => (
          <h1 {...props} className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50" />
        ),
        h2: (props) => (
          <h2 {...props} className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-50" />
        ),
        h3: (props) => (
          <h3 {...props} className="mb-2 text-lg font-bold text-zinc-900 dark:text-zinc-50" />
        ),
        code: (props) => (
          <code
            {...props}
            className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.92rem] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
          />
        ),
        pre: (props) => (
          <pre
            {...props}
            className="mb-3 overflow-x-auto rounded-2xl bg-zinc-100 p-3 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        ),
        a: (props) => (
          <a
            {...props}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function AssistantPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const voiceBaseInputRef = useRef("");
  const finalTranscriptRef = useRef("");

  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [messages, setMessages] = useState<PanelMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t.assistant.welcome,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [draftSource, setDraftSource] = useState<"text" | "voice">("text");
  const [error, setError] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | undefined>();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  const suggestions = getPathSuggestions(pathname, t);
  const proactiveAlert = (() => {
    const transferIssue = profile?.employment.some(
      (record) => record.status === "past" && record.transferStatus !== "completed",
    );
    if (transferIssue) {
      return {
        title: t.assistant.noticed,
        detail: t.assistant.transferDetail,
        prompt: t.assistant.transferPrompt,
      };
    }
    if (profile && !profile.bank.readyForClaims) {
      return {
        title: t.assistant.noticed,
        detail: t.assistant.bankDetail,
        prompt: t.assistant.bankPrompt,
      };
    }
    const rejectedClaim = claims.find((claim) => claim.status === "rejected");
    if (rejectedClaim) {
      return {
        title: t.assistant.noticed,
        detail: t.assistant.rejectedDetail,
        prompt: interpolate(t.assistant.rejectedPrompt, { ref: rejectedClaim.referenceNumber }),
      };
    }
    return null;
  })();

  useEffect(() => {
    void fetch("/api/assistant/status")
      .then((response) => response.json())
      .then((data: AssistantStatus) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    const loadContext = async () => {
      const [profileResponse, claimsResponse] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/claims"),
      ]);
      if (profileResponse.ok) {
        const profileData = (await profileResponse.json()) as MemberProfile;
        setProfile(profileData);
      }
      if (claimsResponse.ok) {
        const claimsData = (await claimsResponse.json()) as Claim[];
        setClaims(claimsData);
      }
    };
    void loadContext();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const sendChat = useCallback(
    async (content: string, source: "text" | "voice" = "text") => {
      const trimmed = content.trim();
      if (!trimmed || busy) {
        return;
      }

      const userMessage: PanelMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        source,
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      setDraftSource("text");
      setVoiceStatus("");
      setBusy(true);
      setError("");

      try {
        const payload = {
          messages: nextMessages
            .filter((message) => message.id !== "welcome")
            .map((message) => ({ role: message.role, content: message.content })),
          currentPath: pathname,
          pendingConfirmation,
          locale,
        };
        const response = await fetch("/api/assistant/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as AssistantChatResponse & { error?: string };
        if (!response.ok) {
          throw new Error("assistant_request_failed");
        }

        setPendingConfirmation(data.pendingConfirmation);
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.message,
            pendingConfirmation: data.pendingConfirmation,
          },
        ]);
        applyClientActions(data.clientActions, router);
        if (
          data.clientActions.some((action) => action.type === "navigate") &&
          window.matchMedia("(max-width: 1023px)").matches
        ) {
          onOpenChange(false);
        }
      } catch (sendError) {
        console.error(sendError);
        setError(t.assistant.failure);
      } finally {
        setBusy(false);
      }
    },
    [busy, locale, messages, onOpenChange, pathname, pendingConfirmation, router, t.assistant.failure],
  );

  const confirmPending = async (accept: boolean) => {
    if (!pendingConfirmation || busy) {
      return;
    }
    if (!accept) {
      setPendingConfirmation(undefined);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-cancel-${Date.now()}`,
          role: "assistant",
          content: t.assistant.cancelled,
        },
      ]);
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((message) => ({ role: message.role, content: message.content })),
          currentPath: pathname,
          confirmedAction: pendingConfirmation,
          locale,
        }),
      });
      const data = (await response.json()) as AssistantChatResponse & { error?: string };
      if (!response.ok) {
        throw new Error("assistant_confirmation_failed");
      }
      setPendingConfirmation(undefined);
      setMessages((current) => [
        ...current,
        {
          id: `user-confirm-${Date.now()}`,
          role: "user",
          content: t.assistant.confirmWord,
        },
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
        },
      ]);
      applyClientActions(data.clientActions, router);
      if (
        data.clientActions.some((action) => action.type === "navigate") &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        onOpenChange(false);
      }
    } catch (confirmError) {
      console.error(confirmError);
      setError(t.assistant.failure);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const onAsk = (event: Event) => {
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        onOpenChange(true);
        void sendChat(prompt);
      }
    };
    window.addEventListener(NIDHI_ASK_EVENT, onAsk);
    return () => window.removeEventListener(NIDHI_ASK_EVENT, onAsk);
  }, [onOpenChange, sendChat]);

  useEffect(() => {
    const onRefresh = (event: Event) => {
      const entity = (event as CustomEvent<{ entity?: string }>).detail?.entity;
      if (entity === "profile") {
        void fetch("/api/profile")
          .then((response) => response.json())
          .then((data: MemberProfile) => setProfile(data));
      }
      if (entity === "claims") {
        void fetch("/api/claims")
          .then((response) => response.json())
          .then((data: Claim[]) => setClaims(data));
      }
    };
    window.addEventListener(NIDHI_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(NIDHI_REFRESH_EVENT, onRefresh);
  }, []);

  const startRecording = async () => {
    setError("");
    setVoiceStatus("");
    if (!status?.voiceEnabled) {
      setError(t.assistant.failure);
      return;
    }
    try {
      const speechWindow = window as typeof window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
      if (Recognition) {
        const recognition = new Recognition();
        voiceBaseInputRef.current = input.trim();
        finalTranscriptRef.current = "";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = locale === "hi" ? "hi-IN" : locale === "kn" ? "kn-IN" : "en-IN";
        recognition.onresult = (event) => {
          let interimTranscript = "";
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const result = event.results[index];
            const transcript = result[0]?.transcript ?? "";
            if (result.isFinal) {
              finalTranscriptRef.current += `${transcript} `;
            } else {
              interimTranscript += transcript;
            }
          }
          const nextDraft = [
            voiceBaseInputRef.current,
            finalTranscriptRef.current.trim(),
            interimTranscript.trim(),
          ].filter(Boolean).join(" ");
          setInput(nextDraft);
          setDraftSource("voice");
        };
        recognition.onerror = () => {
          setError(t.assistant.failure);
          setRecording(false);
        };
        recognition.onend = () => {
          speechRecognitionRef.current = null;
          setRecording(false);
          setVoiceStatus(t.assistant.voiceDraftReady);
          inputRef.current?.focus();
        };
        speechRecognitionRef.current = recognition;
        recognition.start();
        setRecording(true);
        setVoiceStatus(t.assistant.listening);
        return;
      }

      setVoiceStatus(t.assistant.voiceNotSupported);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "voice.webm");
        setTranscribing(true);
        setVoiceStatus(t.assistant.transcribing);
        try {
          const response = await fetch("/api/assistant/transcribe", { method: "POST", body: form });
          const data = (await response.json()) as { text?: string; error?: string };
          if (!response.ok || !data.text) {
            throw new Error("assistant_transcription_failed");
          }
          setInput((current) => [current.trim(), data.text?.trim()].filter(Boolean).join(" "));
          setDraftSource("voice");
          setVoiceStatus(t.assistant.voiceDraftReady);
          inputRef.current?.focus();
        } catch (voiceError) {
          console.error(voiceError);
          setError(t.assistant.failure);
        } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (recordingError) {
      console.error(recordingError);
      setError(t.assistant.failure);
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      return;
    }
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <aside
      className={[
        "fixed inset-x-0 bottom-0 z-50 flex h-[min(82vh,40rem)] min-h-0 flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-[var(--assistant-surface)] transition-all duration-300 ease-out dark:border-zinc-800 dark:bg-[var(--assistant-surface)] lg:relative lg:inset-auto lg:left-0 lg:h-full lg:rounded-none lg:border-t-0",
        open
          ? "translate-y-0 opacity-100 shadow-2xl lg:z-auto lg:w-[25rem] lg:translate-x-0 lg:border-r lg:shadow-none"
          : "pointer-events-none translate-y-full opacity-0 lg:w-0 lg:-translate-x-full lg:translate-y-0 lg:border-r-0",
      ].join(" ")}
      aria-label={t.assistant.panelLabel}
      aria-hidden={!open}
      id="nidhi-assistant-panel"
    >
      <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 lg:hidden" />
      <div className="flex items-start justify-between gap-2 border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-400">
            {t.assistant.title}
          </p>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{t.assistant.subtitle}</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {status?.openaiConfigured ? status.model : t.assistant.localMode}
          </p>
        </div>
        <button
          type="button"
          className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={() => onOpenChange(false)}
          aria-label={t.assistant.collapse}
          title={t.assistant.collapseChat}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12.8 4.2a.75.75 0 0 1 0 1.06L8.06 10l4.74 4.74a.75.75 0 1 1-1.06 1.06l-5.27-5.27a.75.75 0 0 1 0-1.06l5.27-5.27a.75.75 0 0 1 1.06 0Z"
            />
          </svg>
        </button>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5" aria-live="polite">
        {proactiveAlert ? (
          <article className="rounded-2xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100">
            <p className="font-semibold">{proactiveAlert.title}</p>
            <p className="mt-1">{proactiveAlert.detail}</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-teal-400 px-2.5 py-1 text-xs font-semibold"
                onClick={() => void sendChat(proactiveAlert.prompt)}
              >
                {t.common.askNidhi}
              </button>
            </div>
          </article>
        ) : null}
        {messages.map((message) => (
          <article
            key={message.id}
            className={[
              "w-full",
              message.role === "user"
                ? "ml-auto w-auto max-w-[90%] rounded-2xl bg-teal-900 px-5 py-3.5 text-[1.02rem] leading-8 text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] dark:bg-teal-800"
                : "px-0 py-0 text-zinc-800 dark:text-zinc-100",
            ].join(" ")}
          >
            {message.source === "voice" ? (
              <p className="mb-1 text-[10px] uppercase tracking-wide opacity-80">{t.assistant.voiceInput}</p>
            ) : null}
            {message.role === "assistant" ? (
              <AssistantMarkdown
                content={message.id === "welcome" ? t.assistant.welcome : message.content}
              />
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            {message.pendingConfirmation ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3.5 text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/70 dark:text-zinc-100">
                <p className="font-medium">{message.pendingConfirmation.title}</p>
                <p className="mt-1 text-xs">{message.pendingConfirmation.summary}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="nidhi-btn-primary px-3 py-1.5 text-xs"
                    onClick={() => void confirmPending(true)}
                    disabled={busy}
                  >
                    {t.assistant.confirm}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-700"
                    onClick={() => void confirmPending(false)}
                    disabled={busy}
                  >
                    {t.assistant.cancel}
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        ))}
        {busy ? (
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400" aria-label={t.assistant.loading}>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300/80 text-teal-700 dark:border-zinc-700 dark:text-teal-300">
              <IconRobot className="h-4 w-4" />
            </span>
            <span className="sr-only">{t.assistant.typing}</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms] [animation-duration:900ms] dark:bg-teal-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms] [animation-duration:900ms] dark:bg-teal-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms] [animation-duration:900ms] dark:bg-teal-300" />
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[11px] text-zinc-700 hover:bg-teal-50 hover:text-teal-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              onClick={() => void sendChat(suggestion)}
              disabled={busy}
            >
              {suggestion}
            </button>
          ))}
        </div>
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100"
          >
            {error}
          </div>
        ) : null}
        <form
          className="rounded-3xl border border-zinc-300 bg-white p-3 shadow-[0_2px_12px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900"
          onSubmit={(event) => {
            event.preventDefault();
            void sendChat(input, draftSource);
          }}
        >
          <label className="sr-only" htmlFor="nidhi-chat-input">
            {t.assistant.messageLabel}
          </label>
          <textarea
            id="nidhi-chat-input"
            ref={inputRef}
            rows={3}
            value={input}
            disabled={busy || transcribing}
            onChange={(event) => {
              setInput(event.target.value);
              if (!recording) setDraftSource("text");
            }}
            placeholder={t.assistant.placeholder}
            className="min-h-[5.8rem] w-full resize-none border-none bg-transparent px-2 py-1 text-[1.03rem] leading-8 text-zinc-800 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          {voiceStatus ? (
            <p className="px-2 pt-1 text-xs font-medium text-teal-700 dark:text-teal-300" aria-live="polite">
              {voiceStatus}
            </p>
          ) : null}
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className={[
                "grid h-10 w-10 place-items-center rounded-full border text-sm transition-colors",
                recording
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-teal-600 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-400 dark:bg-teal-950/30 dark:text-teal-200",
              ].join(" ")}
              onClick={() => (recording ? stopRecording() : void startRecording())}
              aria-pressed={recording}
              aria-label={recording ? t.assistant.stopVoice : t.assistant.startVoice}
              title={t.assistant.voiceTitle}
              disabled={(busy || transcribing) && !recording}
            >
              {recording ? "■" : "🎤"}
            </button>
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-full bg-zinc-200 text-zinc-600 transition hover:bg-zinc-300 disabled:opacity-60 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              disabled={busy || transcribing || recording || !input.trim()}
              aria-label={t.assistant.send}
            >
              ↑
            </button>
          </div>
        </form>
        <p className="text-[10px] leading-4 text-zinc-500 dark:text-zinc-400">{t.assistant.sensitive}</p>
      </div>
    </aside>
  );
}

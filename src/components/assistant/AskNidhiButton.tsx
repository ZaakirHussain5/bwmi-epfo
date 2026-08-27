"use client";

import { emitNidhiAsk } from "@/lib/events";

export function AskNidhiButton({
  prompt,
  label,
  compact = false,
}: {
  prompt: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "rounded-lg bg-zinc-50 hover:bg-teal-50 hover:text-teal-900 dark:bg-zinc-900/60 dark:hover:bg-teal-950/40 dark:hover:text-teal-100",
        compact
          ? "inline-flex items-center px-2.5 py-1.5 text-xs font-semibold"
          : "w-full px-3 py-2 text-left",
      ].join(" ")}
      onClick={() => emitNidhiAsk(prompt)}
    >
      {label ?? prompt}
    </button>
  );
}

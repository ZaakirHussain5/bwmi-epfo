export function BusyOverlay({ label }: { label: string }) {
  return (
    <div
      className="fixed inset-0 z-[200] grid cursor-wait place-items-center bg-zinc-950/45 backdrop-blur-[2px]"
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 text-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:ring-white/10">
        <span
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-700 dark:border-teal-900 dark:border-t-teal-300"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}

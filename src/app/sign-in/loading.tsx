export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-zinc-100 dark:bg-zinc-950">
      <div
        className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span
          className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-700 dark:border-teal-900 dark:border-t-teal-300"
          aria-hidden="true"
        />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

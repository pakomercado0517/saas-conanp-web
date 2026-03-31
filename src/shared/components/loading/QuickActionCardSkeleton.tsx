export function QuickActionCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <div className="size-12 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

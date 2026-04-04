export function QuickActionCardSkeleton() {
  return (
    <div className="flex min-h-[200px] flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
      <div className="flex gap-4">
        <div className="size-14 shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-full max-w-[14rem] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-full max-w-[12rem] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

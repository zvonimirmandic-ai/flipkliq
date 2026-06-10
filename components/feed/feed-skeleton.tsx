const TAB_WIDTHS = [56, 88, 68, 84, 70, 78];

export function FeedSkeleton() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-brand-bg">
      <div className="shrink-0 overflow-hidden px-4 pt-4">
        <div className="flex gap-2">
          {TAB_WIDTHS.map((width, index) => (
            <div
              key={index}
              className="h-11 shrink-0 animate-pulse rounded-full bg-white/5"
              style={{ width }}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-6">
        <div className="mx-auto h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="mx-auto mt-3 h-7 w-3/4 max-w-xs animate-pulse rounded bg-white/10" />

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:gap-4">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 animate-pulse rounded-2xl border border-white/10 bg-brand-surface" />
            <div className="mx-auto mt-2 h-4 w-20 shrink-0 animate-pulse rounded bg-white/10" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 animate-pulse rounded-2xl border border-white/10 bg-brand-surface" />
            <div className="mx-auto mt-2 h-4 w-20 shrink-0 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

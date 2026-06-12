const TAB_WIDTHS = [44, 72, 56, 70, 58, 64, 84];

export function FeedSkeleton() {
  return (
    <main className="flex-1 bg-brand-bg">
      <div className="overflow-hidden px-4 pt-4">
        <div className="flex gap-2">
          {TAB_WIDTHS.map((width, index) => (
            <div
              key={index}
              className="h-11 shrink-0 animate-pulse rounded-full bg-white/5"
              style={{ width: width + 24 }}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-5 md:max-w-4xl">
        <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-white/10 sm:h-12" />
        <div className="mt-5 flex flex-col gap-4 md:flex-row">
          <div className="aspect-square w-full min-w-0 animate-pulse border border-white/10 bg-brand-surface md:w-1/2" />
          <div className="aspect-square w-full min-w-0 animate-pulse border border-white/10 bg-brand-surface md:w-1/2" />
        </div>
      </div>
    </main>
  );
}

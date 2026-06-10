type EndScreenProps = {
  title?: string;
  message?: string;
};

export function EndScreen({
  title = "All caught up!",
  message = "You've voted on every active poll. Check back soon for more A/B matchups.",
}: EndScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-brand-bg px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-accent">
        FLIPKLIQ
      </p>
      <h1 className="mt-4 text-3xl font-bold text-white">{title}</h1>
      <p className="mt-3 max-w-sm text-white/60">{message}</p>
    </div>
  );
}

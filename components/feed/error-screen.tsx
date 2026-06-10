type ErrorScreenProps = {
  onRetry: () => void;
};

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-accent">
        FLIPKLIQ
      </p>
      <h1 className="mt-4 text-3xl font-bold text-white">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-sm text-white/60">
        We couldn&apos;t load the polls. Check your connection and give it
        another go.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-brand-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-accent/90"
      >
        Try again
      </button>
    </div>
  );
}

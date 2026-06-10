"use client";

type OptionCardProps = {
  imageUrl: string;
  label: string | null;
  fallbackLabel: string;
  percentage: number | null;
  showResults: boolean;
  disabled: boolean;
  onVote: () => void;
};

export function OptionCard({
  imageUrl,
  label,
  fallbackLabel,
  percentage,
  showResults,
  disabled,
  onVote,
}: OptionCardProps) {
  const displayLabel = label || fallbackLabel;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={onVote}
        disabled={disabled}
        className="group flex min-h-0 flex-1 flex-col disabled:cursor-default"
      >
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-brand-surface">
          <div className="aspect-[9/16] h-full w-full md:aspect-auto md:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={displayLabel}
              className="h-full w-full object-cover"
            />
          </div>

          {showResults && percentage !== null ? (
            <div className="absolute inset-0 flex flex-col justify-end bg-black/20">
              <div className="relative h-14 overflow-hidden bg-black/40 sm:h-16">
                <div
                  className="absolute inset-y-0 left-0 bg-brand-accent/85 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center px-4">
                  <span className="text-lg font-bold text-white drop-shadow">
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </button>

      <p className="mt-2 shrink-0 truncate text-center text-sm font-medium text-white/90">
        {displayLabel}
      </p>
    </div>
  );
}

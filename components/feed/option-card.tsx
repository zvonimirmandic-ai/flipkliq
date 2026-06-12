"use client";

type OptionCardProps = {
  imageUrl: string;
  label: string | null;
  fallbackLabel: string;
  percentage: number | null;
  showResults: boolean;
  isWinner: boolean;
  disabled: boolean;
  onVote: () => void;
};

export function OptionCard({
  imageUrl,
  label,
  fallbackLabel,
  percentage,
  showResults,
  isWinner,
  disabled,
  onVote,
}: OptionCardProps) {
  const displayLabel = label || fallbackLabel;

  return (
    <button
      type="button"
      onClick={onVote}
      disabled={disabled}
      className={`group relative aspect-square w-full overflow-hidden border border-white/10 bg-brand-surface text-left disabled:cursor-default ${
        showResults && isWinner ? "ring-2 ring-brand-accent" : ""
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={displayLabel}
          className="h-full w-full object-cover transition-transform duration-500 ease-in-out md:group-hover:scale-110"
        />
      </div>

      {/* Label readability gradient, always visible. */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(transparent,rgba(0,0,0,0.75))]" />

      <span className="absolute bottom-3 left-3 text-base font-semibold text-white drop-shadow">
        {displayLabel}
      </span>

      {showResults && percentage !== null ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
          <span
            className={`text-6xl font-bold drop-shadow-lg ${
              isWinner ? "text-brand-accent" : "text-white"
            }`}
          >
            {percentage}%
          </span>
        </div>
      ) : null}
    </button>
  );
}

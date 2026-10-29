import { cn } from "@/lib/utils";

interface Props {
  count: 5 | 11;
  value: number | null;
  onSelect: (value: number) => void;
  low: string;
  high: string;
}

export const ScaleRow = function ({ count, value, onSelect, low, high }: Props) {
  return (
    <div>
      <div role="radiogroup" className={cn("grid gap-1.5", count === 11 ? "grid-cols-6 sm:grid-cols-11" : "grid-cols-5")}>
        {Array.from({ length: count }).map((_, index) => {
          const score = count === 11 ? index : index + 1;
          const isSelected = value === score;

          return (
            <button
              key={score}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(score)}
              className={cn(
                "h-11 rounded-xl border text-[14px] font-bold tabular-nums transition-colors",
                isSelected ? "border-brand bg-brand text-white" : "border-line bg-white text-foreground hover:border-brand/40 hover:bg-brand-muted/40",
              )}
            >
              {score}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between gap-4 text-[12px] text-foreground-muted">
        <span>{low}</span>
        <span className="text-right">{high}</span>
      </div>
    </div>
  );
};

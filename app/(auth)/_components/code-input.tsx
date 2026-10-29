"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

const LENGTH = 6;

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export const CodeInput = function ({ value, onChange, error, autoFocus }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, index) => value[index] ?? "");

  const focusAt = function (index: number) {
    inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();
  };

  const fillFrom = function (index: number, typed: string) {
    let clean = typed.replace(/\D/g, "");
    if (digits[index] && clean.length === 2) clean = clean.replace(digits[index], "") || clean[0];
    if (!clean) return;
    const next = (value.slice(0, index) + clean).slice(0, LENGTH);
    onChange(next);
    focusAt(next.length);
  };

  const handleKeyDown = function (index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const target = digits[index] ? index : index - 1;
      if (target < 0) return;
      onChange(value.slice(0, target));
      focusAt(target);
    }
    if (event.key === "ArrowLeft") focusAt(index - 1);
    if (event.key === "ArrowRight") focusAt(index + 1);
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={element => {
              inputs.current[index] = element;
            }}
            value={digit}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && index === 0}
            aria-label={`Digit ${index + 1}`}
            aria-invalid={!!error}
            maxLength={LENGTH}
            onFocus={() => focusAt(Math.min(index, value.length))}
            onChange={event => fillFrom(index, event.target.value)}
            onKeyDown={event => handleKeyDown(index, event)}
            onPaste={event => {
              event.preventDefault();
              fillFrom(0, event.clipboardData.getData("text"));
            }}
            className={cn(
              "h-14 w-full min-w-0 rounded-xl border bg-white text-center text-[22px] font-extrabold text-foreground tabular-nums outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand-muted",
              error ? "border-danger" : "border-line",
            )}
          />
        ))}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
};

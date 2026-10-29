"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOLDOWN_SECONDS = 60;

interface Props {
  onResend: () => void;
  isResending?: boolean;
  changeHref?: string;
  changeLabel?: string;
}

export const ResendCode = function ({ onResend, isResending, changeHref, changeLabel = "Change email" }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(current => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleResend = function () {
    onResend();
    setSecondsLeft(COOLDOWN_SECONDS);
  };

  return (
    <div className="mt-3.5 flex items-center justify-between gap-3 text-[13px] text-foreground-muted">
      {secondsLeft > 0 ? (
        <span>
          Didn&apos;t get it? Resend in <b className="font-semibold text-foreground tabular-nums">{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</b>
        </span>
      ) : (
        <button type="button" onClick={handleResend} disabled={isResending} className="font-semibold text-brand hover:underline disabled:opacity-50">
          {isResending ? "Sending…" : "Resend code"}
        </button>
      )}
      {changeHref && (
        <Link href={changeHref} className="font-semibold text-brand hover:underline">
          {changeLabel}
        </Link>
      )}
    </div>
  );
};

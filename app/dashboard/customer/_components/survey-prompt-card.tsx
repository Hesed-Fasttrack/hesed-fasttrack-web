"use client";

import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import { ArrowRight, Clock, MessageSquareHeart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SNOOZE_KEY = "survey-prompt-snoozed-until";
const SNOOZE_DAYS = 7;

export const SurveyPromptCard = function () {
  const [isSnoozed, setIsSnoozed] = useState(true);

  const { data } = useGetData<APIResponse<{ submitted: boolean }>>({ url: API_ENDPOINTS.customer.survey.status });
  const submitted = data?.data?.submitted;

  // localStorage is unavailable during SSR, so snooze state resolves in an effect.
  useEffect(() => {
    const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
    setIsSnoozed(until > Date.now());
  }, []);

  const handleDismiss = function () {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
    setIsSnoozed(true);
  };

  if (submitted !== false || isSnoozed) return null;

  return (
    <section className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:p-5.5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
        <MessageSquareHeart className="size-5 text-brand" />
      </span>

      <div className="min-w-0 flex-1 pr-10 sm:pr-0">
        <p className="text-[15px] font-bold tracking-tight text-foreground">How are we doing?</p>
        <p className="mt-0.5 text-[13px] text-foreground-muted">Tell us about your experience so far. Your feedback shapes what we build next.</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-[11.5px] font-semibold text-foreground-muted ring-1 ring-line">
          <Clock className="size-3" />
          Six questions, about 2 minutes
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild className="h-10 flex-1 rounded-xl px-4.5 sm:flex-none">
          <Link href="/dashboard/customer/survey">
            Take the survey
            <ArrowRight />
          </Link>
        </Button>
        <Button variant="outline" onClick={handleDismiss} className="hidden h-10 rounded-xl px-4 sm:inline-flex">
          Later
        </Button>
      </div>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
        className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg border border-line text-foreground-muted transition-colors hover:border-line-strong hover:text-foreground sm:hidden"
      >
        <X className="size-4" />
      </button>
    </section>
  );
};

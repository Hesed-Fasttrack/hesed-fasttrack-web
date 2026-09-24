"use client";

import { Button } from "@/components/ui/button";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import type { APIResponse } from "@/types/response";
import { MessageSquareHeart, X } from "lucide-react";
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
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-brand/30 bg-brand-muted/30 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted">
        <MessageSquareHeart className="h-5 w-5 text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">How are we doing?</p>
        <p className="text-xs text-muted-foreground">Take our 2-minute survey — your feedback shapes what we build next.</p>
      </div>
      <div className="flex items-center gap-1">
        <Button asChild size="sm">
          <Link href="/dashboard/customer/survey">Take the survey</Link>
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label="Dismiss" onClick={handleDismiss}>
          <X />
        </Button>
      </div>
    </div>
  );
};

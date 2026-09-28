"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { cn } from "@/lib/utils";
import { SURVEY_FREQUENCIES, type SurveyFrequency } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const RATING_QUESTIONS = [
  { key: "satisfaction", question: "How satisfied are you with HESED FastTrack overall?", low: "Very dissatisfied", high: "Very satisfied" },
  { key: "booking_ease", question: "How easy was it to book your shipment?", low: "Very difficult", high: "Very easy" },
  { key: "delivery", question: "How satisfied are you with our delivery speed and handling?", low: "Very dissatisfied", high: "Very satisfied" },
] as const;

type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

const ScaleRow = function ({ count, value, onSelect, low, high }: { count: number; value: number | null; onSelect: (value: number) => void; low: string; high: string }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: count }).map((_, index) => {
          const score = count === 11 ? index : index + 1;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onSelect(score)}
              className={cn("flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors", value === score ? "border-brand bg-brand text-white" : "border-line text-foreground hover:bg-muted")}
            >
              {score}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
};

export default function SurveyPage() {
  const [ratings, setRatings] = useState<Record<RatingKey, number | null>>({ satisfaction: null, booking_ease: null, delivery: null });
  const [nps, setNps] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<SurveyFrequency | null>(null);
  const [improvements, setImprovements] = useState("");
  const [isDone, setIsDone] = useState(false);

  const { data: statusData, isFetching } = useGetData<APIResponse<{ submitted: boolean }>>({ url: API_ENDPOINTS.customer.survey.status });
  const alreadySubmitted = statusData?.data?.submitted;

  const { mutate: submitSurvey, isPending } = useSubmitData<Record<string, unknown>, unknown>({
    url: API_ENDPOINTS.customer.survey.submit,
    onSuccessMessage: "Thank you for your feedback!",
    additionalQueryKeys: [[API_ENDPOINTS.customer.survey.status]],
    onSuccess: () => setIsDone(true),
  });

  const handleSubmit = function () {
    for (const entry of RATING_QUESTIONS) {
      if (ratings[entry.key] === null) return showToast("warning", `Please answer: ${entry.question}`);
    }
    if (nps === null) return showToast("warning", "How likely are you to recommend us?");
    if (!frequency) return showToast("warning", "How often do you ship?");

    submitSurvey({ ...ratings, nps, frequency, improvements: improvements.trim() || undefined });
  };

  if (isFetching && alreadySubmitted === undefined) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (alreadySubmitted || isDone) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-line bg-white px-6 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h2 className="mt-4 text-xl font-bold text-foreground">Thank you for your feedback!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">Your answers help us make HESED FastTrack better for everyone. We read every single response.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/customer">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Help us serve you better" description="Two minutes, six questions. Your feedback goes straight to the team." />

      <div className="space-y-5">
        {RATING_QUESTIONS.map(entry => (
          <div key={entry.key} className="rounded-2xl border border-line bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">{entry.question}</p>
            <ScaleRow count={5} value={ratings[entry.key]} onSelect={value => setRatings(current => ({ ...current, [entry.key]: value }))} low={entry.low} high={entry.high} />
          </div>
        ))}

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">How likely are you to recommend HESED FastTrack to a friend or business partner?</p>
          <ScaleRow count={11} value={nps} onSelect={setNps} low="Not at all likely" high="Extremely likely" />
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">How often do you ship?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {SURVEY_FREQUENCIES.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFrequency(option.value)}
                className={cn("rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors", frequency === option.value ? "border-brand bg-brand-muted text-foreground" : "border-line text-foreground hover:bg-muted")}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">What could we do better? (optional)</p>
          <Textarea placeholder="Tell us anything: pricing, speed, the app, support…" value={improvements} onChange={event => setImprovements(event.target.value)} maxLength={1000} rows={4} />
        </div>

        <Button size="lg" className="w-full sm:w-auto sm:px-10" onClick={handleSubmit} disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Submit feedback
        </Button>
      </div>
    </div>
  );
}

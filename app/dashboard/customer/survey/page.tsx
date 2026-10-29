"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { cn } from "@/lib/utils";
import { SURVEY_FREQUENCIES, type SurveyFrequency } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Clock, Loader2, MessageSquareHeart, Send } from "lucide-react";
import { useState } from "react";
import { ScaleRow } from "./_components/scale-row";
import { SurveyQuestion } from "./_components/survey-question";
import { SurveyThanks } from "./_components/survey-thanks";

const RATING_QUESTIONS = [
  { key: "satisfaction", question: "How satisfied are you with HESED FastTrack overall?", low: "Very dissatisfied", high: "Very satisfied" },
  { key: "booking_ease", question: "How easy was it to book your shipment?", low: "Very difficult", high: "Very easy" },
  { key: "delivery", question: "How satisfied are you with our delivery speed and handling?", low: "Very dissatisfied", high: "Very satisfied" },
] as const;

type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

const REQUIRED_COUNT = RATING_QUESTIONS.length + 2;
const IMPROVEMENTS_LIMIT = 1000;

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

  const answered = Object.values(ratings).filter(value => value !== null).length + (nps !== null ? 1 : 0) + (frequency ? 1 : 0);
  const isComplete = answered === REQUIRED_COUNT;

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
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-130 rounded-2xl" />
      </div>
    );
  }

  if (alreadySubmitted || isDone) return <SurveyThanks />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Customer survey" title="Help us serve you better" description="Six quick questions. Your answers go straight to the HESED FastTrack team." />

      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-5 py-4.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] bg-brand-muted">
              <MessageSquareHeart className="size-4.5 text-brand" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold tracking-tight text-foreground">Your feedback</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-foreground-muted">
                <Clock className="size-3.5" />
                About 2 minutes
              </p>
            </div>
            <p className="shrink-0 text-[12.5px] font-semibold text-foreground-muted tabular-nums">
              <span className="text-foreground">{answered}</span> of {REQUIRED_COUNT} answered
            </p>
          </div>
          <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(answered / REQUIRED_COUNT) * 100}%` }} />
          </div>
        </div>

        <div className="divide-y divide-line">
          {RATING_QUESTIONS.map((entry, index) => (
            <SurveyQuestion key={entry.key} number={index + 1} question={entry.question} isAnswered={ratings[entry.key] !== null}>
              <ScaleRow count={5} value={ratings[entry.key]} onSelect={value => setRatings(current => ({ ...current, [entry.key]: value }))} low={entry.low} high={entry.high} />
            </SurveyQuestion>
          ))}

          <SurveyQuestion number={4} question="How likely are you to recommend HESED FastTrack to a friend or business partner?" isAnswered={nps !== null}>
            <ScaleRow count={11} value={nps} onSelect={setNps} low="Not at all likely" high="Extremely likely" />
          </SurveyQuestion>

          <SurveyQuestion number={5} question="How often do you ship?" isAnswered={!!frequency}>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {SURVEY_FREQUENCIES.map(option => {
                const isSelected = frequency === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setFrequency(option.value)}
                    className={cn("flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[13.5px] font-semibold transition-colors", isSelected ? "border-brand bg-brand-muted/50 text-foreground" : "border-line bg-white text-foreground hover:border-line-strong")}
                  >
                    <span className={cn("flex size-4.5 shrink-0 items-center justify-center rounded-full border-2", isSelected ? "border-brand" : "border-line-strong")}>
                      {isSelected && <span className="size-2 rounded-full bg-brand" />}
                    </span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </SurveyQuestion>

          <SurveyQuestion number={6} question="What could we do better?" hint="Optional. Pricing, speed, the app, support: anything goes.">
            <textarea
              value={improvements}
              onChange={event => setImprovements(event.target.value)}
              maxLength={IMPROVEMENTS_LIMIT}
              rows={4}
              placeholder="Tell us what would make shipping with us better"
              className="w-full resize-none rounded-xl border border-line bg-canvas px-3.5 py-3 text-[13.5px] text-foreground outline-none placeholder:text-foreground-subtle focus:border-brand focus:bg-white focus:ring-3 focus:ring-brand-muted"
            />
            <p className="mt-1.5 text-right text-[11.5px] text-foreground-muted tabular-nums">
              {improvements.length} / {IMPROVEMENTS_LIMIT}
            </p>
          </SurveyQuestion>
        </div>

        <div className="flex flex-col gap-3 border-t border-line bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[12.5px] text-foreground-muted">{isComplete ? "All set. Thanks for taking the time." : `${REQUIRED_COUNT - answered} more to go. Question 6 is optional.`}</p>
          <Button className="h-10 rounded-xl px-5" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            Submit feedback
          </Button>
        </div>
      </section>
    </div>
  );
}

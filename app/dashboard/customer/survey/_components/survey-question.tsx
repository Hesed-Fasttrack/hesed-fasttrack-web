import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  number: number;
  question: string;
  hint?: string;
  isAnswered?: boolean;
  children: React.ReactNode;
}

export const SurveyQuestion = function ({ number, question, hint, isAnswered, children }: Props) {
  return (
    <div className="flex gap-3.5 px-5 py-5.5 sm:px-6">
      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors", isAnswered ? "bg-brand text-white" : "bg-brand-muted text-brand")}>
        {isAnswered ? <Check className="size-3.5" strokeWidth={3} /> : number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="pt-0.5 text-[14.5px] leading-snug font-bold tracking-tight text-foreground">{question}</p>
        {hint && <p className="mt-0.5 text-[12.5px] text-foreground-muted">{hint}</p>}
        <div className="mt-3.5">{children}</div>
      </div>
    </div>
  );
};

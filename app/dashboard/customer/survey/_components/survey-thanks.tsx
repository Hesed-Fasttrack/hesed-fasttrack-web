import { Button } from "@/components/ui/button";
import { ArrowRight, HeartHandshake } from "lucide-react";
import Link from "next/link";

export const SurveyThanks = function () {
  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-col items-center px-6 pt-14 pb-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald/10">
          <HeartHandshake className="size-7 text-emerald" />
        </span>
        <h2 className="mt-5 text-[22px] font-extrabold tracking-tight text-foreground">Thank you for your feedback</h2>
        <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-foreground-muted">Your answers help us make HESED FastTrack better for everyone. The team reads every single response.</p>
      </div>
      <div className="flex flex-col gap-2.5 border-t border-line bg-canvas px-6 py-4 sm:flex-row sm:justify-center">
        <Button asChild variant="outline" className="h-10 rounded-xl bg-white px-5">
          <Link href="/dashboard/customer/shipments">View my shipments</Link>
        </Button>
        <Button asChild className="h-10 rounded-xl px-5">
          <Link href="/dashboard/customer">
            Back to dashboard
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
};

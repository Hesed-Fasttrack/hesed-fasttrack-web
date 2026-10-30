"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import type { CustomerDashboardSummary, PaymentAccount } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { ArrowRight, Copy } from "lucide-react";
import Link from "next/link";

export const PaymentInfoCard = function ({ summary }: { summary: CustomerDashboardSummary | undefined }) {
  const { data } = useGetData<APIResponse<PaymentAccount>>({ url: API_ENDPOINTS.customer.payments.account, staleTime: 60 * 60 * 1000 });
  const account = data?.data;

  if (!summary) return <Skeleton className="h-90 rounded-2xl" />;

  const due = summary.awaiting_payment;

  const handleCopy = function () {
    if (!account) return;
    navigator.clipboard.writeText(account.account_number);
    showToast("success", "Account number copied");
  };

  return (
    <section className="relative flex flex-col overflow-hidden rounded-2xl bg-brand-ink p-5.5 text-white">
      <span aria-hidden className="pointer-events-none absolute -top-15 -right-15 size-55 rounded-full border-36 border-white/4" />

      <p className="text-[13px] font-medium text-[#cdbbe2]">Shipments to pay</p>
      <p className="mt-2.5 text-[34px] leading-tight font-extrabold tracking-tight tabular-nums">{due}</p>
      <p className="mt-0.5 text-[12.5px] text-[#cdbbe2]">{due > 0 ? "Open each one to see the amount and upload your receipt" : "You're all paid up"}</p>

      <div className="mt-auto pt-6">
        {account ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/7 p-3.5">
            <div className="min-w-0">
              <p className="truncate text-[11.5px] text-[#cdbbe2]">Pay by transfer · {account.bank_name}</p>
              <p className="mt-0.5 font-bold tracking-wider tabular-nums">{account.account_number}</p>
              <p className="truncate text-[11.5px] text-[#cdbbe2]">{account.account_name}</p>
            </div>
            <Button size="sm" onClick={handleCopy} className="shrink-0 rounded-lg border border-white/20 bg-white/12 text-white hover:bg-white/20">
              <Copy />
              Copy
            </Button>
          </div>
        ) : (
          <Skeleton className="h-19 rounded-xl bg-white/10" />
        )}

        <p className="mt-3 text-[12px] leading-relaxed text-[#cdbbe2]">Use the shipment reference as your narration, then upload the receipt on the shipment page.</p>

        <Button asChild className="mt-3.5 h-10 w-full rounded-xl bg-white text-brand-dark hover:bg-white/90">
          <Link href="/dashboard/customer/shipments">
            View shipments
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
};

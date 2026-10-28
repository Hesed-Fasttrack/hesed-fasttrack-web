"use client";

import { FundingDialog } from "@/components/shared/funding-dialog";
import { WithdrawDialog } from "@/components/shared/withdraw-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import type { Wallet } from "@/types/customer";
import { ArrowUpRight, Copy, Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";

export const WalletCard = function ({ wallet }: { wallet: Wallet | undefined }) {
  const [isHidden, setIsHidden] = useState(false);
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (!wallet) return <Skeleton className="h-90 rounded-2xl" />;

  const [whole, fraction] = formatNaira(wallet.available_minor).replace("₦", "").split(".");

  const handleCopy = function () {
    if (!wallet.dva_account_number) return;
    navigator.clipboard.writeText(wallet.dva_account_number);
    showToast("success", "Account number copied");
  };

  return (
    <section className="relative flex flex-col overflow-hidden rounded-2xl bg-brand-ink p-5.5 text-white">
      <span aria-hidden className="pointer-events-none absolute -top-15 -right-15 size-55 rounded-full border-36 border-white/4" />

      <div className="flex items-center justify-between text-[13px] font-medium text-[#cdbbe2]">
        <span>Wallet balance</span>
        <button type="button" onClick={() => setIsHidden(current => !current)} aria-label={isHidden ? "Show balance" : "Hide balance"} className="transition-colors hover:text-white">
          {isHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      <p className="mt-2.5 text-[34px] leading-tight font-extrabold tracking-tight tabular-nums">
        <span className="text-xl font-bold text-[#cdbbe2]">₦</span>
        {isHidden ? "••••••" : whole}
        {!isHidden && <span className="text-xl font-bold text-[#cdbbe2]">.{(fraction ?? "00").padEnd(2, "0")}</span>}
      </p>
      <p className="mt-0.5 text-[12.5px] text-[#cdbbe2]">Available for bookings and withdrawals</p>

      <div className="mt-auto pt-6">
        {wallet.dva_account_number ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/7 p-3.5">
            <div className="min-w-0">
              <p className="truncate text-[11.5px] text-[#cdbbe2]">Fund by transfer · {wallet.dva_bank_name}</p>
              <p className="mt-0.5 font-bold tracking-wider tabular-nums">{wallet.dva_account_number}</p>
            </div>
            <Button size="sm" onClick={handleCopy} className="shrink-0 rounded-lg border border-white/20 bg-white/12 text-white hover:bg-white/20">
              <Copy />
              Copy
            </Button>
          </div>
        ) : (
          <button type="button" onClick={() => setIsFundingOpen(true)} className="w-full rounded-xl border border-dashed border-white/25 p-3.5 text-left text-[13px] text-[#cdbbe2] transition-colors hover:border-white/40 hover:text-white">
            Get your personal account number to fund by bank transfer
          </button>
        )}

        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <Button onClick={() => setIsFundingOpen(true)} className="h-10 rounded-xl bg-white text-brand-dark hover:bg-white/90">
            <Plus />
            Fund
          </Button>
          <Button onClick={() => setIsWithdrawOpen(true)} className="h-10 rounded-xl border border-white/20 bg-white/12 text-white hover:bg-white/20">
            <ArrowUpRight />
            Withdraw
          </Button>
        </div>
      </div>

      <FundingDialog wallet={wallet} open={isFundingOpen} onClose={() => setIsFundingOpen(false)} />
      <WithdrawDialog open={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
    </section>
  );
};

"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import type { FundingAccount, Wallet } from "@/types/customer";
import { Copy, Loader2, Wallet as WalletIcon } from "lucide-react";
import { useEffect } from "react";

interface Props {
  wallet: Wallet | undefined;
  open: boolean;
  onClose: () => void;
}

export const FundingDialog = function ({ wallet, open, onClose }: Props) {
  const hasAccount = !!wallet?.dva_account_number;

  const { mutate: createAccount, isPending } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.customer.wallet.fundingAccount,
    silent: true,
    additionalQueryKeys: [[API_ENDPOINTS.customer.wallet.balance]],
  });

  // On every open: creates the account on first use and swaps in a fresh one
  // when the payment gateway changed — the server decides, not the client.
  useEffect(() => {
    if (open) createAccount({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { mutate: syncFunding, isPending: isSyncing } = useSubmitData<Record<string, never>, { data: { credited: number } }>({
    url: API_ENDPOINTS.customer.wallet.sync,
    silent: true,
    additionalQueryKeys: [[API_ENDPOINTS.customer.wallet.balance], [API_ENDPOINTS.customer.wallet.transactions]],
    onSuccess: response => {
      const credited = response?.data?.credited ?? 0;
      if (credited > 0) showToast("success", "Your wallet has been credited");
      else showToast("warning", "Nothing new yet. Transfers usually land within a minute. Try again shortly.");
    },
  });

  const handleCopy = function (accountNumber: string) {
    navigator.clipboard.writeText(accountNumber);
    showToast("success", "Account number copied");
  };

  // Older wallets carry a single account; regenerated ones list every bank
  // the gateway issued — all of them credit the same wallet.
  const accounts: FundingAccount[] = wallet?.dva_accounts?.length
    ? wallet.dva_accounts
    : wallet?.dva_account_number
      ? [{ bank_name: wallet.dva_bank_name ?? "", account_number: wallet.dva_account_number, account_name: wallet.dva_account_name ?? "" }]
      : [];

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title="Fund your wallet"
      icon={WalletIcon}
      description={
        hasAccount
          ? accounts.length > 1
            ? "Transfer any amount to whichever account you prefer. They all land in your wallet automatically, usually within a minute."
            : "Transfer any amount to your personal account number below. It lands in your wallet automatically, usually within a minute."
          : "We'll create your personal funding account. Transfers to it credit your wallet automatically."
      }
      dialogFooter={
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      }
    >
      {hasAccount ? (
        <div className="space-y-3">
          <div className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-brand-ink text-white">
            {accounts.map(account => (
              <div key={account.account_number} className="px-4.5 py-4">
                <p className="text-[12px] text-[#cdbbe2]">{account.bank_name}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-[24px] font-extrabold tracking-[0.04em] tabular-nums">{account.account_number}</p>
                  <Button size="sm" onClick={() => handleCopy(account.account_number)} className="shrink-0 rounded-lg border border-white/20 bg-white/12 text-white hover:bg-white/20">
                    <Copy />
                    Copy
                  </Button>
                </div>
                <p className="mt-0.5 text-[13px] text-[#cdbbe2]">{account.account_name}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="h-10 w-full rounded-xl" onClick={() => syncFunding({})} disabled={isSyncing}>
            {isSyncing && <Loader2 className="animate-spin" />}
            I've sent the money, check for it
          </Button>
        </div>
      ) : (
        <Button onClick={() => createAccount({})} disabled={isPending} className="h-10 w-full rounded-xl">
          {isPending && <Loader2 className="animate-spin" />}
          Create my funding account
        </Button>
      )}
    </AppDialog>
  );
};

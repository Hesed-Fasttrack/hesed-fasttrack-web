"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import type { Wallet } from "@/types/customer";
import { Copy, Loader2 } from "lucide-react";

interface Props {
  wallet: Wallet | undefined;
  open: boolean;
  onClose: () => void;
}

export const FundingDialog = function ({ wallet, open, onClose }: Props) {
  const hasAccount = !!wallet?.dva_account_number;

  const { mutate: createAccount, isPending } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.customer.wallet.fundingAccount,
    onSuccessMessage: "Funding account ready",
    additionalQueryKeys: [[API_ENDPOINTS.customer.wallet.balance]],
  });

  const { mutate: syncFunding, isPending: isSyncing } = useSubmitData<Record<string, never>, { data: { credited: number } }>({
    url: API_ENDPOINTS.customer.wallet.sync,
    silent: true,
    additionalQueryKeys: [[API_ENDPOINTS.customer.wallet.balance], [API_ENDPOINTS.customer.wallet.transactions]],
    onSuccess: response => {
      const credited = response?.data?.credited ?? 0;
      if (credited > 0) showToast("success", "Your wallet has been credited");
      else showToast("warning", "Nothing new yet — transfers usually land within a minute. Try again shortly.");
    },
  });

  const handleCopy = function () {
    if (!wallet?.dva_account_number) return;
    navigator.clipboard.writeText(wallet.dva_account_number);
    showToast("success", "Account number copied");
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title="Fund your wallet"
      description={
        hasAccount ? "Transfer any amount to your personal account number below — it lands in your wallet automatically, usually within a minute." : "We'll create your personal funding account — transfers to it credit your wallet automatically."
      }
      dialogFooter={
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      }
    >
      {hasAccount ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-canvas p-4">
            <p className="text-xs text-muted-foreground">{wallet?.dva_bank_name}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-2xl font-bold tracking-wide text-foreground">{wallet?.dva_account_number}</p>
              <Button size="icon" variant="outline" onClick={handleCopy} aria-label="Copy account number">
                <Copy />
              </Button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{wallet?.dva_account_name}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => syncFunding({})} disabled={isSyncing}>
            {isSyncing && <Loader2 className="animate-spin" />}
            I've sent the money — check for it
          </Button>
        </div>
      ) : (
        <Button onClick={() => createAccount({})} disabled={isPending} className="w-full">
          {isPending && <Loader2 className="animate-spin" />}
          Create my funding account
        </Button>
      )}
    </AppDialog>
  );
};

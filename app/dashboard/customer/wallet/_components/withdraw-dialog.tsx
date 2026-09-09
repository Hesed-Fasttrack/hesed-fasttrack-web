"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import type { Bank } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const WithdrawDialog = function ({ open, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const debouncedAccountNumber = useDebounce(accountNumber, 500);

  const { data: banksData } = useGetData<APIResponse<Bank[]>>({ url: API_ENDPOINTS.customer.wallet.banks, shouldFetch: open });
  const banks = banksData?.data ?? [];

  const { mutate: resolveAccount, isPending: isResolving } = useSubmitData<{ bank_code: string; account_number: string }, APIResponse<{ account_name: string }>>({
    url: API_ENDPOINTS.customer.wallet.resolveAccount,
    onSuccessMessage: "Account verified",
    onSuccess: response => setAccountName(response.data.account_name),
  });

  useEffect(() => {
    setAccountName("");
    if (bankCode && /^\d{10}$/.test(debouncedAccountNumber)) {
      resolveAccount({ bank_code: bankCode, account_number: debouncedAccountNumber });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode, debouncedAccountNumber]);

  const { mutate: requestWithdrawal, isPending: isWithdrawing } = useSubmitData<{ bank_code: string; account_number: string; amount_minor: number }, unknown>({
    url: API_ENDPOINTS.customer.wallet.withdrawals,
    onSuccessMessage: "Withdrawal requested — we'll process it shortly",
    additionalQueryKeys: [[API_ENDPOINTS.customer.wallet.balance], [API_ENDPOINTS.customer.wallet.transactions], [API_ENDPOINTS.customer.wallet.withdrawals]],
    onSuccess: () => {
      setAmount("");
      setBankCode("");
      setAccountNumber("");
      setAccountName("");
      onClose();
    },
  });

  const handleSubmit = function () {
    const amountNaira = Number(amount);
    if (!amountNaira || amountNaira < 500) return showToast("warning", "The minimum withdrawal is ₦500");
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) return showToast("warning", "Pick a bank and enter a 10-digit account number");
    if (!accountName) return showToast("warning", "Wait for the account name to verify first");

    requestWithdrawal({ bank_code: bankCode, account_number: accountNumber, amount_minor: Math.round(amountNaira * 100) });
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      title="Withdraw to bank"
      description="Funds leave your wallet immediately and arrive once the transfer is processed."
      isSubmitting={isWithdrawing}
      dialogFooter={
        <>
          <Button variant="outline" onClick={onClose} disabled={isWithdrawing}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isWithdrawing || !accountName}>
            {isWithdrawing && <Loader2 className="animate-spin" />}
            Withdraw
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <AppInput label="Amount (₦)" type="number" min={500} placeholder="5000" value={amount} onChange={event => setAmount(event.target.value)} />

        <div className="flex flex-col gap-1.5">
          <Label>Bank</Label>
          <Select value={bankCode} onValueChange={setBankCode}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Choose your bank" />
            </SelectTrigger>
            <SelectContent>
              {banks.map(bank => (
                <SelectItem key={`${bank.code}-${bank.name}`} value={bank.code}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AppInput label="Account number" inputMode="numeric" maxLength={10} placeholder="0123456789" value={accountNumber} onChange={event => setAccountNumber(event.target.value.replace(/\D/g, ""))} />

        {isResolving ? <p className="text-sm text-muted-foreground">Verifying account…</p> : accountName ? <p className="rounded-lg bg-emerald/10 px-3 py-2 text-sm font-medium text-emerald">{accountName}</p> : null}
      </div>
    </AppDialog>
  );
};

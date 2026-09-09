"use client";

import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const adjustmentSchema = z.object({
  direction: z.enum(["CREDIT", "DEBIT"]),
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
  narration: z.string().trim().min(5, "A narration is required for the audit trail").max(200),
});

type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export const WalletAdjustDialog = function ({ userId, open, onClose }: Props) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { direction: "CREDIT" },
  });

  const direction = watch("direction");

  const { mutate: adjust, isPending } = useSubmitData<{ direction: string; amount_minor: number; narration: string }, unknown>({
    url: API_ENDPOINTS.admin.users.walletAdjust(userId),
    onSuccessMessage: "Wallet adjusted",
    additionalQueryKeys: [[API_ENDPOINTS.admin.users.detail(userId)], [API_ENDPOINTS.admin.users.walletTransactions(userId)]],
    onSuccess: () => {
      reset({ direction: "CREDIT" });
      onClose();
    },
  });

  const onSubmit = function (data: AdjustmentFormValues) {
    adjust({ direction, amount_minor: Math.round(data.amount * 100), narration: data.narration });
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust wallet</DialogTitle>
          <DialogDescription>Manual ledger entry — every adjustment is audited and notifies the customer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select value={direction} onValueChange={value => setValue("direction", value as "CREDIT" | "DEBIT")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREDIT">Credit — add funds</SelectItem>
              <SelectItem value="DEBIT">Debit — remove funds</SelectItem>
            </SelectContent>
          </Select>

          <FormInput control={control} name="amount" errors={errors} label="Amount (₦)" type="number" step="0.01" placeholder="5000" />
          <FormInput control={control} name="narration" errors={errors} label="Narration" placeholder="Why this adjustment is happening" />

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {direction === "CREDIT" ? "Credit wallet" : "Debit wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

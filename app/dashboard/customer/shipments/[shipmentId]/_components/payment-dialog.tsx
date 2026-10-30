"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatNaira } from "@/lib/format";
import { showToast } from "@/lib/show-toast";
import { cn } from "@/lib/utils";
import type { CustomerShipment, PaymentAccount } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { Copy, FileCheck2, Landmark, Loader2, Upload } from "lucide-react";
import { useState } from "react";

const MAX_PROOF_BYTES = 10 * 1024 * 1024;

const copy = function (label: string, value: string) {
  navigator.clipboard.writeText(value);
  showToast("success", `${label} copied`);
};

const DetailRow = function ({ label, value, copyLabel, large }: { label: string; value: string; copyLabel?: string; large?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4.5 py-3">
      <div className="min-w-0">
        <p className="text-[12px] text-[#cdbbe2]">{label}</p>
        <p className={cn("truncate font-bold tabular-nums", large ? "text-[22px] tracking-[0.04em]" : "text-[15px]")}>{value}</p>
      </div>
      {copyLabel && (
        <Button size="sm" onClick={() => copy(copyLabel, value)} className="shrink-0 rounded-lg border border-white/20 bg-white/12 text-white hover:bg-white/20">
          <Copy />
          Copy
        </Button>
      )}
    </div>
  );
};

interface Props {
  shipment: CustomerShipment;
  open: boolean;
  onClose: () => void;
}

export const PaymentDialog = function ({ shipment, open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [payerName, setPayerName] = useState("");

  const { data, isFetching } = useGetData<APIResponse<PaymentAccount>>({ url: API_ENDPOINTS.customer.payments.account, shouldFetch: open });
  const account = data?.data;

  const handleClose = function () {
    setFile(null);
    setPayerName("");
    onClose();
  };

  const { mutate: submitProof, isPending } = useSubmitData<FormData, unknown>({
    url: API_ENDPOINTS.customer.shipments.paymentProof(shipment.id),
    onSuccessMessage: "Receipt sent. We'll confirm your payment shortly",
    onSuccess: handleClose,
  });

  const handlePick = function (picked: File | null) {
    if (picked && picked.size > MAX_PROOF_BYTES) {
      showToast("error", "The receipt must be 10 MB or smaller");
      return;
    }
    setFile(picked);
  };

  const handleSubmit = function () {
    if (!file) return;
    const formData = new FormData();
    formData.append("proof", file);
    if (payerName.trim()) formData.append("payer_name", payerName.trim());
    submitProof(formData);
  };

  return (
    <AppDialog
      isOpen={open}
      onOpenChange={isOpen => !isOpen && handleClose()}
      title="Pay by bank transfer"
      icon={Landmark}
      description={`Transfer exactly ${formatNaira(shipment.amount_minor)} to the account below, using your shipment reference as the narration. Then upload the receipt and we'll confirm it.`}
      isSubmitting={isPending}
      dialogFooter={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Submit receipt
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {isFetching && !account ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : account ? (
          <div className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-brand-ink text-white">
            <DetailRow label="Amount" value={formatNaira(shipment.amount_minor)} />
            <DetailRow label={account.bank_name} value={account.account_number} copyLabel="Account number" large />
            <DetailRow label="Account name" value={account.account_name} />
            <DetailRow label="Narration" value={shipment.reference} copyLabel="Reference" />
          </div>
        ) : (
          <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger">We couldn&apos;t load our bank details. Please try again or contact support.</p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Transfer receipt</Label>
          <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 transition-colors", file ? "border-brand/50 bg-brand-muted/40" : "border-line-strong bg-canvas hover:border-brand/50")}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-brand">{file ? <FileCheck2 className="size-4.5" /> : <Upload className="size-4.5" />}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{file ? file.name : "Choose a screenshot or PDF"}</p>
              <p className="text-xs text-foreground-muted">The bank&apos;s confirmation showing the amount and date. 10 MB max.</p>
            </div>
            <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={event => handlePick(event.target.files?.[0] ?? null)} />
          </label>
        </div>

        <AppInput label="Name on the paying account (optional)" placeholder="If it's different from yours" value={payerName} onChange={event => setPayerName(event.target.value)} maxLength={120} />
      </div>
    </AppDialog>
  );
};

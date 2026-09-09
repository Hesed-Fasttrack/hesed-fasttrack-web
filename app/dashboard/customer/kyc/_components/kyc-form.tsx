"use client";

import { AppInput } from "@/components/shared/app-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { KYC_STATUS } from "@/lib/statuses";
import type { CustomerKycSubmission, KycIdentityType } from "@/types/customer";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

const IDENTITY_OPTIONS: { value: KycIdentityType; label: string }[] = [
  { value: "NIN", label: "National Identification Number (NIN)" },
  { value: "DRIVERS_LICENCE", label: "Driver's licence" },
  { value: "INTL_PASSPORT", label: "International passport" },
];

const FileField = function ({ label, hint, file, onChange }: { label: string; hint: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line-strong bg-canvas px-4 py-4 hover:bg-muted">
        <Upload className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{file ? file.name : "Choose an image"}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <input type="file" accept="image/*" className="sr-only" onChange={event => onChange(event.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
};

interface Props {
  submission: CustomerKycSubmission | null;
}

export const KycForm = function ({ submission }: Props) {
  // resubmission touches only the rejected documents
  const needsIdentity = !submission || submission.identity_status === "REJECTED";
  const needsAddress = !submission || submission.address_status === "REJECTED";

  const [identityType, setIdentityType] = useState<KycIdentityType>(submission?.identity_type ?? "NIN");
  const [identityNumber, setIdentityNumber] = useState(submission?.identity_number ?? "");
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);

  const { mutate: submitKyc, isPending } = useSubmitData<FormData, unknown>({
    url: API_ENDPOINTS.customer.kyc.submit,
    onSuccessMessage: "Documents submitted — we'll review them shortly",
    additionalQueryKeys: [[API_ENDPOINTS.customer.kyc.status]],
  });

  const handleSubmit = function () {
    if (needsIdentity) {
      if (identityType === "NIN" && !/^\d{11}$/.test(identityNumber)) return showToast("warning", "A NIN is exactly 11 digits");
      if (identityNumber.trim().length < 4) return showToast("warning", "Enter a valid ID number");
      if (!identityFile) return showToast("warning", "Add a photo of your identity document");
    }
    if (needsAddress && !addressFile) return showToast("warning", "Add your proof of address");

    const formData = new FormData();
    formData.append("identity_type", identityType);
    formData.append("identity_number", identityNumber.trim());
    if (identityFile) formData.append("identity_document", identityFile);
    if (addressFile) formData.append("address_proof", addressFile);

    submitKyc(formData);
  };

  return (
    <div className="max-w-xl space-y-5 rounded-2xl border border-line bg-white p-6">
      {needsIdentity && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label>Identity document type</Label>
            <Select value={identityType} onValueChange={value => setIdentityType(value as KycIdentityType)}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IDENTITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AppInput label="ID number" placeholder={identityType === "NIN" ? "11 digits" : "Document number"} value={identityNumber} onChange={event => setIdentityNumber(event.target.value)} />

          {submission?.identity_rejection_reason && <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{submission.identity_rejection_reason}</p>}
          <FileField label="Identity document photo" hint="Clear photo, all corners visible" file={identityFile} onChange={setIdentityFile} />
        </>
      )}

      {needsAddress && (
        <>
          {submission?.address_rejection_reason && <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">{submission.address_rejection_reason}</p>}
          <FileField label="Proof of address" hint="A utility bill or similar, dated within 3 months" file={addressFile} onChange={setAddressFile} />
        </>
      )}

      <Button onClick={handleSubmit} disabled={isPending} className="w-full">
        {isPending && <Loader2 className="animate-spin" />}
        {submission ? "Resubmit documents" : "Submit for review"}
      </Button>
    </div>
  );
};

export const KycStatusBanner = function ({ submission }: { submission: CustomerKycSubmission }) {
  const presentation = KYC_STATUS[submission.status];

  return (
    <div className="max-w-xl rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Verification status</p>
        <StatusBadge label={presentation.label} className={presentation.className} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {submission.status === "APPROVED"
          ? "You're verified — you can pay for shipments and withdraw from your wallet."
          : submission.status === "PENDING"
            ? "Your documents are with our team. This usually takes less than a business day."
            : "One or more documents were rejected — fix the issues below and resubmit."}
      </p>
    </div>
  );
};

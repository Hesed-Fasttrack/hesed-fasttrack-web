"use client";

import { AppInput } from "@/components/shared/app-input";
import { AppSimpleSelect } from "@/components/shared/app-simple-select";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { KYC_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { CustomerKycSubmission, KycIdentityType } from "@/types/customer";
import { BadgeCheck, Clock, FileCheck2, Loader2, ShieldAlert, Upload } from "lucide-react";
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
      <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 transition-colors", file ? "border-brand/50 bg-brand-muted/40" : "border-line-strong bg-canvas hover:border-brand/50")}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-brand">{file ? <FileCheck2 className="size-4.5" /> : <Upload className="size-4.5" />}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{file ? file.name : "Choose an image"}</p>
          <p className="text-xs text-foreground-muted">{hint}</p>
        </div>
        <input type="file" accept="image/*" className="sr-only" onChange={event => onChange(event.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
};

const RejectionNote = function ({ reason }: { reason: string }) {
  return <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger">{reason}</p>;
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
    onSuccessMessage: "Documents submitted. We'll review them shortly",
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
    <SectionCard className="max-w-2xl" title={submission ? "Resubmit documents" : "Submit your documents"} description={submission ? "Only the rejected documents are needed again" : "One government ID and one proof of address"}>
      <div className="space-y-5 p-5 sm:p-5.5">
        {needsIdentity && (
          <>
            <AppSimpleSelect label="Identity document type" value={identityType} onValueChange={value => setIdentityType(value as KycIdentityType)} options={IDENTITY_OPTIONS} />

            <AppInput label="ID number" placeholder={identityType === "NIN" ? "11 digits" : "Document number"} value={identityNumber} onChange={event => setIdentityNumber(event.target.value)} />

            {submission?.identity_rejection_reason && <RejectionNote reason={submission.identity_rejection_reason} />}
            <FileField label="Identity document photo" hint="Clear photo, all corners visible" file={identityFile} onChange={setIdentityFile} />
          </>
        )}

        {needsAddress && (
          <>
            {submission?.address_rejection_reason && <RejectionNote reason={submission.address_rejection_reason} />}
            <FileField label="Proof of address" hint="A utility bill or similar, dated within 3 months" file={addressFile} onChange={setAddressFile} />
          </>
        )}

        <Button onClick={handleSubmit} disabled={isPending} className="h-11 w-full rounded-xl">
          {isPending && <Loader2 className="animate-spin" />}
          {submission ? "Resubmit documents" : "Submit for review"}
        </Button>
      </div>
    </SectionCard>
  );
};

export const KycStatusBanner = function ({ submission }: { submission: CustomerKycSubmission }) {
  const presentation = KYC_STATUS[submission.status];
  const Icon = submission.status === "APPROVED" ? BadgeCheck : submission.status === "PENDING" ? Clock : ShieldAlert;

  return (
    <section className="flex max-w-2xl items-start gap-3.5 rounded-2xl border border-line bg-white p-5 sm:p-5.5">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", presentation.className)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[15px] font-bold tracking-tight text-foreground">Verification status</p>
          <StatusBadge label={presentation.label} className={presentation.className} />
        </div>
        <p className="mt-1 text-[13px] text-foreground-muted">
          {submission.status === "APPROVED"
            ? "You're verified. You can pay for shipments."
            : submission.status === "PENDING"
              ? "Your documents are with our team. This usually takes less than a business day."
              : "One or more documents were rejected. Fix the issues below and resubmit."}
        </p>
      </div>
    </section>
  );
};

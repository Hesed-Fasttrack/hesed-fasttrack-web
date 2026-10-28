"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import type { Address } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { AddressFormDialog } from "./_components/address-form-dialog";

export default function CustomerAddressesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<Address | null>(null);

  const { data, isFetching } = useGetData<APIResponse<Address[]>>({ url: API_ENDPOINTS.customer.addresses.list });
  const addresses = data?.data ?? [];

  const { mutate: removeAddress, isPending: isRemoving } = useSubmitData<{ id: string }, unknown>({
    url: variables => API_ENDPOINTS.customer.addresses.remove(variables.id),
    method: "delete",
    getBody: () => undefined,
    onSuccessMessage: "Address deleted",
    additionalQueryKeys: [[API_ENDPOINTS.customer.addresses.list]],
    onSuccess: () => setDeleting(null),
  });

  const { mutate: setDefault } = useSubmitData<{ id: string }, unknown>({
    url: variables => API_ENDPOINTS.customer.addresses.setDefault(variables.id),
    getBody: () => ({}),
    onSuccessMessage: "Default address updated",
    additionalQueryKeys: [[API_ENDPOINTS.customer.addresses.list]],
  });

  const openCreate = function () {
    setEditing(null);
    setIsFormOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Addresses"
        description="Saved sender and receiver details for faster booking."
        action={
          <Button className="h-10 rounded-xl px-4" onClick={openCreate}>
            <Plus />
            Add address
          </Button>
        }
      />

      {isFetching && addresses.length === 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-white px-5 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-muted">
            <MapPin className="size-5.5 text-brand" />
          </span>
          <p className="max-w-sm text-sm text-foreground-muted">No saved addresses yet. Add the places you ship from and to.</p>
          <Button className="h-10 rounded-xl px-5" onClick={openCreate}>
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map(address => (
            <div key={address.id} className={cn("flex flex-col overflow-hidden rounded-2xl border bg-white", address.is_default ? "border-brand/40" : "border-line")}>
              <div className="flex items-start gap-3 px-5 pt-5 sm:px-5.5 sm:pt-5.5">
                <span className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] bg-brand-muted">
                  <MapPin className="size-4.5 text-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-bold tracking-tight text-foreground">{address.label || address.contact_name}</p>
                    {address.is_default && <StatusBadge label="Default" className="bg-brand-muted text-brand" />}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-foreground-muted">
                    {address.contact_name} · {address.contact_phone}
                  </p>
                </div>
              </div>
              <p className="flex-1 px-5 pt-3.5 pb-5 text-[13.5px] leading-relaxed text-foreground sm:px-5.5 sm:pb-5.5">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}, {address.country}
                {address.postal_code ? ` · ${address.postal_code}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2 border-t border-line bg-canvas px-5 py-3 sm:px-5.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg bg-white"
                  onClick={() => {
                    setEditing(address);
                    setIsFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                {!address.is_default && (
                  <Button size="sm" variant="outline" className="rounded-lg bg-white" onClick={() => setDefault({ id: address.id })}>
                    Make default
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="ml-auto rounded-lg text-danger hover:bg-danger/10 hover:text-danger" onClick={() => setDeleting(address)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressFormDialog open={isFormOpen} address={editing} onClose={() => setIsFormOpen(false)} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this address?"
        description={`${deleting?.label || deleting?.contact_name} is removed from your address book. Shipments already booked keep their own copy.`}
        confirmLabel="Delete address"
        isDestructive
        isLoading={isRemoving}
        onConfirm={() => deleting && removeAddress({ id: deleting.id })}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

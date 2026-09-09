"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
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
    url: (variables) => API_ENDPOINTS.customer.addresses.remove(variables.id),
    method: "delete",
    getBody: () => undefined,
    onSuccessMessage: "Address deleted",
    additionalQueryKeys: [[API_ENDPOINTS.customer.addresses.list]],
    onSuccess: () => setDeleting(null),
  });

  const { mutate: setDefault } = useSubmitData<{ id: string }, unknown>({
    url: (variables) => API_ENDPOINTS.customer.addresses.setDefault(variables.id),
    getBody: () => ({}),
    onSuccessMessage: "Default address updated",
    additionalQueryKeys: [[API_ENDPOINTS.customer.addresses.list]],
  });

  return (
    <div>
      <PageHeader
        title="Addresses"
        description="Saved sender and receiver details for faster booking."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            <Plus />
            Add address
          </Button>
        }
      />

      {isFetching && addresses.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-white px-5 py-16 text-center">
          <MapPin className="h-8 w-8 text-foreground-subtle" />
          <p className="text-sm text-muted-foreground">No saved addresses yet — add the places you ship from and to.</p>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setIsFormOpen(true);
            }}
          >
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {address.label || address.contact_name}
                    {address.is_default && (
                      <span className="ml-2 inline-block align-middle">
                        <StatusBadge label="Default" className="bg-brand-muted text-brand" />
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.contact_name} · {address.contact_phone}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}, {address.country}
                {address.postal_code ? ` · ${address.postal_code}` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(address);
                    setIsFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                {!address.is_default && (
                  <Button size="sm" variant="outline" onClick={() => setDefault({ id: address.id })}>
                    Make default
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => setDeleting(address)}>
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

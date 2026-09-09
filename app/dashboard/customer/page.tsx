"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetData } from "@/hooks/use-get-data";
import { useGetProfile } from "@/hooks/use-get-profile";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDate, formatNaira } from "@/lib/format";
import { SHIPMENT_STATUS } from "@/lib/statuses";
import type { PaginatedResponse } from "@/types/admin";
import type { CustomerShipment, Wallet } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { MapPin, Package, PackagePlus, Wallet as WalletIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  { label: "Book a shipment", href: "/dashboard/customer/book", icon: PackagePlus },
  { label: "Fund wallet", href: "/dashboard/customer/wallet", icon: WalletIcon },
  { label: "Saved addresses", href: "/dashboard/customer/addresses", icon: MapPin },
] as const;

export default function CustomerOverviewPage() {
  const router = useRouter();
  const { profile } = useGetProfile();

  const { data: walletData } = useGetData<APIResponse<Wallet>>({ url: API_ENDPOINTS.customer.wallet.balance });
  const wallet = walletData?.data;

  const { data: shipmentsData, isFetching: isFetchingShipments } = useGetData<PaginatedResponse<CustomerShipment>>({
    url: API_ENDPOINTS.customer.shipments.list("?page=1&limit=5"),
  });
  const shipments = shipmentsData?.data ?? [];

  return (
    <div>
      <PageHeader
        title={`Hello${profile?.first_name ? `, ${profile.first_name}` : ""}`}
        description="Ship, pay and track — all from here."
        action={
          <Button asChild>
            <Link href="/dashboard/customer/book">
              <PackagePlus />
              Book a shipment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-brand p-6 text-white">
          <p className="text-sm font-medium text-[#E4D8F2]">Wallet balance</p>
          <p className="mt-2 text-3xl font-bold">{wallet ? formatNaira(wallet.available_minor) : "—"}</p>
          <Button size="sm" className="mt-4 bg-white text-brand hover:bg-white/90" asChild>
            <Link href="/dashboard/customer/wallet">Fund wallet</Link>
          </Button>
        </div>

        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="hidden items-center gap-4 rounded-2xl border border-line bg-white p-6 transition-colors hover:border-brand lg:flex"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted">
              <action.icon className="h-5 w-5 text-brand" />
            </div>
            <p className="text-sm font-semibold text-foreground">{action.label}</p>
          </Link>
        )).slice(0, 2)}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <p className="text-sm font-semibold text-foreground">Recent shipments</p>
          <Link href="/dashboard/customer/shipments" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>

        {isFetchingShipments && shipments.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <Package className="h-8 w-8 text-foreground-subtle" />
            <p className="text-sm text-muted-foreground">No shipments yet — book your first one in minutes.</p>
            <Button size="sm" asChild>
              <Link href="/dashboard/customer/book">Get a quote</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {shipments.map((shipment) => {
              const status = SHIPMENT_STATUS[shipment.status];
              return (
                <li
                  key={shipment.id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-canvas"
                  onClick={() => router.push(`/dashboard/customer/shipments/${shipment.id}`)}
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-foreground">{shipment.reference}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {shipment.origin.city} → {shipment.destination.city} · {formatDate(shipment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{formatNaira(shipment.amount_minor)}</span>
                    <StatusBadge label={status.label} className={status.className} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

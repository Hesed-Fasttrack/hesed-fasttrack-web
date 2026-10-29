"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import type { CustomerNotification, NotificationType } from "@/types/customer";
import { formatDistanceToNowStrict } from "date-fns";
import { AlertTriangle, Bell, BellRing, CheckCheck, CircleCheck, MessageCircle, ShieldCheck, Tag, Truck, Wallet, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPE_ROUTES: Partial<Record<NotificationType, string>> = {
  SHIPMENT_STATUS: "/dashboard/customer/shipments",
  PAYMENT: "/dashboard/customer/wallet",
  WALLET: "/dashboard/customer/wallet",
  KYC: "/dashboard/customer/kyc",
};

const TYPE_LOOK: Record<NotificationType, { icon: LucideIcon; tile: string }> = {
  SHIPMENT_STATUS: { icon: Truck, tile: "bg-royal/10 text-royal" },
  PAYMENT: { icon: Wallet, tile: "bg-emerald/10 text-emerald" },
  WALLET: { icon: Wallet, tile: "bg-emerald/10 text-emerald" },
  KYC: { icon: ShieldCheck, tile: "bg-brand-muted text-brand" },
  SUCCESS: { icon: CircleCheck, tile: "bg-emerald/10 text-emerald" },
  WARNING: { icon: AlertTriangle, tile: "bg-amber/10 text-amber" },
  ERROR: { icon: AlertTriangle, tile: "bg-danger/10 text-danger" },
  PROMO: { icon: Tag, tile: "bg-brand-muted text-brand" },
  MESSAGE: { icon: MessageCircle, tile: "bg-brand-muted text-brand" },
  INFO: { icon: Bell, tile: "bg-surface-muted text-foreground-muted" },
};

const LIST_URL = API_ENDPOINTS.customer.notifications.list("?page=1&limit=10");

interface NotificationListResponse {
  data: CustomerNotification[];
  unread: number;
}

export const NotificationsBell = function () {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useGetData<NotificationListResponse>({ url: LIST_URL, staleTime: 60 * 1000 });
  const notifications = data?.data ?? [];
  const unread = data?.unread ?? 0;

  const { mutate: markRead } = useSubmitData<{ id: string }, unknown>({
    url: variables => API_ENDPOINTS.customer.notifications.read(variables.id),
    method: "patch",
    getBody: () => undefined,
    silent: true,
    additionalQueryKeys: [[LIST_URL]],
  });

  const { mutate: markAllRead, isPending: isMarkingAll } = useSubmitData<Record<string, never>, unknown>({
    url: API_ENDPOINTS.customer.notifications.readAll,
    method: "patch",
    silent: true,
    additionalQueryKeys: [[LIST_URL]],
  });

  const handleOpen = function (notification: CustomerNotification) {
    if (notification.status === "UNREAD") markRead({ id: notification.id });
    setIsOpen(false);

    const route = TYPE_ROUTES[notification.type];
    if (route) router.push(route);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="relative flex size-10 items-center justify-center rounded-xl border border-line bg-white text-foreground-muted outline-none transition-colors hover:border-line-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" aria-label="Notifications">
        <Bell className="size-4.5" />
        {unread > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-white">{unread > 9 ? "9+" : unread}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[min(384px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-white p-0 shadow-[0_18px_40px_rgba(17,17,20,0.12)] ring-0">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4.5 py-3.5">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-bold tracking-tight text-foreground">Notifications</p>
            {unread > 0 && <span className="rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-bold text-brand tabular-nums">{unread} new</span>}
          </div>
          {unread > 0 && (
            <button type="button" onClick={() => markAllRead({})} disabled={isMarkingAll} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand hover:underline disabled:opacity-50">
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-muted">
              <BellRing className="size-5 text-brand" />
            </span>
            <p className="mt-3.5 text-[14px] font-bold tracking-tight text-foreground">You&apos;re all caught up</p>
            <p className="mt-1 max-w-64 text-[12.5px] leading-relaxed text-foreground-muted">Shipment, wallet and verification updates land here.</p>
          </div>
        ) : (
          <ul className="max-h-[min(420px,60dvh)] divide-y divide-line overflow-y-auto">
            {notifications.map(notification => {
              const look = TYPE_LOOK[notification.type] ?? TYPE_LOOK.INFO;
              const isUnread = notification.status === "UNREAD";

              return (
                <li key={notification.id}>
                  <button type="button" onClick={() => handleOpen(notification)} className={cn("flex w-full items-start gap-3 px-4.5 py-3.5 text-left transition-colors hover:bg-canvas", isUnread && "bg-brand-muted/35")}>
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", look.tile)}>
                      <look.icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className={cn("truncate text-[13.5px] text-foreground", isUnread ? "font-bold" : "font-semibold")}>{notification.title ?? "Update"}</span>
                        <span className="shrink-0 pt-0.5 text-[11px] text-foreground-muted">{formatDistanceToNowStrict(new Date(notification.createdAt))}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-relaxed text-foreground-muted">{notification.message}</span>
                    </span>
                    {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

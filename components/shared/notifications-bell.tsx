"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { cn } from "@/lib/utils";
import type { CustomerNotification, NotificationType } from "@/types/customer";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPE_ROUTES: Partial<Record<NotificationType, string>> = {
  SHIPMENT_STATUS: "/dashboard/customer/shipments",
  PAYMENT: "/dashboard/customer/wallet",
  WALLET: "/dashboard/customer/wallet",
  KYC: "/dashboard/customer/kyc",
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
      <DropdownMenuTrigger className="relative rounded-full p-2 text-foreground-muted outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unread > 0 && (
            <Button variant="ghost" size="xs" onClick={() => markAllRead({})} disabled={isMarkingAll}>
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing yet — booking updates land here.</p>
        ) : (
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {notifications.map(notification => (
              <li key={notification.id}>
                <button type="button" onClick={() => handleOpen(notification)} className={cn("flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-muted", notification.status === "UNREAD" && "bg-brand-muted/30")}>
                  <span className="flex items-center gap-2">
                    {notification.status === "UNREAD" && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />}
                    <span className="truncate text-sm font-semibold text-foreground">{notification.title ?? "Update"}</span>
                  </span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                  <span className="text-[11px] text-foreground-subtle">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

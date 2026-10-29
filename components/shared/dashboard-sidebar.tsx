"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetProfile } from "@/hooks/use-get-profile";
import { clearAuthCookies } from "@/lib/authService";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, LifeBuoy, LogOut, Settings, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEM = "cursor-pointer gap-2.5 rounded-lg px-2 py-2 text-[13.5px] font-medium text-foreground focus:bg-canvas";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
}

export interface DashboardNavGroup {
  label?: string;
  items: DashboardNavItem[];
}

interface Props {
  groups: DashboardNavGroup[];
  homeHref: string;
  header?: React.ReactNode;
  countTone?: "neutral" | "attention";
  className?: string;
  onNavigate?: () => void;
}

export const DashboardSidebar = function ({ groups, homeHref, header, countTone = "neutral", className, onNavigate }: Props) {
  const pathname = usePathname();
  const { profile } = useGetProfile();

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() || "·";
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  const handleSignOut = function () {
    clearAuthCookies();
    window.location.href = "/auth/signin";
  };

  return (
    <aside className={cn("flex h-full w-63 flex-col border-r border-line bg-white", className)}>
      <div className="flex h-17 shrink-0 items-center px-5.5">
        <Link href={homeHref} onClick={onNavigate}>
          <Image src="/images/logo.png" alt="HESED FastTrack" width={140} height={38} className="h-7.5 w-auto" />
        </Link>
      </div>

      {header && <div className="px-3.5 pb-3.5">{header}</div>}

      <nav className="flex-1 space-y-4.5 overflow-y-auto px-3 pb-4">
        {groups.map((group, index) => (
          <div key={group.label ?? index}>
            {group.label && <p className="px-2.5 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-foreground-subtle uppercase">{group.label}</p>}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = item.href === homeHref ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn("flex items-center gap-2.75 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-colors", isActive ? "bg-brand-muted font-semibold text-brand-dark" : "text-foreground-muted hover:bg-surface-muted hover:text-foreground")}
                  >
                    <item.icon className={cn("size-4.5 shrink-0", isActive && "text-brand")} strokeWidth={1.75} />
                    {item.label}
                    {!!item.count && (
                      <span className={cn("ml-auto rounded-full px-1.75 py-px text-[11.5px] font-bold", countTone === "attention" ? "bg-amber/10 text-amber" : "bg-surface-muted text-foreground-muted")}>{item.count > 99 ? "99+" : item.count}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-8.5">
              <AvatarImage src={profile?.profile_pic ?? undefined} alt={fullName} />
              <AvatarFallback className="bg-brand-muted text-xs font-bold text-brand-dark">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">{fullName || "Account"}</p>
              <p className="truncate text-xs text-foreground-muted">{profile?.email}</p>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-foreground-subtle" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_40px_rgba(17,17,20,0.12)] ring-0">
            <DropdownMenuLabel className="flex items-center gap-2.5 px-2 py-2">
              <Avatar className="size-9">
                <AvatarImage src={profile?.profile_pic ?? undefined} alt={fullName} />
                <AvatarFallback className="bg-brand-muted text-xs font-bold text-brand-dark">{initials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-bold text-foreground">{fullName || "Account"}</span>
                <span className="block truncate text-xs font-normal text-foreground-muted">{profile?.email}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-1 my-1.5 bg-line" />
            <DropdownMenuItem asChild className={MENU_ITEM}>
              <Link href={`${homeHref}/settings`} onClick={onNavigate}>
                <Settings className="size-4 text-foreground-muted" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className={MENU_ITEM}>
              <Link href="/support" target="_blank">
                <LifeBuoy className="size-4 text-foreground-muted" />
                Help and support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-1 my-1.5 bg-line" />
            <DropdownMenuItem onClick={handleSignOut} className={cn(MENU_ITEM, "text-danger focus:bg-danger/8 focus:text-danger")}>
              <LogOut className="size-4 text-danger" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};

"use client";

import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { Banknote, LayoutDashboard, Package, ShieldCheck, UserRoundCog, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  superOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Shipments", href: "/dashboard/admin/shipments", icon: Package },
  { label: "KYC", href: "/dashboard/admin/kyc", icon: ShieldCheck },
  { label: "Withdrawals", href: "/dashboard/admin/withdrawals", icon: Banknote },
  { label: "Admins", href: "/dashboard/admin/admins", icon: UserRoundCog, superOnly: true },
];

export const AdminSidebar = function ({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  // cookies don't exist during SSR — reading them in render mismatches hydration
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSuperAdmin(Cookies.get("session_type") === "SUPER_ADMIN");
  }, []);

  const items = NAV_ITEMS.filter(item => !item.superOnly || isSuperAdmin);

  return (
    <aside className={cn("flex h-full w-64 flex-col border-r border-line bg-white", className)}>
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link href="/dashboard/admin" onClick={onNavigate}>
          <Image src="/images/logo.png" alt="HESED FastTrack" width={140} height={38} className="h-8 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(item => {
          const isActive = item.href === "/dashboard/admin" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", isActive ? "bg-brand-muted text-brand" : "text-foreground-muted hover:bg-muted hover:text-foreground")}
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

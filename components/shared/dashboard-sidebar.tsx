"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface Props {
  items: DashboardNavItem[];
  homeHref: string;
  className?: string;
  onNavigate?: () => void;
}

export const DashboardSidebar = function ({ items, homeHref, className, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-64 flex-col border-r border-line bg-white", className)}>
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link href={homeHref} onClick={onNavigate}>
          <Image src="/images/logo.png" alt="HESED FastTrack" width={140} height={38} className="h-8 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map(item => {
          const isActive = item.href === homeHref ? pathname === item.href : pathname.startsWith(item.href);

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

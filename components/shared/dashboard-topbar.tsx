"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useGetProfile } from "@/hooks/use-get-profile";
import { clearAuthCookies } from "@/lib/authService";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

interface Props {
  title: string;
  renderSidebar: (onNavigate: () => void) => React.ReactNode;
  actions?: React.ReactNode;
}

export const DashboardTopbar = function ({ title, renderSidebar, actions }: Props) {
  const { profile } = useGetProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() || "·";
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");

  const handleSignOut = function () {
    clearAuthCookies();
    window.location.href = "/auth/signin";
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger className="rounded-md p-2 text-foreground-muted hover:bg-muted lg:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {renderSidebar(() => setIsMenuOpen(false))}
          </SheetContent>
        </Sheet>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar>
              <AvatarImage src={profile?.profile_pic ?? undefined} alt={fullName} />
              <AvatarFallback className="bg-brand-muted text-sm font-semibold text-brand">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{fullName || "Account"}</p>
              <p className="text-xs font-normal text-muted-foreground">{profile?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

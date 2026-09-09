"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Why us", href: "/#why-us" },
  { label: "Support", href: "/support" },
] as const;

export const Header = function () {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="HESED FastTrack" width={150} height={40} className="h-9 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground-muted transition-colors hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </div>

        <button type="button" onClick={() => setIsMenuOpen(open => !open)} className="rounded-md p-2 text-foreground-muted md:hidden" aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-line bg-white px-4 pb-6 pt-2 md:hidden", !isMenuOpen && "hidden")}>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-brand-muted hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

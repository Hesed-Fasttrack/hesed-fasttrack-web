"use client";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  renderSidebar: (onNavigate: () => void) => React.ReactNode;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export const DashboardTopbar = function ({ title, renderSidebar, actions, searchPlaceholder, onSearch }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = function (event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = function (event: React.FormEvent) {
    event.preventDefault();
    const cleaned = query.trim();
    if (!cleaned || !onSearch) return;
    onSearch(cleaned);
    setQuery("");
    searchRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-40 flex h-17 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur-md sm:px-8">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger className="-ml-1 flex size-10 items-center justify-center rounded-xl text-foreground-muted hover:bg-surface-muted lg:hidden" aria-label="Open navigation">
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-63 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {renderSidebar(() => setIsMenuOpen(false))}
        </SheetContent>
      </Sheet>

      <p className="truncate text-sm font-semibold text-foreground">{title}</p>

      <div className="ml-auto flex items-center gap-2.5">
        {onSearch && (
          <form onSubmit={handleSubmit} className="hidden h-10 w-60 items-center gap-2.5 rounded-xl border border-line bg-white px-3 transition-colors focus-within:border-brand focus-within:ring-3 focus-within:ring-brand-muted md:flex xl:w-85">
            <Search className="size-4 shrink-0 text-foreground-subtle" />
            <input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder={searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-foreground-subtle" />
            <kbd className="hidden rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[11px] font-semibold text-foreground-muted xl:inline">Ctrl K</kbd>
          </form>
        )}
        {actions}
      </div>
    </header>
  );
};

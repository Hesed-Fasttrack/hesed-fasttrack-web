import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  link?: { href: string; label: string };
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const SectionCard = function ({ title, description, link, action, className, children }: Props) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-line bg-white", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4.5 sm:px-5.5">
        <div className="min-w-0">
          <p className="text-[15px] font-bold tracking-tight text-foreground">{title}</p>
          {description && <p className="mt-0.5 text-[12.5px] text-foreground-muted">{description}</p>}
        </div>
        {action}
        {link && (
          <Link href={link.href} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-brand hover:underline">
            {link.label}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
};

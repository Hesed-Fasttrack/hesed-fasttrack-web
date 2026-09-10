import { AppText } from "@/components/shared/app-text";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
}

export const PageHeader = function ({ title, description, action, backHref }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link href={backHref} aria-label="Back" className="text-muted-foreground hover:text-foreground hover:bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-line transition-colors">
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <div>
          <AppText type="h2">{title}</AppText>
          {description && (
            <AppText type="subtitle" className="mt-1 text-sm">
              {description}
            </AppText>
          )}
        </div>
      </div>
      {action}
    </div>
  );
};

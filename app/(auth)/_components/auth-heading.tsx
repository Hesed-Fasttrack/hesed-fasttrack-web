import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  icon?: LucideIcon;
}

export const AuthHeading = function ({ title, description, eyebrow, icon: Icon }: Props) {
  return (
    <div>
      {Icon && (
        <span className="mb-4.5 flex size-11 items-center justify-center rounded-xl bg-brand-muted">
          <Icon className="size-5 text-brand" />
        </span>
      )}
      {eyebrow && <p className="mb-1.5 text-[12.5px] font-bold text-brand">{eyebrow}</p>}
      <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-foreground sm:text-[28px]">{title}</h1>
      {description && <p className="mt-2 text-sm leading-relaxed text-foreground-muted [&_b]:font-semibold [&_b]:text-foreground">{description}</p>}
    </div>
  );
};

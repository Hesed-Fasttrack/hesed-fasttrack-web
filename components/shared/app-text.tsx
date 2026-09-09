import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";

type TextType = "h1" | "h2" | "h3" | "h4" | "subtitle" | "body" | "caption" | "label";

interface Props {
  type?: TextType;
  children: React.ReactNode;
  className?: ClassValue;
  as?: keyof React.JSX.IntrinsicElements;
}

const typeStyles: Record<TextType, string> = {
  h1: "text-3xl font-bold tracking-tight text-foreground",
  h2: "text-2xl font-semibold tracking-tight text-foreground",
  h3: "text-xl font-semibold text-foreground",
  h4: "text-lg font-medium text-foreground",
  subtitle: "text-base font-medium text-muted-foreground",
  body: "text-sm text-foreground",
  caption: "text-xs text-muted-foreground",
  label: "text-sm font-medium text-foreground",
};

const typeElements: Record<TextType, keyof React.JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  subtitle: "p",
  body: "p",
  caption: "span",
  label: "span",
};

export const AppText = function ({ type = "body", children, className, as }: Props) {
  const Tag = (as ?? typeElements[type]) as keyof React.JSX.IntrinsicElements;

  return <Tag className={cn(typeStyles[type], className)}>{children}</Tag>;
};

"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MoreHorizontal, type LucideIcon } from "lucide-react";

export const OPTION_LIST_CLASS = "rounded-xl border border-line bg-white p-1.5 shadow-[0_14px_34px_rgba(17,17,20,0.12)] ring-0";
export const OPTION_ITEM_CLASS = "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13.5px] text-foreground select-none hover:bg-canvas focus:bg-canvas";
export const OPTION_SELECTED_CLASS = "bg-brand-muted/60 font-semibold text-brand-dark hover:bg-brand-muted/60 focus:bg-brand-muted/60";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  label?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
  /** "default" shows a styled input trigger; "ellipsis" shows a ghost icon button */
  triggerVariant?: "default" | "ellipsis";
  optionIcons?: Record<string, LucideIcon>;
}

export const AppSimpleSelect = function ({ label, options, value, onValueChange, placeholder = "Select an option", error, disabled, containerClassName, className, triggerVariant = "default", optionIcons }: Props) {
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");
  const selectedLabel = options.find(option => option.value === value)?.label;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", containerClassName)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <DropdownMenu>
        {triggerVariant === "ellipsis" ? (
          <DropdownMenuTrigger id={inputId} disabled={disabled} className={cn("hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-md outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
        ) : (
          <DropdownMenuTrigger
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              // h-11 matches AppInput so mixed rows line up
              "border-input bg-background focus-visible:ring-ring flex h-11 w-full min-w-0 items-center justify-between rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
              !!error && "border-destructive",
              !selectedLabel && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{selectedLabel ?? placeholder}</span>
            <ChevronDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
          </DropdownMenuTrigger>
        )}
        <DropdownMenuContent sideOffset={6} className={cn(OPTION_LIST_CLASS, triggerVariant === "ellipsis" ? "w-44" : "w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)]")} align="end">
          {options.map(option => {
            const Icon = optionIcons?.[option.value];
            const isSelected = option.value === value;
            return (
              <DropdownMenuItem key={option.value} disabled={option.disabled} onSelect={() => onValueChange?.(option.value)} className={cn(OPTION_ITEM_CLASS, isSelected && OPTION_SELECTED_CLASS)}>
                {Icon && <Icon className="size-4" />}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && <Check className="size-3.5 shrink-0 text-brand" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};

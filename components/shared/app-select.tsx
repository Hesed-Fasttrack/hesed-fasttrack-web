"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { Popover } from "radix-ui";
import { useRef, useState } from "react";
import { OPTION_ITEM_CLASS, OPTION_LIST_CLASS, OPTION_SELECTED_CLASS, type SelectOption } from "./app-simple-select";

interface Props {
  label?: string;
  options: SelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  containerClassName?: string;
}

// Searchable select for long lists (countries, banks…). AppSimpleSelect covers short ones.
export const AppSelect = function ({ label, options, value, onValueChange, placeholder = "Select an option", error, disabled, containerClassName }: Props) {
  const inputId = label?.toLowerCase().replace(/\s+/g, "-");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value) ?? null;
  const filtered = options.filter(option => option.label.toLowerCase().includes(search.toLowerCase()));

  const close = function () {
    setOpen(false);
    setSearch("");
  };

  const handleOpen = function () {
    if (disabled) return;
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = function (option: SelectOption) {
    onValueChange?.(option.value);
    close();
  };

  const handleClear = function (event: React.MouseEvent) {
    event.stopPropagation();
    onValueChange?.(null);
    setSearch("");
  };

  const displayValue = open ? search : (selectedOption?.label ?? "");

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}

      {/* Rendered in a Radix layer so the list escapes a dialog's scrolling body instead of being clipped by it */}
      <Popover.Root open={open} onOpenChange={next => (next ? setOpen(true) : close())}>
        <Popover.Anchor asChild>
          <div
            ref={anchorRef}
            className={cn(
              "border-input bg-background flex h-11 items-center rounded-md border px-3 shadow-xs transition-[color,box-shadow]",
              "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-3",
              error && "border-destructive focus-within:ring-destructive/20",
              disabled && "cursor-not-allowed opacity-50",
            )}
            onClick={handleOpen}
          >
            <input
              ref={inputRef}
              id={inputId}
              value={displayValue}
              onChange={event => {
                setSearch(event.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={handleOpen}
              onKeyDown={event => {
                if (event.key === "Escape") close();
                if (event.key === "Enter" && open && filtered[0]) {
                  event.preventDefault();
                  handleSelect(filtered[0]);
                }
              }}
              placeholder={!open && !selectedOption ? placeholder : (selectedOption?.label ?? "Search…")}
              disabled={disabled}
              aria-invalid={!!error}
              aria-expanded={open}
              role="combobox"
              autoComplete="off"
              className="placeholder:text-muted-foreground w-full min-w-0 flex-1 truncate bg-transparent text-sm outline-none disabled:cursor-not-allowed"
            />

            <div className="flex shrink-0 items-center gap-0.5">
              {selectedOption && !disabled && (
                <button type="button" onClick={handleClear} aria-label="Clear" className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded-sm">
                  <X className="size-3.5" />
                </button>
              )}
              <ChevronDown className={cn("text-muted-foreground size-4 transition-transform duration-150", open && "rotate-180")} />
            </div>
          </div>
        </Popover.Anchor>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            collisionPadding={12}
            onOpenAutoFocus={event => event.preventDefault()}
            onCloseAutoFocus={event => event.preventDefault()}
            onInteractOutside={event => {
              if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
            }}
            className={cn(OPTION_LIST_CLASS, "z-50 flex w-(--radix-popover-trigger-width) max-h-[min(18rem,var(--radix-popover-content-available-height))] flex-col p-0")}
          >
            <ul role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5" onWheel={event => event.stopPropagation()}>
              {filtered.length === 0 ? (
                <li className="py-3 text-center text-[13px] text-foreground-muted">No matches for &ldquo;{search}&rdquo;</li>
              ) : (
                filtered.map(option => {
                  const isSelected = option.value === value;
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={event => {
                        // onMouseDown + preventDefault prevents input blur before click registers
                        event.preventDefault();
                        handleSelect(option);
                      }}
                      className={cn(OPTION_ITEM_CLASS, isSelected && OPTION_SELECTED_CLASS)}
                    >
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {isSelected && <Check className="size-3.5 shrink-0 text-brand" />}
                    </li>
                  );
                })
              )}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};

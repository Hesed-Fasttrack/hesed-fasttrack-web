import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, Search, type LucideIcon } from "lucide-react";
import React, { useState } from "react";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  containerClassName?: string;
  icon?: LucideIcon;
  suffix?: string;
}

export const AppInput = function ({ label, error, containerClassName, icon: Icon, id, type, className, suffix, ...props }: Props) {
  const isPassword = type === "password";
  const isSearch = type === "search";
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;
  const ResolvedIcon = Icon ?? (isSearch ? Search : undefined);

  if (type === "checkbox") {
    return (
      <div className={cn("flex flex-col gap-1.5", containerClassName)}>
        <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2.5">
          <div className="relative flex items-center">
            <input id={inputId} type="checkbox" className="peer sr-only" {...props} />
            <div
              className={cn(
                "border-input h-5 w-5 rounded-md border-2 transition-all",
                "peer-checked:bg-brand peer-checked:border-brand",
                "peer-focus-visible:ring-brand/30 peer-focus-visible:ring-2 peer-focus-visible:outline-none",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              )}
            />
            <Check className="pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
          </div>
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
        </label>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <div className="relative flex items-center">
        {ResolvedIcon && (
          <>
            <div className="pointer-events-none absolute left-3 flex items-center">
              <ResolvedIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            </div>
            <div className="bg-border absolute left-9 h-5 w-px" />
          </>
        )}
        <Input id={inputId} type={resolvedType} aria-invalid={!!error} className={cn("h-11 py-2", ResolvedIcon ? "pl-12" : "px-3", isPassword || suffix ? "pr-10" : ResolvedIcon ? "pr-3" : "px-3", className)} {...props} />
        {suffix && !isPassword && <span className="text-muted-foreground pointer-events-none absolute right-3 text-sm">{suffix}</span>}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(prev => !prev)}
            className="text-muted-foreground hover:text-foreground absolute right-3 flex items-center transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};

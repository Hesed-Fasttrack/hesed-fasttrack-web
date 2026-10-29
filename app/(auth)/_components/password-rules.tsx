import { cn } from "@/lib/utils";
import { Circle, CircleCheck } from "lucide-react";

const RULES = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "Letter and number", test: (value: string) => /[A-Za-z]/.test(value) && /\d/.test(value) },
  { label: "A symbol", test: (value: string) => /[@$!%*?&#^()\-_=+.]/.test(value) },
];

export const PasswordRules = function ({ value }: { value: string }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {RULES.map(rule => {
        const isMet = rule.test(value);
        const Icon = isMet ? CircleCheck : Circle;

        return (
          <li key={rule.label} className={cn("flex items-center gap-1.5 text-[11.5px] font-semibold transition-colors", isMet ? "text-emerald" : "text-foreground-muted")}>
            <Icon className="size-3.5" />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
};

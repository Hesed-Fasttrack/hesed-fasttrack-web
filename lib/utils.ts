import { QueryClient } from "@tanstack/react-query";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient();

export type DashboardRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export const handleSigninRedirect = function (role: DashboardRole) {
  return role === "CUSTOMER" ? "/dashboard/customer" : "/dashboard/admin";
};

// Only allow safe, relative, in-app paths — prevents open-redirect via callbackUrl
export const isSafeCallback = function (url: string | null): url is string {
  return !!url && url.startsWith("/") && !url.startsWith("//");
};

export const ENV = {
  get API_URL() {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  },
} as const;

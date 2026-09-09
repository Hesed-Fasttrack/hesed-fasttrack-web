import { format } from "date-fns";

// All money is minor units (kobo) end to end; divide only at render.
export const formatNaira = function (amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = function (value: string | Date) {
  return format(new Date(value), "d MMM yyyy");
};

export const formatDateTime = function (value: string | Date) {
  return format(new Date(value), "d MMM yyyy · h:mma");
};

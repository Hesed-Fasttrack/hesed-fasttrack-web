import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { createElement, ReactNode } from "react";
import { toast } from "sonner";

type ToastType = "error" | "success" | "warning" | "info" | "loading";

const toastConfig: Record<ToastType, { icon: ReactNode; style: React.CSSProperties }> = {
  success: {
    icon: createElement(CheckCircle2, {
      className: "h-5 w-5 text-emerald-600",
    }),
    style: {
      background: "#ECFDF5",
      border: "1px solid #A7F3D0",
      color: "#065F46",
    },
  },
  error: {
    icon: createElement(XCircle, { className: "h-5 w-5 text-red-600" }),
    style: {
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#991B1B",
    },
  },
  warning: {
    icon: createElement(AlertTriangle, { className: "h-5 w-5 text-amber-600" }),
    style: {
      background: "#FFFBEB",
      border: "1px solid #FDE68A",
      color: "#92400E",
    },
  },
  info: {
    icon: createElement(Info, { className: "h-5 w-5 text-blue-600" }),
    style: {
      background: "#EFF6FF",
      border: "1px solid #BFDBFE",
      color: "#1E40AF",
    },
  },
  loading: {
    icon: createElement(Loader2, {
      className: "h-5 w-5 animate-spin text-gray-500",
    }),
    style: {
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      color: "#374151",
    },
  },
};

export const showToast = (type: ToastType, message: string) => {
  toast.dismiss();

  const config = toastConfig[type];

  switch (type) {
    case "error":
      toast.error(message, { icon: config.icon, style: config.style });
      break;
    case "success":
      toast.success(message, { icon: config.icon, style: config.style });
      break;
    case "warning":
      toast.warning(message, { icon: config.icon, style: config.style });
      break;
    case "info":
      toast.info(message, { icon: config.icon, style: config.style });
      break;
    case "loading":
      toast.loading(message, { icon: config.icon, style: config.style });
      break;
    default:
      toast(message);
  }
};

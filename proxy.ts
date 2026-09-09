import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { DashboardRole } from "./lib/utils";

const ROUTES = {
  LOGIN: "/auth/signin",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  CUSTOMER_HOME: "/dashboard/customer",
  ADMIN_HOME: "/dashboard/admin",
} as const;

function getDashboardHome(role: DashboardRole | undefined): string {
  switch (role) {
    case "CUSTOMER":
      return ROUTES.CUSTOMER_HOME;
    case "ADMIN":
    case "SUPER_ADMIN":
      return ROUTES.ADMIN_HOME;
    default:
      return ROUTES.LOGIN;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionType = request.cookies.get("session_type")?.value as DashboardRole | undefined;
  const refreshToken = request.cookies.get("session_id_ref")?.value;

  const hasValidSession = !!sessionType && !!refreshToken;

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const redirectToLogin = () => {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  };

  if (pathname.startsWith(ROUTES.AUTH)) {
    return hasValidSession ? redirectTo(getDashboardHome(sessionType)) : NextResponse.next();
  }

  if (pathname.startsWith(ROUTES.DASHBOARD)) {
    if (!hasValidSession) return redirectToLogin();

    if (pathname === ROUTES.DASHBOARD) {
      return redirectTo(getDashboardHome(sessionType));
    }

    const isCorrectDashboard =
      ((pathname === ROUTES.CUSTOMER_HOME || pathname.startsWith(`${ROUTES.CUSTOMER_HOME}/`)) && sessionType === "CUSTOMER") ||
      ((pathname === ROUTES.ADMIN_HOME || pathname.startsWith(`${ROUTES.ADMIN_HOME}/`)) && (sessionType === "ADMIN" || sessionType === "SUPER_ADMIN"));

    if (!isCorrectDashboard) {
      return redirectTo(getDashboardHome(sessionType));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};

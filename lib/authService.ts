import Cookies from "js-cookie";
import { accessTokenExpiration } from "./api";

export const isProd = process.env.NODE_ENV === "production";
export const COOKIE_DOMAIN = ".hesedfasttrack.com";

export type SessionRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export const cookieOpts = (expires: Date) => ({
  domain: isProd ? COOKIE_DOMAIN : undefined,
  secure: true,
  sameSite: "lax" as const,
  expires,
});

// Mirrors the server: access token 30 minutes, refresh token 7 days.
const refreshTokenExpiration = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const setAuthCookies = (data: { tokens: { access: string; refresh: string }; role: SessionRole }) => {
  const refreshExpires = refreshTokenExpiration();

  Cookies.set("session_id", data.tokens.access, cookieOpts(accessTokenExpiration));
  Cookies.set("session_id_ref", data.tokens.refresh, cookieOpts(refreshExpires));
  Cookies.set("session_type", data.role, cookieOpts(refreshExpires));
};

export const clearAuthCookies = () => {
  const domainOpt = { domain: isProd ? COOKIE_DOMAIN : undefined };

  Cookies.remove("session_id", domainOpt);
  Cookies.remove("session_id_ref", domainOpt);
  Cookies.remove("session_type", domainOpt);
};

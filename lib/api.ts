import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { clearAuthCookies, cookieOpts } from "./authService";

const CONFIG = {
  ACCESS_TOKEN_EXPIRATION_MS: 30 * 60 * 1000,
  MAX_RETRY_ATTEMPTS: 3,
  COOKIE_NAMES: {
    ACCESS_TOKEN: "session_id",
    REFRESH_TOKEN: "session_id_ref",
  },
  ENDPOINTS: {
    REFRESH_TOKEN: "/auth/token",
  },
  ROUTES: {
    LOGIN: "/auth/signin",
  },
  REQUESTS: {
    TIMEOUT: 120000,
  },
} as const;

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  _retry?: boolean;
}

interface RefreshTokenResponse {
  message: string;
  token: {
    accessToken: string;
  };
}

type TokenRefreshError = {
  message: string;
  name: "TokenRefreshError";
};

const createTokenRefreshError = function (message: string): TokenRefreshError {
  return {
    message,
    name: "TokenRefreshError",
  };
};

const getAccessTokenExpiration = () => new Date(Date.now() + CONFIG.ACCESS_TOKEN_EXPIRATION_MS);

const setAuthorizationHeader = (api: AxiosInstance, token: string) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

const handleTokenRefresh = async (api: AxiosInstance, refreshToken: string): Promise<string> => {
  const { data } = await api.post<RefreshTokenResponse>(CONFIG.ENDPOINTS.REFRESH_TOKEN, { refreshToken });

  if (!data.token.accessToken) {
    throw createTokenRefreshError("Invalid refresh token response");
  }

  return data.token.accessToken;
};

let globalRetryCount = 0;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: CONFIG.REQUESTS.TIMEOUT,
});

api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    if (config.skipAuth) return config;

    const token = Cookies.get(CONFIG.COOKIE_NAMES.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.skipAuth || originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/create-user")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (globalRetryCount >= CONFIG.MAX_RETRY_ATTEMPTS) {
        clearAuthCookies();
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = CONFIG.ROUTES.LOGIN;
          }
        }, 2000);
        return Promise.reject(createTokenRefreshError("Max retry attempts reached"));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(token => {
            if (token) {
              setAuthorizationHeader(api, token);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(createTokenRefreshError("Token refresh failed"));
            }
          });
        });
      }

      isRefreshing = true;
      globalRetryCount++;
      try {
        const refreshToken = Cookies.get(CONFIG.COOKIE_NAMES.REFRESH_TOKEN);
        if (!refreshToken) {
          throw createTokenRefreshError("No refresh token available");
        }
        const newAccessToken = await handleTokenRefresh(api, refreshToken);
        Cookies.set(CONFIG.COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, cookieOpts(getAccessTokenExpiration()));
        setAuthorizationHeader(api, newAccessToken);
        onRefreshed(newAccessToken);
        isRefreshing = false;
        globalRetryCount = 0;
        return api(originalRequest);
      } catch (refreshError) {
        onRefreshed(null);
        isRefreshing = false;
        clearAuthCookies();
        setTimeout(() => {
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
            window.location.href = CONFIG.ROUTES.LOGIN;
          }
        }, 2000);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const accessTokenExpiration = getAccessTokenExpiration();
export default api;

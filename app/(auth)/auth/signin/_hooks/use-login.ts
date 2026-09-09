import { useSubmitData } from "@/hooks/use-submit-data";
import { setAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { handleSigninRedirect, isSafeCallback } from "@/lib/utils";
import type { LoginFormValues } from "@/schemas/auth";
import type { AuthTokens, User } from "@/types/auth";
import type { APIResponse } from "@/types/response";

export const useLogin = function ({ callbackUrl, onSuccess }: { callbackUrl: string | null; onSuccess?: () => void }) {
  const { mutate, isPending } = useSubmitData<LoginFormValues, APIResponse<{ user: User; token: AuthTokens }>>({
    url: API_ENDPOINTS.auth.signin,
    skipAuth: true,
    onSuccessMessage: "Logged in successfully",
    onSuccess: response => {
      onSuccess?.();
      const { user, token } = response.data;

      setAuthCookies({
        tokens: { access: token.accessToken, refresh: token.refreshToken },
        role: user.role,
      });

      const redirectPath = isSafeCallback(callbackUrl) ? callbackUrl : handleSigninRedirect(user.role);
      // full navigation so proxy.ts sees the fresh cookies
      window.location.href = redirectPath;
    },
  });

  return { login: mutate, isLoggingIn: isPending };
};

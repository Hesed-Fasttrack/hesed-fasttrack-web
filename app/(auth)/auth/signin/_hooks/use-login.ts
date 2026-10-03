import { useSubmitData } from "@/hooks/use-submit-data";
import { setAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { handleSigninRedirect, isSafeCallback } from "@/lib/utils";
import type { LoginFormValues } from "@/schemas/auth";
import type { AuthTokens, User } from "@/types/auth";
import type { APIResponse } from "@/types/response";

type LoginData = { requires_otp: true; email: string } | { requires_otp?: undefined; user: User; token: AuthTokens };

interface Options {
  callbackUrl: string | null;
  onSuccess?: () => void;
  // Admin accounts get a second step: the emailed sign-in code.
  onOtpRequired?: (email: string) => void;
}

export const useLogin = function ({ callbackUrl, onSuccess, onOtpRequired }: Options) {
  const completeSignin = function (user: User, token: AuthTokens) {
    setAuthCookies({
      tokens: { access: token.accessToken, refresh: token.refreshToken },
      role: user.role,
    });

    const redirectPath = isSafeCallback(callbackUrl) ? callbackUrl : handleSigninRedirect(user.role);
    // full navigation so proxy.ts sees the fresh cookies
    window.location.href = redirectPath;
  };

  const { mutate, isPending } = useSubmitData<LoginFormValues, APIResponse<LoginData>>({
    url: API_ENDPOINTS.auth.signin,
    skipAuth: true,
    silent: true,
    onSuccess: response => {
      if (response.data.requires_otp) {
        onOtpRequired?.(response.data.email);
        return;
      }

      onSuccess?.();
      completeSignin(response.data.user, response.data.token);
    },
  });

  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useSubmitData<{ email: string; code: string }, APIResponse<{ user: User; token: AuthTokens }>>({
    url: API_ENDPOINTS.auth.verifyLoginOtp,
    skipAuth: true,
    onSuccessMessage: "Logged in successfully",
    onSuccess: response => {
      onSuccess?.();
      completeSignin(response.data.user, response.data.token);
    },
  });

  return { login: mutate, isLoggingIn: isPending, verifyOtp, isVerifyingOtp };
};

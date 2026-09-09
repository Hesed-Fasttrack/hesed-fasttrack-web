"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { setAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { handleSigninRedirect } from "@/lib/utils";
import { verifyEmailSchema, type VerifyEmailFormValues } from "@/schemas/auth";
import type { AuthTokens, User } from "@/types/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({ resolver: zodResolver(verifyEmailSchema) });

  const { mutate: verify, isPending } = useSubmitData<{ email: string; code: string }, APIResponse<{ user: User; token: AuthTokens }>>({
    url: API_ENDPOINTS.auth.verifyEmailOtp,
    skipAuth: true,
    onSuccessMessage: "Email verified — welcome aboard",
    onSuccess: response => {
      const { user, token } = response.data;
      setAuthCookies({ tokens: { access: token.accessToken, refresh: token.refreshToken }, role: user.role });
      window.location.href = handleSigninRedirect(user.role);
    },
  });

  const { mutate: resend, isPending: isResending } = useSubmitData<{ email: string }, APIResponse<unknown>>({
    url: API_ENDPOINTS.auth.sendEmailOtp,
    skipAuth: true,
    onSuccessMessage: "A new code is on its way",
  });

  return (
    <div className="rounded-2xl border border-line bg-white p-8">
      <AppText type="h2" className="text-center">
        Check your email
      </AppText>
      <AppText type="subtitle" className="mt-1 text-center text-sm">
        We sent a 6-digit code to {email || "your email"}.
      </AppText>

      <form onSubmit={handleSubmit(data => verify({ email, code: data.code }))} className="mt-8 space-y-5">
        <FormInput<VerifyEmailFormValues> control={control} name="code" errors={errors} label="Verification code" icon={KeyRound} placeholder="123456" inputMode="numeric" maxLength={6} autoComplete="one-time-code" />

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Verify email
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button type="button" onClick={() => resend({ email })} disabled={isResending || !email} className="text-sm font-medium text-brand hover:underline disabled:opacity-50">
          {isResending ? "Sending…" : "Resend code"}
        </button>
      </div>
    </div>
  );
}

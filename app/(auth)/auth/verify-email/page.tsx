"use client";

import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { setAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { handleSigninRedirect } from "@/lib/utils";
import { verifyEmailSchema, type VerifyEmailFormValues } from "@/schemas/auth";
import type { AuthTokens, User } from "@/types/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { AuthHeading } from "../../_components/auth-heading";
import { CodeInput } from "../../_components/code-input";
import { ResendCode } from "../../_components/resend-code";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({ resolver: zodResolver(verifyEmailSchema), defaultValues: { code: "" } });

  const { mutate: verify, isPending } = useSubmitData<{ email: string; code: string }, APIResponse<{ user: User; token: AuthTokens }>>({
    url: API_ENDPOINTS.auth.verifyEmailOtp,
    skipAuth: true,
    onSuccessMessage: "Email verified. Welcome aboard",
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
    <div>
      <AuthHeading
        icon={MailCheck}
        title="Check your email"
        description={
          <>
            We sent a 6-digit code to <b>{email || "your email"}</b>. It expires in 10 minutes.
          </>
        }
      />

      <form onSubmit={handleSubmit(data => verify({ email, code: data.code }))} className="mt-6.5">
        <Controller control={control} name="code" render={({ field }) => <CodeInput value={field.value} onChange={field.onChange} error={errors.code?.message} autoFocus />} />
        <ResendCode onResend={() => email && resend({ email })} isResending={isResending} changeHref="/auth/signup" />

        <Button type="submit" className="mt-5.5 h-11 w-full rounded-xl" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Verify email
        </Button>
      </form>

      <p className="mt-4 text-center text-[12.5px] text-foreground-muted">Can&apos;t find it? Check your spam or promotions folder.</p>
    </div>
  );
}

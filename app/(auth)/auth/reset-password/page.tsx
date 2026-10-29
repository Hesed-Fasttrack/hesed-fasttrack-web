"use client";

import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { AuthHeading } from "../../_components/auth-heading";
import { CodeInput } from "../../_components/code-input";
import { PasswordRules } from "../../_components/password-rules";
import { ResendCode } from "../../_components/resend-code";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const pendingPassword = useRef("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { code: "" } });
  const password = useWatch({ control, name: "password" }) ?? "";

  const { mutate: resetPassword, isPending: isResetting } = useSubmitData<{ token: string; password: string }, APIResponse<unknown>>({
    url: data => API_ENDPOINTS.auth.resetPassword(data.token),
    getBody: data => ({ password: data.password }),
    skipAuth: true,
    onSuccessMessage: "Password reset. Sign in with your new password",
    onSuccess: () => router.push("/auth/signin"),
  });

  // the code is exchanged for a short-lived reset token, then the token resets
  const { mutate: verifyCode, isPending: isVerifying } = useSubmitData<{ email: string; code: string }, APIResponse<{ resetToken: string }>>({
    url: API_ENDPOINTS.auth.verifyPasswordResetOtp,
    skipAuth: true,
    onSuccessMessage: "Code verified",
    onSuccess: response => resetPassword({ token: response.data.resetToken, password: pendingPassword.current }),
  });

  const { mutate: resendCode, isPending: isResending } = useSubmitData<{ email: string }, APIResponse<unknown>>({
    url: API_ENDPOINTS.auth.forgotPassword,
    skipAuth: true,
    onSuccessMessage: "A new code is on its way",
  });

  const isPending = isVerifying || isResetting;

  return (
    <div>
      <AuthHeading
        title="Set a new password"
        description={
          <>
            Enter the code we sent to <b>{email || "your email"}</b>, then choose a new password.
          </>
        }
      />

      <form
        onSubmit={handleSubmit(data => {
          pendingPassword.current = data.password;
          verifyCode({ email, code: data.code });
        })}
        className="mt-6.5"
      >
        <Controller control={control} name="code" render={({ field }) => <CodeInput value={field.value} onChange={field.onChange} error={errors.code?.message} autoFocus />} />
        <ResendCode onResend={() => email && resendCode({ email })} isResending={isResending} changeHref="/auth/forgot-password" />

        <div className="mt-5.5 space-y-3.5">
          <div>
            <FormInput<ResetPasswordFormValues> control={control} name="password" errors={errors} label="New password" type="password" icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" className="rounded-xl" />
            <PasswordRules value={password} />
          </div>
          <FormInput<ResetPasswordFormValues> control={control} name="confirm_password" errors={errors} label="Confirm new password" type="password" icon={Lock} placeholder="Type it again" autoComplete="new-password" className="rounded-xl" />
        </div>

        <Button type="submit" className="mt-5.5 h-11 w-full rounded-xl" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
}

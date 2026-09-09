"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const pendingPassword = useRef("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const { mutate: resetPassword, isPending: isResetting } = useSubmitData<{ token: string; password: string }, APIResponse<unknown>>({
    url: data => API_ENDPOINTS.auth.resetPassword(data.token),
    getBody: data => ({ password: data.password }),
    skipAuth: true,
    onSuccessMessage: "Password reset — sign in with your new password",
    onSuccess: () => router.push("/auth/signin"),
  });

  // the code is exchanged for a short-lived reset token, then the token resets
  const { mutate: verifyCode, isPending: isVerifying } = useSubmitData<{ email: string; code: string }, APIResponse<{ resetToken: string }>>({
    url: API_ENDPOINTS.auth.verifyPasswordResetOtp,
    skipAuth: true,
    onSuccessMessage: "Code verified",
    onSuccess: response => resetPassword({ token: response.data.resetToken, password: pendingPassword.current }),
  });

  const isPending = isVerifying || isResetting;

  return (
    <div className="rounded-2xl border border-line bg-white p-8">
      <AppText type="h2" className="text-center">
        Reset your password
      </AppText>
      <AppText type="subtitle" className="mt-1 text-center text-sm">
        Enter the code we sent to {email || "your email"} and choose a new password.
      </AppText>

      <form
        onSubmit={handleSubmit(data => {
          pendingPassword.current = data.password;
          verifyCode({ email, code: data.code });
        })}
        className="mt-8 space-y-5"
      >
        <FormInput<ResetPasswordFormValues> control={control} name="code" errors={errors} label="Reset code" icon={KeyRound} placeholder="123456" inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
        <FormInput<ResetPasswordFormValues> control={control} name="password" errors={errors} label="New password" type="password" icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" />
        <FormInput<ResetPasswordFormValues> control={control} name="confirm_password" errors={errors} label="Confirm new password" type="password" icon={Lock} placeholder="Repeat your new password" autoComplete="new-password" />

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Reset password
        </Button>
      </form>
    </div>
  );
}

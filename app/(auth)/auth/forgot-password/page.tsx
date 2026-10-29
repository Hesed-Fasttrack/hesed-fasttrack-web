"use client";

import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthHeading } from "../../_components/auth-heading";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const { mutate: sendCode, isPending } = useSubmitData<ForgotPasswordFormValues, APIResponse<unknown>>({
    url: API_ENDPOINTS.auth.forgotPassword,
    skipAuth: true,
    onSuccessMessage: "If that account exists, a reset code is on its way",
    onSuccess: () => router.push(`/auth/reset-password?email=${encodeURIComponent(getValues("email"))}`),
  });

  return (
    <div>
      <AuthHeading icon={KeyRound} title="Forgot your password?" description="Enter the email on your account and we'll send you a 6-digit code to reset it." />

      <form onSubmit={handleSubmit(data => sendCode(data))} className="mt-6.5 space-y-3.5">
        <FormInput<ForgotPasswordFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" className="rounded-xl" />

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Send reset code
        </Button>
      </form>
    </div>
  );
}

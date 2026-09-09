"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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
    <div className="rounded-2xl border border-line bg-white p-8">
      <AppText type="h2" className="text-center">
        Forgot your password?
      </AppText>
      <AppText type="subtitle" className="mt-1 text-center text-sm">
        Enter your email and we'll send you a reset code.
      </AppText>

      <form onSubmit={handleSubmit(data => sendCode(data))} className="mt-8 space-y-5">
        <FormInput<ForgotPasswordFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" />

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Send reset code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/auth/signin" className="font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

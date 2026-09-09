"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLogin } from "./_hooks/use-login";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const { login, isLoggingIn } = useLogin({ callbackUrl, onSuccess: () => reset() });

  return (
    <div className="rounded-2xl border border-line bg-white p-8">
      <AppText type="h2" className="text-center">
        Good to see you again
      </AppText>
      <AppText type="subtitle" className="mt-1 text-center text-sm">
        Sign in to ship, pay and track from one place.
      </AppText>

      <form onSubmit={handleSubmit(data => login(data))} className="mt-8 space-y-5">
        <FormInput<LoginFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" />
        <FormInput<LoginFormValues> control={control} name="password" errors={errors} label="Password" type="password" icon={Lock} placeholder="Your password" autoComplete="current-password" />

        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoggingIn}>
          {isLoggingIn && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to HESED FastTrack?{" "}
        <Link href="/auth/signup" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

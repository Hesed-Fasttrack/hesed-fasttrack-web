"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { AppInput } from "@/components/shared/app-input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/show-toast";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "./_hooks/use-login";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const { login, isLoggingIn, verifyOtp, isVerifyingOtp } = useLogin({
    callbackUrl,
    onSuccess: () => reset(),
    onOtpRequired: email => {
      setOtpEmail(email);
      setOtpCode("");
      showToast("success", "We sent a sign-in code to your email");
    },
  });

  const handleVerifyOtp = function (event: React.FormEvent) {
    event.preventDefault();
    if (!otpEmail) return;
    if (otpCode.trim().length < 6) return showToast("warning", "Enter the 6-digit code from your email");
    verifyOtp({ email: otpEmail, code: otpCode.trim() });
  };

  if (otpEmail) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8">
        <AppText type="h2" className="text-center">
          Check your email
        </AppText>
        <AppText type="subtitle" className="mt-1 text-center text-sm">
          Admin sign-ins need a second step. Enter the code we sent to {otpEmail}.
        </AppText>

        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
          <AppInput label="Sign-in code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" value={otpCode} onChange={event => setOtpCode(event.target.value.replace(/\D/g, ""))} />

          <Button type="submit" className="h-11 w-full" disabled={isVerifyingOtp}>
            {isVerifyingOtp && <Loader2 className="animate-spin" />}
            Verify and sign in
          </Button>
        </form>

        <button type="button" onClick={() => setOtpEmail(null)} className="mt-6 block w-full text-center text-sm font-medium text-brand hover:underline">
          Back to sign in
        </button>
      </div>
    );
  }

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

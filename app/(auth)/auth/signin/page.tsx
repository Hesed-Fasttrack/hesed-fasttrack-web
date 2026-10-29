"use client";

import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/show-toast";
import { loginSchema, type LoginFormValues } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AuthHeading } from "../../_components/auth-heading";
import { CodeInput } from "../../_components/code-input";
import { ResendCode } from "../../_components/resend-code";
import { useLogin } from "./_hooks/use-login";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const {
    control,
    handleSubmit,
    getValues,
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
      <div>
        <button type="button" onClick={() => setOtpEmail(null)} className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground-muted transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />
          Use a different account
        </button>

        <AuthHeading
          icon={ShieldCheck}
          title="Enter your sign-in code"
          description={
            <>
              For your security we sent a 6-digit code to <b>{otpEmail}</b>.
            </>
          }
        />

        <form onSubmit={handleVerifyOtp} className="mt-6.5">
          <CodeInput value={otpCode} onChange={setOtpCode} autoFocus />
          <ResendCode onResend={() => login(getValues())} isResending={isLoggingIn} />

          <Button type="submit" className="mt-5.5 h-11 w-full rounded-xl" disabled={isVerifyingOtp}>
            {isVerifyingOtp && <Loader2 className="animate-spin" />}
            Verify and sign in
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading icon={LogIn} eyebrow="Welcome back" title="Sign in to your account" description="Pick up where you left off: your shipments, wallet and quotes." />

      <form onSubmit={handleSubmit(data => login(data))} className="mt-6.5 space-y-3.5">
        <FormInput<LoginFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" className="rounded-xl" />

        <div className="relative">
          <FormInput<LoginFormValues> control={control} name="password" errors={errors} label="Password" type="password" icon={Lock} placeholder="Your password" autoComplete="current-password" className="rounded-xl" />
          <Link href="/auth/forgot-password" className="absolute top-0 right-0 text-[12.5px] font-semibold text-brand hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl" disabled={isLoggingIn}>
          {isLoggingIn ? <Loader2 className="animate-spin" /> : null}
          Sign in
          {!isLoggingIn && <ArrowRight />}
        </Button>
      </form>
    </div>
  );
}

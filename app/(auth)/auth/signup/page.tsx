"use client";

import { FormInput } from "@/components/form/form-input";
import { AppText } from "@/components/shared/app-text";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { signupSchema, type SignupFormValues } from "@/schemas/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function SignUpPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { accepted_terms: false },
  });

  // client "mobile" selects the server's code-first verification flow
  const { mutate: signup, isPending } = useSubmitData<Record<string, unknown>, APIResponse<unknown>>({
    url: API_ENDPOINTS.auth.signup,
    skipAuth: true,
    onSuccessMessage: "Account created — check your email for a code",
    onSuccess: () => router.push(`/auth/verify-email?email=${encodeURIComponent(getValues("email"))}`),
  });

  const onSubmit = function (data: SignupFormValues) {
    signup({
      full_name: data.full_name,
      email: data.email,
      phone_no: data.phone_no || undefined,
      password: data.password,
      accepted_terms: data.accepted_terms,
      client: "mobile",
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-8">
      <AppText type="h2" className="text-center">
        Create your account
      </AppText>
      <AppText type="subtitle" className="mt-1 text-center text-sm">
        Quotes in seconds, shipping in minutes.
      </AppText>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <FormInput<SignupFormValues> control={control} name="full_name" errors={errors} label="Full name" icon={UserRound} placeholder="Ada Obi" autoComplete="name" />
        <FormInput<SignupFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" />
        <FormInput<SignupFormValues> control={control} name="phone_no" errors={errors} label="Phone (optional)" type="tel" icon={Phone} placeholder="0801 234 5678" autoComplete="tel" />
        <FormInput<SignupFormValues> control={control} name="password" errors={errors} label="Password" type="password" icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" />
        <FormInput<SignupFormValues> control={control} name="confirm_password" errors={errors} label="Confirm password" type="password" icon={Lock} placeholder="Repeat your password" autoComplete="new-password" />

        <FormInput<SignupFormValues> control={control} name="accepted_terms" errors={errors} type="checkbox" label="I agree to the Terms & Conditions and Privacy Policy" />

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

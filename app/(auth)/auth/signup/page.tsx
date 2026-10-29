"use client";

import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { signupSchema, type SignupFormValues } from "@/schemas/auth";
import type { APIResponse } from "@/types/response";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Lock, Mail, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { AuthHeading } from "../../_components/auth-heading";
import { PasswordRules } from "../../_components/password-rules";

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
  const password = useWatch({ control, name: "password" }) ?? "";

  // client "mobile" selects the server's code-first verification flow
  const { mutate: signup, isPending } = useSubmitData<Record<string, unknown>, APIResponse<unknown>>({
    url: API_ENDPOINTS.auth.signup,
    skipAuth: true,
    onSuccessMessage: "Account created. Check your email for a code",
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
    <div>
      <AuthHeading title="Create your account" description="Quotes, bookings and tracking, all from one place." />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6.5 space-y-3.5">
        <FormInput<SignupFormValues> control={control} name="full_name" errors={errors} label="Full name" icon={UserRound} placeholder="Ada Obi" autoComplete="name" className="rounded-xl" />
        <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-3">
          <FormInput<SignupFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="you@example.com" autoComplete="email" className="rounded-xl" />
          <FormInput<SignupFormValues> control={control} name="phone_no" errors={errors} label="Phone (optional)" type="tel" icon={Phone} placeholder="0801 234 5678" autoComplete="tel" className="rounded-xl" />
        </div>
        <div>
          <FormInput<SignupFormValues> control={control} name="password" errors={errors} label="Password" type="password" icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" className="rounded-xl" />
          <PasswordRules value={password} />
        </div>
        <FormInput<SignupFormValues> control={control} name="confirm_password" errors={errors} label="Confirm password" type="password" icon={Lock} placeholder="Type it again" autoComplete="new-password" className="rounded-xl" />

        <FormInput<SignupFormValues> control={control} name="accepted_terms" errors={errors} type="checkbox" label="I agree to the Terms & Conditions and Privacy Policy" />

        <Button type="submit" className="mt-2 h-11 w-full rounded-xl" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Create account
          {!isPending && <ArrowRight />}
        </Button>
      </form>
    </div>
  );
}

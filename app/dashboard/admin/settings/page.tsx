"use client";

import { FormInput } from "@/components/form/form-input";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().optional(),
  phone_no: z.string().trim().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Your current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+.])[A-Za-z\d@$!%*?&#^()\-_=+.]{8,}$/, "Password must include at least one letter, one number and one special character"),
    confirm_password: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.confirm_password !== data.new_password) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirm_password"] });
    }
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AdminSettingsPage() {
  const { profile } = useGetProfile();

  const profileForm = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), defaultValues: { first_name: "", last_name: "", phone_no: "" } });
  const passwordForm = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (!profile) return;
    profileForm.reset({ first_name: profile.first_name ?? "", last_name: profile.last_name ?? "", phone_no: profile.phone_no ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const { mutate: updateProfile, isPending: isSavingProfile } = useSubmitData<ProfileFormValues, unknown>({
    url: API_ENDPOINTS.auth.updateProfile,
    method: "put",
    onSuccessMessage: "Profile updated",
    additionalQueryKeys: [[API_ENDPOINTS.auth.getProfile]],
  });

  const { mutate: updatePassword, isPending: isSavingPassword } = useSubmitData<{ current_password: string; new_password: string }, unknown>({
    url: API_ENDPOINTS.auth.updatePassword,
    method: "put",
    onSuccessMessage: "Password changed",
    onSuccess: () => passwordForm.reset(),
  });

  return (
    <div>
      <PageHeader title="Settings" description="Your admin account and security." />

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="text-sm font-semibold text-foreground">Profile</p>
          <form onSubmit={profileForm.handleSubmit(data => updateProfile({ ...data, last_name: data.last_name || undefined, phone_no: data.phone_no || undefined }))} className="mt-4 space-y-4">
            <FormInput<ProfileFormValues> control={profileForm.control} name="first_name" errors={profileForm.formState.errors} label="First name" />
            <FormInput<ProfileFormValues> control={profileForm.control} name="last_name" errors={profileForm.formState.errors} label="Last name" />
            <FormInput<ProfileFormValues> control={profileForm.control} name="phone_no" errors={profileForm.formState.errors} label="Phone" type="tel" />
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="text-sm font-semibold text-foreground">Change password</p>
          <form onSubmit={passwordForm.handleSubmit(data => updatePassword({ current_password: data.current_password, new_password: data.new_password }))} className="mt-4 space-y-4">
            <FormInput<PasswordFormValues> control={passwordForm.control} name="current_password" errors={passwordForm.formState.errors} label="Current password" type="password" icon={Lock} />
            <FormInput<PasswordFormValues> control={passwordForm.control} name="new_password" errors={passwordForm.formState.errors} label="New password" type="password" icon={Lock} />
            <FormInput<PasswordFormValues> control={passwordForm.control} name="confirm_password" errors={passwordForm.formState.errors} label="Confirm new password" type="password" icon={Lock} />
            <Button type="submit" disabled={isSavingPassword}>
              {isSavingPassword && <Loader2 className="animate-spin" />}
              Change password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { FormInput } from "@/components/form/form-input";
import { AppDialog } from "@/components/shared/app-dialog";
import { AppInput } from "@/components/shared/app-input";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetProfile } from "@/hooks/use-get-profile";
import { useSubmitData } from "@/hooks/use-submit-data";
import { clearAuthCookies } from "@/lib/authService";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { showToast } from "@/lib/show-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function CustomerSettingsPage() {
  const { profile } = useGetProfile();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

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

  const { mutate: deleteAccount, isPending: isDeleting } = useSubmitData<{ password: string; reason: string }, unknown>({
    url: API_ENDPOINTS.auth.deleteAccount,
    onSuccessMessage: "Your account has been deleted",
    onSuccess: () => {
      clearAuthCookies();
      window.location.href = "/";
    },
  });

  const handleDelete = function () {
    if (!deletePassword) return showToast("warning", "Confirm with your password");
    if (deleteReason.trim().length < 5) return showToast("warning", "Tell us why you're leaving");
    deleteAccount({ password: deletePassword, reason: deleteReason.trim() });
  };

  return (
    <div>
      <PageHeader title="Settings" description="Your account, security and data." />

      <div className="grid max-w-5xl gap-5 lg:grid-cols-2">
        <SectionCard title="Profile" description={profile?.email ? `Signed in as ${profile.email}` : "Your name and phone number"}>
          <form onSubmit={profileForm.handleSubmit(data => updateProfile({ ...data, last_name: data.last_name || undefined, phone_no: data.phone_no || undefined }))} className="space-y-4 p-5 sm:p-5.5">
            <FormInput<ProfileFormValues> control={profileForm.control} name="first_name" errors={profileForm.formState.errors} label="First name" />
            <FormInput<ProfileFormValues> control={profileForm.control} name="last_name" errors={profileForm.formState.errors} label="Last name" />
            <FormInput<ProfileFormValues> control={profileForm.control} name="phone_no" errors={profileForm.formState.errors} label="Phone" type="tel" />
            <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSavingProfile}>
              {isSavingProfile && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Change password" description="Use at least 8 characters with a letter, a number and a symbol">
          <form onSubmit={passwordForm.handleSubmit(data => updatePassword({ current_password: data.current_password, new_password: data.new_password }))} className="space-y-4 p-5 sm:p-5.5">
            <FormInput<PasswordFormValues> control={passwordForm.control} name="current_password" errors={passwordForm.formState.errors} label="Current password" type="password" icon={Lock} />
            <FormInput<PasswordFormValues> control={passwordForm.control} name="new_password" errors={passwordForm.formState.errors} label="New password" type="password" icon={Lock} />
            <FormInput<PasswordFormValues> control={passwordForm.control} name="confirm_password" errors={passwordForm.formState.errors} label="Confirm new password" type="password" icon={Lock} />
            <Button type="submit" className="h-10 rounded-xl px-5" disabled={isSavingPassword}>
              {isSavingPassword && <Loader2 className="animate-spin" />}
              Change password
            </Button>
          </form>
        </SectionCard>

        <section className="flex flex-col gap-4 rounded-2xl border border-danger/30 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-5.5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex size-9.5 shrink-0 items-center justify-center rounded-[10px] bg-danger/10 text-danger">
              <TriangleAlert className="size-4.5" />
            </span>
            <div>
              <p className="text-[15px] font-bold tracking-tight text-danger">Danger zone</p>
              <p className="mt-0.5 text-[12.5px] text-foreground-muted">Deleting your account is permanent. Withdraw any wallet balance first.</p>
            </div>
          </div>
          <Button variant="destructive" className="h-10 shrink-0 rounded-xl px-5" onClick={() => setIsDeleteOpen(true)}>
            Delete account
          </Button>
        </section>
      </div>

      <AppDialog
        isOpen={isDeleteOpen}
        onOpenChange={isOpen => !isOpen && setIsDeleteOpen(false)}
        title="Delete your account?"
        icon={TriangleAlert} tone="danger"
        description="This permanently removes your profile, addresses, wallet history and documents. It cannot be undone."
        isSubmitting={isDeleting}
        dialogFooter={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Keep my account
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="animate-spin" />}
              Delete forever
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <AppInput label="Confirm with your password" type="password" value={deletePassword} onChange={event => setDeletePassword(event.target.value)} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-reason">Why are you leaving?</Label>
            <Textarea id="delete-reason" placeholder="Tell us what didn't work for you" value={deleteReason} onChange={event => setDeleteReason(event.target.value)} rows={3} />
          </div>
        </div>
      </AppDialog>
    </div>
  );
}

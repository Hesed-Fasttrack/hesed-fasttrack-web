"use client";

import { FormInput } from "@/components/form/form-input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/shared/app-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetData } from "@/hooks/use-get-data";
import { useSubmitData } from "@/hooks/use-submit-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime } from "@/lib/format";
import { ACCOUNT_STATUS } from "@/lib/statuses";
import { buildQuery } from "@/lib/utils";
import { displayName, type AdminRow, type PaginatedResponse } from "@/types/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, Plus, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const COLUMNS = 5;

const createAdminSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("A valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+.])[A-Za-z\d@$!%*?&#^()\-_=+.]{8,}$/, "Password must include at least one letter, one number and one special character"),
});

type CreateAdminFormValues = z.infer<typeof createAdminSchema>;

export default function AdminManagementPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState<AdminRow | null>(null);
  const [removing, setRemoving] = useState<AdminRow | null>(null);

  const query = buildQuery({ page, limit: 10 });
  const listUrl = `${API_ENDPOINTS.admin.admins.list}${query}`;

  const { data, isFetching } = useGetData<PaginatedResponse<AdminRow>>({ url: listUrl });
  const admins = data?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormValues>({ resolver: zodResolver(createAdminSchema) });

  const { mutate: createAdmin, isPending: isCreating } = useSubmitData<CreateAdminFormValues, unknown>({
    url: API_ENDPOINTS.admin.admins.create,
    onSuccessMessage: "Admin created — share their sign-in details securely",
    additionalQueryKeys: [[listUrl]],
    onSuccess: () => {
      reset();
      setIsCreateOpen(false);
    },
  });

  const isSuspending = togglingStatus?.account_status === "ACTIVE";

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useSubmitData<{ id: string; account_status: string }, unknown>({
    url: variables => API_ENDPOINTS.admin.admins.updateStatus(variables.id),
    getBody: variables => ({ account_status: variables.account_status }),
    method: "patch",
    onSuccessMessage: isSuspending ? "Admin suspended" : "Admin reinstated",
    additionalQueryKeys: [[listUrl]],
    onSuccess: () => setTogglingStatus(null),
  });

  const { mutate: removeAdmin, isPending: isRemoving } = useSubmitData<{ id: string }, unknown>({
    url: variables => API_ENDPOINTS.admin.admins.remove(variables.id),
    method: "delete",
    getBody: () => undefined,
    onSuccessMessage: "Admin removed",
    additionalQueryKeys: [[listUrl]],
    onSuccess: () => setRemoving(null),
  });

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Only you can create, suspend or remove admin accounts."
        action={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus />
            Add admin
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && admins.length === 0 ? (
              <TableSkeletonRows columns={COLUMNS} />
            ) : admins.length === 0 ? (
              <TableEmptyRow columns={COLUMNS} message="No admins yet — add the first one." />
            ) : (
              admins.map(admin => {
                const status = ACCOUNT_STATUS[admin.account_status];
                return (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{displayName(admin)}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <StatusBadge label={status.label} className={status.className} />
                    </TableCell>
                    <TableCell>{admin.lastLogin ? formatDateTime(admin.lastLogin) : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setTogglingStatus(admin)}>
                          {admin.account_status === "ACTIVE" ? "Suspend" : "Reinstate"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRemoving(admin)}>
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <PaginationControls page={data?.page ?? 1} totalPages={data?.totalPages ?? 1} total={data?.total ?? 0} onPageChange={setPage} />
      </div>

      <AppDialog
        isOpen={isCreateOpen}
        onOpenChange={isOpen => !isOpen && setIsCreateOpen(false)}
        title="Add an admin"
        description="The account is verified from birth — share the email and password with them securely. They can change the password after signing in."
        isSubmitting={isCreating}
        dialogFooter={
          <>
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" form="create-admin-form" disabled={isCreating}>
              {isCreating && <Loader2 className="animate-spin" />}
              Create admin
            </Button>
          </>
        }
      >
        <form id="create-admin-form" onSubmit={handleSubmit(data => createAdmin(data))} className="space-y-4">
          <FormInput<CreateAdminFormValues> control={control} name="full_name" errors={errors} label="Full name" icon={UserRound} placeholder="Ops Admin" />
          <FormInput<CreateAdminFormValues> control={control} name="email" errors={errors} label="Email" type="email" icon={Mail} placeholder="ops@hesedfasttrack.com" />
          <FormInput<CreateAdminFormValues> control={control} name="password" errors={errors} label="Temporary password" type="password" icon={Lock} placeholder="At least 8 characters" />
        </form>
      </AppDialog>

      <ConfirmDialog
        open={!!togglingStatus}
        title={isSuspending ? "Suspend this admin?" : "Reinstate this admin?"}
        description={isSuspending ? `${displayName(togglingStatus)} is signed out immediately and cannot sign in until reinstated.` : `${displayName(togglingStatus)} will be able to sign in again.`}
        confirmLabel={isSuspending ? "Suspend" : "Reinstate"}
        isDestructive={isSuspending}
        isLoading={isUpdatingStatus}
        onConfirm={() => togglingStatus && updateStatus({ id: togglingStatus.id, account_status: isSuspending ? "SUSPENDED" : "ACTIVE" })}
        onCancel={() => setTogglingStatus(null)}
      />

      <ConfirmDialog
        open={!!removing}
        title="Remove this admin?"
        description={`${displayName(removing)}'s account is deleted permanently. This cannot be undone.`}
        confirmLabel="Remove admin"
        isDestructive
        isLoading={isRemoving}
        onConfirm={() => removing && removeAdmin({ id: removing.id })}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}

"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableCard } from "@/components/shared/table-card";
import { EmptyState, TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime, formatNaira } from "@/lib/format";
import { WITHDRAWAL_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { PaginatedResponse } from "@/types/admin";
import type { CustomerTransaction, CustomerWithdrawal, Wallet } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { ArrowLeftRight, Banknote, Clock, PiggyBank } from "lucide-react";
import { useState } from "react";
import { WalletCard } from "../_components/wallet-card";

type WalletTab = "transactions" | "withdrawals";

const TABS: { value: WalletTab; label: string }[] = [
  { value: "transactions", label: "Transactions" },
  { value: "withdrawals", label: "Withdrawals" },
];

const transactionLabel = (type: string) => type.toLowerCase().replaceAll("_", " ");

const ListSkeleton = function () {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 rounded-xl" />
      ))}
    </div>
  );
};

export default function CustomerWalletPage() {
  const [tab, setTab] = useState<WalletTab>("transactions");

  const { data: walletData } = useGetData<APIResponse<Wallet>>({ url: API_ENDPOINTS.customer.wallet.balance });
  const wallet = walletData?.data;

  const { data: transactionsData, isFetching: isFetchingTransactions } = useGetData<PaginatedResponse<CustomerTransaction>>({
    url: API_ENDPOINTS.customer.wallet.transactions,
  });
  const transactions = transactionsData?.data ?? [];

  const { data: withdrawalsData, isFetching: isFetchingWithdrawals } = useGetData<PaginatedResponse<CustomerWithdrawal>>({
    url: API_ENDPOINTS.customer.wallet.withdrawals,
  });
  const withdrawals = withdrawalsData?.data ?? [];
  const pendingWithdrawals = withdrawals.filter(withdrawal => withdrawal.status === "PENDING" || withdrawal.status === "PROCESSING");

  const isLoadingTransactions = isFetchingTransactions && transactions.length === 0;
  const isLoadingWithdrawals = isFetchingWithdrawals && withdrawals.length === 0;

  return (
    <div>
      <PageHeader title="Wallet" description="Fund once by bank transfer. Every booking settles instantly." />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <WalletCard wallet={wallet} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard label="Lifetime funded" icon={PiggyBank} value={wallet ? formatNaira(wallet.lifetime_funded_minor) : "-"} hint="Everything you've added to your wallet" />
          <StatCard
            label="Withdrawals in progress"
            icon={Clock}
            value={withdrawalsData ? String(pendingWithdrawals.length) : "-"}
            hint={pendingWithdrawals.length > 0 ? `${formatNaira(pendingWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount_minor, 0))} on its way to your bank` : "Nothing pending"}
          />
        </div>
      </div>

      <TableCard
        className="mt-5"
        title="Activity"
        description={tab === "transactions" ? "Every credit and debit on your wallet" : "Money sent from your wallet to your bank"}
        toolbar={
          <div role="tablist" aria-label="Wallet activity" className="inline-flex w-full rounded-[10px] bg-surface-muted p-0.75 sm:w-auto">
            {TABS.map(entry => (
              <button
                key={entry.value}
                type="button"
                role="tab"
                aria-selected={tab === entry.value}
                onClick={() => setTab(entry.value)}
                className={cn("h-7.5 flex-1 rounded-lg px-3 text-[12.5px] font-semibold transition-colors sm:flex-none", tab === entry.value ? "bg-white text-foreground shadow-xs" : "text-foreground-muted hover:text-foreground")}
              >
                {entry.label}
              </button>
            ))}
          </div>
        }
      >
        {tab === "transactions" ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTransactions ? (
                    <TableSkeletonRows columns={4} />
                  ) : transactions.length === 0 ? (
                    <TableEmptyRow columns={4} icon={ArrowLeftRight} title="No transactions yet" message="Fund your wallet by bank transfer to get started." />
                  ) : (
                    transactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium capitalize">{transactionLabel(transaction.type)}</TableCell>
                        <TableCell className="max-w-72 truncate text-foreground-muted">{transaction.narration ?? "-"}</TableCell>
                        <TableCell className="text-foreground-muted">{formatDateTime(transaction.createdAt)}</TableCell>
                        <TableCell className={cn("text-right font-semibold tabular-nums", transaction.amount_minor > 0 ? "text-emerald" : "text-danger")}>
                          {transaction.amount_minor > 0 ? "+" : ""}
                          {formatNaira(transaction.amount_minor)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden">
              {isLoadingTransactions ? (
                <ListSkeleton />
              ) : transactions.length === 0 ? (
                <EmptyState icon={ArrowLeftRight} title="No transactions yet" message="Fund your wallet by bank transfer to get started." />
              ) : (
                <ul className="divide-y divide-line">
                  {transactions.map(transaction => (
                    <li key={transaction.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground capitalize">{transactionLabel(transaction.type)}</p>
                        <p className="mt-0.5 truncate text-xs text-foreground-muted">{transaction.narration ?? formatDateTime(transaction.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className={cn("text-sm font-semibold tabular-nums", transaction.amount_minor > 0 ? "text-emerald" : "text-danger")}>
                          {transaction.amount_minor > 0 ? "+" : ""}
                          {formatNaira(transaction.amount_minor)}
                        </span>
                        {transaction.narration && <span className="text-[11.5px] text-foreground-subtle">{formatDateTime(transaction.createdAt)}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingWithdrawals ? (
                    <TableSkeletonRows columns={4} />
                  ) : withdrawals.length === 0 ? (
                    <TableEmptyRow columns={4} icon={Banknote} title="No withdrawals yet" message="Money you send to your bank account shows up here." />
                  ) : (
                    withdrawals.map(withdrawal => {
                      const presentation = WITHDRAWAL_STATUS[withdrawal.status];
                      return (
                        <TableRow key={withdrawal.id}>
                          <TableCell>
                            <p className="text-sm font-medium">{withdrawal.account_name}</p>
                            <p className="text-xs text-foreground-muted">
                              {withdrawal.bank_name} · {withdrawal.account_number}
                            </p>
                          </TableCell>
                          <TableCell>
                            <StatusBadge label={presentation.label} className={presentation.className} />
                            {withdrawal.rejection_reason && <p className="mt-1 max-w-56 text-xs whitespace-normal text-foreground-muted">{withdrawal.rejection_reason}</p>}
                          </TableCell>
                          <TableCell className="text-foreground-muted">{formatDateTime(withdrawal.createdAt)}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">{formatNaira(withdrawal.amount_minor)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden">
              {isLoadingWithdrawals ? (
                <ListSkeleton />
              ) : withdrawals.length === 0 ? (
                <EmptyState icon={Banknote} title="No withdrawals yet" message="Money you send to your bank account shows up here." />
              ) : (
                <ul className="divide-y divide-line">
                  {withdrawals.map(withdrawal => {
                    const presentation = WITHDRAWAL_STATUS[withdrawal.status];
                    return (
                      <li key={withdrawal.id} className="px-5 py-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{withdrawal.account_name}</p>
                            <p className="mt-0.5 truncate text-xs text-foreground-muted">
                              {withdrawal.bank_name} · {withdrawal.account_number}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-sm font-semibold text-foreground tabular-nums">{formatNaira(withdrawal.amount_minor)}</span>
                            <StatusBadge label={presentation.label} className={presentation.className} />
                          </div>
                        </div>
                        {withdrawal.rejection_reason && <p className="mt-1.5 text-xs text-foreground-muted">{withdrawal.rejection_reason}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </TableCard>
    </div>
  );
}

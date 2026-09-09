"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableEmptyRow, TableSkeletonRows } from "@/components/shared/table-helpers";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetData } from "@/hooks/use-get-data";
import { API_ENDPOINTS } from "@/lib/endpoints";
import { formatDateTime, formatNaira } from "@/lib/format";
import { WITHDRAWAL_STATUS } from "@/lib/statuses";
import { cn } from "@/lib/utils";
import type { PaginatedResponse } from "@/types/admin";
import type { CustomerTransaction, CustomerWithdrawal, Wallet } from "@/types/customer";
import type { APIResponse } from "@/types/response";
import { ArrowDownToLine, Plus } from "lucide-react";
import { useState } from "react";
import { FundingDialog } from "./_components/funding-dialog";
import { WithdrawDialog } from "./_components/withdraw-dialog";

export default function CustomerWalletPage() {
  const [isFundingOpen, setIsFundingOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

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

  return (
    <div>
      <PageHeader title="Wallet" description="Fund once by bank transfer — every booking settles instantly." />

      <div className="rounded-2xl bg-brand p-6 text-white">
        <p className="text-sm font-medium text-[#E4D8F2]">Available balance</p>
        <p className="mt-2 text-4xl font-bold">{wallet ? formatNaira(wallet.available_minor) : "—"}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button className="bg-white text-brand hover:bg-white/90" onClick={() => setIsFundingOpen(true)}>
            <Plus />
            Fund wallet
          </Button>
          <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => setIsWithdrawOpen(true)}>
            <ArrowDownToLine />
            Withdraw
          </Button>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="mt-6">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Narration</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetchingTransactions && transactions.length === 0 ? (
                  <TableSkeletonRows columns={4} />
                ) : transactions.length === 0 ? (
                  <TableEmptyRow columns={4} message="No transactions yet — fund your wallet to get started." />
                ) : (
                  transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium capitalize">{transaction.type.toLowerCase().replaceAll("_", " ")}</TableCell>
                      <TableCell className={cn("font-semibold", transaction.amount_minor > 0 ? "text-emerald" : "text-danger")}>
                        {transaction.amount_minor > 0 ? "+" : ""}
                        {formatNaira(transaction.amount_minor)}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{transaction.narration ?? "—"}</TableCell>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="withdrawals">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetchingWithdrawals && withdrawals.length === 0 ? (
                  <TableSkeletonRows columns={4} />
                ) : withdrawals.length === 0 ? (
                  <TableEmptyRow columns={4} message="No withdrawals yet." />
                ) : (
                  withdrawals.map(withdrawal => {
                    const presentation = WITHDRAWAL_STATUS[withdrawal.status];
                    return (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-semibold">{formatNaira(withdrawal.amount_minor)}</TableCell>
                        <TableCell>
                          <p className="text-sm">{withdrawal.account_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {withdrawal.bank_name} · {withdrawal.account_number}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge label={presentation.label} className={presentation.className} />
                          {withdrawal.rejection_reason && <p className="mt-1 max-w-48 text-xs text-muted-foreground">{withdrawal.rejection_reason}</p>}
                        </TableCell>
                        <TableCell>{formatDateTime(withdrawal.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <FundingDialog wallet={wallet} open={isFundingOpen} onClose={() => setIsFundingOpen(false)} />
      <WithdrawDialog open={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
    </div>
  );
}

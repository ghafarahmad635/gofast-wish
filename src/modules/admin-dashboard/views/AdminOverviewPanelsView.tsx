'use client';

import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatDateTime = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const formatMoney = (n: number, currency?: string | null) => {
  const c = (currency ?? "usd").toUpperCase();
  return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);
};

const planBadgeVariant = (plan: string) => {
  const v = plan.toLowerCase();
  if (v.includes("pro")) return "default";
  if (v.includes("standard")) return "secondary";
  return "outline";
};

const statusBadgeVariant = (status: string) => {
  const v = String(status ?? "").toLowerCase();
  if (["paid", "succeeded", "success"].includes(v)) return "default";
  if (["trialing", "active"].includes(v)) return "secondary";
  if (["failed", "past_due", "unpaid", "canceled", "cancelled", "void"].includes(v)) return "destructive";
  return "outline";
};

export default function AdminOverviewPanelsView() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.adminDashboard.overview.queryOptions({
      recentUsersLimit: 10,
      recentOrdersLimit: 10,
      attentionLimit: 12,
    })
  );

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Recent Users */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Recent signups</CardTitle>
          <Link href="/admin/users" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[110px]">Plan</TableHead>
                  <TableHead className="w-[110px]">Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(u.createdAt)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={planBadgeVariant(u.plan)}>{u.plan}</Badge>
                    </TableCell>

                    <TableCell>
                      {u.emailVerified ? (
                        <Badge variant="secondary">Verified</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                      {u.banned ? <div className="mt-1"><Badge variant="destructive">Banned</Badge></div> : null}
                    </TableCell>
                  </TableRow>
                ))}
                {!data.recentUsers.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                      No recent users.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Recent orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="w-[120px]">Amount</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.recentOrders.map((o) => {
                  const email = o.user?.email ?? o.customerEmail ?? "Unknown";
                  const name = o.user?.name ?? o.customerName ?? "Customer";
                  return (
                    <TableRow key={o.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{name}</span>
                          <span className="text-xs text-muted-foreground">{email}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatMoney(o.amount, o.currency)}
                      </TableCell>

                      <TableCell>
                        <Badge variant={statusBadgeVariant(o.status)}>{String(o.status)}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!data.recentOrders.length ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                      No recent orders.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Attention Needed */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Attention needed</CardTitle>
          <div className="text-sm text-muted-foreground">{data.attention.length} items</div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            {data.attention.map((a, idx) => (
              <Link
                key={idx}
                href={a.href}
                className="block rounded-lg border p-3 transition hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.detail}</div>
                  </div>

                  <Badge variant="outline">{a.type}</Badge>
                </div>
              </Link>
            ))}

            {!data.attention.length ? (
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                No issues detected. Nice.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export const AdminOverviewPanelsViewLoading = () => {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 6 }).map((__, j) => (
              <div key={j} className="rounded-lg border p-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-2 h-3 w-64" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </section>
  );
};

export const AdminOverviewPanelsViewError = () => {
  return (
    <ErrorState
      title="Could not load admin overview"
      description="Check adminDashboard.overview and database connectivity."
    />
  );
};

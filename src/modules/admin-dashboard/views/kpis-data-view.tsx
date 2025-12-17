'use client';

import Link from "next/link";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Kpi, KpiCard, kpiPresets } from "../ui/components/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";



const formatNumber = (n: number) => new Intl.NumberFormat().format(n);

const formatMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);


const KpisDataView = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.adminDashboard.kpis.queryOptions());

const kpis: Kpi[] = [
  {
    label: "Total Users",
    value: formatNumber(data.usersTotal),
    href: "/admin/users",
    subLabel: "All accounts",
    ...kpiPresets.totalUsers,
  },
  {
    label: "New Users (7d)",
    value: formatNumber(data.usersNew7d),
    href: "/admin/users",
    subLabel: "Created in last 7 days",
    ...kpiPresets.newUsers,
  },
  {
    label: "Email Verified",
    value: `${data.verifiedPct}%`,
    href: "/admin/users",
    subLabel: "Verification rate",
    ...kpiPresets.verified,
  },
  {
    label: "Banned Users",
    value: formatNumber(data.usersBannedCount),
    href: "/admin/users",
    subLabel: "Currently blocked",
    ...kpiPresets.banned,
  },
  {
    label: "Active Sessions",
    value: formatNumber(data.activeSessionsCount),
    href: "/admin/users",
    subLabel: "Sessions not expired",
    ...kpiPresets.sessions,
  },
  {
    label: "AddOns Enabled",
    value: formatNumber(data.addonsEnabledCount),
    href: "/admin/addons",
    subLabel: "Enabled modules",
    ...kpiPresets.addons,
  },
  {
    label: "Active Subscriptions",
    value: formatNumber(data.subscriptionsActiveCount),
    href: "/admin/subscriptions",
    subLabel: "Paying customers",
    ...kpiPresets.subsActive,
  },
  {
    label: "Trialing Subscriptions",
    value: formatNumber(data.subscriptionsTrialingCount),
    href: "/admin/subscriptions",
    subLabel: "Trials in progress",
    ...kpiPresets.subsTrial,
  },
  {
    label: "Revenue (30d)",
    value: formatMoney(data.revenue30dPaidOnly),
    href: "/admin/orders",
    subLabel: "Last 30 days",
    ...kpiPresets.revenue,
  },
  {
    label: "Failed Orders",
    value: formatNumber(data.ordersFailedCount),
    href: "/admin/orders",
    subLabel: "Needs attention",
    ...kpiPresets.failedOrders,
  },
];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <div className="text-xs text-muted-foreground">Live snapshot</div>
        </div>


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </section>
  );
};

export default KpisDataView;



export const KpisDataViewLoadingState = () => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-black/10 bg-muted p-6"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-10 w-24" />
            <Skeleton className="mt-3 h-4 w-40" />

            <div className="absolute right-5 top-5">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-black/5" />
          </div>
        ))}
      </div>
    </section>
  );
};



export const KpisDataViewErrorState = () => {
  return (
    <ErrorState
      title="Could not load dashboard KPIs"
      description="Please refresh. If the issue continues, check server logs for adminDashboard.kpis."
    />
  );
};

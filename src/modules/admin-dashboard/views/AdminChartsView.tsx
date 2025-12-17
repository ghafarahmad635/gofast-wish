'use client';

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const formatShortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const PLAN_COLORS: Record<string, string> = {
  Free: "hsl(var(--muted-foreground))",
  Standard: "hsl(var(--primary))",
  Pro: "hsl(var(--chart-2))",
};

export default function AdminChartsView() {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.adminDashboard.charts.queryOptions({
      usersDays: 30,
      revenueDays: 90,
      includeSubsBreakdown: true,
    })
  );

  const totalUsers = data.usersTotal ?? 0;
  const pct = (count: number) => {
    if (!totalUsers) return "0%";
    return `${Math.round((count / totalUsers) * 100)}%`;
  };

  return (
    <section className="space-y-4">
      {/* Middle row: 2 charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart A */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              New users (last {data.usersDays} days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.users} margin={{ left: 8, right: 8, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} minTickGap={24} />
                <YAxis allowDecimals={false} width={36} />
                <Tooltip
                  labelFormatter={(l) => formatShortDate(String(l))}
                  formatter={(v: number) => [v, "Users"]}
                />
                <Line type="monotone" dataKey="count" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart B */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Revenue (paid) last {data.revenueDays} days
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue} margin={{ left: 8, right: 8, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} minTickGap={24} />
                <YAxis width={90} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  labelFormatter={(l) => formatShortDate(String(l))}
                  formatter={(v: number) => [formatMoney(v), "Revenue"]}
                />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: plan distribution */}
      {data.subscriptionsByPlan?.length ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Plan distribution</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(v: number, _name, props: any) => {
                      const plan = props?.payload?.plan ?? "";
                      return [`${v} (${pct(v)})`, plan];
                    }}
                  />
                  <Pie
                    data={data.subscriptionsByPlan}
                    dataKey="count"
                    nameKey="plan"
                    innerRadius={62}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {data.subscriptionsByPlan.map((p, i) => (
                      <Cell key={i} fill={PLAN_COLORS[p.plan] ?? "hsl(var(--primary))"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {data.subscriptionsByPlan.map((p) => (
                <div
                  key={p.plan}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: PLAN_COLORS[p.plan] ?? "hsl(var(--primary))" }}
                    />
                    <div className="text-sm font-medium">{p.plan}</div>
                    <div className="text-xs text-muted-foreground">({pct(p.count)})</div>
                  </div>

                  <div className="text-sm font-semibold">{p.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

export const AdminChartsViewLoading = () => {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="h-[320px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-[240px] w-full" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export const AdminChartsViewError = () => {
  return (
    <ErrorState
      title="Could not load charts"
      description="Check adminDashboard.charts and database connectivity."
    />
  );
};

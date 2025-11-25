"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import type { GetManySubscription } from "../../types";

type SubscriptionRow = GetManySubscription[number];

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return null;
  return format(d, "MMM d, yyyy");
};

const shortenId = (value: string | null | undefined) => {
  if (!value) return "N/A";
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}...`;
};

export const subscriptionColumns: ColumnDef<SubscriptionRow>[] = [
  // USER
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user as
        | {
            id: string;
            name: string | null;
            email: string | null;
            image: string | null;
          }
        | null;

      if (!user) {
        return (
          <span className="text-xs text-muted-foreground">
            No linked user
          </span>
        );
      }

      const name = user.name || "Unknown user";
      const email = user.email || "No email";

      return (
        <div className="flex items-center gap-x-3">
          {user.image ? (
            <Avatar>
              <AvatarImage src={user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={name}
              variant="initials"
              className="size-9"
            />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{name}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[220px]">
              {email}
            </span>
          </div>
        </div>
      );
    },
  },

  // PLAN
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original.plan || "unknown";
      const label = plan.charAt(0).toUpperCase() + plan.slice(1);

      const isPro = plan === "pro";
      const isStandard = plan === "standard";

      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-2 py-0.5",
            isPro &&
              "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
            isStandard &&
              "bg-sky-500/10 text-sky-700 border-sky-500/30",
            !isPro &&
              !isStandard &&
              "bg-slate-500/10 text-slate-700 border-slate-500/30",
          )}
        >
          {label}
        </Badge>
      );
    },
  },

  // STATUS
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "unknown";

      const isActive = status === "active";
      const isIncomplete = status === "incomplete";
      const isCanceled = status === "canceled";

      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-2 py-0.5 capitalize",
            isActive &&
              "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
            isIncomplete &&
              "bg-amber-500/10 text-amber-700 border-amber-500/30",
            isCanceled &&
              "bg-rose-500/10 text-rose-700 border-rose-500/30",
            !isActive &&
              !isIncomplete &&
              !isCanceled &&
              "bg-slate-500/10 text-slate-700 border-slate-500/30",
          )}
        >
          {status}
        </Badge>
      );
    },
  },

  // BILLING PERIOD
  {
    id: "billingPeriod",
    header: "Billing period",
    cell: ({ row }) => {
      const start = formatDate(row.original.periodStart);
      const end = formatDate(row.original.periodEnd);

      if (!start && !end) {
        return (
          <span className="text-xs text-muted-foreground">
            Not started
          </span>
        );
      }

      return (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>
            {start || "Unknown"} → {end || "Unknown"}
          </span>
        </div>
      );
    },
  },

  // TRIAL
  {
    id: "trial",
    header: "Trial",
    cell: ({ row }) => {
      const hasTrial =
        row.original.trialStart || row.original.trialEnd;
      const trialEnd = formatDate(row.original.trialEnd);

      if (!hasTrial) {
        return (
          <span className="text-xs text-muted-foreground">
            No trial
          </span>
        );
      }

      return (
        <span className="text-xs text-muted-foreground">
          Trial until {trialEnd || "Unknown"}
        </span>
      );
    },
  },



  // RENEWAL
  {
    id: "autoRenew",
    header: "Renewal",
    cell: ({ row }) => {
      const cancelAtPeriodEnd = row.original.cancelAtPeriodEnd;

      if (cancelAtPeriodEnd) {
        return (
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-700 border-amber-500/30"
          >
            Cancels at period end
          </Badge>
        );
      }

      return (
        <Badge
          variant="outline"
          className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
        >
          Auto renew
        </Badge>
      );
    },
  },

  // CREATED
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const created = formatDate(row.original.createdAt);
      return (
        <span className="text-xs text-muted-foreground">
          {created || "Unknown"}
        </span>
      );
    },
  },

  // ACTIONS
  {
    id: "actions",
    header: "Actions",
    enableHiding: true,
    cell: () => {
      return (
        <div className="flex justify-center">
          {/* We will add real actions later */}
          <span className="text-xs text-muted-foreground">
            Actions
          </span>
        </div>
      );
    },
  },
];

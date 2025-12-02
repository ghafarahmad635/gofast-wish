"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import type { UserRow } from "./columns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ViewUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRow | null;
};

export function ViewUserDialog({
  open,
  onOpenChange,
  user,
}: ViewUserDialogProps) {
  if (!user) return null;

  const isSuperAdmin = user.role === "SUPERADMIN";
  const isBanned = !!user.banned;
  const isVerified = !!user.emailVerified;
  const isOnline = !!user.loginStatus;

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleString()
    : "Unknown";

  const banExpires =
    user.banExpires != null
      ? new Date(user.banExpires as any).toLocaleString()
      : "Never";

  const subscription = user.subscription as
    | {
        plan: string | null;
        status: string | null;
      }
    | null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={user.name || user.email}
      description="User account details"
    >
      <div className="space-y-4 text-sm">
        {/* Basic info */}
        <section className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Basic
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow label="Name" value={user.name || "Not set"} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="User ID" value={user.id} />
            <DetailRow label="Timezone" value={user.timezone || "Not set"} />
            <DetailRow label="Created at" value={createdAt} />
          </div>
        </section>

        {/* Status */}
        <section className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Status
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-x-1 text-xs",
                isSuperAdmin
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-500/10 text-slate-700 border-slate-500/30",
              )}
            >
              Role {user.role}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isVerified
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/30",
              )}
            >
              {isVerified ? "Email verified" : "Email not verified"}
            </Badge>

            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isOnline
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-500/10 text-slate-700 border-slate-500/30",
              )}
            >
              {isOnline ? "Online" : "Offline"}
            </Badge>

            {isBanned && (
              <Badge className="text-xs bg-rose-500/10 text-rose-700 border-rose-500/30">
                Banned
              </Badge>
            )}
          </div>

          {isBanned && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <DetailRow
                label="Ban reason"
                value={user.banReason || "Not provided"}
              />
              <DetailRow label="Ban expires" value={banExpires} />
            </div>
          )}
        </section>

        {/* Subscription */}
        <section className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Subscription
          </h3>
          {subscription ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <DetailRow
                label="Plan"
                value={subscription.plan || "Unknown plan"}
              />
              <DetailRow
                label="Status"
                value={subscription.status || "Unknown"}
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No active subscription. User is on free mode.
            </p>
          )}
        </section>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm break-all">{value}</span>
    </div>
  );
}

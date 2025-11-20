"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import {
  BadgeCheckIcon,
  BanIcon,
  MailIcon,
  PowerIcon,
  ShieldCheckIcon,
  ShieldIcon,
  User2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { GetManyUser } from "../../types";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import UserActions from "./user-actions";

type UserRow = GetManyUser[number];

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-x-3">
          {user.image ? (
            <Avatar>
              <AvatarImage src={user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={user.name}
              variant="initials"
              className="size-9"
            />
          )}
          <div className="flex flex-col">
            <span className="font-semibold">{user.name}</span>
            <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
              <MailIcon className="size-3" />
              <span className="truncate max-w-[220px]">{user.email}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;

      const isSuperAdmin = role === "SUPERADMIN";

      return (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-x-1 text-xs",
            isSuperAdmin
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
              : "bg-slate-500/10 text-slate-700 border-slate-500/30",
          )}
        >
          {isSuperAdmin ? (
            <ShieldCheckIcon className="size-3" />
          ) : (
            <ShieldIcon className="size-3" />
          )}
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Email",
    cell: ({ row }) => {
      const verified = row.original.emailVerified;

      return (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-x-1 text-xs",
            verified
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-700 border-amber-500/30",
          )}
        >
          {verified ? (
            <BadgeCheckIcon className="size-3" />
          ) : (
            <User2Icon className="size-3" />
          )}
          {verified ? "Verified" : "Not verified"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "loginStatus",
    header: "Login status",
    cell: ({ row }) => {
      const loggedIn = row.original.loginStatus;

      return (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-x-1 text-xs",
            loggedIn
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
              : "bg-slate-500/10 text-slate-700 border-slate-500/30",
          )}
        >
          <PowerIcon
            className={cn(
              "size-3",
              loggedIn ? "text-emerald-600" : "text-slate-500",
            )}
          />
          {loggedIn ? "Online" : "Offline"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "Ban status",
    cell: ({ row }) => {
      const banned = row.original.banned;

      if (!banned) {
        return (
          <span className="text-xs text-muted-foreground">
            Not banned
          </span>
        );
      }

      return (
        <Badge
          variant="outline"
          className="flex items-center gap-x-1 text-xs bg-rose-500/10 text-rose-700 border-rose-500/30"
        >
          <BanIcon className="size-3" />
          Banned
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
        ? new Date(row.original.createdAt)
        : null;

      return (
        <span className="text-xs text-muted-foreground">
          {createdAt ? format(createdAt, "MMM d, yyyy") : "Unknown"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: true,
    cell: ({ row }) => {
      const user = row.original;
     

     

      return (
        <div className="flex justify-center cursor-pointer">
            <UserActions
                userId={user.id}
                name={user.name}
                email={user.email}
                role={user.role}
                banned={user.banned}
                />
          
        </div>
      );
    },
  },
  {
  accessorKey: "subscription",
  header: "Plan",
  cell: ({ row }) => {
    const sub = row.original.subscription as
      | {
          plan: string | null;
          status: string | null;
        }
      | null;

    const hasPlan = !!sub;
    const planLabel = sub?.plan ?? "Free mode";
    const statusLabel = sub?.status ?? "none";

    return (
      <div className="flex flex-col">
        <span
          className={cn(
            "text-xs font-semibold",
            hasPlan ? "text-emerald-700" : "text-slate-700",
          )}
        >
          {planLabel}
        </span>

        {hasPlan && (
          <span className="text-[11px] text-muted-foreground capitalize">
            {statusLabel}
          </span>
        )}
      </div>
    );
  },
},
];

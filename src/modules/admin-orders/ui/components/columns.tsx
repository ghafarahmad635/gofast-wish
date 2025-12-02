// src/modules/admin-orders/components/columns.tsx

"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { MailIcon, ReceiptIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";

import { Button } from "@/components/ui/button";
import { OrderRow } from "../../types";

export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original;
      const user = order.user;

      const displayName =
        user?.name || order.customerName || "Unknown customer";
      const displayEmail =
        user?.email || order.customerEmail || "No email";

      return (
        <div className="flex items-center gap-x-3">
          {user?.image ? (
            <Avatar>
              <AvatarImage src={user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={displayName}
              variant="initials"
              className="size-9"
            />
          )}

          <div className="flex flex-col">
            <span className="font-semibold">{displayName}</span>
            <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
              <MailIcon className="size-3" />
              <span className="truncate max-w-[220px]">
                {displayEmail}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount ?? 0;
      const currency = row.original.currency ?? "usd";

      const formatted = new Intl.NumberFormat("en", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount);

      return (
        <span className="text-sm font-medium text-slate-800">
          {formatted}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "unknown";
      const normalized = status.toLowerCase();

      const isPaid =
        normalized === "paid" ||
        normalized === "succeeded" ||
        normalized === "complete";

      const isOpen =
        normalized === "open" ||
        normalized === "requires_payment_method" ||
        normalized === "draft";

      const colorClasses = isPaid
        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
        : isOpen
        ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
        : "bg-slate-500/10 text-slate-700 border-slate-500/30";

      return (
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-x-1 text-xs capitalize",
            colorClasses,
          )}
        >
          <ReceiptIcon className="size-3" />
          {normalized}
        </Badge>
      );
    },
  },
  {
    accessorKey: "stripeInvoiceId",
    header: "Invoice",
    cell: ({ row }) => {
      const invoiceId = row.original.stripeInvoiceId;
      const url = row.original.hostedInvoiceUrl;

      if (!invoiceId) {
        return (
          <span className="text-xs text-muted-foreground">None</span>
        );
      }

      const shortId =
        invoiceId.length > 14
          ? `${invoiceId.slice(0, 8)}...${invoiceId.slice(-4)}`
          : invoiceId;

      if (!url) {
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {shortId}
          </span>
        );
      }

      return (
        <Button
          asChild
          variant="link"
          size="sm"
          className="px-0 text-xs font-mono"
        >
          <a href={url} target="_blank" rel="noreferrer">
            {shortId}
          </a>
        </Button>
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
];

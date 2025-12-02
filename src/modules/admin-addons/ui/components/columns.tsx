"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCircle2,
  PuzzleIcon,
  Star,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import AddonActions from "./addon-actions";
import { GetManyAddons } from "../../types";


export type AddonRow = GetManyAddons[number];

type ColumnsFactoryArgs = {
  onToggleConfirm: (addon: AddonRow) => void;
  onEditMeta: (addon: AddonRow) => void;
  onEditPrompts: (addon: AddonRow) => void;
};

export function columnsFactory({
  onToggleConfirm,
  onEditMeta,
  onEditPrompts,
}: ColumnsFactoryArgs): ColumnDef<AddonRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Addon",
      cell: ({ row }) => {
        const addon = row.original;

        return (
          <div className="flex flex-col">
            <span className="font-semibold flex items-center gap-1">
              <PuzzleIcon className="w-4 h-4 text-muted-foreground" />
              {addon.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {addon.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;

        if (!category) {
          return (
            <span className="text-xs text-muted-foreground">
              Uncategorised
            </span>
          );
        }

        return (
          <span className="text-xs text-muted-foreground">
            {category}
          </span>
        );
      },
    },
    {
      id: "premium",
      header: "Type",
      cell: ({ row }) => {
        const isPremium = row.original.isPremium;

        return (
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-xs",
              isPremium
                ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
            )}
          >
            <Star className="w-3 h-3" />
            {isPremium ? "Premium" : "Free"}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const enabled = row.original.isEnabled;

        return (
          <Badge
            variant="outline"
            className={cn(
              "flex items-center gap-1 text-xs",
              enabled
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                : "bg-slate-500/10 text-slate-700 border-slate-500/30",
            )}
          >
            {enabled ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {enabled ? "Enabled" : "Disabled"}
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
      enableHiding: false,
      cell: ({ row }) => {
        const addon = row.original;

        return (
          <div className="flex justify-center">
            <AddonActions
              addon={addon}
              onToggleConfirm={() => onToggleConfirm(addon)}
              onEditMeta={() => onEditMeta(addon)}
              onEditPrompts={() => onEditPrompts(addon)}
            />
          </div>
        );
      },
    },
  ];
}

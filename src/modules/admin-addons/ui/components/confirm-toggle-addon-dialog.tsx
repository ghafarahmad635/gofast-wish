
"use client";


import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { GetManyAddons } from "../../types";

export type AddonRow = GetManyAddons[number];

type ConfirmToggleAddonDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: AddonRow | null;
  loading: boolean;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmToggleAddonDialog({
  open,
  onOpenChange,
  addon,
  loading,
  onConfirm,
}: ConfirmToggleAddonDialogProps) {
  if (!addon) return null;

  const nextLabel = addon.isEnabled ? "disable" : "enable";

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={addon.isEnabled ? "Disable addon" : "Enable addon"}
      description={`You are about to ${nextLabel} this addon.`}
    >
      <div className="space-y-4 p-2 text-sm">
        <p>
          Addon: <span className="font-medium">{addon.name}</span>
        </p>
        <p className="text-muted-foreground">
          Are you sure you want to {nextLabel} this addon?
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onConfirm()}
            disabled={loading}
          >
            {loading ? "Saving..." : addon.isEnabled ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

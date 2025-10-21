import { JSX, useState } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/responsive-dialog";

export const useConfirm = (
  title: string,
  description: string
): [() => JSX.Element, (onConfirm?: () => Promise<void>) => Promise<boolean>] => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);

  // ✅ Used in your page like `await confirmDelete(async () => {...})`
  const confirm = (onConfirm?: () => Promise<void>) => {
    setConfirmAction(() => onConfirm ?? null);
    return new Promise<boolean>((resolve) => setPromise({ resolve }));
  };

  const handleClose = () => {
    setPromise(null);
    setConfirmAction(null);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      setIsLoading(true);
      try {
        await confirmAction(); // await the async delete
        promise?.resolve(true);
      } catch (err) {
        console.error("❌ Confirm action failed:", err);
        promise?.resolve(false);
      } finally {
        handleClose(); // close only after async completes
      }
    } else {
      promise?.resolve(true);
      handleClose();
    }
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <ResponsiveDialog
      open={promise !== null}
      onOpenChange={handleClose}
      title={title}
      description={description}
    >
      <div className="pt-4 w-full flex flex-col-reverse gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full lg:w-auto"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          className="w-full lg:w-auto"
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Confirm"}
        </Button>
      </div>
    </ResponsiveDialog>
  );

  return [ConfirmationDialog, confirm];
};

import { ResponsiveDialog } from "@/components/responsive-dialog";
import HabitForm from "./habit-form";




interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewGoalDialog = ({
  open,
  onOpenChange,
}: NewGoalDialogProps) => {
  return (
    <ResponsiveDialog
      title="New Goal"
      description="Create a new goal"
      open={open}
      onOpenChange={onOpenChange}
    >
      <HabitForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
      />
    </ResponsiveDialog>
  );
};

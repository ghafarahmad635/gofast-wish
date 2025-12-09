import { ResponsiveDialog } from "@/components/responsive-dialog";
import GoalForm from "./goal-form";



interface NewGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: {
    title?: string
    description?: string
    category?: string
  }
};

export const NewGoalDialog = ({
  open,
  onOpenChange,
  defaultValues
}: NewGoalDialogProps) => {
  return (
    <ResponsiveDialog
      title="New Goal"
      description="Create a new goal"
      open={open}
      onOpenChange={onOpenChange}
    >
      <GoalForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
         initialValues={{
            title: defaultValues?.title ?? '',
            description: defaultValues?.description ?? '',
            
          }}
      />
    </ResponsiveDialog>
  );
};

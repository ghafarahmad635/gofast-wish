import { ResponsiveDialog } from "@/components/responsive-dialog";
import { PlanGetOne } from "../../types";
import PlanEditForm from "./plan-edit-form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
   plan: PlanGetOne | null;
  
}
const UpdatePlanDialog = ({ open, onOpenChange,plan }: Props) => {
  return (
     <ResponsiveDialog
          title={`Edit  ${plan?.name} Plan`}
          description="Update plan details and features."
            
          open={open}
          onOpenChange={onOpenChange}
        >
             {plan && (
          <PlanEditForm
            plan={plan}
            onSaved={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </ResponsiveDialog>
  )
}

export default UpdatePlanDialog

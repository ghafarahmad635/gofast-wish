"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { DataPagination } from "../components/data-pagination";
import { useGoalsFilters } from "../../hooks/use-goals-filters";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import GoalForm from "../components/goal-form";
import { useEffect } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GoalCard } from "../components/GoalCard";


const GoalsViews = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useGoalsFilters();
  const router = useRouter();
  const { data } = useSuspenseQuery(trpc.goals.getMany.queryOptions({
    search:filters.search,
    page:filters.page,
    
  }));
 
  const goalDetails = data.items.find((g) => g.id === filters.edit) ?? null;

  // ✅ If user manually edits URL or invalid ID, auto-close dialog
  useEffect(() => {
    if (filters.edit && !goalDetails) {
      console.warn("Invalid goal ID in edit param — closing dialog");
      setFilters({ edit: "" }); // close modal and clear invalid ID
    }
  }, [filters.edit, goalDetails, setFilters]);

 // ✅ Helper function for closing dialog
  const closeDialog = () => setFilters({ edit: "" });
  const removeGoal = useMutation(
    trpc.goals.remove.mutationOptions({
      onSuccess: async() => {
        // Invalidate and refetch goals list after deletion
        await queryClient.invalidateQueries();
       
        router.push("/dashboard/goals");
      },
      onError: (error) => {
        toast.error(error.message);
      }
    })
  )
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Goal",
    "Are you sure you want to delete this goal? This action cannot be undone."
  );
  const handleRemoveGoal=async(goalId:string)=>{
   await confirmDelete(async () => {
     
      toast.promise(removeGoal.mutateAsync({ id: goalId }), {
      loading: "Deleting goal...",
      success: "Goal deleted successfully",
      error: "Failed to delete goal",
    });
   })
  }

  


  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="No goals yet"
          description="Start by creating your first goal to stay focused and track progress."
        />
      </div>
    );
  }

  return (
    
    <>
   
    <div className="flex-1 pb-6 px-4 md:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        {data.items.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={(id) => setFilters({ edit: id })}
            onDelete={handleRemoveGoal}
            
          />
        ))}
      </div>

      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ page })}
       />
    </div>
    <ResponsiveDialog
      title="Edit Goal"
      description="Update your goal details below."
      open={!!filters.edit}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setFilters({ edit: "" });
        } // ✅ closes modal + clears URL
      }}
    >
      <GoalForm 
       onSuccess={closeDialog}
       onCancel={closeDialog}
      initialValues={goalDetails} />
    </ResponsiveDialog>
      <ConfirmDialog />

    </>

  );
};

export default GoalsViews;

export const GoalsViewLoadingState = () => (
  <LoadingState
    title="Loading Goals"
    description="Please wait while we fetch your goals."
  />
);

export const GoalsViewErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your goals."
  />
);

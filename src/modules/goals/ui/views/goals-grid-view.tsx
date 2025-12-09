"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";



const GoalsGridViews = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useGoalsFilters();
  const router = useRouter();
  const { data } = useSuspenseQuery(
  trpc.goals.getMany.queryOptions({
    search: filters.search,
    page: filters.page,
    status: filters.status,
    priority: filters.priority,
    sort: filters.sort,
  })
)
 
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
  const markGoalToggle = useMutation(
    trpc.goals.markToggleComplete.mutationOptions({
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.goals.getAll.queryOptions()),
          queryClient.invalidateQueries(trpc.goals.getMany.queryOptions({})),
          queryClient.invalidateQueries(trpc.goals.getManyByStatus.queryOptions({})),
          queryClient.invalidateQueries(trpc.goals.getManyLatestForCarousel.queryOptions({})),
        ]);
        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update goal status.");
      },
    })
  );


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
  const handleToggleGoal = async (goalId: string) => {
    toast.promise(markGoalToggle.mutateAsync({ id: goalId }), {
      loading: "Updating goal status...",
      success: (data) => data?.message || "Goal updated successfully.",
      error: "Failed to update goal.",
    });
  };



  


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
    
   
    <div className="flex-1 space-y-4">
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        {data.items.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={(id) => setFilters({ edit: id })}
            onDelete={handleRemoveGoal}
            onToggleComplete={handleToggleGoal}
            isToggling={
              markGoalToggle.isPending &&
              markGoalToggle.variables?.id === goal.id
            }
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

export default GoalsGridViews;

export const GoalsGridViewsLoadingState = () => {
  return (
    <div className="animate-pulse space-y-10">
      {/* Grid of goal cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Header section */}
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>

            {/* Description section */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center mt-8 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
    </div>
  )
}

// ✅ Error State
export const GoalsGridViewsErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your goals."
  />
)
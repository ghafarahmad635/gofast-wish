'use client';

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";


import { ResponsiveDialog } from "@/components/responsive-dialog";

import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { GoalCard } from "@/modules/goals/ui/components/GoalCard";
import { DataPagination } from "@/modules/goals/ui/components/data-pagination";
import GoalForm from "@/modules/goals/ui/components/goal-form";

import { NewGoalDialog } from "@/modules/goals/ui/components/new-goal-dialog";
import { useGoalsFilters } from "../../hooks/use-goals-filters";


const GoalsViewToComplete = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useGoalsFilters();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ Fetch incomplete goals (no search, just pagination)
  const { data } = useSuspenseQuery(
    trpc.goals.getManyByStatus.queryOptions({
      page: filters.inCompletedPage,
      status:'incomplete'
    })
  );

  const goalDetails = data.items.find((g) => g.id === filters.edit) ?? null;

  // ✅ If user manually edits URL or invalid ID, auto-close dialog
  useEffect(() => {
    console.log(filters.edit)
    if (filters.edit && !goalDetails) {
      console.warn("Invalid goal ID in edit param — closing dialog");
      setFilters({ edit: "" });
    }
  }, [filters.edit, goalDetails, setFilters]);

  // ✅ Helper function for closing dialog
  const closeDialog = () => setFilters({ edit: "" });

  // ✅ Delete mutation
  const removeGoal = useMutation(
    trpc.goals.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.push("/dashboard/goals/to-complete");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  // ✅ Confirm delete dialog
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Goal",
    "Are you sure you want to delete this goal? This action cannot be undone."
  );

  const handleRemoveGoal = async (goalId: string) => {
    await confirmDelete(async () => {
      toast.promise(removeGoal.mutateAsync({ id: goalId }), {
        loading: "Deleting goal...",
        success: "Goal deleted successfully",
        error: "Failed to delete goal",
      });
    });
  };

  // ✅ Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="No pending goals"
          description="You’ve completed all your goals — great job!"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 pb-6 px-4 md:px-8">
         
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
          page={filters.inCompletedPage}
          totalPages={data.totalPages}
          onPageChange={(inCompletedPage) => setFilters({ inCompletedPage })}
        />
      </div>

      {/* ✅ Edit Dialog */}
      <ResponsiveDialog
        title="Edit Goal"
        description="Update your goal details below."
        open={!!filters.edit}
        onOpenChange={(isOpen) => {
          if (!isOpen) setFilters({ edit: "" });
        }}
      >
        <GoalForm
          onSuccess={closeDialog}
          onCancel={closeDialog}
          initialValues={goalDetails}
        />
      </ResponsiveDialog>

       <NewGoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <ConfirmDialog />
    </>
  );
};

export default GoalsViewToComplete;

// ✅ Loading State (skeleton cards)
export const GoalsVieDashboardLoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 px-4 md:px-8 py-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Image skeleton */}
        <div className="w-full aspect-[16/9] bg-white" />

        {/* Content skeleton */}
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-300 rounded w-3/4" />
          <div className="h-3.5 bg-gray-200 rounded w-full" />
          <div className="h-3.5 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between items-center px-5 pb-5 pt-3 border-t">
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded" />
            <div className="w-16 h-8 bg-gray-200 rounded" />
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);
// ✅ Error State
export const GoalsViewDashboardErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your goals."
  />
);

'use client';

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { GoalCard } from "@/modules/goals/ui/components/GoalCard";
import { DataPagination } from "@/modules/goals/ui/components/data-pagination";
import { useGoalsFilters } from "../../hooks/use-goals-filters";


const GoalsViewCompleted = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useGoalsFilters();
  const router = useRouter();

  // ✅ Fetch completed goals only
  const { data } = useSuspenseQuery(
    trpc.goals.getManyByStatus.queryOptions({
      page: filters.completedPage,
      status: "completed",
    })
  );

  // ✅ Delete mutation
  const removeGoal = useMutation(
    trpc.goals.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.push("/dashboard/goals/completed");
      },
      onError: (error) => toast.error(error.message),
    })
  );

  // ✅ Confirm delete dialog
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Goal",
    "Are you sure you want to delete this completed goal? This action cannot be undone."
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
          title="No completed goals yet"
          description="Finish some goals to see them here."
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 pb-6 px-4 md:px-8">
       

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {data.items.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleRemoveGoal}
            />
          ))}
        </div>

        <DataPagination
          page={filters.completedPage}
          totalPages={data.totalPages}
          onPageChange={(completedPage) => setFilters({ completedPage })}
        />
      </div>

      <ConfirmDialog />
    </>
  );
};

export default GoalsViewCompleted;

// ✅ Loading State (skeleton cards)
export const GoalsViewCompletedLoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 py-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="w-full aspect-[16/9] bg-white" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-300 rounded w-3/4" />
          <div className="h-3.5 bg-gray-200 rounded w-full" />
          <div className="h-3.5 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex justify-between items-center px-5 pb-5 pt-3 border-t">
          <div className="w-16 h-8 bg-gray-200 rounded" />
          <div className="w-24 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ✅ Error State
export const GoalsViewCompletedErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your completed goals."
  />
);

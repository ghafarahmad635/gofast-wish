"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { useTRPC } from "@/trpc/client"
import { useGoalsFilters } from "../../hooks/use-goals-filters"
import { useConfirm } from "@/hooks/use-confirm"

import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { NewGoalDialog } from "@/modules/goals/ui/components/new-goal-dialog"
import { GoalCard } from "@/modules/goals/ui/components/GoalCard"
import GoalForm from "@/modules/goals/ui/components/goal-form"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card } from "@/components/ui/card"

const GoalsViewToComplete = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [filters, setFilters] = useGoalsFilters()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))

  // ✅ Fetch latest incomplete goals for carousel
  const { data } = useSuspenseQuery(
    trpc.goals.getManyLatestForCarousel.queryOptions({
      status: "incomplete",
    })
  )

  const goalDetails = data.items.find((g) => g.id === filters.edit) ?? null

  // ✅ If invalid edit ID in URL → close dialog
  useEffect(() => {
    if (filters.edit && !goalDetails) {
      setFilters({ edit: "" })
    }
  }, [filters.edit, goalDetails, setFilters])

  // ✅ Close dialog helper
  const closeDialog = () => setFilters({ edit: "" })

  // ✅ Delete mutation
  const removeGoal = useMutation(
    trpc.goals.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.goals.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.goals.getManyByStatus.queryOptions({}))
        await queryClient.invalidateQueries(trpc.goals.getManyLatestForCarousel.queryOptions({}))
        await queryClient.invalidateQueries(trpc.goals.getAll.queryOptions())
        router.push("/dashboard/goals/to-complete")
      },
      onError: (error) => toast.error(error.message),
    })
  )

  // ✅ Confirm delete dialog
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Goal",
    "Are you sure you want to delete this goal? This action cannot be undone."
  )

  const handleRemoveGoal = async (goalId: string) => {
    await confirmDelete(async () => {
      toast.promise(removeGoal.mutateAsync({ id: goalId }), {
        loading: "Deleting goal...",
        success: "Goal deleted successfully",
        error: "Failed to delete goal",
      })
    })
  }

  // ✅ Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          title="No pending goals"
          description="You’ve completed all your goals — great job!"
        />
      </div>
    )
  }
  // ✅ Toggle goal completion (Mark Complete / Mark Incomplete)
  const markGoalToggle = useMutation(
    trpc.goals.markToggleComplete.mutationOptions({
      onSuccess: async (data) => {
        // Revalidate all queries that may be affected
        await Promise.all([
          queryClient.invalidateQueries(trpc.goals.getAll.queryOptions()),
          queryClient.invalidateQueries(
            trpc.goals.getManyLatestForCarousel.queryOptions({})
          ),
          queryClient.invalidateQueries(
            trpc.goals.getManyByStatus.queryOptions({ })
          ),
          queryClient.invalidateQueries(trpc.goals.getMany.queryOptions({})),
        ]);

        toast.success(data.message);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update goal status.");
      },
    })
  );

  const handleToggleGoal = async (goalId: string) => {
    toast.promise(markGoalToggle.mutateAsync({ id: goalId }), {
      loading: "Updating goal status...",
      success: (data) => data?.message || "Goal updated successfully.",
      error: "Failed to update goal.",
    });
  };


  return (
    <>
      <div className=" w-full relative">
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{ align: "start", loop: true }}
          className="w-full p-0"
        >
          <CarouselContent className="-ml-4">
            {data.items.map((goal) => (
              <CarouselItem
                key={goal.id}
                 className="pl-4 sm:basis-1/2 lg:basis-1/3 !max-w-full overflow-hidden  m-0"
              >
                
                  <GoalCard
                    goal={goal}
                    onEdit={(id) => setFilters({ edit: id })}
                    onDelete={handleRemoveGoal}
                     onToggleComplete={handleToggleGoal}
                      isToggling={
                        markGoalToggle.isPending &&
                        markGoalToggle.variables?.id === goal.id
                      }
                  />
                
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-2 sm:flex" />
          <CarouselNext className="right-2 sm:flex" />
        </Carousel>
      </div>

      {/* ✅ Edit Dialog */}
      <ResponsiveDialog
        title="Edit Goal"
        description="Update your goal details below."
        open={!!filters.edit}
        onOpenChange={(isOpen) => {
          if (!isOpen) setFilters({ edit: "" })
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
  )
}

export default GoalsViewToComplete

export const GoalsVieDashboardLoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* Image skeleton */}
        <div className="w-full aspect-[16/9] bg-primary/5" />

        {/* Title + description */}
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-300 rounded w-3/4" />
          <div className="h-3.5 bg-gray-200 rounded w-full" />
          <div className="h-3.5 bg-gray-200 rounded w-5/6" />
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between items-center px-5 pb-5 pt-3 border-t">
          <div className="flex gap-2">
            <div className="w-20 h-8 bg-gray-200 rounded" />
            <div className="w-20 h-8 bg-gray-200 rounded" />
          </div>
          <div className="w-28 h-8 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
)

// ✅ Error State
export const GoalsViewDashboardErrorState = () => (
  <ErrorState
    title="Error Loading Goals"
    description="There was an error fetching your goals."
  />
)

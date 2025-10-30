"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {  useRef } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { useTRPC } from "@/trpc/client"
import { useConfirm } from "@/hooks/use-confirm"

import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { GoalCard } from "@/modules/goals/ui/components/GoalCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card } from "@/components/ui/card"

const GoalsViewCompleted = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))

  // ✅ Fetch latest completed goals for carousel
  const { data } = useSuspenseQuery(
    trpc.goals.getManyLatestForCarousel.queryOptions({
      status: "completed",
    })
  )

  // ✅ Delete mutation
  const removeGoal = useMutation(
    trpc.goals.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries()
        router.push("/dashboard/goals/completed")
      },
      onError: (error) => toast.error(error.message),
    })
  )

  // ✅ Confirm delete dialog
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Goal",
    "Are you sure you want to delete this completed goal? This action cannot be undone."
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
          title="No completed goals yet"
          description="Finish some goals to see them here."
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 w-full mx-auto">
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{ align: "start", loop: true }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {data.items.map((goal) => (
              <CarouselItem
                key={goal.id}
                className="pl-4 sm:basis-1/2 lg:basis-1/3"
              >
                <Card className="overflow-hidden shadow-sm p-0 hover:border-primary border-2 transition-all duration-300">
                  <GoalCard goal={goal} onDelete={handleRemoveGoal} />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      <ConfirmDialog />
    </>
  )
}

export default GoalsViewCompleted


export const GoalsViewCompletedLoadingState = () => (
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
export const GoalsViewCompletedErrorState = () => (
  <ErrorState
    title="Error Loading Completed Goals"
    description="There was an error fetching your completed goals."
  />
)

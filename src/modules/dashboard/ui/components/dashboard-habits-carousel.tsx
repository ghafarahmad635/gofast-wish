"use client"

import Autoplay from "embla-carousel-autoplay"
import { useRef, useEffect, useState } from "react"
import { toast } from "sonner"
import { useConfirm } from "@/hooks/use-confirm"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ResponsiveDialog } from "@/components/responsive-dialog"

import HabitForm from "@/modules/habits/ui/components/habit-form"
import HabitCard from "@/modules/habits/ui/components/HabitCard"
import type { HabitGetManyLatestByFrequency } from "@/modules/habits/types"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface Props {
  habits: HabitGetManyLatestByFrequency
}

const DashboardHabitsCarousel = ({ habits }: Props) => {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<{ editHabit?: string }>({})
 

  const habitDetails = habits.items.find((h) => h.id === filters.editHabit) ?? null

  // ✅ Auto-close invalid edit dialog
  useEffect(() => {
    if (filters.editHabit && !habitDetails) {
      setFilters({ editHabit: undefined })
    }
  }, [filters.editHabit, habitDetails])

  // ✅ Delete mutation
  const deleteHabit = useMutation(
    trpc.habitsTracker.delete.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.habitsTracker.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.habitsTracker.getManyByFrequency.queryOptions({}))
        await queryClient.invalidateQueries(trpc.habitsTracker.getManyLatestByFrequency.queryOptions({}))
        
        toast.success(data.message || "Habit deleted successfully")
      },
      onError: (error) => {
        toast.error("Failed to delete habit", { description: error.message })
      },
    })
  )

  // ✅ Confirm delete dialog
  const [ConfirmDialog, confirmDelete] = useConfirm(
    "Delete Habit",
    "Are you sure you want to delete this habit? This action cannot be undone."
  )

  // ✅ Delete handler
  const handleRemoveHabit = async (habitId: string) => {
    await confirmDelete(async () => {
      toast.promise(deleteHabit.mutateAsync({ habitId }), {
        loading: "Deleting habit...",
        success: "Habit deleted successfully",
        error: "Failed to delete habit",
      })
    })
  }

  // ✅ Close dialog
  const closeDialog = () => setFilters({ editHabit: undefined })

  if (!habits || habits.items.length === 0) {
    return (
      <div className="flex justify-center items-center h-[200px] text-sm text-muted-foreground">
        No habits to show — start tracking some!
      </div>
    )
  }

  return (
    <>
      {/* ✅ Edit Habit Dialog */}
      <ResponsiveDialog
        title="Edit Habit"
        description="Update your habit details below."
        open={!!filters.editHabit}
        onOpenChange={(isOpen) => {
          if (!isOpen) setFilters({ editHabit: undefined })
        }}
      >
        <HabitForm
          onSuccess={closeDialog}
          onCancel={closeDialog}
          initialValues={habitDetails ?? undefined}
        />
      </ResponsiveDialog>

      {/* ✅ Carousel Section */}
     <div className="flex-1 w-full  mx-auto">
        <Carousel
            plugins={[plugin.current]}
            opts={{ align: "start", loop: true }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full"
        >
             <CarouselContent className="-ml-4">
            {habits.items.map((habit) => (
                <CarouselItem
                key={habit.id}
                className="basis-1/2 md:basis-1/3 " 
                >
                <div className="h-full w-full"> 
                    <HabitCard
                        habit={habit}
                        mode={
                            (habit.frequency?.toLowerCase() as "daily" | "weekly" | "monthly") ||
                            "daily"
                        }
                        onEdit={(id) => setFilters({ editHabit: id })}
                        onDelete={handleRemoveHabit}
                    />

                    
                </div>
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

export default DashboardHabitsCarousel

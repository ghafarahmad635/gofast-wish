"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import type { HabitGetMany } from "../../types"
import HabitCard from "./HabitCard"
import { ResponsiveDialog } from "@/components/responsive-dialog"
import { useHabitsFilters } from "../../hooks/use-habits-filters"
import HabitForm from "./habit-form"
import { useEffect } from "react"
import { useConfirm } from "@/hooks/use-confirm"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DataPagination } from "@/modules/goals/ui/components/data-pagination"


type Props = { habits: HabitGetMany }

export default function HabitsGrid({ habits }: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useHabitsFilters()
  const closeDialog = () => setFilters({ editHabit: "" })
  const habitDetails = habits.items.find((g) => g.id === filters.editHabit) ?? null

  // ✅ Auto-close invalid dialog
  useEffect(() => {
    if (filters.editHabit && !habitDetails) {
      console.warn("Invalid habit ID in edit param — closing dialog")
      setFilters({ editHabit: "" })
    }
  }, [filters.editHabit, habitDetails, setFilters])

  // ✅ Delete mutation
  const deleteHabit = useMutation(
    trpc.habitsTracker.delete.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.habitsTracker.getMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.habitsTracker.getManyByFrequency.queryOptions({}))
        if(habitDetails){
           await queryClient.invalidateQueries(trpc.habitsTracker.getCompletions.queryOptions({
            habitId:habitDetails.id
           }))
        }
        toast.success(data.message || "Habit deleted successfully")
      },
      onError: (error) => {
        toast.error("Failed to delete habit", { description: error.message })
      },
    })
  )

  // ✅ Confirmation dialog
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

  return (
    <>
      <ResponsiveDialog
        title="Edit Habit"
        description="Update your habit details below."
        open={!!filters.editHabit}
        onOpenChange={(isOpen) => {
          if (!isOpen) setFilters({ editHabit: "" })
        }}
      >
        <HabitForm
          onSuccess={closeDialog}
          onCancel={closeDialog}
          initialValues={habitDetails ?? undefined}
        />
      </ResponsiveDialog>

      <Card className="bg-transparent p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key="habits-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-6 grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {habits.items.length ? (
              habits.items.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  mode={
                    (h.frequency?.toLowerCase() as "daily" | "weekly" | "monthly") ||
                    "daily"
                  }
                  onEdit={(id) => setFilters({ editHabit: id })}
                  onDelete={handleRemoveHabit}
                />
              ))
            ) : (
              <EmptyState label="No habits found for this filter." />
            )}
          </motion.div>
        </AnimatePresence>
        <DataPagination
                page={filters.habitPage}
                totalPages={habits.totalPages}
                onPageChange={(habitPage) => setFilters({ habitPage })}
               />
      </Card>

      <ConfirmDialog />
    </>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="col-span-full text-center text-sm text-muted-foreground py-10">
      {label}
    </div>
  )
}

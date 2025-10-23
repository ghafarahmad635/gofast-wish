"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { NewGoalDialog } from "./new-habit-dialog"
import { useHabitsFilters } from "../../hooks/use-habits-filters"

const filterButtons = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
] as const

export const HabitsListHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useHabitsFilters()

  return (
    <>
      <NewGoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <div className="py-4 px-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <h5 className="font-medium text-xl">My Habits</h5>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="md:hidden flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Habit
          </Button>
        </div>

        {/* Center – Filter buttons */}
        <div className="flex justify-center">
          <ButtonGroup>
            {filterButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={filters.frequency === btn.value ? "default" : "outline"}
                onClick={() => setFilters({ frequency: btn.value })}
              >
                {btn.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Right side */}
        <div className="hidden md:flex">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            New Habit
          </Button>
        </div>
      </div>
    </>
  )
}

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

  // ✅ Handle frequency change — reset habitPage to 1
  const handleFrequencyChange = (newFrequency: "daily" | "weekly" | "monthly") => {
    setFilters({
      frequency: newFrequency,
      habitPage: 1, // reset pagination to first page
    })
  }

  return (
    <>
      <NewGoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <div className="py-4 px-4 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left side - Heading */}
        <h5 className="font-medium text-xl">My Habits</h5>

        {/* Right side - Button Group */}
        <ButtonGroup>
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filters.frequency === btn.value ? "default" : "outline"}
              onClick={() => handleFrequencyChange(btn.value)}
            >
              {btn.label}
            </Button>
          ))}

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 bg-secondary"
          >
            <PlusIcon className="w-4 h-4" />
            New
          </Button>
        </ButtonGroup>
      </div>
    </>
  )
}

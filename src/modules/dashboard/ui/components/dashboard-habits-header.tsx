"use client"

import { useState } from "react"
import { PlusIcon, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useHabitsFilters } from "@/modules/habits/hooks/use-habits-filters"
import { NewGoalDialog } from "@/modules/habits/ui/components/new-habit-dialog"


const filterButtons = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
] as const

export const DashboardHabitsHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useHabitsFilters()

  // ✅ Handle frequency change — reset habitPage to 1
  const handleFrequencyChange = (newFrequency: "daily" | "weekly" | "monthly") => {
    setFilters({
      frequency: newFrequency,
      habitPage: 1,
    })
  }

  return (
    <>
      <NewGoalDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <div className=" flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* ✅ Left Section - Icon + Text */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Activity size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Habits
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              You have <span className="font-semibold text-primary">10</span> habits to complete
            </p>
          </div>
        </div>

        {/* ✅ Right Section - Filters + New Button */}
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
            className="flex items-center gap-2 bg-secondary text-white hover:bg-secondary/90"
          >
            <PlusIcon className="w-4 h-4" />
            New
          </Button>
        </ButtonGroup>
      </div>
    </>
  )
}


export default DashboardHabitsHeader
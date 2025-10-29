'use client'

import { useTRPC } from "@/trpc/client"
import { useHabitsFilters } from "../../hooks/use-habits-filters"
import { useSuspenseQuery } from "@tanstack/react-query"
import HabitSummaryCards from "../components/HabitSummaryCards"
import { useMemo } from "react"
import { ErrorState } from "@/components/error-state"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const HabitsStatsView = () => {
  const trpc = useTRPC()
  const [filters] = useHabitsFilters()

  const { data: habits } = useSuspenseQuery(
    trpc.habitsTracker.getManyByFrequency.queryOptions({
      frequency: filters.frequency,
    })
  )

  const stats = useMemo(() => {
    const total = habits.length
    const completed = habits.filter((h) =>
      h.completions.some((c) => c.status === "completed")
    ).length
    const completionRate = total ? Math.round((completed / total) * 100) : 0
    return { total, completed, completionRate }
  }, [habits])

  return (
    <HabitSummaryCards
      total={stats.total}
      completed={stats.completed}
      completionRate={stats.completionRate}
    />
  )
}

export default HabitsStatsView

// ✅ Loading Skeleton State
export const HabitsStatsSectionLoadingState = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28 bg-gray-200" />
            <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
          </div>

          {/* Metric & progress */}
          <div className="mt-5 space-y-3">
            <Skeleton className="h-8 w-16 bg-gray-200" />
            <Skeleton className="h-2 w-full rounded-full bg-gray-200" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// ✅ Error State
export const HabitsStatsSectionErrorState = () => {
  return (
    <ErrorState
      title="Failed to load habits."
      description="Something went wrong while fetching your habits. Please try again."
    />
  )
}

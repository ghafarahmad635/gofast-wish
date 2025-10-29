'use client'

import { useSuspenseQuery } from "@tanstack/react-query"
import HabitFrequencyChart from "../components/HabitFrequencyChart"
import { useTRPC } from "@/trpc/client"
import { useHabitsFilters } from "../../hooks/use-habits-filters"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/error-state"

const HabitFrequencyChartView = () => {
  const trpc = useTRPC()
  const [filters] = useHabitsFilters()

  const { data: habits } = useSuspenseQuery(
    trpc.habitsTracker.getManyByFrequency.queryOptions({
      frequency: filters.frequency,
    })
  )

  return <HabitFrequencyChart habits={habits} />
}

export default HabitFrequencyChartView

// ✅ Skeleton Loading State
export const HabitFrequencyChartViewLoadingState = () => {
  return (
    <Card className="p-6 bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Chart area skeleton */}
      <div className="space-y-4">
        {/* Simulated horizontal bars */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-32 rounded-full" /> {/* label area */}
            <Skeleton className="h-6 flex-1 rounded-full" /> {/* bar area */}
            <Skeleton className="h-4 w-10 rounded" /> {/* value label */}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ✅ Error State
export const HabitFrequencyChartViewErrorState = () => {
  return (
    <ErrorState
      title="Failed to load chart data."
      description="Something went wrong while fetching habit statistics. Please try again."
    />
  )
}

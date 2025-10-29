'use client'

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useHabitsFilters } from "../../hooks/use-habits-filters"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/error-state"
import HabitTrendChart from "../components/HabitTrendChart"

const HabitTrendChartView = () => {
  const trpc = useTRPC()
  const [filters] = useHabitsFilters()

  const { data: habits } = useSuspenseQuery(
    trpc.habitsTracker.getManyByFrequency.queryOptions({
      frequency: filters.frequency,
    })
  )

  return <HabitTrendChart habits={habits} />
}

export default HabitTrendChartView

// ✅ Skeleton Loading State
export const HabitTrendChartViewLoadingState = () => {
  return (
    <Card className="p-6 bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Chart area skeleton */}
      <div className="relative w-full h-64 flex flex-col justify-end overflow-hidden">
        {/* Simulated line chart base grid */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[1px] w-full bg-gray-200/60"
            />
          ))}
        </div>

        {/* Simulated chart line path */}
        <div className="relative flex items-end justify-between h-full px-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton
                className="w-2 h-2 rounded-full bg-emerald-400/60"
                style={{ marginBottom: `${Math.random() * 120 + 20}px` }}
              />
              <Skeleton className="h-3 w-6 bg-gray-200/70" /> {/* X-axis labels */}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ✅ Error State
export const HabitTrendChartViewErrorState = () => {
  return (
    <ErrorState
      title="Failed to load trend data."
      description="Something went wrong while fetching habit trend information. Please try again."
    />
  )
}

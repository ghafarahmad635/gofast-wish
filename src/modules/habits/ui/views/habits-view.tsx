'use client'

import { useMemo } from 'react'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { LoadingState } from '@/components/loading-state'
import { ErrorState } from '@/components/error-state'
import { useHabitsFilters } from '../../hooks/use-habits-filters'

import HabitSummaryCards from '../components/HabitSummaryCards'
import HabitFrequencyChart from '../components/HabitFrequencyChart'
import HabitTrendChart from '../components/HabitTrendChart'
import HabitsDashboard from '../components/HabitsDashboard'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HabitsView() {
  const trpc = useTRPC()
  const [filters] = useHabitsFilters()

  const { data: habits } = useSuspenseQuery(
    trpc.habitsTracker.getMany.queryOptions({ ...filters })
  )

  const stats = useMemo(() => {
    const total = habits.length
    const completed = habits.filter((h) =>
      h.completions.some((c) => c.status === 'completed')
    ).length
    const completionRate = total ? Math.round((completed / total) * 100) : 0

    const freqCounts = { daily: 0, weekly: 0, monthly: 0 }
    for (const h of habits) {
      if (freqCounts[h.frequency as 'daily' | 'weekly' | 'monthly'] !== undefined)
        freqCounts[h.frequency as 'daily' | 'weekly' | 'monthly']++
    }

   

    return { total, completed, completionRate }
  }, [habits])

  return (
    <div className="px-6 py-0 space-y-10">
      <HabitSummaryCards
        total={stats.total}
        completed={stats.completed}
        completionRate={stats.completionRate}
      />
      <HabitsDashboard habits={habits} />
      <HabitFrequencyChart habits={habits} />
      <HabitTrendChart habits={habits} />
      
    </div>
  )
}

// Loading & Error states
export const HabitsViewLoadingState = () => {
  return (
    <div className="px-6 py-0 space-y-10 animate-pulse">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20 mt-4" />
            <Skeleton className="h-2 w-full mt-3" />
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 h-64 flex flex-col justify-between">
            <div>
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3 mb-4" />
            </div>
            <Skeleton className="h-40 w-full" />
          </Card>
        ))}
      </div>

      {/* Habits List Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between">
            <div>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
            </div>
            <Skeleton className="h-2 w-full mt-3" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export const HabitsViewErrorState = () => (
  <ErrorState
    title="Failed to load habits."
    description="Something went wrong while fetching your habits. Please try again."
  />
)

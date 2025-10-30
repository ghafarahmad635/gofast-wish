'use client'

import { useHabitsFilters } from '@/modules/habits/hooks/use-habits-filters'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import DashboardHabitsCarousel from '../components/dashboard-habits-carousel'
import { ErrorState } from '@/components/error-state'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardHabitsView = () => {
  const trpc = useTRPC()
  const [filters] = useHabitsFilters()

  const { data: habits } = useSuspenseQuery(
    trpc.habitsTracker.getManyLatestByFrequency.queryOptions({
      frequency: filters.frequency,
    })
  )

  return <DashboardHabitsCarousel habits={habits} />
}

export default DashboardHabitsView

export const DashboardHabitSectionLoadingState = () => {
  const skeletons = [1, 2, 3]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-2 py-6">
      {skeletons.map((i) => (
        <div
          key={i}
          className="flex flex-col bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border p-4 animate-pulse w-full"
        >
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-2 w-full mb-4" />
          <div className="flex gap-2 mb-4 flex-wrap">
            {[...Array(7)].map((_, j) => (
              <Skeleton key={j} className="h-7 w-7 rounded-md" />
            ))}
          </div>
          <div className="flex justify-between mt-auto items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export const DashboardHabitSectionErrorState = () => {
  return (
    <ErrorState
      title="Unable to load your habits"
      description="Something went wrong while fetching your data. Please refresh or try again later."
    />
  )
}

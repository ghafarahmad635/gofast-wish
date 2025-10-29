'use client'

import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorState } from '@/components/error-state'
import { useHabitsFilters } from '../../hooks/use-habits-filters'
import HabitsGrid from '../components/HabitsGrid'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HabitsGridView() {
  const trpc = useTRPC()
  const [filters] = useHabitsFilters()

  const { data: habits } = useSuspenseQuery(
    trpc.habitsTracker.getMany.queryOptions({
      frequency: filters.frequency,
      habitPage: filters.habitPage,
    })
  )

  return <HabitsGrid habits={habits} />
}

// ✅ Loading State – visually matches the real grid layout
export const HabitsGridViewLoadingState = () => {
  return (
    <div className="animate-pulse space-y-10">
      {/* Grid of habits */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="p-5 rounded-2xl border border-gray-200 bg-white  shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full mt-4 rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-center mt-8 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
    </div>
  )
}

// ✅ Error State
export const HabitsGridViewErrorState = () => (
  <ErrorState
    title="Failed to load habits."
    description="Something went wrong while fetching your habits. Please try again."
  />
)

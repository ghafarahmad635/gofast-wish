'use client'
import { ErrorState } from '@/components/error-state'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import React from 'react'
import GoalsCompletionChart from '../components/GoalsCompletionChart'

const GoalsCompletionChartView = () => {
     const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.goals.getAll.queryOptions())
  return (
    <GoalsCompletionChart goals={data} />
  )
}

export default GoalsCompletionChartView

// ✅ Loading Skeleton
export const GoalsCompletionChartViewLoadingState = () => (
  <Card className="p-6 bg-white/90 border border-gray-200 shadow-sm rounded-2xl animate-pulse">
    <div className="mb-6 space-y-2">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-3 w-72" />
    </div>
    <div className="flex justify-center items-center h-64">
      <div className="relative w-48 h-48 rounded-full border-8 border-gray-200" />
    </div>
  </Card>
)

// ✅ Error State
export const GoalsCompletionChartViewErrorState = () => (
  <ErrorState
    title="Failed to load chart data"
    description="Something went wrong while fetching your goal completion stats. Please try again."
  />
)
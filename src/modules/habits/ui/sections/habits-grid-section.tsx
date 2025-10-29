import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import HabitsGridView, { HabitsGridViewErrorState, HabitsGridViewLoadingState } from "../views/habits-grid-view"

// ✅ Define the props interface
interface HabitsGridSectionProps {
  frequency: "daily" | "weekly" | "monthly"
  habitPage: number
}

const HabitsGridSection = async ({ frequency, habitPage }: HabitsGridSectionProps) => {
  const queryClient = getQueryClient()

  // ✅ Prefetch habits data for hydration
  void queryClient.prefetchQuery(
    trpc.habitsTracker.getMany.queryOptions({
      frequency,
      habitPage,
    })
  )

  return (
     <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HabitsGridViewLoadingState />}>
            <ErrorBoundary fallback={<HabitsGridViewErrorState />}>
                    <HabitsGridView />
                </ErrorBoundary>
            </Suspense>
    </HydrationBoundary>
  )
}

export default HabitsGridSection

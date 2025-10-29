import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import HabitFrequencyChartView, { HabitFrequencyChartViewErrorState, HabitFrequencyChartViewLoadingState } from "../views/habits-frequency-chart-view"

interface HabitFrequencyChartSectionProps {
  frequency: "daily" | "weekly" | "monthly"
}

const HabitFrequencyChartSection = ({ frequency }: HabitFrequencyChartSectionProps) => {
  const queryClient = getQueryClient();
  // ✅ Prefetch habits data for hydration
    void queryClient.prefetchQuery(
      trpc.habitsTracker.getManyByFrequency.queryOptions({
        frequency,
       
      })
    )
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HabitFrequencyChartViewLoadingState />}>
                  <ErrorBoundary fallback={<HabitFrequencyChartViewErrorState />}>
                          <HabitFrequencyChartView />
                      </ErrorBoundary>
                  </Suspense>
    </HydrationBoundary>
  )
}

export default HabitFrequencyChartSection

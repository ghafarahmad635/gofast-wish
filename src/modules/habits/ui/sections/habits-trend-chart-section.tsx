import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import HabitTrendChartView, { HabitTrendChartViewErrorState, HabitTrendChartViewLoadingState } from "../views/habits-trend-chart-view"


// ✅ Define props interface
interface HabitTrendChartSectionProps {
  frequency: "daily" | "weekly" | "monthly"
}

const HabitTrendChartSection = ({ frequency }: HabitTrendChartSectionProps) => {
    const queryClient = getQueryClient();
      // ✅ Prefetch habits data for hydration
        void queryClient.prefetchQuery(
          trpc.habitsTracker.getManyByFrequency.queryOptions({
            frequency,
           
          })
        )
  return (
   <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HabitTrendChartViewLoadingState />}>
                  <ErrorBoundary fallback={<HabitTrendChartViewErrorState />}>
                          <HabitTrendChartView />
                      </ErrorBoundary>
                  </Suspense>
    </HydrationBoundary>
  )
}

export default HabitTrendChartSection

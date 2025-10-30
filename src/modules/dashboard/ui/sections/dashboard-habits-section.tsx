import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import DashboardHabitsView, {
  DashboardHabitSectionErrorState,
  DashboardHabitSectionLoadingState,
} from "../views/dashboard-habits-view"
import { getQueryClient, trpc } from "@/trpc/server"

// ✅ Define interface for props
interface DashboardHabitSectionProps {
  frequency: "daily" | "weekly" | "monthly"
}

const DashboardHabitSection = async ({ frequency }: DashboardHabitSectionProps) => {
  const queryClient = getQueryClient()

  // ✅ Prefetch habits data based on frequency
  void queryClient.prefetchQuery(
    trpc.habitsTracker.getManyLatestByFrequency.queryOptions({
      frequency,
    })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardHabitSectionLoadingState />}>
        <ErrorBoundary fallback={<DashboardHabitSectionErrorState />}>
          <DashboardHabitsView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}

export default DashboardHabitSection

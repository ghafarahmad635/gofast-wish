import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import GoalsSummeryCardView, { GoalsSummeryCardViewErrorState, GoalsSummeryCardViewLoadingState } from "../views/goals-summery-card-view"


const GoalsSummeryCardSection = () => {
  const queryClient = getQueryClient()
  
    // ✅ Prefetch data for hydration
    void queryClient.prefetchQuery(
      trpc.goals.getAll.queryOptions()
    )
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GoalsSummeryCardViewLoadingState />}>
        <ErrorBoundary fallback={<GoalsSummeryCardViewErrorState />}>
          <GoalsSummeryCardView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}

export default GoalsSummeryCardSection

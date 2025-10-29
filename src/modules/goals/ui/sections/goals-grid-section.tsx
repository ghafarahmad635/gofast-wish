// modules/goals/ui/sections/goals-grid-section.tsx
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import React, { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import GoalsGridViews, { GoalsGridViewsErrorState, GoalsGridViewsLoadingState } from "../views/goals-grid-view"
import GoalsFilters from "../components/goals-filters"

interface GoalsGridSectionProps {
  search?: string | null
  page: number
  status?: string | null
  priority?: string | null
  sort?: "asc" | "desc"
}

const GoalsGridSection = async ({ search, page, status, priority, sort }: GoalsGridSectionProps) => {
  const queryClient = getQueryClient()

  // ✅ Prefetch TRPC data with filters
  await queryClient.prefetchQuery(
    trpc.goals.getMany.queryOptions({
      search,
      page,
      status,
      priority,
      sort,
    })
  )

  return (
    <div className="space-y-4">
      <GoalsFilters />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<GoalsGridViewsLoadingState />}>
          <ErrorBoundary fallback={<GoalsGridViewsErrorState />}>
            <GoalsGridViews />
          </ErrorBoundary>
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}

export default GoalsGridSection

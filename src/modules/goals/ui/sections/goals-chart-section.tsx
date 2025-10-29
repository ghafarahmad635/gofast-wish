import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';
import GoalsCompletionChartView, { GoalsCompletionChartViewErrorState, GoalsCompletionChartViewLoadingState } from '../views/goals-chart-view';

const GoalsChartSection= () => {
   const queryClient = getQueryClient();
    // ✅ Prefetch data for hydration
       void queryClient.prefetchQuery(
         trpc.goals.getAll.queryOptions()
       )
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GoalsCompletionChartViewLoadingState />}>
        <ErrorBoundary fallback={<GoalsCompletionChartViewErrorState />}>
          <GoalsCompletionChartView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}

export default GoalsChartSection

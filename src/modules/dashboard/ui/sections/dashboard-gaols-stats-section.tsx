import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import GoalStatusView, { GoalsViewStatusErrorState, GoalsViewStatusLoadingState } from '../views/goals-status-view'
import { getQueryClient, trpc } from '@/trpc/server'

const DashboardGaolsStatsSection = async() => {
     const queryClient=getQueryClient();
       void queryClient.prefetchQuery(trpc.goals.getAll.queryOptions())
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
     <Suspense fallback={<GoalsViewStatusLoadingState />}>
     <ErrorBoundary fallback={<GoalsViewStatusErrorState />}>
      <GoalStatusView/>
     </ErrorBoundary>
     
     </Suspense>
    
   </HydrationBoundary>
  )
}

export default DashboardGaolsStatsSection

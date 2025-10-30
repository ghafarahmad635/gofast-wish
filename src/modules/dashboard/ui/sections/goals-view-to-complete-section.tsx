import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';
import GoalsViewToComplete, { GoalsVieDashboardLoadingState, GoalsViewDashboardErrorState } from '../views/goals-views-inCompleted';

const GoalsViewToCompleteSection = async() => {
    const queryClient=getQueryClient();
     void queryClient.prefetchQuery(trpc.goals.getManyLatestForCarousel.queryOptions({
          
          status:'incomplete'
        }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<GoalsVieDashboardLoadingState />}>
     <ErrorBoundary fallback={<GoalsViewDashboardErrorState />}>
      <GoalsViewToComplete/>
     </ErrorBoundary>
     
     </Suspense>
   </HydrationBoundary>
  )
}

export default GoalsViewToCompleteSection

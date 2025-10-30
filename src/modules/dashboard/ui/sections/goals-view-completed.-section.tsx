import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import GoalsViewCompleted, { GoalsViewCompletedErrorState, GoalsViewCompletedLoadingState } from '../views/goals-views-completed'
import { getQueryClient, trpc } from '@/trpc/server'

const GoalsViewCompletedSection = async() => {
    const queryClient=getQueryClient();
     void queryClient.prefetchQuery(trpc.goals.getManyLatestForCarousel.queryOptions({
              
              status:'completed'
            }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<GoalsViewCompletedLoadingState />}>
     <ErrorBoundary fallback={<GoalsViewCompletedErrorState />}>
      <GoalsViewCompleted/>
     </ErrorBoundary>
     
     </Suspense>
   </HydrationBoundary>
  )
}

export default GoalsViewCompletedSection

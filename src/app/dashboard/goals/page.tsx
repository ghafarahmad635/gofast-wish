import { auth } from '@/lib/auth'
import GoalsViews, { GoalsViewErrorState, GoalsViewLoadingState } from '@/modules/goals/ui/views/goals-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import{ ErrorBoundary } from 'react-error-boundary'
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react'
import { GoalsListHeader } from '@/modules/goals/ui/components/goals-list-header';

const Goals = async() => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
   if (!session) {
    redirect("/sign-in");
  }
  const queryClient=getQueryClient();
  void queryClient.prefetchQuery(trpc.goals.getMany.queryOptions())
  return (
    <>
    <GoalsListHeader />
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GoalsViewLoadingState />}>
      <ErrorBoundary fallback={<GoalsViewErrorState />}>
        <GoalsViews />
      </ErrorBoundary>
        
      </Suspense>
      
  
    </HydrationBoundary>
    </>
  )
    
}

export default Goals

import { auth } from '@/lib/auth'
import { loadHabitsFilters } from '@/modules/habits/searchParams'
import { HabitsListHeader } from '@/modules/habits/ui/components/habits-list-header'
import HabitsView, { HabitsViewErrorState, HabitsViewLoadingState } from '@/modules/habits/ui/views/habits-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SearchParams } from 'nuqs'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface Props {
  searchParams: Promise<SearchParams>;
};
const page = async({searchParams}:Props) => {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
     if (!session) {
      redirect("/sign-in");
    }
   const queryClient=getQueryClient();
   const filters=await loadHabitsFilters(searchParams)
   void queryClient.prefetchQuery(trpc.habitsTracker.getMany.queryOptions({
    ...filters
   }))
   
  return (
    <>
     <HabitsListHeader/>
      <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HabitsViewLoadingState />}>
      <ErrorBoundary fallback={<HabitsViewErrorState />}>
        <HabitsView />
      </ErrorBoundary>
        
      </Suspense>
      
  
    </HydrationBoundary>
    </>
  )
}

export default page

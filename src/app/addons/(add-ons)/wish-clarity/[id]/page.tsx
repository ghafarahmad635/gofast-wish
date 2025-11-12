
import { auth } from '@/lib/auth'
import WishClarityCoachView, { WishClarityCoachViewErrorState, WishClarityCoachViewLoadingState } from '@/modules/addons/tools/WishClarityCoach/ui/views/wish-clarity-coach-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface Props{
  params:Promise<{
    id:string
  }>
}
const page = async({params}:Props) => {
   const { id } = await params
   const session = await auth.api.getSession({
        headers: await headers(),
      });
       if (!session) {
        redirect("/sign-in");
      }
       const queryClient=getQueryClient();
       void queryClient.prefetchQuery(trpc.addonsRouter.getOneById.queryOptions({id }))
       
  
  return (
     <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<WishClarityCoachViewLoadingState />}>
          <ErrorBoundary fallback={<WishClarityCoachViewErrorState />}>
            <WishClarityCoachView id={id}/>
          </ErrorBoundary>
        </Suspense>

     </HydrationBoundary>
    
  )
}

export default page

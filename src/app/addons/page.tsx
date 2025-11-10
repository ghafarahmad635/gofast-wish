import { auth } from '@/lib/auth'
import AddonsView, { AddonsViewErrorState, AddonsViewLoadingState } from '@/modules/addons-dashboard/ui/views/addons-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

const page = async() => {
   const queryClient = getQueryClient()
   const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) redirect("/sign-in")
    void queryClient.prefetchQuery(trpc.addonsRouter.getMany.queryOptions())
  return (
     <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AddonsViewLoadingState />}>
          
            <ErrorBoundary fallback={<AddonsViewErrorState />}>
              <AddonsView/>
          </ErrorBoundary>
        </Suspense>


     </HydrationBoundary>
    
  )
}

export default page

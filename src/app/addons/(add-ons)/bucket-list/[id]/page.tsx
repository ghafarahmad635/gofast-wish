import BucketListView, { BucketListViewErrorState, BucketListViewLoadingState } from '@/addons/bucketList/ui/views/bucket-list-view'
import { auth } from '@/lib/auth'
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
       void queryClient.prefetchQuery(trpc.bucketListRouter.getOneById.queryOptions({id }))
       
  
  return (
     <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<BucketListViewLoadingState />}>
          <ErrorBoundary fallback={<BucketListViewErrorState />}>
            <BucketListView id={id}/>
          </ErrorBoundary>
        </Suspense>

     </HydrationBoundary>
    
  )
}

export default page

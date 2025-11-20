import { loadSearchParams } from '@/modules/admin-users/params';
import UserFilters from '@/modules/admin-users/ui/components/user-filters';
import AdminUsersView, { AdminUsersViewErrorState, AdminUsersViewLoadingState } from '@/modules/admin-users/ui/views/admin-users-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { SearchParams } from 'nuqs/server';
import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';
interface Props {
  searchParams: Promise<SearchParams>
}
const page = async({ searchParams }: Props) => {
  const filter = await loadSearchParams(searchParams)
   const queryClient=getQueryClient();
   void queryClient.prefetchQuery(trpc.adminUsers.getMany.queryOptions({...filter}))
  return (

    <>
    <article className="p-4 gap-y-2 flex-grow flex flex-col">
      <UserFilters/>
     <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AdminUsersViewLoadingState />}>
          <ErrorBoundary fallback={<AdminUsersViewErrorState />}>
            <AdminUsersView/>
          </ErrorBoundary>
        </Suspense>

     </HydrationBoundary>
      </article>
    </>
  )
}

export default page

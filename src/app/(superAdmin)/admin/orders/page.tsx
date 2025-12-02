
import { loadSearchParams } from '@/modules/admin-orders/params';
import OrdersFilters from '@/modules/admin-orders/ui/components/orders-filters';
import AdminOrdersView, { AdminOrdersViewErrorState, AdminOrdersViewLoadingState } from '@/modules/admin-orders/ui/views/admin-orders-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { SearchParams } from 'nuqs/server';

import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';
interface Props {
  searchParams: Promise<SearchParams>
}
const page = async({ searchParams }: Props) => {
   const filter = await loadSearchParams(searchParams)
   const queryClient=getQueryClient();
    void queryClient.prefetchQuery(trpc.adminOrders.getMany.queryOptions({...filter}))
  return (
    <article className="p-4 gap-y-2 flex-grow flex flex-col">
       <OrdersFilters/>
      <HydrationBoundary state={dehydrate(queryClient)}>
         <Suspense fallback={<AdminOrdersViewLoadingState />}>
          <ErrorBoundary fallback={<AdminOrdersViewErrorState />}>
            <AdminOrdersView/>
          </ErrorBoundary>
         </Suspense>
      </HydrationBoundary>
    </article>
  )
}

export default page

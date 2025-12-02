import { loadSearchParams } from "@/modules/admin-subscription/params";
import SubscriptionFilters from "@/modules/admin-subscription/ui/components/subscription-filters";
import AdminSubscriptionsView, { AdminSubscriptionsViewErrorState, AdminSubscriptionsViewLoadingState } from "@/modules/admin-subscription/ui/views/admin-subscription-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { SearchParams } from "nuqs/server";
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface Props {
  searchParams: Promise<SearchParams>
}
const page = async({ searchParams }: Props) => {
  const filter = await loadSearchParams(searchParams)
    const queryClient=getQueryClient();
    void queryClient.prefetchQuery(trpc.adminSubscriptions.getMany.queryOptions({...filter}))
  return (
    <>
    <article className="p-4 gap-y-2 flex-grow flex flex-col">
      <SubscriptionFilters/>
     <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AdminSubscriptionsViewLoadingState />}>
          <ErrorBoundary fallback={<AdminSubscriptionsViewErrorState />}>
            <AdminSubscriptionsView/>
          </ErrorBoundary>
        </Suspense>

     </HydrationBoundary>
      </article>
    </>
  )
}

export default page

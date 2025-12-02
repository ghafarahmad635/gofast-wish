import { loadAddonsSearchParams } from "@/modules/admin-addons/params";
import AddonsFilters from "@/modules/admin-addons/ui/components/addons-filters";
import AdminAddonsView, { AdminAddonsViewErrorState, AdminAddonsViewLoadingState } from "@/modules/admin-addons/ui/views/admin-addons-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SearchParams } from "nuqs/server"
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  searchParams: Promise<SearchParams>
}
const page = async ({ searchParams }: Props) => {
   const filter = await loadAddonsSearchParams(searchParams)
   const queryClient=getQueryClient();
      void queryClient.prefetchQuery(trpc.adminAddons.getMany.queryOptions({...filter}))
  return (
     <article className="p-4 gap-y-2 flex-grow flex flex-col">
      <AddonsFilters/>
      <HydrationBoundary state={dehydrate(queryClient)}>
              <Suspense fallback={<AdminAddonsViewLoadingState />}>
                <ErrorBoundary fallback={<AdminAddonsViewErrorState />}>
                  <AdminAddonsView/>
                </ErrorBoundary>
              </Suspense>
      
           </HydrationBoundary>
      
    </article>
  )
}

export default page

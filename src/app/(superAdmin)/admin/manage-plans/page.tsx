import AdminPlansView, { AdminPlansViewErrorState, AdminPlansViewLoadingState } from "@/modules/adminPlans/ui/views/admin-plans-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

export const dynamic = "force-dynamic";
const page = () => {
     const queryClient=getQueryClient();
     void queryClient.prefetchQuery(trpc.adminPlansRouter.list.queryOptions())
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
       <Suspense fallback={<AdminPlansViewLoadingState />}>
                      <ErrorBoundary fallback={<AdminPlansViewErrorState />}>
                        <AdminPlansView/>
                      </ErrorBoundary>
                    </Suspense>
    </HydrationBoundary>
  )
}

export default page

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AdminOverviewPanelsView, { AdminOverviewPanelsViewError, AdminOverviewPanelsViewLoading } from "../../views/AdminOverviewPanelsView";


const AdminOverviewPanels = () => {
     const queryClient=getQueryClient();
     void queryClient.prefetchQuery(trpc.adminDashboard.overview.queryOptions({
        recentUsersLimit: 10,
      recentOrdersLimit: 10,
      attentionLimit: 12,
     }))
  return (
      <HydrationBoundary state={dehydrate(queryClient)}>
       <Suspense fallback={<AdminOverviewPanelsViewLoading />}>
                <ErrorBoundary fallback={<AdminOverviewPanelsViewError />}>
                  <AdminOverviewPanelsView/>
                </ErrorBoundary>
              </Suspense>
    </HydrationBoundary>
  )
}

export default AdminOverviewPanels

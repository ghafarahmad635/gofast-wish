import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AdminChartsView, { AdminChartsViewError, AdminChartsViewLoading } from "../../views/AdminChartsView";


const AdminCharts = () => {
     const queryClient=getQueryClient();
         void queryClient.prefetchQuery(trpc.adminDashboard.charts.queryOptions({
             usersDays: 30,
      revenueDays: 90,
      includeSubsBreakdown: true,
         }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
       <Suspense fallback={<AdminChartsViewLoading />}>
                <ErrorBoundary fallback={<AdminChartsViewError />}>
                  <AdminChartsView/>
                </ErrorBoundary>
              </Suspense>
    </HydrationBoundary>
  )
}

export default AdminCharts

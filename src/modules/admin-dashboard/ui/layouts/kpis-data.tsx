import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import KpisDataView, { KpisDataViewErrorState, KpisDataViewLoadingState } from "../../views/kpis-data-view";
import { ErrorBoundary } from "react-error-boundary";


const KpisData = () => {
     const queryClient=getQueryClient();
     void queryClient.prefetchQuery(trpc.adminDashboard.kpis.queryOptions())
  return (
      <HydrationBoundary state={dehydrate(queryClient)}>
       <Suspense fallback={<KpisDataViewLoadingState />}>
                <ErrorBoundary fallback={<KpisDataViewErrorState />}>
                  <KpisDataView/>
                </ErrorBoundary>
              </Suspense>
    </HydrationBoundary>
  )
}

export default KpisData

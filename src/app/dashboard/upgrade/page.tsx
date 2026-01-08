
import UpgradeView, { UpgradeViewViewsErrorState, UpgradeViewViewsLoadingState } from "@/modules/upgrade/ui/views/upgrade-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";



export default function page() {
  const queryClient=getQueryClient();
  void queryClient.prefetchQuery(trpc.billing.getPlans.queryOptions())

  return (
    <>
    <HydrationBoundary state={dehydrate(queryClient)}>
                  <Suspense fallback={<UpgradeViewViewsLoadingState />}>
                    <ErrorBoundary fallback={<UpgradeViewViewsErrorState />}>
                      <UpgradeView/>
                    </ErrorBoundary>
                  </Suspense>
          
               </HydrationBoundary>
    
    </>
    
  );
}

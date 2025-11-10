import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import AddonMenuView, { AddonsMenuViewErrorState, AddonsMenuViewLoadingState } from "../views/addon-menu-view";


const AddonsMenuView = async() => {
     const queryClient = getQueryClient();
     void queryClient.prefetchQuery(
        trpc.addonsRouter.getMany.queryOptions() 
    );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AddonsMenuViewLoadingState />}>
        <ErrorBoundary fallback={<AddonsMenuViewErrorState />}>
          <AddonMenuView/>
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}

export default AddonsMenuView

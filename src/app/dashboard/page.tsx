import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/dashboard/params";
import GoalsInCompleteHeader from "@/modules/dashboard/ui/components/dashbaord-completed-goals-header";
import GoalsInCompletedHeader from "@/modules/dashboard/ui/components/dashboard-goalsIncompleted-header";

import DashboardHeader from "@/modules/dashboard/ui/components/dashboard-header"

import GoalStatusView, { GoalsViewStatusErrorState, GoalsViewStatusLoadingState } from "@/modules/dashboard/ui/views/goals-status-view"

import GoalsViewCompleted, { GoalsViewCompletedErrorState, GoalsViewCompletedLoadingState } from "@/modules/dashboard/ui/views/goals-views-completed";
import GoalsViewToComplete, { GoalsViewDashboardErrorState, GoalsVieDashboardLoadingState } from "@/modules/dashboard/ui/views/goals-views-inCompleted";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface Props {
  searchParams: Promise<SearchParams>;
};


const DashboardPage = async({searchParams}:Props) => {
  const filter = await loadSearchParams(searchParams);
  const session = await auth.api.getSession({
      headers: await headers(),
    });
     if (!session) {
      redirect("/sign-in");
    }
    const queryClient=getQueryClient();
    void queryClient.prefetchQuery(trpc.goals.getMany.queryOptions({}))
    void queryClient.prefetchQuery(trpc.goals.getManyByStatus.queryOptions({
      page: filter.inCompletedPage,
      status:'incomplete'
    }));
    void queryClient.prefetchQuery(trpc.goals.getManyByStatus.queryOptions({
      page: filter.completedPage,
      status:"completed"
    }));
  

  return (
   <>
   <DashboardHeader/>
   <HydrationBoundary state={dehydrate(queryClient)}>
     <Suspense fallback={<GoalsViewStatusLoadingState />}>
     <ErrorBoundary fallback={<GoalsViewStatusErrorState />}>
      <GoalStatusView/>
     </ErrorBoundary>
     
     </Suspense>
    
   </HydrationBoundary>
   <div>
    Habit Tracker
   </div>
   {/* inCompleted goals section */}
   <GoalsInCompletedHeader/>
   <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<GoalsVieDashboardLoadingState />}>
     <ErrorBoundary fallback={<GoalsViewDashboardErrorState />}>
      <GoalsViewToComplete/>
     </ErrorBoundary>
     
     </Suspense>
   </HydrationBoundary>

  {/* completed goals section */}
   <GoalsInCompleteHeader/>
   <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<GoalsViewCompletedLoadingState />}>
     <ErrorBoundary fallback={<GoalsViewCompletedErrorState />}>
      <GoalsViewCompleted/>
     </ErrorBoundary>
     
     </Suspense>
   </HydrationBoundary>
   
   
   </>
      
    
  )
}

export default DashboardPage

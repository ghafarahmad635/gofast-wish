// app/(dashboard)/habits/ui/sections/habits-stats-section.tsx
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import HabitsStatsView, { HabitsStatsSectionErrorState, HabitsStatsSectionLoadingState } from "../views/habits-stats-view";

interface Props {
  frequency: "daily" | "weekly" | "monthly"
}

export default async function HabitsStatsSection({ frequency }: Props) {
    const queryClient=getQueryClient();
  void queryClient.prefetchQuery(trpc.habitsTracker.getManyByFrequency.queryOptions({frequency }))

  return (
     <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<HabitsStatsSectionLoadingState />}>
            <ErrorBoundary fallback={<HabitsStatsSectionErrorState />}>
                    <HabitsStatsView />
                </ErrorBoundary>
            </Suspense>
     </HydrationBoundary>
    
  )
}

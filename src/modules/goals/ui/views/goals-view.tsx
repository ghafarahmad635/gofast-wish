'use client'

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query";

const GoalsViews = () => {
    const trpc=useTRPC();
    const {data}=useSuspenseQuery(trpc.goals.getMany.queryOptions())
    
  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}

export default GoalsViews


export const GoalsViewLoadingState = () => {
    return(
        <LoadingState title="Loading Goals" description="Please wait while we fetch your goals."/>
    )

}
export const GoalsViewErrorState = () => {
    return(
        <ErrorState title="Error Loading Goals" description="There was an error fetching your goals."/>
    )

}
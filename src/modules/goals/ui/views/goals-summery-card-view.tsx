'use client'
import { ErrorState } from '@/components/error-state';
import GoalsSummaryCards from '@/components/GoalsSummaryCards';
import { useTRPC } from '@/trpc/client';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React from 'react'

const GoalsSummeryCardView = () => {
     const trpc = useTRPC();
   
    const { data } = useSuspenseQuery(trpc.goals.getAll.queryOptions());
    const totalGoals = data.length || 0;
    const completedGoals = data?.filter((g: any) => g.isCompleted)?.length || 0;
    const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  return (
     <GoalsSummaryCards
        totalGoals={totalGoals}
        completedGoals={completedGoals}
        progress={progress}
    />
  )
}

export default GoalsSummeryCardView


export const GoalsSummeryCardViewLoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-2xl p-8 shadow-lg bg-white h-[190px] flex flex-col justify-center items-center"
      >
        <div className="w-14 h-14 bg-gray-300 rounded-full mb-4" />
        <div className="w-24 h-5 bg-gray-300 rounded mb-2" />
        <div className="w-16 h-4 bg-gray-300 rounded" />
      </div>
    ))}
  </div>
)


export const GoalsSummeryCardViewErrorState=()=>{
    return(
        <ErrorState
        title=''
        description=''
        />
    )
}
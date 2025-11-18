'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ErrorState } from '@/components/error-state'
import { NewGoalDialog } from '@/modules/goals/ui/components/new-goal-dialog'

import type { AIBudgetPlanList } from '../../schema'
import GenerateBudgetForm from '../components/generate-budget-form'
import BudgetPlanCard from '../components/budget-plan-card'
import { Loader2 } from 'lucide-react'

interface Props {
  id: string
}

export default function BudgetPlanerView({ id }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [budgetPlans, setBudgetPlans] = useState<AIBudgetPlanList>([])
  const [selectedGoal, setSelectedGoal] = useState<{ title: string; description: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const trpc = useTRPC()
  const { data } = useSuspenseQuery(
    trpc.addonsRouter.getOneById.queryOptions({ id })
  )

  // Smooth scroll while generating / when updates arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [isGenerating, budgetPlans])

  return (
    <>
      <NewGoalDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultValues={selectedGoal || undefined}
      />

      <div className="py-5 px-4">
        <h1 className="text-3xl font-bold">
          {data.name}
        </h1>
        <p>{data.description}</p>

        {/* Form that triggers AI and updates budgetPlans */}
        <GenerateBudgetForm
          toolID={id}
          onGenerate={setBudgetPlans}
          onLoadingChange={setIsGenerating}
        />

        {/* Enhanced loader while first generation is running */}
        {isGenerating && budgetPlans.length === 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Building your budget plans
                </p>
                <p className="text-xs text-gray-500">
                  We are analyzing your income, expenses, and debts to create a few clear options for you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm animate-pulse space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                  </div>

                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />

                  <div className="mt-2 space-y-2">
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                    <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <div className="h-8 w-24 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated plans */}
        {budgetPlans.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-semibold">Generated Budget Plans</h2>
              {isGenerating && (
              <span className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full bg-gray-100 border border-gray-300">
                <Loader2 className="h-3 w-3 animate-spin text-gray-600" />
                <span className="text-gray-700">AI is updating your plans…</span>
              </span>
            )}

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {budgetPlans.map((plan, i) => (
                <BudgetPlanCard
                  key={`${plan.overview.plan_focus}-${i}`}
                  plan={plan}
                  index={i}
                  onOpenDialog={({ title, description }) => {
                    setSelectedGoal({ title, description })
                    setIsDialogOpen(true)
                  }}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export const BudgetPlanerViewLoadingState = () => (
  <div className="py-10 px-4">
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 bg-gray-200 rounded" />
      <div className="h-6 w-1/2 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 border border-gray-200 rounded-xl bg-gray-100 h-32" />
        ))}
      </div>
    </div>
  </div>
)

export const BudgetPlanerViewErrorState = () => (
  <ErrorState
    title=" Something went wrong"
    description=" We couldn’t load your add-on data. Please try again later."
  />
)

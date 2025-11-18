'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AIBudgetPlan } from '../../schema'

interface BudgetPlanCardProps {
  plan: AIBudgetPlan
  index?: number
  onOpenDialog?: (goal: { title: string; description: string }) => void
}

const BudgetPlanCard: React.FC<BudgetPlanCardProps> = ({
  plan,
  index,
  onOpenDialog,
}) => {
  const { overview, categories, debts, monthly_targets, monthly_actions } = plan

  const title =
    index !== undefined
      ? `Plan ${index + 1} – ${overview.plan_focus}`
      : overview.plan_focus

  const summary = overview.summary
  const income = overview.total_income
  const expenses = overview.total_expenses
  const surplus = overview.surplus_or_deficit

  const surplusLabel = surplus >= 0 ? 'Left over each month' : 'Shortfall each month'
  const surplusClass = surplus >= 0 ? 'text-emerald-600' : 'text-red-600'

  // Show top three category adjustments by absolute change
  const sortedCategories = [...categories].sort(
    (a, b) => Math.abs(b.difference) - Math.abs(a.difference),
  )
  const topCategories = sortedCategories.slice(0, 3)

  // Sort debts by payoff order
  const sortedDebts = [...debts].sort(
    (a, b) => a.priority_order - b.priority_order,
  )

  // ---------- Build full description text for goal (human friendly) ----------
  const fullDescriptionLines: string[] = []

  fullDescriptionLines.push(title)
  fullDescriptionLines.push('')
  fullDescriptionLines.push('What this plan does')
  fullDescriptionLines.push(summary)
  fullDescriptionLines.push('')

  fullDescriptionLines.push('Your monthly money picture')
  fullDescriptionLines.push(`- Money coming in: ${income}`)
  fullDescriptionLines.push(`- Planned spending: ${expenses}`)
  fullDescriptionLines.push(`- ${surplusLabel}: ${surplus}`)
  fullDescriptionLines.push('')

  fullDescriptionLines.push('Where your spending changes')
  topCategories.forEach((cat) => {
    const direction =
      cat.difference < 0 ? 'lower' : cat.difference > 0 ? 'raise' : 'keep the same'
    const absDiff = Math.abs(cat.difference)
    fullDescriptionLines.push(
      `- ${cat.label}: ${cat.current} → ${cat.recommended} (change of ${absDiff}). This plan tries to ${direction} this area to free up money for your goals.`,
    )
  })
  fullDescriptionLines.push('')

  fullDescriptionLines.push('How your debts are paid')
  sortedDebts.forEach((debt) => {
    fullDescriptionLines.push(
      `- #${debt.priority_order} ${debt.name}: pay ${debt.suggested_payment} per month at ${debt.apr}% interest.`,
    )
  })
  fullDescriptionLines.push('')

  fullDescriptionLines.push('Monthly targets in this plan')
  fullDescriptionLines.push(
    `- Emergency fund this month: ${monthly_targets.emergency_fund}`,
  )
  fullDescriptionLines.push(
    `- Extra toward debt this month: ${monthly_targets.extra_debt_payment}`,
  )
  fullDescriptionLines.push(
    `- Extra savings / investing this month: ${monthly_targets.savings_or_investing}`,
  )
  if (monthly_targets.fun_or_flex !== undefined) {
    fullDescriptionLines.push(
      `- Fun / flex money this month: ${monthly_targets.fun_or_flex}`,
    )
  }
  fullDescriptionLines.push('')

  fullDescriptionLines.push('Simple actions to follow each month')
  monthly_actions.forEach((action, idx) => {
    fullDescriptionLines.push(
      `- ${idx + 1}. ${action.title}: ${action.description}`,
    )
  })

  const fullDescriptionForGoal = fullDescriptionLines.join('\n')
  // ---------------------------------------------------------------------------

  return (
    <Card className="flex flex-col justify-between border border-gray-200 bg-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-transform duration-200 cursor-default">
      <CardHeader className="pb-2">
        {index !== undefined && (
          <span className="text-xs text-gray-400 mb-1 block">
            Plan #{index + 1}
          </span>
        )}
        <CardTitle className="text-lg font-semibold text-gray-800">
          {overview.plan_focus}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          {summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-gray-800">
        {/* Monthly picture */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Monthly overview
          </div>
          <div className="flex flex-col gap-1">
            <div>Money coming in: {income}</div>
            <div>Planned spending: {expenses}</div>
            <div className={surplusClass}>
              {surplusLabel}: {surplus}
            </div>
          </div>
        </div>

        {/* Category adjustments */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Biggest changes in day to day spending
          </div>
          <ul className="space-y-1">
            {topCategories.map((cat) => {
              const direction =
                cat.difference < 0
                  ? 'slightly lower'
                  : cat.difference > 0
                  ? 'a bit higher'
                  : 'about the same'
              return (
                <li key={cat.key} className="flex flex-col text-xs">
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-gray-600">
                    {cat.current} → {cat.recommended}{' '}
                    <span
                      className={
                        cat.difference < 0
                          ? 'text-emerald-600'
                          : cat.difference > 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }
                    >
                      (change {cat.difference})
                    </span>
                  </span>
                  <span className="text-gray-500">
                    This plan makes this area {direction} to help fit your goals.
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Debts */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Order to pay debts
          </div>
          <ul className="space-y-1">
            {sortedDebts.map((debt) => (
              <li key={debt.name} className="text-xs">
                <span className="font-medium">
                  {debt.priority_order}. {debt.name}
                </span>
                <span className="text-gray-600">
                  {' '}
                  — pay {debt.suggested_payment} per month, {debt.apr} percent
                  interest.
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Monthly targets */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Monthly targets in this plan
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-500">Emergency fund</div>
              <div className="font-medium">
                {monthly_targets.emergency_fund}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Extra toward debt</div>
              <div className="font-medium">
                {monthly_targets.extra_debt_payment}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Savings / investing</div>
              <div className="font-medium">
                {monthly_targets.savings_or_investing}
              </div>
            </div>
            {monthly_targets.fun_or_flex !== undefined && (
              <div>
                <div className="text-gray-500">Fun / flex money</div>
                <div className="font-medium">
                  {monthly_targets.fun_or_flex}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions count */}
        <div className="mt-1 text-xs text-gray-500">
          {monthly_actions.length} simple actions to follow each month
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-end">
        <Button
          onClick={() =>
            onOpenDialog?.({
              title,
              description: fullDescriptionForGoal,
            })
          }
        >
          Save this plan as a goal
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BudgetPlanCard

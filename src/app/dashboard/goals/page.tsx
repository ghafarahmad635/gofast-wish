// app/(dashboard)/goals/page.tsx
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { GoalsListHeader } from '@/modules/goals/ui/components/goals-list-header'
import type { SearchParams } from 'nuqs/server'
import GoalsSummeryCardSection from '@/modules/goals/ui/sections/goals-summery-cards-section'
import GoalsGridSection from '@/modules/goals/ui/sections/goals-grid-section'
import GoalsChartSection from '@/modules/goals/ui/sections/goals-chart-section'
import { loadGoalsFilterParams } from '@/modules/goals/params'

interface Props {
  searchParams: Promise<SearchParams>
}

const Goals = async ({ searchParams }: Props) => {
  const filter = await loadGoalsFilterParams(searchParams)
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) redirect("/sign-in")

  return (
    <>
      <GoalsListHeader />
      <div className="flex-1 pb-6 px-4 md:px-8 space-y-10">
        <GoalsSummeryCardSection />
        <GoalsGridSection
          search={filter.search}
          page={filter.page}
          status={filter.status}
          priority={filter.priority}
           sort={filter.sort} // ✅ normalize
        />
        <GoalsChartSection />
      </div>
    </>
  )
}

export default Goals

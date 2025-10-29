import { auth } from '@/lib/auth'
import { loadHabitsFilters } from '@/modules/habits/searchParams'
import { HabitsListHeader } from '@/modules/habits/ui/components/habits-list-header'
import HabitFrequencyChartSection from '@/modules/habits/ui/sections/habits-frequency-chart-section'
import HabitsGridSection from '@/modules/habits/ui/sections/habits-grid-section'
import HabitsStatsSection from '@/modules/habits/ui/sections/habits-stats-section'
import HabitTrendChartSection from '@/modules/habits/ui/sections/habits-trend-chart-section'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SearchParams } from 'nuqs'


interface Props {
  searchParams: Promise<SearchParams>;
};
const page = async({searchParams}:Props) => {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
     if (!session) {
      redirect("/sign-in");
    }
  
   const filters=await loadHabitsFilters(searchParams)
   
   
  return (
    <>
     <HabitsListHeader/>
     <div className="px-6 py-0 space-y-10">
       <HabitsStatsSection frequency={filters.frequency} />
       <HabitsGridSection frequency={filters.frequency} habitPage ={filters.habitPage}/>
       <HabitFrequencyChartSection frequency={filters.frequency} />
       <HabitTrendChartSection frequency={filters.frequency} />
     </div>
    
      
    </>
  )
}

export default page

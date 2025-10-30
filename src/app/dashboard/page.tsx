import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/dashboard/params";
import GoalsInCompleteHeader from "@/modules/dashboard/ui/components/dashbaord-completed-goals-header";
import GoalsInCompletedHeader from "@/modules/dashboard/ui/components/dashboard-goalsIncompleted-header";
import DashboardHabitsHeader from "@/modules/dashboard/ui/components/dashboard-habits-header";

import DashboardHeader from "@/modules/dashboard/ui/components/dashboard-header"
import DashboardGaolsStatsSection from "@/modules/dashboard/ui/sections/dashboard-gaols-stats-section";
import DashboardHabitSection from "@/modules/dashboard/ui/sections/dashboard-habits-section";
import GoalsViewCompletedSection from "@/modules/dashboard/ui/sections/goals-view-completed.-section";
import GoalsViewToCompleteSection from "@/modules/dashboard/ui/sections/goals-view-to-complete-section";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";

interface Props {
  searchParams: Promise<SearchParams>;
};


const DashboardPage = async({searchParams}:Props) => {
  const params=await loadSearchParams(searchParams)
 
  const session = await auth.api.getSession({
      headers: await headers(),
    });
     if (!session) {
      redirect("/sign-in");
    }
   
  
   
  
  

  return (
    
   <>
   <DashboardHeader/>
   <section className="flex-1 pb-6 px-4 md:px-8 space-y-10">
    <DashboardGaolsStatsSection/>
    
    <article className="space-y-4">
      <GoalsInCompletedHeader/>
      <GoalsViewToCompleteSection/>
     
    </article>
    <article className="space-y-4">
      <DashboardHabitsHeader/>
      <DashboardHabitSection frequency={params.frequency}/>
    </article>
    <article className="space-y-4">
     <GoalsInCompleteHeader/>
      <GoalsViewCompletedSection/>
    </article>
   </section>
   
   
   
   
   
   


   
   
   
   
   </>
      
    
  )
}

export default DashboardPage

import { auth } from "@/lib/auth";
import Footer from "@/modules/landingpage/ui/components/footer";
import TopHeader from "@/modules/landingpage/ui/components/top-header";
import LandingPageView from "@/modules/landingpage/ui/views/landing-page-view";
import { headers } from "next/headers";
import { redirect } from "next/navigation";




export default async function Home() {
   const session= await auth.api.getSession({
    headers:await headers()
   });
   if(session){
    redirect('/dashboard')
   }
  

 return(
  <>
  <TopHeader/>
  <LandingPageView/>
  <Footer/>
  </>
 
 
 )

 
}

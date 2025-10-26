import { auth } from "@/lib/auth";
import Footer from "@/modules/landingpage/ui/components/footer";
import TopHeader from "@/modules/landingpage/ui/components/top-header";
import LandingPageView from "@/modules/landingpage/ui/views/landing-page-view";




export default async function Home() {
   
  

 return(
  <>
  <TopHeader/>
  <LandingPageView/>
  <Footer/>
  </>
 
 
 )

 
}

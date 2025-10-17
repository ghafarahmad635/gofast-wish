import { auth } from "@/lib/auth";
import { headers } from "next/headers";



export default async function Home() {
   const session = await auth.api.getSession({
        headers: await headers()
    })
  
if(session){
 return(
  <div>
     <h1>Welcome {session.user.name}</h1>
     <p>{session.user.id}</p>
  </div>
 
 
 )
}
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>Not authenticated</div>
    </div>
  );
}

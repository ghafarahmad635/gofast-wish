import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation';
import React from 'react'

const page = async() => {
   const session = await auth.api.getSession({
        headers: await headers(),
      });
       if (!session) {
        redirect("/sign-in");
      }
       const userRole = session.user?.role;
       if (userRole !== "superadmin") {
    
    redirect("/dashboard");
  }
    
  return (
    <div>
      {JSON.stringify(session.user,null,2)}
      SuperAdmin {session.user.role}
    </div>
  )
}

export default page

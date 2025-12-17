import { auth } from '@/lib/auth'
import AdminCharts from '@/modules/admin-dashboard/ui/layouts/AdminCharts';
import KpisData from '@/modules/admin-dashboard/ui/layouts/kpis-data';
import { headers } from 'next/headers'
import { redirect } from 'next/navigation';


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
    <div className='p-6 space-y-4'>
      <KpisData/>
      <AdminCharts/>
    </div>
  )
}

export default page

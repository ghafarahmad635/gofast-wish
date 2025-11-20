import { SidebarProvider } from '@/components/ui/sidebar'
import AdminSidebar from '@/modules/admin-dashboard/ui/components/addon-sidebar'
import { DashboardNavbar } from '@/modules/dashboard/ui/components/dashboard-navbar'
import React from 'react'

const layout = ({children}:{children: React.ReactNode}) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar/>
      <main className="flex flex-col min-h-screen w-full overflow-hidden bg-muted">
                      <DashboardNavbar />
                      {children}
                    </main>
    </SidebarProvider>
  )
}

export default layout

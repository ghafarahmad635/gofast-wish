
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Link from 'next/link'
import Image from "next/image";
import { Separator } from '@/components/ui/separator';
import AddonsMenuView from './layout/addon-menu-layout';
import DashboardUserButton from '@/modules/dashboard/ui/components/dashboard-user-button';
import { Home, RepeatIcon, TargetIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
const mainMenu = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Goals', href: '/dashboard/goals', icon: TargetIcon, },
    { label: 'Habits', href: '/dashboard/habits', icon: RepeatIcon },
    
  ]
const AddonsSidebar = () => {
  return (
     <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href={`/addons`} className="flex items-center gap-2 px-2 pt-2">
          <Image src="/logo.png" height={45} width={45} alt="GoFGast Wish" />
          <p className=" text-lg font-semibold">GoFast Addons</p>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator className="opacity-50 text-[#5D6B68]" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
             <AddonsMenuView/>
          </SidebarGroupContent>
         
        </SidebarGroup>
         <div className="px-4 py-2">
          <Separator className="opacity-50 text-[#5D6B68]" />
        </div>
         <SidebarGroup>
           <SidebarGroupContent>
              <SidebarMenu>
              {mainMenu.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-primary from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50 transition-all duration-150',
                     
                    )}
                    
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5 text-primary" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
           </SidebarGroupContent>
         </SidebarGroup>
        
      </SidebarContent>

       <SidebarFooter className="">
         <DashboardUserButton />
       </SidebarFooter>
    </Sidebar>
  )
}

export default AddonsSidebar

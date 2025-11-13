'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { PuzzleIcon, RepeatIcon, StarIcon, TargetIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import DashboardUserButton from "./dashboard-user-button";
const firstSection = [
  {
    icon: TargetIcon,
    label: "Goals",
    href: "/goals",
  },
  {
    icon: RepeatIcon,
    label: "Habits",
    href: "/habits",
  },

];

const secondSection = [
 
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/upgrade",
  },
];
const DashboardSidebar = () => {
  const pathname=usePathname();
  
  return (
   <Sidebar>
       <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href={`/dashboard`} className="flex items-center gap-2 px-2 pt-2">
          <Image src="/logo.png" height={45} width={45} alt="GoFGast Wish" />
          <p className=" text-lg font-semibold">GoFast Wish</p>
        </Link>
      </SidebarHeader>
       <div className="px-4 py-2">
        <Separator className="opacity-50 text-[#5D6B68]" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
             <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-primary from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                     pathname.includes(item.href) && "bg-linear-to-r/oklch border-[#5D6B68]/10"
                    )}
                    isActive={pathname.includes(item.href)}
                  >
                     <Link href={`/dashboard${item.href}`}>
                      <item.icon className="size-5 text-primary" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                    pathname.includes("/addons") && "bg-linear-to-r/oklch border-[#5D6B68]/10"
                  )}
                  isActive={pathname.includes("/addons")}
                >
                  <Link href="/addons">
                    <PuzzleIcon className="size-5 text-primary" />
                    <span className="text-sm font-medium tracking-tight">Add-ons</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
             </SidebarMenu>
             
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2">
          <Separator className="opacity-50 text-[#5D6B68]" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
             <SidebarMenu>
              {secondSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 hover:bg-linear-to-r/oklch border border-transparent hover:border-[#5D6B68]/10 from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50",
                      pathname.includes(item.href) && "bg-linear-to-r/oklch border-[#5D6B68]/10"
                    )}
                    isActive={pathname.includes(item.href)}
                  >
                    <Link href={`/dashboard/${item.href}`}>
                      <item.icon className="size-5" />
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

export default DashboardSidebar

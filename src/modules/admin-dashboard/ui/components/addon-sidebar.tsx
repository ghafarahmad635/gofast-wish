'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

import DashboardUserButton from '@/modules/dashboard/ui/components/dashboard-user-button';
import { Home, Users, Puzzle, CreditCard, ReceiptText, FolderTree, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const mainMenu = [
  { label: 'Admin Dashboard', href: '/admin', icon: Home },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Addons', href: '/admin/addons', icon: Puzzle },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Orders', href: '/admin/orders', icon: ReceiptText },
  { label: 'Goals Categories', href: '/admin/goals-categories', icon: FolderTree },
  { label: 'Manage Plans', href: '/admin/manage-plans', icon: Layers  },
];


const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href="/admin" className="flex items-center gap-2 px-2 pt-2">
          <Image src="/logo.png" height={45} width={45} alt="GoFast Wish" />
          <p className="text-lg font-semibold">GoFast Admin</p>
        </Link>
      </SidebarHeader>

      <div className="px-4 py-2">
        <Separator className="opacity-50 text-[#5D6B68]" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenu.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-10 border border-transparent transition-all duration-150',
                        'hover:bg-linear-to-r/oklch from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50 hover:border-primary',
                        isActive &&
                          'bg-sidebar-accent text-sidebar-accent-foreground border-primary'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            'size-5',
                            isActive
                              ? 'text-sidebar-accent-foreground'
                              : 'text-primary'
                          )}
                        />
                        <span className="text-sm font-medium tracking-tight">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;

'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'

export default function AddonMenuView() {
  const pathname = usePathname()
  const trpc = useTRPC()

  const { data: addons } = useSuspenseQuery(
    trpc.addonsRouter.getMany.queryOptions()
  )

  return (
    <SidebarMenu>
      {addons.map((addon) => (
        <SidebarMenuItem key={addon.id}>
          <SidebarMenuButton
            asChild
            className={cn(
              'h-10 border border-transparent hover:border-primary hover:bg-linear-to-r/oklch from-sidebar-accent from-5% via-30% via-sidebar/50 to-sidebar/50 transition-all duration-150',
              pathname.includes(addon.url ?? '') &&
                'bg-linear-to-r/oklch border-[#5D6B68]/10 shadow-sm'
            )}
            isActive={pathname.includes(addon.url ?? '')}
          >
            <Link
              href={`${addon.url}/${addon.id}`}
              className="flex items-center gap-2"
            >
              {addon.icon?.url && (
                <span className="flex items-center justify-center h-7 w-7 rounded-full overflow-hidden bg-sidebar-accent/40">
                  <Image
                    src={addon.icon.url}
                    alt={`${addon.name} icon`}
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                </span>
              )}

              <span className="text-sm font-medium tracking-tight">
                {addon.name}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export const AddonsMenuViewLoadingState = () => {
  return (
    <div className="flex flex-col gap-2 p-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-9 bg-gray-200 dark:bg-gray-800 rounded-md w-full"
        />
      ))}
    </div>
  )
}

export const AddonsMenuViewErrorState = () => {
  return (
    <div className="flex flex-col items-center justify-center text-red-500 gap-2 p-4">
      <AlertTriangle className="size-5" />
      <span className="text-sm font-medium">Failed to load add ons</span>
    </div>
  )
}

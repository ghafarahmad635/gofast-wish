'use client'

import { GeneratedAvatar } from '@/components/generated-avatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Drawer, DrawerContent, DrawerDescription, DrawerFooter,
  DrawerHeader, DrawerTitle, DrawerTrigger
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { authClient } from '@/lib/auth-client.ts';
import { CreditCardIcon, LogOutIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';

// NEW imports
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '@/components/ui/menubar'

const NavbarUserButton = () => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const isMobile = useIsMobile();

  if (isPending || !data?.user) return null;

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in');
        }
      }
    });
  };

  const handleBillingPortal = async () => {
    try {
      const { data: billing, error } = await authClient.subscription.billingPortal({
        returnUrl: process.env.NEXT_PUBLIC_APP_URL,
      });
      if (billing?.url) window.location.href = billing.url;
      if (error) throw error;
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  // Mobile stays the same (Drawer)
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger className="rounded-lg border  flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden">
          {data.user.image ? (
            <Avatar><AvatarImage src={data.user.image} /></Avatar>
          ) : (
            <GeneratedAvatar seed={data.user.name} variant="initials" className="size-9" />
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{data.user.name}</DrawerTitle>
            <DrawerDescription>{data.user.email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button variant="outline" onClick={handleBillingPortal}>
              <CreditCardIcon className="size-4 text-black" />
              Billing
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOutIcon className="size-4 text-black" />
              Logout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Menubar with avatar as the trigger
  return (
    <Menubar className="border border-border/10 bg-white/5 hover:bg-white/10 rounded-lg p-0">
      <MenubarMenu>
        <MenubarTrigger className="rounded-lg p-0 focus:outline-none data-[state=open]:bg-white/10">
          <div className="p-2 flex items-center gap-2">
            {data.user.image ? (
              <Avatar><AvatarImage src={data.user.image} /></Avatar>
            ) : (
              <GeneratedAvatar seed={data.user.name} variant="initials" className="size-9" />
            )}
          </div>
        </MenubarTrigger>

        <MenubarContent align="end" sideOffset={8} className="w-72">
          <div className="px-2 py-2">
            <div className="font-medium truncate">{data.user.name}</div>
            <div className="text-sm text-muted-foreground truncate">{data.user.email}</div>
          </div>
          <MenubarSeparator />

          <MenubarItem asChild>
            <Link href="/profile" className="flex items-center justify-between w-full cursor-pointer">
              <span>Profile</span>
              <UserIcon className="size-4" />
            </Link>
          </MenubarItem>

          <MenubarItem onClick={handleBillingPortal} className="cursor-pointer flex items-center justify-between">
            <span>Billing</span>
            <CreditCardIcon className="size-4" />
          </MenubarItem>

          <MenubarSeparator />

          <MenubarItem
            onClick={onLogout}
            disabled={isPending}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>Logout</span>
            <LogOutIcon className="size-4" />
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default NavbarUserButton;

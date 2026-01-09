"use client";

import { GeneratedAvatar } from "@/components/generated-avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client.ts";
import {
  ChevronDownIcon,
  CreditCardIcon,
  LayoutDashboard,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DashboardUserButton = () => {
  const { data, isPending, refetch } = authClient.useSession();
  const router = useRouter();
  const isMobile = useIsMobile();

  if (isPending || !data?.user) {
    return null;
  }

  const isImpersonatedSession = Boolean(data?.session?.impersonatedBy);

  const onLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  const handleLogoutAsUser = async () => {
    const { error } = await authClient.admin.stopImpersonating();

    if (error) {
      toast.error("Failed to logout as user");
      return;
    }

    await refetch();
    router.push("/admin/users");
  };

  const handleBillingPortal = async () => {
    try {
      const { data, error } = await authClient.subscription.billingPortal({
        returnUrl: process.env.NEXT_PUBLIC_APP_URL,
      });

      if (error) {
        toast.error("Failed to open billing portal");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

  // MOBILE
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger
          className={`rounded-lg border p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2 ${
            isImpersonatedSession
              ? "border-amber-500/70 bg-amber-500/5"
              : "border-border/10"
          }`}
        >
          {data.user.image ? (
            <Avatar>
              <AvatarImage src={data.user.image} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={data.user.name}
              variant="initials"
              className="size-9 mr-3"
            />
          )}

          <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
            <p className="text-sm truncate w-full">{data.user.name}</p>
            <p className="text-xs truncate w-full">{data.user.email}</p>

            {isImpersonatedSession && (
              <span className="text-[10px] font-semibold text-amber-500 uppercase">
                Impersonating
              </span>
            )}
          </div>

          <ChevronDownIcon className="size-4 shrink-0" />
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{data.user.name}</DrawerTitle>
            <DrawerDescription>{data.user.email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="space-y-2">
            <Button variant="outline" onClick={handleBillingPortal}>
              <CreditCardIcon className="size-4 mr-2 text-black" />
              Billing
            </Button>

            <Button variant="outline" onClick={onLogout}>
              <LogOutIcon className="size-4 mr-2 text-black" />
              Logout
            </Button>

            {isImpersonatedSession && (
              <Button variant="outline" onClick={handleLogoutAsUser}>
                <LogOutIcon className="size-4 mr-2 text-black" />
                Logout as User
              </Button>
            )}

            {data.user.role === "superadmin" && (
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <LayoutDashboard className="size-4 mr-2" />
                  Admin Area
                </Link>
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // DESKTOP
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`rounded-lg border p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2 ${
          isImpersonatedSession
            ? "border-amber-500/70 bg-amber-500/5"
            : "border-border/10"
        }`}
      >
        {data.user.image ? (
          <Avatar>
            <AvatarImage src={data.user.image} />
          </Avatar>
        ) : (
          <GeneratedAvatar
            seed={data.user.name}
            variant="initials"
            className="size-9 mr-3"
          />
        )}

        <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
          <p className="text-sm truncate w-full">{data.user.name}</p>
          <p className="text-xs truncate w-full">{data.user.email}</p>

          {isImpersonatedSession && (
            <span className="text-[10px] font-semibold text-amber-500 uppercase">
              Impersonating
            </span>
          )}
        </div>

        <ChevronDownIcon className="size-4 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium truncate">{data.user.name}</span>
            <span className="text-sm font-normal text-muted-foreground truncate">
              {data.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <span>Profile</span>
            <UserIcon className="size-4" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleBillingPortal}
          className="cursor-pointer flex items-center justify-between"
        >
          <span>Billing</span>
          <CreditCardIcon className="size-4" />
        </DropdownMenuItem>

        {data.user.role === "superadmin" && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin"
              className="flex items-center justify-between w-full cursor-pointer"
            >
              <span>Admin Area</span>
              <LayoutDashboard className="size-4" />
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={onLogout}
          disabled={isPending}
          className="cursor-pointer flex items-center justify-between"
        >
          <span>Logout</span>
          <LogOutIcon className="size-4" />
        </DropdownMenuItem>

        {isImpersonatedSession && (
          <DropdownMenuItem
            onClick={handleLogoutAsUser}
            disabled={isPending}
            className="cursor-pointer flex items-center justify-between"
          >
            <span>Logout as User</span>
            <LogOutIcon className="size-4" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardUserButton;

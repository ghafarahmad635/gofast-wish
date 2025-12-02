"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
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
import { authClient } from "@/lib/auth-client.ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


type UserActionsProps = {
  userId: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
   onBanClick?: () => void; 
    onViewDetailsClick?: () => void;
};

const UserActions: React.FC<UserActionsProps> = ({
  userId,
  name,
  email,
  role,
  banned,
  onBanClick,
  onViewDetailsClick
}) => {
  const isMobile = useIsMobile();
  const router = useRouter();

  const isBanned = banned;
const { refetch } = authClient.useSession();
const handleViewDetails = () => {
  if (onViewDetailsClick) {
    onViewDetailsClick();
    return;
  }
  
};

 
  const handleImpersonate=async ()=>{
     const { error } = await authClient.admin.impersonateUser({
      userId,
      
    });
    if (error) {
      toast.error("Failed to impersonate user: " + error.message);
      return
    }
    refetch();
     router.push("/dashboard");
  }

const handleToggleBan = () => {
  if (onBanClick) {
    onBanClick(); // open dialog in root; dialog will know if it's ban or unban from user.banned
    return;
  }

  console.log(isBanned ? "Unban user" : "Ban user", userId);
};


  if (isMobile) {
    // MOBILE: use drawer
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{name}</DrawerTitle>
            <DrawerDescription>{email}</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleViewDetails}
            >
              View details
            </Button>
             <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleImpersonate}
            >
             Login as User
            </Button>

            

            <Button
              variant={isBanned ? "outline" : "destructive"}
              className="w-full justify-start"
              onClick={handleToggleBan}
            >
              {isBanned ? "Unban user" : "Ban user"}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // DESKTOP: dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4 " />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewDetails}>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImpersonate}>
          Login as user
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleBan}
          className={isBanned ? "" : "text-rose-600"}
        >
          {isBanned ? "Unban user" : "Ban user"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;

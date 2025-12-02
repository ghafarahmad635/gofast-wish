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

type UserActionsProps = {
  userId: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
};

const UserActions: React.FC<UserActionsProps> = ({
  userId,
  name,
  email,
  role,
  banned,
}) => {
  const isMobile = useIsMobile();

  const isSuperAdmin = role === "SUPERADMIN";
  const isBanned = banned;

  const handleViewDetails = () => {
    console.log("View details", userId);
    // later: open drawer/modal, route, etc.
  };

  const handleToggleRole = () => {
    console.log(
      isSuperAdmin ? "Set role USER" : "Set role SUPERADMIN",
      userId,
    );
    // later: call API here
  };

  const handleToggleBan = () => {
    console.log(isBanned ? "Unban user" : "Ban user", userId);
    // later: call API here
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
              onClick={handleViewDetails}
            >
             Login as User
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleToggleRole}
            >
              {isSuperAdmin ? "Set as USER" : "Set as SUPERADMIN"}
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
        <DropdownMenuItem onClick={handleViewDetails}>
          Login as user
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleRole}>
          {isSuperAdmin ? "Set as USER" : "Set as SUPERADMIN"}
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

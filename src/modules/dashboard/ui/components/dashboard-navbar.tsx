"use client";

import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import NavbarUserButton from "./navbar-user-button";
import { usePathname } from "next/navigation"; // NEW

export const DashboardNavbar = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname(); // NEW

  const menuLinks = [
    { label: "Goals", href: "/dashboard/goals" },
    { label: "Habits", href: "/dashboard/habits" },
    { label: "Add Ons", href: "/addons" },
  ];

  const isActive = (href: string) => {
    // marks as active when the current path starts with the link
    return pathname.includes(href);
  };

  return (
    <>
      <nav className="flex px-4 gap-x-2 items-center justify-between py-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <Button className="size-9" variant="outline" onClick={toggleSidebar}>
            {state === "collapsed" || isMobile ? (
              <PanelLeftIcon className="size-4" />
            ) : (
              <PanelLeftCloseIcon className="size-4" />
            )}
          </Button>
          <Link href={`/dashboard`} className="flex items-center gap-2 px-2 pt-2">
            <Image src="/logo.png" height={45} width={45} alt="GoFGast Wish" />
            <p className="text-lg font-semibold hidden">GoFast Wish</p>
          </Link>
        </div>

        <div className="flex items-center  gap-2 md:gap-3 lg:gap-4 xl:gap-5 justify-end">
          {menuLinks.map((menu) => (
            <Link
              key={menu.label}
              href={menu.href}
              aria-current={isActive(menu.href) ? "page" : undefined}
              className={`px-1 pb-0.5 text-sm transition 
                ${
                  isActive(menu.href)
                    ? "text-primary font-semibold underline underline-offset-8"
                    : "text-muted-foreground hover:text-primary"
                }`}
            >
              {menu.label}
            </Link>
          ))}

          <NavbarUserButton />
        </div>
      </nav>
    </>
  );
};

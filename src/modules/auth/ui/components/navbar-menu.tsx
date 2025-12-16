"use client";

import NavbarUserButton from "@/modules/dashboard/ui/components/navbar-user-button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


export const AuthNavbar = () => {
  const pathname = usePathname();

  const menuLinks = [
    { label: "Goals", href: "/dashboard/goals" },
    { label: "Habits", href: "/dashboard/habits" },
    { label: "Add Ons", href: "/addons" },
  ];

  const isActive = (href: string) => {
    // Active if current path starts with the link
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex px-4 items-center justify-between py-3 border-b bg-background">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 pt-2">
        <Image src="/logo.png" height={45} width={45} alt="GoFast Wish" />
        <p className="text-lg font-semibold hidden">GoFast Wish</p>
      </Link>

      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 xl:gap-5 justify-end">
        {menuLinks.map((menu) => (
          <Link
            key={menu.label}
            href={menu.href}
            aria-current={isActive(menu.href) ? "page" : undefined}
            className={`px-1 pb-0.5 text-sm transition ${
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
  );
};

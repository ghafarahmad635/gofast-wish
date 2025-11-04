import { SidebarProvider } from "@/components/ui/sidebar";
import { GOFASTWISH_SIDEBAR_KEY } from "@/modules/dashboard/constant";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dashboard-navbar";
import DashboardSidebar from "@/modules/dashboard/ui/components/dashboard-sidebar";
import { cookies } from "next/headers";

interface Props {
  children: React.ReactNode;
}
const Layout = async ({ children }: Props) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(GOFASTWISH_SIDEBAR_KEY)?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DashboardSidebar />
      <main className="flex flex-col min-h-screen w-full bg-muted overflow-x-hidden">
        <DashboardNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
};


export default Layout
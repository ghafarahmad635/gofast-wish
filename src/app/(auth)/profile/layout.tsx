import { AuthNavbar } from "@/modules/auth/ui/components/navbar-menu";


interface Props {
  children: React.ReactNode;
}

const layout = ({children}:Props) => {
  return (
    <main className="flex flex-col min-h-screen w-full bg-muted overflow-x-hidden">
      <AuthNavbar />
      {children}
    </main>
  )
}

export default layout

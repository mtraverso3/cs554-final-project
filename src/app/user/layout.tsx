import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";

export async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const userName = session.user.name ?? "User";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-row">
        <UserSidebar user={{ name: userName }} />
        <SidebarTrigger />
        <main>{children}</main>
      </div>
    </SidebarProvider>
  );
}

export default Layout;

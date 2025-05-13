import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth/auth";
import { OnboardingPage } from "@/components/onboardingPage";
import { getNewUser } from "@/lib/userForms";

export async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const userObject = session?.user;

  // Ensure the user has been onboarded
  let theUser: string;
  try {
    theUser = await getNewUser(userObject?.sub);

  } catch {
      return <OnboardingPage />;
  }
  const user = JSON.parse(theUser);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-row">
        <UserSidebar user={{ name: `${user.firstName} ${user.lastName}` }} />
        <SidebarTrigger />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

export default Layout;

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth/auth";
import * as users from "@/lib/db/data/users";
import { OnboardingPage } from "@/components/onboardingPage";
import { User } from "@/lib/db/data/schema";

export async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const userObject = session?.user;

  // Ensure the user has been onboarded
  let user: User;
  try {
    user = await users.getUserBySub(userObject?.sub);
  }
   catch {
      let firstName = "";
      if(userObject.given_name) {
        firstName = userObject.given_name;
      }
      let lastName = "";
      if(userObject.family_name) {
        lastName = userObject.family_name;
      }
      return <OnboardingPage data={{firstName: firstName, lastName: lastName}}/>;
    }
  

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

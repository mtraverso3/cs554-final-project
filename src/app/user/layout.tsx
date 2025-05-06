import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth/auth";
import * as users from "@/lib/db/data/users";
import { OnboardingPage } from "@/components/onboardingPage";
import { signup } from "@/lib/quizForms";
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
  } catch {
    if (userObject.given_name && userObject.family_name) {
      user = await signup(userObject.given_name, userObject.family_name);
    } else {
      return <OnboardingPage />;
    }
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

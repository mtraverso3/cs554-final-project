import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/UserSidebar";
import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import * as users from "../../../data/users.js";
import { Signup } from "@/components/signup";
import { signup } from "@/lib/quizForms";

export async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const userObject = session?.user;
  const theUser = await users.getUserBySub(userObject?.sub);
  //console.log(theUser);
  if (!theUser) {
    if (userObject.given_name && userObject.family_name) {
      await signup(userObject.given_name, userObject.family_name);
    } else {
      return <Signup></Signup>;
    }
  }
  const userName = userObject.name ?? "User";
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

import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth/auth";


export default async function Home() {
  const session = await auth0.getSession();
  if (session) {
    redirect("/user/home");
  }
  redirect("/home");
}

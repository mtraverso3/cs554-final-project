import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import * as users from "../../../data/users.js";
import {Signup} from "@/components/signup";
export default async function Page() {
  redirect("/user/home");
}

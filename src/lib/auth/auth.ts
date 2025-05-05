import { User } from "@/lib/db/data/schema";
import * as users from "@/lib/db/data/users";

import { auth0 as auth } from "@/lib/auth/auth-safe";

export const auth0 = auth;

export async function authenticateUser(): Promise<User> {
  const session = await auth0.getSession();
  const userSub = session?.user?.sub;

  if (!userSub) {
    throw new Error("User not signed in");
  }
  return await users.getUserBySub(userSub);
}

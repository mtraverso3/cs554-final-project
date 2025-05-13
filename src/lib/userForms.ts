"use server";

import { auth0, authenticateUser } from "@/lib/auth/auth";
//import * as users from "@/lib/db/data/users";
import { User } from "@/lib/db/data/schema";
import * as userData from "@/lib/db/data/users";

export async function getUserData(): Promise<string> {
  const userObject: User = await authenticateUser();
  return JSON.stringify(userObject);
}

export async function updateProfile(
  first: string,
  last: string,
  profilePicture: string,
) {
  const userObject: User = await authenticateUser();
  await userData.updateUser(
    userObject._id.toString(),
    first,
    last,
    profilePicture,
  );
}
export async function getNewUser(sub: string): Promise<string> {
  const userObject = await userData.getUserBySub(sub);
  return JSON.stringify(userObject);
}

export async function signup(
  first: string,
  last: string,
  profilePicture: string,
): Promise<string> {
  const session = await auth0.getSession();
  const userObject = session?.user;
  if (!userObject || !userObject.email || !userObject.sub) {
    throw new Error("User missing email or sub");
  }
  const user: User = await userData.createUser(
    userObject.email,
    userObject.sub,
    first,
    last,
    profilePicture,
  );
  console.log(
    `User "${user.firstName} ${user.lastName}" created successfully.`,
  );
  return JSON.stringify(user);
}
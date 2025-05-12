"use server";


import { authenticateUser, auth0} from "@/lib/auth/auth";
import {User} from "@/lib/db/data/schema";
import * as userData from "@/lib/db/data/users";


export async function signup(first: string, last: string, profilePicture: File): Promise<User> {
  const session = await auth0.getSession();
  console.log(session);
  const userObject = session?.user;
  
  if (!userObject || !userObject.email || !userObject.sub) {
    throw new Error("User missing email or sub");
  }
  
  const user: User = await userData.createUser(
    userObject.email,
    userObject.sub,
    first,
    last,
    profilePicture
  );
  return user;
}

export async function getUserData(): Promise<string> {
    const userObject: User = await authenticateUser();
    return JSON.stringify(userObject);
}

export async function updateProfile(first: string, last: string, profilePicture: File) {
    const userObject: User = await authenticateUser();
    await userData.updateUser(userObject._id.toString(), first, last, profilePicture);
}

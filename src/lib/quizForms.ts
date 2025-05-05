"use server";

import { authenticateUser, auth0 } from "@/lib/auth/auth";
import * as users from "@/lib/db/data/users";
import * as decks from "@/lib/db/data/decks";
import { User } from "@/lib/db/data/schema";

export async function createFlashcard(front: string, back: string) {
  console.log(front, back);
}

export async function signup(first: string, last: string) {
  const session = await auth0.getSession();

  const userObject = session?.user;

  if (!userObject || !userObject.email || !userObject.sub) {
    throw new Error("User missing email or sub");
  }

  const user: User = await users.createUser(
    userObject.email,
    userObject.sub,
    first,
    last,
  );

  console.log(
    `User "${user.firstName} ${user.lastName}" created successfully.`,
  );
}

export async function addDeck(name: string, description: string) {
  const userObject: User = await authenticateUser();

  await decks.createDeck(name, description, userObject._id.toString());
}

"use server";

import { authenticateUser, auth0 } from "@/lib/auth/auth";
import * as users from "@/lib/db/data/users";
import * as decks from "@/lib/db/data/decks";
import {Deck, Quiz, User} from "@/lib/db/data/schema";
import * as quizzes from "@/lib/db/data/quizzes";

export async function createFlashcard(front: string, back: string) {
  console.log(front, back);
}

export async function signup(first: string, last: string): Promise<User> {
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

  return user;
}

export async function addDeck(name: string, description: string) {
  const userObject: User = await authenticateUser();

  await decks.createDeck(name, description, userObject._id.toString());
}
export async function addQuiz(name: string, description: string) {
  const userObject: User = await authenticateUser();

  await quizzes.createQuiz(name, description, userObject._id.toString());
}

export async function getQuizzes(): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();

  const quizList: Quiz[] = await quizzes.getQuizzesByUserId(userId);
  return JSON.stringify(quizList);

}

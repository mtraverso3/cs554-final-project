"use server";

import { authenticateUser, auth0 } from "@/lib/auth/auth";
import * as users from "@/lib/db/data/users";
import * as decks from "@/lib/db/data/decks";
import {Quiz, User, QuizEntry, Deck} from "@/lib/db/data/schema";
import * as quizzes from "@/lib/db/data/quizzes";
import { getDeckById } from "@/lib/db/data/decks";
import { deckToQuiz } from "@/lib/ollama/ollama";

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

export async function addDeck(
  name: string,
  description: string,
  category: string,
) {
  const userObject: User = await authenticateUser();

  await decks.createDeck(
    name,
    description,
    category,
    userObject._id.toString(),
  );
}

export async function addQuiz(name: string, description: string, category: string, questionsList: QuizEntry[] = []) {
  const userObject: User = await authenticateUser();

  await quizzes.createQuiz(
    name,
    description,
    category,
    userObject._id.toString(),
    questionsList,
  );
}

export async function getQuizzes(): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();

  const quizList: Quiz[] = await quizzes.getQuizzesByUserId(userId);
  return JSON.stringify(quizList);
}
export async function updateQuiz(
    quizId: string,
    name: string,
    description: string,
    questions: QuizEntry[]
): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();
  return quizzes.updateQuiz(quizId, userId, name, description, questions);
}

//Not sure if quizId is better as a string or an ObjectId
export async function addQuizAttempt(quizId: string, score: number) {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();
  await quizzes.addQuizAttempt(quizId, userId, score);
}

export async function convertDeckToQuiz(deckId: string) {
  const user: User = await authenticateUser();

  if (!deckId) {
    throw new Error("Missing deckId");
  }

  const deck: Deck = await getDeckById(deckId);
  if (!deck.ownerId.equals(user._id)) {
    throw new Error("Not authorized");
  }

  return await deckToQuiz(deck);
}

export async function deleteQuiz(quizId: string): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();
  return quizzes.deleteQuiz(quizId, userId);
}
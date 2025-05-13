"use server";

import { auth0, authenticateUser } from "@/lib/auth/auth";
import * as users from "@/lib/db/data/users";
import * as decks from "@/lib/db/data/decks";
import { getDeckById } from "@/lib/db/data/decks";
import { Deck, Quiz, QuizEntry, User } from "@/lib/db/data/schema";
import * as quizzes from "@/lib/db/data/quizzes";
import { getQuizById } from "@/lib/db/data/quizzes";
import { deckToQuiz } from "@/lib/ollama/ollama";

export async function createFlashcard(front: string, back: string) {
  console.log(front, back);
}

export async function signup(first: string, last: string, profilePicture: string): Promise<User> {
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
    profilePicture
  );

  console.log(
    `User "${user.firstName} ${user.lastName}" created successfully.`,
  );

  return user;
}

export async function getQuiz(id: string): Promise<Quiz> {
  const userObject: User = await authenticateUser();

  const quiz: Quiz = await getQuizById(id);

  if (!quiz.ownerId.equals(userObject._id) && !quiz.published) {
    throw new Error("Not Authorized");
  }

  return quiz;
}

export async function getPublicQuizzes(): Promise<Quiz[]> {
  await authenticateUser();

  return quizzes.getPublicQuizzes();
}

export async function addDeck(
  name: string,
  description: string,
  category: string,
  published: boolean,
) {
  const userObject: User = await authenticateUser();

  await decks.createDeck(
    name,
    description,
    category,
    published,
    userObject._id.toString(),
  );
}

export async function addQuiz(
  name: string,
  description: string,
  category: string,
  published: boolean,
  questionsList: QuizEntry[] = [],
) {
  const userObject: User = await authenticateUser();

  await quizzes.createQuiz(
    name,
    description,
    category,
    userObject._id.toString(),
    published,
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
  questions: QuizEntry[],
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
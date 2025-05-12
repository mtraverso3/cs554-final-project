"use server";

import { authenticateUser } from "@/lib/auth/auth";
import * as decks from "@/lib/db/data/decks";
import { Quiz, User, QuizEntry, Deck } from "@/lib/db/data/schema";
import * as quizzes from "@/lib/db/data/quizzes";
import { getDeckById } from "@/lib/db/data/decks";
import { deckToQuiz } from "@/lib/ollama/ollama";

export async function createFlashcard(front: string, back: string) {
  console.log(front, back);
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
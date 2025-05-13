"use server";

import { authenticateUser } from "@/lib/auth/auth";
import * as decks from "@/lib/db/data/decks";
import { Deck, User } from "@/lib/db/data/schema";
import { getDeckById } from "@/lib/db/data/decks";

export async function getDecks(): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();

  const decksList: Deck[] = await decks.getDecksByUserId(userId);
  return JSON.stringify(decksList);
}

export async function updateDeck(
  deckId: string,
  name: string,
  description: string,
  flashcards: { front: string; back: string }[],
): Promise<string> {
  const userObject: User = await authenticateUser();

  const userId = userObject._id.toString();
  return await decks.updateDeck(userId, deckId, name, description, flashcards);
}

export async function deleteDeck(deckId: string): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();
  return await decks.deleteDeck(userId, deckId);
}

export type StudyProgressData = {
  currentCardIndex: number;
  knownCardIds: string[];
  unknownCardIds: string[];
  lastPosition: number;
  studyTime: number;
  isReviewMode?: boolean;
  isCompleted?: boolean;
  reviewingCardIds?: string[];
  reviewRound?: number;
  allReviewedCards?: Record<string, boolean>;
};

export async function saveStudyProgress(
  deckId: string,
  progress: StudyProgressData,
  isComplete: boolean = false,
): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();
  return decks.saveStudyProgress(deckId, userId, progress, isComplete);
}

export async function toggleLike(deckId: string) {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();

  await decks.toggleLike(deckId, userId);
}
export async function getPublicDecks(): Promise<Deck[]> {
  await authenticateUser();

  return decks.getPublicDecks();
}

export async function addDeckComment(
  deckId: string,
  text: string,
): Promise<string> {
  const userObject: User = await authenticateUser();

  const comment = await addComment(deckId, userObject._id.toString(), text);

  return JSON.stringify(comment);
}

export async function getDeck(id: string): Promise<Deck> {
  const userObject: User = await authenticateUser();

  const deck: Deck = await getDeckById(id);

  if (!deck.ownerId.equals(userObject._id) && !deck.published) {
    throw new Error("Not Authorized");
  }

  return deck;
}
"use server";

import { authenticateUser } from "@/lib/auth/auth";
import * as decks from "@/lib/db/data/decks";
import { Deck, User } from "@/lib/db/data/schema";

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
  flashcards: { front: string; back: string }[]
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
  isComplete: boolean = false
): Promise<string> {
  const  userObject: User = await authenticateUser();
  const userId = userObject._id.toString();
  return decks.saveStudyProgress(deckId, userId, progress, isComplete);
}
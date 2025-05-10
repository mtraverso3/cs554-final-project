"use server";

import { authenticateUser } from "@/lib/auth/auth";
import * as decksDB from "@/lib/db/data/decks";
import { Deck, User, Flashcard } from "@/lib/db/data/schema";
import { ObjectId } from "mongodb";
import { decks } from "@/lib/db/config/mongoCollections";

export async function getDecks(): Promise<string> {
  const userObject: User = await authenticateUser();
  const userId = userObject._id.toString();

  const decksList: Deck[] = await decksDB.getDecksByUserId(userId);
  return JSON.stringify(decksList);
}

export async function updateDeck(
  deckId: string,
  name: string,
  description: string,
  flashcards: { front: string; back: string }[]
): Promise<string> {
  try {
    const userObject: User = await authenticateUser();
    
    const deck: Deck = await decksDB.getDeckById(deckId);
    if (!deck.ownerId.equals(userObject._id)) {
      throw new Error("Not authorized to update this deck");
    }
    
    const flashcardList: Flashcard[] = flashcards.map(card => ({
      _id: new ObjectId(),
      deckId: new ObjectId(deckId),
      front: card.front,
      back: card.back
    }));
    
    const deckCollection = await decks();
    await deckCollection.updateOne(
      { _id: new ObjectId(deckId) },
      { 
        $set: { 
          name,
          description,
          flashcardList
        } 
      }
    );
    
    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error updating deck:", error);
    return JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}

export async function deleteDeck(deckId: string): Promise<string> {
  try {
    const userObject: User = await authenticateUser();
    
    const deck: Deck = await decksDB.getDeckById(deckId);
    if (!deck.ownerId.equals(userObject._id)) {
      throw new Error("Not authorized to delete this deck");
    }
  
    const deckCollection = await decks();
    const deleteResult = await deckCollection.deleteOne({ _id: new ObjectId(deckId) });
    
    if (deleteResult.deletedCount === 0) {
      throw new Error("Deck could not be deleted");
    }
    
    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error deleting deck:", error);
    return JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
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
  try {
    const userObject: User = await authenticateUser();
    
    const deck: Deck = await decksDB.getDeckById(deckId);
    if (!deck.ownerId.equals(userObject._id)) {
      throw new Error("Not authorized to update this deck");
    }
    
    const deckCollection = await decks();
    
    if (isComplete) {
      await deckCollection.updateOne(
        { _id: new ObjectId(deckId) },
        { 
          $set: { 
            lastStudied: new Date(),
            studyProgress: {
              currentCardIndex: 0,
              knownCardIds: [],
              unknownCardIds: [],
              lastPosition: 0,
              studyTime: 0,
              isReviewMode: false,
              isCompleted: false,
              reviewingCardIds: []
            }
          } 
        }
      );
    } else {
      await deckCollection.updateOne(
        { _id: new ObjectId(deckId) },
        { 
          $set: { 
            lastStudied: new Date(),
            studyProgress: progress
          } 
        }
      );
    }
    
    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error saving study progress:", error);
    return JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}
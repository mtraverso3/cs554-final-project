"use server";

import { getDeckById } from "@/lib/db/data/decks";
import { authenticateUser } from "@/lib/auth/auth";
import { Deck, User } from "@/lib/db/data/schema";
import { unauthorized } from "next/navigation";
import StudyView from "./StudyView";

type FlashcardDTO = {
  _id: string;
  deckId: string;
  front: string;
  back: string;
};

type StudyProgressDTO = {
  currentCardIndex: number;
  knownCardIds: string[];
  unknownCardIds: string[];
  lastPosition: number;
  studyTime: number;
  isReviewMode: boolean;
  isCompleted: boolean;
  reviewingCardIds: string[];
};

type DeckDTO = {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lastStudied: string;
  flashcardList: FlashcardDTO[];
  studyProgress?: StudyProgressDTO;
};

function serializeDeck(deck: Deck): DeckDTO {
  const serialized: DeckDTO = {
    _id: deck._id.toString(),
    ownerId: deck.ownerId.toString(),
    name: deck.name,
    description: deck.description,
    category: deck.category,
    createdAt: deck.createdAt ? deck.createdAt.toISOString() : new Date().toISOString(),
    lastStudied: deck.lastStudied ? deck.lastStudied.toISOString() : new Date().toISOString(),
    flashcardList: deck.flashcardList.map((fc) => ({
      _id: fc._id.toString(),
      deckId: fc.deckId.toString(),
      front: fc.front,
      back: fc.back,
    }))
  };

  if (deck.studyProgress) {
    serialized.studyProgress = {
      currentCardIndex: deck.studyProgress.currentCardIndex,
      knownCardIds: deck.studyProgress.knownCardIds.filter(id => id !== undefined) as string[],
      unknownCardIds: deck.studyProgress.unknownCardIds.filter(id => id !== undefined) as string[],
      lastPosition: deck.studyProgress.lastPosition,
      studyTime: deck.studyProgress.studyTime,
      isReviewMode: deck.studyProgress.isReviewMode || false,
      isCompleted: deck.studyProgress.isCompleted || false,
      reviewingCardIds: deck.studyProgress.reviewingCardIds || []
    };
  }

  return serialized;
}

async function getDeck(id: string): Promise<Deck> {
  const userObject: User = await authenticateUser();

  const deck: Deck = await getDeckById(id);

  if (!deck.ownerId.equals(userObject._id)) {
    throw new Error("Not Authorized");
  }

  return deck;
}

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  try {
    const deck: Deck = await getDeck(deckId);

    return <StudyView deck={serializeDeck(deck)} />;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Not Authorized") {
        unauthorized();
      } else {
        console.error(error);
        return (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-4">{error.message}</p>
          </div>
        );
      }
    }
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-4">An unexpected error occurred</p>
      </div>
    );
  }
}
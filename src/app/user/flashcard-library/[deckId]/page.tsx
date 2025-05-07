"use server";

import { getDeckById } from "@/lib/db/data/decks";
import { authenticateUser } from "@/lib/auth/auth";
import { Deck, User } from "@/lib/db/data/schema";
import FlashcardView from "./FlashcardView";

function serializeDeck(deck: Deck) {
  return {
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
    })),
  };
}

async function getDeck(id: string): Promise<Deck> {
  "use server";
  const userObject: User = await authenticateUser();

  const deck: Deck = await getDeckById(id);

  if (!deck.ownerId.equals(userObject._id)) {
    throw new Error("Not Authorized");
  }

  return deck;
}

export default async function ViewDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  try {
    const deck: Deck = await getDeck(deckId);

    return <FlashcardView deck={serializeDeck(deck)} />;
  } catch (error) {
    if (error instanceof Error) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-4">{error.message}</p>
        </div>
      );
    }
  }
}
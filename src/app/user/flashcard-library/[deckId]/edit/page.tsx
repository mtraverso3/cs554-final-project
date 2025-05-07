"use server";
import { getDeckById } from "@/lib/db/data/decks";
import { authenticateUser } from "@/lib/auth/auth";
import { Deck, User } from "@/lib/db/data/schema";
import { unauthorized } from "next/navigation";
import EditDeckForm from "./EditDeckForm";

function serializeDeck(deck: Deck) { //ugh we can't sent complex objects to the client, so we have to serialize them
  return {
    _id:      deck._id.toString(),
    ownerId:  deck.ownerId.toString(),
    name:     deck.name,
    description: deck.description,
    category: deck.category,
    createdAt:  deck.createdAt ? deck.createdAt.toISOString() : new Date().toISOString(), // changed this line or else error for editing deck cards
    lastStudied: deck.lastStudied ? deck.lastStudied.toISOString() : new Date().toISOString(), // and this
    flashcardList: deck.flashcardList.map((fc) => ({
      _id:    fc._id.toString(),
      deckId: fc.deckId.toString(),
      front:  fc.front,
      back:   fc.back,
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

export default async function EditPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  try {
    const deck: Deck = await getDeck(deckId);

    return (
      <EditDeckForm deck={serializeDeck(deck)} />

    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Not Authorized") {
        unauthorized();
      } else {
        console.error(error);
      }
    }
  }
}
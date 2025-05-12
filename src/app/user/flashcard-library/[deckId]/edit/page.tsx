"use server";
import { getDeckById } from "@/lib/db/data/decks";
import { authenticateUser } from "@/lib/auth/auth";
import { Deck, User } from "@/lib/db/data/schema";
import { unauthorized } from "next/navigation";
import EditDeckForm from "./EditDeckForm";

function serializeDeck(deck: Deck): string {
  return (JSON.stringify({
    _id: deck._id.toString(),
    category: deck.category,
    comments: deck.comments.map((c) => ({
      createdAt: c.createdAt.toISOString(),
      ownerId: c.ownerId.toString(),
      text: c.text,
    })),
    createdAt: deck.createdAt.toISOString(),
    description: deck.description,
    flashcardList: deck.flashcardList.map((f) => ({
      _id: f._id.toString(),
      deckId: f.deckId.toString(),
      front: f.front,
      back: f.back,
    })),
    lastStudied: deck.lastStudied.toISOString(),
    likes: deck.likes.map((l) => l.toString()),
    name: deck.name,
    ownerId: deck.ownerId.toString(),
    studyProgress: {
      currentCardIndex: deck.studyProgress.currentCardIndex,
      isCompleted: deck.studyProgress.isCompleted,
      isReviewMode: deck.studyProgress.isReviewMode,
      knownCardIds: deck.studyProgress.knownCardIds,
      lastPosition: deck.studyProgress.lastPosition,
      reviewingCardIds: deck.studyProgress.reviewingCardIds,
      studyTime: deck.studyProgress.studyTime,
      unknownCardIds: deck.studyProgress.unknownCardIds,
    },
  }));
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
"use server";

import { authenticateUser } from "@/lib/auth/auth";
import { Deck } from "@/lib/db/data/schema";
import FlashcardView from "./FlashcardView";
import { getDeck } from "@/lib/deckForms";
import CommentSection from "./CommentSection";
import { Separator } from "@/components/ui/separator";
import {getDeckById} from "@/lib/db/data/decks";



function serializeDeck(deck: Deck) {
  return {
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
    published: deck.published,
  };
}

export default async function ViewDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  try {
    const deck: Deck = await getDeck(deckId);

    const userObject = await authenticateUser();
    const isOwner = userObject._id.toString() === deck.ownerId.toString();
    const serializedDeck = serializeDeck(deck);

    return (
      <div className="container mx-auto px-4 pb-12">
        <FlashcardView deck={serializedDeck} isOwner={isOwner} />
        
        <Separator className="my-8" />
        
        <CommentSection
          deck={serializedDeck}
          currentUserId={userObject._id.toString()}
        />
      </div>
    );
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
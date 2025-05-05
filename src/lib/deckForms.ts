
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
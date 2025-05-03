"use server";
import { auth0 } from "@/lib/auth0";
import * as users from "../../data/users.js";
import { redirect } from "next/navigation";
import * as decks from "../../data/decks.js";
import * as flashcards from "../../data/flashcards.js";

export async function createFlashcard(front: string, back: string) {
  console.log(front, back);
}

export async function signup(first: any, last: any) {
  const session = await auth0.getSession();
  const userObject = session?.user;
  if (!session) {
    console.log("Session does not exist (user is not logged in)");
    return;
  }
  const theUser = await users.createUser(
    userObject?.email,
    userObject?.sub,
    first,
    last,
  );
  if (!theUser) {
    console.log("User could not be created.");
    return;
  }
  console.log("User created successfully.");
  redirect("/user/home");
}

export async function addDeck(deck: any, cards: any) {
  const session = await auth0.getSession();
  const userObject = await users.getUserBySub(session?.user.sub);
  const theDeck = await decks.createDeck(
    deck.name,
    deck.id,
    deck.description,
    userObject._id,
  );
  console.log(theDeck);
  const deckId = theDeck._id;
  for (let a = 0; a < cards.length; a++) {
    const card = cards[a];
    await flashcards.addFlashcard(card.front, card.back, deckId);
  }
  redirect("/user/flashcard-library");
}

'use server'
import { auth0 } from "@/lib/auth0";
import * as users from "../../data/users.js";
import { redirect } from "next/navigation";
import * as decks from "../../data/decks.js";
import * as flashcards from "../../data/flashcards.js";
import { userInfo } from "os";

export async function createFlashcard(front: string, back: string) {
    console.log(front, back);
}

export async function signup(first: any, last: any) {
    const session = await auth0.getSession();
    let userObject = session?.user;
    if(!session) {
        console.log("Session does not exist (user is not logged in)");
        return;
    }
    let theUser = await users.createUser(userObject?.email, userObject?.sub, first, last);
    if(!theUser) {
        console.log("User could not be created.")
        return;
    }
    console.log("User created successfully.");
    redirect("/user/home");
}

export async function addDeck(deck: any, cards: any) {
    const session = await auth0.getSession();
    let userObject = await users.getUserBySub(session?.user.sub);
    let theDeck = await decks.createDeck(deck.name, deck.id, deck.description, userObject._id);
    console.log(theDeck);
    let deckId = theDeck._id;
    for(let a = 0; a < cards.length; a++) {
        let card = cards[a];
        await flashcards.addFlashcard(card.front, card.back, deckId);
    }
    redirect("/user/flashcard-library");
}
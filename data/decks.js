import * as helpers from "./helpers.js";
import {flashcards} from '../config/mongoCollections.js';
import {decks} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import * as users from "./users.js"

export async function createDeck(name, id, description, userId) {
    let theName = await helpers.checkString(name);
    let theId = await helpers.checkString(id);
    let theDesc = await helpers.checkString(description);
    let theUser = await users.getUserById(userId);
    if(!theName || !theId || !theDesc || !theUser) {
        return null;
    }
    let newDeck = {};
    newDeck._id = new ObjectId();
    newDeck.name = theName;
    newDeck.stringId = theId;
    newDeck.description = theDesc;
    newDeck.user = theUser._id;
    newDeck.flashcards = [];
    const theDecks = await decks();
    const insertInfo = await theDecks.insertOne(newDeck);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        return null;
    }
    const finalId = insertInfo.insertedId.toString();
    const finalDeck = await getDeckById(finalId);
    return finalDeck;
}
export async function getDeckById (id) {
    id = helpers.checkId(id);
    if(!id) {
      return null;
    }
    const allDecks = await decks();
    let theDecks = await allDecks.find({}).toArray();
    for(let a = 0; a < theDecks.length; a++) {
      let deck = theDecks[a];
      if(deck["_id"].toString() === id) {
        return deck;
      }
    }
    return null;
};
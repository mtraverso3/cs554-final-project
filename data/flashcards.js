import * as helpers from "./helpers.js";
import {flashcards} from '../config/mongoCollections.js';
import {decks} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import * as deckData from "./decks.js";
export async function addFlashcard(front, back, deckId) {
    let theDeck = await deckData.getDeckById(deckId);
    let theDecks = await decks();
    if(!theDeck) {
        return null;
    }
    let theFront = helpers.checkString(front);
    let theBack = helpers.checkString(back);
    if(!theFront || !theBack) {
        return null;
    }
    let theCard = {};
    theCard["_id"] = new ObjectId();
    theCard["front"] = theFront;
    theCard["back"] = back;
    theCard["deckId"] = theDeck._id;
    const theCards = await flashcards();
    const insertInfo = await theCards.insertOne(theCard);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      return null;
    }
    const theId = insertInfo.insertedId.toString();
    const finalCard = await getCardById(theId);
    theDeck["flashcards"].push(finalCard._id);
    const theDeckInfo = await theDecks.findOneAndUpdate(
        {_id: theDeck._id},
        {$set: theDeck},
        {returnDocument: 'after'}
    );
    return finalCard;
  }
export async function getCardById (id) {
    id = helpers.checkId(id);
    if(!id) {
      return null;
    }
    const allCards = await flashcards();
    let theCards = await allCards.find({}).toArray();
    for(let a = 0; a < theCards.length; a++) {
      let card = theCards[a];
      if(card["_id"].toString() === id) {
        return card;
      }
    }
    return null;
  };
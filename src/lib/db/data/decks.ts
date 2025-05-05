import { decks } from "../config/mongoCollections";
import { Collection, ObjectId } from "mongodb";
import { getUserById } from "./users";
import { Deck, DeckSchema } from "./schema";

export async function createDeck(
  name: string,
  description: string,
  userId: string,
): Promise<Deck> {
  let user;
  try {
    user = await getUserById(userId);
  } catch {
    throw new Error("User not found");
  }


  let newDeck: Deck = {
    _id: new ObjectId(),
    name: name,
    description: description,
    ownerId: user._id,
    flashcardList: [],
  };

  newDeck = await DeckSchema.validate(newDeck);

  const deckCollection: Collection<Deck> = await decks();
  const insertInfo = await deckCollection.insertOne(newDeck);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Error inserting new deck");
  }
  return newDeck;
}

export async function getDeckById(id: string): Promise<Deck> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId");
  }

  const deckCollection = await decks();
  let deck;
  try {
    deck = await deckCollection.findOne({
      _id: new ObjectId(id),
    });
  } catch {
    throw new Error("Failed to get deck");
  }
  if (!deck) {
    throw new Error("Deck not found");
  }
  return deck;
}

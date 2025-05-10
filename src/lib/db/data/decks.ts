import { decks } from "../config/mongoCollections";
import { Collection, ObjectId } from "mongodb";
import { getUserById } from "./users";
import { Deck, DeckSchema, StudyProgress } from "./schema";

export async function createDeck(
  name: string,
  description: string,
  category: string,
  userId: string,

): Promise<Deck> {
  await getUserById(userId);


  let newDeck: Deck = {
    _id: new ObjectId(),
    name: name,
    description: description,
    ownerId: new ObjectId(userId),
    flashcardList: [],
    createdAt: new Date(),
    lastStudied: new Date(),
    category: category,
    studyProgress: {} as StudyProgress,
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

export async function getDecksByUserId(
  userId: string,
): Promise<Deck[]> {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const deckCollection = await decks();
  let decksList;
  try {
    decksList = await deckCollection
      .find({ ownerId: new ObjectId(userId) })
      .toArray();
  } catch {
    throw new Error("Failed to get decks");
  }
  if (!decksList) {
    throw new Error("Decks not found");
  }
  return decksList;
}

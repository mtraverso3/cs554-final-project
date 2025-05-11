import { decks } from "../config/mongoCollections";
import { Collection, ObjectId } from "mongodb";
import { getUserById } from "./users";
import { CommentSchema, Comment, Deck, DeckSchema, StudyProgress } from "./schema";

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
    likes: [],
    comments: [],
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


export async function toggleLike(
  deckId: string,
  userId: string,
): Promise<Deck> {
  if (!ObjectId.isValid(deckId) || !ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const deckCollection = await decks();
  const deck: Deck = await getDeckById(deckId);

  if (deck.likes.includes(new ObjectId(userId))) {
    await deckCollection.updateOne(
      { _id: new ObjectId(deckId) },
      { $pull: { likes: userId } },
    );
  } else {
    await deckCollection.updateOne(
      { _id: new ObjectId(deckId) },
      { $addToSet: { likes: userId } },
    );
  }

  return getDeckById(deckId);
}

export async function addComment(
  deckId: string,
  userId: string,
  text: string,
): Promise<Deck> {
  if (!ObjectId.isValid(deckId) || !ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const deckCollection = await decks();

  let newComment: Comment = {
    ownerId: new ObjectId(userId),
    text,
    createdAt: new Date(),
  };

  newComment = await CommentSchema.validate(newComment);

  await deckCollection.updateOne(
    { _id: new ObjectId(deckId) },
    { $push: { comments: newComment } },
  );

  return getDeckById(deckId);
}

export async function getLikedDecksByUser(
  userId: string,
): Promise<Deck[]> {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const deckCollection = await decks();
  let decksList;
  try {
    decksList = await deckCollection
      .find({ likes: { $in: [new ObjectId(userId)] } })
      .toArray();
  } catch {
    throw new Error("Failed to get liked decks");
  }
  if (!decksList) {
    throw new Error("Liked decks not found");
  }
  return decksList;
}
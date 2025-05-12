import { decks } from "../config/mongoCollections";
import { Collection, ObjectId } from "mongodb";
import { getUserById } from "./users";
import { CommentSchema, Comment, Deck, DeckSchema, StudyProgress, Flashcard, StudyProgressSchema } from "./schema";
import {StudyProgressData} from "@/lib/deckForms";
import { redisClient } from "@/lib/db/config/redisConnection";
import { serializeDeck, deserializeDeck } from "@/lib/db/data/serialize";


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
  try {
    const deckCollection: Collection<Deck> = await decks();
    const insertInfo = await deckCollection.insertOne(newDeck);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw new Error("Error inserting new deck");
    }
    return newDeck;
  } finally {
      const client = await redisClient();
      await client.del(`decks:user:${userId}`);
  }
}


export async function updateDeck(
    userId: string,
    deckId: string,
    name: string,
    description: string,
    flashcards: { front: string; back: string }[]
): Promise<string> {
  try {

    const deck: Deck = await getDeckById(deckId);
    if (!deck.ownerId.equals(new ObjectId(userId))) {
      throw new Error("Not authorized to update this deck");
    }

    const flashcardList: Flashcard[] = flashcards.map(card => ({
      _id: new ObjectId(),
      deckId: new ObjectId(deckId),
      front: card.front,
      back: card.back
    }));

    const deckCollection = await decks();
    await deckCollection.updateOne(
        { _id: new ObjectId(deckId) },
        {
          $set: {
            name,
            description,
            flashcardList
          }
        }
    );

    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error updating deck:", error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    const client = await redisClient();
    await client.del(`deck:${deckId}`);
    await client.del(`decks:user:${userId}`);
  }
}

export async function deleteDeck(deckId: string, userId: string): Promise<string> {
  try {
    const deck: Deck = await getDeckById(deckId);
    if (!deck.ownerId.equals(new ObjectId(userId))) {
      throw new Error("Not authorized to delete this deck");
    }

    const deckCollection = await decks();
    const deleteResult = await deckCollection.deleteOne({ _id: new ObjectId(deckId) });

    if (deleteResult.deletedCount === 0) {
      throw new Error("Deck could not be deleted");
    }

    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error deleting deck:", error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    const client = await redisClient();
    await client.del(`deck:${deckId}`);
    await client.del(`decks:user:${userId}`);
  }
}

export async function saveStudyProgress(
    deckId: string,
    userId:string,
    progress: StudyProgressData,
    isComplete: boolean = false
): Promise<string> {
  try {
    const deck: Deck = await getDeckById(deckId);
    if (!deck.ownerId.equals(new ObjectId(userId))) {
      throw new Error("Not authorized to update this deck");
    }

    await StudyProgressSchema.validate(progress);

    const deckCollection = await decks();

    if (isComplete) {
      await deckCollection.updateOne(
          { _id: new ObjectId(deckId) },
          {
            $set: {
              lastStudied: new Date(),
              studyProgress: {
                currentCardIndex: 0,
                knownCardIds: [],
                unknownCardIds: [],
                lastPosition: 0,
                studyTime: 0,
                isReviewMode: false,
                isCompleted: false,
                reviewingCardIds: []
              }
            }
          }
      );
    } else {
      await deckCollection.updateOne(
          { _id: new ObjectId(deckId) },
          {
            $set: {
              lastStudied: new Date(),
              studyProgress: progress
            }
          }
      );
    }

    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error saving study progress:", error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  } finally {
    const client = await redisClient();
    await client.del( `deck:${deckId}`);
    await client.del(`decks:user:${userId}`);
  }
}
export async function getDeckById(id: string): Promise<Deck> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId");
  }

  const client = await redisClient();

  const cacheKey = `deck:${id}`;
  const cachedDeck = await client.get(cacheKey);
  if (cachedDeck) {
    return deserializeDeck(cachedDeck);
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

  await client.set(cacheKey, serializeDeck(deck), { EX: 3600 });
  return deck;
}

export async function getDecksByUserId(
  userId: string,
): Promise<Deck[]> {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const client = await redisClient();
  const cacheKey = `decks:user:${userId}`;
  const cached = await client.get(cacheKey);
  if (cached) {
    const serializedArray: string[] = JSON.parse(cached);
    return serializedArray.map(s => deserializeDeck(s));
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
  // Cache the fresh list in Redis (expires in 3600s)
  const serializedList = decksList.map(serializeDeck);
  await client.set(cacheKey, JSON.stringify(serializedList), { EX: 3600 });
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

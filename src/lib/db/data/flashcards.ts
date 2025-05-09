import { decks} from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import { getDeckById } from "./decks";
import { Deck, Flashcard, FlashcardSchema } from "./schema";

export async function addFlashcard(
  front: string,
  back: string,
  deckId: string,
): Promise<Flashcard> {
  let deck: Deck;
  try {
    deck = await getDeckById(deckId);
  } catch {
    throw new Error("Issue retrieving deck");
  }

  if (!deck) {
    throw new Error("Deck not found");
  }

  let newCard: Flashcard = {
    _id: new ObjectId(),
    front,
    back,
    deckId: deck._id,
  };
  newCard = await FlashcardSchema.validate(newCard);

  const deckCollection = await decks();

  await deckCollection.findOneAndUpdate(
    { _id: deck._id },
    { $push: { flashcardList: newCard } },
    { returnDocument: "after" },
  );
  return newCard;
}

// export async function getCardById(id: string): Promise<Flashcard> {
//   if (!ObjectId.isValid(id)) {
//     throw new Error("Invalid id for flashcard");
//   }
//   const deckCollection = await decks();
//   let card;
//   try {
//     card = await deckCollection.findOne({ _id: new ObjectId(id) });
//   } catch {
//     throw new Error("Failed to get flashcard");
//   }
//   if (!card) throw new Error("Flashcard not found");
//   return card;
// }

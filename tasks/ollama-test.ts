import { deckToQuiz } from '@/lib/ollama/ollama'
import {Deck, QuizEntry, StudyProgress} from "@/lib/db/data/schema";
import { ObjectId } from "mongodb";

async function main() {
  // sample flashcard deck
  const deck: Deck = {
    _id: new ObjectId(),
    name: "Sample Deck",
    description: "This is a sample deck",
    ownerId: new ObjectId(),
    flashcardList: [
      {
        _id: new ObjectId(),
        deckId: new ObjectId(),
        front: "What is the capital of France?",
        back: "Paris",
      },
      {
        _id: new ObjectId(),
        deckId: new ObjectId(),
        front: "What is 2 + 2?",
        back: "4",
      },
      {
        _id: new ObjectId(),
        deckId: new ObjectId(),
        front: "What is the somatic nervous system",
        back: "A part of the peripheral nervous system associated with the voluntary control of body movements.",
      }
    ],
    createdAt: new Date(),
    lastStudied: new Date(),
    category: "Sample Category",
    studyProgress: {} as StudyProgress,
    likes: [],
    comments: [],
  };

  try {
    const quiz: QuizEntry[] = await deckToQuiz(deck)
    console.log('Generated quiz:')
    console.log(JSON.stringify(quiz, null, 2))
  } catch (err) {
    console.error('Error generating quiz:', err)
  }
}

main()

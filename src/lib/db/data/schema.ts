import * as Yup from "yup";
import { ObjectId } from "mongodb";
import { InferType } from "yup";
import * as yup from "yup";

export const DeckInputSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),
  ownerId: Yup.mixed<ObjectId>().required("User is required"),
  flashcardList: Yup.array()
    .of(Yup.mixed<ObjectId>().required())
    .required("Flashcards must be an array"),
});

export const DeckSchema = yup.object({
  _id: yup.mixed<ObjectId>().required(),
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),
  ownerId: Yup.mixed<ObjectId>().required("User is required"),
  flashcardList: Yup.array()
    .of(Yup.mixed<ObjectId>().required())
    .required("Flashcards must be an array"),
});
export type DeckInput = Yup.InferType<typeof DeckInputSchema>;
export type Deck = Yup.InferType<typeof DeckSchema>;

export const FlashcardInputSchema = Yup.object({
  front: Yup.string()
    .trim()
    .required("Front text is required")
    .min(1, "Must be non-empty"),
  back: Yup.string()
    .trim()
    .required("Back text is required")
    .min(1, "Must be non-empty"),
  deckId: Yup.mixed<ObjectId>().required("deckId is required"),
});
export const FlashcardSchema = yup.object({
  _id: yup.mixed<ObjectId>().required(),
  front: Yup.string()
    .trim()
    .required("Front text is required")
    .min(1, "Must be non-empty"),
  back: Yup.string()
    .trim()
    .required("Back text is required")
    .min(1, "Must be non-empty"),
  deckId: Yup.mixed<ObjectId>().required("deckId is required"),
});
export type FlashcardInput = Yup.InferType<typeof FlashcardInputSchema>;
export type Flashcard = InferType<typeof FlashcardSchema>;

export const UserInputSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(1, "Must be non-empty"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(1, "Must be non-empty"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  sub: yup.string().trim().required("Sub is required"), //authSafe internal Id
});
export const UserSchema = yup.object({
  _id: yup.mixed<ObjectId>().required(),
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(1, "Must be non-empty"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(1, "Must be non-empty"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  sub: yup.string().trim().required("Sub is required"), //authSafe internal Id
});
export type UserInput = Yup.InferType<typeof UserInputSchema>;
export type User = InferType<typeof UserSchema>;

export const QuizEntrySchema = Yup.object({

  question: Yup.string()
    .trim()
    .required("Question is required")
    .min(1, "Must be a non-empty string"),
  answers: Yup.array()
    .of(
      Yup.object({
        answer: Yup.string()
          .trim()
          .required("Answer is required")
          .min(1, "Must be a non-empty string"),
        isCorrect: Yup.boolean().required("isCorrect is required"),
      }),
    )
    .required("Answers are required")
    .min(1, "Must have at least one answer")
    .test("correctAnswer", "Must have one correct answer", (answers) => {
      const correctAnswers = answers.filter((answer) => answer.isCorrect);
      return correctAnswers.length > 0;
    }),
});
export type QuizEntry = Yup.InferType<typeof QuizEntrySchema>;

export const QuizInputSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),
  ownerId: Yup.mixed<ObjectId>().required("User is required"),
  questionsList: Yup.array()
    .of(QuizEntrySchema)
    .required("Questions are required")
    .min(1, "Must have at least one question"),
});

export const QuizSchema = yup.object({
  _id: yup.mixed<ObjectId>().required(),
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),
  ownerId: Yup.mixed<ObjectId>().required("User is required"),
  questionsList: Yup.array()
    .of(QuizEntrySchema)
    .required("Questions are required")
    .min(1, "Must have at least one question"),
});
export type QuizInput = Yup.InferType<typeof QuizInputSchema>;
export type Quiz = InferType<typeof QuizSchema>;

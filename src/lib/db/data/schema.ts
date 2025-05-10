import * as Yup from "yup";
import { ObjectId } from "mongodb";
import { InferType } from "yup";
import * as yup from "yup";

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
    .of(FlashcardSchema)
    .required("Flashcards must be an array"),
  createdAt: Yup.date()
    .required("CreatedAt is required")
    .default(() => new Date()),
  lastStudied: Yup.date()
    .required("lastStudied is required")
    .default(() => new Date()),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
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
    .of(FlashcardSchema)
    .required("Flashcards must be an array"),
  createdAt: Yup.date()
    .required("CreatedAt is required")
    .default(() => new Date()),
  lastStudied: Yup.date()
    .required("lastStudied is required")
    .default(() => new Date()),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
});
export type DeckInput = Yup.InferType<typeof DeckInputSchema>;
export type Deck = Yup.InferType<typeof DeckSchema>;



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

export const QuizAttemptSchema = Yup.object({
  userId: Yup.mixed<ObjectId>().required("User is required"),
  score: Yup.number().required("Score is required"),
  date: Yup.date()
    .required("Date is required")
    .default(() => new Date()),
});
export type QuizAttempt = Yup.InferType<typeof QuizAttemptSchema>;

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
  createdAt: Yup.date()
      .required("CreatedAt is required")
      .default(() => new Date()),
  lastStudied: Yup.date()
    .required("lastStudied is required")
    .default(() => new Date()),
  questionsList: Yup.array()
    .of(QuizEntrySchema)
    .required("Questions are required"),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
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
  createdAt: Yup.date()
      .required("CreatedAt is required")
      .default(() => new Date()),
  lastStudied: Yup.date()
    .required("lastStudied is required")
    .default(() => new Date()),
  questionsList: Yup.array()
    .of(QuizEntrySchema)
    .required("Questions are required"),
  attempts: Yup.array()
    .of(QuizAttemptSchema).required(),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
});
export type QuizInput = Yup.InferType<typeof QuizInputSchema>;
export type Quiz = InferType<typeof QuizSchema>;

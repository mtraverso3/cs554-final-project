import * as Yup from "yup";
import * as yup from "yup";
import { InferType } from "yup";
import { ObjectId } from "mongodb";

const ObjectIdSchema = yup.mixed((value): value is ObjectId =>
  ObjectId.isValid(value),
);

export const CommentSchema = Yup.object({
  ownerId: ObjectIdSchema.required("User is required"),
  text: Yup.string()
    .trim()
    .required("Text is required")
    .min(1, "Must be a non-empty string"),
  createdAt: Yup.date()
    .required("CreatedAt is required")
    .default(() => new Date()),
});
export type Comment = Yup.InferType<typeof CommentSchema>;

export const FlashcardSchema = yup.object({
  _id: ObjectIdSchema.required(),
  front: Yup.string()
    .trim()
    .required("Front text is required")
    .min(1, "Must be non-empty"),
  back: Yup.string()
    .trim()
    .required("Back text is required")
    .min(1, "Must be non-empty"),
  deckId: ObjectIdSchema.required("deckId is required"),
});
export type Flashcard = InferType<typeof FlashcardSchema>;

export const StudyProgressSchema = Yup.object({
  currentCardIndex: Yup.number().default(0),
  knownCardIds: Yup.array().of(Yup.string().defined()).default([]),
  unknownCardIds: Yup.array().of(Yup.string().defined()).default([]),
  lastPosition: Yup.number().default(0),
  studyTime: Yup.number().default(0),
  isReviewMode: Yup.boolean().default(false),
  isCompleted: Yup.boolean().default(false),
  reviewingCardIds: Yup.array().of(Yup.string().defined()).default([]),
});

export type StudyProgress = Yup.InferType<typeof StudyProgressSchema>;

export const DeckSchema = yup.object({
  _id: ObjectIdSchema.required(),
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),
  ownerId: ObjectIdSchema.required("User is required"),
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
  studyProgress: StudyProgressSchema.default(() => ({
    currentCardIndex: 0,
    knownCardIds: [],
    unknownCardIds: [],
    lastPosition: 0,
    studyTime: 0,
  })),
  likes: Yup.array()
    .of(ObjectIdSchema.required())
    .default([])
    .required("Likes must be an array"),
  comments: Yup.array()
    .of(CommentSchema)
    .default([])
    .required("Comments must be an array"),
  published: Yup.boolean().default(false).required("Public is required"),
});

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
  sub: yup.string().trim().required("Sub is required"),
});
export const UserSchema = yup.object({
  _id: ObjectIdSchema.required(),
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
  sub: yup.string().trim().required("Sub is required"),
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
  userId: ObjectIdSchema.required("User is required"),
  score: Yup.number().required("Score is required"),
  date: Yup.date()
    .required("Date is required")
    .default(() => new Date()),
});
export type QuizAttempt = Yup.InferType<typeof QuizAttemptSchema>;

export const QuizSchema = yup.object({
  _id: ObjectIdSchema.required(),
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),
  ownerId: ObjectIdSchema.required("User is required"),
  createdAt: Yup.date()
    .required("CreatedAt is required")
    .default(() => new Date()),
  lastStudied: Yup.date()
    .required("lastStudied is required")
    .default(() => new Date()),
  questionsList: Yup.array()
    .of(QuizEntrySchema)
    .required("Questions are required"),
  attempts: Yup.array().of(QuizAttemptSchema).required("Attempts are required"),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
  published: Yup.boolean().default(false).required("Public is required"),
});
export type Quiz = InferType<typeof QuizSchema>;

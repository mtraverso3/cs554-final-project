import * as Yup from "yup";
import { ObjectId } from "mongodb";
import { InferType } from "yup";
import * as yup from "yup";


const ObjectIdSchema = yup.mixed((value): value is ObjectId => ObjectId.isValid(value))

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

export const FlashcardInputSchema = Yup.object({
  front: Yup.string()
    .trim()
    .required("Front text is required")
    .min(1, "Must be non-empty"),
  back: Yup.string()
    .trim()
    .required("Back text is required")
    .min(1, "Must be non-empty"),
});
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
export type FlashcardInput = Yup.InferType<typeof FlashcardInputSchema>;
export type Flashcard = InferType<typeof FlashcardSchema>;

export const DeckInputSchema = Yup.object({
  name: Yup.string()
      .trim()
      .required("Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(25, "Name must be at most 25 characters")
      .matches(/[a-zA-Z]/, "Name must include at least one letter (not just numbers)"),

  description: Yup.string()
      .trim()
      .required("Description is required")
      .min(10, "Description must be at least 10 characters")
      .max(256, "Description must be at most 256 characters")
      .matches(/[a-zA-Z]/, "Description must contain letters"),
  flashcardList: Yup.array()
    .of(FlashcardInputSchema)
    .required("Flashcards must be an array"),
  category: Yup.string()
      .trim()
      .required("Category is required")
      .min(2, "Category must be at least 2 characters")
      .max(50, "Category must be at most 50 characters")
      .matches(/^[A-Za-z]+$/, "Category must contain only letters"),

});

export const StudyProgressSchema = Yup.object({
  currentCardIndex: Yup.number().default(0),
  knownCardIds: Yup.array().of(Yup.string().defined()).default([]),
  unknownCardIds: Yup.array().of(Yup.string().defined()).default([]),
  lastPosition: Yup.number().default(0),
  studyTime: Yup.number().default(0),
  isReviewMode: Yup.boolean().default(false),
  isCompleted: Yup.boolean().default(false),
  reviewingCardIds: Yup.array().of(Yup.string().defined()).default([])
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
    studyTime: 0
  })),
  likes: Yup.array()
    .of(ObjectIdSchema.required())
    .default([])
    .required("Likes must be an array"),
  comments: Yup.array()
    .of(CommentSchema)
    .default([])
    .required("Comments must be an array"),
});

export type Deck = Yup.InferType<typeof DeckSchema>;
export type DeckInput = Yup.InferType<typeof DeckInputSchema>;

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

export const QuizInputSchema = Yup.object({
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
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
  attempts: Yup.array()
    .of(QuizAttemptSchema).required("Quiz attempts are required")
});

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
  attempts: Yup.array()
    .of(QuizAttemptSchema).required("Attempts are required"),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
});
export type QuizInput = Yup.InferType<typeof QuizInputSchema>;
export type Quiz = InferType<typeof QuizSchema>;
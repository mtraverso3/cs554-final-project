import * as Yup from "yup";

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

export const FlashcardInputSchema = Yup.object({
  _id: Yup.string().required(),
  front: Yup.string()
    .trim()
    .required("Front text is required")
    .min(1, "Must be non-empty"),
  back: Yup.string()
    .trim()
    .required("Back text is required")
    .min(1, "Must be non-empty"),
});
export const CommentSchema = Yup.object({
  ownerId: Yup.string().required("User is required"),
  text: Yup.string()
    .trim()
    .required("Text is required")
    .min(1, "Must be a non-empty string"),
  createdAt: Yup.string().required("CreatedAt is required"),
});
export type Comment = Yup.InferType<typeof CommentSchema>;

export type FlashcardInput = Yup.InferType<typeof FlashcardInputSchema>;
export const DeckInputSchema = Yup.object({
  _id: Yup.string().required("Deck Id is required"),
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be at most 25 characters")
    .matches(
      /[a-zA-Z]/,
      "Name must include at least one letter (not just numbers)",
    ),

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
  comments: Yup.array()
    .of(CommentSchema)
    .default([])
    .required("Comments are required"),

  published: Yup.boolean().default(false).required("Public is required"),
});

export type DeckInput = Yup.InferType<typeof DeckInputSchema>;

export const DeckCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be at most 25 characters")
    .matches(
      /[a-zA-Z]/,
      "Name must include at least one letter (not just numbers)",
    ),

  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(256, "Description must be at most 256 characters")
    .matches(/[a-zA-Z]/, "Description must contain letters"),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be at most 50 characters")
    .matches(/^[A-Za-z]+$/, "Category must contain only letters"),
});

export type DeckCreate = Yup.InferType<typeof DeckCreateSchema>;

export const QuizInputEntrySchema = Yup.object({
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
export type QuizInputEntry = Yup.InferType<typeof QuizInputEntrySchema>;

export const QuizInputAttemptSchema = Yup.object({
  score: Yup.number().required("Score is required"),
});
export type QuizInputAttempt = Yup.InferType<typeof QuizInputAttemptSchema>;

export const QuizInputSchema = Yup.object({
  _id: Yup.string().required("Deck Id is required"),
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),

  questionsList: Yup.array()
    .of(QuizInputEntrySchema)
    .required("Questions are required"),
  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
  comments: Yup.array()
      .of(CommentSchema)
      .default([])
      .required("Comments are required"),

  published: Yup.boolean().default(false).required("Public is required"),
});

export const QuizCreateSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(1, "Must be a non-empty string"),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(1, "Must be a non-empty string"),

  category: Yup.string()
    .trim()
    .required("Category is required")
    .min(1, "Must be a non-empty string"),
});

export type QuizInput = Yup.InferType<typeof QuizInputSchema>;

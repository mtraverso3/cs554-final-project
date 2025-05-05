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

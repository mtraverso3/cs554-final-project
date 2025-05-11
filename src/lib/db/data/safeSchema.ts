import * as Yup from "yup";
import * as yup from "yup";
import {InferType} from "yup";

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

export type FlashcardInput = Yup.InferType<typeof FlashcardInputSchema>;

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

export type DeckInput = Yup.InferType<typeof DeckInputSchema>;

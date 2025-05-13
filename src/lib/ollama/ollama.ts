import { Ollama } from "ollama";
import { Deck, QuizEntry } from "@/lib/db/data/schema";
import * as yup from "yup";

const ollama = new Ollama({
  //Use env or fallback
  host: process.env.OLLAMA_API_URL || "http://127.0.0.1:11434",
});

const modelResponseSchema = yup.object({
  options: yup
    .array()
    .of(yup.string().required())
    .length(4, "Response must contain exactly 4 options")
    .required("Options are required"),
  correctIndex: yup
    .number()
    .integer("correctIndex must be an integer")
    .min(0, "correctIndex must be at least 0")
    .max(3, "correctIndex must be at most 3")
    .required("correctIndex is required"),
});
export type ModelResp = yup.InferType<typeof modelResponseSchema>;

const OLLAMA_MODEL_NAME = process.env.OLLAMA_MODEL_NAME || "qwen3:4b";
await ollama.pull({ model: OLLAMA_MODEL_NAME });

const SYSTEM_PROMPT =
  "You are a quiz generator creating multiple choice questions from flashcards. " +
  "Return JSON with fields: 'options' (array of four choices including the correct answer) and " +
  "'correctIndex' (zero-based index of correct answer). Output only valid JSON.";

const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "bge-large";
await ollama.pull({ model: OLLAMA_EMBED_MODEL });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ollama.embeddings({
    model: OLLAMA_EMBED_MODEL,
    prompt: text,
  });
  if (!response || !response.embedding) {
    throw new Error("Failed to generate embedding");
  }
  return response.embedding;
}

export async function generateQuizEntry(
  question: string,
  answer: string,
  maxRetries = 3,
): Promise<{ question: string; options: string[]; correctIndex: number }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ollama.generate({
        model: OLLAMA_MODEL_NAME,
        prompt: `Generate a multiple choice question.\nQuestion: "${question}"\nCorrect answer: "${answer}"\nReturn only JSON.`,
        system: SYSTEM_PROMPT,
        format: "json",
      });

      const data = JSON.parse(response.response) as ModelResp;
      try {
        modelResponseSchema.validateSync(data);
      } catch (e) {
        throw new Error(
          `Invalid response format for question "${question}": ${e instanceof Error ? e.message : e}`,
        );
      }

      return {
        question,
        options: data.options,
        correctIndex: data.correctIndex,
      };
    } catch (err) {
      // last attempt, we throw error
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to generate quiz for "${question}" after ${maxRetries} attempts: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // wait before retrying, might be a temporary issue or model overloaded, had some issues with this
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw new Error("Unexpected error in quiz generation"); // should not reach here
}

export async function deckToQuiz(deck: Deck): Promise<QuizEntry[]> {
  // extract questions and answers from flashcards
  const flashcards = deck.flashcardList.map((card) => ({
    question: card.front,
    answer: card.back,
  }));

  // generate quiz entries in parallel
  const quizEntries = await Promise.all(
    flashcards.map(({ question, answer }) =>
      generateQuizEntry(question, answer),
    ),
  );

  // convert to QuizEntry format
  return quizEntries.map(({ question, options, correctIndex }) => ({
    question,
    answers: options.map((option, index) => ({
      answer: option,
      isCorrect: index === correctIndex,
    })),
  }));
}

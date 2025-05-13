"use server";
import { generateEmbedding } from "@/lib/ollama/ollama";
import { embeddings } from "@/lib/db/config/mongoCollections";
import { getDeckById } from "@/lib/db/data/decks";
import { getQuizById } from "@/lib/db/data/quizzes";
import { authenticateUser } from "@/lib/auth/auth";
import { serializeDeck2, serializeQuiz2 } from "@/lib/db/data/serialize";
import type { WithId, Document } from "mongodb";

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export async function searchAISemantic(query: string, topK = 10) {
  const user = await authenticateUser();
  const userId = user._id.toString();
  const queryVector = await generateEmbedding(query);
  const collection = await embeddings();
  const all = await collection.find({}).toArray();
  const scored = all.map((doc: WithId<Document>) => ({
    _id: doc._id.toString(),
    refId: doc.refId.toString(),
    refType: doc.refType,
    score: cosineSimilarity(queryVector, doc.vector),
  }));
  scored.sort(
    (a: { score: number }, b: { score: number }) => b.score - a.score,
  );
  const results = [];
  for (const r of scored) {
    if (results.length >= topK) break;
    try {
      let item = null;
      if (r.refType === "deck") {
        const deck = await getDeckById(r.refId);
        if (!deck.published && deck.ownerId.toString() !== userId) continue;
        item = serializeDeck2(deck);
      } else if (r.refType === "quiz") {
        const quiz = await getQuizById(r.refId);
        if (!quiz.published && quiz.ownerId.toString() !== userId) continue;
        item = serializeQuiz2(quiz);
      }
      if (item) {
        results.push({ ...r, item });
      }
    } catch {
      // skip if not found or error
    }
  }
  return { results };
}

import { ObjectId } from "mongodb";
import { embeddings } from "@/lib/db/config/mongoCollections";

// import { Embedding } from "./schema";

export async function upsertEmbedding({
  refId,
  refType,
  vector,
  content,
}: {
  refId: ObjectId;
  refType: "deck" | "quiz";
  vector: number[];
  content: string;
}): Promise<void> {
  const collection = await embeddings();
  const now = new Date();
  await collection.updateOne(
    { refId, refType },
    { $set: { vector, content, updatedAt: now } },
    { upsert: true },
  );
}

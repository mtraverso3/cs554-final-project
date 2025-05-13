"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { searchAISemantic } from "./search-action";
import type { SerializedDeck } from "@/lib/db/data/serialize";
import type { serializedQuiz } from "@/lib/db/data/serialize";

type Result = {
  _id: string;
  refId: string;
  refType: "deck" | "quiz";
  score: number;
  item: SerializedDeck | serializedQuiz;
};

export default function AiSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResults([]);
    startTransition(async () => {
      try {
        const data = await searchAISemantic(query);
        setResults(data.results as Result[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">AI Semantic Search</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          className="flex-1 border rounded px-3 py-2"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search decks and quizzes..."
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r: Result) => (
          <Card key={r._id} className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1 flex items-center gap-2">
                {r.item?.name || "Not found"}
                <span className="text-xs font-normal text-gray-400">
                  {r.refType === "deck" ? "Deck" : "Quiz"}
                </span>
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {r.item?.category}{" "}
                {r.item?.createdAt && (
                  <>
                    &bull; Created on{" "}
                    {new Date(r.item.createdAt).toLocaleDateString()}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="line-clamp-2 text-muted-foreground mb-2">
                {r.item?.description}
              </p>
              {r.refType === "deck" && "flashcardList" in r.item && (
                <div className="text-xs text-gray-600 mb-1">
                  Flashcards: {r.item.flashcardList.length}
                  {r.item.flashcardList
                    .slice(0, 3)
                    .map(
                      (
                        f: SerializedDeck["flashcardList"][number],
                        i: number,
                      ) => (
                        <div key={i} className="ml-2">
                          • <b>{f.front}</b> — {f.back}
                        </div>
                      ),
                    )}
                  {r.item.flashcardList.length > 3 && (
                    <div className="ml-2">...and more</div>
                  )}
                </div>
              )}
              {r.refType === "quiz" && "questionsList" in r.item && (
                <div className="text-xs text-gray-600 mb-1">
                  Questions: {r.item.questionsList.length}
                  {r.item.questionsList
                    .slice(0, 3)
                    .map(
                      (
                        q: serializedQuiz["questionsList"][number],
                        i: number,
                      ) => (
                        <div key={i} className="ml-2">
                          • <b>{q.question}</b>
                        </div>
                      ),
                    )}
                  {r.item.questionsList.length > 3 && (
                    <div className="ml-2">...and more</div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 flex-row justify-between items-center">
              <Button asChild size="sm">
                <Link
                  href={
                    r.refType === "deck"
                      ? `/user/flashcard-library/${r.item?._id}`
                      : `/user/quiz-library/${r.item?._id}`
                  }
                >
                  View
                </Link>
              </Button>
              <span className="text-xs text-gray-500 ml-2">
                Similarity: {r.score.toFixed(3)}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
      {results.length === 0 && !loading && !error && (
        <div className="text-gray-500 mt-8">No results yet. Try searching!</div>
      )}
    </div>
  );
}

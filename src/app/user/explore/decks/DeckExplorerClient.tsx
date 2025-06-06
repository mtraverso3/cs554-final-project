"use client";

import React, { useMemo, useState } from "react";
import DeckCard from "@/app/user/explore/decks/DeckCard";
import type { SerializedDeck } from "@/lib/db/data/serialize";

export default function PublicDeckExplorerClient({
  decks,
  currentUserId,
}: {
  decks: SerializedDeck[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"title" | "createdAt">("title");

  const categories = useMemo(() => {
    const cats = new Set(decks.map((d) => d.category));
    return ["All", ...Array.from(cats).sort()];
  }, [decks]);

  // apply search, filter, sort
  const filtered = useMemo(() => {
    return decks
      .filter((d) => {
        if (category !== "All" && d.category !== category) return false;
        const q = search.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return a.name.localeCompare(b.name);
        } else {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      });
  }, [decks, search, category, sortBy]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded px-4 py-2 focus:outline-none focus:ring"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "title" | "createdAt")}
          className="border rounded px-4 py-2 focus:outline-none focus:ring"
        >
          <option value="title">Sort by Title (A→Z)</option>
          <option value="createdAt">Sort by Date (Newest)</option>
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((deck) => (
            <div key={deck._id}>
              <DeckCard deck={deck} currentUserId={currentUserId} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No decks match your criteria.</p>
      )}
    </>
  );
}
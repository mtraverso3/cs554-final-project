"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type Deck = {
  id: string;
  title: string;
  description: string;
  flashcardCount: number;
  createdAt: Date;
};

const generateDummyDecks = (): Deck[] => [
  {
    id: "1",
    title: "Legend of Zelda Basics",
    description: "Core knowledge about Hyrule and its heroes",
    flashcardCount: 4,
    createdAt: new Date("2025-03-15"),
  },
  {
    id: "2",
    title: "Items and Artifacts",
    description: "Important items from across the Zelda universe",
    flashcardCount: 3,
    createdAt: new Date("2025-03-20"),
  },
  {
    id: "3",
    title: "Characters and Creatures",
    description: "Friends and foes from the world of Zelda",
    flashcardCount: 6,
    createdAt: new Date("2025-03-25"),
  },
  {
    id: "4",
    title: "Locations and Landmarks",
    description: "Key places in the Zelda universe",
    flashcardCount: 5,
    createdAt: new Date("2025-03-28"),
  },
  {
    id: "5",
    title: "Game Mechanics",
    description: "How gameplay works across different Zelda titles",
    flashcardCount: 7,
    createdAt: new Date("2025-04-02"),
  },
  {
    id: "6",
    title: "Timeline and Lore",
    description: "The complex timeline and mythology of the Zelda universe",
    flashcardCount: 9,
    createdAt: new Date("2025-04-05"),
  },
  {
    id: "7",
    title: "Music and Sounds",
    description: "Memorable tunes and audio from the series",
    flashcardCount: 4,
    createdAt: new Date("2025-04-08"),
  },
  {
    id: "8",
    title: "Breath of the Wild Specifics",
    description: "Details unique to Breath of the Wild",
    flashcardCount: 8,
    createdAt: new Date("2025-04-10"),
  },
];

export default function FlashcardLibrary() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const dummyData = generateDummyDecks();
    setDecks(dummyData);
    setFilteredDecks(dummyData);
  }, []);

  useEffect(() => {
    let filtered = [...decks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deck) =>
          deck.title.toLowerCase().includes(query) ||
          deck.description.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    setFilteredDecks(filtered);
  }, [searchQuery, sortOrder, decks]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Flashcard Decks</h1>
        <Button asChild>
          <Link href="/user/flashcard-library/create">
            <PlusIcon className="mr-2" />
            New Deck
          </Link>
        </Button>
      </div>

      {/* search + sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search decks..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className="flex items-center gap-1"
        >
          <ArrowUpDown size={16} />
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <Card key={deck.id} className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{deck.title}</CardTitle>
                <CardDescription>
                  {deck.flashcardCount} flashcards • Created on {deck.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="line-clamp-2 text-muted-foreground">{deck.description}</p>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/user/flashcard-library/${deck.id}`}>View</Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/user/flashcard-library/${deck.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* add deck */}
          <Card className="border-dashed h-full flex flex-col justify-center items-center">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <PlusIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-4">Create a new deck</p>
              <Button asChild>
                <Link href="/user/flashcard-library/create">New Deck</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No decks found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search" : "Create your first deck to get started"}
            </p>
            <Button asChild>
              <Link href="/user/flashcard-library/create">
                <PlusIcon className="mr-2" />
                Create Deck
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
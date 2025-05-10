"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, SearchIcon, ArrowUpDown, Trash2, X } from "lucide-react";
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
import { getDecks, deleteDeck } from "@/lib/deckForms";
import { Deck } from "@/lib/db/data/schema";

export default function FlashcardLibrary() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const data = await getDecks();
      const parsedData = JSON.parse(data);
      parsedData.forEach((deck: Deck) => {
        deck.createdAt = new Date(deck.createdAt);
      });
      setDecks(parsedData);
      setFilteredDecks(parsedData);
    } catch (error) {
      console.error("Error fetching decks:", error);
      setError("Failed to load decks");
    }
  };

  useEffect(() => {
    let filtered = [...decks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deck) =>
          deck.name.toLowerCase().includes(query) ||
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

  const openDeleteConfirmation = (deck: Deck) => {
    setDeckToDelete(deck);
    setShowDeleteModal(true);
  };

  const handleDeleteDeck = async () => {
    if (!deckToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteDeck(deckToDelete._id.toString());
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.success) {
        setDecks(prevDecks => prevDecks.filter(deck => deck._id.toString() !== deckToDelete._id.toString()));
        setShowDeleteModal(false);
      } else {
        setError(parsedResult.error || "Failed to delete deck");
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeckToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Close</span>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Flashcard Decks</h1>
        <Button asChild>
          <Link href="/user/flashcard-library/create">
            <PlusIcon className="mr-2" />
            New Deck
          </Link>
        </Button>
      </div>

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

      {showDeleteModal && deckToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Deck</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the deck &quot{deckToDelete.name}&quot? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteDeck}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <Card key={deck._id.toString()} className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
                <CardDescription>
                  {deck.flashcardList.length} flashcards • Created on {new Date(deck.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="line-clamp-2 text-muted-foreground">{deck.description}</p>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/user/flashcard-library/${deck._id}`}>View</Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/user/flashcard-library/${deck._id}/edit`}>Edit</Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteConfirmation(deck)}
                  >
                    <Trash2 size={16} className="mr-1" />
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

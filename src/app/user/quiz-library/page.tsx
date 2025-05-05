"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
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
import { getQuizzes } from "@/lib/quizForms";
import { Quiz } from "@/lib/db/data/schema";
import {getDecks} from "@/lib/deckForms";


// export type Quiz = {
//   id: string;
//   name: string;
//   description: string;
//   questionsList: Object[];
//   createdAt: Date;
// };

// export type Deck = {
//   id: string;
//   name: string;
//   description: string;
//   flashcardCount: number;
//   createdAt: Date;
// };
//
// const generateDummyDecks = (): Deck[] => [
//   {
//     id: "hyrule-101",
//     name: "Hyrule 101",
//     description: "Basic knowledge about the land of Hyrule",
//     flashcardCount: 5,
//     createdAt: new Date("2025-03-10"),
//   },
//   {
//     id: "zelda-characters",
//     name: "Characters of Zelda",
//     description: "Important characters in the Legend of Zelda universe",
//     flashcardCount: 8,
//     createdAt: new Date("2025-03-15"),
//   },
//   {
//     id: "botw-specifics",
//     name: "Breath of the Wild",
//     description: "Specific content from Breath of the Wild",
//     flashcardCount: 6,
//     createdAt: new Date("2025-03-20"),
//   },
// ];

// const generateDummyQuizzes = (): Quiz[] => [
//   {
//     _id: "1",
//     name: "Hero's Journey 101",
//     description: "Test your knowledge of Hyrule, Link, and the legendary lore.",
//     questionsList: [{question: "test question" ,answers: [{answer: "what up", isCorrect: true}]}],
//     createdAt: new Date("2025-03-15"),
//   },
//   {
//     id: "2",
//     name: "Breath of the Wild Brain Teasers",
//     description: "A quiz dedicated to the wildest adventures of Link in BOTW.",
//     questionsList: [{answer: "what up", correct: true}],
//     createdAt: new Date("2025-03-23"),
//   },
//   {
//     id: "3",
//     name: "Divine Beasts & Ancient Tech",
//     description:
//       "Do you know your way around the Sheikah inventions and beasts?",
//     questionsList: [{answer: "what up", correct: true}],
//     createdAt: new Date("2025-04-02"),
//   },
//   {
//     id: "4",
//     name: "Zelda Characters Quiz",
//     description:
//       "Test your knowledge about the most important characters in Hyrule.",
//     questionsList: [{answer: "what up", correct: true}],
//     createdAt: new Date("2025-04-05"),
//   },
// ];

export default function QuizLibrary() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  //const [decks, setDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  //const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    getQuizzes().then(
        (quiz) => {
          const parsedData = JSON.parse(quiz);
          parsedData.forEach((quiz: Quiz) => {
            quiz.createdAt = new Date(quiz.createdAt);
          });
          setQuizzes(parsedData);
          setFilteredQuizzes(parsedData);
        }
    );
  }, []);

  useEffect(() => {
    let filtered = [...quizzes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.name.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query),
      );
    }

    // if (selectedDeck) {
    //   filtered = filtered.filter((quiz) => quiz.deckId === selectedDeck);
    // }

    filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime(),
    );

    setFilteredQuizzes(filtered);
  }, [searchQuery, sortOrder, quizzes]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // const getDeckName = (deckId: string) => {
  //   const deck = decks.find((d) => d.id === deckId);
  //   return deck ? deck.name : "Unknown Deck";
  // };

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Library</h1>
        <Button asChild>
          <Link href="/user/quiz-library/create">
            <PlusIcon className="mr-2" />
            New Quiz
          </Link>
        </Button>
      </div>

      {/* search + filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search quizzes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            {/*<select*/}
            {/*  className="h-9 rounded-md border bg-background px-3 py-1 text-sm appearance-none pr-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"*/}
            {/*  value={selectedDeck || ""}*/}
            {/*  onChange={(e) => setSelectedDeck(e.target.value || null)}*/}
            {/*>*/}
            {/*  <option value="">All Decks</option>*/}
            {/*  {decks.map((deck) => (*/}
            {/*    <option key={deck.id} value={deck.id}>*/}
            {/*      {deck.name}*/}
            {/*    </option>*/}
            {/*  ))}*/}
            {/*</select>*/}
            <FilterIcon
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={14}
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
      </div>
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz._id.toString()} className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{quiz.name}</CardTitle>
                <CardDescription>
                  {quiz.questionsList.length} question(s)
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {quiz.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created on {quiz.createdAt.toLocaleDateString()}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="default" size="sm" asChild>
                  <Link href={`/user/quiz-library/${quiz._id}/study`}>
                    Study
                  </Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/user/quiz-library/${quiz._id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* add quiz card */}
          <Card className="border-dashed h-full flex flex-col justify-center items-center">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <PlusIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                Create a new quiz
              </p>
              <Button asChild>
                <Link href="/user/quiz-library/create">New Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No quizzes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Create your first quiz to get started"}
            </p>
            <div className="flex gap-4 justify-center">
              {/*{(searchQuery || selectedDeck) && (*/}
              {/*  <Button*/}
              {/*    variant="outline"*/}
              {/*    onClick={() => {*/}
              {/*      setSearchQuery("");*/}
              {/*      setSelectedDeck(null);*/}
              {/*    }}*/}
              {/*  >*/}
              {/*    Clear Filters*/}
              {/*  </Button>*/}
              {/*)}*/}
              <Button asChild>
                <Link href="/user/quiz-library/create">
                  <PlusIcon className="mr-2" />
                  Create Quiz
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

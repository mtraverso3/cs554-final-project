"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  //BarChart2,
  BookOpenIcon,
  ChevronDown,
  ChevronUp,
  //ChevronDown,
  //ChevronUp,
  Clock,
  LayersIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDecks } from "@/lib/deckForms";
import { getQuizzes } from "@/lib/quizForms";
import { Quiz, Deck } from "@/lib/db/data/schema";

// type Flashcard = {
//   id: string;
//   front: string;
//   back: string;
//   createdAt: Date;
// };
//
// type Deck = {
//   id: string;
//   name: string;
//   description: string;
//   flashcardList: number;
//   createdAt: Date;
//
//   // studyProgress: number;
//   lastStudied: Date;
//   category: string;
// };
//
// type Quiz = {
//   id: string;
//   name: string;
//   description: string;
//   questionsList: number;
//   createdAt: Date;
//
//   // lastScore: number | null;
//   lastStudied: Date | null;
//   category: string
//   // completedCount: number;
// };

// const dummyDecks: Deck[] = [
//   {
//     id: "1",
//     name: "Legend of Zelda Basics",
//     description: "Core knowledge about Hyrule and its heroes",
//     flashcardList: 4,
//     createdAt: new Date("2025-03-15"),
//     //studyProgress: 75,
//     lastStudied: new Date("2025-04-15"),
//     category: "Video Games",
//   },
//   {
//     id: "2",
//     name: "Items and Artifacts",
//     description: "Important items from across the Zelda universe",
//     flashcardList: 3,
//     createdAt: new Date("2025-03-20"),
//     //studyProgress: 33,
//     lastStudied: new Date("2025-04-10"),
//     category: "Video Games",
//   },
//   {
//     id: "3",
//     name: "Characters and Creatures",
//     description: "Friends and foes from the world of Zelda",
//     flashcardList: 6,
//     createdAt: new Date("2025-03-25"),
//     //studyProgress: 50,
//     lastStudied: new Date("2025-04-18"),
//     category: "Video Games",
//   },
//   {
//     id: "4",
//     name: "Locations and Landmarks",
//     description: "Key places in the Zelda universe",
//     flashcardList: 5,
//     createdAt: new Date("2025-03-28"),
//     //studyProgress: 20,
//     lastStudied: null,
//     category: "Video Games",
//   },
// ];
//
// const dummyQuizzes: Quiz[] = [
//   {
//     id: "1",
//     name: "Heros Journey 101",
//     description: "Test your knowledge of Hyrule, Link, and the legendary lore.",
//     questionsList: 8,
//     createdAt: new Date("2025-03-15"),
//     lastScore: 85,
//     lastStudied: new Date("2025-04-10"),
//     completedCount: 2,
//   },
//   {
//     id: "2",
//     title: "Breath of the Wild Brain Teasers",
//     description: "A quiz dedicated to the wildest adventures of Link in BOTW.",
//     flashcardCount: 10,
//     createdAt: new Date("2025-03-23"),
//     lastScore: 70,
//     lastStudied: new Date("2025-04-15"),
//     completedCount: 1,
//   },
//   {
//     id: "3",
//     title: "Divine Beasts & Ancient Tech",
//     description:
//       "Do you know your way around the Sheikah inventions and beasts?",
//     flashcardCount: 12,
//     createdAt: new Date("2025-04-02"),
//     lastScore: null,
//     lastStudied: null,
//     completedCount: 0,
//   },
// ];

export default function UserHome() {
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  // const [studyStats, setStudyStats] = useState({
  //   totalCards: 0,
  //   cardsStudied: 0,
  //   quizzesCompleted: 0,
  //   averageScore: 0,
  // });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    getDecks().then((data) => {
      const parsedData = JSON.parse(data);
      parsedData.forEach((deck: Deck) => {
        deck.createdAt = new Date(deck.createdAt);
        deck.lastStudied = new Date(deck.lastStudied);
      });

      setRecentDecks(parsedData);
    });
  }, []);
  useEffect(() => {
    getQuizzes().then((data) => {
      const parsedData = JSON.parse(data);
      parsedData.forEach((quiz: Quiz) => {
        quiz.createdAt = new Date(quiz.createdAt);
        quiz.lastStudied = new Date(quiz.lastStudied);
      });
      setRecentQuizzes(parsedData);
    });
  }, []);

  // useEffect(() => {
  //
  //
  //   // these r study stats (FOR NOW!!)
  //   const totalCards = recentDecks.reduce(
  //     (sum, deck) => sum + deck.flashcardList.length,
  //     0,
  //   );
  //   const cardsStudied = recentDecks.reduce(
  //     (sum, deck) =>
  //       sum + Math.round((deck.flashcardList * deck.studyProgress) / 100),
  //     0,
  //   );
  //   const quizzesCompleted = dummyQuizzes.reduce(
  //     (sum, quiz) => sum + quiz.completedCount,
  //     0,
  //   );
  //
  //   const completedQuizzes = dummyQuizzes.filter((q) => q.lastScore !== null);
  //   const averageScore = completedQuizzes.length
  //     ? completedQuizzes.reduce((sum, q) => sum + (q.lastScore || 0), 0) /
  //       completedQuizzes.length
  //     : 0;
  //
  //   setStudyStats({
  //     totalCards,
  //     cardsStudied,
  //     quizzesCompleted,
  //     averageScore,
  //   });
  // }, []);

  // format date
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "Never";

    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/user/flashcard-library/create">
              <PlusIcon className="mr-2" />
              New Deck
            </Link>
          </Button>
          <Button asChild>
            <Link href="/user/quiz-library/create">
              <PlusIcon className="mr-2" />
              New Quiz
            </Link>
          </Button>
        </div>
      </div>

      {/* study stats */}
      <Card className="mb-8">
        <CardHeader
          className="pb-2 cursor-pointer"
          onClick={() => setShowStats(!showStats)}
        >
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2" size={20} />
              Study Statistics
            </CardTitle>
            {showStats ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </CardHeader>

        {showStats && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
              <div className="bg-primary-foreground p-4 rounded-lg text-center">
                {/*<p className="text-2xl font-bold">{studyStats.totalCards}</p>*/}
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
              <div className="bg-primary-foreground p-4 rounded-lg text-center">
                {/*<p className="text-2xl font-bold">{studyStats.cardsStudied}</p>*/}
                <p className="text-sm text-muted-foreground">Cards Studied</p>
              </div>
              <div className="bg-primary-foreground p-4 rounded-lg text-center">
                {/*<p className="text-2xl font-bold">*/}
                {/*  {studyStats.quizzesCompleted}*/}
                {/*</p>*/}
                <p className="text-sm text-muted-foreground">
                  Quizzes Completed
                </p>
              </div>
              <div className="bg-primary-foreground p-4 rounded-lg text-center">
                {/*<p className="text-2xl font-bold">*/}
                {/*  {studyStats.averageScore.toFixed(1)}%*/}
                {/*</p>*/}
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* decks */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center">
            <LayersIcon className="mr-2" />
            Recent Decks
          </h2>
          <Button variant="outline" asChild>
            <Link href="/user/flashcard-library">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentDecks.map((deck) => (
            <Card key={deck._id.toString()} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
                    <CardDescription>
                      {deck.flashcardList.length} flashcards • Created on{" "}
                      {deck.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {deck.category}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 mb-3">
                  {deck.description}
                </p>
                <div className="w-full bg-secondary/30 rounded-full h-2 mb-1">
                  {/*<div*/}
                  {/*  className="bg-primary h-2 rounded-full"*/}
                  {/*  style={{ width: `${deck.studyProgress}%` }}*/}
                  {/*></div>*/}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {/*<span>{deck.studyProgress}% complete</span>*/}
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    Last studied: {formatRelativeTime(deck.lastStudied)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="default" size="sm" asChild>
                  <Link
                    href={`/user/flashcard-library/${deck._id.toString()}/study`}
                  >
                    Study
                  </Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/user/flashcard-library/${deck._id.toString()}`}
                    >
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/user/flashcard-library/${deck._id.toString()}/edit`}
                    >
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* add new deck */}
          <Card className="border-dashed h-full flex flex-col justify-center items-center">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <PlusIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                Create a new deck
              </p>
              <Button asChild>
                <Link href="/user/flashcard-library/create">New Deck</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-10" />

      {/* quizzes */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center">
            <BookOpenIcon className="mr-2" />
            Your Quizzes
          </h2>
          <Button variant="outline" asChild>
            <Link href="/user/quiz-library">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentQuizzes.map((quiz) => (
            <Card key={quiz._id.toString()} className="h-full">
              <CardHeader>
                <CardTitle className="line-clamp-1">{quiz.name}</CardTitle>
                <CardDescription>
                  {quiz.questionsList.length} flashcards • Created on{" "}
                  {quiz.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-muted-foreground mb-3">
                  {quiz.description}
                </p>

                {/*{quiz.lastScore !== null ? (*/}
                {/*  <div className="flex items-center mb-1">*/}
                {/*    <div*/}
                {/*      className="h-8 rounded-l-md flex items-center justify-center font-medium text-white px-3"*/}
                {/*      style={{*/}
                {/*        backgroundColor:*/}
                {/*          quiz.lastScore >= 80*/}
                {/*            ? "#4ade80"*/}
                {/*            : quiz.lastScore >= 60*/}
                {/*              ? "#facc15"*/}
                {/*              : "#f87171",*/}
                {/*        width: "60px",*/}
                {/*      }}*/}
                {/*    >*/}
                {/*      {quiz.lastScore}%*/}
                {/*    </div>*/}
                {/*    <div className="h-8 flex-1 bg-secondary/30 text-sm flex items-center px-3 rounded-r-md">*/}
                {/*      Last attempt*/}
                {/*    </div>*/}
                {/*  </div>*/}
                {/*) : (*/}
                {/*  <div className="h-8 rounded-md bg-secondary/30 text-sm flex items-center px-3 text-muted-foreground">*/}
                {/*    Not attempted yet*/}
                {/*  </div>*/}
                {/*)}*/}

                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  {/*<span>Completed {quiz.completedCount} times</span>*/}
                  {quiz.lastStudied && (
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      Last attempt: {formatRelativeTime(quiz.lastStudied)}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="default" asChild>
                  <Link
                    href={`/user/quiz-library/${quiz._id.toString()}/study`}
                  >
                    Study
                  </Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/user/quiz-library/${quiz._id.toString()}/edit`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/user/quiz-library/${quiz._id.toString()}/stats`}
                    >
                      Stats
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* add new quiz */}
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
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, FilterIcon, PlusIcon, SearchIcon, Trash2, X } from "lucide-react";
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
import { getQuizzes, deleteQuiz } from "@/lib/quizForms";
import { Quiz } from "@/lib/db/data/schema";

export default function QuizLibrary() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDeleting, setIsDeleting] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await getQuizzes();
      const parsedData = JSON.parse(data);
      parsedData.forEach((quiz: Quiz) => {
        quiz.createdAt = new Date(quiz.createdAt);
      });
      setQuizzes(parsedData);
      setFilteredQuizzes(parsedData);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to load quizzes");
    }
  };

  useEffect(() => {
    let filtered = [...quizzes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.name.toLowerCase().includes(query) ||
          quiz.description.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) =>
      sortOrder === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime()
    );

    setFilteredQuizzes(filtered);
  }, [searchQuery, sortOrder, quizzes]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const openDeleteConfirmation = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteQuiz(quizToDelete._id.toString());
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.success) {
        setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id.toString() !== quizToDelete._id.toString()));
        setShowDeleteModal(false);
      } else {
        setError(parsedResult.error || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setQuizToDelete(null);
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
        <h1 className="text-3xl font-bold">Quiz Library</h1>
        <Button asChild>
          <Link href="/user/quiz-library/create">
            <PlusIcon className="mr-2" />
            New Quiz
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
            placeholder="Search quizzes..."
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

      {showDeleteModal && quizToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Quiz</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the quiz &quot;{quizToDelete.name}&quot;? This action cannot be undone.
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
                onClick={handleDeleteQuiz}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz._id.toString()} className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{quiz.name}</CardTitle>
                <CardDescription>
                  {quiz.questionsList.length} question(s) • Category: {quiz.category}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {quiz.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created on {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between pt-2">
                <Button variant="default" size="sm" asChild>
                  <Link href={`/user/quiz-library/${quiz._id.toString()}/study`}>
                    Take Quiz
                  </Link>
                </Button>
                <div className="space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/user/quiz-library/${quiz._id.toString()}`}>
                      View
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/user/quiz-library/${quiz._id.toString()}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteConfirmation(quiz)}
                  >
                    <Trash2 size={16} className="mr-1" />
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
                ? "Try adjusting your search"
                : "Create your first quiz to get started"}
            </p>
            <div className="flex gap-4 justify-center">
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
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

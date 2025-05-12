"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, X, Check, ArrowLeft, Play, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { deleteQuiz } from "@/lib/quizForms";

type QuizAnswer = {
  answer: string;
  isCorrect: boolean;
};

type QuizQuestion = {
  question: string;
  answers: QuizAnswer[];
};

type QuizDTO = {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lastStudied: string;
  questionsList: QuizQuestion[];
};

export default function QuizView({ quiz }: { quiz: QuizDTO }) {
  const router = useRouter();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleDeleteQuiz = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteQuiz(quiz._id);
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.success) {
        router.push('/user/quiz-library');
      } else {
        alert(parsedResult.error || "Failed to delete quiz");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Link href="/user/quiz-library" className="flex items-center text-gray-600 hover:text-gray-900">
            <Button variant="outline">
              <ArrowLeft className="mr-2" size={16} />
              Back to Quiz Library
            </Button>
          </Link>
          
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{quiz.name}</h1>
            <span className="ml-4 text-gray-500">{quiz.questionsList.length} questions</span>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/user/quiz-library/${quiz._id}/edit`}>
                <Edit className="mr-2" size={16} />
                Edit Quiz
              </Link>
            </Button>
            <Button 
              variant="outline"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteModal(true)}
            >
              <X className="mr-2" size={16} />
              Delete
            </Button>
          </div>
        </div>
        <p className="mt-2 text-gray-600 text-center">{quiz.description}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button asChild variant="default">
          <Link href={`/user/quiz-library/${quiz._id}/study`}>
            <Play className="mr-2" size={16} />
            Take Quiz
          </Link>
        </Button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Category: <span className="font-medium text-gray-700">{quiz.category}</span></p>
            <p className="text-sm text-gray-500">Created: <span className="font-medium text-gray-700">{new Date(quiz.createdAt).toLocaleDateString()}</span></p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Taken: <span className="font-medium text-gray-700">
              {quiz.lastStudied ? new Date(quiz.lastStudied).toLocaleDateString() : "Never"}
            </span></p>
          </div>
        </div>
      </div>
      
      {/* Questions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart2 className="mr-2" size={20} />
          Quiz Questions
        </h2>
        
        {quiz.questionsList.length > 0 ? (
          quiz.questionsList.map((question, index) => (
            <Card 
              key={index} 
              className={`border ${expandedQuestions.has(index) ? 'shadow-md' : 'shadow-sm'}`}
            >
              <CardContent className="p-0">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-sm mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{question.question}</span>
                  </div>
                  {expandedQuestions.has(index) ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                
                {expandedQuestions.has(index) && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t my-2"></div>
                    <p className="text-sm text-gray-500 mb-2">Answer options:</p>
                    <ul className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <li 
                          key={answerIndex} 
                          className={`flex items-center p-2 rounded-md ${answer.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-gray-50'}`}
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-full text-sm mr-3 bg-white border">
                            {String.fromCharCode(65 + answerIndex)} {/* A, B, C, D */}
                          </span>
                          <span className="flex-1">{answer.answer}</span>
                          {answer.isCorrect && (
                            <span className="text-green-600 flex items-center">
                              <Check size={16} className="mr-1" />
                              Correct
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-500 mb-4">This quiz doesn&apos;t have any questions yet.</p>
            <Button asChild>
              <Link href={`/user/quiz-library/${quiz._id}/edit`}>
                Add Questions
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Delete Quiz</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the quiz &quot;{quiz.name}&quot;? This action cannot be undone.
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
    </div>
  );
}
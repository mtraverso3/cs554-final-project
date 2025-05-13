"use server";
import { getQuizById } from "@/lib/db/data/quizzes";
import { authenticateUser } from "@/lib/auth/auth";
import { Quiz, QuizEntry, User } from "@/lib/db/data/schema";
import { unauthorized } from "next/navigation";
import EditQuizForm from "./EditQuizForm";

function serializeQuiz(quiz: Quiz) {
  return {
    _id: quiz._id.toString(),
    ownerId: quiz.ownerId.toString(),
    name: quiz.name,
    description: quiz.description,
    category: quiz.category,
    comments: quiz.comments.map((c) => ({
      createdAt: c.createdAt.toISOString(),
      ownerId: c.ownerId.toString(),
      text: c.text,
    })),
    createdAt: quiz.createdAt
      ? quiz.createdAt.toISOString()
      : new Date().toISOString(),
    lastStudied: quiz.lastStudied
      ? quiz.lastStudied.toISOString()
      : new Date().toISOString(),
    published: quiz.published,
    questionsList: quiz.questionsList.map((question: QuizEntry) => ({
      question: question.question,
      answers: question.answers.map((answer) => ({
        answer: answer.answer,
        isCorrect: answer.isCorrect,
      })),
    })),
  };
}

async function getQuiz(id: string): Promise<Quiz> {
  "use server";
  const userObject: User = await authenticateUser();

  const quiz: Quiz = await getQuizById(id);

  if (!quiz.ownerId.equals(userObject._id)) {
    throw new Error("Not Authorized");
  }

  return quiz;
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  try {
    const { quizId } = await params;
    const quiz: Quiz = await getQuiz(quizId);
    return <EditQuizForm quiz={serializeQuiz(quiz)} />;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Not Authorized") {
        unauthorized();
      } else {
        console.error(error);
        return (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="mt-4">{error.message}</p>
          </div>
        );
      }
    }
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-4">An unexpected error occurred</p>
      </div>
    );
  }
}
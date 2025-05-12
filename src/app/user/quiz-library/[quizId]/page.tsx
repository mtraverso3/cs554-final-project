"use server";

import { Quiz } from "@/lib/db/data/schema";
import QuizView from "./QuizView";
import {getQuiz} from "@/lib/quizForms";

import { serializeQuiz2 } from "@/lib/db/data/serialize";

export default async function ViewQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  try {
    const { quizId } = await params;
    
    const quiz: Quiz = await getQuiz(quizId);
    return <QuizView quiz={serializeQuiz2(quiz)} />;
  } catch (error) {
    if (error instanceof Error) {
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-4">{error.message}</p>
        </div>
      );
    }
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-4">An unexpected error occurred</p>
      </div>
    );
  }
}
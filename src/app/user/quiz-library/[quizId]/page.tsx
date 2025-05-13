"use server";

import {Quiz, QuizEntry} from "@/lib/db/data/schema";
import QuizView from "./QuizView";
import {getQuiz} from "@/lib/quizForms";
import CommentSection from "./CommentSection";
import { authenticateUser } from "@/lib/auth/auth";


import {serializeQuiz2} from "@/lib/db/data/serialize";

function serializeQuiz(quiz: Quiz) {
    return {
        _id: quiz._id.toString(),
        category: quiz.category,
        comments: quiz.comments.map((c) => ({
            createdAt: c.createdAt.toISOString(),
            ownerId: c.ownerId.toString(),
            text: c.text,
        })),
        createdAt: quiz.createdAt.toISOString(),
        description: quiz.description,
        questionsList: quiz.questionsList.map((question: QuizEntry) => ({
            question: question.question,
            answers: question.answers.map((answer) => ({
                answer: answer.answer,
                isCorrect: answer.isCorrect,
            })),
        })),
        lastStudied: quiz.lastStudied.toISOString(),
        likes: quiz.likes.map((l) => l.toString()),
        name: quiz.name,
        ownerId: quiz.ownerId.toString(),
        published: quiz.published,
    };
}

export default async function ViewQuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  try {
    const { quizId } = await params;

    
    const quiz: Quiz = await getQuiz(quizId);
      const userObject = await authenticateUser();
      //const isOwner = userObject._id.toString() === quiz.ownerId.toString();
      const serializedQuiz = serializeQuiz(quiz);
    return (
        <>
            <QuizView quiz={serializeQuiz2(quiz)} />
            <CommentSection
                quiz={serializedQuiz}
                currentUserId={userObject._id.toString()}
            />
        </>
        );

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
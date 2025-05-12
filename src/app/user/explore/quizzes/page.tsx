import QuizExplorerClient from "./QuizExplorerClient";
import { getPublicQuizzes } from "@/lib/quizForms";
import { Quiz } from "@/lib/db/data/schema";
import { serializedQuiz, serializeQuiz2 } from "@/lib/db/data/serialize";

export default async function QuizExplorerPage() {
  const quizzes: Quiz[] = await getPublicQuizzes();
  const serializedQuizzes: serializedQuiz[] = quizzes.map(serializeQuiz2);

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Explore Public Quizzes</h1>
      <QuizExplorerClient quizzes={serializedQuizzes} />
    </div>
  );
}
import QuizExplorerClient from "./QuizExplorerClient";
import { getPublicQuizzes } from "@/lib/quizForms";
import {Quiz, User} from "@/lib/db/data/schema";
import { serializedQuiz, serializeQuiz2 } from "@/lib/db/data/serialize";
import {authenticateUser} from "@/lib/auth/auth";

export default async function QuizExplorerPage() {
  const quizzes: Quiz[] = await getPublicQuizzes();
  const serializedQuizzes: serializedQuiz[] = quizzes.map(serializeQuiz2);

    const user: User = await authenticateUser();


    return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Explore Public Quizzes</h1>
      <QuizExplorerClient quizzes={serializedQuizzes} currentUserId={user._id.toString()}
      />
    </div>
  );
}
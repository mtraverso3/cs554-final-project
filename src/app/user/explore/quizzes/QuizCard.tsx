"use client";

import Link from "next/link";
import type { serializedQuiz } from "@/lib/db/data/serialize";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { toggleQuizLike } from "@/lib/quizForms";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  quiz: serializedQuiz;
  currentUserId: string;
}

export default function QuizCard({ quiz, currentUserId }: QuizCardProps) {
  const router = useRouter();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{quiz.name}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {quiz.category} &bull; Created on{" "}
          {new Date(quiz.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-2 text-muted-foreground">{quiz.description}</p>
      </CardContent>

      <CardFooter className="pt-2 flex-row justify-between">
        <Button asChild size="sm">
          <Link href={`/user/quiz-library/${quiz._id}`}>View</Link>
        </Button>

        <Button
          onClick={async () => {
            await toggleQuizLike(quiz._id);
            router.refresh();
          }}
          variant={quiz.likes.includes(currentUserId) ? "default" : "ghost"}
        >
          <ThumbsUp /> {quiz.likes.length}
        </Button>
      </CardFooter>
    </Card>
  );
}

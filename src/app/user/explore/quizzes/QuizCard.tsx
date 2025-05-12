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

interface QuizCardProps {
  quiz: serializedQuiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
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

      <CardFooter className="pt-2">
        <Button asChild size="sm">
          <Link href={`/user/quiz-library/${quiz._id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

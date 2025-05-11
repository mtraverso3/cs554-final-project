"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { QuizEntry, Quiz } from "@/lib/db/data/schema";
import { updateQuiz } from "@/lib/quizForms";

type Flashcard = { front: string; back: string };

type FlashcardDTO = {
  _id: string;
  deckId: string;
  front: string;
  back: string;
};

type QuizDTO = {
  //todo: consider changing the schema to have `Type`s and `TypeDTO`s
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lastStudied: string;
  questionsList: {
    question: string;
    answers: {
      answer: string;
      isCorrect: NonNullable<boolean | undefined>;
    }[];
  }[];
  attempts: {
    userId: string
    score: number
    date: string
  }[]
};

export default function EditDeckForm({ quiz }: { quiz: QuizDTO }) {
  const router = useRouter();
  const [name, setName] = useState(quiz.name);
  const [description, setDescription] = useState(quiz.description);
  const [questions, setQuestions] = useState<QuizEntry[]>(
    quiz.questionsList.map((question) => ({
      question: question.question,
      answers: question.answers.map((answer) => ({
        answer: answer.answer,
        isCorrect: answer.isCorrect,
      })),
    })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addAnswer = () => ({ answer: "", isCorrect: false });
  const addCard = () =>
    setQuestions((prev) => [...prev, { question: "", answers: [addAnswer()] }]);

  const updateCard = (index: number, field: keyof Flashcard, value: string) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return newQuestions;
    });
  };

  const removeCard = (index: number) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((_, i) => i !== index),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await updateQuiz(
        quiz._id.toString(),
        name,
        description,
        questions,
      );

      const parsedResult = JSON.parse(result);

      if (parsedResult.success) {
        router.push("/user/quiz-library");
      } else {
        setError(parsedResult.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Name */}
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Deck Name"
        />
      </div>

      {/* Description */}
      <div className="flex items-start gap-2">
        <Textarea
          className="flex-1 resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deck Description"
        />
      </div>

      {/* Questions grid */}
      <div className="grid grid-cols-1 gap-6">
        {questions.map((q, qIdx) => (
          <Card key={qIdx} className="relative space-y-2 p-4">
            <Input
              placeholder="Enter question"
              value={q.question}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIdx].question = e.target.value;
                setQuestions(updated);
              }}
            />

            {q.answers.map((a, aIdx) => (
              <div key={aIdx} className="flex items-center gap-2">
                <Input
                  placeholder="Answer"
                  value={a.answer}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIdx].answers[aIdx].answer = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={a.isCorrect}
                    onChange={() => {
                      const updated = [...questions];
                      updated[qIdx].answers[aIdx].isCorrect =
                        !updated[qIdx].answers[aIdx].isCorrect;
                      setQuestions(updated);
                    }}
                  />
                  Correct
                </label>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = [...questions];
                  updated[qIdx].answers.push({ answer: "", isCorrect: false });
                  setQuestions(updated);
                }}
              >
                Add Answer
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => {
                  setQuestions((prev) => prev.filter((_, i) => i !== qIdx));
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}

        <div
          onClick={addCard}
          className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed py-8 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
        >
          <Plus size={24} />
          <span className="mt-2">Add Question</span>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

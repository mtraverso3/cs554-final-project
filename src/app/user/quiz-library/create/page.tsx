"use client";
import { ChangeEvent, useState } from "react";
import { addQuiz } from "@/lib/quizForms";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuizCreateSchema, QuizInputEntry } from "@/lib/db/data/safeSchema";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Check, X } from "lucide-react";

interface QuizForm {
  name: string;
  description: string;
  category: string;
  published: boolean;
}

export default function CreateQuiz() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read query params for deck-to-quiz stuff
  const fromDeck = searchParams.get('fromDeck');
  const initialName = searchParams.get('name') || '';
  const initialDescription = searchParams.get('description') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialPublished = searchParams.get('published') === 'true';
  const questionsParam = searchParams.get('questions');
  let initialQuestions: QuizInputEntry[] = [];
  try {
    if (questionsParam) {
      const parsed = JSON.parse(questionsParam);
      initialQuestions = Array.isArray(parsed)
        ? parsed.filter(
            (q) =>
              q &&
              typeof q === "object" &&
              typeof q.question === "string" &&
              Array.isArray(q.answers)
          )
        : [];
    }
  } catch {}

  const [quizInfo, setQuizInfo] = useState<QuizForm>({
    name: fromDeck ? initialName : '',
    description: fromDeck ? initialDescription : '',
    category: fromDeck ? initialCategory : '',
    published: fromDeck ? initialPublished : false,
  });
  const [questions, setQuestions] = useState<QuizInputEntry[]>(fromDeck && initialQuestions.length > 0 ? initialQuestions : []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setQuizInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleSwitchChange = (checked: boolean) => {
    setQuizInfo((prev) => ({ ...prev, published: checked }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        answers: [
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
        ],
      },
    ]);
  };

  const addAnswerOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({
      answer: "",
      isCorrect: false,
    });
    setQuestions(updatedQuestions);
  };

  const removeAnswerOption = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].answers.length <= 2) {
      return;
    }
    updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (
    questionIndex: number,
    answerIndex: number,
    value: string,
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex].answer = value;
    setQuestions(updatedQuestions);
  };

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex].isCorrect =
      !updatedQuestions[questionIndex].answers[answerIndex].isCorrect;
    setQuestions(updatedQuestions);
  };

  const finishQuiz = async () => {
    setError(null);
    try {
      await QuizCreateSchema.validate(quizInfo, { abortEarly: false });
      if (questions.length === 0) {
        setError(["Quiz must have at least one question"]);
        return;
      }
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        setError(validationError.errors); // Or join all errors
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await addQuiz(
        quizInfo.name,
        quizInfo.description,
        quizInfo.category,
        quizInfo.published,
        questions,
      );
      router.push("/user/quiz-library");
    } catch (error) {
      console.error(error);
      setError([
        error instanceof Error ? error.message : "Error creating quiz",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded space-y-1"
          role="alert"
        >
          {Array.isArray(error) ? (
            <ul className="list-disc list-inside text-sm">
              {error.map((errMsg, idx) => (
                <li key={idx}>{errMsg}</li>
              ))}
            </ul>
          ) : (
            <span className="block sm:inline">{error}</span>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Quiz Name*
          </label>
          <Input
            name="name"
            value={quizInfo.name}
            onChange={handleInputChange}
            placeholder="Enter quiz name"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description*
          </label>
          <Textarea
            name="description"
            value={quizInfo.description}
            onChange={handleInputChange}
            placeholder="Enter quiz description"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Category*
          </label>
          <Input
            name="category"
            value={quizInfo.category}
            onChange={handleInputChange}
            placeholder="Enter quiz category (e.g., Math, Science, History)"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Public
          </Label>
          <Switch
            name="published"
            checked={quizInfo.published}
            onCheckedChange={handleSwitchChange}
            required
          />
        </div>

        {/* Questions Editor */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          <div className="space-y-6">
            {questions.map((question, qIndex) =>
              question && typeof question === "object" ? (
                <Card key={qIndex}>
                  <CardContent className="pt-6 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      <Trash2 size={16} />
                    </Button>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question {qIndex + 1}*
                      </label>
                      <Input
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        placeholder="Enter your question"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer Options*
                      </label>
                      <div className="space-y-3">
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-start gap-2">
                            <div className="flex-1">
                              <Input
                                value={answer.answer}
                                onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                placeholder={`Answer option ${aIndex + 1}`}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant={answer.isCorrect ? "default" : "outline"}
                                size="sm"
                                className={`min-w-[100px] ${answer.isCorrect ? "bg-green-600 hover:bg-green-700" : ""}`}
                                onClick={() => toggleCorrectAnswer(qIndex, aIndex)}
                              >
                                {answer.isCorrect ? (
                                  <>
                                    <Check className="mr-1" size={16} />
                                    Correct
                                  </>
                                ) : (
                                  "Mark Correct"
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeAnswerOption(qIndex, aIndex)}
                                disabled={question.answers.length <= 2}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        {question.answers.filter((a) => a.isCorrect).length > 1 && (
                          <span className="text-blue-500">
                            Multiple correct answers allowed
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAnswerOption(qIndex)}
                      >
                        <Plus className="mr-1" size={16} />
                        Add Answer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null
            )}
            <Button
              variant="outline"
              className="w-full py-6 border-dashed"
              onClick={addQuestion}
            >
              <Plus className="mr-2" size={16} />
              Add Question
            </Button>
          </div>
        </div>

        <Button onClick={finishQuiz} disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating..." : "Create Quiz"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, X, Check, ArrowLeft, AlertCircle, HelpCircle } from "lucide-react";
import { updateQuiz } from "@/lib/quizForms";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizInput, QuizInputEntry, QuizInputSchema } from "@/lib/db/data/safeSchema";
import * as Yup from "yup"; // safe for front end

// type QuizAnswer = {
//   answer: string;
//   isCorrect: boolean;
// };
//
// type QuizQuestion = {
//   question: string;
//   answers: QuizAnswer[];
// };
//
// type QuizDTO = {
//   _id: string;
//   ownerId: string;
//   name: string;
//   description: string;
//   category: string;
//   createdAt: string;
//   lastStudied: string;
//   questionsList: QuizQuestion[];
// };

export default function EditQuizForm({ quiz }: { quiz: QuizInput }) {
  const router = useRouter();
  const [name, setName] = useState(quiz.name);
  const [description, setDescription] = useState(quiz.description);
  const [category, setCategory] = useState(quiz.category);
  const [questions, setQuestions] = useState<QuizInputEntry[]>(
    quiz.questionsList.length > 0
      ? quiz.questionsList.map(question => ({
          question: question.question,
          answers: question.answers.map(answer => ({
            answer: answer.answer,
            isCorrect: answer.isCorrect
          }))
        }))
      : [{
          question: "",
          answers: [
            { answer: "", isCorrect: false },
            { answer: "", isCorrect: false },
            { answer: "", isCorrect: false },
            { answer: "", isCorrect: false }
          ]
        }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: "",
        answers: [
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false }
        ]
      }
    ]);
  };

  const addAnswerOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push({ answer: "", isCorrect: false });
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
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number, value: string) => {
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


  const handleSave = async () => {

    setSaving(true);
    const formData = {
      _id: quiz._id.toString(),
      name,
      description,
      category: quiz.category, // assuming category is not editable
      questionsList: questions,
    };
    try {
      await QuizInputSchema.validate(formData, { abortEarly: false });
      setError(null);
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        setError(validationError.errors);
        setSaving(false);
        return;
      }
    }

    try {
      const result = await updateQuiz(
        quiz._id,
        name,
        description,
        questions
      );

      const parsedResult = JSON.parse(result);

      if (parsedResult.success) {
        router.push(`/user/quiz-library/${quiz._id}`);
      } else {
        setError(parsedResult.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      setError(["An unexpected error occurred"]);
    } finally {
      setSaving(false);
      setError(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/user/quiz-library/${quiz._id}`} className="flex items-center text-gray-600 hover:text-gray-900">
          <Button variant="outline">
            <ArrowLeft className="mr-2" size={16} />
            Back to Quiz
          </Button>
        </Link>

        <h1 className="text-2xl font-bold">Edit Quiz</h1>

        <Button
          onClick={() => setShowHelp(!showHelp)}
          variant="outline"
          className="flex items-center"
        >
          <HelpCircle className="mr-2" size={16} />
          {showHelp ? "Hide Help" : "Show Help"}
        </Button>
      </div>

      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-700 mb-2 flex items-center">
            <HelpCircle className="mr-2" size={16} />
            Quiz Editing Help
          </h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1 text-sm">
            <li>Every question must have at least 2 answer options</li>
            <li>Each question must have at least one correct answer</li>
            <li>You can mark multiple answers as correct for a single question</li>
            <li>Users will need to select all correct answers to get full credit for a question</li>
            <li>To delete an answer option, click the X button next to it (minimum 2 required)</li>
            <li>To delete an entire question, click the trash icon in the top-right corner</li>
          </ul>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded space-y-1" role="alert">
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
        {/* Quiz Details */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Quiz Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quiz Name*
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter quiz name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter quiz category (e.g., Math, Science, History)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Questions</h2>

          <div className="space-y-6">
            {questions.map((question, qIndex) => (
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
                              className={`min-w-[100px] ${answer.isCorrect ? 'bg-green-600 hover:bg-green-700' : ''}`}
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
                      {question.answers.filter(a => a.isCorrect).length > 1 && (
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
            ))}

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

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/user/quiz-library/${quiz._id}`}>
              Cancel
            </Link>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Quiz"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Home,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { addQuizAttempt } from "@/lib/quizForms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type QuizAnswer = {
  answer: string;
  isCorrect: boolean;
};

type QuizQuestion = {
  question: string;
  answers: QuizAnswer[];
};

type QuizDTO = {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lastStudied: string;
  questionsList: QuizQuestion[];
};

type QuizResults = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  score: number;
  timeTaken: number;
};

export default function QuizStudy({ quiz }: { quiz: QuizDTO }) {

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndices, setSelectedAnswerIndices] = useState<Set<number>>(new Set());
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Set<number>[]>(
    new Array(quiz.questionsList.length).fill(null).map(() => new Set())
  );
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timer, setTimer] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<{ original: number; shuffled: number }[][]>(
    quiz.questionsList.map((q) =>
      q.answers.map((_, index) => ({ original: index, shuffled: index }))
    )
  );

  const currentQuestion = quiz.questionsList[currentQuestionIndex];

  useEffect(() => {
    const shuffled = quiz.questionsList.map((q) => {
      const indices = q.answers.map((_, i) => ({ original: i, shuffled: i }));
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i].shuffled, indices[j].shuffled] = [indices[j].shuffled, indices[i].shuffled];
      }
      return indices;
    });
    setShuffledAnswers(shuffled);
  }, [quiz.questionsList]);

  useEffect(() => {
    if (quizCompleted) return;
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [quizCompleted, startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getIsMultipleAnswersQuestion = () =>
    currentQuestion.answers.filter((a) => a.isCorrect).length > 1;
  const isMultipleAnswersQuestion = getIsMultipleAnswersQuestion();

  const [selectedSingleAnswer, setSingleSelectedAnswer] = useState<number | null>(null);

  const getShuffledAnswers = (idx: number) => {
    return shuffledAnswers[idx]
      .map((map) => ({
        ...quiz.questionsList[idx].answers[map.original],
        originalIndex: map.original,
        shuffledIndex: map.shuffled,
      }))
      .sort((a, b) => a.shuffledIndex - b.shuffledIndex);
  };

  const handleAnswerSelect = (shuffledIdx: number) => {
    if (isAnswerSubmitted) return;
    if (isMultipleAnswersQuestion) {
      const copy = new Set(selectedAnswerIndices);
      if (copy.has(shuffledIdx)) {
        copy.delete(shuffledIdx);
      } else {
        copy.add(shuffledIdx);
      }
      setSelectedAnswerIndices(copy);
    } else {
      setSingleSelectedAnswer(shuffledIdx);
      setSelectedAnswerIndices(new Set());
    }
  };

  const handleSubmitAnswer = () => {
    if (!isAnswerSubmitted) {
      if (isMultipleAnswersQuestion && selectedAnswerIndices.size === 0) return;
      if (!isMultipleAnswersQuestion && selectedSingleAnswer === null) return;

      setIsAnswerSubmitted(true);

      const originalSet = new Set<number>();
      if (isMultipleAnswersQuestion) {
        selectedAnswerIndices.forEach((sh) => {
          const orig = shuffledAnswers[currentQuestionIndex].find((m) => m.shuffled === sh)?.original;
          if (orig !== undefined) {
            originalSet.add(orig);
          }
        });
      } else {
        const orig = shuffledAnswers[currentQuestionIndex].find((m) => m.shuffled === selectedSingleAnswer!)?.original;
        if (orig !== undefined) {
          originalSet.add(orig);
        }
      }

      const copy = [...userAnswers];
      copy[currentQuestionIndex] = originalSet;
      setUserAnswers(copy);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex === quiz.questionsList.length - 1) {
      completeQuiz();
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswerIndices(new Set());
      setSingleSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((i) => i - 1);

    const prev = userAnswers[currentQuestionIndex - 1];
    const multi =
      quiz.questionsList[currentQuestionIndex - 1].answers.filter((a) => a.isCorrect).length > 1;

    if (prev.size) {
      if (multi) {
        const rev = new Set<number>();
        prev.forEach((orig) => {
          const sh = shuffledAnswers[currentQuestionIndex - 1].find((m) => m.original === orig)?.shuffled;
          if (sh !== undefined) {
            rev.add(sh);
          }
        });
        setSelectedAnswerIndices(rev);
        setSingleSelectedAnswer(null);
      } else {
        const orig = Array.from(prev)[0];
        const sh = shuffledAnswers[currentQuestionIndex - 1].find((m) => m.original === orig)?.shuffled;
        if (sh !== undefined) {
          setSingleSelectedAnswer(sh);
        }
        setSelectedAnswerIndices(new Set());
      }
      setIsAnswerSubmitted(true);
    } else {
      setSelectedAnswerIndices(new Set());
      setSingleSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    }
  };

  const handleSkip = () => {
    nextQuestion();
  };

  const calculateResults = (): QuizResults => {
    const total = quiz.questionsList.length;
    let correct = 0,
      incorrect = 0,
      skipped = 0;
    userAnswers.forEach((ans, qi) => {
      if (!ans.size) return skipped++;
      const correctSet = new Set<number>();
      quiz.questionsList[qi].answers.forEach((a, i) => a.isCorrect && correctSet.add(i));
      const hit = Array.from(ans).filter((i) => correctSet.has(i)).length;
      if (hit === correctSet.size && ans.size === correctSet.size) correct++;
      else incorrect++;
    });
    return {
      totalQuestions: total,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      skippedQuestions: skipped,
      score: Math.round((correct / total) * 100),
      timeTaken: Math.floor((Date.now() - startTime) / 1000),
    };
  };

  const completeQuiz = async () => {
    const res = calculateResults();
    setResults(res);
    setQuizCompleted(true);
    try {
      await addQuizAttempt(quiz._id.toString(), res.score);
      
    } catch (e) {
      console.error(e);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndices(new Set());
    setSingleSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setUserAnswers(new Array(quiz.questionsList.length).fill(null).map(() => new Set()));
    setQuizCompleted(false);
    setStartTime(Date.now());
    setTimer(0);
    setResults(null);

    const shuffled = quiz.questionsList.map((q) => {
      const idx = q.answers.map((_, i) => ({ original: i, shuffled: i }));
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i].shuffled, idx[j].shuffled] = [idx[j].shuffled, idx[i].shuffled];
      }
      return idx;
    });
    setShuffledAnswers(shuffled);
  };

  if (!quiz.questionsList.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
        <p className="text-gray-600 mb-6">This quiz doesn&apos;t have any questions yet.</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href={`/user/quiz-library/${quiz._id}/edit`}>Add Questions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/user/quiz-library">Back to Library</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-4 py-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/user/quiz-library/${quiz._id}`}>
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Link>
          </Button>
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">{quiz.name}</h1>
            <div className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quiz.questionsList.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-1" />
              {formatTime(timer)}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
              <Settings size={16} />
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/quiz-library">
                <Home size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-grow container mx-auto px-4 py-8">
        {/* settings */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Quiz Settings</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Button
                onClick={() => {
                  restartQuiz();
                  setShowSettings(false);
                }}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="mr-2" size={16} />
                Restart Quiz
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSettings(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {!quizCompleted ? (
          <div className="max-w-3xl mx-auto">
            {/* progess bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz.questionsList.length) * 100}%`,
                }}
              />
            </div>

            {/* questions */}
            <h2 className="text-xl font-medium mb-4">{currentQuestion.question}</h2>
            {isMultipleAnswersQuestion && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Select all correct answers
              </div>
            )}

            {/* answers */}
            <div className="space-y-4 mb-8">
              {getShuffledAnswers(currentQuestionIndex).map((ans, idx) => {
                const selected = isMultipleAnswersQuestion
                  ? selectedAnswerIndices.has(ans.shuffledIndex)
                  : selectedSingleAnswer === ans.shuffledIndex;
                const correctMark = isAnswerSubmitted && ans.isCorrect;
                const wrongMark = isAnswerSubmitted && selected && !ans.isCorrect;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(ans.shuffledIndex)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-4 rounded-lg border transition ${
                      selected
                        ? correctMark
                          ? "bg-green-100 border-green-500"
                          : wrongMark
                          ? "bg-red-100 border-red-500"
                          : "bg-primary/10 border-primary"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      {isMultipleAnswersQuestion ? (
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded mr-3 ${
                            selected
                              ? correctMark
                                ? "bg-green-500 text-white"
                                : wrongMark
                                ? "bg-red-500 text-white"
                                : "bg-primary text-white"
                              : "border-2 border-gray-300"
                          }`}
                        >
                          {selected && !isAnswerSubmitted ? (
                            <Check size={16} />
                          ) : isAnswerSubmitted && ans.isCorrect ? (
                            <Check size={16} />
                          ) : isAnswerSubmitted && selected && !ans.isCorrect ? (
                            <X size={16} />
                          ) : null}
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                            selected
                              ? correctMark
                                ? "bg-green-500 text-white"
                                : wrongMark
                                ? "bg-red-500 text-white"
                                : "bg-primary text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                      )}
                      <span>{ans.answer}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* navigation */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="mr-2" size={16} />
                Previous
              </Button>

              {!isAnswerSubmitted ? (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleSkip}>
                    Skip
                  </Button>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={
                      isMultipleAnswersQuestion
                        ? selectedAnswerIndices.size === 0
                        : selectedSingleAnswer === null
                    }
                  >
                    Submit Answer
                  </Button>
                </div>
              ) : (
                <Button onClick={nextQuestion}>
                  {currentQuestionIndex === quiz.questionsList.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}
                  <ChevronRight className="ml-2" size={16} />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* results */
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
            <p className="text-xl mb-6">You completed the quiz in {formatTime(results?.timeTaken || 0)}</p>
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="text-5xl font-bold mb-4">{results?.score}%</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="text-green-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold text-green-600">{results?.correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <X className="text-red-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold text-red-600">{results?.incorrectAnswers}</div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <AlertCircle className="text-gray-500 mx-auto mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-600">{results?.skippedQuestions}</div>
                    <div className="text-sm text-gray-600">Skipped</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={restartQuiz}>
                <RefreshCw className="mr-2" size={16} />
                Retry Quiz
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/user/quiz-library/${quiz._id}`}>View Quiz Details</Link>
              </Button>
              <Button asChild>
                <Link href="/user/quiz-library">Back to Library</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

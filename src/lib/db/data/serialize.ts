import { Deck, Quiz, QuizEntry, User } from "@/lib/db/data/schema";
import { ObjectId } from "mongodb";

export function serializeDeck(deck: Deck): string {
  return JSON.stringify({
    _id: deck._id.toString(),
    category: deck.category,
    comments: deck.comments.map((c) => ({
      createdAt: c.createdAt.toISOString(),
      ownerId: c.ownerId.toString(),
      text: c.text,
    })),
    createdAt: deck.createdAt.toISOString(),
    description: deck.description,
    flashcardList: deck.flashcardList.map((f) => ({
      _id: f._id.toString(),
      deckId: f.deckId.toString(),
      front: f.front,
      back: f.back,
    })),
    lastStudied: deck.lastStudied.toISOString(),
    likes: deck.likes.map((l) => l.toString()),
    name: deck.name,
    ownerId: deck.ownerId.toString(),
    studyProgress: {
      currentCardIndex: deck.studyProgress.currentCardIndex,
      isCompleted: deck.studyProgress.isCompleted,
      isReviewMode: deck.studyProgress.isReviewMode,
      knownCardIds: deck.studyProgress.knownCardIds,
      lastPosition: deck.studyProgress.lastPosition,
      reviewingCardIds: deck.studyProgress.reviewingCardIds,
      studyTime: deck.studyProgress.studyTime,
      unknownCardIds: deck.studyProgress.unknownCardIds,
    },
    published: deck.published,
  });
}

export function serializeDeck2(deck: Deck): SerializedDeck {
  return {
    _id: deck._id.toString(),
    category: deck.category,
    comments: deck.comments.map((c) => ({
      createdAt: c.createdAt.toISOString(),
      ownerId: c.ownerId.toString(),
      text: c.text,
    })),
    createdAt: deck.createdAt.toISOString(),
    description: deck.description,
    flashcardList: deck.flashcardList.map((f) => ({
      _id: f._id.toString(),
      deckId: f.deckId.toString(),
      front: f.front,
      back: f.back,
    })),
    lastStudied: deck.lastStudied.toISOString(),
    likes: deck.likes.map((l) => l.toString()),
    name: deck.name,
    ownerId: deck.ownerId.toString(),
    studyProgress: {
      currentCardIndex: deck.studyProgress.currentCardIndex,
      isCompleted: deck.studyProgress.isCompleted,
      isReviewMode: deck.studyProgress.isReviewMode,
      knownCardIds: deck.studyProgress.knownCardIds,
      lastPosition: deck.studyProgress.lastPosition,
      reviewingCardIds: deck.studyProgress.reviewingCardIds,
      studyTime: deck.studyProgress.studyTime,
      unknownCardIds: deck.studyProgress.unknownCardIds,
    },
    published: deck.published,
  };
}

export type SerializedDeck = {
  _id: string;
  category: string;
  comments: Array<{
    createdAt: string;
    ownerId: string;
    text: string;
  }>;
  createdAt: string;
  description: string;
  flashcardList: Array<{
    _id: string;
    deckId: string;
    front: string;
    back: string;
  }>;
  lastStudied: string;
  likes: string[];
  name: string;
  ownerId: string;
  studyProgress: {
    currentCardIndex: number;
    isCompleted: boolean;
    isReviewMode: boolean;
    knownCardIds: string[];
    lastPosition: number;
    reviewingCardIds: string[];
    studyTime: number;
    unknownCardIds: string[];
  };
  published: boolean;
};

export function deserializeDeck(serialized: string): Deck {
  const data = JSON.parse(serialized) as SerializedDeck;
  return {
    _id: new ObjectId(data._id),
    category: data.category,
    comments: data.comments.map((c) => ({
      createdAt: new Date(c.createdAt),
      ownerId: new ObjectId(c.ownerId),
      text: c.text,
    })),
    createdAt: new Date(data.createdAt),
    description: data.description,
    flashcardList: data.flashcardList.map((f) => ({
      _id: new ObjectId(f._id),
      deckId: new ObjectId(f.deckId),
      front: f.front,
      back: f.back,
    })),
    lastStudied: new Date(data.lastStudied),
    likes: data.likes.map((l: string) => new ObjectId(l)),
    name: data.name,
    ownerId: new ObjectId(data.ownerId),
    studyProgress: {
      currentCardIndex: data.studyProgress.currentCardIndex,
      isCompleted: data.studyProgress.isCompleted,
      isReviewMode: data.studyProgress.isReviewMode,
      knownCardIds: data.studyProgress.knownCardIds,
      lastPosition: data.studyProgress.lastPosition,
      reviewingCardIds: data.studyProgress.reviewingCardIds,
      studyTime: data.studyProgress.studyTime,
      unknownCardIds: data.studyProgress.unknownCardIds,
    },
    published: data.published,
  };
}

export function serializeQuiz(quiz: Quiz): string {
  return JSON.stringify({
    ...quiz,
    _id: quiz._id.toString(),
    ownerId: quiz.ownerId.toString(),
    createdAt: quiz.createdAt.toISOString(),
    lastStudied: quiz.lastStudied.toISOString(),
    attempts: quiz.attempts.map((a) => ({
      userId: a.userId.toString(),
      score: a.score,
      date: a.date.toISOString(),
    })),
    questionsList: quiz.questionsList.map((q) => ({
      question: q.question,
      answers: q.answers.map((a) => ({
        answer: a.answer,
        isCorrect: a.isCorrect,
      })),
    })),
  });
}
export function serializeQuiz2(quiz: Quiz) {
  return {
    _id: quiz._id.toString(),
    ownerId: quiz.ownerId.toString(),
    name: quiz.name,
    description: quiz.description,
    category: quiz.category,
    createdAt: quiz.createdAt
      ? quiz.createdAt.toISOString()
      : new Date().toISOString(),
    lastStudied: quiz.lastStudied
      ? quiz.lastStudied.toISOString()
      : new Date().toISOString(),
    questionsList: quiz.questionsList.map((question: QuizEntry) => ({
      question: question.question,
      answers: question.answers.map((answer) => ({
        answer: answer.answer,
        isCorrect: answer.isCorrect,
      })),
    })),
  };
}

export type serializedQuiz = {
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
      isCorrect: boolean;
    }[];
  }[];
};

export function deserializeQuiz(cached: string): Quiz {
  const raw = JSON.parse(cached) as {
    _id: string;
    ownerId: string;
    name: string;
    description: string;
    category: string;
    published: boolean;
    createdAt: string;
    lastStudied: string;
    attempts: {
      userId: string;
      score: number;
      date: string;
    }[];
    questionsList: {
      question: string;
      answers: {
        answer: string;
        isCorrect: boolean;
      }[];
    }[];
  };

  return {
    ...raw,
    _id: new ObjectId(raw._id),
    ownerId: new ObjectId(raw.ownerId),
    createdAt: new Date(raw.createdAt),
    lastStudied: new Date(raw.lastStudied),
    attempts: raw.attempts.map((a) => ({
      userId: new ObjectId(a.userId),
      score: a.score,
      date: new Date(a.date),
    })),
    questionsList: raw.questionsList.map((q) => ({
      question: q.question,
      answers: q.answers.map((a) => ({
        answer: a.answer,
        isCorrect: a.isCorrect,
      })),
    })),
  };
}

export function serializeUser(user: User): string {
  return JSON.stringify({
    _id: user._id.toString(),
    email: user.email,
    sub: user.sub,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}

export function deserializeUser(serialized: string): User {
  const data = JSON.parse(serialized);
  return {
    _id: new ObjectId(data._id),
    email: data.email,
    sub: data.sub,
    firstName: data.firstName,
    lastName: data.lastName,
    profilePicture: data.profilePicture
  };
}

import {
  Quiz,
  QuizSchema,
  QuizEntrySchema,
  QuizAttempt,
  QuizAttemptSchema,
  QuizEntry,
} from "@/lib/db/data/schema";
import { ObjectId } from "mongodb";
import {quizzes} from "@/lib/db/config/mongoCollections";
import { getUserById } from "@/lib/db/data/users";
import { Allan, Beth_Ellen } from "next/font/google";

export async function createQuiz(
  name: string,
  description: string,
  category: string,
  ownerId: string,
): Promise<Quiz> {
  // Check if the owner exists
  await getUserById(ownerId);

  let newQuiz: Quiz = {
    _id: new ObjectId(),
    name: name,
    description: description,
    ownerId: new ObjectId(ownerId),
    createdAt: new Date(),
    lastStudied: new Date(),
    attempts: [],
    category: category,
    questionsList: [],
  };

  newQuiz = await QuizSchema.validate(newQuiz);

  const quizCollection = await quizzes();
  const insertInfo = await quizCollection.insertOne(newQuiz);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Error inserting new quiz");
  }

  return newQuiz;
}

export async function getQuizById(id: string): Promise<Quiz> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId");
  }

  const quizCollection = await quizzes();
  let quiz;
  try {
    quiz = await quizCollection.findOne({
      _id: new ObjectId(id),
    });
  } catch {
    throw new Error("Failed to get quiz");
  }
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  return quiz;
}

export async function addQuestionToQuiz(
  quizId: string,
  entry: QuizEntry,
): Promise<Quiz> {

  await getQuizById(quizId);

  entry = await QuizEntrySchema.validate(entry)

  const quizCollection = await quizzes();

  const updatedQuiz = await quizCollection.findOneAndUpdate(
    { _id: new ObjectId(quizId) },
    { $push: { questionsList: entry } },
    { returnDocument: "after" },
  );

  if (!updatedQuiz) {
    throw new Error("Failed to update quiz");
  }

  return updatedQuiz.value as Quiz;
}

export async function getQuizzesByUserId(
    userId: string,
): Promise<Quiz[]> {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const quizCollection = await quizzes();
  let quizList;
  try {
    quizList = await quizCollection
        .find({ ownerId: new ObjectId(userId) })
        .toArray();
  } catch {
    throw new Error("Failed to get quizzes");
  }
  if (!quizList) {
    throw new Error("Decks not found");
  }
  return quizList;
}

export async function addQuizAttempt(quizId: string, userId: string, score: number): Promise<QuizAttempt> {
  const newAttempt = {userId: new ObjectId(userId), score: score, date: new Date()};
  const finalAttempt = await QuizAttemptSchema.validate(newAttempt);
  const quizCollection = await quizzes();

  const updatedQuiz = await quizCollection.findOneAndUpdate(
    { _id: new ObjectId(quizId) },
    { $push: { attempts: finalAttempt } },
    { returnDocument: "after" },
  );

  if (!updatedQuiz) {
    throw new Error("Failed to add attempt");
  }
  return finalAttempt as QuizAttempt;
}

/*Takes in a quizId, and returns an object whose keys are all the users who have attempted that quiz,
and values of that user's attempts.*/
export async function separateAttemptsByUser(quizId: string): Promise<{[k: string]: Array<QuizAttempt>}> {
  const theQuiz = await getQuizById(quizId);
  const attempts = theQuiz.attempts;
  let allAttempts: {[k: string]: Array<QuizAttempt>} = {};
  for(let a = 0; a < attempts.length; a++) {
    const attempt = attempts[a];
    const userId = attempt.userId.toString();
    if(!(userId in allAttempts)) {
      allAttempts[userId] = [];
    }
    allAttempts[userId].push(attempt);
  }
  return allAttempts;
}

/*Returns every attempt of the quiz by the user. If userId is not provided, returns all attempts.*/
export async function getAttemptsByUser(quizId: string, userId?: string): Promise<Array<QuizAttempt>> {
  if(!userId) {
    const theQuiz = await getQuizById(quizId);
    return theQuiz.attempts;
  }
  const attemptsObject = await separateAttemptsByUser(quizId);
  if(!(userId in attemptsObject)) {
    return [];
  }
  return attemptsObject[userId];
}

export function average(attempts: Array<QuizAttempt>): number {
  const len = attempts.length;
  //It might be better to return null here because all the other functions do that
  if(len == 0) {
      return 0;
  }
  let combinedScore = 0;
  for(let a = 0; a < len; a++) {
    combinedScore += attempts[a].score;
  }
  return combinedScore / len;
}
export function best(attempts: Array<QuizAttempt>): QuizAttempt {
  const len = attempts.length;
  //Typecript does not let me return null, so an error has to be thrown if there are no valid attempts
  if(len == 0) {
    throw "There are no valid attempts.";
  }
  let best = attempts[0];
  for(let a = 1; a < len; a++) {
    const attempt = attempts[a];
    if(attempt.score > best.score) {
      best = attempt;
    }
  }
  return best;
}
export function mostRecent(attempts: Array<QuizAttempt>): QuizAttempt {
  const len = attempts.length;
  if(len == 0) {
    throw "There are no valid attempts.";
  }
  //return array[len - 1];
  /*In theory, attempts arrays would always be sorted from least to most recent, but I don't think we 
  should assume that*/
  let mostRecent = attempts[0];
  for(let a = 1; a < len; a++) {
    const attempt = attempts[a];
    if(attempt.date > mostRecent.date) {
      mostRecent = attempt;
    }
  }
  return mostRecent;
}
export async function averageByUser(quizId: string): Promise<{[k: string]: number}> {
  const allAttempts = await separateAttemptsByUser(quizId);
  let averages: {[k: string]: number} = {};
  const theKeys = Object.keys(allAttempts);
  for(let a = 0; a < theKeys.length; a++) {
    const key = theKeys[a];
    averages[key] = average(allAttempts[key]);
  }
  return averages;
}
export async function bestByUser(quizId: string): Promise<{[k: string]: QuizAttempt}> {
  const allAttempts = await separateAttemptsByUser(quizId);
  let bestAttempts: {[k: string]: QuizAttempt} = {};
  const theKeys = Object.keys(allAttempts);
  for(let a = 0; a < theKeys.length; a++) {
    const key = theKeys[a];
    bestAttempts[key] = best(allAttempts[key]);
  }
  return bestAttempts;
}
export async function recentByUser(quizId: string): Promise<{[k: string]: QuizAttempt}> {
  const allAttempts = await separateAttemptsByUser(quizId);
  let recentAttempts: {[k: string]: QuizAttempt} = {};
  const theKeys = Object.keys(allAttempts);
  for(let a = 0; a < theKeys.length; a++) {
    const key = theKeys[a];
    recentAttempts[key] = mostRecent(allAttempts[key]);
  }
  return recentAttempts;
}
//Returns the average score for that user's attempts, or all attempts if userId is not provided.
export async function getAverageScore(quizId: string, userId?: string): Promise<number> {
  const attempts = await getAttemptsByUser(quizId, userId);
  return average(attempts);
}

export async function getBestAttempt(quizId: string, userId?: string): Promise<QuizAttempt> {
  const attempts = await getAttemptsByUser(quizId, userId);
  return best(attempts);
}
export async function getMostRecentAttempt(quizId: string, userId?: string): Promise<QuizAttempt> {
  const attempts = await getAttemptsByUser(quizId, userId);
  return mostRecent(attempts);
};

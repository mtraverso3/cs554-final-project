import {
  Comment,
  CommentSchema,
  Quiz,
  QuizAttempt,
  QuizAttemptSchema,
  QuizEntry,
  QuizEntrySchema,
  QuizSchema,
} from "@/lib/db/data/schema";
import { ObjectId } from "mongodb";
import { quizzes } from "@/lib/db/config/mongoCollections";
import { getUserById } from "@/lib/db/data/users";
import { redisClient } from "@/lib/db/config/redisConnection";
import { deserializeQuiz, serializeQuiz } from "@/lib/db/data/serialize";
import { generateEmbedding } from "@/lib/ollama/ollama";
import { upsertEmbedding } from "@/lib/db/data/embeddings";

export async function createQuiz(
  name: string,
  description: string,
  category: string,
  ownerId: string,
  published: boolean,
  questionsList: QuizEntry[] = [],
): Promise<Quiz> {
  // Check if the owner exists
  const quizId = new ObjectId();
  try {
    await getUserById(ownerId);

    // Validate questionsList
    const validatedQuestions = await Promise.all(
      questionsList.map((q) => QuizEntrySchema.validateSync(q)),
    );
    let newQuiz: Quiz = {
      _id: quizId,
      name: name,
      description: description,
      ownerId: new ObjectId(ownerId),
      createdAt: new Date(),
      lastStudied: new Date(),
      attempts: [],
      comments: [],
      likes: [],
      category: category,
      published: published,
      questionsList: validatedQuestions,
    };

    newQuiz = await QuizSchema.validate(newQuiz);

    const quizCollection = await quizzes();
    const insertInfo = await quizCollection.insertOne(newQuiz);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw new Error("Error inserting new quiz");
    }

    // Async embedding generation (do not await)
    (async () => {
      try {
        const content = [
          newQuiz.name,
          newQuiz.description,
          ...newQuiz.questionsList.map(
            (q) => `${q.question} ${q.answers.map((a) => a.answer).join(" ")}`,
          ),
        ].join("\n");
        const vector = await generateEmbedding(content);
        await upsertEmbedding({
          refId: newQuiz._id,
          refType: "quiz",
          vector,
          content,
        });
      } catch (e) {
        console.error("Embedding generation failed for quiz", newQuiz._id, e);
      }
    })();
    return newQuiz;
  } finally {
    const client = await redisClient();
    const cacheKey = `quiz:${quizId}`;
    const userCacheKey = `quizzes:user:${ownerId}`;
    await client.del(cacheKey);
    await client.del(userCacheKey);
  }
}

export async function getQuizById(id: string): Promise<Quiz> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId");
  }

  const client = await redisClient();

  const cacheKey = `quiz:${id}`;
  const cachedQuiz = await client.get(cacheKey);
  if (cachedQuiz) {
    return deserializeQuiz(cachedQuiz);
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
  await client.set(cacheKey, serializeQuiz(quiz), { EX: 3600 });

  return quiz;
}

export async function addQuestionToQuiz(
  quizId: string,
  entry: QuizEntry,
): Promise<Quiz> {
  await getQuizById(quizId);

  entry = await QuizEntrySchema.validate(entry);

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

export async function getQuizzesByUserId(userId: string): Promise<Quiz[]> {
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid ObjectId");
  }

  const client = await redisClient();
  const cacheKey = `quizzes:user:${userId}`;
  const cached = await client.get(cacheKey);
  if (cached) {
    const serializedArray: string[] = JSON.parse(cached);
    return serializedArray.map((s) => deserializeQuiz(s));
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
    throw new Error("Quizzes not found");
  }
  const serializedList = quizList.map(serializeQuiz);
  await client.set(cacheKey, JSON.stringify(serializedList), { EX: 3600 });
  return quizList;
}

export async function updateQuiz(
  quizId: string,
  userId: string,
  name: string,
  description: string,
  questions: QuizEntry[],
  published: boolean,
): Promise<string> {
  try {
    const quiz: Quiz = await getQuizById(quizId);
    if (!quiz.ownerId.equals(new ObjectId(userId))) {
      throw new Error("Not authorized to update this quiz");
    }

    const questionsList: QuizEntry[] = questions.map((question) => ({
      question: question.question,
      answers: question.answers.map((answer) => ({
        answer: answer.answer,
        isCorrect: answer.isCorrect,
      })),
    }));

    const quizzesCollection = await quizzes();
    await quizzesCollection.updateOne(
      { _id: new ObjectId(quizId) },
      {
        $set: {
          name,
          description,
          questionsList,
          published,
        },
      },
    );

    // Async embedding update (do not await)
    (async () => {
      try {
        const content = [
          name,
          description,
          ...questions.map(
            (q) => `${q.question} ${q.answers.map((a) => a.answer).join(" ")}`,
          ),
        ].join("\n");
        const vector = await generateEmbedding(content);
        await upsertEmbedding({
          refId: new ObjectId(quizId),
          refType: "quiz",
          vector,
          content,
        });
      } catch (e) {
        console.error("Embedding update failed for quiz", quizId, e);
      }
    })();
    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    const client = await redisClient();
    const cacheKey = `quiz:${quizId}`;
    const userCacheKey = `quizzes:user:${userId}`;
    await client.del(cacheKey);
    await client.del(userCacheKey);
  }
}

export async function deleteQuiz(
  quizId: string,
  userId: string,
): Promise<string> {
  try {
    const quiz: Quiz = await getQuizById(quizId);
    if (!quiz.ownerId.equals(new ObjectId(userId))) {
      throw new Error("Not authorized to delete this quiz");
    }

    const quizzesCollection = await quizzes();
    const deleteResult = await quizzesCollection.deleteOne({
      _id: new ObjectId(quizId),
    });

    if (deleteResult.deletedCount === 0) {
      throw new Error("Quiz could not be deleted");
    }

    return JSON.stringify({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    const client = await redisClient();
    const cacheKey = `quiz:${quizId}`;
    const userCacheKey = `quizzes:user:${userId}`;
    await client.del(cacheKey);
    await client.del(userCacheKey);
  }
}

export async function addQuizAttempt(
  quizId: string,
  userId: string,
  score: number,
): Promise<QuizAttempt> {
  const newAttempt = {
    userId: new ObjectId(userId),
    score: score,
    date: new Date(),
  };
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
export async function separateAttemptsByUser(
  quizId: string,
): Promise<{ [k: string]: Array<QuizAttempt> }> {
  const theQuiz = await getQuizById(quizId);
  const attempts = theQuiz.attempts;
  //There could be typing errors with the type here, not sure
  const allAttempts: { [k: string]: Array<QuizAttempt> } = {};
  for (let a = 0; a < attempts.length; a++) {
    const attempt = attempts[a];
    //This loop could have errors
    const userId = attempt.userId.toString();
    if (!(userId in allAttempts)) {
      allAttempts[userId] = [];
    }
    allAttempts[userId].push(attempt);
  }
  return allAttempts;
}

/*Returns every attempt of the quiz by the user. If userId is not provided, returns all attempts.*/
export async function getAttemptsByUser(
  quizId: string,
  userId?: string,
): Promise<Array<QuizAttempt>> {
  if (!userId) {
    const theQuiz = await getQuizById(quizId);
    return theQuiz.attempts;
  }
  /*This code is not working*/
  console.log("The problem is probably im quizzes.ts, most likely in the function getAttemptsByUser or separateAttemptsByUser.");
  const attemptsObject = await separateAttemptsByUser(quizId);
  //I would suggest looking at if attemptsObject is correct
  //It should have a bunch of key-value pairs where the key is the userId in a string
  //and the value is an array of their attempts
  //If you have attempted this quiz on your account, there should be a pair with your userID
  //and your attempts, and "return []" should not get called

  if (!(userId in attemptsObject)) {
    return [];
  }
  return attemptsObject[userId];
}

export function average(attempts: Array<QuizAttempt>): number {
  const len = attempts.length;
  //It might be better to return null here because all the other functions do that
  if (len == 0) {
    return 0;
  }
  let combinedScore = 0;
  for (let a = 0; a < len; a++) {
    combinedScore += attempts[a].score;
  }
  return combinedScore / len;
}

export function best(attempts: Array<QuizAttempt>): QuizAttempt {
  const len = attempts.length;
  //Typecript does not let me return null, so an error has to be thrown if there are no valid attempts
  if (len == 0) {
    throw "There are no valid attempts.";
  }
  let best = attempts[0];
  for (let a = 1; a < len; a++) {
    const attempt = attempts[a];
    if (attempt.score > best.score) {
      best = attempt;
    }
  }
  return best;
}

export function mostRecent(attempts: Array<QuizAttempt>): QuizAttempt {
  const len = attempts.length;
  if (len == 0) {
    throw "There are no valid attempts.";
  }
  //return array[len - 1];
  /*In theory, attempts arrays would always be sorted from least to most recent, but I don't think we 
  should assume that*/
  let mostRecent = attempts[0];
  for (let a = 1; a < len; a++) {
    const attempt = attempts[a];
    if (attempt.date > mostRecent.date) {
      mostRecent = attempt;
    }
  }
  return mostRecent;
}

export async function averageByUser(
  quizId: string,
): Promise<{ [k: string]: number }> {
  const allAttempts = await separateAttemptsByUser(quizId);
  const averages: { [k: string]: number } = {};
  const theKeys = Object.keys(allAttempts);
  for (let a = 0; a < theKeys.length; a++) {
    const key = theKeys[a];
    averages[key] = average(allAttempts[key]);
  }
  return averages;
}

export async function bestByUser(
  quizId: string,
): Promise<{ [k: string]: QuizAttempt }> {
  const allAttempts = await separateAttemptsByUser(quizId);
  const bestAttempts: { [k: string]: QuizAttempt } = {};
  const theKeys = Object.keys(allAttempts);
  for (let a = 0; a < theKeys.length; a++) {
    const key = theKeys[a];
    bestAttempts[key] = best(allAttempts[key]);
  }
  return bestAttempts;
}

export async function recentByUser(
  quizId: string,
): Promise<{ [k: string]: QuizAttempt }> {
  const allAttempts = await separateAttemptsByUser(quizId);
  const recentAttempts: { [k: string]: QuizAttempt } = {};
  const theKeys = Object.keys(allAttempts);
  for (let a = 0; a < theKeys.length; a++) {
    const key = theKeys[a];
    recentAttempts[key] = mostRecent(allAttempts[key]);
  }
  return recentAttempts;
}

//Returns the average score for that user's attempts, or all attempts if userId is not provided.
export async function getAverageScore(
  quizId: string,
  userId?: string,
): Promise<number> {
  const attempts = await getAttemptsByUser(quizId, userId);
  return average(attempts);
}

export async function getBestAttempt(
  quizId: string,
  userId?: string,
): Promise<QuizAttempt> {
  const attempts = await getAttemptsByUser(quizId, userId);
  return best(attempts);
}

export async function getMostRecentAttempt(
  quizId: string,
  userId?: string,
): Promise<QuizAttempt> {
  const attempts = await getAttemptsByUser(quizId, userId);
  return mostRecent(attempts);
}

export async function toggleLike(
  quizId: string,
  userId: string,
): Promise<Quiz> {
  try {
    if (!ObjectId.isValid(quizId) || !ObjectId.isValid(userId)) {
      throw new Error("Invalid ObjectId");
    }

    const quizCollection = await quizzes();
    const quiz: Quiz = await getQuizById(quizId);

    const userObjectId = new ObjectId(userId);
    if (quiz.likes.some((id) => new ObjectId(id).equals(userObjectId))) {
      console.log("Removing like");
      await quizCollection.updateOne(
        { _id: new ObjectId(quizId) },
        { $pull: { likes: userObjectId.toString() } },
      );
    } else {
      console.log("Adding like");
      await quizCollection.updateOne(
        { _id: new ObjectId(quizId) },
        { $addToSet: { likes: userObjectId.toString() } },
      );
    }

    return getQuizById(quizId);
  } finally {
    const client = await redisClient();
    await client.del(`quiz:${quizId}`);
    await client.del(`quizzes:user:${userId}`);
  }
}

export async function addComment(
  quizId: string,
  userId: string,
  text: string,
): Promise<Quiz> {
  try {
    if (!ObjectId.isValid(quizId) || !ObjectId.isValid(userId)) {
      throw new Error("Invalid ObjectId");
    }

    const quizCollection = await quizzes();

    let newComment: Comment = {
      ownerId: new ObjectId(userId),
      text,
      createdAt: new Date(),
    };

    newComment = await CommentSchema.validate(newComment);

    await quizCollection.updateOne(
      { _id: new ObjectId(quizId) },
      { $push: { comments: newComment } },
    );

    return getQuizById(quizId);
  } finally {
    const client = await redisClient();
    await client.del(`quiz:${quizId}`);
    await client.del(`quizzes:user:${userId}`);
  }
}

export async function getPublicQuizzes(): Promise<Quiz[]> {
  const quizCollection = await quizzes();
  let quizList;
  try {
    quizList = await quizCollection.find({ published: true }).toArray();
  } catch {
    throw new Error("Failed to get public quizzes");
  }
  if (!quizList) {
    throw new Error("Public quizzes not found");
  }
  return quizList;
}

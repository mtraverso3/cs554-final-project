import {
  Quiz,
  QuizSchema,
  QuizEntrySchema,
  QuizEntry,
} from "@/lib/db/data/schema";
import { ObjectId } from "mongodb";
import {quizzes} from "@/lib/db/config/mongoCollections";
import { getUserById } from "@/lib/db/data/users";

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

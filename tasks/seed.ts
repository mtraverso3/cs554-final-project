

//We will use the following account details from Auth0:
// email:     cs554@mtraverso.net
// password:  CS554user$
// sub:       auth0|6822d2b4eaeca58da4aecb5a
//
// This account is in the auth0 system, but a fresh DB will not have the user in the mongoDB, so you'll have to create a new account via users.ts createUser().
// Then just call the DB functions directly with the newly created userId

import { MongoClient, ObjectId } from "mongodb";
import { createClient } from "redis";

interface DeckSeed {
  _id: ObjectId;
  name: string;
  description: string;
  category: string;
  published: boolean;
  createdAt: Date;
  lastStudied: Date;
  ownerId: ObjectId | null;
  studyProgress: {
    currentCardIndex: number;
    knownCardIds: any[];
    unknownCardIds: any[];
    lastPosition: number;
    studyTime: number;
    isReviewMode: boolean;
    isCompleted: boolean;
    reviewingCardIds: any[];
  };
  likes: any[];
  comments: any[];
  flashcardList: { front: string; back: string }[];
}

interface QuizSeed {
  _id: ObjectId;
  name: string;
  description: string;
  category: string;
  published: boolean;
  createdAt: Date;
  lastStudied: Date;
  ownerId: ObjectId | null;
  likes: any[];
  comments: any[];
  attempts: any[];
  questionsList: { question: string; answers: { answer: string; isCorrect: boolean }[] }[];
}

// auth0 sample account
const userEmail = "cs554@mtraverso.net";
const userPassword = "CS554user$";
const userSub = "auth0|6822d2b4eaeca58da4aecb5a";

const sampleUser = {
  _id: new ObjectId(),
  firstName: "Test",
  lastName: "User",
  email: userEmail,
  sub: userSub,
  profilePicture: { file: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" }
};

const sampleDecks: DeckSeed[] = [
  {
    _id: new ObjectId(),
    name: "JavaScript Basics",
    description: "Learn the fundamentals of JavaScript programming language",
    category: "Programming",
    published: true,
    createdAt: new Date(),
    lastStudied: new Date(),
    ownerId: null,
    studyProgress: { currentCardIndex: 0, knownCardIds: [], unknownCardIds: [], lastPosition: 0, studyTime: 0, isReviewMode: false, isCompleted: false, reviewingCardIds: [] },
    likes: [],
    comments: [],
    flashcardList: [
      { front: "What is JavaScript?", back: "A high-level, interpreted programming language that conforms to the ECMAScript specification" },
      { front: "What is a variable?", back: "A container for storing data values" },
      { front: "What is a function?", back: "A block of code designed to perform a particular task" },
      { front: "What is an array?", back: "A special variable, which can hold more than one value at a time" },
      { front: "What is an object?", back: "A collection of properties, and a property is an association between a name (or key) and a value" }
    ]
  },
  {
    _id: new ObjectId(),
    name: "React Fundamentals",
    description: "Core concepts of the React library for building user interfaces",
    category: "Programming",
    published: true,
    createdAt: new Date(),
    lastStudied: new Date(),
    ownerId: null,
    studyProgress: { currentCardIndex: 0, knownCardIds: [], unknownCardIds: [], lastPosition: 0, studyTime: 0, isReviewMode: false, isCompleted: false, reviewingCardIds: [] },
    likes: [],
    comments: [],
    flashcardList: [
      { front: "What is React?", back: "A JavaScript library for building user interfaces" },
      { front: "What is JSX?", back: "A syntax extension to JavaScript that allows you to write HTML in React" },
      { front: "What is a component?", back: "A piece of code that represents a part of a user interface" },
      { front: "What are props?", back: "Arguments passed into React components" },
      { front: "What is state?", back: "Data that changes over time in a component" }
    ]
  },
  {
    _id: new ObjectId(),
    name: "MongoDB Basics",
    description: "Fundamental concepts of MongoDB database",
    category: "Databases",
    published: false,
    createdAt: new Date(),
    lastStudied: new Date(),
    ownerId: null,
    studyProgress: { currentCardIndex: 0, knownCardIds: [], unknownCardIds: [], lastPosition: 0, studyTime: 0, isReviewMode: false, isCompleted: false, reviewingCardIds: [] },
    likes: [],
    comments: [],
    flashcardList: [
      { front: "What is MongoDB?", back: "A document-oriented NoSQL database" },
      { front: "What is a document in MongoDB?", back: "A record in MongoDB which is a data structure composed of field and value pairs" },
      { front: "What is a collection?", back: "A grouping of MongoDB documents" },
      { front: "What is BSON?", back: "The binary encoding of JSON-like documents that MongoDB uses" },
      { front: "What is an _id?", back: "A special field in MongoDB that serves as a primary key" }
    ]
  }
];

const sampleQuizzes: QuizSeed[] = [
  {
    _id: new ObjectId(),
    name: "JavaScript Quiz",
    description: "Test your knowledge of JavaScript fundamentals",
    category: "Programming",
    published: true,
    createdAt: new Date(),
    lastStudied: new Date(),
    ownerId: null,
    likes: [],
    comments: [],
    attempts: [],
    questionsList: [
      { question: "What is JavaScript?", answers: [ { answer: "A high-level, interpreted programming language", isCorrect: true }, { answer: "A markup language", isCorrect: false }, { answer: "A database system", isCorrect: false }, { answer: "An operating system", isCorrect: false } ] },
      { question: "Which of the following is not a JavaScript data type?", answers: [ { answer: "String", isCorrect: false }, { answer: "Boolean", isCorrect: false }, { answer: "Character", isCorrect: true }, { answer: "Number", isCorrect: false } ] },
      { question: "What does the '===' operator do in JavaScript?", answers: [ { answer: "Assigns a value", isCorrect: false }, { answer: "Checks for equality in value and type", isCorrect: true }, { answer: "Checks for equality in value only", isCorrect: false }, { answer: "Declares a variable", isCorrect: false } ] }
    ]
  },
  {
    _id: new ObjectId(),
    name: "React Concepts Quiz",
    description: "Test your understanding of React library concepts",
    category: "Programming",
    published: true,
    createdAt: new Date(),
    lastStudied: new Date(),
    ownerId: null,
    likes: [],
    comments: [],
    attempts: [],
    questionsList: [
      { question: "What is React?", answers: [ { answer: "A JavaScript library for building user interfaces", isCorrect: true }, { answer: "A programming language", isCorrect: false }, { answer: "A database system", isCorrect: false }, { answer: "A server-side framework", isCorrect: false } ] },
      { question: "Which of the following is used to pass data to a component in React?", answers: [ { answer: "Props", isCorrect: true }, { answer: "State", isCorrect: false }, { answer: "Elements", isCorrect: false }, { answer: "Refs", isCorrect: false } ] },
      { question: "What is JSX in React?", answers: [ { answer: "A database query language", isCorrect: false }, { answer: "A syntax extension that allows HTML in JavaScript", isCorrect: true }, { answer: "A testing framework", isCorrect: false }, { answer: "A build tool", isCorrect: false } ] }
    ]
  }
];

sampleDecks.forEach(deck => {
  const flashcards = deck.flashcardList.map(card => ({ _id: new ObjectId(), deckId: deck._id, front: card.front, back: card.back }));
  deck.flashcardList = flashcards;
  deck.ownerId = sampleUser._id;
});

sampleQuizzes.forEach(quiz => {
  quiz.ownerId = sampleUser._id;
});

async function main() {
  console.log("Seeding the database...");
  
  const client = new MongoClient(process.env.MONGO_SERVER_URL || 'mongodb://localhost:27017');
  await client.connect();
  console.log("Connected to MongoDB");
  
  const db = client.db(process.env.MONGODB_DB || '554FinalProject');
  const users = db.collection('users');
  const decks = db.collection('decks');
  const quizzes = db.collection('quizzes');
  
  await users.deleteMany({});
  await decks.deleteMany({});
  await quizzes.deleteMany({});
  console.log("Cleared existing collections");
  
  await users.insertOne(sampleUser);
  await decks.insertMany(sampleDecks);
  await quizzes.insertMany(sampleQuizzes);
  console.log("Added sample data to MongoDB");
  
  try {
    const redisClient = createClient({ url: process.env.REDIS_SERVER_URL || 'redis://localhost:6379' });
    await redisClient.connect();
    await redisClient.flushAll();
    await redisClient.disconnect();
    console.log("Cleared Redis cache");
  } catch (error) {
    console.log("Warning: Redis cache clearing failed. Is Redis running?");
  }
  
  console.log("\nUse the following account details from Auth0:");
  console.log(`Email:    ${userEmail}`);
  console.log(`Password: ${userPassword}`);
  
  await client.close();
  console.log("Database seeding complete!");
}

main().catch(console.error);
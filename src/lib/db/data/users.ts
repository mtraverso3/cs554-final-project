import { users } from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import { User, UserSchema } from "./schema";
import { redisClient } from "@/lib/db/config/redisConnection";
import { deserializeUser, serializeUser } from "./serialize";

export async function createUser(
  email: string,
  sub: string,
  firstName: string,
  lastName: string,
): Promise<User> {

  const userCollection = await users();
  const existingUser = await userCollection.findOne({ sub: sub.trim() });
  if (existingUser) {
    throw new Error("User already exists");
  }

  let newUser: User = {
    _id: new ObjectId(),
    firstName,
    lastName,
    email,
    sub,
  };
  newUser = await UserSchema.validate(newUser);

  try {
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw new Error("Error inserting new user");
    }
    return newUser;
  }
  finally {
    const client = await redisClient();
    await client.del(`user:sub:${sub.trim()}`);
  }
}

export async function getUserById(id: string): Promise<User> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectID");
  }

  const client = await redisClient();
  const cacheKey = `user:${id}`;
  const cached = await client.get(cacheKey);
  if (cached) {
    return deserializeUser(cached);
  }

  const userCollection = await users();
  let foundUser;
  try {
    foundUser = await userCollection.findOne({ _id: new ObjectId(id) });
  } catch {
    throw new Error("Error retrieving user");
  }
  if (!foundUser) {
    throw new Error("User not found");
  }
  await client.set(cacheKey, serializeUser(foundUser), { EX: 3600 });
  return foundUser;
}

export async function getUserBySub(sub: string): Promise<User> {
  const client = await redisClient();
  const cacheKey = `user:sub:${sub.trim()}`;
  const cached = await client.get(cacheKey);
  if (cached) {
    return deserializeUser(cached);
  }

  const userCollection = await users();
  const foundUser = await userCollection.findOne({ sub: sub.trim() });
  if (!foundUser) {
    throw new Error("User not found", { cause: "NO_USER" });
  }
  await client.set(cacheKey, serializeUser(foundUser), { EX: 3600 });
  return foundUser;
}

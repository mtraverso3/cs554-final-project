import { users } from "../config/mongoCollections";
import { ObjectId } from "mongodb";
import { User, UserSchema } from "./schema";

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

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Error inserting new user");
  }
  return newUser;
}

export async function getUserById(id: string): Promise<User> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectID");
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
  return foundUser;
}

export async function getUserBySub(sub: string): Promise<User> {
  const userCollection = await users();
  const foundUser = await userCollection.findOne({ sub: sub.trim() });
  if (!foundUser) {
    throw new Error("User not found", { cause: "NO_USER" });
  }
  return foundUser;
}

"use server";

import { auth0, authenticateUser } from "@/lib/auth/auth";
import { User } from "@/lib/db/data/schema";
import * as userData from "@/lib/db/data/users";
import { users } from "@/lib/db/config/mongoCollections";
import { ObjectId } from "mongodb";
import { quizzes } from "@/lib/db/config/mongoCollections";
import { decks } from "@/lib/db/config/mongoCollections";
import { redisClient } from "@/lib/db/config/redisConnection";

export async function getUserData(): Promise<string> {
  const userObject: User = await authenticateUser();
  return JSON.stringify(userObject);
}

export async function updateProfile(
  first: string,
  last: string,
  profilePicture: string,
) {
  const userObject: User = await authenticateUser();
  await userData.updateUser(
    userObject._id.toString(),
    first,
    last,
    profilePicture,
  );
}
export async function getNewUser(sub: string): Promise<string> {
  const userObject = await userData.getUserBySub(sub);
  return JSON.stringify(userObject);
}

export async function getUserById(id: string): Promise<string> {
  const userObject = await userData.getUserById(id);
  return JSON.stringify(userObject);
}

export async function signup(
  first: string,
  last: string,
  profilePicture: string,
): Promise<string> {
  const session = await auth0.getSession();
  const userObject = session?.user;
  if (!userObject || !userObject.email || !userObject.sub) {
    throw new Error("User missing email or sub");
  }
  const user: User = await userData.createUser(
    userObject.email,
    userObject.sub,
    first,
    last,
    profilePicture,
  );
  console.log(
    `User "${user.firstName} ${user.lastName}" created successfully.`,
  );
  return JSON.stringify(user);
}

export async function deleteUserAccount(): Promise<{ success: boolean; message: string }> {
  try {
    const userObject: User = await authenticateUser();
    const userId = userObject._id.toString();
    const usersCollection = await users();
    const quizzesCollection = await quizzes();
    const decksCollection = await decks();
    await quizzesCollection.deleteMany({ ownerId: new ObjectId(userId) });
    await decksCollection.deleteMany({ ownerId: new ObjectId(userId) });
    const deleteResult = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    
    if (deleteResult.deletedCount === 0) {
      return { 
        success: false, 
        message: "Failed to delete user account. Please try again." 
      };
    }
  
    const client = await redisClient();
    await client.del(`user:${userId}`);
  
    return { 
      success: true, 
      message: "Your account has been successfully deleted." 
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred while deleting your account." 
    };
  }
}


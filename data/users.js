import {users} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import * as helpers from "./helpers.js";
import { getImageSize } from 'next/dist/server/image-optimizer.js';
export async function getUserBySub(sub) {
    const allUsers = await users();
    let theUsers = await allUsers.find({}).toArray();   
    for(let a = 0; a < theUsers.length; a++) {
        let user = theUsers[a];
        if(user.sub === sub) {
            return user;
        }
    }
    return null;
}
export async function createUser(email, sub, firstName, lastName) {
  let userExists = await getUserBySub(sub);
  if(userExists) {
    console.log("User already exists.");
    return null;
  }
  let theUser = {};
  theUser["_id"] = new ObjectId();
  theUser["firstName"] = firstName;
  theUser["lastName"] = lastName;
  theUser["email"] = email;
  theUser["sub"] = sub;
  theUser["flashcards"] = [];
  theUser["quizzes"] = [];
  const theUsers = await users();
  const insertInfo = await theUsers.insertOne(theUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    return null;
  }
  const theId = insertInfo.insertedId.toString();
  const finalUser = await getUserById(theId);
  return finalUser;
}
export async function getUserById (id) {
  id = helpers.checkId(id);
  if(!id) {
    return null;
  }
  const allUsers = await users();
  let theUsers = await allUsers.find({}).toArray();
  for(let a = 0; a < theUsers.length; a++) {
    let user = theUsers[a];
    if(user["_id"].toString() === id) {
      return user;
    }
  }
  return null;
};
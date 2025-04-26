import {users} from '../config/mongoCollections.js';
import {ObjectId} from "mongodb";
import * as helpers from "./helpers.js";
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
        throw "Could not add user.";
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
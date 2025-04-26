'use server'
import { auth0 } from "@/lib/auth0";
import * as users from "../../data/users.js";

export async function createFlashcard(front: string, back: string) {
    console.log(front, back);
}

export async function signup(first: any, last: any) {
    const session = await auth0.getSession();
    let userObject = session?.user;
    if(!session) {
        console.log("Session does not exist (user is not logged in)");
        return;
    }
    let theUser = await users.createUser(userObject?.email, userObject?.sub, first, last);
    if(!theUser) {
        console.log("User could not be created.")
        return;
    }
    console.log("User created successfully.");
    return;
}
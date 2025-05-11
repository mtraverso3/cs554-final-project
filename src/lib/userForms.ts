"use server";

import { authenticateUser } from "@/lib/auth/auth";
//import * as users from "@/lib/db/data/users";
import {User} from "@/lib/db/data/schema";
import * as userData from "@/lib/db/data/users";

export async function getUserData(): Promise<string> {
    const userObject: User = await authenticateUser();
    return JSON.stringify(userObject);
}

export async function updateProfile(first: string, last: string) {
    const userObject: User = await authenticateUser();
    await userData.updateUser(userObject._id.toString(), first, last);
}

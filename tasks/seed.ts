

//We will use the following account details from Auth0:
// email:     cs554@mtraverso.net
// password:  CS554user$
// sub:       auth0|6822d2b4eaeca58da4aecb5a
//
// This account is in the auth0 system, but a fresh DB will not have the user in the mongoDB, so you'll have to create a new account via users.ts createUser().
// Then just call the DB functions directly with the newly created userId

const userEmail = "cs554@mtraverso.net";
const userPassword = "CS554user$";
const userSub = "auth0|6822d2b4eaeca58da4aecb5a";

console.log("Seeding the database...");



console.log("Use the following account details from Auth0:");
console.log(`email:     ${userEmail}`);
console.log(`password:  ${userPassword}`);
// console.log(`sub:       ${userSub}`);
import { auth0 } from "@/lib/auth0";
import { Navbar } from "@/components/Navbar";
// import {CreateFlashcard} from "@/components/createFlashcard";

export default async function HomePage() {
  const session = await auth0.getSession();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow mx-auto px-4 py-6 text-center">
        <h1 className="text-4xl font-bold mb-4">CS554 Final Project</h1>
        <p className="text-xl text-gray-600 mb-8">CS554 Final Project</p>
        <p className="text-lg text-gray-500">
          {session ? `Welcome, ${session.user.name}` : "Welcome, Guest"}
        </p>
          {/*<CreateFlashcard />*/}
      </div>
    </div>
  );
}

"use client";
import { Navbar } from "@/components/Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";

export default function HomePage() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow mx-auto px-4 py-6 text-center">
        <h1 className="text-4xl font-bold mb-4">CS554 Final Project</h1>
        <p className="text-xl text-gray-600 mb-8">CS554 Final Project</p>
        <p className="text-lg text-gray-500">
          {user ? `Welcome, ${user.email}` : "Welcome, Guest"}
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md">
      <div className="mx-auto px-4 py-3 flex justify-between items-center">
        <a
          href="/home"
          className="text-2xl font-bold text-gray-800 hover:text-gray-600"
        >
          CS554 Final Project
        </a>

        {/* Auth Buttons */}
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <a href="/auth/signin">Sign In</a>
          </Button>
          <Button asChild>
            <a href="/auth/signup">Sign Up</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}

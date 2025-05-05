import React from "react";
import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth/auth";
import Link from "next/link";

export async function Navbar() {
  const session = await auth0.getSession();

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
          {session ? (
            <>
              <Button variant="outline" asChild>
                <Link href="/">Go to app</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/logout">Logout</a>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <a href="/auth/login">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/auth/login?screen_hint=signup">Sign Up</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

import { NextRequest, NextResponse } from "next/server";

import { auth0 } from "./lib/auth0";
import { The_Nautigal } from "next/font/google";

export async function middleware(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  console.log("middleware test");
  // if path starts with /auth, let the auth middleware handle it
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authResponse;
  }
  const session = await auth0.getSession();
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

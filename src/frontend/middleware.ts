import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware to protect routes that require authentication
 * 
 * This middleware will run on all routes and will redirect
 * to the login page if the user is not authenticated and
 * is trying to access a protected route.
 */
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Define public routes that don't require authentication
  const publicPaths = ['/', '/login', '/onboarding', '/about', '/api'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // If the path is public, no need to check authentication
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check for the session token in the request
  const token = await getToken({
    req: request,
    // Only provide secret if it's defined
    ...(process.env.NEXTAUTH_SECRET ? { secret: process.env.NEXTAUTH_SECRET } : {})
  });
  
  // If no token found, redirect to login page
  if (!token) {
    // Get the current URL to redirect back after login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', encodeURI(path));
    
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, proceed to the requested page
  return NextResponse.next();
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all paths except for those starting with:
    // - /_next (Next.js internals)
    // - /api/auth (NextAuth.js API routes)
    // - /static (static files)
    // - /favicon.ico, /robots.txt (common static files)
    '/((?!_next|api/auth|static|favicon.ico|robots.txt).*)',
  ],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiter - using Redis for distributed rate limiting
// You'll need to add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env.local
let redis: Redis | undefined;
let ratelimit: Ratelimit | undefined;

try {
  // Only create Redis connection if environment variables are available
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create a rate limiter that allows 20 requests per minute
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
    });
  }
} catch (e) {
  console.error('Failed to initialize rate limiter:', e);
}

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/submit',
  '/library',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/(.*)',
  '/api/public/(.*)',
  '/api/playlist/guest-rate-track',
]);

// Add custom middleware with Clerk's middleware
export default clerkMiddleware(async (auth, request: NextRequest) => {
  const response = NextResponse.next();

  // Apply security headers to all responses
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://*.paypal.com https://www.youtube.com https://apis.google.com https://w.soundcloud.com https://bandcamp.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.clerk.com https://*.ytimg.com https://i.ytimg.com https://*.sndcdn.com https://i1.sndcdn.com https://bandcamp.com https://f4.bcbits.com;
    font-src 'self' data: https://fonts.gstatic.com;
    frame-src https://www.youtube.com https://w.soundcloud.com https://bandcamp.com https://*.paypal.com https://*.clerk.accounts.dev;
    connect-src 'self' https://*.clerk.com https://api.paypal.com https://apis.google.com https://api.soundcloud.com https://api-widget.soundcloud.com;
    media-src 'self' https://*.soundcloud.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://*.clerk.com https://*.paypal.com;
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s+/g, ' ')
    .trim();

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // Protect routes that aren't public
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Apply rate limiting to API routes only
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip rate limiting if not initialized (development mode or missing env vars)
    if (!ratelimit) {
      return response;
    }

    const authResult = await auth();
    // Use IP for unauthenticated requests, userId for authenticated
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0]
      : request.headers.get('x-real-ip') || 'anonymous';
    const identifier = authResult.userId || ip;

    try {
      // Rate limit based on identifier
      const { success, limit, reset, remaining } =
        await ratelimit.limit(identifier);

      // Set rate limit headers
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());

      if (!success) {
        // Return rate limit error
        return NextResponse.json(
          {
            error: 'TooManyRequests',
            message: 'Rate limit exceeded, please try again later',
          },
          {
            status: 429,
            headers: response.headers,
          }
        );
      }
    } catch (e) {
      console.error('Rate limiting error:', e);
      // Continue if rate limiting fails - better to allow requests than block them due to our error
    }
  }

  return response;
});

// Config for Clerk middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

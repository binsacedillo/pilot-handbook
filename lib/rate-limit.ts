import { NextRequest } from 'next/server';

/**
 * Simple in-memory rate limiter for serverless environments
 * Token bucket algorithm: max 10 requests per minute per IP
 * Fallback for environments without Vercel Ratelimit
 */

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitKey(req: NextRequest): string {
  // Get IP from headers (Vercel sets x-forwarded-for)
  const forwardedFor = req.headers.get('x-forwarded-for') ?? '';
  return forwardedFor ? forwardedFor.split(',')[0]!.trim() : 'unknown';
}

/**
 * Rate limit a request by IP
 * Returns: { success: boolean, remaining: number, resetTime: number }
 */
export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    // Reset window
    const newRecord = { count: 1, resetTime: now + windowMs };
    requestCounts.set(key, newRecord);
    return { success: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
  }

  record.count++;

  if (record.count > maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

/**
 * Cleanup expired entries every 5 minutes to prevent memory leak
 */
if (typeof global !== 'undefined' && !global.__rateLimitCleanupScheduled) {
  global.__rateLimitCleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

declare global {
  var __rateLimitCleanupScheduled: boolean | undefined;
}

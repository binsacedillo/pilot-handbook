import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

/**
 * Rate limiter using Upstash Redis (recommended for production)
 * Falls back to in-memory for local development
 */

let limiter: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  // Only create limiter if Upstash credentials are available (production)
  if (!limiter && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      limiter = new Ratelimit({
        redis: Redis.fromEnv(),
        analytics: true,
        prefix: "ratelimit",
      });
    } catch (error) {
      console.warn("Failed to initialize Upstash Ratelimit:", error);
      return null;
    }
  }
  return limiter;
}

export function getRateLimitKey(req: NextRequest): string {
  // Use Vercel's x-forwarded-for, but also check CF-Connecting-IP (Cloudflare) for defense in depth
  const forwardedFor = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
  if (!forwardedFor) {
    // Fallback: use user agent hash if no IP available
    const ua = req.headers.get('user-agent') || 'unknown';
    return `ua:${Buffer.from(ua).toString('base64').slice(0, 16)}`;
  }
  return forwardedFor.split(',')[0]!.trim();
}

/**
 * Rate limit a request by IP using Upstash Redis (production) or in-memory (dev)
 * Returns: { success: boolean, remaining: number, resetTime: number }
 */
export async function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const limiter = getRateLimiter();

  // Use Upstash if available (production)
  if (limiter) {
    try {
      const result = await limiter.limit(key, {
        rate: Math.ceil((maxRequests * 1000) / windowMs), // requests per second
        window: windowMs,
      });
      return {
        success: result.success,
        remaining: Math.max(0, result.remaining),
        resetTime: Date.now() + result.resetMs,
      };
    } catch (error) {
      console.error("Rate limit check failed:", error);
      // Fail open: allow request if Redis is down
      return { success: true, remaining: maxRequests - 1, resetTime: Date.now() + windowMs };
    }
  }

  // Fallback: in-memory for development (NOT production-safe)
  if (process.env.NODE_ENV !== 'production') {
    const requestCounts = new Map<string, { count: number; resetTime: number }>();
    const now = Date.now();
    const record = requestCounts.get(key);

    if (!record || now > record.resetTime) {
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

  // Production without Upstash: deny request
  console.warn("Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured");
  return { success: false, remaining: 0, resetTime: Date.now() + windowMs };
}

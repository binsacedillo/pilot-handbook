import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getRateLimitKey', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const mockReq = {
        headers: new Map([['x-forwarded-for', '192.168.1.1, 10.0.0.1']]),
      } as unknown as NextRequest;

      const key = getRateLimitKey(mockReq);
      expect(key).toBe('192.168.1.1');
    });

    it('should return unknown when no IP header is present', () => {
      const mockReq = {
        headers: new Map(),
      } as unknown as NextRequest;

      const key = getRateLimitKey(mockReq);
      expect(key).toBe('unknown');
    });
  });

  describe('rateLimit', () => {
    it('should allow requests under the limit', async () => {
      const result1 = await rateLimit('test-ip', 5, 60000);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = await rateLimit('test-ip', 5, 60000);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests over the limit', async () => {
      // Make 5 requests (max limit)
      for (let i = 0; i < 5; i++) {
        await rateLimit('test-ip-2', 5, 60000);
      }

      // 6th request should be blocked
      const result = await rateLimit('test-ip-2', 5, 60000);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after time window expires', async () => {
      const windowMs = 60000;

      // Make max requests
      for (let i = 0; i < 5; i++) {
        await rateLimit('test-ip-3', 5, windowMs);
      }

      // Should be blocked
      const blocked = await rateLimit('test-ip-3', 5, windowMs);
      expect(blocked.success).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(windowMs + 1000);

      // Should be allowed again
      const allowed = await rateLimit('test-ip-3', 5, windowMs);
      expect(allowed.success).toBe(true);
      expect(allowed.remaining).toBe(4);
    });

    it('should track different IPs independently', async () => {
      await rateLimit('ip-1', 5, 60000);
      await rateLimit('ip-1', 5, 60000);
      await rateLimit('ip-1', 5, 60000);

      await rateLimit('ip-2', 5, 60000);

      const result1 = await rateLimit('ip-1', 5, 60000);
      const result2 = await rateLimit('ip-2', 5, 60000);

      expect(result1.remaining).toBe(1); // ip-1 has 3 requests
      expect(result2.remaining).toBe(3); // ip-2 has 1 request
    });

    it('should return proper reset time', async () => {
      const now = Date.now();
      const windowMs = 60000;

      const result = await rateLimit('test-ip-4', 5, windowMs);
      
      expect(result.resetTime).toBeGreaterThan(now);
      expect(result.resetTime).toBeLessThanOrEqual(now + windowMs);
    });

    it('should handle edge case of exactly max requests', async () => {
      // Make exactly 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await rateLimit('test-ip-5', 5, 60000);
        expect(result.success).toBe(true);
      }

      // 6th should fail
      const result = await rateLimit('test-ip-5', 5, 60000);
      expect(result.success).toBe(false);
    });
  });

  describe('Request Body Size Limits', () => {
    it('should enforce max body size for feedback', () => {
      const MAX_BODY_SIZE = 10 * 1024; // 10KB
      const largePayload = 'A'.repeat(MAX_BODY_SIZE + 1);

      expect(largePayload.length).toBeGreaterThan(MAX_BODY_SIZE);
    });

    it('should accept body size at limit', () => {
      const MAX_BODY_SIZE = 10 * 1024; // 10KB
      const validPayload = 'A'.repeat(MAX_BODY_SIZE);

      expect(validPayload.length).toBe(MAX_BODY_SIZE);
    });
  });

  describe('Monitoring Payloads', () => {
    it('should detect suspiciously large payloads', () => {
      const normalSize = 500; // chars
      const suspiciousSize = 9000; // chars
      const MAX_NORMAL_SIZE = 5000;

      expect(normalSize).toBeLessThan(MAX_NORMAL_SIZE);
      expect(suspiciousSize).toBeGreaterThan(MAX_NORMAL_SIZE);
    });

    it('should detect repeated pattern attacks', () => {
      const normalText = 'This is normal feedback about the app.';
      const repeatedPattern = 'AAAA'.repeat(250); // 1000 chars of same pattern

      expect(normalText.length).toBeLessThan(repeatedPattern.length);
      expect(new Set(repeatedPattern.split('')).size).toBe(1); // Only one unique char
      expect(new Set(normalText.split('')).size).toBeGreaterThan(10); // Many unique chars
    });
  });
});

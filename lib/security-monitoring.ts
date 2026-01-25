/**
 * Security monitoring utilities for detecting and logging suspicious activity
 * Integrates with logging services like Sentry, Datadog, or Prometheus
 */

export interface SuspiciousPayload {
  type: 'oversized' | 'repeated-pattern' | 'rapid-requests' | 'malformed';
  ip: string;
  endpoint: string;
  size?: number;
  timestamp: Date;
  details?: string;
}

const suspiciousPayloadLog: SuspiciousPayload[] = [];

/**
 * Log suspicious payload for monitoring
 * In production, integrate with Sentry, Datadog, or Prometheus
 */
export function logSuspiciousPayload(payload: SuspiciousPayload): void {
  suspiciousPayloadLog.push(payload);

  // Console warn in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('🚨 Suspicious payload detected:', payload);
  }

  // In production, send to monitoring service:
  // - Sentry: Sentry.captureMessage()
  // - Datadog: dogstatsd.increment()
  // - Prometheus: suspicious_requests_total.inc()
  
  // Example Sentry integration (uncomment when Sentry is configured):
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureMessage('Suspicious payload detected', {
  //     level: 'warning',
  //     extra: payload,
  //   });
  // }

  // Keep only last 1000 entries to prevent memory leak
  if (suspiciousPayloadLog.length > 1000) {
    suspiciousPayloadLog.shift();
  }
}

/**
 * Check if payload shows signs of attack patterns
 */
export function analyzePayload(
  content: string,
  ip: string,
  endpoint: string
): void {
  const size = content.length;

  // Check for oversized payload (>5KB for most endpoints)
  const MAX_NORMAL_SIZE = 5000;
  if (size > MAX_NORMAL_SIZE) {
    logSuspiciousPayload({
      type: 'oversized',
      ip,
      endpoint,
      size,
      timestamp: new Date(),
      details: `Payload size ${size} exceeds normal threshold ${MAX_NORMAL_SIZE}`,
    });
  }

  // Check for repeated patterns (potential fuzzing)
  const uniqueChars = new Set(content.split('')).size;
  const repetitionRatio = uniqueChars / size;
  
  if (size > 100 && repetitionRatio < 0.05) {
    logSuspiciousPayload({
      type: 'repeated-pattern',
      ip,
      endpoint,
      size,
      timestamp: new Date(),
      details: `Low character diversity (${uniqueChars} unique chars in ${size} total)`,
    });
  }

  // Check for potential XSS/injection patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /'.*or.*'.*=/i,
    /;\s*drop\s+table/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      logSuspiciousPayload({
        type: 'malformed',
        ip,
        endpoint,
        size,
        timestamp: new Date(),
        details: `Potential injection attempt detected: ${pattern.toString()}`,
      });
      break;
    }
  }
}

/**
 * Get recent suspicious activity (for admin monitoring dashboard)
 */
export function getSuspiciousActivity(limit: number = 50): SuspiciousPayload[] {
  return suspiciousPayloadLog.slice(-limit).reverse();
}

/**
 * Clear suspicious activity log (for testing)
 */
export function clearSuspiciousActivity(): void {
  suspiciousPayloadLog.length = 0;
}

interface RateLimitRecord {
  attempts: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * IP Rate Limiter to prevent brute-force login attacks.
 * @param ip Client IP address or identifier
 * @param maxAttempts Allowed failures within window (default: 5)
 * @param windowMs Time window in milliseconds (default: 15 minutes = 900,000 ms)
 */
export function checkRateLimit(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number; remainingAttempts: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Clean up expired records
  if (record && now > record.resetTime) {
    rateLimitMap.delete(ip);
  }

  const currentRecord = rateLimitMap.get(ip) || {
    attempts: 0,
    resetTime: now + windowMs,
  };

  if (currentRecord.attempts >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((currentRecord.resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      remainingAttempts: 0,
    };
  }

  // Increment attempts
  currentRecord.attempts += 1;
  rateLimitMap.set(ip, currentRecord);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remainingAttempts: maxAttempts - currentRecord.attempts,
  };
}

/**
 * Resets rate limit for a specific IP address (e.g. after successful login)
 */
export function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

/**
 * Resets all rate limit records (used for test suites)
 */
export function resetRateLimits(): void {
  rateLimitMap.clear();
}

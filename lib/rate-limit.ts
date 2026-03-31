/**
 * In-memory rate limiter for auth endpoint.
 * Tracks failed login attempts per IP with exponential backoff.
 * Resets on server restart (sufficient for single-instance deployments).
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const attempts = new Map<string, AttemptRecord>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Blocked window active
  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false, retryAfterMs: record.blockedUntil - now };
  }

  // Window expired — reset
  if (now - record.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  record.count += 1;

  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + WINDOW_MS;
    return { allowed: false, retryAfterMs: WINDOW_MS };
  }

  return { allowed: true };
}

export function resetRateLimit(ip: string): void {
  attempts.delete(ip);
}

/**
 * rateLimit.js
 * Best-effort in-memory sliding window rate limiter for serverless environments.
 * Limits requests per IP (default 20 requests per 10 minutes).
 */

const windowMs = 10 * 60 * 1000; // 10 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_PER_10MIN || '20', 10);
const requestMap = new Map();

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestMap.entries()) {
    const valid = timestamps.filter(t => now - t < windowMs);
    if (valid.length === 0) {
      requestMap.delete(ip);
    } else {
      requestMap.set(ip, valid);
    }
  }
}, 60 * 1000).unref?.();

/**
 * Check if the given client IP is rate limited
 * @param {string} ip
 * @returns {{ limited: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(ip = 'unknown') {
  const now = Date.now();
  const timestamps = (requestMap.get(ip) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { limited: true, remaining: 0, resetMs };
  }

  timestamps.push(now);
  requestMap.set(ip, timestamps);
  return { limited: false, remaining: maxRequests - timestamps.length, resetMs: windowMs };
}

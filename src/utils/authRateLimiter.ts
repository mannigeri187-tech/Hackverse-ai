/**
 * Client-side rate limiting helper for authentication routes
 * Enforces dual IP + Email tracking and progressive backoff
 */

export interface RateLimitCheckResult {
  allowed: boolean;
  error?: string;
  retryAfter?: number;
}

export async function checkAuthRateLimit(action: string, email?: string): Promise<RateLimitCheckResult> {
  try {
    const res = await fetch('/api/user-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        email: email?.trim().toLowerCase() || '',
        status: 'attempt',
      }),
    });

    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      const retryAfter = data.retryAfter || parseInt(res.headers.get('Retry-After') || '60', 10);
      return {
        allowed: false,
        error: `Too many attempts. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    return { allowed: true };
  } catch (err) {
    // Fail open safely on client network error to avoid trapping legitimate users
    console.warn('Rate limit pre-check notice:', err);
    return { allowed: true };
  }
}

export function reportAuthSuccess(email?: string): void {
  if (!email) return;
  fetch('/api/user-actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'auth',
      email: email.trim().toLowerCase(),
      status: 'success',
    }),
  }).catch(() => {});
}

export function reportAuthFailure(email?: string): void {
  if (!email) return;
  fetch('/api/user-actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'auth',
      email: email.trim().toLowerCase(),
      status: 'failure',
    }),
  }).catch(() => {});
}

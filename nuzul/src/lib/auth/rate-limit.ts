import 'server-only';
import { prisma } from '@/lib/db';

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (only meaningful when `ok` is false). */
  retryAfter: number;
}

/**
 * Fixed-window rate limit backed by the `RateLimit` table (no external infra). Returns
 * `{ ok: false, retryAfter }` once `limit` hits land inside `windowMs`. Tolerant of a benign
 * race under concurrency (two first-hits may both reset the window) — adequate for throttling
 * auth endpoints. Fail-closed: a DB error propagates and the caller returns 500.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date();
  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.expiresAt <= now) {
    const expiresAt = new Date(now.getTime() + windowMs);
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: 1, expiresAt },
    });
    return { ok: true, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)) };
  }

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return { ok: true, retryAfter: 0 };
}

/** Clear a counter — e.g. after a successful login so an earlier typo doesn't linger. */
export async function clearRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } });
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

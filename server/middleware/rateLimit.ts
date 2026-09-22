import express from 'express';

// Dependency-free sliding-window rate limiter (in-memory, per key).
// Safe error shape: machine-readable { error:'Too many requests' } + Retry-After.
interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup so the map cannot grow unbounded (sweeps every 5 min).
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    // keep entry only if it has a hit inside the longest window we use (24h cap)
    const fresh = b.hits.some((t) => now - t < 24 * 60 * 60 * 1000);
    if (!fresh) buckets.delete(k);
  }
  if (buckets.size > 20000) buckets.clear();
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyOf?: (req: express.Request) => string;
  // Prefix isolates buckets between different limiters sharing the module map.
  prefix?: string;
}

const clientIp = (req: express.Request): string =>
  (req.ip || req.socket?.remoteAddress || 'unknown').toString().slice(0, 64);

export function rateLimit(opts: RateLimitOptions) {
  const { windowMs, max, prefix } = opts;
  const keyOf = opts.keyOf || clientIp;
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = (prefix ? prefix + ':' : '') + keyOf(req);
    const now = Date.now();
    let b = buckets.get(key);
    if (!b) {
      b = { hits: [] };
      buckets.set(key, b);
    }
    b.hits = b.hits.filter((t) => now - t < windowMs);
    if (b.hits.length >= max) {
      const oldest = b.hits[0] ?? now;
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests' });
    }
    b.hits.push(now);
    next();
  };
}

// Authenticated-user key (falls back to IP when no user yet).
export const userKey =
  (prefix: string) => (req: express.Request) => {
    const u = (req as any).user as { id?: number } | undefined;
    return `${prefix}:${u?.id ?? clientIp(req)}`;
  };

// Presets (documented in Project_Snapshot: SEC-02)
export const loginLimiter = () =>
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, prefix: 'login' });
export const appealsLimiter = () =>
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5, prefix: 'appeals' });
export const questionnaireLimiter = () =>
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5, prefix: 'questionnaire' });
export const aiChatLimiter = () =>
  rateLimit({ windowMs: 60 * 60 * 1000, max: 30, prefix: 'aichat' });
export const editorLimiter = () =>
  rateLimit({ windowMs: 60 * 60 * 1000, max: 120, keyOf: userKey('editor'), prefix: 'editor' });
export const indexLimiter = () =>
  rateLimit({ windowMs: 60 * 60 * 1000, max: 30, keyOf: userKey('index'), prefix: 'index' });

import express from 'express';

// Shared Cache-Control middleware for public GET APIs (ARCH-01).
//
// Caching stays opt-in per route on purpose: a blanket rule on `/api/*` would
// happily mark a user-specific endpoint as publicly cacheable, so each route
// that is genuinely public has to say so here.
//
// `stale-while-revalidate` is added so a repeat visit is served from cache
// instantly while the refresh happens in the background. It only widens the
// window during which an already-public response is reused, so it does not
// change which routes are cacheable.
export const cache =
  (seconds: number) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 5}`);
    next();
  };

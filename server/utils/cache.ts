import express from 'express';

// Shared Cache-Control middleware for public GET APIs (ARCH-01).
export const cache =
  (seconds: number) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', `public, max-age=${seconds}`);
    next();
  };

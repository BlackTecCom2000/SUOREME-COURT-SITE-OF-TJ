import { randomBytes } from 'node:crypto';

const DEVELOPMENT_SECRET = 'development-only-change-me';
const ENV_EXAMPLE_SECRET = 'change-me-to-a-long-random-string-min-32-chars';

let cachedSecret: string | undefined;

export function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;

  const configuredSecret = process.env.CMS_JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!configuredSecret) {
      throw new Error(
        'Invalid CMS_JWT_SECRET: it is required in production. Set a unique random secret of at least 32 characters.',
      );
    }

    if (
      configuredSecret.length < 32 ||
      configuredSecret === DEVELOPMENT_SECRET ||
      configuredSecret === ENV_EXAMPLE_SECRET
    ) {
      throw new Error(
        'Invalid CMS_JWT_SECRET: production requires a unique random secret of at least 32 characters; development and .env.example values are not allowed.',
      );
    }

    cachedSecret = configuredSecret;
    return cachedSecret;
  }

  if (configuredSecret) {
    cachedSecret = configuredSecret;
    return cachedSecret;
  }

  cachedSecret = randomBytes(48).toString('hex');
  console.warn(
    '[security] CMS_JWT_SECRET is unset; using a temporary random development secret. Sessions will not survive a restart.',
  );
  return cachedSecret;
}

/**
 * The running application version.
 *
 * Injected by Vite from package.json (see `define` in vite.config.ts), so it can
 * never drift from the released version again. The footer used to carry a
 * literal string that stayed at "v2.6.0" while the project was already on
 * 2.16.0.
 */
declare const __APP_VERSION__: string | undefined;

/** e.g. "2.17.0". Falls back to "dev" for test runners that skip the define. */
export const APP_VERSION: string =
  typeof __APP_VERSION__ === 'string' && __APP_VERSION__ ? __APP_VERSION__ : 'dev';

/** Display form, e.g. "v2.17.0". */
export const APP_VERSION_LABEL = `v${APP_VERSION}`;

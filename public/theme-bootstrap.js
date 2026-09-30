/**
 * Applies the saved theme before the first paint.
 *
 * This used to be an inline <script>, which production CSP blocked: the policy
 * is script-src 'self' with no unsafe-inline and no hash for this snippet, so
 * the browser discarded it. Every visit therefore painted the default dark
 * theme first and then corrected itself, which is the flash this file exists to
 * prevent. Serving it from the site root keeps the guarantee and satisfies the
 * policy without weakening it or maintaining a hash that breaks on every edit.
 *
 * Must stay synchronous and unhashed: it is loaded from <head> with no defer or
 * async so it runs before the body is painted.
 */
(function () {
  try {
    var saved =
      localStorage.getItem('sud-theme') || localStorage.getItem('supreme-court-theme');
    var theme = saved === 'light' || saved === 'dark' ? saved : 'dark';

    // No explicit choice yet: follow the operating system, matching what
    // ThemeContext resolves after hydration.
    if (!saved) {
      theme =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    }

    var root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch (e) {
    // Private mode can throw on localStorage access; the default theme is fine.
  }
})();

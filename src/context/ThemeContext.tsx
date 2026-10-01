import React, { createContext, startTransition, useContext, useEffect, useState } from 'react';
import { useThemeStore } from '../theme/store';

export type Theme = 'light' | 'dark';

/** Must match what the server renders; the client reconciles to the store's
 *  published scheme after it loads. */
const DEFAULT_THEME: Theme = 'dark';

export interface SetThemeOptions {
  /** `false` skips the View Transition — for callers that own their own
   *  (see useThemeReveal): nesting transitions makes the browser skip them. */
  transition?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, options?: SetThemeOptions) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LEGACY_STORAGE_KEY = 'sud-theme';

/**
 * Legacy light/dark bridge.
 *
 * The platform has exactly one configuration — the theme store in
 * `src/theme`. This context keeps its original API (toggleTheme /
 * setTheme + reveal transitions, used by the navbar, admin menu and live
 * preview) but delegates every change to the store, so a visitor toggle and
 * a Site Builder scheme change are the same event on the same config. It no
 * longer writes `data-theme`/`.dark` itself: the store's CSS projection is
 * the only writer, which removes the render race the two providers used to
 * have.
 *
 * It is optional about the store because it must also render during SSR,
 * where no provider has mounted yet.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useThemeStore();
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  /* Follow the store: when the CMS publishes a scheme (or the Site Builder
     changes it), the toggle's state must reflect it. startTransition keeps
     this non-urgent so it cannot interrupt hydration. */
  const scheme = store?.theme.scheme;
  useEffect(() => {
    if (!scheme) return;
    if (scheme === theme) return;
    startTransition(() => setThemeState(scheme));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme]);

  const applyToStore = (newTheme: Theme) => {
    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, newTheme);
      localStorage.setItem('supreme-court-theme', newTheme);
    } catch {
      // ignore
    }
    /* The store's effect projects the scheme onto the document, including
       inside the View Transition snapshot, so the morph shows the full
       token set — not just the class flip it used to be. */
    store?.patch({ scheme: newTheme });
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme, options?: SetThemeOptions) => {
    if (newTheme === theme) return;

    if (options?.transition === false) {
      applyToStore(newTheme);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (
      !prefersReducedMotion &&
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof (document as Document & { startViewTransition: unknown }).startViewTransition ===
        'function'
    ) {
      document.documentElement.classList.add('is-morphing-theme');

      const transition = (
        document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }
      ).startViewTransition(() => {
        applyToStore(newTheme);
      });

      transition.finished
        .catch(() => {})
        .finally(() => {
          document.documentElement.classList.remove('is-morphing-theme');
        });
    } else {
      applyToStore(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

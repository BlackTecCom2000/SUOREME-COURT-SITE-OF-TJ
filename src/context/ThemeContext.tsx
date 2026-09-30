import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

export type Theme = 'light' | 'dark';

/** Must match what the server renders; the client reconciles to the visitor's
 *  stored preference in a layout effect after hydration. */
const DEFAULT_THEME: Theme = 'dark';

/** Layout effects warn on the server, where they never run anyway. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, options?: SetThemeOptions) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

/**
 * `transition: false` applies the theme without starting a View Transition.
 * Callers that own their own transition (see useThemeReveal) need this: a
 * View Transition started inside another one is skipped by the browser, so
 * nesting them would silently disable the reveal.
 */
export interface SetThemeOptions {
  transition?: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'sud-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /* The initial value must be identical on the server and on the client, or the
     first client render disagrees with the server's HTML and React throws the
     whole document away (error #418). The server has no localStorage, so it can
     only ever render DEFAULT_THEME; reading the visitor's stored preference here
     is what used to break hydration.

     The real preference is applied in the layout effect below, before paint, so
     nothing is visible in the wrong theme. public/theme-bootstrap.js has already
     put the correct class on <html> by then. */
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  const resolveStoredTheme = (): Theme | null => {
    if (typeof window === 'undefined') return null;
    const stored =
      localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('supreme-court-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  useIsomorphicLayoutEffect(() => {
    const preferred = resolveStoredTheme();
    if (!preferred || preferred === theme) return;
    /* startTransition is required, not cosmetic: this update runs while React is
       still hydrating, and a plain setState here makes the Suspense boundary
       report "received an update before it finished hydrating" and fall back to
       client rendering, throwing away the server HTML all over again. The
       correction is non-urgent by nature - the correct class is already on
       <html> from theme-bootstrap.js - so a transition is the right priority. */
    startTransition(() => setThemeState(preferred));
    // Mount only: this reconciles the client with the server once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = (newTheme: Theme, options?: SetThemeOptions) => {
    if (newTheme === theme) return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      localStorage.setItem('supreme-court-theme', newTheme);
    } catch {
      // ignore
    }

    if (options?.transition === false) {
      setThemeState(newTheme);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // View Transitions API for theme morph
    if (
      !prefersReducedMotion &&
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      typeof (document as any).startViewTransition === 'function'
    ) {
      document.documentElement.classList.add('is-morphing-theme');
      
      const transition = (document as any).startViewTransition(() => {
        setThemeState(newTheme);
      });

      transition.finished
        .catch(() => {})
        .finally(() => {
          document.documentElement.classList.remove('is-morphing-theme');
        });
    } else {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

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

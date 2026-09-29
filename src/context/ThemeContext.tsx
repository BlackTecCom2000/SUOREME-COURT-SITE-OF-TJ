import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('supreme-court-theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

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

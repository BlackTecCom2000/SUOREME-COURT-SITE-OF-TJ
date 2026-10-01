import React, {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ThemeConfig, ThemePatch } from './types';
import { applySettingsVariables, applyThemeVariables } from './cssVars';
import { clonePreset, DEFAULT_PRESET_ID } from './presets';
import { decodeTheme, encodeTheme, THEME_PRESET_KEY, THEME_STORAGE_KEY, validateTheme } from './validate';

/**
 * The Theme Store: one authoritative configuration for the whole platform.
 *
 * Both halves of the application read and write here:
 *   - the public site mounts <ThemeProvider mode="runtime">
 *   - Site Builder mounts <ThemeProvider mode="editor">
 *
 * `runtime` reads published values and never writes. `editor` reads drafts,
 * writes drafts, and still applies them to the live document, which is what
 * makes the preview genuinely live rather than a mock. There is no second
 * configuration object anywhere: the provider holds the ThemeConfig, the CSS
 * generator projects it, and components only ever see CSS variables.
 *
 * Persistence reuses the existing `site_design_settings` table under two rows
 * (`theme_config_v1`, `theme_preset`). No second database.
 */

export type ThemeMode = 'runtime' | 'editor';

export interface ThemeContextValue {
  theme: ThemeConfig;
  presetId: string;
  mode: ThemeMode;
  /** True until the first fetch settles, so the UI can avoid a flash. */
  ready: boolean;
  /** Editor only: mutate the in-memory config; CSS variables follow immediately. */
  patch: (patch: ThemePatch) => void;
  /** Editor only: replace the whole config (preset application, reset). */
  replace: (theme: ThemeConfig, presetId?: string) => void;
  /** Editor only: persist draft to the server. Returns true on success. */
  saveDraft: () => Promise<boolean>;
  /** Editor only: persist and publish, so the public site picks it up. */
  publish: () => Promise<boolean>;
  /** Editor only: discard local edits and reload from the server. */
  reload: () => Promise<void>;
  /** Editor only: restore a preset into the editor (not yet persisted). */
  applyPreset: (presetId: string) => void;
  /** Editor only: update one CMS design-settings row in place (the
   *  background/atmosphere keys the Site Builder edits). The value is applied
   *  to CSS variables immediately and remembered until the next save. */
  setSetting: (key: string, value: string) => void;
  /** True while the editor has unsaved changes (theme rows or settings). */
  dirty: boolean;
  /** Raw settings bag: drafts in editor mode, published values at runtime.
   *  Carries the per-surface values that are not theme-level, chiefly the
   *  background photographs, which the CMS controls directly. */
  settings: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isEditor = () =>
  typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

interface ProviderProps {
  children: React.ReactNode;
  mode?: ThemeMode;
}

export const ThemeProvider: React.FC<ProviderProps> = ({ children, mode }) => {
  const resolvedMode: ThemeMode = mode ?? (isEditor() ? 'editor' : 'runtime');
  const editor = resolvedMode === 'editor';

  const [theme, setTheme] = useState<ThemeConfig>(() => clonePreset(DEFAULT_PRESET_ID));
  const [presetId, setPresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const dirtyKeysRef = useRef<Set<string>>(new Set());
  /** Fingerprint of the last payload applied to the store. The runtime poll
   *  compares against this (not against current state) so in-session changes
   *  like a visitor's light/dark toggle survive until something actually gets
   *  published. */
  const lastLoadedRef = useRef<string | null>(null);

  const settingsEqual = (a: Record<string, string>, b: Record<string, string>): boolean => {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => a[k] === b[k]);
  };

  /* ── load ─────────────────────────────────────────────────────────────
     Runtime reads published values, the editor reads drafts (falling back
     to published for rows that were never drafted, so the editor always
     shows what the public site shows). Same provider, same parser, one
     configuration object either way. Idempotent: unchanged rows do not
     force a re-render, which also makes the runtime poll cheap. */
  const load = useCallback(async (force = true) => {
    try {
      const url = editor ? '/api/admin/design-settings' : '/api/design-settings';
      const res = await fetch(url, { credentials: editor ? 'include' : 'same-origin' });
      if (!res.ok) throw new Error(`settings ${res.status}`);
      const raw = (await res.json()) as Record<string, string> | Array<Record<string, string>>;

      const bag: Record<string, string> = {};
      if (Array.isArray(raw)) {
        raw.forEach((row) => {
          const v = editor
            ? row.draft_value ?? row.published_value ?? ''
            : row.value ?? row.published_value;
          if (row.key) bag[row.key] = v ?? '';
        });
      } else {
        Object.assign(bag, raw);
      }

      const storedPreset = bag[THEME_PRESET_KEY];
      const nextPreset = storedPreset || DEFAULT_PRESET_ID;
      const next = decodeTheme(bag[THEME_STORAGE_KEY], nextPreset) ?? clonePreset(nextPreset);
      const fingerprint = `${nextPreset}|${encodeTheme(next)}|${Object.keys(bag)
        .sort()
        .map((k) => `${k}=${bag[k]}`)
        .join('&')}`;

      if (!force && lastLoadedRef.current === fingerprint) {
        return;
      }
      lastLoadedRef.current = fingerprint;
      dirtyKeysRef.current.clear();
      /* After the hydration gate above this is a normal update, but the
         transition keeps the runtime poll from interrupting a render. */
      startTransition(() => {
        setDirty(false);
        setTheme((prev) => (encodeTheme(prev) === encodeTheme(next) ? prev : next));
        setPresetId((prev) => (prev === nextPreset ? prev : nextPreset));
        setSettings((prev) => (settingsEqual(prev, bag) ? prev : bag));
      });
    } catch {
      // offline or not yet published: the preset defaults already applied are
      // a complete, valid configuration, so there is nothing to recover from.
    } finally {
      startTransition(() => setReady(true));
    }
  }, [editor]);

  /* First load waits until hydration has actually finished (see MountSignal
     in entry-client). This provider sits ABOVE the app's Suspense boundary,
     so any setState before that point propagates into the still-hydrating
     subtree and React abandons hydration with #421 ("this Suspense boundary
     received an update before it finished hydrating"), re-rendering the
     whole tree client-side. The flag is set before the listener can miss it,
     so a re-render or a late mount never skips the first load. */
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) void load();
    };
    if ((window as any).__SUD_HYDRATED__) {
      start();
      return () => {
        cancelled = true;
      };
    }
    window.addEventListener('sud:hydrated', start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('sud:hydrated', start);
    };
  }, [load]);

  /* Runtime: pick up a publish from another tab/session without a reload.
     The editor never polls — it owns its unsaved state. */
  useEffect(() => {
    if (editor) return;
    const id = window.setInterval(() => {
      void load(false);
    }, 30000);
    return () => window.clearInterval(id);
  }, [editor, load]);

  /* ── project onto the document ───────────────────────────────────────
     One place writes CSS variables for the entire application: theme rows
     and the background/atmosphere settings through the same root element. */
  useEffect(() => {
    applyThemeVariables(theme);
  }, [theme]);

  useEffect(() => {
    applySettingsVariables(settings);
  }, [settings]);

  const patch = useCallback((next: ThemePatch) => {
    setDirty(true);
    setTheme((current) => {
      const merged = {
        ...current,
        ...next,
        colors: { ...current.colors, ...(next.colors ?? {}) },
        glass: { ...current.glass, ...(next.glass ?? {}) },
        radius: { ...current.radius, ...(next.radius ?? {}) },
        spacing: { ...current.spacing, ...(next.spacing ?? {}) },
        shadows: { ...current.shadows, ...(next.shadows ?? {}) },
        typography: { ...current.typography, ...(next.typography ?? {}) },
        effects: { ...current.effects, ...(next.effects ?? {}) },
      } as ThemeConfig;
      return validateTheme(merged, presetId);
    });
  }, [presetId]);

  const replace = useCallback((next: ThemeConfig, nextPreset?: string) => {
    setDirty(true);
    setTheme(validateTheme(next, nextPreset));
    if (nextPreset) setPresetId(nextPreset);
  }, []);

  const applyPreset = useCallback((nextPreset: string) => {
    setDirty(true);
    setPresetId(nextPreset);
    setTheme(clonePreset(nextPreset));
  }, []);

  const setSetting = useCallback((key: string, value: string) => {
    dirtyKeysRef.current.add(key);
    setDirty(true);
    setSettings((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  /** Writes the theme rows plus every edited setting in ONE request
   *  through the existing endpoint. */
  const persist = useCallback(
    async (alsoPublish: boolean): Promise<boolean> => {
      try {
        const keys = [
          { key: THEME_STORAGE_KEY, value: encodeTheme(themeRef.current) },
          { key: THEME_PRESET_KEY, value: presetId },
          ...Array.from(dirtyKeysRef.current).map((key) => ({
            key,
            value: settingsRef.current[key] ?? '',
          })),
        ];
        const saved = await fetch('/api/admin/design-settings', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keys }),
        });
        if (!saved.ok) return false;

        if (alsoPublish) {
          const published = await fetch('/api/admin/site/publish', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Publish theme configuration' }),
          });
          if (!published.ok) return false;
        }
        dirtyKeysRef.current.clear();
        setDirty(false);
        return true;
      } catch {
        return false;
      }
    },
    [presetId]
  );

  const saveDraft = useCallback(() => persist(false), [persist]);
  const publish = useCallback(() => persist(true), [persist]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      presetId,
      mode: resolvedMode,
      ready,
      patch,
      replace,
      saveDraft,
      publish,
      reload: load,
      applyPreset,
      setSetting,
      dirty,
      settings,
    }),
    [theme, presetId, resolvedMode, ready, patch, replace, saveDraft, publish, load, applyPreset, setSetting, dirty, settings]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Optional accessor: the store if a provider is mounted above, otherwise
 * null. Used by bridges (the legacy light/dark context) that must also work
 * during SSR, where effects never ran and no client state exists.
 */
export const useThemeStore = (): ThemeContextValue | null => useContext(ThemeContext);

/**
 * Reads the theme. Must be used inside <ThemeProvider>, which is the point:
 * a component that needs theme values has to be under the one provider, so
 * there is no way to accidentally build against a second configuration.
 */
export const useThemeConfig = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeConfig must be used inside <ThemeProvider>');
  }
  return ctx;
};

/** Convenience for the many components that only need the configuration. */
export const useTheme = (): ThemeConfig => useThemeConfig().theme;

import { useEffect } from 'react';

// Per-page document title + meta description (+ OG tags) for SEO,
// plus SEO-01: canonical URL + hreflang (tj/ru/en) + optional robots.
// Falls back to portal defaults; safe for SSR (guards document).
// Admin pages must pass { robots: 'noindex, nofollow' }.
export function usePageMeta(
  title: string,
  description?: string,
  opts?: { canonical?: string; robots?: string }
) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const site = 'Верховный суд Республики Таджикистан';
    document.title = title ? `${title} — SUD.TJ` : site;
    const desc =
      description ||
      'Официальный портал Верховного суда Республики Таджикистан: новости, судебные акты, законодательство, обращения граждан.';
    const ensure = (selector: string, create: () => HTMLElement) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      return el;
    };
    const setMeta = (selector: string, attrs: Record<string, string>, content: string) => {
      const el = ensure(selector, () => {
        const m = document.createElement('meta');
        for (const [k, v] of Object.entries(attrs)) m.setAttribute(k, v);
        return m;
      }) as HTMLMetaElement;
      el.setAttribute('content', content);
    };
    setMeta('meta[name="description"]', { name: 'description' }, desc);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, document.title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, desc);
    document.documentElement.setAttribute('og:site_name', 'SUD.TJ');

    // Canonical: absolute portal URL without tracking params (lang kept — ?lang= is canonical per language).
    try {
      const url = new URL(window.location.href);
      url.search = url.searchParams.has('lang') ? `?lang=${url.searchParams.get('lang')}` : '';
      url.hash = '';
      const canonical = opts?.canonical || url.toString();
      let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
      // hreflang: equivalent language pages via ?lang= (no invented URLs).
      const base = `${url.origin}${url.pathname}`;
      const langs: Array<[string, string]> = [
        ['tg', `${base}?lang=tj`],
        ['ru', `${base}?lang=ru`],
        ['en', `${base}?lang=en`],
        ['x-default', `${base}?lang=ru`],
      ];
      for (const [hl, href] of langs) {
        let l = document.head.querySelector(`link[rel="alternate"][hreflang="${hl}"]`) as HTMLLinkElement | null;
        if (!l) {
          l = document.createElement('link');
          l.setAttribute('rel', 'alternate');
          l.setAttribute('hreflang', hl);
          document.head.appendChild(l);
        }
        l.setAttribute('href', href);
      }
    } catch {
      /* ignore malformed URL */
    }
    if (opts?.robots) setMeta('meta[name="robots"]', { name: 'robots' }, opts.robots);
  }, [title, description, opts?.canonical, opts?.robots]);
}

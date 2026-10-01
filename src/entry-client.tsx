import React, { Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DeviceCapabilityProvider } from './context/DeviceCapabilityContext';
import { ThemeProvider } from './theme';
import './styles/tokens.css';
import './index.css';

const App = React.lazy(() => import('./App.tsx'));
const AdminApp = React.lazy(() => import('./AdminApp.tsx'));

const isAdminRoute = window.location.pathname.startsWith('/admin');

const rootEl = document.getElementById('root')!;

/* Lives INSIDE the Suspense boundary, so its effect only runs once the lazy
   App has mounted — which is exactly the commit that finishes hydration.
   The theme store listens for this before its first fetch: any state update
   it made before that point landed on a still-hydrating boundary and React
   abandoned hydration with #421, re-rendering the whole tree client-side. */
const MountSignal: React.FC = () => {
  React.useEffect(() => {
    (window as any).__SUD_HYDRATED__ = true;
    window.dispatchEvent(new Event('sud:hydrated'));
  }, []);
  return null;
};

/* One provider for both applications. It resolves to editor mode on /admin and
   runtime mode elsewhere, so Site Builder and the public site read the very
   same Theme Configuration object instead of two divergent copies.

   DeviceCapabilityProvider is INSIDE the Suspense boundary on purpose: its
   mount effect calls setCapability, and a context provider above the boundary
   would propagate that update into the still-hydrating subtree — React
   abandons hydration with #421 ("this Suspense boundary received an update
   before it finished hydrating"). Inside, its effect only runs after the
   hydration commit, when updates are safe. */
const app = (
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          <MountSignal />
          <DeviceCapabilityProvider>
            {isAdminRoute ? <AdminApp /> : <App />}
          </DeviceCapabilityProvider>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

/* Hydrate only when the server actually sent markup. The production server
   fills <!--ssr-outlet--> with the rendered app, but the Vite dev server serves
   index.html untouched, leaving only that comment inside #root. Calling
   hydrateRoot on it threw "Hydration failed because the initial UI does not
   match" on every dev page load, which buried the console and hid real errors.
   Both branches were previously identical despite the comment claiming
   otherwise.

   firstElementChild, not hasChildNodes: the leftover <!--ssr-outlet--> comment
   is itself a child node, so hasChildNodes() reported true and the check did
   nothing. */
if (rootEl.firstElementChild !== null) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}

/* Offline + repeat-visit caching. Registered after hydration so it never
   competes with the first paint, and skipped in dev where hashed assets and
   HMR make a cache actively harmful. */
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      /* caching is an enhancement; the site must work without it */
    });
  });
}
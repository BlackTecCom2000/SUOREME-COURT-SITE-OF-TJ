import React, { Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DeviceCapabilityProvider } from './context/DeviceCapabilityContext';
import './styles/tokens.css';
import './index.css';

const App = React.lazy(() => import('./App.tsx'));
const AdminApp = React.lazy(() => import('./AdminApp.tsx'));

const isAdminRoute = window.location.pathname.startsWith('/admin');

const rootEl = document.getElementById('root')!;

const app = (
  <React.StrictMode>
    <DeviceCapabilityProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
          {isAdminRoute ? <AdminApp /> : <App />}
        </Suspense>
      </BrowserRouter>
    </DeviceCapabilityProvider>
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
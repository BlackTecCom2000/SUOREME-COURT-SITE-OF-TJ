import React, { Suspense } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
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

if (import.meta.env.DEV) {
  // In dev, if SSR is disabled or we hit a hot reload, we might not have server-rendered HTML.
  // We can just hydrate safely or fallback to render if not SSR'd.
  // Actually, standard vite SSR pattern: just hydrate.
  hydrateRoot(rootEl, app);
} else {
  hydrateRoot(rootEl, app);
}

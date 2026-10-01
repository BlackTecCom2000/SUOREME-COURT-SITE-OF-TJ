import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { DeviceCapabilityProvider } from './context/DeviceCapabilityContext';
import { ThemeProvider } from './theme';
import App from './App';
import AdminApp from './AdminApp';

export function render(url: string) {
  const isAdminRoute = url.startsWith('/admin');

  /* The store's ThemeProvider is mandatory here, not optional: components
     like GlobalBackground read the theme configuration through
     useThemeConfig, which throws without a provider. During SSR that error
     was captured by the Suspense boundary, so the boundary never finished
     and the client logged React #419 ("the server could not finish this
     Suspense boundary") on every page load. The provider renders the same
     default preset the client starts with (its fetch effects do not run on
     the server), so the markup still hydrates exactly. */
  const html = renderToString(
    <React.StrictMode>
      <ThemeProvider>
        <StaticRouter location={url}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
            <DeviceCapabilityProvider>
              {isAdminRoute ? <AdminApp /> : <App />}
            </DeviceCapabilityProvider>
          </Suspense>
        </StaticRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
  return { html };
}

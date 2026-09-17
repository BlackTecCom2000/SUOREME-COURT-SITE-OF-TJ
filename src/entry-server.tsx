import React, { Suspense } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { DeviceCapabilityProvider } from './context/DeviceCapabilityContext';
import App from './App';
import AdminApp from './AdminApp';

export function render(url: string) {
  const isAdminRoute = url.startsWith('/admin');

  const html = renderToString(
    <React.StrictMode>
      <DeviceCapabilityProvider>
        <StaticRouter location={url}>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
            {isAdminRoute ? <AdminApp /> : <App />}
          </Suspense>
        </StaticRouter>
      </DeviceCapabilityProvider>
    </React.StrictMode>
  );
  return { html };
}

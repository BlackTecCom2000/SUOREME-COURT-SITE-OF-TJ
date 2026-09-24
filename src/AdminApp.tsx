import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import { AdminShell } from './admin/components/AdminShell';
import { AdminLogin } from './admin/pages/AdminLogin';
import { Dashboard } from './admin/pages/Dashboard';
import { NewsList } from './admin/pages/content/NewsList';
import { NewsEditor } from './admin/pages/content/NewsEditor';
import { JudicialActsManager } from './admin/pages/acts/JudicialActsManager';
import { ShelfBooksManager } from './admin/pages/books/ShelfBooksManager';
import { CourtsManager } from './admin/pages/courts/CourtsManager';
import { AppealsManager } from './admin/pages/appeals/AppealsManager';
import { MediaLibrary } from './admin/pages/media/MediaLibrary';
import { UsersManager } from './admin/pages/users/UsersManager';
import { AuditLogViewer } from './admin/pages/audit/AuditLogViewer';
import { SettingsManager } from './admin/pages/settings/SettingsManager';
import { DutyAdminManager } from './admin/pages/duty/DutyAdminManager';
import { JudicialSystemVisualEditor } from './admin/pages/content/JudicialSystemVisualEditor';
import { AiDashboard } from './admin/pages/AiDashboard';
import { UsefulSitesManager } from './admin/pages/useful/UsefulSitesManager';
import { SiteBuilder } from './admin/pages/siteBuilder/SiteBuilder';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const ScopedDenied: React.FC<{ siteId: string }> = ({ siteId }) => (
  <div className="min-h-screen bg-[#04070f] text-slate-200 flex items-center justify-center p-4">
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#070d1a]/90 p-8 text-center space-y-4">
      <div className="font-mono text-xs uppercase tracking-widest text-amber-400">Restricted area</div>
      <p className="font-sans text-sm text-slate-300">
        Your account is bound to a court site and cannot access the main portal admin.
      </p>
      <a
        href={'/courts/' + siteId + '/admin'}
        className="inline-flex items-center justify-center h-10 px-5 text-sm gap-2 rounded-xl bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-slate-950 font-semibold"
      >
        Open your court admin
      </a>
    </div>
  </div>
);

const AdminRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAdminAuth();

  // SEO-01: admin pages must never be indexed.
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    let meta = document.head.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  if (user && user.site_id) {
    return <ScopedDenied siteId={user.site_id} />;
  }

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Dashboard />} />
          <Route path="news" element={<NewsList />} />
          <Route path="news/new" element={<NewsEditor />} />
          <Route path="news/:id" element={<NewsEditor />} />
          <Route path="acts" element={<JudicialActsManager />} />
          <Route path="books" element={<ShelfBooksManager />} />
          <Route path="courts" element={<CourtsManager />} />
          <Route path="structure-editor" element={<JudicialSystemVisualEditor />} />
          <Route path="appeals" element={<AppealsManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="audit" element={<AuditLogViewer />} />
          <Route path="settings" element={<SettingsManager />} />
          <Route path="ai" element={<AiDashboard />} />
          <Route path="duty" element={<DutyAdminManager />} />
          <Route path="useful" element={<UsefulSitesManager />} />
          <Route path="site-builder" element={<SiteBuilder />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  );
};

export default function AdminApp() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AdminAuthProvider>
          <AdminRoutes />
        </AdminAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

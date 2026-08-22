import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import { AdminShell } from './admin/components/AdminShell';
import { AdminLogin } from './admin/pages/AdminLogin';
import { Dashboard } from './admin/pages/Dashboard';
import { NewsList } from './admin/pages/content/NewsList';
import { NewsEditor } from './admin/pages/content/NewsEditor';
import { JudicialActsManager } from './admin/pages/acts/JudicialActsManager';
import { CourtsManager } from './admin/pages/courts/CourtsManager';
import { AppealsManager } from './admin/pages/appeals/AppealsManager';
import { MediaLibrary } from './admin/pages/media/MediaLibrary';
import { UsersManager } from './admin/pages/users/UsersManager';
import { AuditLogViewer } from './admin/pages/audit/AuditLogViewer';
import { SettingsManager } from './admin/pages/settings/SettingsManager';
import { DutyAdminManager } from './admin/pages/duty/DutyAdminManager';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const AdminRoutes: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Dashboard />} />
          <Route path="news" element={<NewsList />} />
          <Route path="news/new" element={<NewsEditor />} />
          <Route path="news/:id" element={<NewsEditor />} />
          <Route path="acts" element={<JudicialActsManager />} />
          <Route path="courts" element={<CourtsManager />} />
          <Route path="appeals" element={<AppealsManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="audit" element={<AuditLogViewer />} />
          <Route path="settings" element={<SettingsManager />} />
          <Route path="duty" element={<DutyAdminManager />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
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

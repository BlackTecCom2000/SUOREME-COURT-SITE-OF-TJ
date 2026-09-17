/// <reference types="vite/client" />
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { A11yProvider } from './context/A11yContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutCourtPage } from './pages/AboutCourtPage';
import { LeadershipPage } from './pages/LeadershipPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { CourtSitePage } from './sites/CourtSitePage';
import { CourtSiteAdmin } from './sites/CourtSiteAdmin';
import { LibraryPage } from './pages/LibraryPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <A11yProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutCourtPage />} />
            <Route path="leadership" element={<LeadershipPage />} />
            <Route path="news/:slug" element={<ContentDetailPage />} />
            <Route path="announcements/:slug" element={<ContentDetailPage />} />
            <Route path="vacancies/:slug" element={<ContentDetailPage />} />
            <Route path="journal/:slug" element={<ContentDetailPage />} />
            <Route path="courts/:courtId" element={<CourtSitePage />} />
            <Route path="courts/:courtId/admin" element={<CourtSiteAdmin />} />
            <Route path="library" element={<LibraryPage />} />
          </Route>
        </Routes>
        </A11yProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

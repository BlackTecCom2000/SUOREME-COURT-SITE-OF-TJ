/// <reference types="vite/client" />
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutCourtPage } from './pages/AboutCourtPage';
import { LeadershipPage } from './pages/LeadershipPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutCourtPage />} />
            <Route path="leadership" element={<LeadershipPage />} />
          </Route>
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

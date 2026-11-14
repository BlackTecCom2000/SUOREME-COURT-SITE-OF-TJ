import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const ArchivePage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(
    L(language, 'Архиви филмҳо', 'Киноархив', 'Film Archive'),
    L(language, 'Архиви филмҳои Леон Васари', 'Киноархив Леона Васари', 'Leon Vasari Film Archive')
  );
  return (
    <div style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/leon-vasari-archive.html"
        title="Leon Vasari Film Archive"
        style={{ border: 'none', width: '100%', height: '100vh', display: 'block' }}
        loading="lazy"
      />
    </div>
  );
};

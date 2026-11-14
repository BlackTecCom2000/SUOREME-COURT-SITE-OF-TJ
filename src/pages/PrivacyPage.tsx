import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const PrivacyPage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(L(language,'Махфият','Конфиденциальность','Privacy'), L(language,'Сиёсати махфият','Политика конфиденциальности','Privacy policy'));
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl prose prose-sm text-theme-text">
      <Breadcrumbs items={[{ label: L(language,'Асосӣ','Главная','Home'), to: '/' }, { label: L(language,'Махфият','Конфиденциальность','Privacy') }]} />
      <h1 className="text-2xl font-bold mb-4">{L(language,'Сиёсати махфият','Политика конфиденциальности','Privacy policy')}</h1>
      <p className="text-theme-textSec leading-relaxed">
        {L(language,
          'Ин сомона маълумоти шахсии корбаронро ҷамъ намекунад, ба ғайр аз маълумоте, ки ҳангоми фиристодани муроҷиат ихтиёран пешниҳод мешавад. Маълумот барои коркарди муроҷиат истифода мешавад ва ба шахсони сеюм дода намешавад.',
          'Сайт не собирает персональные данные пользователей, кроме сведений, добровольно предоставляемых при подаче обращения. Данные используются для обработки обращения и не передаются третьим лицам.',
          'This website does not collect personal data except information voluntarily provided when submitting an appeal. Data is used to process the appeal and is not shared with third parties.')}
      </p>
      <p className="text-theme-textSec leading-relaxed mt-4">
        {L(language,'Барои саволҳо: info@sud.tj','По вопросам: info@sud.tj','For questions: info@sud.tj')}
      </p>
    </div>
  );
};

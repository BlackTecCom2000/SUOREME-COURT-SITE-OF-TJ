import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

export const AccessibilityPage: React.FC = () => {
  const { language } = useLanguage();
  usePageMeta(L(language,'Дастрасӣ','Доступность','Accessibility'), L(language,'Баёнияи дастрасӣ','Заявление о доступности','Accessibility statement'));
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl text-theme-text">
      <Breadcrumbs items={[{ label: L(language,'Асосӣ','Главная','Home'), to: '/' }, { label: L(language,'Дастрасӣ','Доступность','Accessibility') }]} />
      <h1 className="text-2xl font-bold mb-4">{L(language,'Баёнияи дастрасӣ','Заявление о доступности','Accessibility statement')}</h1>
      <p className="text-theme-textSec leading-relaxed">
        {L(language,
          'Сомона барои мутобиқат бо меъёрҳои WCAG 2.2 (сатҳи AA) тарҳрезӣ шудааст: контрасти матн, навигатсия аз клавиатура, дастгирии воситаҳои ёрирасон, эҳтироми prefers-reduced-motion.',
          'Сайт спроектирован с учётом требований WCAG 2.2 (уровень AA): контраст текста, клавиатурная навигация, поддержка вспомогательных технологий, уважение prefers-reduced-motion.',
          'This website is designed to meet WCAG 2.2 (Level AA): text contrast, keyboard navigation, assistive technology support, and respect for prefers-reduced-motion.')}
      </p>
      <p className="text-theme-textSec leading-relaxed mt-4">
        {L(language,'Барои гузориш дар бораи мушкилоти дастрасӣ: info@sud.tj','По вопросам доступности: info@sud.tj','For accessibility issues: info@sud.tj')}
      </p>
    </div>
  );
};

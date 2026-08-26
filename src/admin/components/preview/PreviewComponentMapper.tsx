import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

interface PreviewComponentMapperProps {
  type: string;
  data: any;
}

export const PreviewComponentMapper: React.FC<PreviewComponentMapperProps> = ({ type, data }) => {
  const { language } = useLanguage();

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center text-theme-textMuted bg-theme-bg/50">
        No content to preview
      </div>
    );
  }

  const getTitle = () => {
    if (language === 'tj' && data.title_tj) return data.title_tj;
    if (language === 'en' && data.title_en) return data.title_en;
    return data.title_ru || 'Untitled';
  };

  const getBody = () => {
    if (language === 'tj' && data.body_tj) return data.body_tj;
    if (language === 'en' && data.body_en) return data.body_en;
    return data.body_ru || 'No content';
  };

  const renderContent = () => {
    switch (type) {
      case 'news':
      case 'regional_news':
      case 'announcement':
      case 'vacancy':
      case 'page':
        return (
          <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-theme-text">
            {/* Category / Type Badge */}
            <div className="mb-6 flex items-center gap-3">
              <span className="px-3 py-1 bg-theme-gold/10 text-theme-gold text-xs font-bold uppercase tracking-wider rounded-md border border-theme-gold/20">
                {data.category || type.replace('_', ' ')}
              </span>
              {data.published_at && (
                <span className="text-theme-textMuted text-sm font-mono">
                  {new Date(data.published_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold leading-tight mb-8">
              {getTitle()}
            </h1>

            {/* Cover Image */}
            {data.cover_image && (
              <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10 shadow-2xl border border-theme-border">
                <img 
                  src={data.cover_image.startsWith('http') ? data.cover_image : `/uploads/${data.cover_image}`} 
                  alt={getTitle()} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {(data.excerpt_ru || data.excerpt_tj || data.excerpt_en) && (
              <div className="text-lg sm:text-xl text-theme-textSec leading-relaxed mb-10 font-light border-l-4 border-theme-gold pl-6">
                {language === 'tj' && data.excerpt_tj ? data.excerpt_tj : 
                 language === 'en' && data.excerpt_en ? data.excerpt_en : 
                 data.excerpt_ru}
              </div>
            )}

            {/* Body */}
            <div 
              className="prose prose-lg dark:prose-invert prose-headings:font-sans prose-headings:font-semibold prose-a:text-theme-gold max-w-none"
              dangerouslySetInnerHTML={{ __html: getBody() }}
            />
          </div>
        );

      case 'judicial_act':
        return (
          <div className="max-w-4xl mx-auto p-6 sm:p-10">
            <div className="bg-theme-surface border border-theme-border rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme-border/50">
                <div className="flex flex-col gap-2">
                  <span className="text-theme-gold font-mono text-sm tracking-widest uppercase">
                    Judicial Act
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-theme-text">
                    {getTitle()}
                  </h1>
                </div>
                <div className="w-16 h-16 rounded-full border border-theme-gold/30 flex items-center justify-center bg-theme-bg">
                  <span className="text-theme-gold">⚖️</span>
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: getBody() }} />
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-theme-textSec p-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full border border-theme-border flex items-center justify-center bg-theme-surface">
              📄
            </div>
            <h3 className="text-xl font-bold text-theme-text mb-2">Preview for '{type}'</h3>
            <p>The public component mapping for this type is under construction.</p>
            <p className="mt-4 text-xs font-mono bg-theme-bg p-4 rounded-lg border border-theme-border w-full text-left overflow-auto max-h-[300px]">
              {JSON.stringify(data, null, 2)}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-full bg-theme-bg pb-20">
      {renderContent()}
    </div>
  );
};

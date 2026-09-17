import React from 'react';
import { ArrowUpRight, Briefcase, Library, Megaphone, Newspaper, Scale } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export type PreviewPlacement = 'card' | 'slider' | 'row' | 'detail';

interface PreviewComponentMapperProps {
  type: string;
  data: any;
  placement?: PreviewPlacement;
}

export const placementsForType = (type: string): PreviewPlacement[] => {
  if (type === 'news') return ['slider', 'card', 'row', 'detail'];
  if (type === 'announcement') return ['card', 'row', 'detail'];
  if (type === 'vacancy' || type === 'journal') return ['card', 'detail'];
  return ['detail'];
};

export const PreviewComponentMapper: React.FC<PreviewComponentMapperProps> = ({ type, data, placement = 'detail' }) => {
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
    return data.body_ru || '';
  };

  const stripTags = (s: string) => String(s || '').replace(/<[^>]*>/g, '');
  const getExcerpt = () => {
    if (language === 'tj' && data.excerpt_tj) return data.excerpt_tj;
    if (language === 'en' && data.excerpt_en) return data.excerpt_en;
    return data.excerpt_ru || '';
  };

  // Effective publication date (backdating supported: published_at is authoritative)
  const effIso = data.status === 'scheduled' && data.scheduled_at ? data.scheduled_at : data.published_at || new Date().toISOString();
  const dateLabel = (() => { try { return new Date(effIso).toLocaleDateString(); } catch { return ''; } })();
  const isScheduled = data.status === 'scheduled';

  const badgeLabel =
    type === 'announcement'
      ? language === 'en' ? 'NOTICE' : language === 'tj' ? 'ЭЪЛОН' : 'ОБЪЯВЛЕНИЕ'
      : type === 'vacancy'
      ? language === 'en' ? 'VACANCY' : language === 'tj' ? 'ҶОЙИ КОРӢ' : 'ВАКАНСИЯ'
      : type === 'journal'
      ? language === 'en' ? 'JOURNAL' : language === 'tj' ? 'НАШРИЯ' : 'ЖУРНАЛ'
      : language === 'en' ? 'PRESS' : language === 'tj' ? 'МАТБУОТ' : 'ПРЕССА';
  const BadgeIcon = type === 'announcement' ? Megaphone : type === 'vacancy' ? Briefcase : type === 'journal' ? Library : Newspaper;

  const whereLabel =
    placement === 'card'
      ? language === 'en' ? 'Modal → press center' : language === 'tj' ? 'Модалка → маркази матбуот' : 'Модалка → пресс-центр'
      : placement === 'slider'
      ? language === 'en' ? 'Home + courts → 3D carousel' : language === 'tj' ? 'Асосӣ + судҳо → 3D-карусел' : 'Главная + суды → 3D-карусель'
      : placement === 'row'
      ? language === 'en' ? 'Court site → press row' : language === 'tj' ? 'Сомонаи суд → қатори матбуот' : 'Сайт суда → пресс-ряд'
      : '/' + type + '/' + (data.slug || '…');
  const dateNote = isScheduled
    ? (language === 'en' ? 'publishes ' : language === 'tj' ? 'нашр мешавад ' : 'выйдет ') + dateLabel
    : (language === 'en' ? 'dated ' : language === 'tj' ? 'санаи ' : 'дата ') + dateLabel;

  const contextBar = (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-theme-textMuted">
      <span className="text-theme-gold uppercase tracking-widest">
        {language === 'en' ? 'Shows at' : language === 'tj' ? 'Ҷойи намоиш' : 'Место показа'}: {whereLabel}
      </span>
      <span>• {dateNote}</span>
      {data.status && <span>• {data.status}</span>}
    </div>
  );

  // Real site placements — pixel-faithful copies of public components
  const renderPlacement = () => {
    const title = getTitle();
    const summary = stripTags(getExcerpt() || getBody()).slice(0, 200);
    const cover = data.cover_image
      ? (String(data.cover_image).startsWith('http') ? data.cover_image : '/uploads/' + data.cover_image)
      : null;

    if (placement === 'slider') {
      return (
        <div className="px-3 pt-6">
          <div className="w-full max-w-[560px] mx-auto rounded-3xl overflow-hidden border border-[#dfbe7e]/80 bg-theme-surface relative">
            <div className="relative w-full h-[300px] sm:h-[340px] overflow-hidden">
              {cover ? (
                <img src={cover} alt={title} className="w-full h-full object-cover object-center opacity-60" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-theme-gold/25 via-theme-surface to-theme-bg">
                  <Scale size={84} className="text-theme-gold/70" strokeWidth={1} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </div>
            <div className="relative p-5 sm:p-6 flex flex-col justify-end text-left -mt-24">
              <div className="flex items-center gap-2 mb-2 font-mono text-[10px]">
                <span className="px-2.5 py-0.5 rounded-full bg-theme-gold/20 text-theme-gold border border-theme-gold/40 font-bold uppercase tracking-wider">
                  {badgeLabel}
                </span>
                <span className="text-theme-textMuted">{dateLabel}</span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-2xl text-white leading-snug drop-shadow-sm mb-2">
                {title}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                {summary}
              </p>
              <div>
                <span className="btn-primary text-xs !py-1.5 !px-4 inline-flex items-center gap-1.5">
                  <span>{language === 'tj' ? 'Муфассал хондан' : language === 'en' ? 'Read Full Story' : 'Читать подробнее'}</span>
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (placement === 'row') {
      return (
        <div className="max-w-xl mx-auto px-4 pt-8">
          <div className="inline-block px-4 py-1.5 rounded-t-xl bg-theme-gold text-black font-mono text-xs font-bold uppercase tracking-widest">
            {type === 'announcement'
              ? language === 'en' ? 'Announcements' : language === 'tj' ? 'Эълонҳо' : 'Объявления'
              : language === 'en' ? 'News' : language === 'tj' ? 'Хабарҳо' : 'Новости'}
          </div>
          <div className="border-t-2 border-theme-gold pt-4">
            <h4 className="text-[13px] font-sans font-semibold uppercase leading-snug text-theme-text">
              {title}
            </h4>
            <span className="font-mono text-[11px] text-theme-textMuted">{dateLabel}</span>
          </div>
        </div>
      );
    }

    if (placement === 'card') {
      return (
        <div className="max-w-xl mx-auto px-4 pt-8">
          <div className="p-4 rounded-xl bg-theme-surface border border-theme-gold/60 shadow-sm">
            <div className="flex items-center justify-between font-mono text-[10px] text-theme-textMuted mb-2">
              <span className="flex items-center gap-1.5 text-theme-gold">
                <BadgeIcon size={12} />
                <span>{badgeLabel}</span>
              </span>
              <span>{dateLabel}</span>
            </div>
            <h4 className="text-sm font-medium text-theme-text mb-2 leading-snug">{title}</h4>
            {getExcerpt() && (
              <p className="text-xs text-theme-textSec leading-relaxed">{stripTags(getExcerpt())}</p>
            )}
            <div className="mt-3 pt-2 border-t border-theme-border flex items-center justify-end">
              <span className="font-mono text-xs px-3 py-1.5 rounded-lg border border-theme-border inline-flex items-center gap-1.5 text-theme-textSec">
                <span>{language === 'en' ? 'Open' : language === 'tj' ? 'Кушодан' : 'Открыть'}</span>
                <ArrowUpRight size={13} />
              </span>
            </div>
          </div>
        </div>
      );
    }

    // detail — exact copy of the public ContentDetailPage article
    const paras = String(getBody() || '').split(/\n+/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <article className="content-card relative overflow-hidden">
          <div className="border-l-2 border-theme-gold pl-4 py-1 mb-5">
            <span className="font-mono text-xs text-theme-gold tracking-widest uppercase flex items-center gap-1.5">
              <BadgeIcon size={13} />
              <span>{badgeLabel}</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-medium tracking-tight mt-2 leading-tight">{title}</h1>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-theme-textMuted mt-3">
              <span>{dateLabel}</span>
            </span>
          </div>
          {cover && (
            <img src={cover} alt="" className="w-full max-h-[420px] object-cover rounded-xl border border-theme-border mb-5" loading="lazy" />
          )}
          {paras.length === 0 ? (
            <p className="text-sm text-theme-textMuted">…</p>
          ) : (
            paras.map((p: string, i: number) => (
              <p key={i} className="text-sm sm:text-base leading-relaxed text-theme-textSec mb-4">{p}</p>
            ))
          )}
        </article>
      </div>
    );
  };

  const renderContent = () => {
    if (type === 'news' || type === 'announcement' || type === 'vacancy' || type === 'journal' || type === 'regional_news') {
      return (
        <>
          {contextBar}
          {renderPlacement()}
        </>
      );
    }
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

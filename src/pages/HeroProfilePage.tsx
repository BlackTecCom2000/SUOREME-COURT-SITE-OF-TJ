import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, Calendar, Images, Landmark, MapPin, ScrollText, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { HeroImage } from '../components/HeroImage';
import { heroCategoryLabel, type HeroRow } from '../hooks/useHeroes';

const L = (language: string, tj: string, ru: string, en: string) =>
  language === 'tj' ? tj : language === 'en' ? en : ru;

interface HeroDetail extends Omit<HeroRow, 'sources'> {
  hero_decree_ru?: string | null;
  hero_decree_tj?: string | null;
  hero_decree_en?: string | null;
  birth_place_ru?: string | null;
  birth_place_tj?: string | null;
  birth_place_en?: string | null;
  education_ru?: string | null;
  education_tj?: string | null;
  education_en?: string | null;
  career_ru?: string | null;
  career_tj?: string | null;
  career_en?: string | null;
  achievements_ru?: string | null;
  achievements_tj?: string | null;
  achievements_en?: string | null;
  contribution_ru?: string | null;
  contribution_tj?: string | null;
  contribution_en?: null | string;
  awards_ru?: string | null;
  awards_tj?: string | null;
  awards_en?: string | null;
  editorial_note?: string | null;
  gallery?: { file?: string; caption_ru?: string; caption_tj?: string; caption_en?: string; source?: string; license?: string }[];
  timeline?: { year?: string; event?: string }[];
  sources?: { label?: string; url?: string; level?: string }[];
  related?: HeroRow[];
}

const pick = (row: HeroDetail, key: string, language: string): string => {
  const suffix = language === 'tj' ? '_tj' : language === 'en' ? '_en' : '_ru';
  return String((row as any)[key + suffix] || '').trim();
};

const paragraphs = (value: string): string[] =>
  value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * Қаҳрамони Тоҷикистон — biography page.
 * Everything shown here comes from the CMS table `heroes` and carries its
 * sources; unverified entries are labelled for the editorial desk.
 */
export const HeroProfilePage: React.FC = () => {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [hero, setHero] = useState<HeroDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    fetch(`/api/heroes/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then((data: HeroDetail) => {
        if (cancelled) return;
        setHero(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setMissing(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const name = hero ? pick(hero, 'name', language) || hero.name_ru : '';
  usePageMeta(
    name || L(language, 'Қаҳрамони Тоҷикистон', 'Герои Таджикистана', 'Heroes of Tajikistan'),
    hero
      ? pick(hero, 'bio', language).slice(0, 300) ||
        `${name} — ${heroCategoryLabel(hero.category || 'other', language)}`
      : L(language, 'Биографии шахсониятҳои таърихӣ', 'Биографии исторических деятелей', 'Biographies of historical figures')
  );

  if (loading) {
    return (
      <div className="site-container px-4 sm:px-8 md:px-12 py-16 text-theme-text">
        <p className="font-mono text-sm text-theme-textMuted" role="status">
          {L(language, 'Бор мешавад…', 'Загрузка…', 'Loading…')}
        </p>
      </div>
    );
  }

  if (missing || !hero) {
    return (
      <div className="site-container px-4 sm:px-8 md:px-12 py-16 text-theme-text">
        <Breadcrumbs
          items={[
            { label: L(language, 'Қаҳрамони Тоҷикистон', 'Герои Таджикистана', 'Heroes of Tajikistan'), to: '/heroes' },
            { label: L(language, 'Ёфт нашуд', 'Не найдено', 'Not found') },
          ]}
        />
        <p className="text-theme-textSec">{L(language, 'Биография ёфт нашуд.', 'Биография не найдена.', 'Biography not found.')}</p>
        <Link to="/heroes" className="inline-flex items-center gap-2 mt-4 text-theme-gold hover:underline">
          <ArrowLeft size={16} />
          {L(language, 'Бозгашт', 'Назад', 'Back')}
        </Link>
      </div>
    );
  }

  const profession = pick(hero, 'profession', language);
  const birth = hero.birth_date || '';
  const death = hero.death_date || '';
  const years = birth && death ? `${birth} — ${death}` : birth;
  const birthPlace = pick(hero, 'birth_place', language);
  const portraitNote =
    (language === 'tj'
      ? hero.portrait_note_tj
      : language === 'en'
        ? hero.portrait_note_en
        : hero.portrait_note_ru) || '';
  const decree = pick(hero, 'hero_decree', language);
  const official = !!hero.is_official_hero;
  const sources = Array.isArray(hero.sources) ? hero.sources : [];
  const timeline = Array.isArray(hero.timeline) ? hero.timeline : [];
  const gallery = Array.isArray(hero.gallery) ? hero.gallery : [];
  const related = Array.isArray(hero.related) ? hero.related : [];

  const blocks = [
    { key: 'bio', label: L(language, 'Биография', 'Биография', 'Biography'), icon: BookOpen },
    { key: 'education', label: L(language, 'Таълимот', 'Образование', 'Education'), icon: Landmark },
    { key: 'career', label: L(language, 'Фаъолияти касбӣ', 'Профессиональная деятельность', 'Professional career'), icon: ScrollText },
    { key: 'achievements', label: L(language, 'Дастовардҳо', 'Достижения', 'Achievements'), icon: Award },
    { key: 'contribution', label: L(language, 'Супориш ба Тоҷикистон', 'Вклад в Таджикистан', 'Contribution to Tajikistan'), icon: ShieldCheck },
    { key: 'awards', label: L(language, 'Соиш ва мукофотҳо', 'Награды и звания', 'Awards and honours'), icon: Sparkles },
  ].filter((b) => paragraphs(pick(hero, b.key, language)).length > 0);

  return (
    <div className="site-container px-4 sm:px-8 md:px-12 py-10 text-theme-text">
      <Breadcrumbs
        items={[
          { label: L(language, 'Қаҳрамони Тоҷикистон', 'Герои Таджикистана', 'Heroes of Tajikistan'), to: '/heroes' },
          { label: name },
        ]}
      />

        {/* The biography arrives from the API after the first paint; the
            reserved height keeps the footer from jumping when it lands. */}
        <div className="min-h-[70vh]">
          <article className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* Portrait / identity */}
        <aside className="space-y-4">
          <div className="glass glass-card rounded-2xl border overflow-hidden">
            <div className="relative aspect-[4/5] bg-theme-bg/40">
              {hero.portrait_url ? (
                <HeroImage
                  src={hero.portrait_url}
                  alt={name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-serif font-bold text-5xl text-theme-gold/80">
                    {name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')}
                  </span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-2">
              {official && (
                <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-theme-gold/90 text-theme-bg text-[11px] font-semibold">
                  <Sparkles size={12} aria-hidden="true" />
                  {L(language, 'Қаҳрамони Тоҷикистон', 'Герой Таджикистана', 'Hero of Tajikistan')}
                </span>
              )}
              {portraitNote && (
                <p className="text-[11px] leading-snug text-theme-textMuted">{portraitNote}</p>
              )}
              <p className="text-sm text-theme-textSec">{heroCategoryLabel(hero.category || 'other', language)}</p>
              {years && (
                <p className="font-mono text-xs text-theme-textMuted tracking-[0.2em] flex items-center gap-1.5">
                  <Calendar size={12} aria-hidden="true" />
                  {years}
                </p>
              )}
              {birthPlace && (
                <p className="text-xs text-theme-textMuted flex items-center gap-1.5">
                  <MapPin size={12} aria-hidden="true" />
                  {birthPlace}
                </p>
              )}
            </div>
          </div>

          {decree && (
            <div className="rounded-2xl border border-theme-gold/40 bg-theme-gold/10 p-4">
              <div className="font-mono text-2xs font-bold uppercase tracking-[0.18em] text-theme-gold mb-1.5">
                {L(language, 'Унвони олӣ', 'Высшее звание', 'Supreme title')}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-theme-text">{decree}</p>
            </div>
          )}

          {hero.confidence && hero.confidence !== 'verified' && (
            <p className="text-[11px] leading-relaxed text-theme-textMuted border-l-2 border-theme-gold/50 pl-3">
              {L(
                language,
                'Маълумот ҳанӯз аз манбаъи расмӣ тасдиқ нашудааст ва барои бозбинии таҳрирӣ нишон дода шудааст.',
                'Данные ещё не подтверждены официальным источником и отмечены для редакционной проверки.',
                'This entry is not yet confirmed by an official source and is flagged for editorial review.'
              )}
              {hero.editorial_note ? ` ${hero.editorial_note}` : ''}
            </p>
          )}
        </aside>

        {/* Biography */}
        <div className="min-w-0 space-y-8">
          <header data-cinematic-stage="page" className="liquid-glass-title-pod p-6 sm:p-8">
            <h1 className="public-section-title type-glass text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
              {name}
            </h1>
            {profession && <p className="text-theme-textSec text-base sm:text-lg mt-3">{profession}</p>}
          </header>

          {blocks.map((b) => {
            const Icon = b.icon;
            return (
              <section key={b.key} aria-label={b.label}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="p-2 rounded-lg bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
                    <Icon size={15} />
                  </span>
                  <h2 className="text-lg sm:text-xl font-medium">{b.label}</h2>
                </div>
                <div className="glass glass-card rounded-2xl border p-5 sm:p-6 space-y-3">
                  {paragraphs(pick(hero, b.key, language)).map((p, i) => (
                    <p key={i} className="text-sm sm:text-[15px] leading-relaxed text-theme-textSec">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}

          {gallery.length > 0 && (
            <section aria-label={L(language, 'Галерея', 'Галерея', 'Gallery')}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="p-2 rounded-lg bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
                  <Images size={15} />
                </span>
                <h2 className="text-lg sm:text-xl font-medium">{L(language, 'Галерея', 'Галерея', 'Gallery')}</h2>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {gallery.map((g: any, i: number) => (
                  <li key={i} className="glass glass-card rounded-2xl border overflow-hidden">
                    <a href={g.file} target="_blank" rel="noopener noreferrer" className="block">
                      <HeroImage
                        src={g.file}
                        alt={g.caption_ru || ''}
                        className="w-full h-44 object-cover"
                      />
                    </a>
                    <div className="p-3">
                      <p className="text-xs leading-snug text-theme-textSec">
                        {language === 'tj' ? g.caption_tj : language === 'en' ? g.caption_en : g.caption_ru}
                      </p>
                      {g.source && (
                        <a
                          href={g.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1.5 font-mono text-[10px] uppercase tracking-wider text-theme-gold/80 hover:text-theme-gold"
                        >
                          {g.license || 'Wikimedia Commons'}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {timeline.length > 0 && (
            <section aria-label={L(language, 'Хронология', 'Хронология', 'Chronology')}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="p-2 rounded-lg bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
                  <Calendar size={15} />
                </span>
                <h2 className="text-lg sm:text-xl font-medium">{L(language, 'Хронология', 'Хронология', 'Chronology')}</h2>
              </div>
              <ol className="glass glass-card rounded-2xl border p-5 sm:p-6 space-y-3">
                {timeline.map((t, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-mono text-xs text-theme-gold shrink-0 w-20 pt-0.5">{t.year || ''}</span>
                    <span className="text-sm sm:text-[15px] leading-relaxed text-theme-textSec">{t.event || ''}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {sources.length > 0 && (
            <section aria-label={L(language, 'Манбаъҳо', 'Источники', 'Sources')}>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="p-2 rounded-lg bg-theme-gold/15 border border-theme-gold/30 text-theme-gold">
                  <ScrollText size={15} />
                </span>
                <h2 className="text-lg sm:text-xl font-medium">{L(language, 'Манбаъҳо', 'Источники', 'Sources')}</h2>
              </div>
              <ul className="glass glass-card rounded-2xl border p-5 sm:p-6 space-y-2">
                {sources.map((s, i) => (
                  <li key={i} className="text-sm">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-gold hover:underline underline-offset-2 break-all"
                      >
                        {s.label || s.url}
                      </a>
                    ) : (
                      <span className="text-theme-textSec">{s.label}</span>
                    )}
                    {s.level && (
                      <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-theme-textMuted">
                        {s.level}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section aria-label={L(language, 'Шахсиятҳои дигар', 'Другие деятели', 'Related personalities')}>
              <h2 className="text-lg sm:text-xl font-medium mb-3">
                {L(language, 'Шахсиятҳои дигар', 'Другие деятели', 'Related personalities')}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/heroes/${r.slug}`}
                      className="block glass glass-card rounded-xl border p-4 hover:border-theme-gold/50 transition-colors"
                    >
                      <p className="font-serif text-base text-theme-text">
                        {(language === 'tj' ? r.name_tj : language === 'en' ? r.name_en : r.name_ru) || r.name_ru}
                      </p>
                      <p className="text-xs text-theme-textMuted mt-1">
                        {(language === 'tj' ? r.profession_tj : language === 'en' ? r.profession_en : r.profession_ru) || ''}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link
            to="/heroes"
            className="inline-flex items-center gap-2 text-sm text-theme-gold hover:underline underline-offset-4"
          >
            <ArrowLeft size={15} />
            {L(language, 'Бозгашт ба архив', 'Вернуться в архив', 'Back to the archive')}
          </Link>
          </div>
        </article>
        </div>
    </div>
  );
};

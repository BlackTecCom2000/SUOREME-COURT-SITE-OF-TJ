import React, { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ArrowUpRight, Calendar, Clock, Landmark, Mail, MapPin, Phone, Scale, Send, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { DigitalDataRain } from "../components/effects/DigitalDataRain";
import { useLanguage } from "../context/LanguageContext";
import { Reveal } from "../components/Reveal";
import { ModalTab } from "../components/JudicialModal";
import { CourtNodeData } from "../data/sudTjData";
import { getCourtSite } from "./registry";
import { pickTri } from "./types";
import { Judicial3DNewsSlider } from "../components/news/Judicial3DNewsSlider";
import { CourtSiteNavbar } from "./CourtSiteNavbar";
import { LawBookshelf, useShelfBooks } from "../components/digital-court/LawBookshelf";

const SectionHead: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => (
  <Reveal>
    <div className="border-l-2 border-theme-gold pl-4 py-1 mb-6">
      <span className="font-mono text-xs text-theme-gold tracking-widest uppercase">{kicker}</span>
      <h2 className="text-2xl sm:text-4xl font-medium text-theme-text tracking-tight mt-1 uppercase">{title}</h2>
    </div>
  </Reveal>
);

export const CourtSitePage: React.FC = () => {
  const { courtId = '' } = useParams();
  const { language } = useLanguage();
  const { handleOpenSectionModal, handleOpenAiAssistant } = useOutletContext<{
    handleOpenSectionModal: (tab: ModalTab, court?: CourtNodeData) => void;
    handleOpenAiAssistant?: () => void;
  }>();

  const handleCourtSearch = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('case-search')?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };
  const cfg = getCourtSite(courtId);

  const [hearings, setHearings] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dbLeaders, setDbLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const shelfBooks = useShelfBooks();
  const navigate = useNavigate();

  useEffect(() => {
    if (!cfg) return;
    setLoading(true);
    Promise.all([
      fetch('/api/hearings?court=' + encodeURIComponent(cfg.courtNameRu)).then((r) => r.json()).catch(() => []),
      fetch('/api/news?region=' + cfg.region).then((r) => r.json()).catch(() => []),
      fetch('/api/announcements?region=' + cfg.region).then((r) => r.json()).catch(() => []),
      fetch('/api/leadership?court=' + cfg.id).then((r) => r.json()).catch(() => []),
    ]).then(([h, n, a, l]) => {
      setHearings(Array.isArray(h) ? h : []);
      setNews(Array.isArray(n) ? n : []);
      setAnnouncements(Array.isArray(a) ? a : []);
      setDbLeaders(Array.isArray(l) ? l : []);
      setLoading(false);
    });
  }, [courtId]);

  if (!cfg) {
    return (
      <div className="site-container px-4 sm:px-8 md:px-12 py-10 text-theme-text">
        <div className="content-card text-center py-12 font-mono text-sm text-theme-textSec">404</div>
      </div>
    );
  }

  const titleOf = (item: any) =>
    language === 'en' ? item.title_en || item.title_ru : language === 'tj' ? item.title_tj || item.title_ru : item.title_ru;

  const leaders = dbLeaders.length > 0
    ? dbLeaders.map((l: any) => ({
        name: { tj: l.name_tj || l.name_ru, ru: l.name_ru, en: l.name_en || l.name_ru },
        title: { tj: l.title_tj || l.title_ru || '', ru: l.title_ru || '', en: l.title_en || l.title_ru || '' },
      }))
    : cfg.leadership;

  return (
    <div className="text-theme-text">
      <CourtSiteNavbar
        config={cfg}
        hasLeadership={leaders.length > 0}
        onOpenSearch={handleCourtSearch}
        onOpenAiAssistant={() => handleOpenAiAssistant?.()}
        onOpenEsud={() => handleOpenSectionModal('esud')}
        onOpenAppeals={() => handleOpenSectionModal('appeals')}
      />
      {/* HERO (mirrors main Section01Hero) */}
      <section className="relative pt-24 lg:pt-32 pb-12 lg:pb-16 px-4 sm:px-8 md:px-12 overflow-hidden border-b border-theme-border/30 select-none">
        <DigitalDataRain density="sparse" speed="slow" opacity={0.14} colorTheme="gold" />

        {/* Top meta indicator */}
        <div className="site-container relative z-10 mb-6">
          <Reveal delay={100}>
            <div className="flex items-center justify-between font-mono text-theme-textSec text-xs">
              <div className="flex items-center gap-3">
                <span className="tracking-widest text-theme-gold font-semibold">( {cfg.id.toUpperCase()} )</span>
                <span className="text-theme-textMuted">[ SUD.TJ // COURTS ]</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                <span className="text-[10px] text-theme-textMuted tracking-wider uppercase hidden sm:inline">
                  {language === 'tj' ? 'СОМОНАИ СУД' : language === 'en' ? 'COURT WEBSITE' : 'САЙТ СУДА'}
                </span>
              </div>
              <div className="font-mono text-xs text-theme-textSec hidden md:flex items-center gap-2">
                <img
                  src={'/emblems/emblem-' + language + '.png'}
                  alt=""
                  className="w-5 h-5 object-contain rounded-full drop-shadow-sm"
                  loading="lazy"
                />
                <span>SUD.TJ // COURT SITE</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="site-container relative z-10">
          <Reveal delay={120}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-theme-gold/30 bg-theme-gold/10 text-theme-gold font-mono text-xs mb-4">
              <Sparkles size={13} />
              <span>
                {language === 'tj' ? 'СОМОНАИ РАСМИИ СУД' : language === 'en' ? 'OFFICIAL COURT WEBSITE' : 'ОФИЦИАЛЬНЫЙ САЙТ СУДА'}
              </span>
            </div>
          </Reveal>

          <div className="text-3xl font-medium uppercase leading-[1.06] tracking-tight text-theme-text drop-shadow-sm sm:text-5xl md:text-6xl">
            <Reveal delay={0} priority={true}>
              <div>{pickTri(cfg.name, language)}</div>
            </Reveal>
            <Reveal delay={150} priority={true}>
              <div className="normal-case italic font-light text-theme-gold">
                {pickTri(cfg.cityLine, language)}
              </div>
            </Reveal>
          </div>

          <Reveal delay={300}>
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-theme-textSec font-normal max-w-lg">
              {pickTri(cfg.about, language)}
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => handleOpenSectionModal('appeals')}
                aria-label="appeals"
                className="btn-primary shadow-lg shadow-theme-gold/20"
              >
                <Send size={15} />
                <span>
                  {language === 'tj' ? 'Муроҷиат навиштан' : language === 'en' ? 'File Appeal' : 'Написать обращение'}
                </span>
                <ArrowUpRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleOpenSectionModal('esud')}
                aria-label="esud"
                className="btn-secondary"
              >
                <ShieldCheck size={15} className="text-theme-gold" />
                <span>
                  {language === 'tj' ? 'Воридшавӣ' : language === 'en' ? 'Sign In' : 'Войти в систему'}
                </span>
              </button>
            </div>
          </Reveal>

          <Reveal delay={450}>
            <div className="mt-8 pt-6 border-t border-theme-border/40 grid grid-cols-3 gap-4 text-left font-mono max-w-lg">
              <div>
                <span className="text-xs text-theme-textMuted uppercase block">
                  {language === 'tj' ? 'Маҷлисҳо' : language === 'en' ? 'Hearings' : 'Заседания'}
                </span>
                <span className="text-lg font-bold text-theme-text">{hearings.length}</span>
              </div>
              <div>
                <span className="text-xs text-theme-textMuted uppercase block">
                  {language === 'tj' ? 'Хабарҳо' : language === 'en' ? 'News' : 'Новости'}
                </span>
                <span className="text-lg font-bold text-theme-text">{news.length}</span>
              </div>
              <div>
                <span className="text-xs text-theme-textMuted uppercase block">
                  {language === 'tj' ? 'Эълонҳо' : language === 'en' ? 'Notices' : 'Объявления'}
                </span>
                <span className="text-lg font-bold text-theme-text">{announcements.length}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <div className="mt-6 flex flex-wrap gap-2.5 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-surface/70 text-theme-textSec">
                <MapPin size={13} className="text-theme-gold" />
                <span>{pickTri(cfg.contacts.address, language)}</span>
              </span>
              <a href={'mailto:' + cfg.contacts.email} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-surface/70 text-theme-textSec hover:text-theme-gold hover:border-theme-gold transition-colors">
                <Mail size={13} className="text-theme-gold" />
                <span>{cfg.contacts.email}</span>
              </a>
              {cfg.contacts.phones.map((p) => (
                <a key={p} href={'tel:' + p.replace(/[^+\d]/g, '')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-surface/70 text-theme-textSec hover:text-theme-gold hover:border-theme-gold transition-colors">
                  <Phone size={13} className="text-theme-gold" />
                  <span>{p}</span>
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED SLIDER + STRATEGY TILES */}
      <section className="relative px-4 sm:px-8 md:px-12 py-10 lg:py-14 overflow-hidden">
        <div className="site-container relative z-10 space-y-5">
          {/* 3D News Carousel (like main project main news) */}
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-theme-gold/40 bg-theme-surface shadow-theme-card p-2 sm:p-3">
              <Judicial3DNewsSlider
                region={cfg.region}
                categoryTj="ХАБАРҲО"
                categoryRu="НОВОСТИ"
                categoryEn="NEWS"
                onOpenNewsItem={(item: any) => { if (item && item.url) navigate(item.url); }}
              />
            </div>
          </Reveal>

          {/* Strategy tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Landmark, url: 'http://sud.tj/upload/documents/strategiya_tj_2030.pdf', tj: 'Стратегияи миллии рушди ҶТ 2030', ru: 'Национальная стратегия развития РТ 2030', en: 'National Development Strategy 2030' },
              { icon: Target, url: 'https://sud.tj/upload/documents/BMR_2021_2025.pdf', tj: 'Барномаи миёнамуҳлати рушди ҶТ', ru: 'Среднесрочная программа развития РТ', en: 'Mid-term Development Programme' },
              { icon: ShieldCheck, url: 'https://sud.tj/upload/medialibrary/241/2416429f1c2c5124e5d5af5ffb8da83f.pdf', tj: 'Муқовимат ба коррупсия 2030', ru: 'Противодействие коррупции 2030', en: 'Anti-corruption Strategy 2030' },
            ].map((tile, i) => (
              <Reveal key={tile.url} delay={i * 80}>
                <a
                  href={tile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col items-center justify-center text-center gap-3 p-4 sm:p-5 rounded-2xl border border-theme-gold/40 bg-gradient-to-b from-theme-gold/20 via-theme-surface to-theme-surface hover:border-theme-gold hover:-translate-y-1 transition-all h-full min-h-[150px] sm:min-h-[170px] shadow-theme-card"
                >
                  <span className="p-3 rounded-full border border-theme-gold/50 bg-theme-gold/15 text-theme-gold group-hover:bg-theme-gold group-hover:text-black transition-colors">
                    <tile.icon size={26} />
                  </span>
                  <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-theme-text leading-snug">
                    {language === 'en' ? tile.en : language === 'tj' ? tile.tj : tile.ru}
                  </span>
                </a>
              </Reveal>
            ))}
            <Reveal delay={240}>
              <a
                href="#court-hearings"
                className="group flex flex-col items-center justify-center text-center gap-3 p-4 sm:p-5 glass glass-card hover:border-theme-gold hover:-translate-y-1 transition-all h-full min-h-[150px] sm:min-h-[170px]"
              >
                <span className="p-3 rounded-full border border-theme-border text-theme-textSec group-hover:border-theme-gold group-hover:text-theme-gold transition-colors">
                  <Scale size={26} />
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-theme-text leading-snug">
                  {language === 'en' ? 'Case lists' : language === 'tj' ? 'Рӯйхати парвандаҳо' : 'Списки дел'}
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <div className="site-container px-4 sm:px-8 md:px-12 py-12 space-y-14">
        {/* LEADERSHIP */}
        {leaders.length > 0 && (
          <section id="court-leadership" className="scroll-mt-32">
            <SectionHead
              kicker={language === 'en' ? 'Leadership' : language === 'tj' ? 'Роҳбарият' : 'Руководство'}
              title={language === 'en' ? 'Court leadership' : language === 'tj' ? 'Роҳбарияти суд' : 'Руководство суда'}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaders.map((p: any, i: number) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all h-full">
                    <div className="flex items-center gap-2 mb-2 text-theme-gold">
                      <Users size={15} />
                    </div>
                    <div className="font-medium text-theme-text text-sm mb-1">{pickTri(p.name, language)}</div>
                    <div className="font-mono text-[11px] text-theme-textSec uppercase tracking-wider">{pickTri(p.title, language)}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* RECEPTION SCHEDULE */}
        {cfg.receptionSchedule.length > 0 && (
          <section id="court-reception" className="scroll-mt-32">
            <SectionHead
              kicker={language === 'en' ? 'Reception of citizens' : language === 'tj' ? 'Қабули шаҳрвандон' : 'Приём граждан'}
              title={language === 'en' ? 'Reception schedule' : language === 'tj' ? 'Ҷадвали қабули шаҳрвандон' : 'График приёма граждан'}
            />
            <Reveal>
              <div className="content-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[640px]">
                    <thead>
                      <tr className="border-b border-theme-border bg-theme-bg/60 text-theme-textMuted font-mono text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold w-12">№</th>
                        <th className="py-3 px-4 font-semibold">
                          {language === 'en' ? 'Name' : language === 'tj' ? 'Ному насаб' : 'ФИО'}
                        </th>
                        <th className="py-3 px-4 font-semibold">
                          {language === 'en' ? 'Position' : language === 'tj' ? 'Вазифа' : 'Должность'}
                        </th>
                        <th className="py-3 px-4 font-semibold">
                          {language === 'en' ? 'Reception days' : language === 'tj' ? 'Рӯзҳои қабул' : 'Дни приёма'}
                        </th>
                        <th className="py-3 px-4 font-semibold">
                          {language === 'en' ? 'Time' : language === 'tj' ? 'Вақти қабул' : 'Время приёма'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cfg.receptionSchedule.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-theme-border/40 last:border-0 hover:bg-theme-bg/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-theme-gold">{i + 1}</td>
                          <td className="py-3.5 px-4 text-sm font-medium text-theme-text">{pickTri(row.name, language)}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider text-theme-textSec">{pickTri(row.title, language)}</td>
                          <td className="py-3.5 px-4 text-sm text-theme-text">{pickTri(row.days, language)}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-theme-gold whitespace-nowrap">{pickTri(row.time, language)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* HEARINGS */}
        <section id="court-hearings" className="scroll-mt-24">
          <SectionHead
            kicker={language === 'en' ? 'Open proceedings' : language === 'tj' ? 'Мурофиаи кушода' : 'Открытое производство'}
            title={language === 'en' ? 'Scheduled hearings' : language === 'tj' ? 'Парвандаҳои баррасишаванда' : 'Назначенные заседания'}
          />
          {loading ? (
            <div className="text-center py-4 text-theme-textSec font-mono text-xs">Loading...</div>
          ) : hearings.length === 0 ? (
            <div className="content-card text-center py-8 font-mono text-xs text-theme-textSec">
              {language === 'en' ? 'No hearings scheduled' : language === 'tj' ? 'Маҷлисҳои таъиншуда нест' : 'Назначенных заседаний нет'}
            </div>
          ) : (
            <div className="space-y-3">
              {hearings.map((h: any) => (
                <div key={h.id} className="p-4 rounded-xl bg-theme-surface border border-theme-border hover:border-theme-gold transition-all font-mono text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-border pb-2 mb-2 text-theme-textMuted">
                    <span className="font-semibold text-theme-text">{h.id}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {h.hearing_date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {h.hearing_time}</span>
                      {h.room && <span className="text-theme-gold">{h.room}</span>}
                    </div>
                  </div>
                  <div className="text-theme-text text-sm font-sans font-medium mb-1">
                    {language === 'en' ? h.category_en || h.category_ru : language === 'tj' ? h.category_tj || h.category_ru : h.category_ru}
                  </div>
                  {h.parties_ru && h.parties_ru !== '—' && (
                    <div className="text-theme-textSec text-xs font-sans">
                      {language === 'en' ? h.parties_en || h.parties_ru : language === 'tj' ? h.parties_tj || h.parties_ru : h.parties_ru}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PRESS ROW: news | announcements | president */}
        <section id="court-press" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* News column */}
            <div>
              <Reveal>
                <div className="inline-block px-4 py-1.5 rounded-t-xl bg-theme-gold text-black font-mono text-xs font-bold uppercase tracking-widest">
                  {language === 'en' ? 'News' : language === 'tj' ? 'Хабарҳо' : 'Новости'}
                </div>
              </Reveal>
              <div className="border-t-2 border-theme-gold pt-4 space-y-4">
                {loading ? (
                  <div className="font-mono text-xs text-theme-textSec">Loading...</div>
                ) : news.length === 0 ? (
                  <div className="font-mono text-xs text-theme-textSec">No news found</div>
                ) : news.slice(0, 6).map((item: any) => (
                  <Reveal key={item.id}>
                    <Link to={'/news/' + item.slug} className="block group">
                      <h4 className="text-[13px] font-sans font-semibold uppercase leading-snug text-theme-text group-hover:text-theme-gold transition-colors">
                        {titleOf(item)}
                      </h4>
                      <span className="font-mono text-[11px] text-theme-textMuted">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
            {/* Announcements column */}
            <div>
              <Reveal>
                <div className="inline-block px-4 py-1.5 rounded-t-xl bg-theme-gold text-black font-mono text-xs font-bold uppercase tracking-widest">
                  {language === 'en' ? 'Announcements' : language === 'tj' ? 'Эълонҳо' : 'Объявления'}
                </div>
              </Reveal>
              <div className="border-t-2 border-theme-gold pt-4 space-y-4">
                {loading ? (
                  <div className="font-mono text-xs text-theme-textSec">Loading...</div>
                ) : announcements.length === 0 ? (
                  <div className="font-mono text-xs text-theme-textSec">No announcements found</div>
                ) : announcements.slice(0, 6).map((item: any) => (
                  <Reveal key={item.id}>
                    <Link to={'/announcements/' + item.slug} className="block group">
                      <h4 className="text-[13px] font-sans font-semibold uppercase leading-snug text-theme-text group-hover:text-theme-gold transition-colors">
                        {titleOf(item)}
                      </h4>
                      <span className="font-mono text-[11px] text-theme-textMuted">
                        {item.published_at ? new Date(item.published_at).toLocaleDateString() : ''}
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
            {/* President column */}
            <div>
              <Reveal>
                <div className="inline-block px-4 py-1.5 rounded-t-xl bg-theme-gold text-black font-mono text-xs font-bold uppercase tracking-widest">
                  {language === 'en' ? 'President message' : language === 'tj' ? 'Паёми президент' : 'Послание президента'}
                </div>
              </Reveal>
              <div className="border-t-2 border-theme-gold pt-4">
                <Reveal delay={100}>
                  <a
                    href="https://president.tj"
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-theme-gold/40 bg-theme-surface hover:border-theme-gold transition-all shadow-theme-card"
                  >
                    <div className="relative h-56 sm:h-64 overflow-hidden bg-gradient-to-br from-theme-gold/30 via-theme-surface to-theme-bg flex items-center justify-center">
                      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-theme-gold/25 blur-3xl" />
                      <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-theme-gold/15 blur-3xl" />
                      <Scale size={72} className="relative text-theme-gold/80 group-hover:scale-110 transition-transform" strokeWidth={1} />
                    </div>
                    <div className="p-4 bg-theme-gold/15 border-t border-theme-gold/40">
                      <p className="font-sans text-[13px] font-semibold text-center leading-snug text-theme-text">
                        {language === 'en' ? 'Message of the President of RT, Leader of the Nation H.E. Emomali Rahmon' : language === 'tj' ? 'Паёми Президенти Ҷумҳурии Тоҷикистон, Пешвои миллат муҳтарам Эмомалӣ Раҳмон' : 'Послание Президента Республики Таджикистан, Лидера нации уважаемого Эмомали Рахмона'}
                      </p>
                    </div>
                  </a>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* LEGISLATION */}
        <section id="court-legislation" className="scroll-mt-32">
          <SectionHead
            kicker={language === 'en' ? 'Documents' : language === 'tj' ? 'Санадҳо' : 'Документы'}
            title={language === 'en' ? 'Legislation' : language === 'tj' ? 'Қонунгузорӣ' : 'Законодательство'}
          />
          <LawBookshelf books={shelfBooks} />
        </section>

        {/* CONTACTS */}
        <section id="court-contacts" className="scroll-mt-32">
          <SectionHead
            kicker={language === 'en' ? 'Contacts' : language === 'tj' ? 'Тамос' : 'Контакты'}
            title={pickTri(cfg.contacts.address, language)}
          />
          <Reveal>
            <div className="p-5 sm:p-6 glass glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 font-mono text-xs text-theme-textSec">
                <div className="flex items-center gap-2"><Mail size={13} className="text-theme-gold" /><span>{cfg.contacts.email}</span></div>
                {cfg.contacts.phones.map((p) => (
                  <div key={p} className="flex items-center gap-2"><Phone size={13} className="text-theme-gold" /><span>{p}</span></div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleOpenSectionModal('appeals')}
                className="btn-outline text-xs inline-flex items-center gap-2 shrink-0"
              >
                <Send size={13} />
                <span>{language === 'en' ? 'Write appeal' : language === 'tj' ? 'Муроҷиат навиштан' : 'Написать обращение'}</span>
              </button>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xs text-theme-textSec leading-relaxed mt-4 max-w-3xl">{pickTri(cfg.receptionNote, language)}</p>
          </Reveal>
        </section>
      </div>
    </div>
  );
};

export default CourtSitePage;

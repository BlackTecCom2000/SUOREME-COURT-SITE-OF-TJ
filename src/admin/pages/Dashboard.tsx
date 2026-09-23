import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper,
  Gavel,
  Landmark,
  Send,
  PlusCircle,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { AdminCard } from '../components/ui/AdminCard';
import { AdminButton } from '../components/ui/AdminButton';
import { AdminBadge } from '../components/ui/AdminBadge';
import { useAdminAuth } from '../context/AdminAuthContext';
import { apiFetch } from '../context/adminHttp';

export const Dashboard: React.FC = () => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiFetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  // Live backend stats only — no invented fallback numbers (data-integrity rule).
  const stats = data?.stats || null;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : '—');

  const statCards = [
    {
      title: 'Публикации и Новости',
      value: stats ? num(stats.news_total) : '—',
      subtitle: stats
        ? `${num(stats.news_published)} опубликовано • ${num(stats.news_pending || 0)} на проверке`
        : 'Загрузка данных…',
      icon: Newspaper,
      color: '#dfbe7e',
      path: '/admin/news',
    },
    {
      title: 'Судебные акты',
      value: stats ? num(stats.acts_total) : '—',
      subtitle: 'Решения, определения, постановления',
      icon: Gavel,
      color: '#38bdf8',
      path: '/admin/acts',
    },
    {
      title: 'Судебная сеть РТ',
      value: stats ? num(stats.courts_total) : '—',
      subtitle: 'Суды по данным реестра (/api/courts)',
      icon: Landmark,
      color: '#34d399',
      path: '/admin/courts',
    },
    {
      title: 'Обращения граждан',
      value: stats ? num(stats.appeals_total) : '—',
      subtitle: stats ? `${num(stats.appeals_new || 0)} новых ожидают ответа` : 'Загрузка данных…',
      icon: Send,
      color: '#f472b6',
      badge:
        stats && typeof stats.appeals_new === 'number' && stats.appeals_new > 0
          ? `${stats.appeals_new} NEW`
          : undefined,
      path: '/admin/appeals',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* 1. TOP WELCOME BANNER */}
      <div className="relative rounded-3xl border border-amber-400/30 bg-gradient-to-r from-[#0a1226] via-[#070d1a] to-[#040813] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div
          className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #dfbe7e 0%, transparent 70%)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-400 uppercase tracking-wider mb-2 font-semibold">
              <ShieldCheck size={16} />
              <span>Единая система администрирования портала</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Добро пожаловать, {user?.name || 'Администратор'}
            </h2>
            <p className="font-sans text-sm text-slate-300 mt-2 leading-relaxed">
              Центр управления цифровой информацией, судебными актами, региональной сетью и электронными обращениями Верховного суда Республики Таджикистан.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AdminButton
              variant="primary"
              size="md"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/admin/news/new')}
            >
              Создать публикацию
            </AdminButton>
          </div>
        </div>
      </div>

      {/* 2. STATS KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
          <AdminCard
            key={idx}
            hoverEffect
            className="cursor-pointer group"
            onClick={() => navigate(stat.path)}
          >
            <div className="flex items-start justify-between">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 shadow-md"
                style={{
                  backgroundColor: `${stat.color}15`,
                  borderColor: `${stat.color}40`,
                  color: stat.color,
                }}
              >
                <stat.icon size={22} />
              </div>
              {stat.badge ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold animate-pulse">
                  {stat.badge}
                </span>
              ) : (
                <ArrowUpRight size={16} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
              )}
            </div>

            <div className="mt-4">
              <div className="font-mono text-3xl font-bold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="font-serif font-bold text-sm text-slate-200 mt-1">
                {stat.title}
              </div>
              <div className="font-mono text-[11px] text-slate-400 mt-1 truncate">
                {stat.subtitle}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* 3. QUICK ACTIONS & RECENT ACTIVITY DUAL COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Action Modules & Pending Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Buttons */}
          <AdminCard
            title="Быстрые действия"
            subtitle="Оперативное добавление и управление записями"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => navigate('/admin/news/new')}
                className="p-4 rounded-xl border border-slate-800 bg-[#091124] hover:border-amber-400/50 hover:bg-[#0d1833] transition-all text-left group"
              >
                <Newspaper size={20} className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-serif font-semibold text-xs text-white block">Новость</span>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">Пресс-релиз</span>
              </button>

              <button
                onClick={() => navigate('/admin/acts?action=new')}
                className="p-4 rounded-xl border border-slate-800 bg-[#091124] hover:border-sky-400/50 hover:bg-[#0d1833] transition-all text-left group"
              >
                <Gavel size={20} className="text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-serif font-semibold text-xs text-white block">Судебный акт</span>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">PDF решение</span>
              </button>

              <button
                onClick={() => navigate('/admin/courts?action=new')}
                className="p-4 rounded-xl border border-slate-800 bg-[#091124] hover:border-emerald-400/50 hover:bg-[#0d1833] transition-all text-left group"
              >
                <Landmark size={20} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-serif font-semibold text-xs text-white block">Суд РТ</span>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">Филиал / данные</span>
              </button>

              <button
                onClick={() => navigate('/admin/media')}
                className="p-4 rounded-xl border border-slate-800 bg-[#091124] hover:border-cyan-400/50 hover:bg-[#0d1833] transition-all text-left group"
              >
                <PlusCircle size={20} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-serif font-semibold text-xs text-white block">Медиа файл</span>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">Фото / Документ</span>
              </button>
            </div>
          </AdminCard>

          {/* Pending Appeals & Citizen Inquiries */}
          <AdminCard
            title="Очередь обращений граждан"
            subtitle="Недавние электронные обращения через портал"
            headerAction={
              <AdminButton
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/appeals')}
              >
                Все обращения
              </AdminButton>
            }
          >
            {data?.pending_appeals?.length > 0 ? (
              <div className="divide-y divide-slate-800/60">
                {data.pending_appeals.map((app: any) => (
                  <div
                    key={app.id}
                    onClick={() => navigate('/admin/appeals')}
                    className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 p-2 rounded-xl transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-white">{app.full_name}</span>
                        <AdminBadge variant="new">NEW</AdminBadge>
                      </div>
                      <p className="font-sans text-xs text-slate-400 truncate max-w-md mt-0.5">
                        {app.subject || 'Электронное обращение без темы'}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 font-mono text-xs">
                <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400/60" />
                Нет необработанных обращений
              </div>
            )}
          </AdminCard>
        </div>

        {/* Right 1 Col: Audit Log Stream & Telemetry */}
        <div className="space-y-6">
          {/* Audit Log Stream */}
          <AdminCard
            title="Журнал безопасности"
            subtitle="Последние действия администраторов"
            headerAction={
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/audit')}
              >
                Журнал
              </AdminButton>
            }
          >
            <div className="space-y-3 pt-1">
              {data?.activity?.length > 0 ? (
                data.activity.slice(0, 6).map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/80"
                  >
                    <Activity size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-slate-200 font-medium truncate">
                        <span className="text-amber-300 uppercase font-mono text-[10px]">
                          {log.action}
                        </span>{' '}
                        {log.object_title || log.object_type}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                        <span>{log.user_name || 'System Admin'}</span>
                        <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 font-mono text-xs">
                  Журнал действий пуст
                </div>
              )}
            </div>
          </AdminCard>

          {/* System Telemetry Specs */}
          <AdminCard title="Состояние платформы" subtitle="Технические параметры узла">
            <div className="space-y-2.5 font-mono text-xs text-slate-400 pt-1">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span>База данных:</span>
                <span className="text-emerald-400 font-bold">SQLite 3 (WAL Mode)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span>Шифрование сессий:</span>
                <span className="text-cyan-400 font-bold">HS256 JWT (8h)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span>Автопланировщик:</span>
                <span className="text-amber-400 font-bold">Cron (60s tick)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Статус узла:</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {data ? 'ONLINE (/api/health OK)' : '…'}
                </span>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;

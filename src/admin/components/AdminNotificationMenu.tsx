import React, { useState, useEffect, useRef } from 'react';
import { Bell, Send, Newspaper, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../context/adminHttp';

interface NotificationItem {
  id: string;
  type: 'appeal' | 'news' | 'system';
  title: string;
  time: string;
  path: string;
}

export const AdminNotificationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch live notifications from dashboard stats & pending appeals
    const fetchNotifications = async () => {
      try {
        const res = await apiFetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          const list: NotificationItem[] = [];
          if (data.pending_appeals?.length > 0) {
            data.pending_appeals.forEach((a: any) => {
              list.push({
                id: `app-${a.id}`,
                type: 'appeal',
                title: `Новое обращение: ${a.full_name} (${a.ref_number || '№' + a.id})`,
                time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                path: '/admin/appeals',
              });
            });
          }
          if (data.stats?.news_pending > 0) {
            list.push({
              id: 'news-pending',
              type: 'news',
              title: `${data.stats.news_pending} публикаций ожидают проверки`,
              time: 'Сегодня',
              path: '/admin/news',
            });
          }
          setNotifications(list);
          setUnreadCount(list.length);
        }
      } catch {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-amber-400/40 transition-colors"
        aria-label="Уведомления"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-bold flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-amber-400/30 bg-[#070d1a] shadow-2xl shadow-black/90 p-3 z-50 animate-fadeIn text-left">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
            <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
              Системные события
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              {unreadCount} новых
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-slate-500 font-mono text-xs">
                <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-400/60" />
                Все задачи обработаны
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    navigate(n.path);
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors flex items-start gap-2.5"
                >
                  <span className="shrink-0 mt-0.5 text-amber-400">
                    {n.type === 'appeal' ? (
                      <Send size={14} />
                    ) : n.type === 'news' ? (
                      <Newspaper size={14} />
                    ) : (
                      <AlertTriangle size={14} />
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-200 leading-snug">{n.title}</p>
                    <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

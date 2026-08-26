import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  BellRing
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface CourtNotification {
  id: string;
  type: 'hearing' | 'new_doc' | 'status_change' | 'deadline' | 'payment';
  priority: 'normal' | 'important' | 'critical';
  titleRu: string;
  titleTj: string;
  titleEn: string;
  descRu: string;
  descTj: string;
  descEn: string;
  timestamp: string;
  isRead: boolean;
  caseNumber?: string;
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [notifications, setNotifications] = useState<CourtNotification[]>([
    {
      id: 'notif-1',
      type: 'deadline',
      priority: 'critical',
      titleRu: 'Истекает процессуальный срок подачи отзыва',
      titleTj: 'Мӯҳлати мурофиавии пешниҳоди эътироз ба охир мерасад',
      titleEn: 'Procedural deadline expiring for objection filing',
      descRu: 'По делу № 01-1234/26 срок предоставления возражений истекает через 48 часов.',
      descTj: 'Оид ба парвандаи № 01-1234/26 мӯҳлати пешниҳоди эътироз баъд аз 48 соат ба анҷом мерасад.',
      descEn: 'Case #01-1234/26 deadline expires in 48 hours.',
      timestamp: '10 минут назад',
      isRead: false,
      caseNumber: '01-1234/26',
    },
    {
      id: 'notif-2',
      type: 'hearing',
      priority: 'important',
      titleRu: 'Назначено судебное заседание',
      titleTj: 'Маҷлиси судӣ таъин карда шуд',
      titleEn: 'Court Hearing Scheduled',
      descRu: 'Заседание назначено на 15 сентября 2026 года в 10:00, Зал №4.',
      descTj: 'Маҷлис ба 15 сентябри соли 2026, соати 10:00, Толори №4 таъин гардид.',
      descEn: 'Hearing set for September 15, 2026 at 10:00, Hall #4.',
      timestamp: '2 часа назад',
      isRead: false,
      caseNumber: '01-1234/26',
    },
    {
      id: 'notif-3',
      type: 'new_doc',
      priority: 'normal',
      titleRu: 'Поступил новый судебный акт',
      titleTj: 'Санади нави судӣ ворид шуд',
      titleEn: 'New Judicial Act Issued',
      descRu: 'Определение о принятии встречного иска подписано судьей.',
      descTj: 'Таъинот оид ба қабули даъвои муқобил аз ҷониби судя имзо шуд.',
      descEn: 'Ruling on counterclaim admission signed by judge.',
      timestamp: 'Вчера, 16:45',
      isRead: true,
      caseNumber: '02-481/26',
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter(n => {
    if (filterPriority === 'all') return true;
    return n.priority === filterPriority;
  });

  const getPriorityBadge = (p: CourtNotification['priority']) => {
    switch (p) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'important':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">IMPORTANT</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-sky-400 bg-sky-500/15 border border-sky-500/30">NORMAL</span>;
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 backdrop-blur-md bg-black/75 transition-opacity duration-300 pointer-events-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl border border-theme-border bg-theme-bg shadow-2xl flex flex-col overflow-hidden text-theme-text"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-theme-border bg-theme-surface/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-theme-gold/15 border border-theme-gold/30 text-theme-gold relative">
              <BellRing size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-theme-text">
                {language === 'tj' ? 'Маркази огоҳиномаҳои судӣ' : language === 'en' ? 'Court Notification Center' : 'Центр судебных извещений'}
              </h3>
              <p className="text-xs text-theme-textMuted font-mono">
                {language === 'tj' ? 'Огоҳиномаҳо, повесткаҳо ва мӯҳлатҳои мурофиавӣ' : language === 'en' ? 'Digital summons, warnings & deadlines' : 'Электронные повестки, вызовы и сроки'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              className="font-mono text-[11px] text-theme-gold hover:underline mr-2 hidden sm:inline"
            >
              {language === 'tj' ? 'Ҳама хонда шуд' : language === 'en' ? 'Mark all read' : 'Прочитать все'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-theme-bg border border-theme-border text-theme-textMuted hover:text-theme-text"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Priority Tabs */}
        <div className="px-6 py-2.5 bg-theme-surface/30 border-b border-theme-border flex items-center gap-2 text-xs font-mono">
          {['all', 'critical', 'important', 'normal'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 rounded-xl uppercase transition-colors ${
                filterPriority === p
                  ? 'bg-theme-gold text-black font-bold'
                  : 'text-theme-textMuted hover:text-theme-text bg-theme-bg'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-theme-textMuted font-mono text-xs">
              {language === 'tj' ? 'Огоҳинома мавҷуд нест' : language === 'en' ? 'No notifications' : 'Нет новых извещений'}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isRead
                    ? 'border-theme-border/50 bg-theme-surface/40'
                    : 'border-theme-border bg-theme-surface/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    {item.caseNumber && (
                      <span className="font-mono text-[10px] bg-theme-bg px-2 py-0.5 rounded border border-theme-border text-theme-text">
                        {item.caseNumber}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-theme-textMuted">{item.timestamp}</span>
                </div>

                <h4 className="text-sm font-semibold text-theme-text mb-1">
                  {language === 'tj' ? item.titleTj : language === 'en' ? item.titleEn : item.titleRu}
                </h4>

                <p className="text-xs text-theme-textSec leading-relaxed">
                  {language === 'tj' ? item.descTj : language === 'en' ? item.descEn : item.descRu}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-surface/60 flex items-center justify-between text-xs font-mono">
          <span className="text-theme-textMuted">NOTIFICATIONS DISPATCHED VIA SECURE SMS & EMAIL</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs"
          >
            {language === 'tj' ? 'Пӯшидан' : language === 'en' ? 'Close' : 'Закрыть'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

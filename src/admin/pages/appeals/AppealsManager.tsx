import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, Lock } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';
import { AdminDrawer } from '../../components/ui/AdminDrawer';
import { AdminTabs } from '../../components/ui/AdminTabs';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { apiFetch } from '../../context/adminHttp';

interface Appeal {
  id: number;
  ref_number?: string;
  full_name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
  status: 'new' | 'in_review' | 'assigned' | 'answered' | 'closed';
  assigned_to?: number;
  internal_note?: string;
  created_at: string;
}

export const AppealsManager: React.FC = () => {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<'new' | 'in_review' | 'assigned' | 'answered' | 'closed'>('new');
  const [isSaving, setIsSaving] = useState(false);

  const fetchAppeals = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/appeals');
      if (res.ok) {
        const data = await res.json();
        setAppeals(data.items || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleOpenAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setInternalNote(appeal.internal_note || '');
    setStatusUpdate(appeal.status);
  };

  const handleSaveResolution = async () => {
    if (!selectedAppeal) return;
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/admin/appeals/${selectedAppeal.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: statusUpdate,
          internal_note: internalNote,
        }),
      });

      if (res.ok) {
        setSelectedAppeal(null);
        fetchAppeals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'Все обращения', count: appeals.length },
    { id: 'new', label: 'Новые' },
    { id: 'in_review', label: 'В обработке' },
    { id: 'answered', label: 'Отвечено' },
    { id: 'closed', label: 'Закрыто' },
  ];

  const filteredAppeals = appeals.filter((app) => {
    const matchesSearch =
      app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.ref_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' || app.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const columns: AdminTableColumn<Appeal>[] = [
    {
      header: 'Заявитель / Номер',
      accessor: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
            {row.full_name}
          </span>
          <span className="font-mono text-[11px] text-slate-400 mt-0.5">
            {row.ref_number || `№ ОБ-${row.id}`} • {row.phone}
          </span>
        </div>
      ),
    },
    {
      header: 'Тема обращения',
      accessor: (row) => (
        <div className="flex flex-col text-left max-w-md">
          <span className="font-sans text-xs font-semibold text-slate-200">
            {row.subject || 'Электронное обращение гражданина'}
          </span>
          <p className="font-sans text-[11px] text-slate-400 truncate mt-0.5">
            {row.message}
          </p>
        </div>
      ),
    },
    {
      header: 'Дата подачи',
      width: '130px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Статус',
      width: '130px',
      accessor: (row) => {
        const variant =
          row.status === 'new'
            ? 'new'
            : row.status === 'answered'
            ? 'published'
            : row.status === 'closed'
            ? 'archived'
            : 'pending';
        return <AdminBadge variant={variant} label={row.status.toUpperCase()} />;
      },
    },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Top Header */}
      <div>
        <h2 className="font-serif font-bold text-2xl text-white">Обращения граждан</h2>
        <p className="font-sans text-xs text-slate-400 mt-1">
          Электронная приемная, запросы по судебным делам и официальные заявления
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по ФИО, номеру, теме..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Table */}
      <AdminTable
        columns={columns}
        data={filteredAppeals}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Обращений в данной категории не найдено"
        onRowClick={handleOpenAppeal}
      />

      {/* Appeal Details Drawer */}
      <AdminDrawer
        isOpen={Boolean(selectedAppeal)}
        onClose={() => setSelectedAppeal(null)}
        title={selectedAppeal ? `Обращение ${selectedAppeal.ref_number || '№' + selectedAppeal.id}` : ''}
        subtitle="Карточка электронного обращения"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setSelectedAppeal(null)}>
              Закрыть
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveResolution}
            >
              Сохранить решение
            </AdminButton>
          </>
        }
      >
        {selectedAppeal && (
          <div className="space-y-6">
            {/* Citizen Details Box */}
            <div className="p-4 rounded-xl border border-slate-800 bg-[#091124] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-white">
                  {selectedAppeal.full_name}
                </span>
                <AdminBadge
                  variant={selectedAppeal.status === 'new' ? 'new' : 'pending'}
                  label={selectedAppeal.status.toUpperCase()}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-amber-400" />
                  <span>{selectedAppeal.phone}</span>
                </div>
                {selectedAppeal.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail size={13} className="text-sky-400" />
                    <span>{selectedAppeal.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Appeal Message */}
            <div className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                Тема: {selectedAppeal.subject || 'Электронное обращение'}
              </span>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedAppeal.message}
              </div>
            </div>

            {/* Status Control */}
            <AdminSelect
              label="Статус рассмотрения"
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value as any)}
              options={[
                { value: 'new', label: 'Новое (New)' },
                { value: 'in_review', label: 'В обработке (In Review)' },
                { value: 'assigned', label: 'Назначен исполнитель (Assigned)' },
                { value: 'answered', label: 'Ответ направлен заявителю (Answered)' },
                { value: 'closed', label: 'Дело закрыто в архив (Closed)' },
              ]}
            />

            {/* INTERNAL NOTES (STRICTLY PRIVATE VISUAL DISTINCTION) */}
            <div className="p-4 rounded-xl border border-amber-400/40 bg-amber-950/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock size={14} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Служебные заметки канцелярии (Конфиденциально)
                </span>
              </div>
              <p className="text-[11px] font-sans text-slate-400">
                Данные заметки видны только судьям и администраторам аппарата Верховного суда.
              </p>
              <textarea
                rows={4}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Укажите регистрационный входящий номер, судью-докладчика или резолюцию..."
                className="w-full p-3 rounded-lg bg-slate-950/90 text-white placeholder-slate-600 border border-slate-800 text-xs font-sans focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
};
export default AppealsManager;

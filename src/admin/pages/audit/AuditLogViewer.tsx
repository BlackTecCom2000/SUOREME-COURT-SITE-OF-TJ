import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Search } from 'lucide-react';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';
import { apiFetch } from '../../context/adminHttp';

interface AuditEntry {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  object_type: string;
  object_id?: number;
  object_title?: string;
  old_status?: string;
  new_status?: string;
  ip_address?: string;
  created_at: string;
}

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/admin/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.items || data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.object_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.object_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const columns: AdminTableColumn<AuditEntry>[] = [
    {
      header: 'Действие / Тип',
      width: '180px',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-left">
          <Activity size={14} className="text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs text-amber-300 uppercase">
              {row.action}
            </span>
            <span className="font-mono text-[10px] text-slate-500 uppercase">
              {row.object_type} {row.object_id ? `ID #${row.object_id}` : ''}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Объект / Описание',
      accessor: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-serif font-bold text-sm text-white">
            {row.object_title || row.object_type}
          </span>
          {row.old_status && row.new_status && (
            <span className="font-mono text-[10px] text-slate-400 mt-0.5">
              Статус: {row.old_status} → {row.new_status}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Сотрудник',
      width: '180px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.user_name || 'System Admin'}
        </span>
      ),
    },
    {
      header: 'IP Адрес',
      width: '130px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.ip_address || '127.0.0.1'}</span>
      ),
    },
    {
      header: 'Дата и время',
      width: '160px',
      className: 'text-right',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Журнал аудита безопасности</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Неизменяемый протокол всех действий администраторов и изменений в системе
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-xs font-semibold">
          <ShieldCheck size={14} />
          <span>AUDIT LOGGING ACTIVE</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'create', 'update', 'trash', 'login'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors uppercase ${
                actionFilter === act
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {act === 'all' ? 'Все действия' : act}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по журналу..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Записей в журнале аудита не найдено"
      />
    </div>
  );
};
export default AuditLogViewer;

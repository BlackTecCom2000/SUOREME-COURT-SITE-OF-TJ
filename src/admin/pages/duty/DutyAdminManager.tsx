import React, { useState, useEffect } from 'react';
import { CheckCircle2, Scale } from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';

interface DutyCategory {
  id: number;
  name_ru: string;
  name_tj?: string;
  requires_amount: number;
}

interface DutyRule {
  id: number;
  category_id: number;
  calc_mode: string;
  base_rate: number;
  min_amount?: number;
  max_amount?: number;
  legal_basis?: string;
}

export const DutyAdminManager: React.FC = () => {
  const [config, setConfig] = useState<{
    categories: DutyCategory[];
    rules: DutyRule[];
    exemptions: any[];
  }>({ categories: [], rules: [], exemptions: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDuty = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/duty/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuty();
  }, []);

  const categoryColumns: AdminTableColumn<DutyCategory>[] = [
    {
      header: 'Категория иска / Требования',
      accessor: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-serif font-bold text-sm text-white">{row.name_ru}</span>
          <span className="font-sans text-[11px] text-slate-400 mt-0.5">{row.name_tj || ''}</span>
        </div>
      ),
    },
    {
      header: 'Тип расчёта',
      width: '180px',
      accessor: (row) => (
        <AdminBadge
          variant={row.requires_amount ? 'pending' : 'published'}
          label={row.requires_amount ? 'ПРОЦЕНТ ОТ СУММЫ' : 'ФИКСИРОВАННЫЙ'}
        />
      ),
    },
    {
      header: 'Правовое основание',
      width: '240px',
      accessor: (row) => {
        const rule = config.rules.find((r) => r.category_id === row.id);
        return (
          <span className="font-mono text-[11px] text-slate-400 truncate max-w-xs block">
            {rule?.legal_basis || 'Закон РТ "О государственной пошлине"'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Тарифы государственной пошлины</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Управление ставками, формулами расчета и льготами для граждан и юридических лиц
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-xs font-semibold">
          <Scale size={14} />
          <span>ПОКАЗАТЕЛЬ ДЛЯ РАСЧЕТОВ: 72 TJS</span>
        </div>
      </div>

      {/* Categories Table */}
      <AdminCard title="Категории и ставки судебных сборов">
        <AdminTable
          columns={categoryColumns}
          data={config.categories}
          keyExtractor={(c) => c.id}
          isLoading={isLoading}
          emptyMessage="Категории пошлин не найдены"
        />
      </AdminCard>

      {/* Exemptions List */}
      <AdminCard title="Льготные категории граждан (Освобождение от уплаты)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {config.exemptions?.length > 0 ? (
            config.exemptions.map((ex: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-800 bg-[#091124] flex items-start gap-3"
              >
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-xs text-white">{ex.title_ru}</h4>
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                    {ex.legal_basis} • {ex.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-slate-500 text-xs font-mono">Льготы загружаются...</div>
          )}
        </div>
      </AdminCard>
    </div>
  );
};
export default DutyAdminManager;

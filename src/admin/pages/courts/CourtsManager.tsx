import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Phone, Globe, Edit } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';
import { AdminDrawer } from '../../components/ui/AdminDrawer';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { JudicialTreeAdminPreview } from '../../components/JudicialTreeAdminPreview';
import { REGIONAL_CLUSTERS } from '../../../data/sudTjData';

interface CourtRecord {
  id: string | number;
  nameRu: string;
  nameTj?: string;
  nameEn?: string;
  regionId: string;
  courtType?: string;
  type?: string;
  address?: string;
  addressRu?: string;
  phone?: string;
  email?: string;
  website?: string;
  domain?: string;
  status?: string;
}

export const CourtsManager: React.FC = () => {
  const [courts, setCourts] = useState<CourtRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<CourtRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nameRu: '',
    nameTj: '',
    regionId: 'dushanbe_rrp',
    courtType: 'district',
    address: '',
    phone: '',
    website: '',
    status: 'online',
  });

  const fetchCourts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/courts');
      if (res.ok) {
        const data = await res.json();
        setCourts(
          data.map((c: any) => ({
            id: c.id,
            nameRu: c.name_ru || c.nameRu || '',
            nameTj: c.name_tj || c.nameTj || '',
            nameEn: c.name_en || c.nameEn || '',
            regionId: c.region_id || c.regionId || c.region || 'dushanbe_rrp',
            courtType: c.court_type || c.type || 'district',
            address: c.address_ru || c.address || '',
            phone: c.phone || '',
            email: c.email || '',
            website: c.website || c.domain || '',
            domain: c.domain || c.website || '',
            status: c.status || 'online',
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleOpenEdit = (court: CourtRecord) => {
    setEditingCourt(court);
    setFormData({
      nameRu: court.nameRu,
      nameTj: court.nameTj || '',
      regionId: court.regionId || 'dushanbe_rrp',
      courtType: court.courtType || 'district',
      address: court.address || '',
      phone: court.phone || '',
      website: court.website || '',
      status: court.status || 'online',
    });
    setIsDrawerOpen(true);
  };

  const handleOpenNew = () => {
    setEditingCourt(null);
    setFormData({
      nameRu: '',
      nameTj: '',
      regionId: 'dushanbe_rrp',
      courtType: 'district',
      address: '',
      phone: '',
      website: '',
      status: 'online',
    });
    setIsDrawerOpen(true);
  };

  const handleSaveCourt = async () => {
    if (!formData.nameRu.trim()) return;
    try {
      const token = sessionStorage.getItem('cms-token');
      const payload = {
        nameRu: formData.nameRu,
        nameTj: formData.nameTj,
        region: formData.regionId,
        type: formData.courtType,
        address: formData.address,
        phone: formData.phone,
        website: formData.website || `${formData.regionId}-${Date.now().toString().slice(-4)}.sud.tj`,
      };

      const url = editingCourt ? `/api/admin/courts/${editingCourt.id}` : '/api/admin/courts';
      const method = editingCourt ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsDrawerOpen(false);
        fetchCourts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCourts = courts.filter((c) => {
    const matchesSearch =
      c.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.website?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || c.regionId === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const columns: AdminTableColumn<CourtRecord>[] = [
    {
      header: 'Наименование суда',
      accessor: (row) => {
        const cluster = REGIONAL_CLUSTERS.find((r) => r.id === row.regionId);
        return (
          <div className="flex flex-col text-left">
            <span className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
              {row.nameRu}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-wider"
                style={{ color: cluster?.colorHex || '#dfbe7e' }}
              >
                {cluster?.shortNameRu || row.regionId}
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-slate-400">
                {row.website || `${row.id}.sud.tj`}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Тип органа',
      width: '140px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-300 uppercase">
          {row.courtType === 'regional'
            ? 'Областной'
            : row.courtType === 'city'
            ? 'Городской'
            : row.courtType === 'military'
            ? 'Военный'
            : 'Районный'}
        </span>
      ),
    },
    {
      header: 'Контакты / Телефон',
      width: '160px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-400">{row.phone || '+992 (37) 221-00-00'}</span>
      ),
    },
    {
      header: 'Статус',
      width: '110px',
      accessor: () => <AdminBadge variant="published" label="ONLINE" />,
    },
    {
      header: 'Действия',
      width: '100px',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Редактировать"
          >
            <Edit size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Судебная сеть Таджикистана</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Координация 80 судебных органов, региональных коллегий и военных гарнизонов
          </p>
        </div>
        <AdminButton
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={handleOpenNew}
        >
          Зарегистрировать суд
        </AdminButton>
      </div>

      {/* Region Filter Buttons & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
              selectedRegion === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Все регионы ({courts.length})
          </button>
          {REGIONAL_CLUSTERS.map((cl) => (
            <button
              key={cl.id}
              onClick={() => setSelectedRegion(cl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
                selectedRegion === cl.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cl.shortNameRu}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию суда..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Table */}
      <AdminTable
        columns={columns}
        data={filteredCourts}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Судов не найдено"
        onRowClick={handleOpenEdit}
      />

      {/* Court Editor Drawer with Live Judicial Tree Preview */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingCourt ? editingCourt.nameRu : 'Регистрация судебного органа'}
        subtitle="Параметры интеграции в единую судебную сеть"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsDrawerOpen(false)}>
              Отмена
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSaveCourt}>
              Сохранить параметры
            </AdminButton>
          </>
        }
      >
        <div className="space-y-5">
          {/* Live Tree Preview Card */}
          <JudicialTreeAdminPreview
            courtName={formData.nameRu || 'Новый суд'}
            regionId={formData.regionId}
            courtType={formData.courtType}
          />

          <AdminInput
            label="Наименование суда (RU)"
            required
            value={formData.nameRu}
            onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
            placeholder="Суд города Душанбе"
          />

          <AdminInput
            label="Номи суд (TJ)"
            value={formData.nameTj}
            onChange={(e) => setFormData({ ...formData, nameTj: e.target.value })}
            placeholder="Суди шаҳри Душанбе"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminSelect
              label="Региональная юрисдикция"
              value={formData.regionId}
              onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
              options={[
                { value: 'gbao', label: '1. ВМКБ (Бадахшан)' },
                { value: 'khatlon', label: '2. Вилояти Хатлон' },
                { value: 'sugd', label: '3. Вилояти Суғд' },
                { value: 'dushanbe_rrp', label: '4. Душанбе ва РРП' },
              ]}
            />

            <AdminSelect
              label="Инстанция / Тип"
              value={formData.courtType}
              onChange={(e) => setFormData({ ...formData, courtType: e.target.value })}
              options={[
                { value: 'regional', label: 'Областной суд' },
                { value: 'city', label: 'Городской суд' },
                { value: 'district', label: 'Районный суд' },
                { value: 'military', label: 'Военный гарнизонный суд' },
              ]}
            />
          </div>

          <AdminInput
            label="Официальный поддомен (*.sud.tj)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="dushanbe.sud.tj"
            leftIcon={<Globe size={15} />}
          />

          <AdminInput
            label="Физический адрес"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="г. Душанбе, ул. Рудаки 33"
            leftIcon={<MapPin size={15} />}
          />

          <AdminInput
            label="Контактный телефон канцелярии"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+992 (37) 221-14-14"
            leftIcon={<Phone size={15} />}
          />
        </div>
      </AdminDrawer>
    </div>
  );
};
export default CourtsManager;

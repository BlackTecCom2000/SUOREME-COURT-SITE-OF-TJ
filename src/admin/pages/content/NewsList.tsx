import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';
import { AdminTabs } from '../../components/ui/AdminTabs';
import { apiFetch } from '../../context/adminHttp';

interface ContentItem {
  id: number;
  type: string;
  slug: string;
  title_ru: string;
  title_tj?: string;
  title_en?: string;
  status: 'draft' | 'pending' | 'published' | 'scheduled' | 'archived';
  category?: string;
  published_at?: string;
  author_name?: string;
  updated_at: string;
}

export const NewsList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await apiFetch(`/api/admin/content?type=news${statusParam}${searchParam}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeTab, searchQuery]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Вы уверены, что хотите переместить публикацию в архив/удаленные?')) return;
    try {
      const res = await apiFetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchNews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'all', label: 'Все публикации', count: items.length },
    { id: 'published', label: 'Опубликовано' },
    { id: 'draft', label: 'Черновики' },
    { id: 'pending', label: 'На проверке' },
    { id: 'scheduled', label: 'Запланировано' },
  ];

  const columns: AdminTableColumn<ContentItem>[] = [
    {
      header: 'Заголовок публикации',
      accessor: (row) => (
        <div className="flex flex-col text-left max-w-md">
          <span className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
            {row.title_ru}
          </span>
          <span className="font-mono text-[11px] text-slate-400 mt-0.5">
            /{row.slug} {row.category ? `• ${row.category}` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Статус',
      width: '130px',
      accessor: (row) => <AdminBadge variant={row.status} label={row.status.toUpperCase()} />,
    },
    {
      header: 'Автор',
      width: '150px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.author_name || 'Администратор'}
        </span>
      ),
    },
    {
      header: 'Дата публикации',
      width: '140px',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-400">
          {row.published_at
            ? new Date(row.published_at).toLocaleDateString()
            : 'Не опубликовано'}
        </span>
      ),
    },
    {
      header: 'Действия',
      width: '100px',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/news/${row.id}`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Редактировать"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={(e) => handleDelete(row.id, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Удалить"
          >
            <Trash2 size={15} />
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
          <h2 className="font-serif font-bold text-2xl text-white">Публикации и пресс-релизы</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Управление официальными новостями, судебными хрониками и анонсами Верховного суда
          </p>
        </div>
        <AdminButton
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/admin/news/new')}
        >
          Создать публикацию
        </AdminButton>
      </div>

      {/* Filter Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по новостям..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Content Table */}
      <AdminTable
        columns={columns}
        data={items}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Новостных публикаций пока нет"
        onRowClick={(item) => navigate(`/admin/news/${item.id}`)}
      />
    </div>
  );
};
export default NewsList;

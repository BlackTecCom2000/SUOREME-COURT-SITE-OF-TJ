import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Download, BookOpen, ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminBadge } from '../../components/ui/AdminBadge';
import { AdminTable, AdminTableColumn } from '../../components/ui/AdminTable';
import { AdminModal } from '../../components/ui/AdminModal';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { BOOK_THEMES, DOC_KINDS, DOC_KIND_LABEL, DocKind, detectKind } from '../../../components/digital-court/LawBookshelf';
import { pickTri } from '../../../sites/types';
import { SHARED_LEGISLATION } from '../../../sites/shared';
import '../../../components/digital-court/LegislativeLibrary.css';

interface ShelfBookRow {
  id: number;
  title_ru: string;
  title_tj?: string | null;
  title_en?: string | null;
  url?: string | null;
  badge?: string | null;
  kind?: string | null;
  cover_text?: string | null;
  cover_emblem?: string | null;
  cover_bg?: string | null;
  cover_image?: string | null;
  cover_theme: number;
  sort_order: number;
  is_visible: number;
}

const KIND_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Авто (по названию)' },
  { value: 'constitution', label: 'Конституция' },
  { value: 'code', label: 'Кодексы' },
  { value: 'law', label: 'Законы' },
  { value: 'document', label: 'Документы' },
  { value: 'quote', label: 'Цитаты' },
  { value: 'other', label: 'Прочие материалы' },
];

const LIBRARY_EDIT_ROLES = ['super_admin', 'admin', 'administrator', 'editor', 'publisher'];

const EMPTY_FORM = {
  title_ru: '',
  title_tj: '',
  title_en: '',
  url: '',
  badge: 'PDF',
  kind: '',
  content: '',
  source_url: '',
  importDocId: '',
  importStatus: '',
  cover_text: '',
  cover_emblem: '',
  cover_bg: '',
  cover_image: '',
  cover_theme: 0,
  sort_order: 0,
  is_visible: 1,
};

const COVER_EMBLEM_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Авто (весы)' },
  { value: 'scale', label: 'Весы' },
  { value: 'book', label: 'Книга' },
  { value: 'landmark', label: 'Здание суда' },
  { value: 'gavel', label: 'Молот' },
  { value: 'none', label: 'Без эмблемы' },
];

export const ShelfBooksManager: React.FC = () => {
  const { user } = useAdminAuth();
  const canEdit = LIBRARY_EDIT_ROLES.includes(user?.role || '');
  const [books, setBooks] = useState<ShelfBookRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | DocKind>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShelfBookRow | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadStatus, setUploadStatus] = useState('');
  const [coverUploadStatus, setCoverUploadStatus] = useState('');
  const libFileRef = React.useRef<HTMLInputElement>(null);
  const coverFileRef = React.useRef<HTMLInputElement>(null);

  const authHeaders = () => {
    const token = sessionStorage.getItem('cms-token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  };

  const MAX_LIBRARY_FILE = 100 * 1024 * 1024;

  const friendlyUploadError = (msg: string) => {
    if (msg.includes('Too large') || msg.includes('413')) return 'Файл больше 100 МБ';
    if (msg.includes('Unsupported') || msg.includes('415')) return 'Тип файла не поддерживается (PDF, DOCX, TXT, MD, PNG, JPG, WEBP, GIF)';
    if (msg === 'network') return 'Ошибка сети';
    return `Ошибка: ${msg}`;
  };

  // XMLHttpRequest (not fetch): reports upload progress so big files
  // never look "infinitely stuck".
  const uploadLibraryFile = (
    file: File,
    kind: string,
    onProgress: (pct: number) => void
  ): Promise<{ url: string; size: number }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && data?.url) resolve(data);
          else reject(new Error(data?.error || `HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('network'));
      xhr.ontimeout = () => reject(new Error('network'));
      xhr.open('POST', `/api/admin/library/upload?kind=${encodeURIComponent(kind)}`);
      xhr.setRequestHeader('Authorization', `Bearer ${sessionStorage.getItem('cms-token')}`);
      const fd = new FormData();
      fd.append('file', file);
      xhr.send(fd);
    });

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/shelf-books', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('cms-token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleOpenNew = () => {
    if (!canEdit) return;
    setEditing(null);
    setFormData({ ...EMPTY_FORM, sort_order: books.length });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row: ShelfBookRow) => {
    if (!canEdit) return;
    setEditing(row);
    setFormData({
      title_ru: row.title_ru || '',
      title_tj: row.title_tj || '',
      title_en: row.title_en || '',
      url: row.url || '',
      badge: row.badge || 'PDF',
      kind: row.kind || '',
      cover_text: row.cover_text || '',
      cover_emblem: row.cover_emblem || '',
      cover_bg: row.cover_bg || '',
      cover_image: row.cover_image || '',
      content: '',
      source_url: '',
      importDocId: '',
      importStatus: '',
      cover_theme: row.cover_theme ?? 0,
      sort_order: row.sort_order ?? 0,
      is_visible: row.is_visible ?? 1,
    });
    setIsModalOpen(true);
    // Load full text (lists exclude content for weight)
    fetch(`/api/admin/shelf-books/${row.id}`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('cms-token')}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setFormData((prev) => ({
            ...prev,
            content: typeof d.content === 'string' ? d.content : '',
            source_url: d.source_url || '',
          }));
        }
      })
      .catch(() => undefined);
  };

  const handleImportDoc = async () => {
    if (!canEdit || !editing || !formData.importDocId.trim()) return;
    setFormData((prev) => ({ ...prev, importStatus: 'Загрузка с mmk.tj...' }));
    try {
      const res = await fetch('/api/admin/library/import', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ bookId: editing.id, docId: formData.importDocId.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setFormData((prev) => ({ ...prev, importStatus: `Импортировано символов: ${data.chars}` }));
        const full = await fetch(`/api/admin/shelf-books/${editing.id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('cms-token')}` },
        }).then((r) => (r.ok ? r.json() : null));
        if (full) {
          setFormData((prev) => ({
            ...prev,
            content: typeof full.content === 'string' ? full.content : prev.content,
            source_url: full.source_url || prev.source_url,
          }));
        }
        fetchBooks();
      } else {
        setFormData((prev) => ({ ...prev, importStatus: `Ошибка: ${(data && data.error) || res.status}` }));
      }
    } catch (err) {
      setFormData((prev) => ({ ...prev, importStatus: 'Ошибка сети' }));
    }
  };

  const handleSave = async () => {
    if (!canEdit || !formData.title_ru.trim()) return;
    try {
      const url = editing ? `/api/admin/shelf-books/${editing.id}` : '/api/admin/shelf-books';
      const { importDocId: _drop1, importStatus: _drop2, ...rest } = formData;
      const payload = { ...rest, kind: formData.kind || null };
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchBooks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisible = async (row: ShelfBookRow) => {
    if (!canEdit) return;
    try {
      const res = await fetch(`/api/admin/shelf-books/${row.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_visible: row.is_visible ? 0 : 1 }),
      });
      if (res.ok) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (row: ShelfBookRow) => {
    if (!canEdit) return;
    if (!window.confirm(`Удалить книгу «${row.title_ru}» с полки?`)) return;
    try {
      const res = await fetch(`/api/admin/shelf-books/${row.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('cms-token')}` },
      });
      if (res.ok) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeed = async () => {
    if (!canEdit) return;
    if (!window.confirm('Импортировать базовый набор из 15 кодексов и законов?')) return;
    try {
      const res = await fetch('/api/admin/shelf-books/seed', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          items: SHARED_LEGISLATION.map((d) => ({
            title_ru: d.title.ru,
            title_tj: d.title.tj,
            title_en: d.title.en,
            url: d.url,
            badge: 'PDF',
          })),
        }),
      });
      if (res.ok) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLibFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !canEdit) return;
    if (f.size > MAX_LIBRARY_FILE) {
      setUploadStatus('Файл больше 100 МБ — сожмите PDF или разбейте на части');
      return;
    }
    try {
      const lname = f.name.toLowerCase();
      if (lname.endsWith('.txt') || lname.endsWith('.md')) {
        const text = await f.text();
        setFormData((prev) => ({ ...prev, content: text }));
      }
      setUploadStatus('Загрузка... 0%');
      const data = await uploadLibraryFile(f, formData.kind || 'document', (p) =>
        setUploadStatus(`Загрузка... ${p}%`)
      );
      setFormData((prev) => ({ ...prev, url: data.url }));
      setUploadStatus(`Загружено в library: ${Math.round((data.size || 0) / 1024)} КБ`);
      fetchBooks();
    } catch (err: any) {
      setUploadStatus(friendlyUploadError(err?.message || 'error'));
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !canEdit) return;
    if (f.size > MAX_LIBRARY_FILE) {
      setCoverUploadStatus('Файл больше 100 МБ');
      return;
    }
    setCoverUploadStatus('Загрузка... 0%');
    try {
      const data = await uploadLibraryFile(f, 'covers', (p) =>
        setCoverUploadStatus(`Загрузка... ${p}%`)
      );
      setFormData((prev) => ({ ...prev, cover_image: data.url }));
      setCoverUploadStatus(`Загружено: ${Math.round((data.size || 0) / 1024)} КБ`);
    } catch (err: any) {
      setCoverUploadStatus(friendlyUploadError(err?.message || 'error'));
    }
  };

  const handleMove = async (row: ShelfBookRow, dir: 1 | -1) => {
    if (!canEdit) return;
    const sorted = [...books].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    const i = sorted.findIndex((b) => b.id === row.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    try {
      const h = authHeaders();
      const r1 = await fetch(`/api/admin/shelf-books/${a.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ sort_order: b.sort_order }) });
      const r2 = await fetch(`/api/admin/shelf-books/${b.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ sort_order: a.sort_order }) });
      if (r1.ok && r2.ok) fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const kindLabel = (k?: string | null) => {
    const f = KIND_OPTIONS.find((o) => o.value === (k || ''));
    return f ? f.label : 'Авто';
  };

  const filtered = books.filter((b) => {
    if (kindFilter !== 'all') {
      const k = ((b.kind || detectKind(b.title_ru || '')) as DocKind);
      if (k !== kindFilter) return false;
    }
    const q = searchQuery.toLowerCase();
    return (
      b.title_ru?.toLowerCase().includes(q) ||
      b.title_tj?.toLowerCase().includes(q) ||
      b.url?.toLowerCase().includes(q)
    );
  });

  const columns: AdminTableColumn<ShelfBookRow>[] = [
    {
      header: 'Обложка',
      width: '90px',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-8 h-11 rounded-[3px] border border-amber-200/40 shrink-0"
            style={{ background: BOOK_THEMES[(row.cover_theme ?? 0) % BOOK_THEMES.length] }}
          />
          <span className="font-mono text-[11px] text-slate-500">#{row.sort_order}</span>
        </div>
      ),
    },
    {
      header: 'Название книги',
      accessor: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-serif font-bold text-sm text-white">{row.title_ru}</span>
          {row.title_tj && (
            <span className="font-sans text-[11px] text-slate-400 mt-0.5">{row.title_tj}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Ссылка / Бейдж',
      width: '200px',
      accessor: (row) => (
        <div className="flex flex-col text-left gap-1">
          <span className="font-mono text-[10px] text-amber-400 border border-amber-400/40 rounded px-1.5 py-0.5 w-fit">
            {row.badge || 'PDF'}
          </span>
          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]" title={row.url || ''}>
            {row.url || '— нет ссылки —'}
          </span>
        </div>
      ),
    },
    {
      header: 'Категория',
      width: '130px',
      accessor: (row) => (
        <span className="font-mono text-[11px] text-amber-300/90 uppercase">
          {kindLabel(row.kind || detectKind(row.title_ru || ''))}
        </span>
      ),
    },
    {
      header: 'Видимость',
      width: '110px',
      accessor: (row) => (
        <AdminBadge variant={row.is_visible ? 'published' : 'draft'} label={row.is_visible ? 'НА ПОЛКЕ' : 'СКРЫТА'} />
      ),
    },
    {
      header: 'Действия',
      width: '170px',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canEdit && (
            <>
              <button
                onClick={() => handleMove(row, -1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                title="Выше"
              >
                <ChevronUp size={15} />
              </button>
              <button
                onClick={() => handleMove(row, 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                title="Ниже"
              >
                <ChevronDown size={15} />
              </button>
            </>
          )}
          <button
            onClick={() => handleToggleVisible(row)}
            disabled={!canEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 disabled:opacity-30"
            title={row.is_visible ? 'Скрыть с полки' : 'Показать на полке'}
          >
            {row.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            disabled={!canEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 disabled:opacity-30"
            title="Редактировать"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={!canEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 disabled:opacity-30"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Книги и библиотека</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Электронная библиотека суда: категории, порядок, обложки, видимость.
          </p>
          {!canEdit && (
            <p className="font-mono text-[11px] text-amber-300/90 mt-2 inline-flex items-center gap-1.5">
              <Lock size={12} /> Режим чтения — ваша роль ({user?.role}): изменение библиотеки недоступно
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {books.length === 0 && !isLoading && canEdit && (
            <AdminButton variant="outline" size="md" leftIcon={<Download size={16} />} onClick={handleSeed}>
              Импортировать базовый набор (15)
            </AdminButton>
          )}
          {canEdit && (
            <AdminButton variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={handleOpenNew}>
              Добавить книгу
            </AdminButton>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или ссылке..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', ...DOC_KINDS] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-colors ${
                kindFilter === k
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {k === 'all' ? 'Все категории' : pickTri(DOC_KIND_LABEL[k], 'ru')}
            </button>
          ))}
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="Книг пока нет — добавьте первую или импортируйте базовый набор"
      />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Редактирование книги' : 'Новая книга на полке'}
        subtitle="Название, ссылка на PDF, цвет обложки и порядок"
        maxWidth="max-w-[95vw]"
        footer={
          <>
            <AdminButton variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Отмена
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSave}>
              Сохранить книгу
            </AdminButton>
          </>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-6">
          <div className="space-y-4">
            <AdminInput
              label="Название (RU)"
              required
              value={formData.title_ru}
              onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
              placeholder="Гражданский кодекс РТ, часть 1"
            />
            <AdminInput
              label="Название (TJ)"
              value={formData.title_tj}
              onChange={(e) => setFormData({ ...formData, title_tj: e.target.value })}
              placeholder="Кодекси граждании ҶТ, қисми 1"
            />
            <AdminInput
              label="Название (EN)"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="Civil Code of RT, Part 1"
            />
            <AdminInput
              label="Ссылка на документ (URL)"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="http://sud.tj/upload/iblock/...pdf"
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Файл в библиотеку (PDF, DOCX, TXT, MD, изображения)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={libFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.gif"
                  className="hidden"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleLibFile}
                />
                <AdminButton variant="outline" size="sm" onClick={() => libFileRef.current?.click()} disabled={!canEdit}>
                  Выбрать файл
                </AdminButton>
                {uploadStatus && (
                  <span className="font-mono text-[11px] text-amber-300/90">{uploadStatus}</span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Файл сохранится в data/library/&lt;категория&gt;/, ссылка подставится сама. TXT/MD сразу попадут в текст книги.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Полный текст книги {formData.content ? `(${formData.content.length} символов)` : '(пусто)'}
              </span>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={7}
                placeholder="Вставьте текст кодекса/закона или импортируйте с mmk.tj по DocumentId ниже..."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 p-3 leading-relaxed"
              />
              <div className="flex items-center gap-2">
                <input
                  value={formData.importDocId}
                  onChange={(e) => setFormData({ ...formData, importDocId: e.target.value.replace(/\D/g, '') })}
                  placeholder="DocumentId с mmk.tj (напр. 23359)"
                  disabled={!editing}
                  className="w-56 h-9 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-40"
                />
                <AdminButton variant="outline" size="sm" onClick={handleImportDoc} disabled={!editing || !formData.importDocId.trim()}>
                  Импорт с mmk.tj
                </AdminButton>
                {formData.importStatus && (
                  <span className="font-mono text-[11px] text-amber-300/90">{formData.importStatus}</span>
                )}
              </div>
              {!editing && (
                <span className="text-[11px] text-slate-500">Импорт по DocumentId доступен после создания книги.</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AdminInput
                label="Бейдж"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="PDF"
              />
              <AdminSelect
                label="Категория"
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                options={KIND_OPTIONS}
              />
              <AdminInput
                label="Порядок на полке"
                type="number"
                value={String(formData.sort_order)}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Видимость</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_visible: formData.is_visible ? 0 : 1 })}
                  className={`h-10 px-3 rounded-xl border text-xs font-mono transition-colors ${
                    formData.is_visible
                      ? 'border-amber-400/60 text-amber-400 bg-amber-400/10'
                      : 'border-slate-800 text-slate-500 bg-slate-900/90'
                  }`}
                >
                  {formData.is_visible ? 'На полке' : 'Скрыта'}
                </button>
              </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Цвет обложки</span>
              <div className="flex items-center gap-2">
                {BOOK_THEMES.map((g, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, cover_theme: i })}
                    title={`Обложка ${i + 1}`}
                    className={`w-10 h-14 rounded-[3px] border-2 transition-all ${
                      formData.cover_theme === i ? 'border-amber-400 scale-105' : 'border-slate-700 hover:border-slate-500'
                    }`}
                    style={{ background: g }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Дизайн обложки</span>
              <AdminInput
                label="Текст на обложке (пусто — название книги)"
                value={formData.cover_text}
                onChange={(e) => setFormData({ ...formData, cover_text: e.target.value })}
                placeholder="Напр. Конституция"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminSelect
                  label="Эмблема"
                  value={formData.cover_emblem}
                  onChange={(e) => setFormData({ ...formData, cover_emblem: e.target.value })}
                  options={COVER_EMBLEM_OPTIONS}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Свой фон (цвет)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(formData.cover_bg || '') ? formData.cover_bg : '#17233d'}
                      onChange={(e) => setFormData({ ...formData, cover_bg: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                      title="Выбрать цвет фона"
                    />
                    <input
                      value={formData.cover_bg}
                      onChange={(e) => setFormData({ ...formData, cover_bg: e.target.value })}
                      placeholder="#17233d или gradient(...)"
                      className="flex-1 h-10 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    {formData.cover_bg && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_bg: '' })}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Убрать фон"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Своя картинка обложки</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={coverFileRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.gif"
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                    onChange={handleCoverFile}
                  />
                  <AdminButton variant="outline" size="sm" onClick={() => coverFileRef.current?.click()} disabled={!canEdit}>
                    Выбрать картинку
                  </AdminButton>
                  {formData.cover_image && (
                    <>
                      <img src={formData.cover_image} alt="" className="w-10 h-14 rounded-[3px] border border-amber-200/40 object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_image: '' })}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        title="Убрать картинку"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  {coverUploadStatus && (
                    <span className="font-mono text-[11px] text-amber-300/90">{coverUploadStatus}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live mini preview */}
          <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 h-fit">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen size={12} /> Предпросмотр
            </span>
            <span className="leglib-book" style={{ opacity: 1 }}>
              <span className="leglib-book-inner" style={{ transform: 'rotateY(-18deg)' }}>
                <span className="leglib-face leglib-spine" style={{ background: BOOK_THEMES[formData.cover_theme % BOOK_THEMES.length] }}>
                  <span className="leglib-spine-text">{formData.title_ru || 'Название книги'}</span>
                  <span className="font-mono text-[8px] tracking-[0.2em] text-theme-gold/80">
                    {String((formData.sort_order || 0) + 1).padStart(2, '0')}
                  </span>
                </span>
              </span>
            </span>
            <span className="font-mono text-[10px] text-amber-400 border border-amber-400/40 rounded px-1.5 py-0.5">
              {formData.badge || 'PDF'}
            </span>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default ShelfBooksManager;

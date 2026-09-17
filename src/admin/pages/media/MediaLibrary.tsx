import React, { useState, useEffect } from 'react';
import { Upload, Copy, Check, FileText } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminDrawer } from '../../components/ui/AdminDrawer';

interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url?: string;
  alt_text?: string;
  created_at: string;
}

export const MediaLibrary: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchMedia = async () => {
    try {
      const token = sessionStorage.getItem('cms-token');
      const res = await fetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMedia(data.items || data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const token = sessionStorage.getItem('cms-token');
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        fetchMedia();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-white">Медиатека</h2>
          <p className="font-sans text-xs text-slate-400 mt-1">
            Хранилище официальных фотографий, документов, эмблем и материалов пресс-службы
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            accept="image/*,application/pdf"
          />
          <span className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-slate-950 font-semibold text-sm hover:brightness-110 active:scale-[0.98] shadow-md shadow-amber-500/20">
            <Upload size={16} />
            {isUploading ? 'Загрузка...' : 'Загрузить файл'}
          </span>
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => {
          const isImage = item.mime_type?.startsWith('image/');
          const fileUrl = item.url || `/uploads/${item.filename}`;

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-xl border border-slate-800 bg-[#070d1a] overflow-hidden cursor-pointer hover:border-amber-400/50 hover:shadow-lg transition-all"
            >
              <div className="aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={item.original_name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <FileText size={36} className="text-amber-400/70" />
                )}
              </div>

              <div className="p-2.5 bg-[#0a1120] border-t border-slate-800">
                <p className="font-sans text-xs text-slate-200 truncate font-medium">
                  {item.original_name}
                </p>
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mt-1">
                  <span>{(item.size / 1024).toFixed(1)} KB</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspector Drawer */}
      <AdminDrawer
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Сведения о файле"
        subtitle="Техническая информация и прямая ссылка"
        footer={
          <AdminButton variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
            Закрыть
          </AdminButton>
        }
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center overflow-hidden max-h-64">
              {selectedItem.mime_type?.startsWith('image/') ? (
                <img
                  src={selectedItem.url || `/uploads/${selectedItem.filename}`}
                  alt={selectedItem.original_name}
                  className="max-h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                  <FileText size={48} className="text-amber-400" />
                  <span className="font-mono text-xs">{selectedItem.original_name}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Имя файла:</span>
                <span className="text-white truncate max-w-xs">{selectedItem.original_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">MIME Тип:</span>
                <span className="text-slate-300">{selectedItem.mime_type}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Размер:</span>
                <span className="text-slate-300">{(selectedItem.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Дата загрузки:</span>
                <span className="text-slate-300">{new Date(selectedItem.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                Прямая ссылка для вставки
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedItem.url || `/uploads/${selectedItem.filename}`}
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300"
                />
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(selectedItem.url || `/uploads/${selectedItem.filename}`, selectedItem.id)
                  }
                  leftIcon={copiedId === selectedItem.id ? <Check size={14} /> : <Copy size={14} />}
                >
                  {copiedId === selectedItem.id ? 'Скопировано' : 'Копировать'}
                </AdminButton>
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
};
export default MediaLibrary;

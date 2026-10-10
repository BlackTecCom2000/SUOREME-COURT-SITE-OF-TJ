import React, { useState, useEffect } from 'react';
import { Upload, Copy, Check, FileText } from 'lucide-react';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminDrawer } from '../../components/ui/AdminDrawer';
import { apiFetch } from '../../context/adminHttp';

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
      const res = await apiFetch('/api/admin/media');
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
      const res = await apiFetch('/api/admin/media', {
        method: 'POST',
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
          <h2 className="font-serif font-bold text-2xl text-theme-text">Медиатека</h2>
          <p className="font-sans text-xs text-theme-textMuted mt-1">
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
          <span className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-theme-gold to-theme-gold/80 text-theme-bg font-semibold text-sm hover:brightness-110 active:scale-[0.98] shadow-md shadow-amber-500/20">
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
              className="group relative rounded-xl border border-theme-border bg-theme-surface overflow-hidden cursor-pointer hover:border-amber-400/50 hover:shadow-lg transition-all"
            >
              <div className="aspect-square w-full bg-theme-bg flex items-center justify-center overflow-hidden">
                {isImage ? (
                  <img
                    src={fileUrl}
                    alt={item.original_name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <FileText size={36} className="text-theme-gold/70" />
                )}
              </div>

              <div className="p-2.5 bg-theme-bg/60 border-t border-theme-border">
                <p className="font-sans text-xs text-theme-textSec truncate font-medium">
                  {item.original_name}
                </p>
                <div className="flex items-center justify-between font-mono text-2xs text-theme-textMuted mt-1">
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
            <div className="rounded-xl border border-theme-border bg-theme-bg p-2 flex items-center justify-center overflow-hidden max-h-64">
              {selectedItem.mime_type?.startsWith('image/') ? (
                <img
                  src={selectedItem.url || `/uploads/${selectedItem.filename}`}
                  alt={selectedItem.original_name}
                  className="max-h-56 object-contain rounded-lg"
                />
              ) : (
                <div className="py-12 flex flex-col items-center gap-2 text-theme-textMuted">
                  <FileText size={48} className="text-theme-gold" />
                  <span className="font-mono text-xs">{selectedItem.original_name}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-theme-border bg-theme-surface space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-theme-border pb-2">
                <span className="text-theme-textMuted">Имя файла:</span>
                <span className="text-theme-text truncate max-w-xs">{selectedItem.original_name}</span>
              </div>
              <div className="flex justify-between border-b border-theme-border pb-2">
                <span className="text-theme-textMuted">MIME Тип:</span>
                <span className="text-theme-textSec">{selectedItem.mime_type}</span>
              </div>
              <div className="flex justify-between border-b border-theme-border pb-2">
                <span className="text-theme-textMuted">Размер:</span>
                <span className="text-theme-textSec">{(selectedItem.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-textMuted">Дата загрузки:</span>
                <span className="text-theme-textSec">{new Date(selectedItem.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-xs text-theme-textMuted uppercase tracking-wider">
                Прямая ссылка для вставки
              </span>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedItem.url || `/uploads/${selectedItem.filename}`}
                  className="w-full h-10 px-3 rounded-lg bg-theme-bg border border-theme-border font-mono text-xs text-amber-300"
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

import React, { useState } from 'react';
import { Brain, Database as DbIcon, Save, Activity } from 'lucide-react';

export const AiDashboard: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [url, setUrl] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const handleIndex = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setNotice({ ok: false, text: 'Название и контент обязательны' });
      return;
    }

    setIsIndexing(true);
    setNotice(null);
    try {
      const res = await fetch('/api/ai/index-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('cms-token')}`
        },
        body: JSON.stringify({ title, content, type, url })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.error) || 'Failed to index');

      setNotice({ ok: true, text: `Успешно проиндексировано! Чанков: ${data?.chunks ?? '?'}` });
      setTitle('');
      setContent('');
      setUrl('');
    } catch (err: any) {
      setNotice({ ok: false, text: err?.message || 'Ошибка индексации' });
    } finally {
      setIsIndexing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-theme-gold/20 text-theme-gold rounded-xl">
          <Brain size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-theme-text">AI Knowledge Platform</h1>
          <p className="text-theme-textMuted">Управление базой знаний и RAG</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indexing Form */}
        <div className="lg:col-span-2">
          <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-6">
              <DbIcon size={18} className="text-theme-gold" />
              Добавление в Базу Знаний
            </h2>
            
            <form onSubmit={handleIndex} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-textMuted mb-1">Название источника</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Закон РТ «О государственной пошлине»"
                  className="w-full h-11 px-4 rounded-xl bg-theme-bg border border-theme-border text-theme-text focus:border-theme-gold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-textMuted mb-1">Тип документа</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-theme-bg border border-theme-border text-theme-text focus:border-theme-gold outline-none"
                  >
                    <option value="law">Закон / Кодекс</option>
                    <option value="act">Судебный акт</option>
                    <option value="practice">Судебная практика</option>
                    <option value="info">Справочная информация</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-textMuted mb-1">URL (опционально)</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                    className="w-full h-11 px-4 rounded-xl bg-theme-bg border border-theme-border text-theme-text focus:border-theme-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-textMuted mb-1">Текст для векторизации</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Вставьте полный текст документа. Он будет автоматически разбит на чанки и векторизован..."
                  className="w-full h-48 p-4 rounded-xl bg-theme-bg border border-theme-border text-theme-text focus:border-theme-gold outline-none resize-none"
                />
              </div>

              {notice && (
                <div
                  role="status"
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs border ${
                    notice.ok
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {notice.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isIndexing}
                className="btn-primary w-full h-12 flex items-center justify-center gap-2"
              >
                {isIndexing ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Векторизовать и сохранить
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-theme-surface border border-theme-border rounded-2xl p-6">
             <h2 className="text-lg font-semibold text-theme-text flex items-center gap-2 mb-6">
              <Activity size={18} className="text-theme-gold" />
              Статистика AI
            </h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-3 border-b border-theme-border">
                  <span className="text-theme-textMuted">Модель:</span>
                  <span className="font-mono text-xs px-2 py-1 bg-theme-gold/10 text-theme-gold rounded border border-theme-gold/20">
                    HYBRID-RAG / OPENAI
                  </span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-theme-border">
                  <span className="text-theme-textMuted">Векторный поиск:</span>
                  <span className="text-green-500 font-medium">Активен (Cosine Sim)</span>
               </div>
               <div className="flex justify-between items-center pb-3 border-b border-theme-border">
                  <span className="text-theme-textMuted">FTS5 (Keyword):</span>
                  <span className="text-green-500 font-medium">Активен</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

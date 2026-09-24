import React, { useEffect, useState } from 'react';
import { ExternalLink, Plus, Trash2, GripVertical, Copy, Eye, EyeOff, Save } from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { apiFetch } from '../../context/adminHttp';

interface UsefulSite {
  id: number; url: string; label_tj?: string; label_ru: string; label_en?: string;
  image?: string; icon?: string; status: string; sort_order: number; language?: string;
}

export const UsefulSitesManager: React.FC = () => {
  const [items, setItems] = useState<UsefulSite[]>([]);
  const [marquee, setMarquee] = useState({ speed: 36, direction: 'left', autoplay: true, pause_on_hover: true, pause_on_focus: true, logo_size: 84, gap: 12 });
  const [form, setForm] = useState({ url: '', label_ru: '', label_tj: '', label_en: '' });
  const [editing, setEditing] = useState<number | null>(null);

  const load = () => {
    apiFetch('/api/admin/useful-sites').then(r=> r.ok? r.json(): []).then(setItems).catch(()=>{});
    apiFetch('/api/admin/marquee-config').then(r=> r.ok? r.json(): null).then(c=> c && setMarquee({speed:c.speed, direction:c.direction, autoplay:!!c.autoplay, pause_on_hover:!!c.pause_on_hover, pause_on_focus:!!c.pause_on_focus, logo_size:c.logo_size, gap:c.gap})).catch(()=>{});
  };
  useEffect(load, []);

  const saveMarquee = async () => {
    await apiFetch('/api/admin/marquee-config', { method:'POST', body: JSON.stringify(marquee) });
    alert('Настройки бегущей строки сохранены (DRAFT→PUBLISH через Site Builder).');
  };

  const create = async () => {
    if(!form.url || !form.label_ru) return alert('URL и название RU обязательны');
    const res = await apiFetch('/api/admin/useful-sites', { method:'POST', body: JSON.stringify({ url: form.url, label_ru: form.label_ru, label_tj: form.label_tj, label_en: form.label_en, status:'published', language:'ru' }) });
    if(res.ok){ setForm({url:'',label_ru:'',label_tj:'',label_en:''}); load(); }
  };
  const update = async (id:number, patch:any) => {
    await apiFetch(`/api/admin/useful-sites/${id}`, { method:'PUT', body: JSON.stringify(patch) }); load();
  };
  const del = async (id:number) => { if(!confirm('Удалить? Требуется подтверждение.')) return; await apiFetch(`/api/admin/useful-sites/${id}`, { method:'DELETE' }); load(); };
  const dup = async (id:number) => { await apiFetch(`/api/admin/useful-sites/${id}/duplicate`, { method:'POST' }); load(); };
  const reorder = async (from:number, to:number) => {
    const arr=[...items]; const [m]=arr.splice(from,1); arr.splice(to,0,m);
    setItems(arr);
    await apiFetch('/api/admin/useful-sites/reorder', { method:'POST', body: JSON.stringify({ order: arr.map(x=>x.id) }) });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-white">Полезные сайты — СОМОНАҲОИ МУФИД</h2>
        <span className="font-mono text-xs text-slate-400">Marquee • CMS data-driven • single source</span>
      </div>

      <AdminCard title="Бегущая строка — настройки" subtitle="Скорость, направление, автозапуск, пауза, размер, интервал, порядок">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-slate-400">Скорость (сек, 5-120)</span>
            <AdminInput type="number" value={String(marquee.speed)} onChange={e=> setMarquee({...marquee, speed: Number(e.target.value)||36})} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-slate-400">Направление</span>
            <AdminSelect value={marquee.direction} onChange={e=> setMarquee({...marquee, direction: (e.target as HTMLSelectElement).value as any})} options={[{value:'left',label:'Влево'},{value:'right',label:'Вправо'}]} />
          </label>
          <label className="flex items-center gap-2 font-mono text-xs text-slate-300"><input type="checkbox" checked={marquee.autoplay} onChange={e=> setMarquee({...marquee, autoplay:e.target.checked})} /> Автозапуск</label>
          <label className="flex items-center gap-2 font-mono text-xs text-slate-300"><input type="checkbox" checked={marquee.pause_on_hover} onChange={e=> setMarquee({...marquee, pause_on_hover:e.target.checked})} /> PauseOnHover</label>
          <label className="flex items-center gap-2 font-mono text-xs text-slate-300"><input type="checkbox" checked={marquee.pause_on_focus} onChange={e=> setMarquee({...marquee, pause_on_focus:e.target.checked})} /> PauseOnFocus</label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-slate-400">Размер логотипов (40-200)</span>
            <AdminInput type="number" value={String(marquee.logo_size)} onChange={e=> setMarquee({...marquee, logo_size: Number(e.target.value)||84})} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs text-slate-400">Интервал (4-48)</span>
            <AdminInput type="number" value={String(marquee.gap)} onChange={e=> setMarquee({...marquee, gap: Number(e.target.value)||12})} />
          </label>
          <div className="flex items-end"><AdminButton onClick={saveMarquee} leftIcon={<Save size={14}/>}>Сохранить (Draft→Version)</AdminButton></div>
        </div>
        <p className="font-mono text-[11px] text-slate-500 mt-3">Бесшовный loop: дублированный трек, без скачка, скорость/direction из админки, пауза при наведении/focus, touch/swipe на mobile, Liquid Glass сохранен.</p>
      </AdminCard>

      <AdminCard title="Добавить полезный сайт" subtitle="title, subtitle, description, image, icon, link, category, language, status, sortOrder, publishedAt — TJ/RU/EN">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <AdminInput placeholder="https://example.tj" value={form.url} onChange={e=> setForm({...form, url:e.target.value})} label="Ссылка (link) *" />
          <AdminInput placeholder="Президент РТ" value={form.label_ru} onChange={e=> setForm({...form, label_ru:e.target.value})} label="Название RU *" />
          <AdminInput placeholder="Президенти ҶТ" value={form.label_tj} onChange={e=> setForm({...form, label_tj:e.target.value})} label="TJ" />
          <AdminInput placeholder="President RT" value={form.label_en} onChange={e=> setForm({...form, label_en:e.target.value})} label="EN" />
        </div>
        <div className="mt-3"><AdminButton onClick={create} leftIcon={<Plus size={14}/>}>Создать (draft)</AdminButton></div>
      </AdminCard>

      <AdminCard title="Список — управление" subtitle="создавать, редактировать, удалять, активировать, перемещать, сортировать, дублировать, публиковать, drag & drop">
        <div className="space-y-2">
          {items.map((it, idx)=> (
            <div key={it.id} className="flex items-center gap-2 p-2 rounded-xl border border-white/10 glass">
              <button className="cursor-grab p-1 text-slate-500" draggable onDragStart={e=> e.dataTransfer.setData('idx', String(idx))} onDragOver={e=> e.preventDefault()} onDrop={e=> { const from=Number(e.dataTransfer.getData('idx')); if(!isNaN(from)) reorder(from, idx); }}> <GripVertical size={14}/> </button>
              <img src={it.image || `https://www.google.com/s2/favicons?domain=${(() => { try { return new URL(it.url).hostname } catch { return 'example.com' } })()}&sz=32`} alt="" className="w-6 h-6 rounded object-contain bg-white/10" loading="lazy" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate">{it.label_ru} <span className="text-slate-500">• {it.url}</span></div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{it.label_tj} / {it.label_en}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${it.status==='published'?'bg-emerald-500/20 text-emerald-300 border-emerald-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>{it.status}</span>
              <AdminButton size="sm" variant="ghost" onClick={()=> setEditing(editing===it.id?null:it.id)}>{editing===it.id?'Закрыть':' Edit'}</AdminButton>
              <AdminButton size="sm" variant="ghost" onClick={()=> dup(it.id)}><Copy size={12}/></AdminButton>
              <button onClick={()=> update(it.id, {status: it.status==='published'?'draft':'published'})} className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white" title="активировать/деактивировать">{it.status==='published'?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              <button onClick={()=> del(it.id)} className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 size={14}/></button>
              <a href={it.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-[var(--court-gold)]"><ExternalLink size={14}/></a>
            </div>
          ))}
          {items.length===0 && <div className="py-8 text-center font-mono text-xs text-slate-500">Нет элементов — добавьте выше.</div>}
        </div>
        {editing && (
          <div className="mt-4 p-3 rounded-xl border border-amber-400/20 bg-amber-500/5">
            {(() => { const it=items.find(x=>x.id===editing); if(!it) return null; return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <AdminInput label="URL" value={it.url} onChange={e=> update(it.id, {url:e.target.value})} />
                <AdminInput label="RU" value={it.label_ru} onChange={e=> update(it.id, {label_ru:e.target.value})} />
                <AdminInput label="TJ" value={it.label_tj||''} onChange={e=> update(it.id, {label_tj:e.target.value})} />
                <AdminInput label="EN" value={it.label_en||''} onChange={e=> update(it.id, {label_en:e.target.value})} />
                <AdminSelect label="Статус" value={it.status} onChange={e=> update(it.id, {status:(e.target as HTMLSelectElement).value})} options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'archived',label:'Archived'}]} />
              </div>
            ); })()}
          </div>
        )}
      </AdminCard>
    </div>
  );
};
export default UsefulSitesManager;

import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Eye, EyeOff, Save, Rocket, RotateCcw, Monitor, Tablet, Smartphone } from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { apiFetch } from '../../context/adminHttp';
import { useAdminAuth } from '../../context/AdminAuthContext';

type Section = { id:string; key:string; title_ru?:string; title_tj?:string; title_en?:string; subtitle_ru?:string; subtitle_tj?:string; subtitle_en?:string; description_ru?:string; description_tj?:string; description_en?:string; image?:string; icon?:string; link?:string; category?:string; language?:string; visible:number; sort_order:number; status:string; settings?:string };

const palette = [
  { key:'hero', label:'Hero', icon:'H' },
  { key:'news', label:'News', icon:'N' },
  { key:'card', label:'Card', icon:'C' },
  { key:'court_directory', label:'Court Directory', icon:'D' },
  { key:'map', label:'Map', icon:'M' },
  { key:'useful', label:'Useful Sites', icon:'U' },
  { key:'statistics', label:'Statistics', icon:'S' },
  { key:'services', label:'Services', icon:'Sv' },
  { key:'documents', label:'Documents', icon:'Dc' },
  { key:'contacts', label:'Contacts', icon:'Ct' },
  { key:'footer', label:'Footer', icon:'F' },
  { key:'custom', label:'Custom Section', icon:'+' },
];

function SortableItem({ id, children }: any){
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});
  const style={ transform: CSS.Transform.toString(transform), transition };
  return <div ref={setNodeRef} style={style as any} {...attributes} {...listeners}>{children}</div>;
}

export const SiteBuilder: React.FC = () => {
  const { hasPerm } = useAdminAuth();
  const canEdit = hasPerm('content.edit');
  const canPublish = hasPerm('content.publish');
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [design, setDesign] = useState<Record<string,string>>({});
  const [versions, setVersions] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));

  const load = () => {
    apiFetch('/api/admin/site-sections').then(r=> r.ok?r.json():[]).then(setSections).catch(()=>{});
    apiFetch('/api/admin/design-settings').then(r=> r.ok?r.json():[]).then((rows:any[])=>{ const o:any={}; rows.forEach((r:any)=> o[r.key]=r.draft_value); setDesign(o); }).catch(()=>{});
    apiFetch('/api/admin/site-versions').then(r=> r.ok?r.json():[]).then(setVersions).catch(()=>{});
  };
  useEffect(load, []);
  useEffect(()=>{ // live apply design tokens to preview (global)
    const root=document.documentElement;
    if(design.glass_intensity) root.style.setProperty('--glass-surface', `rgba(255,255,255,${design.glass_intensity})`);
    if(design.glass_blur) root.style.setProperty('--glass-blur', `${design.glass_blur}px`);
    if(design.glass_border) root.style.setProperty('--glass-border', `rgba(255,255,255,${design.glass_border})`);
    if(design.glass_radius) root.style.setProperty('--glass-radius-card', `${design.glass_radius}px`);
    if(design.gold_accent) root.style.setProperty('--court-gold', design.gold_accent);
  }, [design]);

  const sel = sections.find(s=> s.id===selected) || null;

  const add = async (key:string) => {
    if(!canEdit) return alert('No permission');
    const res = await apiFetch('/api/admin/site-sections', { method:'POST', body: JSON.stringify({ key, title_ru: key, status:'draft', visible:true, sort_order: sections.length }) });
    if(res.ok) load();
  };
  const dup = async (id:string) => { await apiFetch(`/api/admin/site-sections/${id}/duplicate`, { method:'POST' }); load(); };
  const del = async (id:string) => { if(!confirm('Удалить секцию? Критические hero/footer требуют подтверждения.')) return; const r=await apiFetch(`/api/admin/site-sections/${id}`, { method:'DELETE' }); if(!r.ok){ const j=await r.json(); alert(j.error||'Cannot delete'); return; } load(); };
  const upd = async (id:string, patch:any) => { await apiFetch(`/api/admin/site-sections/${id}`, { method:'PUT', body: JSON.stringify(patch)}); load(); };
  const reorder = async (oldIdx:number, newIdx:number) => {
    const arr=arrayMove(sections, oldIdx, newIdx); setSections(arr);
    await apiFetch('/api/admin/site-sections/reorder', { method:'POST', body: JSON.stringify({ order: arr.map(s=>s.id) }) });
  };
  const saveDraft = async () => {
    await apiFetch('/api/admin/site/save-draft', { method:'POST', body: JSON.stringify({ snapshot: { sections, design }, message: message||'Save draft' }) });
    setMessage(''); load(); alert('Черновик сохранен (не публикуется до Publish). Preview обновлен.');
  };
  const publish = async () => {
    if(!canPublish) return alert('Need publish permission');
    if(!confirm('Опубликовать? Preview покажет production.')) return;
    await apiFetch('/api/admin/site/publish', { method:'POST', body: JSON.stringify({ message: message||'Publish' }) });
    setMessage(''); load(); alert('Опубликовано. Публичный сайт получает published config.');
  };
  const rollback = async (id:number) => { if(!confirm(`Rollback to #${id}?`)) return; await apiFetch(`/api/admin/site-versions/${id}/rollback`, { method:'POST' }); load(); };

  const widthMap = { desktop:'100%', tablet:'820px', mobile:'390px' } as const;

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-white">Visual Site Builder — Live Preview</h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">Просмотр:</span>
          <button onClick={()=> setPreviewMode('desktop')} className={`p-2 rounded-lg border ${previewMode==='desktop'?'bg-amber-500/20 border-amber-500/30 text-amber-300':'border-white/10 text-slate-400'}`} title="Desktop 1920"><Monitor size={14}/></button>
          <button onClick={()=> setPreviewMode('tablet')} className={`p-2 rounded-lg border ${previewMode==='tablet'?'bg-amber-500/20 border-amber-500/30 text-amber-300':'border-white/10 text-slate-400'}`} title="Tablet 1024"><Tablet size={14}/></button>
          <button onClick={()=> setPreviewMode('mobile')} className={`p-2 rounded-lg border ${previewMode==='mobile'?'bg-amber-500/20 border-amber-500/30 text-amber-300':'border-white/10 text-slate-400'}`} title="Mobile 390"><Smartphone size={14}/></button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left — Components */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <AdminCard title="Компоненты" subtitle="Перетащите или нажмите +">
            <div className="grid grid-cols-3 gap-2">
              {palette.map(p=> (
                <button key={p.key} onClick={()=> add(p.key)} className="p-3 rounded-xl glass border border-white/10 hover:border-[var(--court-gold)]/30 flex flex-col items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors">
                  <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px]">{p.icon}</span>
                  <span className="text-[11px] leading-tight text-center">{p.label}</span>
                </button>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="Глобальные настройки" subtitle="Glass intensity, blur, border, radius, shadow, gold, background, typography, animation">
            <div className="space-y-2">
              {[
                {k:'glass_intensity', label:'Glass intensity (0.05-0.30)'},
                {k:'glass_blur', label:'Blur (12-40)'},
                {k:'glass_border', label:'Border (0.10-0.50)'},
                {k:'glass_radius', label:'Radius (12-30)'},
                {k:'gold_accent', label:'Gold accent (hex)'},
              ].map(f=> (
                <div key={f.k} className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400 w-32">{f.label}</span>
                  <AdminInput value={design[f.k]||''} onChange={e=> setDesign({...design, [f.k]: e.target.value})} className="flex-1" />
                  <AdminButton size="sm" onClick={async()=>{ await apiFetch('/api/admin/design-settings', { method:'POST', body: JSON.stringify({key:f.k, value: design[f.k]||''})}); alert('Draft saved');}}>Сохранить</AdminButton>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <AdminSelect value={design.preset||'premium'} onChange={e=> setDesign({...design, preset:(e.target as HTMLSelectElement).value})} options={[{value:'premium',label:'Liquid Glass Premium'},{value:'ultra',label:'Ultra'},{value:'light',label:'Official Light'},{value:'dark',label:'Official Dark'}]} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Center — Live Preview */}
        <div className="col-span-12 lg:col-span-6">
          <AdminCard title={`Live Preview — ${previewMode} ${previewMode==='desktop'?'1920':previewMode==='tablet'?'1024':'390'}`} subtitle="Изменение текста/цвета/размера/порядка/видимости сразу отображается">
            <div className="flex justify-center bg-[#040813] p-3 rounded-xl overflow-auto">
              <div style={{ width: widthMap[previewMode], maxWidth:'100%', transform: previewMode==='mobile'?'scale(1)':'none', transition:'width 0.3s' }} className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({active, over})=>{ if(active.id!==over?.id){ const oi=sections.findIndex(s=>s.id===active.id); const ni=sections.findIndex(s=>s.id===over?.id); reorder(oi, ni); }}}>
                  <SortableContext items={sections.map(s=>s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map(s=> (
                      <SortableItem key={s.id} id={s.id}>
                        <div onClick={()=> setSelected(s.id)} className={`p-3 rounded-xl glass border flex items-center justify-between gap-2 cursor-pointer ${selected===s.id?'border-[var(--court-gold)] bg-amber-500/10':'border-white/10 hover:border-white/20'} ${s.visible? 'opacity-100':'opacity-40'}`}>
                          <div className="flex items-center gap-2">
                            <GripVertical size={12} className="text-slate-500 cursor-grab" />
                            <span className="font-mono text-xs text-white">{s.key}</span>
                            <span className="text-xs text-slate-400 truncate max-w-[140px]">{s.title_ru||'—'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={(e)=>{e.stopPropagation(); upd(s.id, {visible: !s.visible})}} className="p-1 rounded border border-white/10 text-slate-400 hover:text-white">{s.visible?<Eye size={12}/>:<EyeOff size={12}/>}</button>
                            <button onClick={(e)=>{e.stopPropagation(); dup(s.id)}} className="p-1 rounded border border-white/10 text-slate-400"><Copy size={12}/></button>
                            <button onClick={(e)=>{e.stopPropagation(); del(s.id)}} className="p-1 rounded border border-red-500/30 text-red-400"><Trash2 size={12}/></button>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
                {sections.length===0 && <div className="py-12 text-center font-mono text-xs text-slate-500">Нет секций — добавьте из Components слева.</div>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <AdminInput placeholder="Комментарий к версии" value={message} onChange={e=> setMessage(e.target.value)} className="flex-1" />
              <AdminButton onClick={saveDraft} leftIcon={<Save size={14}/>}>Сохранить черновик</AdminButton>
              <AdminButton variant="primary" onClick={publish} leftIcon={<Rocket size={14}/>}>Опубликовать</AdminButton>
            </div>
            <div className="flex gap-2 mt-2">
              <AdminButton size="sm" variant="ghost" onClick={()=> alert('Preview: открыт в новой вкладке /?preview=draft')}>Предпросмотр</AdminButton>
              <AdminButton size="sm" variant="ghost" onClick={()=> { if(!confirm('Отменить изменения?')) return; load(); }}>Отменить изменения</AdminButton>
            </div>
          </AdminCard>
        </div>

        {/* Right — Properties */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          <AdminCard title="Свойства секции" subtitle="content, layout, visibility, spacing, typography, background, glass, animation, links, responsive">
            {!sel ? <div className="py-8 text-center font-mono text-xs text-slate-500">Выберите секцию в центре.</div> : (
              <div className="space-y-3">
                <AdminInput label="Title RU" value={sel.title_ru||''} onChange={e=> upd(sel.id, {title_ru: e.target.value})} />
                <AdminInput label="Title TJ" value={sel.title_tj||''} onChange={e=> upd(sel.id, {title_tj: e.target.value})} />
                <AdminInput label="Title EN" value={sel.title_en||''} onChange={e=> upd(sel.id, {title_en: e.target.value})} />
                <AdminSelect label="Статус" value={sel.status} onChange={e=> upd(sel.id, {status:(e.target as HTMLSelectElement).value})} options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'archived',label:'Archived'}]} />
                <label className="flex items-center gap-2 font-mono text-xs text-slate-300"><input type="checkbox" checked={!!sel.visible} onChange={e=> upd(sel.id, {visible: e.target.checked})} /> Visible</label>
                <AdminInput label="Порядок" type="number" value={String(sel.sort_order)} onChange={e=> upd(sel.id, {sort_order: Number(e.target.value)})} />
                <AdminInput label="Ссылка" value={sel.link||''} onChange={e=> upd(sel.id, {link: e.target.value})} />
                <AdminInput label="Glass intensity (0.05-0.30)" value={(() => { try { return JSON.parse(sel.settings||'{}').glass||'' } catch { return '' } })()} onChange={e=> { let s={}; try { s=JSON.parse(sel.settings||'{}')}catch{}; s={...s, glass:e.target.value}; upd(sel.id, {settings: s}); }} />
              </div>
            )}
          </AdminCard>
          <AdminCard title="История версий" subtitle="автор, дата, diff, rollback">
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {versions.map(v=> (
                <div key={v.id} className="p-2 rounded-lg border border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs text-white">#{v.id} {v.commit_message} <span className="text-slate-500">({v.type})</span></div>
                    <div className="font-mono text-[10px] text-slate-500">{v.author_name} • {new Date(v.created_at).toLocaleString()}</div>
                  </div>
                  <AdminButton size="sm" variant="ghost" onClick={()=> rollback(v.id)} leftIcon={<RotateCcw size={12}/>}>Rollback</AdminButton>
                </div>
              ))}
              {versions.length===0 && <div className="py-4 text-center font-mono text-xs text-slate-500">Нет версий.</div>}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
};
export default SiteBuilder;

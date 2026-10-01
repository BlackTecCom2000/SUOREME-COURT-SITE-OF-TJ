import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, Eye, EyeOff, Save, Rocket, RotateCcw, Monitor, Tablet, Smartphone } from 'lucide-react';
import { AdminCard } from '../../components/ui/AdminCard';
import { AdminButton } from '../../components/ui/AdminButton';
import { AdminInput } from '../../components/ui/AdminInput';
import { AdminSelect } from '../../components/ui/AdminSelect';
import { LiquidGlassKit } from '../../components/ui/LiquidGlassKit';
import { apiFetch } from '../../context/adminHttp';
import {
  THEME_PRESETS,
  clonePreset,
  DEFAULT_PRESET_ID,
  useThemeConfig,
  type ThemePatch,
} from '../../../theme';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  DEFAULT_REVEAL,
  REVEAL_STARTS,
  REVEAL_VARIANTS,
  useThemeReveal,
  type RevealStart,
  type RevealVariant,
} from '../../../hooks/useThemeReveal';

/**
 * Settings values are stored as strings, so a checkbox has to be read back
 * through the same truthiness rules the hook uses. An absent or unparseable
 * value means "use the default", not "off".
 */
const isOff = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value.trim() === '') return !fallback;
  const v = value.trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'off' || v === 'no') return true;
  if (v === '1' || v === 'true' || v === 'on' || v === 'yes') return false;
  return !fallback;
};

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

/** Named gradients for the ambient field. Every value is authored here and
 *  passes the theme validator's CSS allow-list — the control never writes a
 *  free-form string into the stylesheet. */
const GRADIENT_OPTIONS: Array<{ value: string; label: string }> = [
  {
    value:
      'radial-gradient(70% 42% at 14% 74%, rgba(84, 128, 214, 0.20) 0%, transparent 68%),' +
      ' radial-gradient(62% 40% at 86% 58%, rgba(196, 154, 74, 0.13) 0%, transparent 66%)',
    label: 'Ночной синий + золото',
  },
  {
    value:
      'radial-gradient(70% 42% at 14% 74%, rgba(56, 118, 214, 0.12) 0%, transparent 68%),' +
      ' radial-gradient(62% 40% at 86% 58%, rgba(184, 138, 36, 0.10) 0%, transparent 66%)',
    label: 'Дневной мягкий',
  },
  {
    value:
      'radial-gradient(70% 42% at 14% 74%, rgba(60, 130, 235, 0.28) 0%, transparent 68%),' +
      ' radial-gradient(62% 40% at 86% 58%, rgba(124, 192, 255, 0.16) 0%, transparent 66%)',
    label: 'Синий корпоративный',
  },
  {
    value:
      'radial-gradient(70% 42% at 14% 74%, rgba(52, 180, 140, 0.26) 0%, transparent 68%),' +
      ' radial-gradient(62% 40% at 86% 58%, rgba(223, 190, 126, 0.14) 0%, transparent 66%)',
    label: 'Изумрудный',
  },
  {
    value:
      'radial-gradient(70% 42% at 14% 74%, rgba(139, 92, 246, 0.28) 0%, transparent 68%),' +
      ' radial-gradient(62% 40% at 86% 58%, rgba(223, 190, 126, 0.15) 0%, transparent 66%)',
    label: 'Королевский фиолет',
  },
];

const FONT_OPTIONS = [
  {
    value: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    label: 'Inter (по умолчанию)',
  },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia (антиква)' },
  { value: "system-ui, -apple-system, 'Segoe UI', sans-serif", label: 'Системный' },
  { value: "'Segoe UI', Tahoma, sans-serif", label: 'Segoe UI' },
];

const DURATION_OPTIONS = ['180ms', '260ms', '350ms', '500ms'].map((v) => ({ value: v, label: v }));

function SortableItem({ id, children }: any){
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});
  const style={ transform: CSS.Transform.toString(transform), transition };
  return <div ref={setNodeRef} style={style as any} {...attributes} {...listeners}>{children}</div>;
}

/** One labelled slider with a live value and a per-property reset. */
const RangeRow: React.FC<{
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: string) => void;
  onReset?: () => void;
}> = ({ label, value, min, max, step, suffix, onChange, onReset }) => {
  const numeric = Number(value);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-2xs uppercase tracking-wider text-theme-textMuted">
          {label}
        </span>
        <span className="shrink-0 font-mono text-2xs text-theme-text">
          {value}
          {suffix ?? ''}
        </span>
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <input
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(numeric) ? numeric : min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full accent-[var(--accent-gold)]"
        />
        {onReset && (
          <button
            type="button"
            title="Сбросить это свойство"
            onClick={onReset}
            className="grid h-7 w-7 place-items-center rounded-lg border border-theme-border text-theme-textMuted transition-colors hover:text-theme-gold"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export const SiteBuilder: React.FC = () => {
  const { hasPerm } = useAdminAuth();
  const canEdit = hasPerm('content.edit');
  const canPublish = hasPerm('content.publish');
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop'|'tablet'|'mobile'>('desktop');
  const [versions, setVersions] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));
  // Lets the editor try an unsaved combination before publishing it.
  const { revealToggle } = useThemeReveal();

  /* One configuration, read and written through the shared store.
     `design` is a DERIVED flat view of ThemeConfig + the settings bag: the
     controls below were written against flat keys, but every write now lands
     in the one store (theme rows via patch, CMS rows via setSetting), so the
     preview, the save flow and the public runtime cannot drift apart. */
  const {
    theme,
    presetId,
    patch,
    replace,
    setSetting,
    saveDraft: persistTheme,
    publish: publishTheme,
    reload: reloadTheme,
    applyPreset,
    ready: themeReady,
    dirty,
    settings,
  } = useThemeConfig();

  const design: Record<string, string> = useMemo(() => {
    const s = settings ?? {};
    return {
      /* glass material */
      glass_opacity: String(theme.glass.transparency),
      glass_blur: String(Math.round(parseFloat(theme.glass.blur) || 0)),
      glass_saturation: String(Math.round(parseFloat(theme.glass.saturation) || 0)),
      glass_border_opacity: theme.glass.borderOpacity.toFixed(2),
      glass_highlight: theme.glass.highlightOpacity.toFixed(2),
      glass_shadow: theme.glass.shadowOpacity.toFixed(2),
      glass_radius: String(Math.round(parseFloat(theme.radius.large) || 0)),
      /* colours */
      gold_accent: theme.colors.accent,
      bg_color: theme.colors.background,
      bg2_color: theme.colors.backgroundSecondary,
      text_color: theme.colors.textPrimary,
      /* typography */
      font_family: theme.typography.fontFamily,
      heading_weight: String(theme.typography.headingWeight),
      body_weight: String(theme.typography.bodyWeight),
      heading_scale: String(theme.typography.headingScale),
      body_scale: String(theme.typography.bodyScale),
      line_height: String(theme.typography.lineHeight),
      /* effects */
      effect_gradient: theme.effects.gradient,
      effect_glow: String(theme.effects.glow),
      effect_noise: String(theme.effects.noise),
      effect_hover_scale: String(theme.effects.hoverScale),
      effect_duration: theme.effects.transitionDuration,
      /* CMS settings: background + atmosphere + theme transition */
      background_image_day: s.background_image_day || s.background_image || '',
      background_image_night: s.background_image_night || '',
      background_position: s.background_position || 'center',
      background_size: s.background_size || 'cover',
      bg_overlay_opacity: s.bg_overlay_opacity ?? '0.12',
      bg_blur: s.bg_blur ?? '0',
      bg_saturation: s.bg_saturation ?? '100',
      bg_brightness: s.bg_brightness ?? '100',
      bg_contrast: s.bg_contrast ?? '100',
      theme_transition_enabled: s.theme_transition_enabled ?? (DEFAULT_REVEAL.enabled ? '1' : '0'),
      theme_transition_variant: s.theme_transition_variant || DEFAULT_REVEAL.variant,
      theme_transition_start: s.theme_transition_start || DEFAULT_REVEAL.start,
      theme_transition_blur: s.theme_transition_blur ?? (DEFAULT_REVEAL.blur ? '1' : '0'),
    };
  }, [theme, settings]);

  /** Routes one flat-key edit to the right place on the one store: theme
   *  rows through patch(), CMS settings rows through setSetting(). Nothing
   *  POSTs a loose key any more, and no control can silently discard its own
   *  value on the next render. */
  const applyChange = useCallback(
    (changed: Record<string, string>) => {
      const part: ThemePatch = {};
      let hasThemeRow = false;

      const glass: Record<string, string | number> = {};
      if (changed.glass_opacity !== undefined) { glass.transparency = Number(changed.glass_opacity); hasThemeRow = true; }
      if (changed.glass_blur !== undefined) { glass.blur = `${parseFloat(changed.glass_blur) || 0}px`; hasThemeRow = true; }
      if (changed.glass_saturation !== undefined) { glass.saturation = `${parseFloat(changed.glass_saturation) || 0}%`; hasThemeRow = true; }
      if (changed.glass_border_opacity !== undefined) { glass.borderOpacity = Number(changed.glass_border_opacity); hasThemeRow = true; }
      if (changed.glass_highlight !== undefined) { glass.highlightOpacity = Number(changed.glass_highlight); hasThemeRow = true; }
      if (changed.glass_shadow !== undefined) { glass.shadowOpacity = Number(changed.glass_shadow); hasThemeRow = true; }
      if (Object.keys(glass).length > 0) part.glass = glass as ThemePatch['glass'];

      if (changed.glass_radius !== undefined) {
        const px = `${parseFloat(changed.glass_radius) || 0}px`;
        part.radius = { small: px, medium: px, large: px, xl: px };
        hasThemeRow = true;
      }

      const colors: Record<string, string> = {};
      if (changed.gold_accent !== undefined) colors.accent = changed.gold_accent;
      if (changed.bg_color !== undefined) colors.background = changed.bg_color;
      if (changed.bg2_color !== undefined) colors.backgroundSecondary = changed.bg2_color;
      if (changed.text_color !== undefined) colors.textPrimary = changed.text_color;
      if (Object.keys(colors).length > 0) { part.colors = colors; hasThemeRow = true; }

      const typography: Record<string, string | number> = {};
      if (changed.font_family !== undefined) { typography.fontFamily = changed.font_family; hasThemeRow = true; }
      if (changed.heading_weight !== undefined) { typography.headingWeight = Number(changed.heading_weight); hasThemeRow = true; }
      if (changed.body_weight !== undefined) { typography.bodyWeight = Number(changed.body_weight); hasThemeRow = true; }
      if (changed.heading_scale !== undefined) { typography.headingScale = Number(changed.heading_scale); hasThemeRow = true; }
      if (changed.body_scale !== undefined) { typography.bodyScale = Number(changed.body_scale); hasThemeRow = true; }
      if (changed.line_height !== undefined) { typography.lineHeight = Number(changed.line_height); hasThemeRow = true; }
      if (Object.keys(typography).length > 0) part.typography = typography as ThemePatch['typography'];

      const effects: Record<string, string | number> = {};
      if (changed.effect_gradient !== undefined) { effects.gradient = changed.effect_gradient; hasThemeRow = true; }
      if (changed.effect_glow !== undefined) { effects.glow = Number(changed.effect_glow); hasThemeRow = true; }
      if (changed.effect_noise !== undefined) { effects.noise = Number(changed.effect_noise); hasThemeRow = true; }
      if (changed.effect_hover_scale !== undefined) { effects.hoverScale = Number(changed.effect_hover_scale); hasThemeRow = true; }
      if (changed.effect_duration !== undefined) { effects.transitionDuration = changed.effect_duration; hasThemeRow = true; }
      if (Object.keys(effects).length > 0) part.effects = effects as ThemePatch['effects'];

      if (hasThemeRow) patch(part);

      for (const [key, value] of Object.entries(changed)) {
        if (key in THEME_ROW_KEYS) continue;
        setSetting(key, value);
      }
    },
    [patch, setSetting]
  );

  /** Accepts either a full replacement record or an updater, like useState. */
  const setDesign = useCallback(
    (
      next:
        | Record<string, unknown>
        | ((current: Record<string, string>) => Record<string, unknown>)
    ) => {
      const resolved =
        typeof next === 'function'
          ? (next as (c: Record<string, string>) => Record<string, unknown>)(design)
          : next;
      const merged: Record<string, string> = { ...design };
      for (const [k, v] of Object.entries(resolved)) merged[k] = String(v);
      const changed: Record<string, string> = {};
      for (const [k, v] of Object.entries(merged)) {
        if (design[k] !== v) changed[k] = v;
      }
      if (Object.keys(changed).length > 0) applyChange(changed);
    },
    [applyChange, design]
  );

  /* ── resets ───────────────────────────────────────────────────────────
     Reset always restores the ACTIVE preset's values — never an empty
     object, and never a DOM hack that wipes every CSS variable on the root. */
  const resetGlass = useCallback(() => {
    const base = clonePreset(presetId);
    patch({ glass: base.glass, radius: base.radius });
  }, [patch, presetId]);

  const resetTypography = useCallback(() => {
    const base = clonePreset(presetId);
    patch({ typography: base.typography });
  }, [patch, presetId]);

  const resetColours = useCallback(() => {
    const base = clonePreset(presetId);
    patch({ colors: base.colors });
  }, [patch, presetId]);

  const resetEffects = useCallback(() => {
    const base = clonePreset(presetId);
    patch({ effects: base.effects });
  }, [patch, presetId]);

  const resetToDefaultPreset = useCallback(() => {
    if (!confirm('Сбросить тему к умолчанию Glass Dark? Несохранённые изменения будут потеряны.')) return;
    replace(clonePreset(DEFAULT_PRESET_ID), DEFAULT_PRESET_ID);
  }, [replace]);

  const load = () => {
    apiFetch('/api/admin/site-sections').then(r=> r.ok?r.json():[]).then(setSections).catch(()=>{});
    apiFetch('/api/admin/site-versions').then(r=> r.ok?r.json():[]).then(setVersions).catch(()=>{});
  };
  useEffect(load, []);

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
  /* Save flow goes through the store: the theme rows AND every dirty CMS
     setting are written in ONE request, then publish copies drafts to
     published. Previously every control POSTed its own key, so a background
     slider never reached the settings bag at all. */
  const saveDraft = async () => {
    const ok = await persistTheme();
    if (!ok) return alert('Не удалось сохранить черновик темы (проверьте права settings.manage).');
    await apiFetch('/api/admin/site/save-draft', { method:'POST', body: JSON.stringify({ snapshot: { sections }, message: message||'Save draft' }) });
    setMessage(''); load();
    alert('Черновик темы сохранён. Публичный сайт увидит изменения после «Опубликовать».');
  };
  const publish = async () => {
    if(!canPublish) return alert('Need publish permission');
    if(!confirm('Опубликовать? Публичный сайт получит текущую тему.')) return;
    const ok = await publishTheme();
    if (!ok) return alert('Не удалось опубликовать тему (проверьте права content.publish).');
    setMessage(''); load();
    alert('Опубликовано. Публичный сайт получил новую конфигурацию темы.');
  };
  const rollback = async (id:number) => { if(!confirm(`Rollback to #${id}?`)) return; await apiFetch(`/api/admin/site-versions/${id}/rollback`, { method:'POST' }); load(); };
  /* LiquidGlassKit's "OK" persists the whole configuration rather than a
     single loose key. */
  const saveDesignValue = async () => {
    const ok = await persistTheme();
    if (!ok) alert('Не удалось сохранить настройки темы.');
    else setMessage('Настройки темы сохранены в черновик');
  };

  const discardChanges = async () => {
    if(!confirm('Отменить несохранённые изменения темы и секций?')) return;
    await reloadTheme();
    load();
  };

  const widthMap = { desktop:'100%', tablet:'820px', mobile:'390px' } as const;

  /* Shows which preset the public site is actually running, so the editor is
     never guessing about the live state. */
  const presetName =
    THEME_PRESETS.find((p) => p.id === presetId)?.name ?? presetId;

  const deviceButton = (mode: 'desktop'|'tablet'|'mobile', Icon: typeof Monitor, title: string) => (
    <button
      onClick={()=> setPreviewMode(mode)}
      title={title}
      className={`p-2 rounded-lg border transition-colors ${previewMode===mode ? 'bg-theme-surface border-theme-gold text-theme-gold' : 'border-theme-border text-theme-textMuted hover:text-theme-text'}`}
    >
      <Icon size={14}/>
    </button>
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs uppercase tracking-widest text-theme-textMuted">
            Тема
          </span>
          <span className="rounded-full border border-theme-border bg-theme-surface px-2 py-0.5 font-mono text-2xs text-theme-text">
            {themeReady ? presetName : 'загрузка…'}
          </span>
          <span className="font-mono text-2xs text-theme-textMuted">
            {theme.scheme === 'dark' ? 'тёмная' : 'светлая'}
          </span>
          {dirty && (
            <span
              className="rounded-full border px-2 py-0.5 font-mono text-2xs"
              style={{ borderColor: 'color-mix(in srgb, var(--theme-warning) 45%, transparent)', color: 'var(--theme-warning)' }}
            >
              не сохранено
            </span>
          )}
        </div>
        <h2 className="font-serif text-xl font-bold text-theme-text">Visual Site Builder — Live Preview</h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-theme-textMuted">Просмотр:</span>
          {deviceButton('desktop', Monitor, 'Desktop 1920')}
          {deviceButton('tablet', Tablet, 'Tablet 1024')}
          {deviceButton('mobile', Smartphone, 'Mobile 390')}
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-4">
        {/* Left — Components + Theme */}
        <div className="col-span-12 min-w-0 space-y-3 lg:col-span-4">
          <AdminCard title="Пресеты темы" subtitle="Пять семейств Glassmorphism — полная конфигурация, применяется атомарно">
            <div className="grid grid-cols-2 gap-2">
              {THEME_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={()=> applyPreset(p.id)}
                  className={`rounded-xl border p-2.5 text-left transition-colors ${presetId===p.id ? 'border-theme-gold bg-theme-surface' : 'border-theme-border hover:border-theme-borderHover'}`}
                >
                  <span className={`block text-xs font-semibold ${presetId===p.id ? 'text-theme-gold' : 'text-theme-text'}`}>{p.name}</span>
                  <span className="mt-0.5 block font-mono text-2xs leading-snug text-theme-textMuted">{p.description}</span>
                </button>
              ))}
              <button
                onClick={resetToDefaultPreset}
                className="rounded-xl border border-theme-border p-2.5 text-left text-xs text-theme-textSec transition-colors hover:text-theme-text"
              >
                <RotateCcw size={12} className="mb-1" />
                Сбросить в Glass Dark
              </button>
            </div>
            <p className="mt-2 font-mono text-2xs text-theme-textMuted">
              Пресет меняет предпросмотр сразу. Сохраните черновик и опубликуйте — публичный сайт
              получит конфигурацию после перезагрузки.
            </p>
          </AdminCard>

          <AdminCard title="Компоненты" subtitle="Перетащите или нажмите +">
            <div className="grid grid-cols-3 gap-2">
              {palette.map(p=> (
                <button key={p.key} onClick={()=> add(p.key)} className="p-3 rounded-xl glass border border-theme-border hover:border-theme-gold flex flex-col items-center gap-1 text-xs text-theme-textSec hover:text-theme-text transition-colors">
                  <span className="w-6 h-6 rounded-full border border-theme-border flex items-center justify-center font-mono text-2xs text-theme-textMuted">{p.icon}</span>
                  <span className="text-[11px] leading-tight text-center">{p.label}</span>
                </button>
              ))}
            </div>
          </AdminCard>

          <LiquidGlassKit
            design={design}
            onChange={(key, value) => setDesign(current => ({ ...current, [key]: value }))}
            onSave={saveDesignValue}
            onResetGlass={resetGlass}
            presetId={presetId}
          />

          <AdminCard title="Фон и атмосфера" subtitle="Фотографии здания и управляемая атмосфера — Public + Admin + Login + Footer">
            <div className="space-y-4">
              {/* Background */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-theme-gold mb-2">Background</div>
                <div className="space-y-2">
                  {[
                    {k:'background_image_day', label:'День (/supreme-court-day.jpg)'},
                    {k:'background_image_night', label:'Ночь (/supreme-court-night.jpg)'},
                    {k:'background_position', label:'Position (center/top)'},
                    {k:'background_size', label:'Size (cover/contain)'},
                  ].map(f=> (
                    <div key={f.k} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] items-center gap-2">
                      <span className="min-w-0 truncate font-mono text-[11px] text-theme-textSec">{f.label}</span>
                      <AdminInput value={design[f.k]||''} onChange={e=> setDesign({ [f.k]: e.target.value })} className="flex-1" placeholder={f.k.includes('image')?'/supreme-court-day.jpg':'center'} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Atmosphere */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-theme-gold mb-2">Atmosphere — слабый оверлей, здание всегда видно</div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <RangeRow label="White Overlay (cap 0.10)" value={design.bg_overlay_opacity || '0.12'} min={0} max={0.1} step={0.01} onChange={v=> setDesign({ bg_overlay_opacity: v })} onReset={()=> setDesign({ bg_overlay_opacity: '0.12' })} />
                  <RangeRow label="Background Blur" value={design.bg_blur || '0'} min={0} max={20} step={1} suffix="px" onChange={v=> setDesign({ bg_blur: v })} onReset={()=> setDesign({ bg_blur: '0' })} />
                  <RangeRow label="Background Sat" value={design.bg_saturation || '100'} min={80} max={140} step={1} suffix="%" onChange={v=> setDesign({ bg_saturation: v })} onReset={()=> setDesign({ bg_saturation: '100' })} />
                  <RangeRow label="Brightness" value={design.bg_brightness || '100'} min={80} max={120} step={1} suffix="%" onChange={v=> setDesign({ bg_brightness: v })} onReset={()=> setDesign({ bg_brightness: '100' })} />
                  <RangeRow label="Contrast" value={design.bg_contrast || '100'} min={80} max={120} step={1} suffix="%" onChange={v=> setDesign({ bg_contrast: v })} onReset={()=> setDesign({ bg_contrast: '100' })} />
                </div>
              </div>
              {/* Theme transition (Skiper 26 reveal) */}
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-theme-gold mb-2">
                  Переход темы — Skiper 26
                </div>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-mono text-2xs text-theme-textSec">Форма</span>
                    <select
                      aria-label="Форма перехода темы"
                      value={design.theme_transition_variant || DEFAULT_REVEAL.variant}
                      onChange={e=> setDesign({ theme_transition_variant: e.target.value })}
                      className="h-11 w-full min-w-0 rounded-xl border border-theme-border bg-theme-surface px-3 text-sm text-theme-text focus:border-theme-borderHover"
                    >
                      {REVEAL_VARIANTS.map(o=> (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="font-mono text-2xs text-theme-textSec">Откуда идёт шторка</span>
                    <select
                      aria-label="Направление перехода темы"
                      value={design.theme_transition_start || DEFAULT_REVEAL.start}
                      onChange={e=> setDesign({ theme_transition_start: e.target.value })}
                      className="h-11 w-full min-w-0 rounded-xl border border-theme-border bg-theme-surface px-3 text-sm text-theme-text focus:border-theme-borderHover"
                    >
                      {REVEAL_STARTS.map(o=> (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid min-w-0 grid-cols-2 gap-3">
                    <label className="flex min-w-0 items-center gap-2 text-sm text-theme-text">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--accent-gold)]"
                        checked={!isOff(design.theme_transition_enabled, DEFAULT_REVEAL.enabled)}
                        onChange={e=> setDesign({ theme_transition_enabled: e.target.checked ? '1' : '0' })}
                      />
                      Включён
                    </label>
                    <label className="flex min-w-0 items-center gap-2 text-sm text-theme-text">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--accent-gold)]"
                        checked={!isOff(design.theme_transition_blur, DEFAULT_REVEAL.blur)}
                        onChange={e=> setDesign({ theme_transition_blur: e.target.checked ? '1' : '0' })}
                      />
                      Размытие
                    </label>
                  </div>
                  <div className="grid min-w-0 grid-cols-2 gap-2">
                    <AdminButton
                      size="sm"
                      onClick={()=> revealToggle({
                        variant: (design.theme_transition_variant || DEFAULT_REVEAL.variant) as RevealVariant,
                        start: (design.theme_transition_start || DEFAULT_REVEAL.start) as RevealStart,
                        blur: !isOff(design.theme_transition_blur, DEFAULT_REVEAL.blur),
                        enabled: !isOff(design.theme_transition_enabled, DEFAULT_REVEAL.enabled),
                      })}
                    >
                      Проверить
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" onClick={saveDesignValue}>
                      Сохранить
                    </AdminButton>
                  </div>
                </div>
                <p className="mt-2 font-mono text-2xs text-theme-textMuted">
                  «Проверить» применяет выбранные значения сразу, без публикации. Публичный сайт
                  увидит их после «Опубликовать» (до 30 с у открытых вкладок).
                </p>
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Типографика"
            subtitle="Один стек, веса, масштаб и интерлиньяж — заголовки и текст всего сайта"
            headerAction={(
              <button type="button" onClick={resetTypography} title="Сбросить типографику пресета" className="text-theme-textMuted hover:text-theme-gold">
                <RotateCcw size={14} />
              </button>
            )}
          >
            <div className="space-y-3">
              <AdminSelect
                label="Шрифт"
                value={design.font_family}
                onChange={e=> setDesign({ font_family: (e.target as HTMLSelectElement).value })}
                options={FONT_OPTIONS}
              />
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <RangeRow label="Вес заголовков" value={design.heading_weight} min={300} max={800} step={100} onChange={v=> setDesign({ heading_weight: v })} onReset={()=> setDesign({ heading_weight: '600' })} />
                <RangeRow label="Вес текста" value={design.body_weight} min={300} max={700} step={100} onChange={v=> setDesign({ body_weight: v })} onReset={()=> setDesign({ body_weight: '400' })} />
                <RangeRow label="Масштаб заголовков" value={design.heading_scale} min={0.7} max={1.6} step={0.05} onChange={v=> setDesign({ heading_scale: v })} onReset={()=> setDesign({ heading_scale: '1' })} />
                <RangeRow label="Масштаб текста" value={design.body_scale} min={0.8} max={1.4} step={0.05} onChange={v=> setDesign({ body_scale: v })} onReset={()=> setDesign({ body_scale: '1' })} />
                <RangeRow label="Интерлиньяж" value={design.line_height} min={1.1} max={2.2} step={0.05} onChange={v=> setDesign({ line_height: v })} onReset={()=> setDesign({ line_height: '1.6' })} />
              </div>
            </div>
          </AdminCard>

          <AdminCard
            title="Цвета"
            subtitle="Акцент, фон и текст — из одной палитры, без собственных цветов компонентов"
            headerAction={(
              <button type="button" onClick={resetColours} title="Сбросить палитру пресета" className="text-theme-textMuted hover:text-theme-gold">
                <RotateCcw size={14} />
              </button>
            )}
          >
            <div className="space-y-3">
              {[
                { k:'gold_accent', label:'Акцент (кнопки, линии)' },
                { k:'bg_color', label:'Фон' },
                { k:'bg2_color', label:'Фон второй' },
                { k:'text_color', label:'Основной текст' },
              ].map(f => (
                <div key={f.k} className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)] items-center gap-2">
                  <span className="min-w-0 truncate font-mono text-2xs uppercase tracking-wider text-theme-textMuted">{f.label}</span>
                  <input
                    aria-label={f.label}
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(design[f.k]) ? design[f.k] : '#000000'}
                    onChange={e=> setDesign({ [f.k]: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded-lg border border-theme-border bg-transparent p-0.5"
                  />
                  <AdminInput value={design[f.k]} onChange={e=> setDesign({ [f.k]: e.target.value })} className="text-center" />
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard
            title="Эффекты поля"
            subtitle="Градиент подложки, свечение, зерно, hover и скорость переходов"
            headerAction={(
              <button type="button" onClick={resetEffects} title="Сбросить эффекты пресета" className="text-theme-textMuted hover:text-theme-gold">
                <RotateCcw size={14} />
              </button>
            )}
          >
            <div className="space-y-3">
              <AdminSelect
                label="Градиент подложки"
                value={GRADIENT_OPTIONS.some(o => o.value === design.effect_gradient) ? design.effect_gradient : GRADIENT_OPTIONS[0].value}
                onChange={e=> setDesign({ effect_gradient: (e.target as HTMLSelectElement).value })}
                options={GRADIENT_OPTIONS}
              />
              <AdminSelect
                label="Скорость переходов"
                value={DURATION_OPTIONS.some(o => o.value === design.effect_duration) ? design.effect_duration : DURATION_OPTIONS[1].value}
                onChange={e=> setDesign({ effect_duration: (e.target as HTMLSelectElement).value })}
                options={DURATION_OPTIONS}
              />
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <RangeRow label="Свечение поля" value={design.effect_glow} min={0} max={1} step={0.05} onChange={v=> setDesign({ effect_glow: v })} onReset={()=> setDesign({ effect_glow: '0.2' })} />
                <RangeRow label="Зерно (noise)" value={design.effect_noise} min={0} max={0.2} step={0.01} onChange={v=> setDesign({ effect_noise: v })} onReset={()=> setDesign({ effect_noise: '0.02' })} />
                <RangeRow label="Hover scale" value={design.effect_hover_scale} min={1} max={1.08} step={0.005} onChange={v=> setDesign({ effect_hover_scale: v })} onReset={()=> setDesign({ effect_hover_scale: '1.012' })} />
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Center — Live Preview */}
        <div className="col-span-12 min-w-0 lg:col-span-5">
          <AdminCard title={`Live Preview — ${previewMode} ${previewMode==='desktop'?'1920':previewMode==='tablet'?'1024':'390'}`} subtitle="Изменение текста/цвета/размера/порядка/видимости сразу отображается">
            <div
              className="flex justify-center p-3 rounded-xl overflow-auto"
              style={{ background: 'color-mix(in srgb, var(--bg-secondary) 65%, transparent)' }}
            >
              <div style={{ width: widthMap[previewMode], maxWidth:'100%', transform: previewMode==='mobile'?'scale(1)':'none', transition:'width 0.3s' }} className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({active, over})=>{ if(active.id!==over?.id){ const oi=sections.findIndex(s=>s.id===active.id); const ni=sections.findIndex(s=>s.id===over?.id); reorder(oi, ni); }}}>
                  <SortableContext items={sections.map(s=>s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map(s=> (
                      <SortableItem key={s.id} id={s.id}>
                        <div onClick={()=> setSelected(s.id)} className={`p-3 rounded-xl glass border flex items-center justify-between gap-2 cursor-pointer ${selected===s.id?'border-theme-gold':'border-theme-border hover:border-theme-borderHover'} ${s.visible? 'opacity-100':'opacity-40'}`}>
                          <div className="flex items-center gap-2">
                            <GripVertical size={12} className="text-theme-textMuted cursor-grab" />
                            <span className="font-mono text-xs text-theme-text">{s.key}</span>
                            <span className="text-xs text-theme-textSec truncate max-w-[140px]">{s.title_ru||'—'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={(e)=>{e.stopPropagation(); upd(s.id, {visible: !s.visible})}} className="p-1 rounded border border-theme-border text-theme-textMuted hover:text-theme-text">{s.visible?<Eye size={12}/>:<EyeOff size={12}/>}</button>
                            <button onClick={(e)=>{e.stopPropagation(); dup(s.id)}} className="p-1 rounded border border-theme-border text-theme-textMuted hover:text-theme-text"><Copy size={12}/></button>
                            <button
                              onClick={(e)=>{e.stopPropagation(); del(s.id)}}
                              className="p-1 rounded border"
                              style={{ borderColor: 'color-mix(in srgb, var(--theme-danger) 35%, transparent)', color: 'var(--theme-danger)' }}
                            ><Trash2 size={12}/></button>
                          </div>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
                {sections.length===0 && <div className="py-12 text-center font-mono text-xs text-theme-textMuted">Нет секций — добавьте из Components слева.</div>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <AdminInput placeholder="Комментарий к версии" value={message} onChange={e=> setMessage(e.target.value)} className="flex-1" />
              <AdminButton onClick={saveDraft} leftIcon={<Save size={14}/>}>Сохранить черновик</AdminButton>
              <AdminButton variant="primary" onClick={publish} leftIcon={<Rocket size={14}/>}>Опубликовать</AdminButton>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <AdminButton size="sm" variant="ghost" onClick={discardChanges}>Отменить несохранённое</AdminButton>
              {dirty && (
                <span className="font-mono text-2xs text-theme-textMuted">
                  есть несохранённые изменения темы — нажмите «Сохранить черновик»
                </span>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right — Properties */}
        <div className="col-span-12 min-w-0 space-y-3 lg:col-span-3">
          <AdminCard title="Свойства секции" subtitle="content, layout, visibility, spacing, typography, background, glass, animation, links, responsive">
            {!sel ? <div className="py-8 text-center font-mono text-xs text-theme-textMuted">Выберите секцию в центре.</div> : (
              <div className="space-y-3">
                <AdminInput label="Title RU" value={sel.title_ru||''} onChange={e=> upd(sel.id, {title_ru: e.target.value})} />
                <AdminInput label="Title TJ" value={sel.title_tj||''} onChange={e=> upd(sel.id, {title_tj: e.target.value})} />
                <AdminInput label="Title EN" value={sel.title_en||''} onChange={e=> upd(sel.id, {title_en: e.target.value})} />
                <AdminSelect label="Статус" value={sel.status} onChange={e=> upd(sel.id, {status:(e.target as HTMLSelectElement).value})} options={[{value:'draft',label:'Draft'},{value:'published',label:'Published'},{value:'archived',label:'Archived'}]} />
                <label className="flex items-center gap-2 font-mono text-xs text-theme-textSec"><input type="checkbox" className="accent-[var(--accent-gold)]" checked={!!sel.visible} onChange={e=> upd(sel.id, {visible: e.target.checked})} /> Visible</label>
                <AdminInput label="Порядок" type="number" value={String(sel.sort_order)} onChange={e=> upd(sel.id, {sort_order: Number(e.target.value)})} />
                <AdminInput label="Ссылка" value={sel.link||''} onChange={e=> upd(sel.id, {link: e.target.value})} />
                <AdminInput label="Glass intensity (0.05-0.30)" value={(() => { try { return JSON.parse(sel.settings||'{}').glass||'' } catch { return '' } })()} onChange={e=> { let s={}; try { s=JSON.parse(sel.settings||'{}')}catch{}; s={...s, glass:e.target.value}; upd(sel.id, {settings: s}); }} />
              </div>
            )}
          </AdminCard>
          <AdminCard title="История версий" subtitle="автор, дата, diff, rollback">
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {versions.map(v=> (
                <div key={v.id} className="p-2 rounded-lg border border-theme-border flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-theme-text truncate">#{v.id} {v.commit_message} <span className="text-theme-textMuted">({v.type})</span></div>
                    <div className="font-mono text-2xs text-theme-textMuted">{v.author_name} • {new Date(v.created_at).toLocaleString()}</div>
                  </div>
                  <AdminButton size="sm" variant="ghost" onClick={()=> rollback(v.id)} leftIcon={<RotateCcw size={12}/>}>Rollback</AdminButton>
                </div>
              ))}
              {versions.length===0 && <div className="py-4 text-center font-mono text-xs text-theme-textMuted">Нет версий.</div>}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
};
export default SiteBuilder;

/** Theme-level rows: everything else in `design` is a CMS settings row. */
const THEME_ROW_KEYS: Record<string, true> = {
  glass_opacity: true,
  glass_blur: true,
  glass_saturation: true,
  glass_border_opacity: true,
  glass_highlight: true,
  glass_shadow: true,
  glass_radius: true,
  gold_accent: true,
  bg_color: true,
  bg2_color: true,
  text_color: true,
  font_family: true,
  heading_weight: true,
  body_weight: true,
  heading_scale: true,
  body_scale: true,
  line_height: true,
  effect_gradient: true,
  effect_glow: true,
  effect_noise: true,
  effect_hover_scale: true,
  effect_duration: true,
};

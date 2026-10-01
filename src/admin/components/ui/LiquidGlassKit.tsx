import React, { useState } from 'react';
import { Check, Eye, RotateCcw, Search, Sparkles } from 'lucide-react';
import { AdminButton } from './AdminButton';
import { AdminCard } from './AdminCard';
import { AdminInput } from './AdminInput';
import { clonePreset } from '../../../theme';

interface LiquidGlassKitProps {
  design: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: (key: string, value: string) => Promise<void>;
  /** Restores every material token to the active preset in one step. */
  onResetGlass?: () => void;
  /** The active preset, so each row can reset to ITS value for that token. */
  presetId?: string;
}

type GlassSetting = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  fallback: string;
};

/* `glass_opacity` is the material's transparency (0-1) — the same number the
   CSS generator applies as the tint's alpha, so what the slider shows is what
   the site renders. */
const settings: GlassSetting[] = [
  { key: 'glass_opacity', label: 'Surface', min: 0.02, max: 0.6, step: 0.01, fallback: '0.13' },
  { key: 'glass_blur', label: 'Blur', min: 0, max: 40, step: 1, suffix: 'px', fallback: '24' },
  { key: 'glass_saturation', label: 'Saturation', min: 90, max: 220, step: 5, suffix: '%', fallback: '180' },
  { key: 'glass_border_opacity', label: 'Border', min: 0.08, max: 0.6, step: 0.01, fallback: '0.16' },
  { key: 'glass_highlight', label: 'Highlight', min: 0.1, max: 0.6, step: 0.02, fallback: '0.20' },
  { key: 'glass_shadow', label: 'Shadow', min: 0.04, max: 0.6, step: 0.01, fallback: '0.42' },
  { key: 'glass_radius', label: 'Radius', min: 8, max: 48, step: 1, suffix: 'px', fallback: '24' },
];

/* Material weight variants: they tune the SAME glass tokens the sliders
   above control, so they are helpers on top of the material — not competing
   site presets (those live in the «Пресеты темы» card). */
const weightPresets: Record<string, Record<string, string>> = {
  'Мягкое': { glass_opacity: '0.08', glass_blur: '24', glass_saturation: '150', glass_border_opacity: '0.14', glass_highlight: '0.18', glass_shadow: '0.30', glass_radius: '24' },
  'Жидкое': { glass_opacity: '0.13', glass_blur: '24', glass_saturation: '180', glass_border_opacity: '0.16', glass_highlight: '0.20', glass_shadow: '0.42', glass_radius: '24' },
  'Плотное': { glass_opacity: '0.24', glass_blur: '32', glass_saturation: '200', glass_border_opacity: '0.30', glass_highlight: '0.34', glass_shadow: '0.50', glass_radius: '20' },
};

/** The active preset's value for one material token (row-level reset). */
const presetValueFor = (presetId: string | undefined, key: string): string => {
  const base = clonePreset(presetId);
  switch (key) {
    case 'glass_opacity': return String(base.glass.transparency);
    case 'glass_blur': return String(Math.round(parseFloat(base.glass.blur) || 0));
    case 'glass_saturation': return String(Math.round(parseFloat(base.glass.saturation) || 0));
    case 'glass_border_opacity': return base.glass.borderOpacity.toFixed(2);
    case 'glass_highlight': return base.glass.highlightOpacity.toFixed(2);
    case 'glass_shadow': return base.glass.shadowOpacity.toFixed(2);
    case 'glass_radius': return String(Math.round(parseFloat(base.radius.large) || 0));
    default: return '';
  }
};

export const LiquidGlassKit: React.FC<LiquidGlassKitProps> = ({
  design,
  onChange,
  onSave,
  onResetGlass,
  presetId,
}) => {
  const [activeTab, setActiveTab] = useState<'tabs' | 'cards'>('tabs');
  const [enabled, setEnabled] = useState(true);

  const read = (setting: GlassSetting) => design[setting.key] || setting.fallback;
  const setPreset = (values: Record<string, string>) => Object.entries(values).forEach(([key, value]) => onChange(key, value));

  return (
    <AdminCard
      title="Материал Liquid Glass"
      subtitle="Один материал для всего сайта: поверхность, размытие, кант, свечение, скругление"
      headerAction={
        onResetGlass ? (
          <button
            type="button"
            title="Сбросить материал к активному пресету"
            onClick={onResetGlass}
            className="text-theme-textMuted transition-colors hover:text-theme-gold"
          >
            <RotateCcw size={14} />
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        <div
          className="relative overflow-hidden rounded-[var(--glass-radius-card)] border border-theme-border p-4 sm:p-5"
          style={{ background: 'color-mix(in srgb, var(--bg-secondary) 45%, transparent)' }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl"
            style={{ background: 'color-mix(in srgb, var(--accent-gold) 22%, transparent)' }}
          />
          <div className="relative flex items-center justify-between gap-3 border-b border-theme-border pb-3">
            <div>
              <div className="font-serif text-base font-bold text-theme-text">Liquid Glass Foundations</div>
              <div className="mt-1 font-mono text-2xs uppercase tracking-widest text-theme-textMuted">Global component preview</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-theme-border px-2 py-1 font-mono text-2xs text-theme-textMuted sm:inline">{enabled ? 'Enabled' : 'Disabled'}</span>
              <button
                type="button"
                aria-label="Toggle glass preview"
                onClick={() => setEnabled(!enabled)}
                className={`relative h-7 w-12 rounded-full border p-1 transition-colors ${enabled ? 'border-theme-gold' : 'border-theme-border'}`}
                style={{ background: enabled ? 'color-mix(in srgb, var(--accent-gold) 30%, transparent)' : 'color-mix(in srgb, var(--text-muted) 25%, transparent)' }}
              >
                <span
                  className={`block h-5 w-5 rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`}
                  style={{ background: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}
                />
              </button>
            </div>
          </div>

          <div className={`relative mt-4 grid gap-3 transition-opacity sm:grid-cols-2 ${enabled ? 'opacity-100' : 'opacity-45'}`}>
            <button type="button" className="glass glass-card lg-material lg-card flex min-h-16 items-center justify-between gap-3 p-4 text-left text-theme-text transition-transform hover:-translate-y-0.5">
              <span><Sparkles size={16} className="mb-1 text-theme-gold" /><span className="block text-sm font-semibold">Start project</span></span>
              <span
                className="grid h-9 w-9 place-items-center rounded-full"
                style={{ background: 'color-mix(in srgb, var(--bg-primary) 55%, transparent)', color: 'var(--text-primary)' }}
              ><Check size={16} /></span>
            </button>
            <div className="glass glass-card lg-material lg-card flex min-h-16 items-center gap-2 p-3">
              <Search size={16} className="shrink-0 text-theme-textMuted" />
              <AdminInput aria-label="Preview text field" placeholder="Text field" className="!min-h-10 !rounded-full !border-0 !bg-transparent !shadow-none" />
            </div>
            <button type="button" className="glass glass-card lg-material lg-card flex min-h-16 items-center justify-between p-4 text-left text-theme-text">
              <span className="text-sm font-semibold">Select</span><Check size={18} className="text-theme-gold" />
            </button>
            <button type="button" onClick={() => setEnabled(!enabled)} className="glass glass-card lg-material lg-card flex min-h-16 items-center justify-between p-4 text-left text-theme-text">
              <span className="text-sm font-semibold">Switch</span>
              <span
                className={`relative h-7 w-12 rounded-full border p-1 ${enabled ? 'border-theme-gold' : 'border-theme-border'}`}
                style={{ background: enabled ? 'color-mix(in srgb, var(--accent-gold) 30%, transparent)' : 'color-mix(in srgb, var(--text-muted) 25%, transparent)' }}
              >
                <span
                  className={`block h-5 w-5 rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`}
                  style={{ background: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}
                />
              </span>
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[['info', 'Surface 01'], ['gold', 'Highlight'], ['accent', 'Pro plan']].map(([tone, label]) => {
              const toneColor = tone === 'info' ? 'var(--theme-info)' : tone === 'gold' ? 'var(--accent-gold)' : 'var(--theme-accent-secondary)';
              return (
                <div key={label} className="glass glass-card lg-material lg-card min-h-20 p-3" style={{ borderColor: `color-mix(in srgb, ${toneColor} 35%, transparent)` }}>
                  <div className="text-xs font-semibold text-theme-text">{label}</div>
                  <div className="mt-3 h-1.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--text-muted) 35%, transparent)' }}>
                    <div className="h-full w-2/3 rounded-full" style={{ background: toneColor }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mt-4 flex flex-wrap gap-2">
            {(['tabs', 'cards'] as const).map(tab => (
              <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`min-h-11 rounded-full border px-4 text-xs font-semibold transition-colors ${activeTab === tab ? 'glass-active text-theme-text' : 'glass text-theme-textMuted'}`}>
                {tab === 'tabs' ? 'Tabs' : 'Cards'}
              </button>
            ))}
            <span className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs text-theme-textMuted"><Eye size={14} /> {activeTab === 'tabs' ? 'Find files...' : 'Focus states'}</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(weightPresets).map(([name, values]) => (
            <button type="button" key={name} onClick={() => setPreset(values)} className="glass glass-card lg-material lg-card min-h-11 px-3 text-left text-xs font-semibold text-theme-text transition-transform hover:-translate-y-0.5">
              {name}<span className="mt-1 block text-2xs font-normal text-theme-textMuted">Вес материала</span>
            </button>
          ))}
        </div>

        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {settings.map(setting => {
            const value = read(setting);
            return (
              <div key={setting.key} className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2 font-mono text-2xs uppercase tracking-wider text-theme-textMuted">
                  <span>{setting.label}</span><span className="text-theme-text">{value}{setting.suffix || ''}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto_auto] items-center gap-2">
                  <input aria-label={setting.label} type="range" min={setting.min} max={setting.max} step={setting.step} value={Number(value)} onChange={event => onChange(setting.key, event.target.value)} className="w-full accent-[var(--accent-gold)]" />
                  <AdminInput aria-label={`${setting.label} value`} value={value} onChange={event => onChange(setting.key, event.target.value)} className="!min-h-10 !px-2 text-center" />
                  <AdminButton size="sm" variant="ghost" onClick={() => onSave(setting.key, value)}>OK</AdminButton>
                  <button
                    type="button"
                    title="Сбросить это свойство к пресету"
                    onClick={() => onChange(setting.key, presetValueFor(presetId, setting.key))}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-theme-border text-theme-textMuted transition-colors hover:text-theme-gold"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminCard>
  );
};

export default LiquidGlassKit;

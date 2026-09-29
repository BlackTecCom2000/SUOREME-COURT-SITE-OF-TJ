import React, { useState } from 'react';
import { Check, Eye, Search, Sparkles } from 'lucide-react';
import { AdminButton } from './AdminButton';
import { AdminCard } from './AdminCard';
import { AdminInput } from './AdminInput';

interface LiquidGlassKitProps {
  design: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: (key: string, value: string) => Promise<void>;
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

const settings: GlassSetting[] = [
  { key: 'glass_opacity', label: 'Surface', min: 0.02, max: 0.24, step: 0.01, fallback: '0.08' },
  { key: 'glass_blur', label: 'Blur', min: 0, max: 40, step: 1, suffix: 'px', fallback: '2' },
  { key: 'glass_saturation', label: 'Saturation', min: 90, max: 160, step: 5, suffix: '%', fallback: '120' },
  { key: 'glass_border_opacity', label: 'Border', min: 0.08, max: 0.4, step: 0.01, fallback: '0.22' },
  { key: 'glass_highlight', label: 'Highlight', min: 0.1, max: 0.6, step: 0.02, fallback: '0.28' },
  { key: 'glass_shadow', label: 'Shadow', min: 0.04, max: 0.3, step: 0.01, fallback: '0.12' },
  { key: 'glass_radius', label: 'Radius', min: 8, max: 48, step: 1, suffix: 'px', fallback: '24' },
];

const presets: Record<string, Record<string, string>> = {
  'Soft Clear': { glass_opacity: '0.06', glass_blur: '2', glass_saturation: '115', glass_border_opacity: '0.16', glass_highlight: '0.22', glass_shadow: '0.08', glass_radius: '24' },
  'Liquid Kit': { glass_opacity: '0.08', glass_blur: '24', glass_saturation: '120', glass_border_opacity: '0.22', glass_highlight: '0.28', glass_shadow: '0.12', glass_radius: '24' },
  'Deep Chrome': { glass_opacity: '0.14', glass_blur: '32', glass_saturation: '135', glass_border_opacity: '0.3', glass_highlight: '0.38', glass_shadow: '0.2', glass_radius: '20' },
};

export const LiquidGlassKit: React.FC<LiquidGlassKitProps> = ({ design, onChange, onSave }) => {
  const [activeTab, setActiveTab] = useState<'tabs' | 'cards'>('tabs');
  const [enabled, setEnabled] = useState(true);

  const read = (setting: GlassSetting) => design[setting.key] || setting.fallback;
  const setPreset = (values: Record<string, string>) => Object.entries(values).forEach(([key, value]) => onChange(key, value));

  return (
    <AdminCard
      title="Liquid Glass UI Kit"
      subtitle="Рабочие компоненты, токены и presets. Изменения сразу видны на всем сайте."
    >
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-[var(--glass-radius-card)] border border-white/20 bg-[#07182a]/60 p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3 border-b border-white/15 pb-3">
            <div>
              <div className="font-serif text-base font-bold text-theme-text">Liquid Glass Foundations</div>
              <div className="mt-1 font-mono text-2xs uppercase tracking-widest text-theme-textMuted">Global component preview</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-white/15 px-2 py-1 font-mono text-2xs text-theme-textMuted sm:inline">{enabled ? 'Enabled' : 'Disabled'}</span>
              <button type="button" aria-label="Toggle glass preview" onClick={() => setEnabled(!enabled)} className={`relative h-7 w-12 rounded-full border border-white/20 p-1 transition-colors ${enabled ? 'bg-cyan-400/35' : 'bg-black/20'}`}>
                <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <div className={`relative mt-4 grid gap-3 transition-opacity sm:grid-cols-2 ${enabled ? 'opacity-100' : 'opacity-45'}`}>
            <button type="button" className="glass glass-card lg-material lg-card flex min-h-16 items-center justify-between gap-3 p-4 text-left text-theme-text transition-transform hover:-translate-y-0.5">
              <span><Sparkles size={16} className="mb-1 text-cyan-200" /><span className="block text-sm font-semibold">Start project</span></span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black/35 text-white"><Check size={16} /></span>
            </button>
            <div className="glass glass-card lg-material lg-card flex min-h-16 items-center gap-2 p-3">
              <Search size={16} className="shrink-0 text-theme-textMuted" />
              <AdminInput aria-label="Preview text field" placeholder="Text field" className="!min-h-10 !rounded-full !border-0 !bg-transparent !shadow-none" />
            </div>
            <button type="button" className="glass glass-card lg-material lg-card flex min-h-16 items-center justify-between p-4 text-left text-theme-text">
              <span className="text-sm font-semibold">Select</span><Check size={18} className="text-emerald-300" />
            </button>
            <button type="button" onClick={() => setEnabled(!enabled)} className="glass glass-card lg-material lg-card flex min-h-16 items-center justify-between p-4 text-left text-theme-text">
              <span className="text-sm font-semibold">Switch</span><span className={`relative h-7 w-12 rounded-full border border-white/20 p-1 ${enabled ? 'bg-cyan-400/35' : 'bg-black/20'}`}><span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} /></span>
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {[['cyan', 'Surface 01'], ['amber', 'Highlight'], ['violet', 'Pro plan']].map(([tone, label]) => (
              <div key={label} className={`glass glass-card lg-material lg-card min-h-20 p-3 ${tone === 'cyan' ? 'border-cyan-200/35' : tone === 'amber' ? 'border-amber-200/35' : 'border-violet-200/35'}`}>
                <div className="text-xs font-semibold text-theme-text">{label}</div>
                <div className="mt-3 h-1.5 rounded-full bg-white/20"><div className={`h-full w-2/3 rounded-full ${tone === 'cyan' ? 'bg-cyan-200' : tone === 'amber' ? 'bg-amber-200' : 'bg-violet-200'}`} /></div>
              </div>
            ))}
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
          {Object.entries(presets).map(([name, values]) => (
            <button type="button" key={name} onClick={() => setPreset(values)} className="glass glass-card lg-material lg-card min-h-11 px-3 text-left text-xs font-semibold text-theme-text transition-transform hover:-translate-y-0.5">
              {name}<span className="mt-1 block text-2xs font-normal text-theme-textMuted">Apply preset</span>
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
                <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto] items-center gap-2">
                  <input aria-label={setting.label} type="range" min={setting.min} max={setting.max} step={setting.step} value={Number(value)} onChange={event => onChange(setting.key, event.target.value)} className="w-full accent-[var(--court-gold)]" />
                  <AdminInput aria-label={`${setting.label} value`} value={value} onChange={event => onChange(setting.key, event.target.value)} className="!min-h-10 !px-2 text-center" />
                  <AdminButton size="sm" variant="ghost" onClick={() => onSave(setting.key, value)}>OK</AdminButton>
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

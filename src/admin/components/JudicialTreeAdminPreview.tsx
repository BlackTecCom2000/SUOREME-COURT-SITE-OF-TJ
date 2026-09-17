import React from 'react';
import { REGIONAL_CLUSTERS } from '../../data/sudTjData';
import { Landmark, Shield, Sparkles } from 'lucide-react';

interface JudicialTreeAdminPreviewProps {
  courtName?: string;
  regionId?: string;
  courtType?: string;
}

export const JudicialTreeAdminPreview: React.FC<JudicialTreeAdminPreviewProps> = ({
  courtName = 'Новый суд',
  regionId = 'dushanbe_rrp',
  courtType = 'district',
}) => {
  return (
    <div className="w-full rounded-xl border border-slate-800 bg-[#040813] p-4 text-left shadow-inner">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles size={14} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
            Интерактивное превью в судебном дереве
          </span>
        </div>
        <span className="font-mono text-[9px] text-slate-500 uppercase">
          LIVE MAP REF
        </span>
      </div>

      {/* Supreme Court Top Axis */}
      <div className="w-full flex justify-center mb-3">
        <div className="px-3 py-1 rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-300 font-serif text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
          <Landmark size={12} />
          СУДИ ОЛИИ ҶТ
        </div>
      </div>

      {/* 4 Regional Mini Columns */}
      <div className="grid grid-cols-4 gap-2">
        {REGIONAL_CLUSTERS.map((cluster) => {
          const isSelectedRegion = cluster.id === regionId;
          return (
            <div
              key={cluster.id}
              className={`
                rounded-lg p-2 flex flex-col items-center text-center transition-all duration-200 border
                ${
                  isSelectedRegion
                    ? 'border-amber-400 bg-[#091124] shadow-md shadow-amber-500/10'
                    : 'border-slate-800/80 bg-slate-900/40 opacity-50'
                }
              `}
            >
              {/* Region Pill */}
              <span
                className="font-mono text-[8px] font-bold truncate max-w-full block"
                style={{ color: cluster.colorHex }}
              >
                {cluster.shortNameRu}
              </span>

              {/* Regional Court */}
              <div
                className={`
                  w-full mt-1.5 py-1 px-1 rounded text-[8px] font-medium truncate border
                  ${
                    isSelectedRegion && courtType === 'regional'
                      ? 'border-white bg-amber-400 text-slate-950 font-bold animate-pulse'
                      : 'border-slate-750 bg-slate-800/80 text-slate-300'
                  }
                `}
              >
                {isSelectedRegion && courtType === 'regional' ? courtName : 'Облсуд'}
              </div>

              {/* District Node Preview */}
              <div
                className={`
                  w-full mt-1 py-1 px-1 rounded text-[8px] truncate border
                  ${
                    isSelectedRegion && courtType !== 'regional' && courtType !== 'military'
                      ? 'border-white bg-amber-400 text-slate-950 font-bold animate-pulse'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }
                `}
              >
                {isSelectedRegion && courtType !== 'regional' && courtType !== 'military'
                  ? courtName
                  : 'Гор/Райсуды'}
              </div>

              {/* Military Node */}
              <div
                className={`
                  w-full mt-1 py-0.5 px-1 rounded text-[7px] flex items-center justify-center gap-1 border
                  ${
                    isSelectedRegion && courtType === 'military'
                      ? 'border-white bg-amber-400 text-slate-950 font-bold animate-pulse'
                      : 'border-slate-800 bg-slate-900/30 text-slate-500'
                  }
                `}
              >
                <Shield size={8} />
                Гарнизон
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { TREE_ROOTS } from '../../../data/sudTjData';
import { ShieldCheck } from 'lucide-react';

export const TreeRoots: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 mt-16 pb-20 z-10">
      {/* Root Label Header */}
      <div className="text-center font-mono text-[11px] text-[#dfbe7e] uppercase tracking-widest mb-10 flex items-center justify-center gap-3 opacity-60">
        <div className="w-16 h-[1px] bg-[#dfbe7e]/30" />
        <ShieldCheck size={14} />
        <span>
          {language === 'ru' ? '[ ФУНДАМЕНТАЛЬНЫЕ ОСНОВЫ ПРАВОСУДИЯ ]' 
           : language === 'tj' ? '[ АСОСҲОИ БУНЁДИИ АДОЛАТИ СУДӢ ]'
           : '[ FUNDAMENTAL BASES OF JUSTICE ]'}
        </span>
        <div className="w-16 h-[1px] bg-[#dfbe7e]/30" />
      </div>

      {/* Roots Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
        {/* Subtle connecting lines fading up towards trunk */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[2px] h-16 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
        
        {TREE_ROOTS.map((root, index) => (
          <div
            key={root.id}
            className={`
              relative p-6 rounded-xl border border-white/10 text-center 
              bg-[#0a0f16]/40 backdrop-blur-sm
              hover:bg-[#0a0f16]/80 hover:border-[#dfbe7e]/40 
              transition-all duration-700 ease-in-out group
              ${index === 1 ? '-mt-4' : 'mt-4'}
            `}
          >
            {/* Glowing particle effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#dfbe7e]/0 via-[#dfbe7e]/0 to-[#dfbe7e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-xl" />
            
            <h4 className="font-mono font-bold text-sm text-white/90 mb-3 tracking-widest uppercase">
              {language === 'en' ? root.titleEn : language === 'tj' ? root.titleTj : root.titleRu}
            </h4>
            <p className="text-xs text-white/40 font-serif italic leading-relaxed">
              {language === 'en' ? root.subtitleEn : language === 'tj' ? root.subtitleTj : root.subtitleRu}
            </p>

            {/* Connecting lines from each root box up to the main trunk line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-[1px] h-8 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

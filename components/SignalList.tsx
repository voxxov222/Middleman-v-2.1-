
import React from 'react';
import { DetectedEntity } from '../types';
import { ICONS } from '../constants';
import { Terminal, ChevronRight } from 'lucide-react';

interface SignalListProps {
  entities: DetectedEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInvestigate?: (entity: DetectedEntity) => void;
}

const SignalList: React.FC<SignalListProps> = ({ entities, selectedId, onSelect, onInvestigate }) => {
  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-2">
      <div className="sticky top-0 bg-slate-900 py-4 border-b border-sky-500/30 flex items-center justify-between z-10 px-2">
        <div className="flex items-center gap-2 text-xs font-black tracking-[0.3em] text-sky-100">
          {ICONS.List} REGISTRY
        </div>
        <div className="text-[10px] text-sky-500/40 uppercase font-bold">
          {entities.length} NODES
        </div>
      </div>
      
      {entities.map(entity => {
        const isRadio = entity.type === 'VHF' || entity.type === 'UHF';
        const isSelected = selectedId === entity.id;
        
        return (
          <div
            key={entity.id}
            className={`flex flex-col gap-1 p-4 border transition-all duration-300 relative overflow-hidden cursor-pointer
              ${isSelected 
                ? (isRadio ? 'bg-orange-500/20 border-orange-400/50 shadow-[0_0_20px_rgba(251,146,60,0.1)]' : 'bg-sky-500/20 border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.1)]')
                : 'bg-slate-900/30 border-sky-900/30 hover:bg-slate-900/50 hover:border-sky-500/30'}`}
            onClick={() => onSelect(entity.id)}
          >
            {isSelected && (
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isRadio ? 'bg-orange-400' : 'bg-sky-400'}`} />
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={isRadio ? "text-orange-500" : "text-sky-400"}>
                  {entity.type === 'WIFI' ? ICONS.Wifi : 
                   entity.type === 'BLUETOOTH' ? ICONS.Bluetooth : 
                   isRadio ? ICONS.Ham : ICONS.Nfc}
                </span>
                <span className={`font-black text-sm tracking-tight ${isSelected ? 'text-white' : 'text-sky-100/80'}`}>{entity.name}</span>
                {entity.isReal && (
                  <span className="bg-green-500 text-black text-[7px] px-1.5 py-0.5 rounded-sm uppercase font-black tracking-tighter shadow-[0_0_10px_rgba(34,197,94,0.4)]">LIVE</span>
                )}
              </div>
              <span className={`text-[10px] font-black ${entity.riskScore > 75 ? 'text-red-500' : 'text-sky-500/60'}`}>R:{entity.riskScore}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 text-[10px] text-sky-500/40 font-mono mt-2 uppercase tracking-tighter">
              <span className="truncate">ID: {entity.identifier}</span>
              <span className="text-right">PWR: {entity.strength}dBm</span>
            </div>

            {isSelected && (
              <div className="mt-4 pt-4 border-t border-sky-500/10 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {entity.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-2 py-0.5 border border-sky-500/20 rounded-full text-sky-400/60 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                {onInvestigate && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onInvestigate(entity);
                    }}
                    className="flex items-center gap-2 bg-sky-500 text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-white transition-all shadow-lg"
                  >
                    <Terminal size={12} />
                    Deep_Dive
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SignalList;

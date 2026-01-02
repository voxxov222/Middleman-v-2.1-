import React, { useEffect, useState } from 'react';
import { DetectedEntity } from '../types';
import { Layers, Zap, Waves } from 'lucide-react';

interface RadarHUDProps {
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
  maxRange?: number;
}

type MapLayer = 'NONE' | 'SATELLITE' | 'TERRAIN';

const RadarHUD: React.FC<RadarHUDProps> = ({ entities, selectedEntityId, onSelectEntity, maxRange = 50 }) => {
  const [rotation, setRotation] = useState(0);
  const [layer, setLayer] = useState<MapLayer>('NONE');

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = () => {
    const layers: MapLayer[] = ['NONE', 'SATELLITE', 'TERRAIN'];
    const nextIdx = (layers.indexOf(layer) + 1) % layers.length;
    setLayer(layers[nextIdx]);
  };

  return (
    <div className="relative aspect-square w-full max-w-[500px] mx-auto bg-slate-900/40 rounded-full border border-sky-500/30 overflow-hidden backdrop-blur-sm shadow-[0_0_50px_rgba(2,6,23,0.8)]">
      
      {/* Map Layers */}
      {layer === 'SATELLITE' && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
      )}

      {layer === 'TERRAIN' && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <pattern id="hex" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                <path d="M5 0 L10 2.88 L10 8.66 L5 11.54 L0 8.66 L0 2.88 Z" fill="none" stroke="#38bdf8" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
        </div>
      )}

      {/* Radar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[25%] h-[25%] border border-sky-500/20 rounded-full" />
        <div className="absolute w-[50%] h-[50%] border border-sky-500/20 rounded-full" />
        <div className="absolute w-[75%] h-[75%] border border-sky-500/20 rounded-full" />
        <div className="absolute w-[98%] h-[98%] border border-sky-500/30 rounded-full" />
      </div>

      {/* Sweep Effect */}
      <div 
        className="absolute inset-0 origin-center pointer-events-none"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          background: 'conic-gradient(from 0deg, rgba(56, 189, 248, 0.3) 0deg, transparent 40deg)'
        }}
      />

      <button 
        onClick={toggleLayer}
        className="absolute top-4 right-4 z-30 p-2 bg-slate-900/80 border border-sky-500/50 rounded-full hover:bg-sky-500/20 transition-colors"
      >
        <Layers size={16} className="text-sky-400" />
      </button>

      {entities.map(entity => {
        // Radio signals are mapped differently because of their massive range
        const isRadio = entity.type === 'VHF' || entity.type === 'UHF';
        const effectiveMax = isRadio ? 1000 : maxRange;
        const radius = Math.min((entity.distance / effectiveMax) * 48, 48); 
        const x = 50 + radius * Math.cos((entity.bearing - 90) * (Math.PI / 180));
        const y = 50 + radius * Math.sin((entity.bearing - 90) * (Math.PI / 180));
        
        const isSelected = selectedEntityId === entity.id;
        
        let colorClass = 'bg-sky-500';
        if (entity.type === 'BLUETOOTH') colorClass = 'bg-blue-400';
        if (entity.type === 'NFC') colorClass = 'bg-purple-500';
        if (entity.riskScore > 70) colorClass = 'bg-red-500';
        if (entity.isExternal) colorClass = 'bg-yellow-500';
        if (isRadio) colorClass = 'bg-orange-500';

        return (
          <button
            key={entity.id}
            onClick={() => onSelectEntity(entity.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 
              ${colorClass} ${entity.type === 'NFC' ? 'w-2 h-2 rounded-sm rotate-45' : 'w-3 h-3 rounded-full'} 
              ${isSelected ? 'ring-4 ring-white scale-125 z-20 shadow-[0_0_20px_white]' : 'hover:scale-150 shadow-[0_0_8px_rgba(56,189,248,0.6)]'}
              ${entity.isReal ? 'animate-pulse ring-1 ring-green-400' : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {isRadio && (
              <div className="absolute inset-0 animate-ping bg-orange-500 rounded-full opacity-30 scale-[3]" />
            )}
            {isSelected && (
              <div className="absolute top-5 left-5 whitespace-nowrap bg-slate-950/95 border border-sky-400 p-2 text-[9px] rounded-sm shadow-2xl z-30 font-mono">
                <div className="font-bold text-sky-200 mb-1 flex items-center gap-1">
                  {isRadio && <Waves size={10} className="text-orange-400" />}
                  {entity.isExternal && <Zap size={10} className="text-yellow-400" />}
                  {entity.isReal && <span className="text-green-400">[LIVE]</span>}
                  [{entity.type}] {entity.name}
                </div>
                <div>FREQ: {entity.identifier}</div>
                <div>DIST: {entity.distance.toFixed(1)}M</div>
                <div>RSSI: {entity.strength}dBm</div>
                {isRadio && <div className="text-orange-400 font-bold uppercase mt-1">Wide-band_Analog_Carrier</div>}
              </div>
            )}
          </button>
        );
      })}

      <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-sky-400 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_15px_rgba(56,189,248,1)]" />
      
      <div className="absolute bottom-2 left-0 w-full text-center text-[8px] text-sky-500/40 uppercase tracking-widest font-bold">
        Range: {maxRange.toFixed(1)}m (RF: 1.0km) | Layer: {layer}
      </div>
    </div>
  );
};

export default RadarHUD;
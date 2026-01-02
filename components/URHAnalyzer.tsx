
import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal, Cpu, Binary, Hash, Play, Square } from 'lucide-react';

interface URHAnalyzerProps {
  frequency: number;
  onClose: () => void;
}

const URHAnalyzer: React.FC<URHAnalyzerProps> = ({ frequency, onClose }) => {
  const [bits, setBits] = useState<string>('');
  const [hex, setHex] = useState<string[]>([]);
  const [isDecoding, setIsDecoding] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDecoding) return;
    const interval = setInterval(() => {
      // Generate simulated binary data
      const newBits = Array.from({ length: 16 }, () => Math.random() > 0.5 ? '1' : '0').join('');
      setBits(prev => (prev + newBits).slice(-256));
      
      // Generate hex interpretation
      const newHex = Math.floor(Math.random() * 0xFF).toString(16).padStart(2, '0').toUpperCase();
      setHex(prev => [...prev, newHex].slice(-32));
    }, 100);
    return () => clearInterval(interval);
  }, [isDecoding]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [bits, hex]);

  return (
    <div className="absolute inset-0 bg-[#050505] z-[150] flex flex-col font-mono text-green-500 p-4 border-4 border-zinc-800 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-green-900/50 pb-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-black px-2 py-0.5 font-black text-xs uppercase rounded">URH v2.9.3</div>
          <div className="text-xs font-bold tracking-widest text-green-400">
            ANALYZING_UPLINK: <span className="text-white">{frequency.toFixed(5)} MHz</span>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* URH Main Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Signal Interpretation View */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="flex-1 bg-black border border-green-900/30 rounded p-4 relative overflow-hidden group">
            <div className="absolute top-2 left-2 text-[10px] text-green-800 font-bold uppercase tracking-tighter">Signal_Interpretation (PWM/OOK)</div>
            <div className="h-full flex items-end gap-[1px]">
              {Array.from({ length: 80 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-green-500/40 w-full transition-all duration-300"
                  style={{ 
                    height: `${Math.random() > 0.7 ? 80 : 20}%`,
                    opacity: isDecoding ? 1 : 0.2
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="h-40 bg-zinc-950 border border-green-900/30 rounded p-3 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Binary size={14} className="text-green-400" />
              <span className="text-[10px] font-black uppercase text-green-700">Bitstream_Demodulator</span>
            </div>
            <div className="flex-1 overflow-hidden break-all text-sm leading-none tracking-widest text-green-400/80 font-bold">
              {bits.split('').map((b, i) => (
                <span key={i} className={b === '1' ? 'text-green-400' : 'text-green-900'}>{b}</span>
              ))}
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        {/* Hex Interpretation Side Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-zinc-950 border border-green-900/30 rounded p-3">
          <div className="flex items-center justify-between mb-3 border-b border-green-900/20 pb-2">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase text-amber-600">Hex_Decoder</span>
            </div>
            <span className="text-[8px] text-zinc-600">OFFSET: 0x0000</span>
          </div>
          
          <div className="flex-1 grid grid-cols-4 gap-2 text-center text-sm" ref={scrollRef}>
            {hex.map((h, i) => (
              <div key={i} className={`py-1 rounded border ${parseInt(h, 16) > 128 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-green-500/5 border-green-500/20 text-green-700'}`}>
                {h}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-green-900/20 space-y-2">
            <div className="text-[9px] text-zinc-500 uppercase">Analysis_Tools</div>
            <button className="w-full py-2 bg-green-900/20 border border-green-500/30 rounded text-[10px] font-bold hover:bg-green-500/10 transition-colors uppercase">Autodetect_Parameters</button>
            <button className="w-full py-2 bg-green-900/20 border border-green-500/30 rounded text-[10px] font-bold hover:bg-green-500/10 transition-colors uppercase">Assign_Protocol_Labels</button>
          </div>
        </div>
      </div>

      {/* Control Footer */}
      <div className="mt-4 flex gap-4">
        <button 
          onClick={() => setIsDecoding(!isDecoding)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-black transition-all ${
            isDecoding ? 'bg-red-950 border-red-500 text-red-400' : 'bg-green-950 border-green-500 text-green-400'
          }`}
        >
          {isDecoding ? <Square size={16} /> : <Play size={16} />}
          {isDecoding ? 'HALT_DECODE' : 'RESUME_DECODE'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-zinc-700 bg-zinc-800 text-zinc-400 font-black">
          EXPORT_FOR_SØPHIA
        </button>
      </div>
    </div>
  );
};

export default URHAnalyzer;

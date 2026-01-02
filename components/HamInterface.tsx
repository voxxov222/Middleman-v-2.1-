
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RadioState } from '../types';
import { ICONS } from '../constants';
import { ChevronUp, ChevronDown, Volume2, Maximize2, Settings, Menu, Zap, Edit3, Save, X, ArrowLeft, Terminal } from 'lucide-react';
import URHAnalyzer from './URHAnalyzer';

interface HamInterfaceProps {
  onClose: () => void;
  activeFrequency: number;
}

const STEPS = [0.0001, 0.001, 0.005, 0.0125, 0.025, 0.05, 0.1, 1.0];
const MODES = ['LSB', 'USB', 'AM', 'FM', 'WFM', 'CW', 'DMR'] as const;
const BANDWIDTHS = ['NAR', 'NOR', 'WIDE', 'MAX'] as const;
const WF_MODES = ['OFF', 'NORMAL', 'STRONG', 'WEAK', 'SPECTRUM'] as const;
const BANDS = ['160m', '80m', '40m', '20m', '15m', '10m', 'M7', 'M8'];

const HamInterface: React.FC<HamInterfaceProps> = ({ onClose, activeFrequency }) => {
  const [freq, setFreq] = useState(activeFrequency || 1.84900);
  const [rotation, setRotation] = useState(0);
  const [smeter, setSmeter] = useState(0);
  const [stepIdx, setStepIdx] = useState(3);
  const [mode, setMode] = useState<typeof MODES[number]>('CW');
  const [bandwidth, setBandwidth] = useState<typeof BANDWIDTHS[number]>('NOR');
  const [wfMode, setWfMode] = useState<typeof WF_MODES[number]>('NORMAL');
  const [isAmplified, setIsAmplified] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showWfMenu, setShowWfMenu] = useState(false);
  const [showURH, setShowURH] = useState(false);
  const [isBuildingURH, setIsBuildingURH] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waterfallDataRef = useRef<number[]>([]);
  const animationRef = useRef<number>(0);

  const currentStep = STEPS[stepIdx];

  const cycleStep = () => {
    setStepIdx(prev => (prev + 1) % STEPS.length);
  };

  const deployURH = () => {
    setIsBuildingURH(true);
    setTerminalOutput(['$ git clone https://github.com/jopohl/urh/']);
    
    setTimeout(() => setTerminalOutput(prev => [...prev, 'Cloning into \'urh\'...', 'remote: Enumerating objects: 18452, done.', 'remote: Total 18452 (delta 0), reused 0 (delta 0)', 'Receiving objects: 100% (18452/18452), 48.21 MiB | 12.54 MiB/s, done.']), 800);
    setTimeout(() => setTerminalOutput(prev => [...prev, '$ cd urh/src/urh']), 1600);
    setTimeout(() => setTerminalOutput(prev => [...prev, '$ PYTHONPATH=.. ./main.py']), 2200);
    setTimeout(() => setTerminalOutput(prev => [...prev, 'URH_ENGINE: Protocol interpretation core initializing...', 'URH_ENGINE: Backend modules mapped.', 'URH_ENGINE: READY.']), 2800);
    setTimeout(() => {
      setIsBuildingURH(false);
      setShowURH(true);
    }, 3500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSmeter(Math.floor(Math.random() * 20) + (isAmplified ? 35 : 10));
    }, 150);
    return () => clearInterval(interval);
  }, [isAmplified]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || wfMode === 'OFF') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    if (waterfallDataRef.current.length === 0) waterfallDataRef.current = new Array(width).fill(0);
    const render = () => {
      const imgData = ctx.getImageData(0, 0, width, height - 1);
      ctx.putImageData(imgData, 0, 1);
      const newLine = new Uint8ClampedArray(width * 4);
      for (let i = 0; i < width; i++) {
        let val = Math.random() * 50;
        const simulatedSignal = Math.sin((freq * 1000 + i) * 0.1) * 100;
        if (simulatedSignal > 80) val += simulatedSignal;
        if (wfMode === 'STRONG') val *= 1.5;
        if (wfMode === 'WEAK') val *= 2.5;
        if (isAmplified) val *= 1.8;
        const r = val > 150 ? val : 0;
        const g = val > 100 ? val : 0;
        const b = val + 50;
        const idx = i * 4;
        newLine[idx] = r; newLine[idx + 1] = g; newLine[idx + 2] = b; newLine[idx + 3] = 255;
      }
      ctx.putImageData(new ImageData(newLine, width, 1), 0, 0);
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); ctx.stroke();
      animationRef.current = requestAnimationFrame(render);
    };
    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [wfMode, freq, isAmplified]);

  const handleTune = useCallback((deltaMultiplier: number) => {
    const delta = currentStep * deltaMultiplier;
    setFreq(prev => Math.max(0, prev + delta));
    setRotation(prev => (prev + (deltaMultiplier * 20)) % 360);
  }, [currentStep]);

  const ControlButton: React.FC<{ label: string, active?: boolean, onClick?: () => void, variant?: 'default' | 'danger' | 'success' | 'orange' | 'gray' | 'purple' }> = ({ label, active = false, onClick, variant = 'default' }) => (
    <button 
      onClick={onClick}
      className={`h-10 rounded font-black text-[12px] uppercase tracking-tighter transition-all border border-black/40 ${
        active 
          ? (variant === 'success' ? 'bg-green-600 text-white' : variant === 'purple' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-cyan-600 text-white') 
          : (variant === 'orange' ? 'bg-orange-700/80 text-zinc-100' : variant === 'purple' ? 'bg-purple-900/40 text-purple-300 border-purple-500/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700')
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="absolute inset-0 bg-[#121212] z-50 flex flex-col font-mono text-white overflow-hidden select-none">
      
      {showURH && <URHAnalyzer frequency={freq} onClose={() => setShowURH(false)} />}

      {isBuildingURH && (
        <div className="absolute inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-8">
           <div className="w-full max-w-2xl bg-zinc-900 border-2 border-green-500 rounded-lg p-6 shadow-2xl font-mono">
              <div className="flex items-center gap-2 mb-4 border-b border-green-900/50 pb-2">
                 <Terminal size={18} className="text-green-500" />
                 <span className="text-green-500 font-bold uppercase text-sm">Deploying Universal Radio Hacker...</span>
              </div>
              <div className="space-y-1 text-xs text-green-400">
                 {terminalOutput.map((line, i) => <div key={i}>{line}</div>)}
                 <div className="animate-pulse">_</div>
              </div>
           </div>
        </div>
      )}

      {/* TOP STATUS BAR */}
      <div className="bg-black/40 flex justify-between text-[11px] px-2 py-0.5 font-bold border-b border-zinc-800">
        <div className="flex gap-4">
          <span className="text-green-500">D:60Kb/s <span className="text-green-400">U:13Kb/s</span></span>
          <span className="text-green-500">D:26Kb/s <span className="text-green-400">U:6Kb/s</span></span>
        </div>
        <div className="flex gap-4">
          <span className="text-green-400">pRxTx Lite</span>
          <span className="text-green-500">Overall</span>
        </div>
      </div>

      {/* WATERFALL DISPLAY */}
      <div className="relative w-full h-32 bg-black border-b-2 border-blue-500 overflow-hidden">
        {wfMode !== 'OFF' ? (
          <>
            <canvas 
              ref={canvasRef} width={800} height={128} 
              className="w-full h-full cursor-crosshair touch-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                setFreq(prev => prev + (x - (rect.width/2)) / 100);
              }}
            />
            <div className="absolute top-1 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-green-400 font-black border border-green-500/30">BW=0.3kHz</div>
            <div className="absolute top-0 w-full flex justify-between px-2 text-[10px] font-bold text-green-500/80 pointer-events-none">
               <span>{(freq - 0.05).toFixed(3)}</span><span>{freq.toFixed(3)}</span><span>{(freq + 0.05).toFixed(3)}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black tracking-[0.5em] italic">WF_STANDBY</div>
        )}
      </div>

      {/* BAND GRID */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900/50">
        {BANDS.map(b => <ControlButton key={b} label={b} variant="orange" />)}
      </div>

      {/* S-METER */}
      <div className="bg-zinc-900 border-y border-zinc-800 px-2 py-1 flex items-center gap-2">
         <span className="text-green-500 font-black text-xl italic">S</span>
         <div className="flex-1 flex flex-col">
            <div className="flex justify-between text-[9px] text-green-400/80 font-bold px-1">
               {['0','1','2','3','4','5','6','7','8','9+10','20','30','40','50','60'].map(v => <span key={v}>{v}</span>)}
            </div>
            <div className="h-4 bg-black border border-zinc-700 rounded-sm overflow-hidden flex gap-0.5 p-0.5">
               {Array.from({ length: 60 }).map((_, i) => (
                 <div key={i} className={`h-full flex-1 ${i < smeter ? (i > 45 ? 'bg-orange-500' : 'bg-green-500') : 'bg-zinc-800'}`} />
               ))}
            </div>
         </div>
      </div>

      {/* TUNING AREA */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex justify-between p-2 gap-2">
           <button onClick={() => handleTune(-1)} className="flex-1 h-16 bg-zinc-800 border-2 border-zinc-700 rounded text-xl font-black active:bg-zinc-600">DOWN</button>
           <button onClick={() => handleTune(1)} className="flex-1 h-16 bg-zinc-800 border-2 border-zinc-700 rounded text-xl font-black active:bg-zinc-600">UP</button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative pointer-events-auto">
             <div 
               className="w-52 h-52 rounded-full bg-zinc-900 border-[12px] border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer active:scale-95"
               style={{ transform: `rotate(${rotation}deg)` }}
             >
               <div className="absolute inset-0 rounded-full bg-[repeating-conic-gradient(from_0deg,#222_0deg_15deg,#333_15deg_30deg)] opacity-30" />
               <div className="absolute top-10 right-10 w-12 h-12 bg-black rounded-full border-4 border-zinc-800 shadow-inner" />
               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 shadow-2xl" />
             </div>
             <div className="absolute top-1/2 -left-12 -translate-y-1/2 p-3 bg-zinc-800 rounded-lg border border-zinc-700 text-blue-400"><Volume2 size={32} /></div>
             <button onClick={cycleStep} className="absolute top-1/2 -right-16 -translate-y-1/2 bg-zinc-800 p-2 rounded-lg border border-zinc-700 flex flex-col items-center"><span className="text-white font-black text-xl">STEP</span></button>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 p-2 relative z-10">
           <ControlButton label="SQL" />
           <ControlButton label="URH_PACK" variant="purple" onClick={deployURH} />
        </div>
      </div>

      {/* BOTTOM DISPLAY */}
      <div className="bg-black p-1 border-t-2 border-zinc-800">
        <div className="grid grid-cols-4 gap-1 mb-1">
           <div className="bg-zinc-800 flex items-center justify-center text-[10px] font-black italic text-zinc-400">Logo</div>
           <div className="bg-orange-950 border border-orange-500 rounded flex items-center justify-center p-1">
              <div className="w-8 h-8 rounded-full bg-orange-600 border-2 border-orange-400" />
           </div>
           <div className="bg-black border border-zinc-800 rounded" />
           <div className="grid grid-cols-2 gap-1">
              <div onClick={() => setShowModeMenu(true)} className="bg-zinc-900 border border-zinc-700 rounded p-0.5 flex flex-col items-center">
                 <span className="text-[7px] text-cyan-400 uppercase font-black">Mode</span>
                 <span className="text-[12px] font-black">{mode}</span>
              </div>
              <div onClick={() => setBandwidth(BANDWIDTHS[(BANDWIDTHS.indexOf(bandwidth) + 1) % BANDWIDTHS.length])} className="bg-zinc-900 border border-zinc-700 rounded p-0.5 flex flex-col items-center">
                 <span className="text-[7px] text-cyan-400 uppercase font-black">BW</span>
                 <span className="text-[12px] font-black">{bandwidth}</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-1">
           <ControlButton label="SRV" active variant="success" />
           <ControlButton label="NOR" active variant="success" />
           <ControlButton label="OFF" active variant="success" />
           <ControlButton label="1x" active variant="success" />
           <ControlButton label={`WF-${wfMode[0]}`} active variant="success" onClick={() => setShowWfMenu(true)} />
        </div>

        <div className="grid grid-cols-5 gap-1 mb-1">
           <ControlButton label="MEM" variant="gray" />
           <ControlButton label="SPEE" variant="gray" />
           <ControlButton label="URH_IF" variant="purple" onClick={() => setShowURH(true)} />
           <ControlButton label="ZOO" variant="gray" />
           <ControlButton label="SP/" variant="gray" />
        </div>

        <div className="flex gap-1 items-center h-12">
           <button onClick={onClose} className="w-12 h-10 bg-zinc-800 border-2 border-red-900 rounded flex items-center justify-center active:bg-red-900">
             <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center"><div className="w-0.5 h-3 bg-red-500" /></div>
           </button>
           <div className="flex-1 bg-black border-2 border-zinc-800 rounded h-10 flex items-center justify-center text-cyan-400 text-2xl font-black italic">
             {new Date().toLocaleTimeString([], { hour12: false })}
           </div>
           <button className="flex-1 h-10 bg-zinc-800 border-2 border-zinc-700 text-zinc-300 font-black rounded uppercase">BAND</button>
        </div>

        <div className="mt-1 h-10 bg-black flex items-center justify-center">
           <div className="text-3xl font-black text-green-500 tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">
             {freq.toFixed(5)}<span className="text-xl ml-1">MHz</span>
           </div>
        </div>
      </div>

      {/* MODALS */}
      {showWfMenu && (
        <div className="absolute inset-0 bg-black/90 z-[120] p-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-md border-2 border-cyan-500 rounded shadow-2xl overflow-hidden bg-zinc-900">
            <div className="bg-black p-4 flex justify-between items-center border-b border-cyan-500">
              <h2 className="text-white font-black text-xl uppercase tracking-tighter">Select Waterfall/Spectrum mode</h2>
              <button onClick={() => setShowWfMenu(false)} className="text-blue-400"><ArrowLeft className="bg-blue-600 text-white rounded-full p-1" size={32} /></button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-1">
              {WF_MODES.map(m => (
                <button key={m} onClick={() => { setWfMode(m); setShowWfMenu(false); }} className={`h-40 font-black text-2xl uppercase border border-zinc-700 ${wfMode === m ? 'bg-gradient-to-br from-green-500 to-green-800 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  {m === 'NORMAL' || m === 'STRONG' || m === 'WEAK' ? `Waterfall ${m}` : m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamInterface;

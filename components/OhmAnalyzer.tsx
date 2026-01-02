
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Thermometer, ShieldAlert, Cpu, Maximize2, X, RefreshCw, Layers } from 'lucide-react';

interface OhmAnalyzerProps {
  target: { ip: string; mac: string } | null;
  onClose: () => void;
}

const OhmAnalyzer: React.FC<OhmAnalyzerProps> = ({ target, onClose }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [stats, setStats] = useState({ resistance: 0, voltage: 0, temp: 0 });
  const [isScanning, setIsScanning] = useState(true);
  const thermalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
        
        setStats({
          resistance: 45 + Math.random() * 15,
          voltage: 3.7 + Math.random() * 0.4,
          temp: 32 + Math.random() * 8
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  useEffect(() => {
    const canvas = thermalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: {x: number, y: number, color: string}[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      color: `rgba(255, ${Math.floor(Math.random() * 100)}, 0, 0.5)`
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simulated thermal blobs
      particles.forEach(p => {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 40);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
        ctx.fill();

        p.x += (Math.random() - 0.5) * 2;
        p.y += (Math.random() - 0.5) * 2;
      });

      // Scanline
      const scanY = (Date.now() / 10) % canvas.height;
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#020617] z-[100] flex flex-col font-mono text-orange-500 overflow-hidden select-none animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="p-4 border-b border-orange-500/20 bg-orange-950/20 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Zap className="text-orange-400 animate-pulse" size={24} />
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase italic text-orange-100 leading-none">OHM_HW_DIAGNOSTIC_V1.1</h2>
            <span className="text-[9px] text-orange-500/40 uppercase font-black">Hardware_Infiltration_Link: {target?.ip || 'LOCAL_NODE'}</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-orange-500/20 rounded-full transition-all text-orange-400">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thermal View */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-xl border-2 border-orange-500/20 overflow-hidden shadow-[0_0_30px_rgba(251,146,60,0.1)]">
              <canvas ref={thermalCanvasRef} className="w-full h-full" width={800} height={450} />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-orange-500/30 p-2 rounded text-[10px] font-black uppercase">
                <span className="text-red-500 animate-pulse mr-2">●</span> Thermal_Signature: Active
              </div>
              <div className="absolute bottom-4 right-4 flex gap-4 text-[9px] font-bold text-orange-400/60 uppercase">
                <span>R: {stats.resistance.toFixed(1)}Ω</span>
                <span>V: {stats.voltage.toFixed(2)}V</span>
                <span className={stats.temp > 38 ? 'text-red-500 animate-bounce' : ''}>T: {stats.temp.toFixed(1)}°C</span>
              </div>
              {/* Schematic Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect x="20" y="20" width="60" height="60" stroke="orange" fill="none" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="10" stroke="orange" fill="none" strokeWidth="0.5" />
                  <path d="M10 10 L30 30 M90 10 L70 30 M10 90 L30 70 M90 90 L70 70" stroke="orange" strokeWidth="0.5" />
                </svg>
              </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span>Diagnostic_Progress</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="h-2 bg-black border border-orange-950 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(251,146,60,0.8)]" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Stats & Tools */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/40 border border-orange-500/10 rounded-xl p-5 space-y-6">
               <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
                 <Activity size={18} />
                 <span className="text-xs font-black uppercase tracking-widest italic">Live_Telemetry</span>
               </div>

               <div className="space-y-4">
                 {[
                   { label: 'Ohmic Resistance', val: `${stats.resistance.toFixed(2)} Ω`, sub: 'Circuit_Load' },
                   { label: 'Voltage Peak', val: `${stats.voltage.toFixed(2)} V`, sub: 'Bus_Health' },
                   { label: 'Thermal Index', val: `${stats.temp.toFixed(1)} °C`, sub: 'CPU_State' },
                   { label: 'Current Leakage', val: '0.04 mA', sub: 'Ground_State' }
                 ].map(stat => (
                   <div key={stat.label} className="group cursor-default">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-orange-500/40 uppercase font-black">{stat.label}</span>
                        <span className="text-xs font-black text-white">{stat.val}</span>
                      </div>
                      <div className="h-[1px] bg-orange-500/10 group-hover:bg-orange-500/40 transition-colors" />
                      <span className="text-[8px] text-orange-500/20 font-bold uppercase mt-1">{stat.sub}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-black/40 border border-orange-500/20 rounded-xl p-4 flex flex-col gap-3">
               <span className="text-[10px] font-black uppercase text-orange-500/30 mb-2">Pulse_Commands</span>
               <button className="w-full py-3 bg-orange-600 text-black font-black text-xs uppercase rounded hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2">
                 <Maximize2 size={14} /> Enhanced_Thermal_Sync
               </button>
               <button onClick={() => setIsScanning(!isScanning)} className="w-full py-3 border border-orange-500/30 text-orange-100 font-black text-xs uppercase rounded hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2">
                 <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} /> {isScanning ? 'Pause_Diagnostic' : 'Resume_Diagnostic'}
               </button>
               <button className="w-full py-3 bg-red-950/20 border border-red-500/40 text-red-500 font-black text-xs uppercase rounded hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                 <ShieldAlert size={14} /> Purge_Trace_Data
               </button>
            </div>
          </div>
        </div>

        {/* Terminal Feed */}
        <div className="bg-black p-4 rounded-xl border border-orange-500/10 h-48 overflow-y-auto flex flex-col gap-1">
           <div className="flex items-center gap-2 text-[10px] text-orange-500/40 mb-2 border-b border-orange-500/5 pb-1">
             <Layers size={12} />
             <span>Hardware_Layer_Logs</span>
           </div>
           {[
             `> OHM_CORE: Establish_P2P_Link to ${target?.ip || '0.0.0.0'}`,
             `> SIGNAL: Resistance sweep at 4.2GHz: OK`,
             `> THERMAL: Sensors 1-4 returning valid telemetry`,
             `> VOLT: Input line stable at ${stats.voltage.toFixed(2)}V`,
             `> DEBUG: IO-wait cycle: 1.2ms`,
             `> OHM: Internal bridge protocol Ohm-X active...`,
             `> WARNING: Thermal spike detected in Sub-Core 2`,
             `> ANALYZE: Resistance anomaly at trace #882: ${stats.resistance.toFixed(2)}Ω`
           ].map((line, i) => (
             <div key={i} className="text-[10px] font-mono text-orange-400/80 leading-tight">
               {line}
             </div>
           ))}
        </div>
      </div>

      <div className="p-2 bg-black border-t border-orange-500/20 flex justify-center">
        <div className="text-[8px] text-orange-500/20 font-black uppercase tracking-[0.5em]">Ohm_Hardware_Analyzer_Link_Active</div>
      </div>
    </div>
  );
};

export default OhmAnalyzer;

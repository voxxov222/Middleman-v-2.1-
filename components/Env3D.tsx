
import React, { useRef, useEffect, useState } from 'react';
import { DetectedEntity, EntityType } from '../types';
import { Box, Compass, Eye, Filter, Maximize2, Zap } from 'lucide-react';

interface Env3DProps {
  entities: DetectedEntity[];
  maxRange: number;
}

const Env3D: React.FC<Env3DProps> = ({ entities, maxRange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [camera, setCamera] = useState({ rotY: 0, rotX: 0.5, zoom: 1 });
  const [filter, setFilter] = useState<Set<EntityType>>(new Set(['WIFI', 'BLUETOOTH', 'VHF', 'UHF', 'NFC', 'RFID']));
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const toggleFilter = (type: EntityType) => {
    const newFilter = new Set(filter);
    if (newFilter.has(type)) newFilter.delete(type);
    else newFilter.add(type);
    setFilter(newFilter);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2 + 100;

      // Project 3D point to 2D
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const cosY = Math.cos(camera.rotY);
        const sinY = Math.sin(camera.rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate X
        const cosX = Math.cos(camera.rotX);
        const sinX = Math.sin(camera.rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = (400 * camera.zoom) / (z2 + 600);
        return {
          x: centerX + x1 * scale,
          y: centerY - y2 * scale,
          z: z2,
          scale
        };
      };

      // Draw Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 1000;
      const step = 50;
      for (let i = -gridSize; i <= gridSize; i += step) {
        const p1 = project(i, 0, -gridSize);
        const p2 = project(i, 0, gridSize);
        if (p1.z > -500 && p2.z > -500) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        const p3 = project(-gridSize, 0, i);
        const p4 = project(gridSize, 0, i);
        if (p3.z > -500 && p4.z > -500) {
          ctx.beginPath();
          ctx.moveTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.stroke();
        }
      }

      // Draw User Core
      const core = project(0, 0, 0);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(core.x, core.y, 5 * core.scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38bdf8';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Entities
      entities.filter(e => filter.has(e.type)).forEach(entity => {
        const isRadio = entity.type === 'VHF' || entity.type === 'UHF';
        const effectiveMax = isRadio ? 1000 : maxRange;
        const distRatio = entity.distance / effectiveMax;
        
        // Convert polar (bearing, distance) to Cartesian (x, z)
        const rad = (entity.bearing - 90) * (Math.PI / 180);
        const worldX = Math.cos(rad) * distRatio * 500;
        const worldZ = Math.sin(rad) * distRatio * 500;
        const worldY = 20 + Math.sin(Date.now() * 0.002 + entity.bearing) * 10;

        const p = project(worldX, worldY, worldZ);
        if (p.z <= -500) return;

        // Ground line
        const gp = project(worldX, 0, worldZ);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gp.x, gp.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Entity Marker
        let color = '#38bdf8';
        if (entity.type === 'BLUETOOTH') color = '#60a5fa';
        if (entity.type === 'NFC') color = '#a855f7';
        if (isRadio) color = '#fb923c';
        if (entity.riskScore > 70) color = '#ef4444';

        ctx.fillStyle = color;
        const size = (isRadio ? 8 : 4) * p.scale;
        
        if (isRadio) {
          // Oscillating signal wave
          const t = Date.now() * 0.01;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for(let i=-20; i<20; i+=2) {
             const sy = i;
             const sx = Math.sin(t + i*0.5) * 5;
             const wp = project(worldX + sx, worldY + sy, worldZ);
             if (i === -20) ctx.moveTo(wp.x, wp.y);
             else ctx.lineTo(wp.x, wp.y);
          }
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // HUD Labels
        if (p.scale > 0.5) {
          ctx.fillStyle = 'white';
          ctx.font = `bold ${Math.floor(8 * p.scale)}px "JetBrains Mono"`;
          ctx.fillText(entity.name, p.x + size + 5, p.y);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.font = `${Math.floor(6 * p.scale)}px "JetBrains Mono"`;
          ctx.fillText(`${entity.distance.toFixed(1)}m | ${entity.strength}dBm`, p.x + size + 5, p.y + 10 * p.scale);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [entities, camera, filter, maxRange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setCamera(prev => ({
      ...prev,
      rotY: prev.rotY + dx * 0.01,
      rotX: Math.max(0.1, Math.min(Math.PI / 2 - 0.1, prev.rotX + dy * 0.01))
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative w-full h-full bg-[#020617] cursor-move select-none overflow-hidden rounded-2xl border border-sky-500/10">
      <canvas 
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full"
      />

      {/* 3D CONTROLS HUD */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
         <div className="bg-slate-900/80 backdrop-blur-md border border-sky-500/30 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-sky-400 border-b border-sky-500/20 pb-2">
               <Filter size={14} /> Spectrum_Filter
            </div>
            <div className="grid grid-cols-2 gap-2">
               {(['WIFI', 'BLUETOOTH', 'VHF', 'UHF', 'NFC', 'RFID'] as EntityType[]).map(type => (
                 <button
                   key={type}
                   onClick={() => toggleFilter(type)}
                   className={`px-3 py-1.5 rounded text-[8px] font-bold uppercase transition-all ${filter.has(type) ? 'bg-sky-500 text-black' : 'bg-slate-800 text-sky-500/40'}`}
                 >
                   {type}
                 </button>
               ))}
            </div>
         </div>

         <div className="bg-slate-900/80 backdrop-blur-md border border-sky-500/30 p-3 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] text-sky-500/40 uppercase font-black">Azimuth</span>
               <span className="text-xs font-bold text-sky-100">{((camera.rotY * 180) / Math.PI % 360).toFixed(0)}°</span>
            </div>
            <div className="w-[1px] h-6 bg-sky-500/20" />
            <div className="flex flex-col">
               <span className="text-[8px] text-sky-500/40 uppercase font-black">Tilt</span>
               <span className="text-xs font-bold text-sky-100">{((camera.rotX * 180) / Math.PI).toFixed(0)}°</span>
            </div>
         </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-sky-500/30 p-2 rounded-lg flex items-center gap-3">
         <Compass className="text-sky-400 animate-spin" style={{ animationDuration: '10s' }} size={16} />
         <span className="text-[10px] font-black uppercase tracking-widest text-sky-200">Perspective_Inertial_Active</span>
      </div>

      {/* NAVIGATION HINT */}
      <div className="absolute top-4 left-4 flex gap-2">
         <div className="bg-sky-500/10 border border-sky-500/40 px-3 py-1 rounded-full text-[9px] font-bold text-sky-300 uppercase flex items-center gap-2">
            <Eye size={12} /> Drag to orbit
         </div>
      </div>
    </div>
  );
};

export default Env3D;

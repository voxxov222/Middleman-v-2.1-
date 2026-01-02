
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DetectedEntity, EntityType } from '../types';
import { Share2, Zap, ShieldAlert, Target, Cpu } from 'lucide-react';

interface NeuralFieldProps {
  entities: DetectedEntity[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

interface GraphNode extends DetectedEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse: number;
}

const NeuralField: React.FC<NeuralFieldProps> = ({ entities, onSelect, selectedId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Map<string, GraphNode>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Initialize and update internal node positions (persistence)
  useEffect(() => {
    entities.forEach(e => {
      if (!nodesRef.current.has(e.id)) {
        nodesRef.current.set(e.id, {
          ...e,
          x: Math.random() * 800,
          y: Math.random() * 600,
          vx: 0,
          vy: 0,
          radius: 10 + Math.random() * 10,
          pulse: Math.random() * Math.PI * 2
        });
      } else {
        const node = nodesRef.current.get(e.id)!;
        Object.assign(node, e); // Sync latest metadata
      }
    });

    // Cleanup old nodes
    const currentIds = new Set(entities.map(e => e.id));
    for (const key of nodesRef.current.keys()) {
      if (!currentIds.has(key)) nodesRef.current.delete(key);
    }
  }, [entities]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = canvas.clientHeight;
      const centerX = w / 2;
      const centerY = h / 2;

      ctx.clearRect(0, 0, w, h);

      const nodes = Array.from(nodesRef.current.values());

      // Physics: Force-directed layout
      nodes.forEach(node => {
        // Pull towards center
        node.vx += (centerX - node.x) * 0.0005;
        node.vy += (centerY - node.y) * 0.0005;

        // Repel from other nodes
        nodes.forEach(other => {
          if (node === other) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) * 0.005;
            node.vx -= dx * force;
            node.vy -= dy * force;
          }
        });

        // Brownian motion
        node.vx += (Math.random() - 0.5) * 0.1;
        node.vy += (Math.random() - 0.5) * 0.1;

        // Apply friction and move
        node.vx *= 0.95;
        node.vy *= 0.95;
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.05;
      });

      // DRAW LINKS (Relational)
      ctx.lineWidth = 1;
      nodes.forEach(node => {
        nodes.forEach(other => {
          if (node === other) return;
          // Simple relationship: same type or within 10m
          const dist = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2);
          const isRelated = node.type === other.type || Math.abs(node.distance - other.distance) < 5;
          
          if (dist < 200 && isRelated) {
            const opacity = (1 - dist / 200) * 0.3;
            ctx.strokeStyle = node.riskScore > 70 ? `rgba(239, 68, 68, ${opacity})` : `rgba(56, 189, 248, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();

            // Particle flow along link
            const time = Date.now() * 0.002;
            const progress = (time % 1);
            const px = node.x + (other.x - node.x) * progress;
            const py = node.y + (other.y - node.y) * progress;
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // DRAW NODES
      nodes.forEach(node => {
        const isSelected = selectedId === node.id;
        const isHovered = hoveredId === node.id;
        
        let color = '#38bdf8';
        if (node.type === 'BLUETOOTH') color = '#60a5fa';
        if (node.type === 'NFC') color = '#a855f7';
        if (node.type === 'VHF' || node.type === 'UHF') color = '#fb923c';
        if (node.riskScore > 75) color = '#ef4444';

        const baseSize = 4 + (Math.abs(node.strength) / 100) * 8;
        const pulseSize = Math.sin(node.pulse) * 3;
        const size = baseSize + pulseSize;

        // Outer Aura
        ctx.shadowBlur = isSelected ? 30 : 15;
        ctx.shadowColor = color;
        ctx.fillStyle = `${color}22`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 10, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 5, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Labels
        if (isSelected || isHovered) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, node.x, node.y - size - 15);
          ctx.font = '8px "JetBrains Mono"';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillText(`${node.identifier}`, node.x, node.y - size - 5);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [selectedId, hoveredId]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let closestNodeId: string | null = null;
    let minDist = 30;

    nodesRef.current.forEach(node => {
      const d = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      if (d < minDist) {
        minDist = d;
        closestNodeId = node.id;
      }
    });

    if (closestNodeId) onSelect(closestNodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let closestNodeId: string | null = null;
    nodesRef.current.forEach(node => {
      const d = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      if (d < 30) closestNodeId = node.id;
    });
    setHoveredId(closestNodeId);
  };

  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden rounded-2xl border border-sky-500/10">
      <canvas 
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="w-full h-full cursor-pointer"
      />

      {/* OVERLAY HUD */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-sky-500/20 px-4 py-2 rounded-lg">
          <Share2 className="text-sky-400 animate-pulse" size={18} />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-sky-100 leading-none">Neural_Field_v4.2</h3>
            <span className="text-[9px] text-sky-500/40 uppercase font-bold">Relational_Constellation_Analysis</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 grid grid-cols-2 gap-4">
        <div className="bg-slate-950/80 border border-sky-500/20 p-3 rounded-lg flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] text-sky-500/40 uppercase font-black">Link_Density</span>
            <span className="text-xs font-bold text-sky-100">0.84</span>
          </div>
          <Zap size={16} className="text-sky-400" />
        </div>
      </div>

      {selectedId && nodesRef.current.has(selectedId) && (
        <div className="absolute top-6 right-6 w-64 bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-right">
           <div className="p-4 bg-sky-500/10 border-b border-sky-500/20 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-sky-400">Node_Isolated</span>
              <Target size={14} className="text-sky-400" />
           </div>
           <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-black text-white">{nodesRef.current.get(selectedId)?.name}</h4>
                <p className="text-[9px] text-sky-500/60 uppercase">{nodesRef.current.get(selectedId)?.identifier}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950 p-2 rounded border border-sky-500/5">
                  <span className="block text-[8px] opacity-40 uppercase">Power</span>
                  <span className="font-bold">{nodesRef.current.get(selectedId)?.strength} dBm</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-sky-500/5">
                  <span className="block text-[8px] opacity-40 uppercase">Distance</span>
                  <span className="font-bold">{nodesRef.current.get(selectedId)?.distance.toFixed(2)} m</span>
                </div>
              </div>
              <div className="pt-4 border-t border-sky-500/10 flex flex-wrap gap-1">
                 {nodesRef.current.get(selectedId)?.tags.map(tag => (
                   <span key={tag} className="text-[8px] bg-sky-500 text-black px-1.5 py-0.5 rounded uppercase font-black">{tag}</span>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NeuralField;

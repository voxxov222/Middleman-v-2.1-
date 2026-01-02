
import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Activity, Zap, Camera, Eye, Search, HardDrive, Terminal } from 'lucide-react';
import { DetectedEntity, InterceptLog } from '../types';

interface Packet {
  id: string;
  src: string;
  srcMac: string;
  dst: string;
  proto: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP';
  len: number;
  info: string;
  activity: string;
}

interface PacketSentinelProps {
  entities: DetectedEntity[];
  onInterceptCaptured: (log: InterceptLog) => void;
  onViewJournal: () => void;
}

const PROTOCOLS = ['TCP', 'UDP', 'ICMP', 'DNS', 'HTTP'] as const;
const ACTIVITIES = [
  'Searching: "Encrypted Messaging"',
  'Accessing: "Remote_Vault_Cloud"',
  'Querying: "BSSID_Location_Map"',
  'Uplinking: "Sensor_Data_Batch"',
  'Scanning: "Local_Subnet_Nodes"',
  'Browsing: "Dark_Market_Portal"',
  'Streaming: "CCTV_Feed_Recon"'
];

const PacketSentinel: React.FC<PacketSentinelProps> = ({ entities, onInterceptCaptured, onViewJournal }) => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newPacket: Packet = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        src: `192.168.1.${Math.floor(Math.random() * 255)}`,
        srcMac: Array.from({length: 6}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase(),
        dst: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        proto: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
        len: Math.floor(Math.random() * 1400 + 64),
        info: Math.random() > 0.8 ? 'SYN_RETR' : 'ACK_PUSH',
        activity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]
      };
      setPackets(prev => [newPacket, ...prev].slice(0, 40));
    }, 400);
    return () => clearInterval(interval);
  }, [isLive]);

  const generateRealisticScreen = (packet: Packet): string => {
    const canvas = document.createElement('canvas');
    
    // Profiles: 0: Mobile (Detailed), 1: Tablet, 2: Desktop
    const charCodeSum = packet.srcMac.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const profile = charCodeSum % 3;
    
    const w = profile === 0 ? 360 : profile === 1 ? 600 : 800;
    const h = profile === 0 ? 780 : profile === 1 ? 400 : 500;
    
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // 1. Background (Specific Sky Blue from Reference)
    if (profile === 0) {
      ctx.fillStyle = '#33ccff';
      ctx.fillRect(0, 0, w, h);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#1e1b4b'); 
      gradient.addColorStop(0.5, '#4c1d95'); 
      gradient.addColorStop(1, '#1e3a8a'); 
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Status Bar (Detailed for Mobile)
    if (profile === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, w, 24);
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('5:09', 10, 16);
      ctx.textAlign = 'right';
      ctx.fillText('8% [|||]', w - 10, 16);
      ctx.textAlign = 'left';
    }

    // 3. Widgets (Mobile Home Screen Style)
    if (profile === 0) {
      // Weather Widget
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('-13°', 80, 120);
      ctx.font = '12px sans-serif';
      ctx.fillText('Beaumont', 80, 140);
      ctx.fillText('Snow likely to continue', 80, 155);

      // Google Search Bar (Matches Reference)
      const searchW = w * 0.9;
      const searchH = 48;
      const searchX = (w - searchW) / 2;
      const searchY = 300;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(searchX, searchY, searchW, searchH, 24) : ctx.fillRect(searchX, searchY, searchW, searchH);
      ctx.fill();

      // Search Query Logic
      ctx.fillStyle = '#444';
      ctx.font = '14px sans-serif';
      const query = packet.activity.includes(':') ? packet.activity.split(':')[1].replace(/"/g, '') : packet.activity;
      ctx.fillText(query.trim(), searchX + 50, searchY + 28);
      
      // Google "G" Icon
      ctx.fillStyle = '#4285F4';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('G', searchX + 20, searchY + 30);

      // System Stats Card (Storage/Memory from Reference)
      const cardY = 380;
      const cardH = 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(searchX, cardY, searchW, cardH, 16) : ctx.fillRect(searchX, cardY, searchW, cardH);
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('Storage', searchX + 15, cardY + 25);
      ctx.fillText('Memory', searchX + 130, cardY + 25);
      
      // Progress Bars
      ctx.fillStyle = '#eee';
      ctx.fillRect(searchX + 15, cardY + 35, 100, 8);
      ctx.fillRect(searchX + 130, cardY + 35, 80, 8);
      ctx.fillStyle = '#33ccff';
      ctx.fillRect(searchX + 15, cardY + 35, 75, 8);
      ctx.fillRect(searchX + 130, cardY + 35, 40, 8);
    }

    // 4. App Dock (Icons at Bottom)
    const iconCount = profile === 0 ? 5 : 6;
    const iconSize = profile === 0 ? 44 : 50;
    const dockH = iconSize + 30;
    const dockY = h - dockH - (profile === 0 ? 40 : 20);
    const spacing = (w - (iconCount * iconSize)) / (iconCount + 1);

    const colors = ['#e91e63', '#4caf50', '#2196f3', '#ffc107', '#9c27b0', '#607d8b'];
    for (let i = 0; i < iconCount; i++) {
      const ix = spacing + (i * (iconSize + spacing));
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      if (profile === 0) {
        // Round icons for modern mobile
        ctx.arc(ix + iconSize / 2, dockY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
      } else {
        ctx.roundRect ? ctx.roundRect(ix, dockY, iconSize, iconSize, 12) : ctx.fillRect(ix, dockY, iconSize, iconSize);
      }
      ctx.fill();

      // Random Notification Badges
      if (Math.random() > 0.5) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(ix + iconSize, dockY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('1', ix + iconSize - 3, dockY + 3);
      }
    }

    // 5. Navigation Bar (Back, Home, Recents)
    if (profile === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, h - 40, w, 40);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      // Home
      ctx.strokeRect(w / 2 - 8, h - 28, 16, 16);
      // Back
      ctx.beginPath(); ctx.moveTo(w / 4 + 10, h - 28); ctx.lineTo(w / 4, h - 20); ctx.lineTo(w / 4 + 10, h - 12); ctx.stroke();
      // Recents
      ctx.strokeRect(3 * w / 4 - 8, h - 28, 16, 16);
    }

    // 6. Stamping (Tactical Overlay)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.font = 'bold 9px "JetBrains Mono"';
    ctx.fillText('OFFICIAL_SEQUENCE_ACQUIRED', 15, h - 45);
    ctx.fillText(new Date().toLocaleTimeString(), w - 100, h - 45);

    return canvas.toDataURL('image/png');
  };

  const handleManualCapture = () => {
    setIsCapturing(true);
    const canvas = document.querySelector('canvas');
    let screenshot = '';
    
    if (canvas) {
      try {
        screenshot = canvas.toDataURL('image/png');
      } catch (e) {
        console.error("Manual capture failed", e);
      }
    }

    setTimeout(() => {
      const log: InterceptLog = {
        id: `OFF-${Date.now()}`,
        timestamp: Date.now(),
        mac: "HOST_IF_01",
        ip: "127.0.0.1",
        target: "Official Visual Sequence (Manual)",
        protocol: "SIG_SCREEN",
        dataPayload: "Official sequence capture initiated. Visual sensor dump of active recon field.",
        screenshot: screenshot || undefined
      };
      onInterceptCaptured(log);
      setIsCapturing(false);
    }, 800);
  };

  const handleDeepIntercept = (packet: Packet) => {
    setIsCapturing(true);
    const screenshotData = generateRealisticScreen(packet);

    setTimeout(() => {
      const log: InterceptLog = {
        id: `INT-${Date.now()}`,
        timestamp: Date.now(),
        mac: packet.srcMac,
        ip: packet.src,
        target: packet.activity,
        protocol: packet.proto,
        dataPayload: `OFFICIAL_DATA_DUMP_${packet.id}: [${packet.info}] Sequence_${Math.floor(Math.random()*99999)}`,
        screenshot: screenshotData
      };
      onInterceptCaptured(log);
      setIsCapturing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-sky-400 font-mono overflow-hidden">
      <div className="p-4 border-b border-sky-500/20 bg-slate-900/40 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <Activity className="text-sky-400 animate-pulse" size={18} />
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase italic">Middleman_Sentinel_v2</h2>
            <span className="text-[9px] text-sky-500/40 uppercase">Mode: Passive_Infiltration</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleManualCapture}
            className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/40 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-amber-500/30 text-amber-400"
          >
            <Camera size={12} /> Official_Sweep
          </button>
          <button 
            onClick={onViewJournal}
            className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/40 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-sky-500/30"
          >
            <HardDrive size={12} /> View_Journal
          </button>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${
              isLive ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-sky-500/10 border-sky-500 text-sky-400'
            }`}
          >
            {isLive ? 'Streaming' : 'Paused'}
          </button>
        </div>
      </div>

      {isCapturing && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
          <div className="w-64 h-64 border-4 border-sky-500/20 rounded-full flex items-center justify-center relative">
             <div className="absolute inset-0 border-t-4 border-sky-400 rounded-full animate-spin" />
             <div className="flex flex-col items-center gap-2">
               <Camera size={48} className="text-sky-400 animate-pulse" />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-center">Acquiring<br/>Official_Data...</span>
             </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div className="p-2 border-b border-sky-500/10 bg-slate-900/20 flex justify-between text-[10px] font-black uppercase">
          <span className="w-16">ID</span>
          <span className="flex-1">Source / MAC Address</span>
          <span className="w-24">Protocol</span>
          <span className="w-32 text-right">Action</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1" ref={scrollRef}>
          {packets.map(p => (
            <div 
              key={p.id} 
              className="group flex gap-4 p-2 hover:bg-sky-500/10 border-b border-transparent hover:border-sky-500/30 transition-all cursor-crosshair text-[11px]"
              onClick={() => handleDeepIntercept(p)}
            >
              <span className="w-16 text-sky-700 font-black">[{p.id}]</span>
              <div className="flex-1 flex flex-col">
                <span className="text-sky-100 font-bold">{p.src}</span>
                <span className="text-[9px] text-sky-500/40 uppercase tracking-tighter">MAC: {p.srcMac}</span>
              </div>
              <span className={`w-24 font-black ${p.proto === 'TCP' ? 'text-blue-400' : p.proto === 'UDP' ? 'text-green-400' : 'text-purple-400'}`}>
                {p.proto}
              </span>
              <div className="w-32 text-right flex flex-col">
                <span className="truncate text-sky-200">{p.activity.split(':')[1]}</span>
                <span className="text-[8px] text-sky-500/30 italic">Official_Log</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-12 border-t border-sky-500/10 bg-slate-950 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[9px] font-black uppercase">
           <div className="flex gap-2">
             <span className="text-sky-500/40">Intercepts:</span>
             <span className="text-sky-200">{packets.length}</span>
           </div>
           <div className="flex gap-2">
             <span className="text-sky-500/40">Threat_Lvl:</span>
             <span className="text-amber-500">MODERATE</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-sky-500/20 font-black">SØPHIA_KERNEL_BRIDGE_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default PacketSentinel;

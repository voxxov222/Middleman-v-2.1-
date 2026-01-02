
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DetectedEntity, IntelLog, SophiaIntel, AppView, InterceptLog } from './types';
import { SYSTEM_NAME, RECON_UNIT, MOCK_SSIDS, MOCK_BT_NAMES, MOCK_NFC_TAGS, MOCK_RADIO_CHANNELS, ALFA_VENDOR_IDS } from './constants';
import RadarHUD from './components/RadarHUD';
import SignalList from './components/SignalList';
import IntelTimeline from './components/IntelTimeline';
import HamInterface from './components/HamInterface';
import LogBook from './components/LogBook';
import URHAnalyzer from './components/URHAnalyzer';
import Env3D from './components/Env3D';
import PacketSentinel from './components/PacketSentinel';
import NeuralField from './components/NeuralField';
import InterceptJournal from './components/InterceptJournal';
import RemoteExplorer from './components/RemoteExplorer';
import { analyzeIntel } from './services/geminiService';
import { LayoutGrid, Radio, Terminal, Book, MessageSquare, Settings as SettingsIcon, Menu, X, ChevronRight, Box, ZapOff, ShieldAlert, Activity, Share2, HardDrive, Camera, FolderTree } from 'lucide-react';

const App: React.FC = () => {
  const [entities, setEntities] = useState<DetectedEntity[]>([]);
  const [history, setHistory] = useState<DetectedEntity[]>([]);
  const [intercepts, setIntercepts] = useState<InterceptLog[]>([]);
  const [logs, setLogs] = useState<IntelLog[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [sophiaIntel, setSophiaIntel] = useState<SophiaIntel | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('RADAR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [hwStatus, setHwStatus] = useState({ bt: 'IDLE', nfc: 'IDLE', wifi: 'RESTRICTED', usb: 'DISCONNECTED', radio: 'OFF' });
  const [isLongRange, setIsLongRange] = useState(false);
  const [isHamBridgeActive, setIsHamBridgeActive] = useState(false);
  const [isJammed, setIsJammed] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [activeTarget, setActiveTarget] = useState<{ip: string, mac: string} | null>(null);

  const scanIntervalRef = useRef<any>(null);

  const addLog = useCallback((message: string, type: IntelLog['type'] = 'INFO') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message,
      type
    }, ...prev].slice(0, 100));
  }, []);

  const handleInterceptCaptured = (log: InterceptLog) => {
    setIntercepts(prev => [log, ...prev]);
    addLog(`INTERCEPT: Captured official data from ${log.ip}`, 'WARNING');
  };

  const handleEstablishBridge = (target: {ip: string, mac: string}) => {
    setActiveTarget(target);
    setCurrentView('REMOTE_EXPLORER');
    addLog(`BRIDGE: Establishing Network Folder Bridge to ${target.ip}...`, 'INFO');
  };

  const captureActiveView = () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    const canvas = document.querySelector('canvas');
    let screenshot = '';
    
    if (canvas) {
      try {
        screenshot = canvas.toDataURL('image/png');
      } catch (e) {
        console.error("Canvas capture failed", e);
      }
    }

    const log: InterceptLog = {
      id: `OFF-${Date.now()}`,
      timestamp: Date.now(),
      mac: "LOCAL_HOST",
      ip: "127.0.0.1",
      target: `Official Sequence: ${currentView}`,
      protocol: "OFFICIAL_SIG",
      dataPayload: `Tactical official sequence snapshot of ${currentView} view area. Node state: ${isScanning ? 'SCANNING' : 'IDLE'}`,
      screenshot: screenshot || undefined
    };

    setIntercepts(prev => [log, ...prev]);
    addLog(`SYS: Official Sequence stored in Journal`, 'INFO');
  };

  const toggleJammer = () => {
    const nextState = !isJammed;
    setIsJammed(nextState);
    if (nextState) {
      setIsScanning(false);
      setEntities([]);
      addLog('CRITICAL: EMERGENCY JAMMER ACTIVE - ALL TX/RX INHIBITED', 'CRITICAL');
      setHwStatus({ bt: 'JAMMED', nfc: 'JAMMED', wifi: 'JAMMED', usb: 'OFFLINE', radio: 'OFFLINE' });
    } else {
      addLog('SYS: JAMMER DEACTIVATED - RESTORING SPECTRUM', 'INFO');
      setHwStatus({ bt: 'IDLE', nfc: 'IDLE', wifi: 'RESTRICTED', usb: isLongRange ? 'CONNECTED' : 'DISCONNECTED', radio: isHamBridgeActive ? 'ACTIVE' : 'OFF' });
      if (isScanning) startScan();
    }
  };

  useEffect(() => {
    if (entities.length > 0 && !isJammed) {
      setHistory(prev => {
        const newHistory = [...prev];
        entities.forEach(entity => {
          if (!newHistory.find(h => h.id === entity.id)) {
            newHistory.unshift(entity);
          }
        });
        return newHistory.slice(0, 500);
      });
    }
  }, [entities, isJammed]);

  const generateEntity = useCallback((): DetectedEntity | null => {
    if (isJammed) return null;
    const pools: DetectedEntity['type'][] = ['WIFI', 'BLUETOOTH', 'NFC', 'RFID'];
    if (isHamBridgeActive) pools.push('VHF', 'UHF');
    const type = pools[Math.floor(Math.random() * pools.length)];
    let distance = Math.random() * (isLongRange ? 200 : 45);
    let frequency: number | undefined;
    let name = '';

    if (type === 'VHF' || type === 'UHF') {
      frequency = type === 'VHF' ? 136 + Math.random() * 38 : 400 + Math.random() * 120;
      name = MOCK_RADIO_CHANNELS[Math.floor(Math.random() * MOCK_RADIO_CHANNELS.length)];
      distance = Math.random() * (type === 'VHF' ? 1500 : 800);
    } else {
      name = type === 'WIFI' ? MOCK_SSIDS[Math.floor(Math.random() * MOCK_SSIDS.length)] : 
             type === 'BLUETOOTH' ? MOCK_BT_NAMES[Math.floor(Math.random() * MOCK_BT_NAMES.length)] : 
             MOCK_NFC_TAGS[Math.floor(Math.random() * MOCK_NFC_TAGS.length)];
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type, name, identifier: frequency ? `${frequency.toFixed(3)}MHz` : `${Math.floor(Math.random() * 255).toString(16)}:${Math.floor(Math.random() * 255).toString(16)}:${Math.floor(Math.random() * 255).toString(16)}`,
      strength: -(Math.floor(Math.random() * 50 + 30)),
      distance, frequency, riskScore: Math.floor(Math.random() * 100),
      bearing: Math.floor(Math.random() * 360),
      timestamp: Date.now(),
      tags: frequency ? ['ANALOG_RF'] : ['OFFICIAL_DATA'],
      isReal: false
    };
  }, [isLongRange, isHamBridgeActive, isJammed]);

  const startScan = useCallback(() => {
    if (isJammed) return;
    setIsScanning(true);
    addLog('SPECTRUM SCAN ENGAGED...', 'INFO');
    
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    
    scanIntervalRef.current = setInterval(() => {
      if (isJammed) return;
      setEntities(prev => {
        const updated = prev.map(e => ({
          ...e,
          distance: Math.max(0.1, e.distance + (Math.random() * 2 - 1) * (e.isReal ? 0.1 : 1)),
          bearing: (e.bearing + (Math.random() * 4 - 2) + 360) % 360,
          timestamp: Date.now()
        }));
        const filtered = updated.filter(e => e.distance < (e.type === 'VHF' || e.type === 'UHF' ? 2000 : isLongRange ? 250 : 50) || e.isReal);
        if (Math.random() > 0.8 && filtered.length < 25) {
          const next = generateEntity();
          return next ? [...filtered, next] : filtered;
        }
        return filtered;
      });
    }, 2000);
  }, [generateEntity, isJammed, isLongRange, addLog]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
      addLog(`${SYSTEM_NAME} KERNEL LOADED`, 'INFO');
      startScan();
    }, 2500);
    return () => {
      clearTimeout(timer);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [addLog, startScan]);

  const runAiAnalysis = async () => {
    if (entities.length === 0 || isJammed) return;
    setCurrentView('SOPHIA');
    addLog('SØPHIA CORE INFERENCE START...', 'AI');
    try {
      const result = await analyzeIntel(entities);
      setSophiaIntel(result);
      addLog(`SØPHIA: Analysis Complete`, 'AI');
    } catch (e) {
      addLog('ANALYSIS ERROR', 'CRITICAL');
    }
  };

  const NavItem: React.FC<{ view: AppView, icon: React.ReactNode, label: string }> = ({ view, icon, label }) => (
    <button 
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`flex items-center gap-4 px-6 py-4 w-full transition-all border-l-4 ${
        currentView === view 
          ? 'bg-sky-500/10 border-sky-400 text-sky-100 shadow-[inset_10px_0_20px_rgba(56,189,248,0.05)]' 
          : 'border-transparent text-sky-500/40 hover:text-sky-400 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="font-black text-xs uppercase tracking-[0.2em]">{label}</span>
      {currentView === view && <ChevronRight size={14} className="ml-auto animate-pulse" />}
    </button>
  );

  if (isBooting) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 font-mono text-sky-500 gap-4">
        <div className="text-3xl font-black tracking-[0.8em] text-sky-400 animate-pulse">MIDDLEMAN</div>
        <div className="text-[10px] w-72 border border-sky-800 p-3 h-40 bg-slate-900/40 opacity-70">
          {`> Loading Tactical Sidebar...
> Initializing Black Book Storage
> Syncing SØPHIA core...
> Hardware Handshake: OK
> System Ready.`}
        </div>
        <div className="w-64 h-1 bg-sky-900 rounded-full overflow-hidden">
          <div className="h-full bg-sky-400 animate-[loading_2.5s_ease-in-out_forwards]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#020617] text-sky-400 font-mono overflow-hidden select-none crt-flicker">
      {/* Shutter Flash Effect */}
      {isFlashing && <div className="fixed inset-0 bg-white z-[200] opacity-50 transition-opacity" />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-sky-500/20 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-sky-500/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-black italic tracking-tighter text-sky-100 leading-none">MIDDLEMAN</span>
              <span className="text-[8px] tracking-widest text-sky-500/50 uppercase">Combat Spectrum OS</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sky-500"><X /></button>
          </div>

          <div className="p-4 border-b border-sky-500/10">
            <button 
              onClick={toggleJammer}
              className={`w-full py-3 rounded-lg border-2 flex items-center justify-center gap-3 transition-all duration-300 font-black uppercase text-sm group ${
                isJammed ? 'bg-red-500 border-white text-white shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-red-950/20 border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white'
              }`}
            >
              {isJammed ? <ShieldAlert size={20} /> : <ZapOff size={20} />}
              {isJammed ? 'JAMMING_ACTIVE' : 'EMERGENCY_JAMMER'}
            </button>
          </div>
          
          <nav className="flex-1 py-4 overflow-y-auto">
            <NavItem view="RADAR" icon={<LayoutGrid size={18} />} label="Tactical Radar" />
            <NavItem view="NEURAL_FIELD" icon={<Share2 size={18} />} label="Neural Field" />
            <NavItem view="ENV_3D" icon={<Box size={18} />} label="3D Environment" />
            <NavItem view="PACKET_SENTINEL" icon={<Activity size={18} />} label="Packet Sentinel" />
            <NavItem view="INTERCEPT_JOURNAL" icon={<HardDrive size={18} />} label="Intercept Journal" />
            {activeTarget && <NavItem view="REMOTE_EXPLORER" icon={<FolderTree size={18} />} label="Remote Explorer" />}
            <NavItem view="HAM" icon={<Radio size={18} />} label="Radio Bridge" />
            <NavItem view="URH" icon={<Terminal size={18} />} label="Protocol Lab" />
            <NavItem view="LOGBOOK" icon={<Book size={18} />} label="The Black Book" />
            <NavItem view="SOPHIA" icon={<MessageSquare size={18} />} label="SØPHIA Intel" />
            <NavItem view="SETTINGS" icon={<SettingsIcon size={18} />} label="Configuration" />
          </nav>

          <div className="p-6 border-t border-sky-500/10 bg-slate-900/20">
            <div className="flex items-center gap-3 text-[10px]">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : (isJammed ? 'bg-red-600 animate-ping' : 'bg-red-500')}`} />
              <span className="font-bold uppercase tracking-widest">{isJammed ? 'JAMMER_INHIBIT' : (isScanning ? 'Scanning_Spectrum' : 'Locked')}</span>
            </div>
            <div className="mt-4 text-[9px] text-sky-500/30 uppercase">
              NODE: {RECON_UNIT}<br/>
              BAT: {batteryLevel}% | RF: {isJammed ? 'NULL' : (isLongRange ? 'ALFA_EXT' : 'INTERNAL')}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {isJammed && (
          <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-red-900/5 backdrop-blur-[1px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30">
              <div className="text-[120px] font-black text-red-600/20 tracking-[1em] rotate-12">JAMMING</div>
            </div>
          </div>
        )}

        <header className="h-14 border-b border-sky-500/10 flex items-center justify-between px-6 bg-slate-900/40 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-sky-400"><Menu /></button>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-sky-100">{currentView.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={captureActiveView}
                title="Official Sequence Capture"
                className="p-2 text-sky-400 hover:text-white hover:bg-sky-500/20 rounded-lg transition-all"
             >
                <Camera size={20} />
             </button>
             <div className="h-8 w-24 bg-slate-950 border border-sky-500/20 rounded flex items-center justify-center p-1">
                <div className="flex-1 h-full bg-sky-500/20 relative">
                  <div className="absolute top-0 left-0 h-full bg-sky-400" style={{ width: `${batteryLevel}%` }} />
                </div>
                <span className="ml-2 text-[10px] font-bold text-sky-200">{batteryLevel}%</span>
             </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden flex flex-col lg:flex-row">
          {currentView === 'RADAR' && (
            <>
              <div className="flex-[2] p-4 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 relative flex items-center justify-center bg-slate-900/10 rounded-2xl border border-sky-500/5 p-6 overflow-hidden">
                  <div className="absolute top-4 left-4 flex gap-2 z-30">
                     <button onClick={isScanning ? () => setIsScanning(false) : startScan} className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase transition-all ${isScanning ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-sky-500/20 border-sky-500 text-sky-100'}`}>
                       {isScanning ? 'Halt' : 'Scan'}
                     </button>
                     <button onClick={runAiAnalysis} className="px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-200 text-[10px] font-black uppercase">
                       Ask_SØPHIA
                     </button>
                  </div>
                  <RadarHUD entities={isJammed ? [] : entities} selectedEntityId={selectedEntityId} onSelectEntity={setSelectedEntityId} maxRange={isLongRange ? 250 : 50} />
                </div>
                <div className="h-32">
                  <IntelTimeline logs={logs} />
                </div>
              </div>
              <div className="flex-1 p-4 border-l border-sky-500/10 bg-slate-950/20 overflow-hidden">
                <SignalList entities={isJammed ? [] : entities} selectedId={selectedEntityId} onSelect={setSelectedEntityId} onInvestigate={() => setCurrentView('URH')} />
              </div>
            </>
          )}

          {currentView === 'NEURAL_FIELD' && (
            <div className="flex-1 p-4 flex flex-col">
              <NeuralField entities={isJammed ? [] : entities} onSelect={setSelectedEntityId} selectedId={selectedEntityId} />
            </div>
          )}

          {currentView === 'ENV_3D' && (
             <div className="flex-1 p-4">
               <Env3D entities={isJammed ? [] : entities} maxRange={isLongRange ? 250 : 50} />
             </div>
          )}

          {currentView === 'PACKET_SENTINEL' && (
            <div className="flex-1 p-4">
              <PacketSentinel 
                entities={isJammed ? [] : entities} 
                onInterceptCaptured={handleInterceptCaptured}
                onViewJournal={() => setCurrentView('INTERCEPT_JOURNAL')}
              />
            </div>
          )}

          {currentView === 'INTERCEPT_JOURNAL' && (
            <div className="flex-1">
              <InterceptJournal 
                logs={intercepts} 
                onClear={() => setIntercepts([])} 
                onClose={() => setCurrentView('PACKET_SENTINEL')} 
                onEstablishBridge={handleEstablishBridge}
              />
            </div>
          )}

          {currentView === 'REMOTE_EXPLORER' && activeTarget && (
            <div className="flex-1">
              <RemoteExplorer target={activeTarget} onClose={() => setCurrentView('INTERCEPT_JOURNAL')} />
            </div>
          )}

          {currentView === 'HAM' && <HamInterface activeFrequency={145.800} onClose={() => setCurrentView('RADAR')} />}
          {currentView === 'URH' && <URHAnalyzer frequency={1.84900} onClose={() => setCurrentView('RADAR')} />}
          {currentView === 'LOGBOOK' && <div className="flex-1 p-6 overflow-y-auto"><LogBook history={history} onUpdateNotes={() => {}} onClear={() => setHistory([])} /></div>}

          {currentView === 'SOPHIA' && (
            <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
              <div className="w-full max-w-3xl space-y-8">
                 <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-purple-500 flex items-center justify-center bg-purple-500/10 animate-pulse">
                       <MessageSquare className="text-purple-400" size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">SØPHIA Intel Core</h2>
                 </div>
                 {sophiaIntel ? (
                   <div className="bg-purple-950/10 border border-purple-500/30 rounded-2xl p-8 space-y-6">
                      <div className="flex justify-between items-center border-b border-purple-500/20 pb-4">
                         <span className="text-purple-400 font-black uppercase text-xs">Analysis Briefing</span>
                         <span className="px-4 py-1 rounded-full text-[10px] bg-red-500 text-white">T_LEVEL: {sophiaIntel.threatAssessment}</span>
                      </div>
                      <p className="text-lg text-purple-100 italic">"{sophiaIntel.summary}"</p>
                   </div>
                 ) : (
                   <button onClick={runAiAnalysis} className="bg-sky-500 text-black px-10 py-3 rounded-full font-black text-sm uppercase mx-auto block">Run Inference</button>
                 )}
              </div>
            </div>
          )}

          {currentView === 'SETTINGS' && (
            <div className="flex-1 p-8">
              <h2 className="text-2xl font-black text-white uppercase italic mb-8">Configuration</h2>
              <div className="grid gap-6 max-w-xl">
                 <div className="bg-slate-900/40 p-6 rounded-xl border border-sky-500/10">
                    <h3 className="text-sky-100 font-bold mb-4 text-xs tracking-widest uppercase">Hardware</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span>USB OTG Interface</span>
                        <span className="text-sky-500/40">{hwStatus.usb}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Bluetooth Stack</span>
                        <span className="text-sky-500/40">{hwStatus.bt}</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;


import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Phone, 
  Settings, 
  Users, 
  ChevronLeft, 
  Search, 
  User, 
  ShieldCheck, 
  Signal, 
  Battery, 
  Wifi, 
  Clock,
  ArrowLeft,
  Lock,
  HardDrive,
  Image as ImageIcon,
  FileText,
  Send,
  MoreVertical,
  Plus,
  Bell,
  Download,
  Play,
  Check,
  Smartphone,
  Plane,
  Moon,
  Sun,
  X,
  Grid,
  Activity,
  Zap
} from 'lucide-react';

interface TacticalScreenMirrorProps {
  initialActivity?: string;
  onLaunchOhmGlobal?: () => void;
}

type PhoneApp = 'HOME' | 'MESSAGES' | 'THREAD' | 'CALLS' | 'CONTACTS' | 'SETTINGS' | 'GALLERY' | 'NOTES' | 'STORE' | 'OHM';

interface Notification {
  id: number;
  app: string;
  title: string;
  body: string;
  time: string;
  icon: React.ReactNode;
}

const WALLPAPERS = [
  'bg-gradient-to-br from-blue-400 to-indigo-600',
  'bg-gradient-to-br from-slate-800 to-slate-950',
  'bg-gradient-to-br from-emerald-500 to-teal-800',
  'bg-gradient-to-br from-rose-500 to-purple-900',
  'bg-slate-900'
];

const STORE_APPS = [
  { id: 'signal', name: 'Signal Cipher', category: 'Communication', rating: '4.8', size: '45MB', color: 'bg-blue-600' },
  { id: 'urh', name: 'URH Mobile', category: 'Tools', rating: '4.9', size: '12MB', color: 'bg-green-600' },
  { id: 'proton', name: 'Proton Node', category: 'Security', rating: '4.7', size: '32MB', color: 'bg-purple-600' },
  { id: 'termux', name: 'Termux Pack', category: 'Terminal', rating: '5.0', size: '150MB', color: 'bg-slate-800' },
  { id: 'wireshark', name: 'Shark Sniffer', category: 'Analysis', rating: '4.5', size: '89MB', color: 'bg-sky-400' },
  { id: 'ohm', name: 'Ohm Diag', category: 'Engineering', rating: '5.0', size: '8MB', color: 'bg-orange-600' }
];

const TacticalScreenMirror: React.FC<TacticalScreenMirrorProps> = ({ initialActivity, onLaunchOhmGlobal }) => {
  const [currentApp, setCurrentApp] = useState<PhoneApp>('HOME');
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, app: 'Cipher', title: 'Encrypted Message', body: 'Payload delivered to node 08.', time: 'Just now', icon: <MessageSquare size={12}/> },
    { id: 2, app: 'System', title: 'Security Alert', body: 'Unauthorized bridge attempt detected.', time: '5m ago', icon: <ShieldCheck size={12}/> }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'Cipher Zero', msg: 'The extraction team is on standby at the primary DZ.', time: '10:42 AM', isMe: false },
    { id: 2, sender: 'Me', msg: 'Copy that. Proceeding to secondary uplink.', time: '10:45 AM', isMe: true },
    { id: 3, sender: 'Cipher Zero', msg: 'Wait. Sensors detect a breach in the perimeter. Hold position.', time: '10:46 AM', isMe: false },
  ]);

  // Handle Download Simulation
  useEffect(() => {
    if (isDownloading) {
      setDownloadProgress(0);
      const timer = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsDownloading(null);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isDownloading]);

  const renderHome = () => (
    <div className="h-full w-full flex flex-col p-6 animate-in fade-in duration-500 overflow-y-auto scrollbar-hide">
      {/* Weather/Clock Widget */}
      <div className="mt-8 mb-8 flex flex-col items-center drop-shadow-lg shrink-0">
        <span className="text-6xl font-thin text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-white/90 italic">Beaumont Sector</span>
          <span className="text-[10px] text-white/60">Slightly Jammed</span>
        </div>
      </div>

      {/* Google Search Mock */}
      <div className="bg-white/95 rounded-3xl h-12 flex items-center px-4 gap-3 shadow-xl mb-8 transform hover:scale-[1.02] transition-transform shrink-0">
        <span className="text-blue-500 font-black">G</span>
        <span className="text-xs text-gray-500 flex-1 truncate italic">Search terminal or node...</span>
      </div>

      {/* Main App Grid */}
      <div className="grid grid-cols-4 gap-y-8 gap-x-2 px-2 pb-20">
        {[
          { id: 'GALLERY', icon: <ImageIcon size={22} />, label: 'Photos', color: 'bg-emerald-400' },
          { id: 'NOTES', icon: <FileText size={22} />, label: 'Intel', color: 'bg-amber-400' },
          { id: 'SETTINGS', icon: <ShieldCheck size={22} />, label: 'Vault', color: 'bg-slate-700' },
          { id: 'CONTACTS', icon: <Users size={22} />, label: 'Assets', color: 'bg-orange-500' },
          { id: 'STORE', icon: <Play size={22} fill="white" />, label: 'Play Store', color: 'bg-white text-blue-500' },
          { id: 'SIGNAL', icon: <Smartphone size={22} />, label: 'Terminal', color: 'bg-blue-600' },
          { id: 'OHM', icon: <Zap size={22} />, label: 'Ohm HW', color: 'bg-orange-600' },
        ].map(app => (
          <button 
            key={app.id}
            onClick={() => app.id === 'OHM' ? (onLaunchOhmGlobal ? onLaunchOhmGlobal() : setCurrentApp('OHM')) : setCurrentApp(app.id as PhoneApp)}
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-all group"
          >
            <div className={`${app.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:brightness-110 border border-white/5`}>
              {app.icon}
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-md">{app.label}</span>
          </button>
        ))}
      </div>

      {/* App Dock */}
      <div className="mt-auto bg-white/15 backdrop-blur-2xl rounded-[2.5rem] p-4 flex justify-between items-center mb-6 shadow-2xl border border-white/10 shrink-0">
        {[
          { id: 'CALLS' as PhoneApp, icon: <Phone size={24} />, color: 'bg-green-500' },
          { id: 'MESSAGES' as PhoneApp, icon: <MessageSquare size={24} />, color: 'bg-sky-500' },
          { id: 'NOTES' as PhoneApp, icon: <FileText size={24} />, color: 'bg-amber-500' },
          { id: 'HOME' as PhoneApp, icon: <div className="w-6 h-6 rounded bg-white/20" />, color: 'bg-white/10' },
        ].map(app => (
          <button 
            key={app.id}
            onClick={() => setCurrentApp(app.id)}
            className={`${app.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all`}
          >
            {app.icon}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStore = () => (
    <div className="h-full w-full bg-white flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 flex flex-col gap-4 mt-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 shadow-inner">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search apps & games" 
            className="flex-1 bg-transparent text-sm focus:outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <User size={16} className="text-gray-400" />
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide text-xs font-bold text-gray-500 px-2 pb-1">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-1">For you</span>
          <span>Top charts</span>
          <span>Security</span>
          <span>Tools</span>
          <span>Recon</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-sm font-black text-gray-900 mb-4">Tactical Recommendations</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {STORE_APPS.map(app => (
              <div key={app.id} className="flex flex-col gap-2 min-w-[100px] shrink-0 active:scale-95 transition-transform">
                <div className={`${app.color} w-24 h-24 rounded-2xl flex items-center justify-center text-white shadow-md text-3xl font-black`}>
                  {app.name[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-800 truncate">{app.name}</span>
                  <span className="text-[9px] text-gray-400">{app.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-900">Featured Apps</h3>
          {STORE_APPS.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase())).map((app, idx) => (
            <div key={app.id} className="flex items-center gap-4">
              <div className={`${app.color} w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm`}>
                {app.name[0]}
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-xs font-bold text-gray-800">{app.name}</span>
                <span className="text-[10px] text-gray-400">{app.category} • {app.rating} ★</span>
              </div>
              <button 
                onClick={() => setIsDownloading(app.name)}
                disabled={isDownloading !== null}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                  isDownloading === app.name ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                }`}
              >
                {isDownloading === app.name ? 'Installing...' : 'Install'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {isDownloading && (
        <div className="absolute bottom-20 left-4 right-4 bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 animate-in slide-in-from-bottom">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-gray-800">Downloading {isDownloading}...</span>
              <span className="text-[10px] font-bold text-blue-600">{downloadProgress}%</span>
           </div>
           <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-100" style={{ width: `${downloadProgress}%` }} />
           </div>
        </div>
      )}

      <div className="h-14 border-t border-gray-100 flex items-center justify-around text-gray-400">
         <div className="flex flex-col items-center gap-1">
            <Play size={18} className="text-blue-600" />
            <span className="text-[9px] font-bold text-blue-600 uppercase">Games</span>
         </div>
         <div className="flex flex-col items-center gap-1">
            <Grid size={18} />
            <span className="text-[9px] font-bold uppercase">Apps</span>
         </div>
         <div className="flex flex-col items-center gap-1">
            <Bell size={18} />
            <span className="text-[9px] font-bold uppercase">Offers</span>
         </div>
      </div>
    </div>
  );

  const QuickSettings = () => (
    <div className={`absolute inset-0 z-[100] bg-black/40 backdrop-blur-3xl transition-all duration-500 flex flex-col p-8 ${showQuickSettings ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="flex justify-between items-center mb-8">
        <span className="text-white font-black text-xl">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <button onClick={() => setShowQuickSettings(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={20}/></button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Wi-Fi', icon: <Wifi size={20}/>, active: true },
          { label: 'BT', icon: <Signal size={20}/>, active: true },
          { label: 'DND', icon: <Moon size={20}/>, active: false },
          { label: 'Plane', icon: <Plane size={20}/>, active: false },
          { label: 'Flash', icon: <Sun size={20}/>, active: false },
          { label: 'Secure', icon: <Lock size={20}/>, active: true },
          { label: 'Recon', icon: <Activity size={20}/>, active: true },
          { label: 'Hotspot', icon: <Wifi size={20}/>, active: false },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <button className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${item.active ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 text-white/40'}`}>
              {item.icon}
            </button>
            <span className="text-[9px] font-black text-white/60 uppercase">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Notifications</span>
        {notifications.map(n => (
          <div key={n.id} className="bg-white/10 p-4 rounded-2xl flex gap-4 border border-white/5 active:bg-white/20 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
              {n.icon}
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs font-bold text-white">{n.title}</span>
                <span className="text-[9px] text-white/40">{n.time}</span>
              </div>
              <p className="text-[10px] text-white/60 truncate">{n.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex justify-center pb-4">
        <button onClick={() => setShowQuickSettings(false)} className="w-24 h-1.5 bg-white/20 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="relative p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(255,255,255,0.1)] border border-slate-600 h-[700px] w-[340px] mx-auto select-none overflow-hidden scale-95 lg:scale-100 origin-center transition-transform">
      {/* Phone Notch/Sensor */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-[110] flex items-center justify-center gap-3">
        <div className="w-2 h-2 bg-slate-900 rounded-full border border-slate-800" />
        <div className="w-12 h-1 bg-slate-800 rounded-full" />
        <div className="w-1.5 h-1.5 bg-blue-900/40 rounded-full" />
      </div>

      {/* Screen Mirror Container */}
      <div className={`relative h-full w-full rounded-[2.8rem] overflow-hidden ${WALLPAPERS[wallpaperIdx]} flex flex-col transition-colors duration-1000`}>
        
        {/* Quick Settings Pull-down Trigger / Status Bar */}
        <div 
          className="absolute top-0 w-full h-10 px-8 flex justify-between items-center z-[110] text-white font-bold text-[11px] drop-shadow-md cursor-ns-resize"
          onClick={() => setShowQuickSettings(!showQuickSettings)}
        >
          <span className="flex items-center gap-1.5"><Clock size={11} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-2">
            <Wifi size={11} />
            <Signal size={11} />
            <div className="flex items-center gap-0.5">8% <div className="w-5 h-2.5 border border-white/60 rounded-[2px] p-[1px] relative"><div className="bg-red-500 h-full w-[15%]" /></div></div>
          </div>
        </div>

        {/* Quick Settings Overlay */}
        <QuickSettings />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {currentApp === 'HOME' && renderHome()}
          {currentApp === 'STORE' && renderStore()}
          {currentApp === 'OHM' && <div className="h-full bg-[#020617] flex flex-col items-center justify-center p-8 text-center text-orange-500"><Zap size={64} className="mb-4 animate-pulse" /><h3 className="text-lg font-black uppercase">OHM_DIAGNOSTIC_ACTIVE</h3><p className="text-xs mt-4 opacity-60 italic">Hardware-level bridge established. Synchronizing thermal telemetry with node 08.</p><button onClick={() => setCurrentApp('HOME')} className="mt-8 px-6 py-2 border border-orange-500 rounded font-black text-xs uppercase">Close</button></div>}
          
          {currentApp === 'MESSAGES' && <div className="h-full bg-white"><button onClick={() => setCurrentApp('HOME')} className="p-8"><ArrowLeft/></button><div className="p-8 text-black font-black">MESSAGES_LIST_SCROLLABLE_UPGRADE</div></div>}
          {currentApp === 'SETTINGS' && (
            <div className="h-full w-full bg-[#f2f2f7] flex flex-col animate-in slide-in-from-bottom duration-300">
               <div className="p-6 flex items-center justify-between mt-6">
                 <h2 className="text-2xl font-black text-gray-900">Settings</h2>
                 <button onClick={() => setCurrentApp('HOME')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={18} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm" onClick={() => setWallpaperIdx((prev) => (prev + 1) % WALLPAPERS.length)}>
                     <ImageIcon size={24} className="text-blue-500" />
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">Change Wallpaper</span>
                        <span className="text-[10px] text-gray-400">Personalize your recon node</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
          {!['HOME', 'STORE', 'SETTINGS', 'OHM'].includes(currentApp) && (
            <div className="h-full w-full bg-white flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
                  <Activity size={48} />
               </div>
               <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-widest">{currentApp}</h3>
               <button onClick={() => setCurrentApp('HOME')} className="px-8 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase shadow-xl active:scale-95 transition-all">Close App</button>
            </div>
          )}
        </div>

        {/* Navigation Indicator / Gesture Bar */}
        <div className="h-6 flex items-center justify-center mb-1 shrink-0">
           <div 
            onClick={() => setCurrentApp('HOME')}
            className="w-24 h-1 bg-white/30 rounded-full cursor-pointer hover:bg-white/50 transition-colors" 
           />
        </div>
      </div>
      
      {/* Visual Artifacts */}
      <div className="absolute inset-0 pointer-events-none rounded-[3.5rem] border-[4px] border-white/5 opacity-50 z-[120]" />
    </div>
  );
};

export default TacticalScreenMirror;

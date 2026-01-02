
import React, { useState } from 'react';
import { InterceptLog } from '../types';
import { HardDrive, Search, Trash2, ArrowLeft, ExternalLink, Calendar, Hash, Globe, Eye, Terminal, Camera, Share2 } from 'lucide-react';

interface InterceptJournalProps {
  logs: InterceptLog[];
  onClear: () => void;
  onClose: () => void;
  onEstablishBridge?: (target: {ip: string, mac: string}) => void;
}

const InterceptJournal: React.FC<InterceptJournalProps> = ({ logs, onClear, onClose, onEstablishBridge }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = logs.filter(l => 
    l.ip.includes(searchTerm) || 
    l.mac.includes(searchTerm) || 
    l.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLog = logs.find(l => l.id === selectedId);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-sky-400 font-mono">
      <div className="p-4 border-b border-sky-500/20 bg-slate-900/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-sky-500/10 rounded-full transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-widest italic leading-none">Intercept_Journal</h2>
            <span className="text-[9px] text-sky-500/40 uppercase mt-1">Official_Forensic_Database</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={onClear} className="p-2 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col border-r border-sky-500/10 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-2 bg-slate-900/20 border-b border-sky-500/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/40" size={12} />
              <input 
                type="text" 
                placeholder="FILTER_INTERCEPTS..." 
                className="w-full bg-slate-950 border border-sky-500/20 rounded py-2 pl-9 pr-4 text-[10px] focus:outline-none focus:border-sky-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-12 text-center opacity-20 flex flex-col items-center">
                <HardDrive size={48} className="mb-4" />
                <span className="text-xs font-black uppercase">Archive_Empty</span>
              </div>
            ) : (
              filtered.map(log => (
                <div 
                  key={log.id} 
                  onClick={() => setSelectedId(log.id)}
                  className={`p-4 border-b border-sky-500/5 cursor-pointer transition-all hover:bg-sky-500/5 ${selectedId === log.id ? 'bg-sky-500/10 border-l-4 border-l-sky-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-sky-100">{log.ip}</span>
                    <span className="text-[8px] text-sky-500/40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[9px] text-sky-500/60 truncate uppercase">{log.target}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`flex-[2] bg-black/40 p-6 overflow-y-auto ${!selectedId ? 'hidden md:flex' : 'flex'} flex-col`}>
          {selectedLog ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div className="flex justify-between items-center border-b border-sky-500/20 pb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-sky-500/40 uppercase tracking-widest">Official_Record_ID</span>
                  <span className="text-sm font-black text-white">{selectedLog.id}</span>
                </div>
                <div className="flex items-center gap-2">
                   {onEstablishBridge && selectedLog.ip !== '127.0.0.1' && (
                     <button 
                       onClick={() => onEstablishBridge({ip: selectedLog.ip, mac: selectedLog.mac})}
                       className="px-4 py-1.5 bg-sky-500 text-black rounded font-black text-[10px] uppercase flex items-center gap-2 hover:bg-white transition-all shadow-lg"
                     >
                       <Share2 size={12} /> ESTABLISH_FOLDER_BRIDGE
                     </button>
                   )}
                   <div className="px-3 py-1 bg-sky-500/10 rounded border border-sky-500/40 text-[9px] font-black uppercase text-sky-400">
                    {selectedLog.protocol} SECURE_LINK
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded border border-sky-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={12} className="text-sky-400" />
                    <span className="text-[9px] font-black uppercase text-sky-500/40">Target_IP</span>
                  </div>
                  <span className="text-xs font-bold text-sky-100">{selectedLog.ip}</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded border border-sky-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash size={12} className="text-sky-400" />
                    <span className="text-[9px] font-black uppercase text-sky-500/40">Hardware_ID</span>
                  </div>
                  <span className="text-xs font-bold text-sky-100">{selectedLog.mac}</span>
                </div>
              </div>

              <div className="bg-slate-900/20 border border-sky-500/10 p-4 rounded-xl">
                 <div className="flex items-center gap-2 mb-4">
                   <Eye size={14} className="text-amber-500" />
                   <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Official_Sequence_Reconstruction</span>
                 </div>
                 
                 {selectedLog.screenshot ? (
                   <div className="flex justify-center items-center py-4 bg-black/40 rounded-lg">
                      {/* Realistic Device Bezel */}
                      <div className="relative p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_10px_rgba(255,255,255,0.1)] border border-slate-600">
                         {/* Front Facing Sensor */}
                         <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full border border-slate-800" />
                         
                         <div className="relative overflow-hidden rounded-[1.8rem] bg-black border border-black shadow-inner">
                            <img src={selectedLog.screenshot} alt="Intercept" className="max-w-full max-h-[500px] object-contain" />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                         </div>
                         
                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black text-sky-500/20 uppercase tracking-widest">RECON_NODE_08</div>
                      </div>
                   </div>
                 ) : (
                   <div className="h-32 bg-black flex items-center justify-center border border-dashed border-sky-500/20 rounded">
                     <span className="text-[10px] text-sky-500/20 font-black uppercase tracking-[0.3em]">No_Visual_Data</span>
                   </div>
                 )}
              </div>

              <div className="bg-slate-950 p-4 rounded border border-sky-500/10">
                <div className="flex items-center gap-2 mb-2 border-b border-sky-500/5 pb-2">
                  <Terminal size={12} className="text-sky-400" />
                  <span className="text-[10px] font-black uppercase text-sky-500/40">Sequence_Metadata</span>
                </div>
                <p className="text-xs text-sky-200 leading-relaxed italic">
                  "{selectedLog.target}"
                </p>
                <div className="mt-4 p-2 bg-black text-[9px] text-sky-700 font-mono break-all leading-tight border-l-2 border-sky-900">
                  {selectedLog.dataPayload}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <Eye size={64} className="mb-4" />
              <span className="text-xs font-black uppercase tracking-[0.5em]">Select_Node_To_Decrypt</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterceptJournal;


import React, { useState } from 'react';
import { DetectedEntity } from '../types';
import { Book, Search, Filter, Trash2, Edit3, Save, Share2 } from 'lucide-react';

interface LogBookProps {
  history: DetectedEntity[];
  onUpdateNotes: (id: string, notes: string) => void;
  onClear: () => void;
}

const LogBook: React.FC<LogBookProps> = ({ history, onUpdateNotes, onClear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const filtered = history.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#020617] text-sky-400 font-mono">
      <div className="p-4 border-b border-sky-500/20 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <Book className="text-sky-300" size={20} />
          <h2 className="text-lg font-black tracking-widest uppercase italic">The Black Book</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onClear} className="p-2 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-3 bg-slate-900/20 border-b border-sky-500/10 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/40" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH_DB_REGISTRY..." 
            className="w-full bg-slate-950 border border-sky-500/20 rounded py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-sky-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Book size={48} />
            <span className="mt-4 text-xs font-bold uppercase tracking-[0.3em]">Registry_Empty</span>
          </div>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} className="border border-sky-500/10 bg-slate-900/20 rounded-lg overflow-hidden flex flex-col">
              <div className="p-3 flex justify-between items-start bg-slate-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-sky-500 text-black px-1.5 py-0.5 rounded uppercase">{entry.type}</span>
                    <span className="font-bold text-sm text-sky-100">{entry.name}</span>
                  </div>
                  <div className="text-[10px] text-sky-500/60 mt-1 uppercase tracking-tighter">
                    {new Date(entry.timestamp).toLocaleString()} | ID: {entry.identifier}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black ${entry.riskScore > 70 ? 'text-red-500' : 'text-sky-400'}`}>RISK: {entry.riskScore}%</div>
                  <div className="text-[9px] text-sky-500/30 uppercase">SIG: {entry.strength} dBm</div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-950/40 border-t border-sky-500/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-sky-500/40 uppercase tracking-widest flex items-center gap-1">
                    <Edit3 size={10} /> Operator_Notes
                  </span>
                  {editingId === entry.id ? (
                    <button 
                      onClick={() => {
                        onUpdateNotes(entry.id, tempNotes);
                        setEditingId(null);
                      }}
                      className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1"
                    >
                      <Save size={10} /> Sync
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingId(entry.id);
                        setTempNotes(entry.notes || '');
                      }}
                      className="text-[10px] text-sky-400/60 font-bold uppercase"
                    >
                      Edit
                    </button>
                  )}
                </div>
                
                {editingId === entry.id ? (
                  <textarea 
                    className="w-full bg-slate-900 border border-sky-500/30 rounded p-2 text-xs text-sky-200 h-20 focus:outline-none"
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                  />
                ) : (
                  <p className={`text-xs ${entry.notes ? 'text-sky-300' : 'text-sky-500/20 italic'}`}>
                    {entry.notes || 'NO_NOTES_ENTERED_BY_OPERATOR...'}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogBook;

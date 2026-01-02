
import React from 'react';
import { IntelLog } from '../types';
import { ICONS } from '../constants';

interface IntelTimelineProps {
  logs: IntelLog[];
}

const IntelTimeline: React.FC<IntelTimelineProps> = ({ logs }) => {
  return (
    <div className="h-full bg-slate-900/80 border border-sky-500/20 rounded-lg p-3 overflow-y-auto flex flex-col-reverse gap-2">
      <div className="flex items-center gap-2 text-xs font-bold text-sky-300 pb-2 border-b border-sky-500/30">
        {ICONS.Terminal} INTEL_TIMELINE
      </div>
      
      {logs.map((log) => (
        <div key={log.id} className="text-[10px] font-mono leading-tight">
          <span className="text-sky-600">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
          <span className={`ml-2 ${
            log.type === 'CRITICAL' ? 'text-red-400' : 
            log.type === 'WARNING' ? 'text-yellow-400' : 
            log.type === 'AI' ? 'text-purple-400 italic' : 'text-sky-200'
          }`}>
            {log.type === 'AI' ? '● ' : ''}{log.message}
          </span>
        </div>
      ))}
    </div>
  );
};

export default IntelTimeline;

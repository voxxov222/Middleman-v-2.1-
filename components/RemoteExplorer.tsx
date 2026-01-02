
import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  HardDrive, 
  ShieldCheck, 
  Download, 
  Info, 
  Terminal, 
  LayoutGrid, 
  List, 
  Share2,
  FileText,
  ImageIcon,
  FileCode,
  Database,
  Music,
  Video,
  Lock
} from 'lucide-react';
import { RemoteFile } from '../types';

const getFileIcon = (fileName: string, type: 'FILE' | 'FOLDER') => {
  if (type === 'FOLDER') return <Folder size={14} className="text-sky-400" />;
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return <FileText size={14} className="text-red-400" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return <ImageIcon size={14} className="text-emerald-400" />;
    case 'db':
    case 'sql': return <Database size={14} className="text-amber-400" />;
    case 'mp4':
    case 'mov': return <Video size={14} className="text-purple-400" />;
    case 'mp3':
    case 'wav': return <Music size={14} className="text-pink-400" />;
    case 'pem':
    case 'key':
    case 'gpg':
    case 'kdbx': return <Lock size={14} className="text-yellow-400" />;
    case 'js':
    case 'py':
    case 'sh':
    case 'json': return <FileCode size={14} className="text-blue-400" />;
    default: return <File size={14} className="text-sky-500/40" />;
  }
};

const MOCK_FS: Record<string, RemoteFile[]> = {
  '/': [
    { name: 'system', type: 'FOLDER', modified: '2024-01-10', permissions: 'drwxr-xr-x' },
    { name: 'data', type: 'FOLDER', modified: '2024-03-15', permissions: 'drwx------' },
    { name: 'sdcard', type: 'FOLDER', modified: '2024-05-20', permissions: 'drwxrwxr-x' },
    { name: 'mnt', type: 'FOLDER', modified: '2024-01-05', permissions: 'drwxr-xr-x' },
    { name: 'vendor', type: 'FOLDER', modified: '2023-12-20', permissions: 'drwxr-xr-x' },
    { name: 'init.rc', type: 'FILE', size: '18KB', modified: '2023-11-20', permissions: '-rw-r--r--' },
  ],
  '/system': [
    { name: 'bin', type: 'FOLDER', modified: '2024-01-10', permissions: 'drwxr-xr-x' },
    { name: 'etc', type: 'FOLDER', modified: '2024-01-10', permissions: 'drwxr-xr-x' },
    { name: 'framework', type: 'FOLDER', modified: '2024-01-10', permissions: 'drwxr-xr-x' },
    { name: 'lib64', type: 'FOLDER', modified: '2024-01-10', permissions: 'drwxr-xr-x' },
    { name: 'build.prop', type: 'FILE', size: '4.8KB', modified: '2024-01-10', permissions: '-rw-r--r--' },
  ],
  '/data': [
    { name: 'app', type: 'FOLDER', modified: '2024-04-15', permissions: 'drwx------' },
    { name: 'user', type: 'FOLDER', modified: '2024-04-15', permissions: 'drwx------' },
    { name: 'com.android.providers.telephony', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwx------' },
    { name: 'com.android.providers.contacts', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwx------' },
    { name: 'com.whatsapp', type: 'FOLDER', modified: '2024-05-23', permissions: 'drwx------' },
  ],
  '/data/com.android.providers.telephony': [
    { name: 'databases', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwx------' },
  ],
  '/data/com.android.providers.telephony/databases': [
    { name: 'mmssms.db', type: 'FILE', size: '2.4MB', modified: '2024-05-23', permissions: '-rw-------' },
    { name: 'telephony.db', type: 'FILE', size: '128KB', modified: '2024-05-23', permissions: '-rw-------' },
  ],
  '/data/com.android.providers.contacts/databases': [
    { name: 'contacts2.db', type: 'FILE', size: '4.1MB', modified: '2024-05-23', permissions: '-rw-------' },
    { name: 'calllog.db', type: 'FILE', size: '840KB', modified: '2024-05-23', permissions: '-rw-------' },
  ],
  '/sdcard': [
    { name: 'DCIM', type: 'FOLDER', modified: '2024-05-20', permissions: 'drwxrwxr-x' },
    { name: 'Download', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwxrwxr-x' },
    { name: 'Documents', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwxrwxr-x' },
    { name: 'Pictures', type: 'FOLDER', modified: '2024-05-20', permissions: 'drwxrwxr-x' },
    { name: 'Movies', type: 'FOLDER', modified: '2024-05-18', permissions: 'drwxrwxr-x' },
    { name: 'Music', type: 'FOLDER', modified: '2024-01-10', permissions: 'drwxrwxr-x' },
  ],
  '/sdcard/DCIM': [
    { name: 'Camera', type: 'FOLDER', modified: '2024-05-20', permissions: 'drwxrwxr-x' },
    { name: 'Screenshots', type: 'FOLDER', modified: '2024-05-21', permissions: 'drwxrwxr-x' },
  ],
  '/sdcard/DCIM/Camera': [
    { name: 'IMG_20240515_1422.jpg', type: 'FILE', size: '3.4MB', modified: '2024-05-15', permissions: '-rw-rw-r--' },
    { name: 'IMG_20240515_1425.jpg', type: 'FILE', size: '2.9MB', modified: '2024-05-15', permissions: '-rw-rw-r--' },
    { name: 'VID_20240516_0900.mp4', type: 'FILE', size: '45MB', modified: '2024-05-16', permissions: '-rw-rw-r--' },
  ],
  '/sdcard/Download': [
    { name: 'security_audit_report.pdf', type: 'FILE', size: '1.2MB', modified: '2024-05-22', permissions: '-rw-rw-r--' },
    { name: 'vpn_config_secure.ovpn', type: 'FILE', size: '4KB', modified: '2024-05-21', permissions: '-rw-------' },
    { name: 'glitch_test_sequence.gif', type: 'FILE', size: '8.4MB', modified: '2024-05-20', permissions: '-rw-rw-r--' },
    { name: 'encrypted_payload.zip', type: 'FILE', size: '156MB', modified: '2024-05-19', permissions: '-rw-------' },
  ],
  '/sdcard/Documents': [
    { name: 'Operational', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwxrwxr-x' },
    { name: 'Private', type: 'FOLDER', modified: '2024-05-22', permissions: 'drwx------' },
  ],
  '/sdcard/Documents/Operational': [
    { name: 'target_profiles.pdf', type: 'FILE', size: '5.6MB', modified: '2024-05-22', permissions: '-rw-rw-r--' },
    { name: 'mission_brief_v4.pdf', type: 'FILE', size: '890KB', modified: '2024-05-21', permissions: '-rw-rw-r--' },
    { name: 'intercept_summary.json', type: 'FILE', size: '45KB', modified: '2024-05-23', permissions: '-rw-rw-r--' },
  ],
  '/sdcard/Documents/Private': [
    { name: 'vault.kdbx', type: 'FILE', size: '512KB', modified: '2024-05-23', permissions: '-rw-------' },
    { name: 'ssh_id_rsa.pem', type: 'FILE', size: '2KB', modified: '2024-05-22', permissions: '-rw-------' },
    { name: 'tax_records_2023.pdf', type: 'FILE', size: '2.1MB', modified: '2024-03-10', permissions: '-rw-------' },
  ],
  '/sdcard/Pictures': [
    { name: 'Telegram', type: 'FOLDER', modified: '2024-05-20', permissions: 'drwxrwxr-x' },
    { name: 'hidden_cam_loop.gif', type: 'FILE', size: '12MB', modified: '2024-05-21', permissions: '-rw-rw-r--' },
  ],
  '/sdcard/Movies': [
    { name: 'surveillance_feed_08.mp4', type: 'FILE', size: '240MB', modified: '2024-05-22', permissions: '-rw-rw-r--' },
    { name: 'intercepted_facetime.mov', type: 'FILE', size: '85MB', modified: '2024-05-21', permissions: '-rw-------' },
  ]
};

const RemoteExplorer: React.FC<RemoteExplorerProps> = ({ target, onClose }) => {
  const [path, setPath] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [selectedFile, setSelectedFile] = useState<RemoteFile | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const currentPathStr = '/' + path.join('/');
  const files = (MOCK_FS[currentPathStr] || []).filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigate = (folder: string) => {
    setPath([...path, folder]);
    setSelectedFile(null);
    setSearchTerm('');
  };

  const handleBack = () => {
    if (path.length > 0) {
      setPath(path.slice(0, -1));
      setSelectedFile(null);
    } else {
      onClose();
    }
  };

  if (isConnecting) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 font-mono text-sky-500">
        <div className="w-64 h-64 border-2 border-sky-500/20 rounded-full flex items-center justify-center relative mb-8">
           <div className="absolute inset-0 border-t-2 border-sky-400 rounded-full animate-spin" />
           <div className="flex flex-col items-center">
             <Share2 size={48} className="text-sky-400 animate-pulse mb-4" />
             <span className="text-xs font-black uppercase tracking-widest text-center">Establish_Bridge...</span>
           </div>
        </div>
        <div className="text-[10px] text-sky-500/40 uppercase space-y-1 text-center">
           <div>> Handshake: {target.ip}</div>
           <div>> Authentication: OVERRIDDEN</div>
           <div>> Protocol: SMB_INFILTRATOR_V1</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#020617] text-sky-400 font-mono">
      {/* HEADER */}
      <div className="p-4 border-b border-sky-500/20 bg-slate-900/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-sky-500/10 rounded-full transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-widest italic leading-none">Remote_Explorer</h2>
            <span className="text-[9px] text-sky-500/40 uppercase mt-1">Node: {target.ip} (ROOT_ACCESS)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500/40" size={12} />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="bg-slate-950 border border-sky-500/20 rounded-full py-1.5 pl-9 pr-4 text-[10px] w-48 focus:outline-none focus:border-sky-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex bg-slate-950 rounded p-1 border border-sky-500/10">
              <button onClick={() => setViewMode('GRID')} className={`p-1.5 rounded ${viewMode === 'GRID' ? 'bg-sky-500 text-black' : 'text-sky-500/40'}`}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('LIST')} className={`p-1.5 rounded ${viewMode === 'LIST' ? 'bg-sky-500 text-black' : 'text-sky-500/40'}`}>
                <List size={14} />
              </button>
           </div>
           <button onClick={onClose} className="px-3 py-1 border border-red-500/40 text-red-500 text-[10px] font-black uppercase rounded hover:bg-red-500/10 transition-all">Terminate</button>
        </div>
      </div>

      {/* BREADCRUMBS */}
      <div className="px-6 py-2 bg-slate-900/20 border-b border-sky-500/5 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button onClick={() => setPath([])} className="text-[10px] font-bold text-sky-100 hover:text-white transition-colors">ROOT</button>
        {path.map((p, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={10} className="text-sky-500/30" />
            <button 
              onClick={() => setPath(path.slice(0, idx + 1))}
              className="text-[10px] font-bold text-sky-100 hover:text-white transition-colors uppercase"
            >
              {p}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR SHORTCUTS */}
        <div className="w-48 border-r border-sky-500/10 bg-slate-900/10 hidden md:flex flex-col p-4 gap-2">
           <span className="text-[9px] font-black uppercase text-sky-500/30 mb-2 tracking-widest">Bookmarks</span>
           <button onClick={() => setPath([])} className={`flex items-center gap-3 p-2 rounded text-[10px] font-bold transition-all ${path.length === 0 ? 'bg-sky-500/10 text-sky-100' : 'text-sky-500/60 hover:bg-sky-500/5'}`}>
             <HardDrive size={14} /> Root_FS
           </button>
           <button onClick={() => setPath(['sdcard'])} className={`flex items-center gap-3 p-2 rounded text-[10px] font-bold transition-all ${path[0] === 'sdcard' ? 'bg-sky-500/10 text-sky-100' : 'text-sky-500/60 hover:bg-sky-500/5'}`}>
             <Folder size={14} /> User_Storage
           </button>
           <button onClick={() => setPath(['data', 'com.android.providers.telephony', 'databases'])} className={`flex items-center gap-3 p-2 rounded text-[10px] font-bold transition-all ${path.includes('telephony') ? 'bg-sky-500/10 text-sky-100' : 'text-sky-500/60 hover:bg-sky-500/5'}`}>
             <Database size={14} /> Comms_Logs
           </button>
           <button onClick={() => setPath(['sdcard', 'Documents', 'Operational'])} className={`flex items-center gap-3 p-2 rounded text-[10px] font-bold transition-all ${path.includes('Operational') ? 'bg-sky-500/10 text-sky-100' : 'text-sky-500/60 hover:bg-sky-500/5'}`}>
             <FileText size={14} /> Intel_Docs
           </button>
        </div>

        {/* MAIN FILE VIEW */}
        <div className="flex-1 flex flex-col overflow-hidden">
           <div className="flex-1 overflow-y-auto p-6">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <Search size={48} className="mb-4" />
                   <span className="text-xs font-black uppercase tracking-[0.3em]">No_Results_Found</span>
                </div>
              ) : viewMode === 'LIST' ? (
                <table className="w-full text-left text-[11px]">
                  <thead className="text-sky-500/40 uppercase font-black border-b border-sky-500/10">
                    <tr>
                      <th className="pb-2 font-black">Name</th>
                      <th className="pb-2 font-black">Modified</th>
                      <th className="pb-2 font-black">Size</th>
                      <th className="pb-2 font-black">Rights</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-500/5">
                    {files.map(file => (
                      <tr 
                        key={file.name} 
                        onClick={() => file.type === 'FOLDER' ? handleNavigate(file.name) : setSelectedFile(file)}
                        className={`group hover:bg-sky-500/5 cursor-pointer transition-all ${selectedFile?.name === file.name ? 'bg-sky-500/10' : ''}`}
                      >
                        <td className="py-3 flex items-center gap-3 font-bold text-sky-100 group-hover:text-white">
                          {getFileIcon(file.name, file.type)}
                          {file.name}
                        </td>
                        <td className="py-3 text-sky-500/40">{file.modified}</td>
                        <td className="py-3 text-sky-500/40">{file.size || '--'}</td>
                        <td className="py-3 font-mono text-sky-700">{file.permissions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {files.map(file => (
                     <div 
                       key={file.name}
                       onClick={() => file.type === 'FOLDER' ? handleNavigate(file.name) : setSelectedFile(file)}
                       className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer group ${selectedFile?.name === file.name ? 'bg-sky-500/20 border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'bg-slate-900/20 border-sky-500/5 hover:border-sky-500/20 hover:bg-sky-500/5'}`}
                     >
                        <div className="w-12 h-12 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                           {/* Fix: cast element to any to resolve property 'size' lookup error on ReactElement */}
                           {React.cloneElement(getFileIcon(file.name, file.type) as React.ReactElement<any>, { size: 32 })}
                        </div>
                        <span className="text-[10px] font-bold text-sky-100 text-center truncate w-full group-hover:text-white">{file.name}</span>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>

        {/* FILE DETAILS PANEL */}
        {selectedFile && (
          <div className="w-72 border-l border-sky-500/10 bg-slate-950/40 p-6 animate-in slide-in-from-right flex flex-col gap-6">
             <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 bg-sky-500/10 rounded-2xl border border-sky-500/20 flex items-center justify-center shadow-lg">
                   {/* Fix: cast element to any to resolve property 'size' lookup error on ReactElement */}
                   {React.cloneElement(getFileIcon(selectedFile.name, selectedFile.type) as React.ReactElement<any>, { size: 40 })}
                </div>
                <div>
                   <h3 className="text-sm font-black text-white truncate w-48">{selectedFile.name}</h3>
                   <span className="text-[9px] text-sky-500/40 uppercase tracking-widest font-black">Official_Data_Record</span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="bg-slate-900/60 p-3 rounded border border-sky-500/10">
                   <div className="flex items-center gap-2 mb-2">
                      <Info size={12} className="text-sky-500/40" />
                      <span className="text-[9px] font-black uppercase text-sky-500/40 tracking-widest">File_Attributes</span>
                   </div>
                   <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="opacity-40">Size:</span><span className="font-bold">{selectedFile.size}</span></div>
                      <div className="flex justify-between"><span className="opacity-40">Mod:</span><span className="font-bold">{selectedFile.modified}</span></div>
                      <div className="flex justify-between"><span className="opacity-40">Perm:</span><span className="font-mono text-sky-600">{selectedFile.permissions}</span></div>
                      <div className="flex justify-between"><span className="opacity-40">Mime:</span><span className="font-bold uppercase">{selectedFile.name.split('.').pop() || 'binary'}</span></div>
                   </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded border border-sky-500/10">
                   <span className="text-[9px] font-black uppercase text-sky-500/40 mb-2 block">Action_Center</span>
                   <div className="flex flex-col gap-2">
                      <button className="w-full py-3 bg-sky-500 text-black rounded font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg">
                          <Download size={14} /> Decrypt_&_Fetch
                      </button>
                      <button className="w-full py-3 bg-slate-900 border border-sky-500/20 text-sky-100 rounded font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-sky-500/10 transition-all">
                          <ShieldCheck size={14} /> Purge_Trace
                      </button>
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-4 border-t border-sky-500/10">
                <div className="text-[8px] text-sky-500/20 font-black uppercase tracking-[0.3em] leading-tight text-center">
                  Secure_Infiltration_Link_Active<br/>
                  Bridge_Protocol: SMB-S-X
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteExplorer;

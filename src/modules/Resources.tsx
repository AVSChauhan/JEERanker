import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Folder, FileText, ExternalLink, Download, Star, MoreVertical, BookOpen, Video, FileCode, X, Save } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Resources({ user }: { user: UserProfile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('warroom_resources');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Irodov Solutions - Mechanics', type: 'pdf', subject: 'Physics', size: '4.2 MB', starred: true },
      { id: '2', title: 'Organic Chemistry Roadmap', type: 'image', subject: 'Chemistry', size: '1.8 MB', starred: false },
      { id: '3', title: 'Calculus Cheat Sheet', type: 'pdf', subject: 'Maths', size: '0.5 MB', starred: true },
      { id: '4', title: 'Mock Test - Jan 2024', type: 'link', subject: 'Mock Tests', size: '-', starred: false },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('warroom_resources', JSON.stringify(resources));
  }, [resources]);
  const [isAdding, setIsAdding] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', type: 'pdf', subject: 'Physics' });

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStar = (id: string) => {
    setResources(resources.map(r => r.id === id ? { ...r, starred: !r.starred } : r));
  };

  const addResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title.trim()) return;

    const res = {
      id: Date.now().toString(),
      ...newResource,
      size: newResource.type === 'link' ? '-' : '0.1 MB',
      starred: false
    };

    setResources([res, ...resources]);
    setNewResource({ title: '', type: 'pdf', subject: 'Physics' });
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">Resource Vault</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vault..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-blue transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm"
          >
            <Plus size={18} />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Add Resource Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass-card p-8 border-neon-blue/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-display font-bold">Add to Vault</h4>
                <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addResource} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Resource Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                    placeholder="e.g. Physics Formula Sheet"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Type</label>
                    <select 
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                    >
                      <option value="pdf">PDF</option>
                      <option value="link">Link</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Subject</label>
                    <select 
                      value={newResource.subject}
                      onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Maths">Maths</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mock Tests">Mock Tests</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
                  Add to Vault
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 px-2">Categories</h4>
            <div className="space-y-1">
              {[
                { label: 'All Files', icon: Folder, count: resources.length },
                { label: 'Starred', icon: Star, count: resources.filter(r => r.starred).length },
                { label: 'PDFs', icon: FileText, count: resources.filter(r => r.type === 'pdf').length },
                { label: 'Links', icon: ExternalLink, count: resources.filter(r => r.type === 'link').length },
              ].map((cat) => (
                <button key={cat.label} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all group">
                  <div className="flex items-center gap-3">
                    <cat.icon size={16} className="group-hover:text-neon-blue transition-colors" />
                    <span>{cat.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/20">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 px-2">Storage</h4>
            <div className="px-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-white/40">Used</span>
                <span className="text-neon-blue">2.4 GB / 5 GB</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue w-[48%]" />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 grid grid-cols-12 gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <div className="col-span-6 px-2">Name</div>
            <div className="col-span-2">Subject</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right px-2">Action</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {filteredResources.map((res) => (
              <div key={res.id} className="grid grid-cols-12 gap-4 p-3 rounded-xl hover:bg-white/5 transition-all items-center group">
                <div className="col-span-6 flex items-center gap-4 px-2">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-neon-blue transition-colors">
                    {res.type === 'pdf' ? <FileText size={20} /> : res.type === 'link' ? <ExternalLink size={20} /> : <BookOpen size={20} />}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold truncate">{res.title}</h5>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">{res.type}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{res.subject}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-mono text-white/20">{res.size}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2 px-2">
                  <button 
                    onClick={() => toggleStar(res.id)}
                    className={cn("p-2 transition-colors", res.starred ? "text-yellow-500" : "text-white/10 hover:text-white")}
                  >
                    <Star size={16} fill={res.starred ? "currentColor" : "none"} />
                  </button>
                  <button className="p-2 text-white/10 hover:text-white transition-colors">
                    <Download size={16} />
                  </button>
                  <button className="p-2 text-white/10 hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

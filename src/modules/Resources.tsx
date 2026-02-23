import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Folder, FileText, ExternalLink, Download, Star, MoreVertical, BookOpen, Video, FileCode } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Resources({ user }: { user: UserProfile }) {
  const [searchQuery, setSearchQuery] = useState('');

  const resources = [
    { id: '1', title: 'Irodov Solutions - Mechanics', type: 'pdf', subject: 'Physics', size: '4.2 MB', starred: true },
    { id: '2', title: 'Organic Chemistry Roadmap', type: 'image', subject: 'Chemistry', size: '1.8 MB', starred: false },
    { id: '3', title: 'Calculus Cheat Sheet', type: 'pdf', subject: 'Maths', size: '0.5 MB', starred: true },
    { id: '4', title: 'Mock Test - Jan 2024', type: 'link', subject: 'Mock Tests', size: '-', starred: false },
  ];

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
          <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm">
            <Plus size={18} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 px-2">Categories</h4>
            <div className="space-y-1">
              {[
                { label: 'All Files', icon: Folder, count: 124 },
                { label: 'Starred', icon: Star, count: 12 },
                { label: 'PDFs', icon: FileText, count: 45 },
                { label: 'Videos', icon: Video, count: 8 },
                { label: 'Code', icon: FileCode, count: 15 },
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
            {resources.map((res) => (
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
                  <button className={cn("p-2 transition-colors", res.starred ? "text-yellow-500" : "text-white/10 hover:text-white")}>
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

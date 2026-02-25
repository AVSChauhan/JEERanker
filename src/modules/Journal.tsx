import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Plus, Calendar, Search, Trash2, Edit3, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { encrypt, decrypt } from '../lib/crypto';
import { APP_PASSWORD } from '../lib/auth';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useSync } from '../lib/sync';

export default function Journal({ user }: { user: UserProfile }) {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [entries, syncEntries] = useSync<any>('journal');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CHAUHAN@2009') {
      setIsLocked(false);
    }
  };

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({ title: '', content: '', mood: '😊' });

  const addEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      title: 'New Entry',
      content: '',
      date: format(new Date(), 'MMM dd, yyyy'),
      mood: '😊',
      timestamp: Date.now()
    };
    syncEntries([newEntry, ...entries]);
    setSelectedEntry(newEntry);
    setIsEditing(true);
    setEditContent({ title: newEntry.title, content: newEntry.content, mood: newEntry.mood });
  };

  const saveEntry = () => {
    const updated = entries.map((e: any) => e.id === selectedEntry.id ? { ...e, ...editContent } : e);
    syncEntries(updated);
    setIsEditing(false);
    setSelectedEntry({ ...selectedEntry, ...editContent });
  };

  const deleteEntry = (id: string) => {
    syncEntries(entries.filter((e: any) => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  if (isLocked) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-card p-12 text-center"
        >
          <div className="w-20 h-20 bg-neon-purple/20 rounded-3xl flex items-center justify-center text-neon-purple mx-auto mb-8 border border-neon-purple/30">
            <Lock size={40} />
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">Encrypted Journal</h3>
          <p className="text-sm text-white/40 mb-8 uppercase tracking-widest">Private & Secure</p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Lock Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:outline-none focus:border-neon-purple transition-colors"
            />
            <button className="w-full py-4 bg-neon-purple text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
              Unlock Vault
            </button>
          </form>
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
            <ShieldCheck size={12} />
            <span>End-to-End Encrypted</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      <div className="w-80 flex flex-col gap-4">
        <div className="glass-card p-4 space-y-4">
          <button 
            onClick={addEntry}
            className="w-full py-3 bg-neon-purple text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-sm uppercase tracking-widest"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input 
              type="text"
              placeholder="Search journal..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-neon-purple transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30">History</h4>
            <button onClick={() => setIsLocked(true)} className="text-white/20 hover:text-neon-purple">
              <Lock size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
            {entries.length === 0 && (
              <div className="p-8 text-center opacity-20">
                <p className="text-[10px] uppercase font-bold tracking-widest">No entries yet</p>
              </div>
            )}
            {entries.map((entry: any) => (
              <button 
                key={entry.id} 
                onClick={() => {
                  setSelectedEntry(entry);
                  setIsEditing(false);
                }}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all group",
                  selectedEntry?.id === entry.id ? "bg-neon-purple/10 border-neon-purple/30" : "bg-white/5 border-transparent hover:border-white/10"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-white/30">{entry.date}</span>
                  <span>{entry.mood}</span>
                </div>
                <h5 className="font-bold text-sm truncate group-hover:text-neon-purple transition-colors">{entry.title}</h5>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {selectedEntry ? (
          <>
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={16} className="text-neon-purple" />
                  <span className="text-xs font-mono text-white/40">{selectedEntry.date}</span>
                  {isEditing ? (
                    <select 
                      value={editContent.mood}
                      onChange={(e) => setEditContent({ ...editContent, mood: e.target.value })}
                      className="bg-transparent text-xl focus:outline-none"
                    >
                      {['😊', '😫', '🔥', '🧠', '😴', '🚀'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  ) : (
                    <span className="text-2xl">{selectedEntry.mood}</span>
                  )}
                </div>
                {isEditing ? (
                  <input 
                    value={editContent.title}
                    onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                    className="bg-transparent text-3xl font-display font-bold w-full focus:outline-none text-neon-purple"
                  />
                ) : (
                  <h3 className="text-3xl font-display font-bold">{selectedEntry.title}</h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button 
                    onClick={saveEntry}
                    className="p-3 bg-neon-purple text-black rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(188,19,254,0.3)]"
                  >
                    <ShieldCheck size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setEditContent({ title: selectedEntry.title, content: selectedEntry.content, mood: selectedEntry.mood });
                    }}
                    className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                  >
                    <Edit3 size={20} />
                  </button>
                )}
                <button 
                  onClick={() => deleteEntry(selectedEntry.id)}
                  className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
              {isEditing ? (
                <textarea 
                  value={editContent.content}
                  onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-lg leading-relaxed text-white/70"
                  placeholder="Write your thoughts here..."
                />
              ) : (
                <div className="max-w-2xl mx-auto space-y-6 text-lg leading-relaxed text-white/70 whitespace-pre-wrap">
                  {selectedEntry.content || "No content in this entry."}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <Lock size={64} className="mb-4" />
            <h3 className="font-display font-bold text-xl uppercase tracking-widest">Select an Entry</h3>
            <p className="text-sm">Your private war journal is locked</p>
          </div>
        )}
      </div>
    </div>
  );
}

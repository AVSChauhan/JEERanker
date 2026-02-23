import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Plus, Calendar, Search, Trash2, Edit3, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Journal({ user }: { user: UserProfile }) {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('warroom_journal');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '2024-03-20', title: 'Feeling Burnt Out', content: 'Today was tough. Rotational motion is killing me. Need to take a break.', mood: '😫' },
      { id: '2', date: '2024-03-19', title: 'Mock Test Success', content: 'Scored 260! Finally seeing progress in Maths.', mood: '🔥' },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('warroom_journal', JSON.stringify(entries));
  }, [entries]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CHAUHAN@2009') {
      setIsLocked(false);
    }
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
          <button className="w-full py-3 bg-neon-purple text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-sm uppercase tracking-widest">
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
            {entries.map((entry) => (
              <button key={entry.id} className="w-full text-left p-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all group">
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
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={16} className="text-neon-purple" />
              <span className="text-xs font-mono text-white/40">March 20, 2024</span>
              <span className="text-2xl">😫</span>
            </div>
            <h3 className="text-3xl font-display font-bold">Feeling Burnt Out</h3>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
              <Edit3 size={20} />
            </button>
            <button className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6 text-lg leading-relaxed text-white/70">
            <p>Today was tough. Rotational motion is killing me. I spent 4 hours on a single problem set and still couldn't get the torque calculations right.</p>
            <p>I feel like I'm falling behind GN. They finished the entire module while I'm stuck here. Need to talk to them tomorrow and maybe do a shared session on this topic.</p>
            <p>Note to self: Take a break. JEE is a marathon, not a sprint. Don't let one bad day break the streak.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

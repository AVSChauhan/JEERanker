import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Target, Handshake, CheckCircle2, XCircle, Info, Edit2, X, Save } from 'lucide-react';
import { UserProfile, StudyPact } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function StudyPactModule({ user }: { user: UserProfile }) {
  const [pact, setPact] = useState<StudyPact>(() => {
    const saved = localStorage.getItem('warroom_pact');
    return saved ? JSON.parse(saved) : {
      id: '1',
      goal: 'Clear JEE Advanced with <1000 Rank',
      minHoursPerDay: 10,
      weeklyTarget: 70,
      penalty: 'No Gaming for 1 Week + 100 Pushups',
      startDate: Date.now(),
      active: true
    };
  });

  React.useEffect(() => {
    localStorage.setItem('warroom_pact', JSON.stringify(pact));
  }, [pact]);
  const [isEditing, setIsEditing] = useState(false);
  const [editPact, setEditPact] = useState({ ...pact });

  const handleSave = () => {
    setPact(editPact);
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">The Blood Pact</h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all"
          >
            <Edit2 size={18} />
          </button>
          <div className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Shield size={12} />
            Binding Agreement
          </div>
        </div>
      </div>

      {/* Edit Pact Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass-card p-8 border-red-500/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-display font-bold">Rewrite the Pact</h4>
                <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ultimate Goal</label>
                  <input 
                    type="text"
                    value={editPact.goal}
                    onChange={(e) => setEditPact({ ...editPact, goal: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Daily Hours</label>
                    <input 
                      type="number"
                      value={editPact.minHoursPerDay}
                      onChange={(e) => setEditPact({ ...editPact, minHoursPerDay: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Weekly Target</label>
                    <input 
                      type="number"
                      value={editPact.weeklyTarget}
                      onChange={(e) => setEditPact({ ...editPact, weeklyTarget: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">The Penalty</label>
                  <textarea 
                    value={editPact.penalty}
                    onChange={(e) => setEditPact({ ...editPact, penalty: e.target.value })}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Seal the Pact
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
                <Handshake size={32} />
              </div>
              <div>
                <h4 className="text-xl font-display font-bold">{pact.goal}</h4>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Active Since {new Date(pact.startDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Daily Commitment</p>
                <p className="text-3xl font-display font-bold">{pact.minHoursPerDay} <span className="text-sm text-white/40">Hours</span></p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Weekly Target</p>
                <p className="text-3xl font-display font-bold">{pact.weeklyTarget} <span className="text-sm text-white/40">Hours</span></p>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3 mb-2 text-red-400">
                <AlertTriangle size={18} />
                <h5 className="text-xs font-bold uppercase tracking-widest">Penalty for Breach</h5>
              </div>
              <p className="text-sm text-white/70 italic">"{pact.penalty}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Pact History</h4>
              <div className="space-y-4">
                {[
                  { week: 'Week 12', status: 'success', hours: 72 },
                  { week: 'Week 11', status: 'success', hours: 70.5 },
                  { week: 'Week 10', status: 'failed', hours: 64 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      {item.status === 'success' ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                      <span className="text-sm font-bold">{item.week}</span>
                    </div>
                    <span className="text-xs font-mono text-white/40">{item.hours}h</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Shared Review</h4>
              <div className="space-y-4">
                <div className="p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl">
                  <p className="text-xs text-neon-blue font-bold mb-2">Next Review: Sunday 21:00</p>
                  <p className="text-[10px] text-white/50 leading-relaxed">Both users must confirm hours to finalize the weekly pact status.</p>
                </div>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all">
                  Initiate Review
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-neon-blue/20">
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-neon-blue" />
              <h4 className="font-bold text-sm uppercase tracking-widest">Pact Progress</h4>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="440" strokeDashoffset="110" className="text-neon-blue" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">75%</span>
                  <span className="text-[8px] uppercase tracking-widest text-white/30">This Week</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-white/40">AV Progress</span>
                <span className="text-neon-blue">52.5 / 70h</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-blue w-[75%]" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-white/40">GN Progress</span>
                <span className="text-neon-purple">58 / 70h</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-neon-purple w-[82%]" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info size={18} className="text-white/30" />
              <h4 className="font-bold text-xs uppercase tracking-widest text-white/40">Pact Rules</h4>
            </div>
            <ul className="space-y-3 text-[10px] text-white/50 list-disc pl-4 leading-relaxed">
              <li>Minimum 10 hours must be logged daily.</li>
              <li>Idle time &gt; 15 mins is auto-deducted.</li>
              <li>Weekly review is mandatory for both.</li>
              <li>Breach results in immediate penalty activation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

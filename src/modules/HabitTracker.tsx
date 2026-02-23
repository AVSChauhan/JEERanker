import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Flame, CheckCircle2, Circle, Trophy, Calendar, TrendingUp, X, Trash2 } from 'lucide-react';
import { UserProfile, Habit } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HabitTracker({ user }: { user: UserProfile }) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('warroom_habits');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Morning Revision', streak: 12, completedToday: true, history: {} },
      { id: '2', name: 'Solve 10 MCQ Physics', streak: 5, completedToday: false, history: {} },
      { id: '3', name: 'Meditation', streak: 21, completedToday: true, history: {} },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('warroom_habits', JSON.stringify(habits));
  }, [habits]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : Math.max(0, h.streak - 1) } : h
    ));
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      completedToday: false,
      history: {}
    };

    setHabits([...habits, habit]);
    setNewHabitName('');
    setIsAddingHabit(false);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">Habit Forge</h3>
        <button 
          onClick={() => setIsAddingHabit(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm"
        >
          <Plus size={18} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAddingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass-card p-8 border-neon-blue/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-display font-bold">Forge New Habit</h4>
                <button onClick={() => setIsAddingHabit(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addHabit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Habit Name</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g. Read 5 pages of NCERT"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </div>
                <button className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
                  Start Forging
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Daily Rituals</h4>
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    habit.completedToday ? "bg-green-500 text-black" : "bg-white/5 text-white/20 hover:text-white"
                  )}
                >
                  {habit.completedToday ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div>
                  <h5 className={cn("font-bold text-sm", habit.completedToday && "text-white/50")}>{habit.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <Flame size={12} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-500">{habit.streak} Day Streak</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2 h-6 rounded-full",
                        i === 6 ? (habit.completedToday ? "bg-green-500" : "bg-white/10") : "bg-green-500/40"
                      )} 
                    />
                  ))}
                </div>
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-neon-purple/5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <Trophy size={24} className="text-neon-purple" />
              <h4 className="font-bold text-sm uppercase tracking-widest">Consistency King</h4>
            </div>
            <div className="text-center py-4">
              <p className="text-4xl font-display font-bold text-neon-purple">94%</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mt-2">Weekly Completion</p>
            </div>
            <div className="mt-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-neon-purple w-[94%]" />
            </div>
          </div>

          <div className="glass-card p-6 border-neon-blue/20">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-neon-blue" />
              <h4 className="font-bold text-sm uppercase tracking-widest">Habit Analytics</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Longest Streak</span>
                <span className="font-mono font-bold text-neon-blue">42 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Total Check-ins</span>
                <span className="font-mono font-bold text-neon-blue">1,240</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Best Subject</span>
                <span className="font-mono font-bold text-neon-blue">Physics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

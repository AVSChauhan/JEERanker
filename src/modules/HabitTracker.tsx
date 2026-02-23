import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Flame, CheckCircle2, Circle, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { UserProfile, Habit } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function HabitTracker({ user }: { user: UserProfile }) {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Morning Revision', streak: 12, completedToday: true, history: {} },
    { id: '2', name: 'Solve 10 MCQ Physics', streak: 5, completedToday: false, history: {} },
    { id: '3', name: 'Meditation', streak: 21, completedToday: true, history: {} },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : h.streak - 1 } : h
    ));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">Habit Forge</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm">
          <Plus size={18} />
          <span>New Habit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Daily Rituals</h4>
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
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

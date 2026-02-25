import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  CheckSquare, 
  Flame, 
  Zap, 
  Eye,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useSync } from '../lib/sync';

export default function Dashboard({ user }: { user: UserProfile }) {
  const [tasks] = useSync<any>('tasks');
  const [habits] = useSync<any>('habits');
  const [blocks] = useSync<any>('blocks');
  const [pacts] = useSync<any>('pact');
  const [calendarEvents] = useSync<any>('calendar');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const pact = pacts[0] || { minHoursPerDay: 0, goal: 'No active pact' };

  const completedTasks = tasks.filter((t: any) => t.completed).length;
  const totalTasks = tasks.length;
  const habitStreak = habits.length > 0 ? Math.max(...habits.map((h: any) => h.streak)) : 0;
  
  const todayBlocks = blocks.filter((b: any) => b.date === format(new Date(), 'yyyy-MM-dd'));
  
  const upcomingReminders = calendarEvents
    .filter((e: any) => new Date(e.date) >= new Date())
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const studyHours = todayBlocks.reduce((acc: number, b: any) => {
    const start = parseInt(b.startTime.split(':')[0]);
    const end = parseInt(b.endTime.split(':')[0]);
    return acc + (end - start);
  }, 0);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Stats Row */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Study Hours', value: `${studyHours}h`, icon: Clock, color: 'text-neon-blue' },
          { label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, icon: CheckSquare, color: 'text-green-400' },
          { label: 'Best Streak', value: `${habitStreak} Days`, icon: Flame, color: 'text-orange-400' },
          { label: 'Focus Score', value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, icon: Zap, color: 'text-neon-purple' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 flex flex-col gap-2 hover:border-white/20 transition-all cursor-default group">
            <stat.icon size={20} className={cn(stat.color, "group-hover:scale-110 transition-transform")} />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Timer Widget */}
      <div className="glass-card p-6 flex flex-col justify-between border-neon-blue/20">
        <div className="flex justify-between items-start">
          <h3 className="font-display font-bold text-lg">Active Focus</h3>
          <div className="flex items-center gap-2 px-2 py-1 bg-neon-blue/10 text-neon-blue rounded-lg text-[10px] font-bold uppercase tracking-widest">
            <div className={cn("w-1.5 h-1.5 rounded-full bg-neon-blue", isActive && "animate-pulse")} />
            {isActive ? 'Live' : 'Idle'}
          </div>
        </div>
        <div className="text-center py-4">
          <span className="text-5xl font-mono font-bold tracking-tighter neon-text">
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleTimer}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2",
              isActive ? "bg-white/10 text-white hover:bg-white/20" : "bg-neon-blue text-black hover:bg-white"
            )}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
            {isActive ? 'PAUSE' : 'START'}
          </button>
          <button 
            onClick={resetTimer}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="md:col-span-2 space-y-6">
        {/* Schedule Preview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">War Plan: Today</h3>
          </div>
          <div className="space-y-3">
            {todayBlocks.length === 0 && (
              <div className="p-8 text-center opacity-20">
                <p className="text-[10px] uppercase font-bold tracking-widest">No sessions planned for today</p>
              </div>
            )}
            {todayBlocks.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                <div className="w-16 text-center">
                  <p className="text-[10px] text-white/40 font-mono">{item.startTime}</p>
                  <p className="text-[10px] text-white/20 font-mono">{item.endTime}</p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex-1">
                  <p className="font-bold text-sm group-hover:text-neon-blue transition-colors">{item.subject}</p>
                  <p className="text-xs text-white/50">{item.topic}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 rounded bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/40">
                    {item.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Chart Placeholder */}
        <div className="glass-card p-6 h-64 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Productivity Index</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <div className="w-2 h-2 rounded-full bg-neon-blue" />
                <span>AV</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <div className="w-2 h-2 rounded-full bg-neon-purple" />
                <span>GN</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-2 px-2">
            {[40, 70, 45, 90, 65, 80, 55, 85, 40, 60, 75, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col gap-1 items-center group">
                <div 
                  className="w-full bg-neon-blue/20 rounded-t-sm group-hover:bg-neon-blue/40 transition-all relative"
                  style={{ height: `${h}%` }}
                >
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}%
                   </div>
                </div>
                <span className="text-[8px] text-white/20 font-mono">{i + 1}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Widgets */}
      <div className="space-y-6">
        {/* Partner Status */}
        <div className="glass-card p-6 border-neon-purple/20">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
            <Target size={20} className="text-neon-purple" />
            Partner Sync
          </h3>
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-neon-purple/20 flex items-center justify-center font-bold text-xl text-neon-purple border border-neon-purple/30">
                {user.id === 'AV' ? 'G' : 'A'}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-4 border-dark-bg" />
            </div>
            <div>
              <p className="font-bold text-lg">{user.id === 'AV' ? 'GN' : 'AV'}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-green-400 font-medium tracking-wide">Connected</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                <span className="text-white/40">Goal Progress</span>
                <span className="text-neon-purple">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  className="h-full bg-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.5)]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Quote */}
        <div className="glass-card p-6 bg-gradient-to-br from-neon-blue/5 to-transparent">
          <TrendingUp size={24} className="text-neon-blue mb-4" />
          <p className="text-sm italic leading-relaxed text-white/80 mb-4">
            "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will."
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">— Vince Lombardi</p>
        </div>

        {/* Upcoming Reminders */}
        <div className="glass-card p-6 border-neon-blue/20">
          <h3 className="font-display font-bold text-sm uppercase tracking-widest text-neon-blue mb-6 flex items-center gap-2">
            <CalendarIcon size={16} />
            Upcoming Reminders
          </h3>
          <div className="space-y-4">
            {upcomingReminders.length === 0 && (
              <p className="text-[10px] text-white/30 text-center py-4">No upcoming events</p>
            )}
            {upcomingReminders.map((event: any) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className={cn(
                  "w-1 h-8 rounded-full",
                  event.type === 'test' ? "bg-red-500" :
                  event.type === 'deadline' ? "bg-orange-500" :
                  "bg-neon-blue"
                )} />
                <div>
                  <p className="text-xs font-bold">{event.title}</p>
                  <p className="text-[10px] text-white/40">{format(new Date(event.date), 'MMM do')} • {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pact Status */}
        <div className="glass-card p-6 border-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-widest text-orange-400">Study Pact</h3>
            <CalendarIcon size={16} className="text-orange-400" />
          </div>
          <p className="text-xs text-white/60 mb-4">Goal: {pact.goal}</p>
          <div className="flex items-center justify-center py-2">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251" strokeDashoffset={251 - (251 * (pact.active ? 1 : 0))} className="text-orange-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold">{pact.active ? '100%' : '0%'}</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-white/40 mt-2 uppercase tracking-widest">{pact.active ? 'Pact is Secure' : 'No Active Pact'}</p>
        </div>
      </div>
    </div>
  );
}

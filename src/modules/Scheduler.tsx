import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, ChevronRight, Clock, MoreVertical, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { format, addDays, subDays, startOfDay, eachHourOfInterval, isSameDay } from 'date-fns';
import { ScheduleBlock, UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HOURS = eachHourOfInterval({
  start: startOfDay(new Date()),
  end: addDays(startOfDay(new Date()), 1)
}).slice(0, 24);

import { useSync } from '../lib/sync';

export default function Scheduler({ user }: { user: UserProfile }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, syncBlocks] = useSync<ScheduleBlock>('blocks');
  const [isAdding, setIsAdding] = useState(false);
  const [newBlock, setNewBlock] = useState({ title: '', startTime: '09:00', endTime: '10:00', subject: 'Physics' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current time
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const hour = now.getHours();
      const scrollPos = hour * 80; // 80px per hour
      scrollRef.current.scrollTop = scrollPos - 100;
    }
  }, []);

  const timeToPosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h * 80) + (m / 60 * 80);
  };

  const durationToHeight = (start: string, end: string) => {
    return Math.max(40, timeToPosition(end) - timeToPosition(start));
  };

  const addBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.title.trim()) return;

    const block: ScheduleBlock = {
      id: Date.now().toString(),
      ...newBlock,
      date: format(currentDate, 'yyyy-MM-dd'),
      completed: false
    };

    syncBlocks([...blocks, block]);
    setNewBlock({ title: '', startTime: '09:00', endTime: '10:00', subject: 'Physics' });
    setIsAdding(false);
  };

  const toggleBlock = (id: string) => {
    const updatedBlocks = blocks.map(b => b.id === id ? { ...b, completed: !b.completed } : b);
    syncBlocks(updatedBlocks);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h3 className="font-display font-bold text-xl">{format(currentDate, 'EEEE, MMM do')}</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Daily War Plan</p>
          </div>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm"
        >
          <Plus size={18} />
          <span>Add Block</span>
        </button>
      </div>

      {/* Add Block Modal */}
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
                <h4 className="text-xl font-display font-bold">Plan New Block</h4>
                <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addBlock} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Block Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newBlock.title}
                    onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                    placeholder="e.g. Solve Irodov Mechanics"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Start Time</label>
                    <input 
                      type="time"
                      value={newBlock.startTime}
                      onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">End Time</label>
                    <input 
                      type="time"
                      value={newBlock.endTime}
                      onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Subject</label>
                  <select 
                    value={newBlock.subject}
                    onChange={(e) => setNewBlock({ ...newBlock, subject: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Maths">Maths</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <button className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
                  Commit to Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Timeline Container */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative p-4 custom-scrollbar">
          {/* Current Time Indicator */}
          {isSameDay(currentDate, new Date()) && (
            <div 
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: timeToPosition(format(new Date(), 'HH:mm')) + 16 }}
            >
              <div className="w-full h-px bg-neon-blue shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
              <div className="absolute right-0 bg-neon-blue text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                NOW
              </div>
            </div>
          )}

          {/* Hour Grid */}
          {HOURS.map((hour, i) => (
            <div key={i} className="h-20 border-t border-white/5 flex gap-4">
              <span className="w-12 text-[10px] font-mono text-white/30 pt-1">
                {format(hour, 'HH:mm')}
              </span>
              <div className="flex-1 relative" />
            </div>
          ))}

          {/* Blocks Layer */}
          <div className="absolute top-4 left-20 right-4 bottom-4 pointer-events-none">
            {blocks.filter(b => b.date === format(currentDate, 'yyyy-MM-dd')).map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => toggleBlock(block.id)}
                className={cn(
                  "absolute left-0 right-0 rounded-xl p-3 border pointer-events-auto cursor-pointer group transition-all",
                  block.completed 
                    ? "bg-green-500/10 border-green-500/30 opacity-60" 
                    : "bg-neon-blue/10 border-neon-blue/30 hover:border-neon-blue/60"
                )}
                style={{
                  top: timeToPosition(block.startTime),
                  height: durationToHeight(block.startTime, block.endTime)
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neon-blue mb-1">
                      {block.subject}
                    </p>
                    <h4 className="font-bold text-sm leading-tight">{block.title}</h4>
                  </div>
                  {block.completed && <CheckCircle2 size={14} className="text-green-500" />}
                </div>
                <div className="mt-auto flex items-center justify-between text-[10px] text-white/40">
                  <div className="flex items-center gap-2">
                    <Clock size={10} />
                    <span>{block.startTime} - {block.endTime}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-2 h-2 rounded-full bg-neon-blue" />
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
          </div>
          <p className="text-xs font-mono text-white/40">
            Total Planned: <span className="text-white font-bold">
              {(blocks.filter(b => b.date === format(currentDate, 'yyyy-MM-dd')).length * 2).toFixed(1)}h
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

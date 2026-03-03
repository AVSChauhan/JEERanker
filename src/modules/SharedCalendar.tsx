import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Bell, X, Save, Trash2, Lock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useFirestore } from '../lib/firestore';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'test' | 'event' | 'deadline';
  description?: string;
  isShared?: boolean;
  subject?: string;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  convertToBlock?: boolean;
}

export default function SharedCalendar({ user, isStealthMode }: { user: UserProfile, isStealthMode?: boolean }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: events, addItem, deleteItem } = useFirestore<CalendarEvent>('calendar');
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    type: 'event',
    isShared: true,
    subject: 'physics',
    recurring: 'none',
    convertToBlock: false
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Calculate upcoming deadlines and exams
  const upcomingImportant = events
    .filter(e => (e.type === 'test' || e.type === 'deadline') && new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date!,
      time: newEvent.time!,
      type: newEvent.type as any,
      description: newEvent.description,
      isShared: newEvent.isShared,
      subject: newEvent.subject,
      recurring: newEvent.recurring,
      convertToBlock: newEvent.convertToBlock
    };

    await addItem(event);
    setIsAdding(false);
    setNewEvent({ 
      title: '', 
      date: format(new Date(), 'yyyy-MM-dd'), 
      time: '10:00', 
      type: 'event',
      isShared: true,
      subject: 'physics',
      recurring: 'none',
      convertToBlock: false
    });
  };

  const deleteEvent = async (id: string) => {
    await deleteItem(id);
    setSelectedEvent(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-display font-bold text-2xl tracking-tight">
            {isStealthMode ? 'Study Calendar' : 'War Calendar'}
          </h3>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 text-sm font-bold min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm"
        >
          <Plus size={18} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 flex flex-col bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          <div className="grid grid-cols-7 gap-px bg-white/10 border-b border-white/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-dark-bg p-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">
                {day}
              </div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 gap-px bg-white/10 overflow-y-auto custom-scrollbar">
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={i} 
                  onClick={() => {
                    setNewEvent({ ...newEvent, date: format(day, 'yyyy-MM-dd') });
                    setIsAdding(true);
                  }}
                  className={cn(
                    "min-h-[120px] bg-dark-bg p-2 transition-colors hover:bg-white/5 cursor-pointer",
                    !isCurrentMonth && "opacity-40"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full",
                      isToday && "bg-neon-blue text-black"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => {
                      let subjectColor = "bg-neon-blue/10 border-neon-blue/30 text-neon-blue";
                      if (event.subject === 'math') subjectColor = "bg-neon-purple/10 border-neon-purple/30 text-neon-purple";
                      if (event.subject === 'chemistry') subjectColor = "bg-green-500/10 border-green-500/30 text-green-400";

                      return (
                        <div 
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          className={cn(
                            "text-[9px] p-1.5 rounded border truncate cursor-pointer hover:scale-105 transition-transform flex items-center justify-between",
                            event.type === 'test' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                            event.type === 'deadline' ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                            subjectColor
                          )}
                        >
                          <span>{event.title}</span>
                          {!event.isShared && <Lock size={8} className="opacity-50" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="glass-card p-6 border-red-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-red-400" />
              <h4 className="font-bold text-sm uppercase tracking-widest">Upcoming Deadlines</h4>
            </div>
            <div className="space-y-4">
              {upcomingImportant.length > 0 ? upcomingImportant.map(event => {
                const daysLeft = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return (
                  <div key={event.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        event.type === 'test' ? "text-red-400" : "text-orange-400"
                      )}>
                        {event.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-white/40">
                        {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                      </span>
                    </div>
                    <p className="text-sm font-bold mb-1">{event.title}</p>
                    <p className="text-xs text-white/40">{format(new Date(event.date), 'MMM do')} at {event.time}</p>
                  </div>
                );
              }) : (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                  <p className="text-xs text-white/40">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass-card p-8 border-white/10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block",
                      selectedEvent.type === 'test' ? "bg-red-500/20 text-red-400" :
                      selectedEvent.type === 'deadline' ? "bg-orange-500/20 text-orange-400" :
                      "bg-neon-blue/20 text-neon-blue"
                    )}>
                      {selectedEvent.type}
                    </div>
                    {!selectedEvent.isShared && (
                      <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/60 flex items-center gap-1">
                        <Lock size={10} /> Private
                      </div>
                    )}
                  </div>
                  <h4 className="text-2xl font-display font-bold">{selectedEvent.title}</h4>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white/60">
                  <CalendarIcon size={18} />
                  <span className="text-sm">{format(new Date(selectedEvent.date), 'EEEE, MMMM do')}</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Clock size={18} />
                  <span className="text-sm">{selectedEvent.time}</span>
                </div>
                {selectedEvent.description && (
                  <div className="p-4 bg-white/5 rounded-xl text-sm text-white/70 leading-relaxed">
                    {selectedEvent.description}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className="flex-1 py-3 bg-red-500/10 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Event</span>
                </button>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
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
                <h4 className="text-xl font-display font-bold">
                  {isStealthMode ? 'New Event' : 'New Strategic Event'}
                </h4>
                <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addEvent} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Event Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g. Full Syllabus Mock Test"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Date</label>
                    <input 
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Time</label>
                    <input 
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Type</label>
                  <div className="flex gap-2">
                    {['event', 'test', 'deadline'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewEvent({ ...newEvent, type: type as any })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all",
                          newEvent.type === type 
                            ? "bg-neon-blue/20 border-neon-blue text-neon-blue" 
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Subject</label>
                    <select 
                      value={newEvent.subject}
                      onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors text-white"
                    >
                      <option value="physics" className="bg-dark-bg">Physics</option>
                      <option value="chemistry" className="bg-dark-bg">Chemistry</option>
                      <option value="math" className="bg-dark-bg">Mathematics</option>
                      <option value="general" className="bg-dark-bg">General</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Recurring</label>
                    <select 
                      value={newEvent.recurring}
                      onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors text-white"
                    >
                      <option value="none" className="bg-dark-bg">Does not repeat</option>
                      <option value="daily" className="bg-dark-bg">Daily</option>
                      <option value="weekly" className="bg-dark-bg">Weekly</option>
                      <option value="monthly" className="bg-dark-bg">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Description / Notes</label>
                  <textarea 
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Add notes, links, or details..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold">Share with Partner</span>
                    <input 
                      type="checkbox" 
                      checked={newEvent.isShared}
                      onChange={(e) => setNewEvent({ ...newEvent, isShared: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-neon-blue focus:ring-neon-blue focus:ring-offset-dark-bg"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-bold">Convert to Schedule Block</span>
                    <input 
                      type="checkbox" 
                      checked={newEvent.convertToBlock}
                      onChange={(e) => setNewEvent({ ...newEvent, convertToBlock: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-neon-blue focus:ring-neon-blue focus:ring-offset-dark-bg"
                    />
                  </label>
                </div>

                <button type="submit" className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
                  Save Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

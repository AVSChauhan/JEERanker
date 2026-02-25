import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Bell, X, Save, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useSync } from '../lib/sync';
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
}

export default function SharedCalendar({ user, isStealthMode }: { user: UserProfile, isStealthMode?: boolean }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, syncEvents] = useSync<CalendarEvent>('calendar');
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    type: 'event'
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date!,
      time: newEvent.time!,
      type: newEvent.type as any,
      description: newEvent.description
    };

    syncEvents([...events, event]);
    setIsAdding(false);
    setNewEvent({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', type: 'event' });
  };

  const deleteEvent = (id: string) => {
    syncEvents(events.filter(e => e.id !== id));
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

      <div className="flex-1 grid grid-cols-7 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-white/5 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/40">
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={i} 
              className={cn(
                "min-h-[120px] bg-dark-bg/40 p-2 transition-colors hover:bg-white/5",
                !isCurrentMonth && "opacity-20"
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
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                    className={cn(
                      "text-[9px] p-1.5 rounded border truncate cursor-pointer hover:scale-105 transition-transform",
                      event.type === 'test' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      event.type === 'deadline' ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                      "bg-neon-blue/10 border-neon-blue/30 text-neon-blue"
                    )}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
                  <div className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-block mb-2",
                    selectedEvent.type === 'test' ? "bg-red-500/20 text-red-400" :
                    selectedEvent.type === 'deadline' ? "bg-orange-500/20 text-orange-400" :
                    "bg-neon-blue/20 text-neon-blue"
                  )}>
                    {selectedEvent.type}
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
                <button className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, MoreVertical, CheckCircle2, Circle, Clock, Tag, Share2, Trash2, X } from 'lucide-react';
import { Task, UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useSync } from '../lib/sync';

export default function Tasks({ user }: { user: UserProfile }) {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [tasks, syncTasks] = useSync<Task>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', subject: 'Physics', priority: 'medium' as const });

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTaskStatus = (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'done' ? 'todo' : 'done' };
      }
      return t;
    });
    syncTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    syncTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      subject: newTask.subject,
      priority: newTask.priority,
      status: 'todo',
      estimatedMinutes: 60,
      isShared: false,
    };

    syncTasks([...tasks, task]);
    setNewTask({ title: '', subject: 'Physics', priority: 'medium' });
    setIsAddingTask(false);
  };

  const columns = [
    { id: 'todo', label: 'To Do', color: 'bg-white/10' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-neon-blue/20' },
    { id: 'done', label: 'Completed', color: 'bg-green-500/20' },
  ];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-display font-bold text-2xl tracking-tight">Task Planner</h3>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button 
              onClick={() => setView('list')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                view === 'list' ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              List
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                view === 'kanban' ? "bg-white text-black" : "text-white/40 hover:text-white"
              )}
            >
              Kanban
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-blue transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-sm"
          >
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md glass-card p-8 border-neon-blue/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-display font-bold">Create New Task</h4>
                <button onClick={() => setIsAddingTask(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Task Title</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="What needs to be done?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Subject</label>
                    <select 
                      value={newTask.subject}
                      onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Maths">Maths</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm">
                  Add Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      {view === 'list' ? (
        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {filteredTasks.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                <CheckCircle2 size={48} className="mb-4" />
                <p className="text-sm uppercase tracking-widest font-bold">No tasks found</p>
              </div>
            )}
            
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group"
              >
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className="text-white/20 hover:text-neon-blue transition-colors"
                >
                  {task.status === 'done' ? <CheckCircle2 size={22} className="text-green-500" /> : <Circle size={22} />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                      task.priority === 'high' ? "bg-red-500/20 text-red-400" :
                      task.priority === 'medium' ? "bg-orange-500/20 text-orange-400" :
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      {task.priority}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{task.subject}</span>
                  </div>
                  <h4 className={cn("font-bold text-sm", task.status === 'done' && "line-through text-white/30")}>
                    {task.title}
                  </h4>
                </div>

                <div className="flex items-center gap-6">
                  {task.isShared && <Share2 size={14} className="text-neon-blue" />}
                  <div className="flex items-center gap-2 text-[10px] text-white/30">
                    <Clock size={12} />
                    <span>{task.estimatedMinutes}m</span>
                  </div>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", col.color)} />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">{col.label}</h4>
                </div>
                <span className="text-[10px] font-mono text-white/20">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 glass-card bg-white/[0.02] p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {tasks.filter(t => t.status === col.id).map((task) => (
                  <motion.div
                    key={task.id}
                    layoutId={task.id}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neon-blue">{task.subject}</span>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        task.priority === 'high' ? "bg-red-500" :
                        task.priority === 'medium' ? "bg-orange-500" :
                        "bg-blue-500"
                      )} />
                    </div>
                    <h5 className="text-sm font-bold mb-4 leading-snug">{task.title}</h5>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <Clock size={12} />
                        <span>{task.estimatedMinutes}m</span>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="text-white/20 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

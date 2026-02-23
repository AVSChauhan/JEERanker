import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Folder, FileText, Pin, MoreVertical, Share2, Trash2, ChevronRight } from 'lucide-react';
import { Note, UserProfile } from '../types';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Notes({ user }: { user: UserProfile }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const folders = ['General', 'Physics', 'Chemistry', 'Maths', 'Mock Analysis'];

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Sidebar: Folders & List */}
      <div className="w-80 flex flex-col gap-4 h-full">
        <div className="glass-card p-4 flex flex-col gap-4">
          <button className="w-full py-3 bg-neon-blue text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-sm uppercase tracking-widest">
            <Plus size={18} />
            <span>New Note</span>
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-neon-blue transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Folders</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {folders.map((folder) => (
              <button 
                key={folder}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all group"
              >
                <Folder size={16} className="group-hover:text-neon-blue transition-colors" />
                <span>{folder}</span>
                <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
            
            <div className="mt-6 p-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4 px-1">Recent Notes</h4>
              <div className="space-y-2">
                {notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selectedNote?.id === note.id 
                        ? "bg-neon-blue/10 border-neon-blue/30" 
                        : "bg-white/5 border-transparent hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-bold text-xs truncate flex-1">{note.title}</h5>
                      {note.isShared && <Share2 size={10} className="text-neon-blue" />}
                    </div>
                    <p className="text-[10px] text-white/30 truncate">{note.content.substring(0, 40)}...</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neon-blue">{selectedNote.subject}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{selectedNote.folder}</span>
                </div>
                <h3 className="text-2xl font-display font-bold">{selectedNote.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white/30 hover:text-white transition-colors">
                  <Pin size={20} />
                </button>
                <button className="p-2 text-white/30 hover:text-white transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 size={20} />
                </button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button className="p-2 text-white/30 hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <FileText size={64} className="mb-4" />
            <h3 className="font-display font-bold text-xl uppercase tracking-widest">Select a Note</h3>
            <p className="text-sm">Capture your JEE insights and analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Folder, FileText, Pin, MoreVertical, Share2, Trash2, ChevronRight, Save, X } from 'lucide-react';
import { Note, UserProfile } from '../types';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Notes({ user }: { user: UserProfile }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('warroom_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Rotational Dynamics Summary', content: '# Rotational Dynamics\n\nKey formulas:\n- Torque: $\\tau = r \\times F$\n- Angular Momentum: $L = I\\omega$\n- Moment of Inertia for a disc: $I = \\frac{1}{2}MR^2$', folder: 'Physics', subject: 'Physics', lastModified: Date.now(), isPinned: true, isShared: true },
      { id: '2', title: 'Organic Chemistry Roadmap', content: '## Reaction Mechanisms\n1. SN1 vs SN2\n2. E1 vs E2\n3. Nucleophilic Addition', folder: 'Chemistry', subject: 'Chemistry', lastModified: Date.now() - 86400000, isPinned: false, isShared: false },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('warroom_notes', JSON.stringify(notes));
  }, [notes]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({ title: '', content: '', folder: 'General' });

  const folders = ['General', 'Physics', 'Chemistry', 'Maths', 'Mock Analysis'];

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      folder: 'General',
      subject: 'General',
      lastModified: Date.now(),
      isPinned: false,
      isShared: false
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditContent({ title: newNote.title, content: newNote.content, folder: newNote.folder });
  };

  const saveNote = () => {
    if (!selectedNote) return;
    const updatedNotes = notes.map(n => {
      if (n.id === selectedNote.id) {
        return { ...n, ...editContent, lastModified: Date.now() };
      }
      return n;
    });
    setNotes(updatedNotes);
    setIsEditing(false);
    setSelectedNote({ ...selectedNote, ...editContent });
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Sidebar: Folders & List */}
      <div className="w-80 flex flex-col gap-4 h-full">
        <div className="glass-card p-4 flex flex-col gap-4">
          <button 
            onClick={startNewNote}
            className="w-full py-3 bg-neon-blue text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-sm uppercase tracking-widest"
          >
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
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      selectedNote?.id === note.id 
                        ? "bg-neon-blue/10 border-neon-blue/30" 
                        : "bg-white/5 border-transparent hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-bold text-xs truncate flex-1">{note.title}</h5>
                      {note.isPinned && <Pin size={10} className="text-neon-blue fill-neon-blue" />}
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
              <div className="flex-1">
                {isEditing ? (
                  <input 
                    value={editContent.title}
                    onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                    className="bg-transparent text-2xl font-display font-bold w-full focus:outline-none text-neon-blue"
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neon-blue">{selectedNote.subject}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{selectedNote.folder}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold">{selectedNote.title}</h3>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button 
                      onClick={saveNote}
                      className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all text-xs"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-white/30 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setIsEditing(true);
                        setEditContent({ title: selectedNote.title, content: selectedNote.content, folder: selectedNote.folder });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                    >
                      Edit
                    </button>
                    <button className="p-2 text-white/30 hover:text-white transition-colors">
                      <Pin size={20} className={selectedNote.isPinned ? "text-neon-blue fill-neon-blue" : ""} />
                    </button>
                    <button 
                      onClick={() => deleteNote(selectedNote.id)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button className="p-2 text-white/30 hover:text-white transition-colors">
                      <Share2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isEditing ? (
                <textarea 
                  value={editContent.content}
                  onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                  className="w-full h-full bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
                  placeholder="Write your notes in Markdown..."
                />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              )}
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

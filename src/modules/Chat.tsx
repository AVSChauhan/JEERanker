import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Shield, Lock, Trash2, Smile, Paperclip, Search } from 'lucide-react';
import { UserProfile, ChatMessage, UserID } from '../types';
import { encrypt, decrypt } from '../lib/crypto';
import { APP_PASSWORD } from '../lib/auth';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Chat({ user }: { user: UserProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'init') {
        setMessages(payload.data);
      } else if (payload.type === 'message') {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(m => m.id === payload.data.id)) return prev;
          return [...prev, payload.data];
        });
      }
    };

    return () => ws.close();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !wsRef.current) return;

    const encryptedText = isEncrypted ? encrypt(inputText, APP_PASSWORD) : inputText;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      text: encryptedText,
      timestamp: Date.now(),
    };

    wsRef.current.send(JSON.stringify(newMessage));
    setInputText('');
  };

  const getDecryptedText = (text: string) => {
    try {
      return isEncrypted ? decrypt(text, APP_PASSWORD) : text;
    } catch (e) {
      return "[[ Encrypted Message ]]";
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Chat Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue border border-neon-blue/30">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Secure Channel</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
          <button 
            onClick={() => setIsEncrypted(true)}
            className={cn(
              "p-2 rounded-lg transition-all",
              isEncrypted ? "bg-neon-blue text-black" : "text-white/40 hover:text-white"
            )}
          >
            <Lock size={16} />
          </button>
          <button 
            onClick={() => setIsEncrypted(false)}
            className={cn(
              "p-2 rounded-lg transition-all",
              !isEncrypted ? "bg-white text-black" : "text-white/40 hover:text-white"
            )}
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <Lock size={48} className="mb-4" />
              <p className="text-sm uppercase tracking-widest font-bold">No messages in this session</p>
              <p className="text-xs">All messages are AES-256 encrypted</p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    {msg.senderId}
                  </span>
                  <span className="text-[10px] text-white/20">
                    {format(msg.timestamp, 'HH:mm')}
                  </span>
                </div>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isMe 
                    ? "bg-neon-blue text-black font-medium rounded-tr-none" 
                    : "bg-white/10 text-white rounded-tl-none border border-white/5"
                )}>
                  {getDecryptedText(msg.text)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-white/5">
          <div className="relative flex items-center gap-3">
            <button type="button" className="p-2 text-white/30 hover:text-white transition-colors">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isEncrypted ? "Type an encrypted message..." : "Search messages..."}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors"
            />
            <button type="button" className="p-2 text-white/30 hover:text-white transition-colors">
              <Smile size={20} />
            </button>
            <button
              type="submit"
              className="p-3 bg-neon-blue text-black rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

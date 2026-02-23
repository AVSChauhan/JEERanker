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

import { useSync } from '../lib/sync';

import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

export default function Chat({ user }: { user: UserProfile }) {
  const [messages, syncMessages] = useSync<ChatMessage>('chat');
  const [inputText, setInputText] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');

    // 1. Send user message
    const encryptedText = isEncrypted ? encrypt(textToSend, APP_PASSWORD) : textToSend;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      text: encryptedText,
      timestamp: Date.now(),
    };
    syncMessages(userMsg);

    // 2. If research mode, trigger AI with grounding
    if (isResearchMode) {
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: textToSend,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are a JEE Research Assistant. Provide accurate information using Google Search grounding. Format your response in Markdown."
          },
        });

        const aiText = response.text || "I couldn't find any information on that.";
        const encryptedAiText = isEncrypted ? encrypt(aiText, APP_PASSWORD) : aiText;
        
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'AI_ORACLE' as any,
          text: encryptedAiText,
          timestamp: Date.now(),
        };
        syncMessages(aiMsg);
      } catch (error) {
        console.error("AI Error:", error);
      } finally {
        setIsGenerating(false);
      }
    }
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
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsResearchMode(!isResearchMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
              isResearchMode 
                ? "bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            )}
          >
            <Brain size={14} />
            <span>Research Mode</span>
          </button>
          
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
              <Eye size={16} />
            </button>
          </div>
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
            const isAI = msg.senderId === 'AI_ORACLE';
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
                    {isAI ? 'ORACLE' : isMe ? 'You' : 'Partner'}
                  </span>
                  <span className="text-[10px] text-white/20">
                    {format(msg.timestamp, 'HH:mm')}
                  </span>
                </div>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                  isAI ? "bg-neon-purple/10 border border-neon-purple/30 text-white markdown-body" :
                  isMe 
                    ? "bg-neon-blue text-black font-medium rounded-tr-none" 
                    : "bg-white/10 text-white rounded-tl-none border border-white/5"
                )}>
                  {isAI ? (
                    <ReactMarkdown>{getDecryptedText(msg.text)}</ReactMarkdown>
                  ) : (
                    getDecryptedText(msg.text)
                  )}
                </div>
              </motion.div>
            );
          })}
          {isGenerating && (
            <div className="flex items-center gap-3 text-neon-purple animate-pulse p-4">
              <Brain size={16} className="animate-bounce" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Oracle is researching...</span>
            </div>
          )}
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

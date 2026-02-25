import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Shield, Lock, Trash2, Smile, Paperclip, Search, Brain, Eye } from 'lucide-react';
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

export default function Chat({ user, isStealthMode }: { user: UserProfile, isStealthMode?: boolean }) {
  const [messages, syncMessages] = useSync<ChatMessage>('chat');
  const [inputText, setInputText] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setError(null);
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
    const updatedMessages = [...messages, userMsg];
    syncMessages(updatedMessages);

    // 2. If research mode, trigger AI with grounding
    if (isResearchMode) {
      setIsGenerating(true);
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("Gemini API Key is missing. Please check environment variables.");
        }
        const ai = new GoogleGenAI({ apiKey });
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
        syncMessages([...updatedMessages, aiMsg]);
      } catch (err: any) {
        console.error("AI Error:", err);
        setError(err.message || "Failed to generate AI response.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      syncMessages([]);
    }
  };

  const getDecryptedText = (text: string) => {
    try {
      return isEncrypted ? decrypt(text, APP_PASSWORD) : text;
    } catch (e) {
      return "[[ Encrypted Message ]]";
    }
  };

  if (isStealthMode) {
    return (
      <div className="h-full flex flex-col bg-[#f8f9fa] text-[#202124] rounded-2xl overflow-hidden border border-gray-200 shadow-xl relative">
        {/* Fake Browser Header */}
        <div className="bg-[#dee1e6] p-2 flex items-center gap-2 border-b border-gray-300">
          <div className="flex gap-1.5 px-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 bg-white rounded-full px-4 py-1 text-[10px] text-gray-500 flex items-center gap-2 border border-gray-300">
            <Lock size={10} className="text-green-600" />
            <span>https://docs.google.com/document/d/1xJ...</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Fake Documentation Sidebar */}
          <div className="w-48 bg-[#f1f3f4] border-r border-gray-200 p-4 space-y-4 hidden md:block">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-5/6" />
              <div className="h-2 bg-gray-200 rounded w-4/6" />
            </div>
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          </div>

          {/* Chat Embedded in "Document" */}
          <div className="flex-1 flex flex-col bg-white relative">
            <div className="p-8 max-w-2xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar" ref={scrollRef}>
              <h1 className="text-3xl font-serif mb-8 text-gray-800 border-b pb-4">Strategic Research Analysis</h1>
              
              <div className="space-y-8">
                {messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  const isAI = msg.senderId === 'AI_ORACLE';
                  return (
                    <div key={msg.id} className={cn(
                      "flex flex-col",
                      isMe ? "items-end" : "items-start"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {isAI ? 'SYSTEM_REF' : isMe ? 'AUTHOR' : 'CONTRIBUTOR'}
                        </span>
                      </div>
                      <div className={cn(
                        "max-w-[90%] p-4 rounded-lg text-sm leading-relaxed shadow-sm border",
                        isAI ? "bg-blue-50 border-blue-100 text-blue-900" :
                        isMe ? "bg-gray-50 border-gray-200 text-gray-800" :
                        "bg-white border-gray-200 text-gray-800"
                      )}>
                        {isAI ? (
                          <ReactMarkdown>{getDecryptedText(msg.text)}</ReactMarkdown>
                        ) : (
                          getDecryptedText(msg.text)
                        )}
                      </div>
                    </div>
                  );
                })}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-blue-500 animate-pulse italic text-xs">
                    <Search size={14} />
                    <span>Indexing resources...</span>
                  </div>
                )}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Hidden Input Area (Looks like a comment box) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Add a comment or search documentation..."
                  className="flex-1 bg-white border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors">
                  POST
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Fake Footer */}
        <div className="bg-[#f1f3f4] p-1 px-4 text-[9px] text-gray-400 border-t border-gray-200 flex justify-between">
          <span>Page 1 of 12 • 4,231 words</span>
          <span>Last edit was 2 minutes ago</span>
        </div>
      </div>
    );
  }

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

          <button 
            onClick={clearChat}
            className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-red-400 transition-all border border-white/10"
          >
            <Trash2 size={18} />
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

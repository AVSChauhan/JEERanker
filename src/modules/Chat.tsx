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

import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { StreamChat, Channel as StreamChannel, MessageResponse } from 'stream-chat';
import {
  Chat as StreamChatUI,
  Channel as StreamChannelUI,
  Window,
  MessageList,
  MessageInput,
  Thread,
  ChannelHeader,
  useChatContext,
  MessageSimple,
  MessageText,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

const STREAM_API_KEY = (import.meta as any).env.VITE_STREAM_API_KEY;

const CustomMessage = (props: any) => {
  const { message } = props;
  const isAI = message.user?.id === 'AI_ORACLE' || (message as any).isAI;
  
  // Decrypt the message text
  const getDecryptedText = (text: string, msgCustom?: any) => {
    try {
      const shouldDecrypt = msgCustom?.isEncrypted ?? true;
      return shouldDecrypt ? decrypt(text, APP_PASSWORD) : text;
    } catch (e) {
      return "[[ Encrypted Message ]]";
    }
  };

  const decryptedText = getDecryptedText(message.text || '', message);

  if (isAI) {
    return (
      <div className="flex flex-col mb-4 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={12} className="text-neon-purple" />
          <span className="text-[10px] font-bold text-neon-purple uppercase tracking-widest">Oracle Research</span>
        </div>
        <div className="bg-neon-purple/10 border border-neon-purple/30 p-4 rounded-2xl text-sm leading-relaxed text-white markdown-body">
          <ReactMarkdown>{decryptedText}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return <MessageSimple {...props} message={{ ...message, text: decryptedText }} />;
};

const CustomMessageInput = ({ isEncrypted, isResearchMode, setIsGenerating, setError, user }: any) => {
  const { channel } = useChatContext();
  const [text, setText] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !channel) return;

    const originalText = text;
    setText('');

    try {
      const encryptedText = isEncrypted ? encrypt(originalText, APP_PASSWORD) : originalText;
      await channel.sendMessage({
        text: encryptedText,
        isEncrypted,
        senderName: user.displayName
      } as any);

      if (isResearchMode) {
        setIsGenerating(true);
        try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error("Gemini API Key is missing.");
          
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: originalText,
            config: {
              tools: [{ googleSearch: {} }],
              systemInstruction: "You are a JEE Research Assistant. Provide accurate information using Google Search grounding. Format your response in Markdown."
            },
          });

          const aiText = response.text || "I couldn't find any information on that.";
          const encryptedAiText = isEncrypted ? encrypt(aiText, APP_PASSWORD) : aiText;
          
          await channel.sendMessage({
            text: encryptedAiText,
            user_id: 'AI_ORACLE',
            isAI: true,
            isEncrypted
          } as any);
        } catch (err: any) {
          console.error("AI Error:", err);
          setError(err.message || "Failed to generate AI response.");
        } finally {
          setIsGenerating(false);
        }
      }
    } catch (err) {
      console.error("Send Error:", err);
      setError("Failed to send message.");
    }
  };

  return (
    <div className="p-4 border-t border-white/10 bg-white/5">
      <form onSubmit={handleSend} className="relative flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isEncrypted ? "Type an encrypted message..." : "Type a message..."}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-blue transition-colors text-white"
        />
        <button
          type="submit"
          className="p-3 bg-neon-blue text-black rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(0,242,255,0.3)]"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default function Chat({ user, isStealthMode }: { user: UserProfile, isStealthMode?: boolean }) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [streamMessages, setStreamMessages] = useState<MessageResponse[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Stream Chat
  useEffect(() => {
    const initChat = async () => {
      if (!STREAM_API_KEY) {
        setError("Stream API Key is missing. Please check environment variables.");
        return;
      }

      const chatClient = StreamChat.getInstance(STREAM_API_KEY);
      
      try {
        // Get token from our backend
        const response = await fetch('/api/chat/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        
        const { token } = await response.json();
        
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.displayName,
            image: `https://getstream.io/random_png/?name=${user.displayName}`,
          },
          token
        );

        const newChannel = chatClient.channel('messaging', 'warroom-main', {
          name: 'Warroom Strategic Channel',
          members: [user.id], // In a real app, you'd add the partner's ID too
        } as any);

        await newChannel.watch();
        
        setClient(chatClient);
        setChannel(newChannel);

        // For Stealth Mode: listen for new messages
        newChannel.on('message.new', (event) => {
          if (event.message) {
            setStreamMessages(prev => [...prev, event.message as MessageResponse]);
          }
        });

        // Initial messages for Stealth Mode
        const state = newChannel.state;
        setStreamMessages(state.messages as any as MessageResponse[]);

      } catch (err: any) {
        console.error("Stream Init Error:", err);
        setError("Failed to connect to chat service.");
      }
    };

    initChat();

    return () => {
      if (client) client.disconnectUser();
    };
  }, [user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamMessages, isGenerating]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !channel) return;

    setError(null);
    const textToSend = inputText;
    setInputText('');

    // 1. Send user message via Stream
    const encryptedText = isEncrypted ? encrypt(textToSend, APP_PASSWORD) : textToSend;
    
    try {
      await channel.sendMessage({
        text: encryptedText,
        isEncrypted,
        senderName: user.displayName
      } as any);

      // 2. If research mode, trigger AI
      if (isResearchMode) {
        setIsGenerating(true);
        try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error("Gemini API Key is missing.");
          
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
          
          await channel.sendMessage({
            text: encryptedAiText,
            user_id: 'AI_ORACLE',
            isAI: true,
            isEncrypted
          } as any);
        } catch (err: any) {
          console.error("AI Error:", err);
          setError(err.message || "Failed to generate AI response.");
        } finally {
          setIsGenerating(false);
        }
      }
    } catch (err) {
      console.error("Send Error:", err);
      setError("Failed to send message.");
    }
  };

  const clearChat = async () => {
    if (confirm('Are you sure you want to clear all messages? This will truncate the channel for everyone.')) {
      try {
        if (channel) await channel.truncate();
        setStreamMessages([]);
      } catch (err) {
        setError("Failed to clear chat.");
      }
    }
  };

  const getDecryptedText = (text: string, msgCustom?: any) => {
    try {
      // Use the encryption flag from the message itself if available, otherwise fallback to global state
      const shouldDecrypt = msgCustom?.isEncrypted ?? isEncrypted;
      return shouldDecrypt ? decrypt(text, APP_PASSWORD) : text;
    } catch (e) {
      return "[[ Encrypted Message ]]";
    }
  };

  if (!client || !channel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Initializing Secure Channel...</p>
          {error && <p className="text-red-400 text-[10px] mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (isStealthMode) {
    // ... (rest of stealth mode UI remains same but uses streamMessages)
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
                {streamMessages.map((msg) => {
                  const isMe = msg.user?.id === user.id;
                  const isAI = msg.user?.id === 'AI_ORACLE' || (msg as any).isAI;
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
                          <ReactMarkdown>{getDecryptedText(msg.text || '', msg)}</ReactMarkdown>
                        ) : (
                          getDecryptedText(msg.text || '', msg)
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
    <div className="h-full flex flex-col gap-6 stream-chat-container">
      <style>{`
        .stream-chat-container .str-chat {
          --str-chat__primary-color: #00f2ff;
          --str-chat__active-primary-color: #ffffff;
          --str-chat__surface-color: rgba(255, 255, 255, 0.05);
          --str-chat__secondary-surface-color: rgba(255, 255, 255, 0.1);
          --str-chat__own-message-background-color: #00f2ff;
          --str-chat__other-message-background-color: rgba(255, 255, 255, 0.1);
          --str-chat__message-text-color: #ffffff;
          --str-chat__own-message-text-color: #000000;
          --str-chat__border-radius-circle: 12px;
          --str-chat__font-family: 'Inter', sans-serif;
        }
        .str-chat__container {
          background: transparent;
        }
        .str-chat__main-panel {
          padding: 0;
        }
        .str-chat__list {
          background: transparent;
        }
        .str-chat__message-input {
          background: rgba(255, 255, 255, 0.05);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

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
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Powered by Stream SDK</span>
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

      {/* Stream Chat UI */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col relative">
        <StreamChatUI client={client} theme="str-chat__theme-dark">
          <StreamChannelUI channel={channel} Message={CustomMessage}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <CustomMessageInput 
                isEncrypted={isEncrypted} 
                isResearchMode={isResearchMode} 
                setIsGenerating={setIsGenerating}
                setError={setError}
                user={user}
              />
            </Window>
            <Thread />
          </StreamChannelUI>
        </StreamChatUI>
      </div>
    </div>
  );
}

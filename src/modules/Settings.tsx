import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Bell, Moon, Database, LogOut, ChevronRight, Zap, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Settings({ 
  user, 
  isStealthMode, 
  setIsStealthMode 
}: { 
  user: UserProfile; 
  isStealthMode: boolean; 
  setIsStealthMode: (val: boolean) => void;
}) {
  const [notifications, setNotifications] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const sections = [
    {
      title: 'Personalization',
      items: [
        { id: 'profile', label: 'Profile Settings', icon: User, value: user.displayName },
        { id: 'appearance', label: 'Appearance', icon: Moon, value: 'Dark Mode' },
        { id: 'stealth', label: 'Stealth Mode', icon: Shield, type: 'toggle', value: isStealthMode, setter: setIsStealthMode },
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'notifications', label: 'Push Notifications', icon: Bell, type: 'toggle', value: notifications, setter: setNotifications },
        { id: 'focus', label: 'Auto Focus Mode', icon: Zap, type: 'toggle', value: focusMode, setter: setFocusMode },
        { id: 'security', label: 'Security & Encryption', icon: Shield, value: 'AES-256 Active' },
      ]
    },
    {
      title: 'Data',
      items: [
        { id: 'storage', label: 'Cloud Storage', icon: Database, value: '2.4 MB / 5 GB' },
        { id: 'backup', label: 'Manual Backup', icon: Lock, value: 'Last: 2h ago' },
      ]
    }
  ];

  return (
    <div className="h-full max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">System Configuration</h3>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Build v1.0.42-stable</div>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ml-4">{section.title}</h4>
            <div className="glass-card overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-white/5 transition-all cursor-pointer group",
                    i !== section.items.length - 1 && "border-b border-white/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-neon-blue transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.label}</p>
                      {typeof item.value === 'string' && <p className="text-[10px] text-white/30 uppercase tracking-widest">{item.value}</p>}
                    </div>
                  </div>
                  
                  {item.type === 'toggle' ? (
                    <button 
                      onClick={() => item.setter?.(!item.value)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300",
                        item.value ? "bg-neon-blue" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-all duration-300",
                        item.value ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  ) : (
                    <ChevronRight size={18} className="text-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full p-4 glass-card border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-widest"
          >
            <LogOut size={18} />
            <span>Terminate Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}

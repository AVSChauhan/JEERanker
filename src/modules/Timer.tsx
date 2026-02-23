import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Zap, Target, Trophy, Settings, Volume2, VolumeX } from 'lucide-react';
import { UserProfile, StudySession } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TimerMode = 'pomodoro' | 'deep-work' | 'competitive';

export default function Timer({ user }: { user: UserProfile }) {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const modeConfigs = {
    'pomodoro': { time: 25 * 60, label: 'Pomodoro', color: 'text-neon-blue', bg: 'bg-neon-blue' },
    'deep-work': { time: 50 * 60, label: 'Deep Work', color: 'text-neon-purple', bg: 'bg-neon-purple' },
    'competitive': { time: 60 * 60, label: 'Competitive', color: 'text-orange-400', bg: 'bg-orange-400' },
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setSessionCount(prev => prev + 1);
    // Play sound if not muted
    if (!isMuted) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play();
    }
    // Log session to Firestore (mock for now)
    console.log('Session Complete');
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeConfigs[mode].time);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modeConfigs[newMode].time);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / modeConfigs[mode].time) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto gap-12">
      {/* Mode Selector */}
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
        {(Object.keys(modeConfigs) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === m ? "bg-white text-black" : "text-white/40 hover:text-white"
            )}
          >
            {modeConfigs[m].label}
          </button>
        ))}
      </div>

      {/* Main Timer Display */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/5"
          />
          <motion.circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="942"
            animate={{ strokeDashoffset: 942 - (942 * (100 - progress) / 100) }}
            className={modeConfigs[mode].color}
          />
        </svg>

        <div className="text-center z-10">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-mono font-bold tracking-tighter mb-2"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/30 font-display">
            {isActive ? 'Focusing...' : 'Ready to Start'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>

        <button 
          onClick={toggleTimer}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all neon-glow",
            modeConfigs[mode].bg,
            "text-black"
          )}
        >
          {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
        </button>

        <button 
          onClick={resetTimer}
          className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Stats & Competitive Info */}
      <div className="w-full grid grid-cols-3 gap-6">
        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-neon-blue mb-1">
            <Target size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sessions</span>
          </div>
          <p className="text-2xl font-bold">{sessionCount}</p>
        </div>
        
        <div className="glass-card p-4 text-center border-neon-purple/20">
          <div className="flex items-center justify-center gap-2 text-neon-purple mb-1">
            <Zap size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Focus Level</span>
          </div>
          <p className="text-2xl font-bold">Elite</p>
        </div>

        <div className="glass-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
            <Trophy size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Pact Rank</span>
          </div>
          <p className="text-2xl font-bold">#1</p>
        </div>
      </div>
    </div>
  );
}

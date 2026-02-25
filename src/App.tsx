import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  User as UserIcon,
  Flame,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Database,
  Shield,
  Brain,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import SharedCalendar from './modules/SharedCalendar';
import { UserID, UserProfile } from './types';
import { HARDCODED_USERS, APP_PASSWORD, getInitialProfile } from './lib/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: (name: string, id: UserID) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      if (username.trim()) {
        // Assign a random ID or based on name for demo, but allow custom name
        const id = username.toLowerCase().includes('av') ? 'AV' : 'GN';
        onLogin(username, id);
      } else {
        setError('Enter a valid username');
      }
    } else {
      setError('Invalid Access Code');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-10 relative z-10 border-white/10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center text-neon-blue mx-auto mb-4 border border-neon-blue/30">
            <Shield size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tighter">
            WAR<span className="text-neon-blue">ROOM</span>
          </h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold">Strategic Command OS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Agent Identity</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-neon-blue transition-all"
              placeholder="Enter your callsign..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Access Code</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-neon-blue transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-[10px] font-bold uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(0,242,255,0.2)]"
          >
            Initialize System
          </button>
        </form>
      </motion.div>
    </div>
  );
};

import Dashboard from './modules/Dashboard';
import Scheduler from './modules/Scheduler';
import Timer from './modules/Timer';
import Tasks from './modules/Tasks';
import Chat from './modules/Chat';
import Analytics from './modules/Analytics';
import Notes from './modules/Notes';
import HabitTracker from './modules/HabitTracker';
import StudyPact from './modules/StudyPact';
import PerformancePredictor from './modules/PerformancePredictor';
import SettingsModule from './modules/Settings';
import Resources from './modules/Resources';
import Journal from './modules/Journal';

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [logoPressTimer, setLogoPressTimer] = useState<NodeJS.Timeout | null>(null);

  // Load user and settings from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('warroom_user');
    const savedStealth = localStorage.getItem('warroom_stealth');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStealth) setIsStealthMode(JSON.parse(savedStealth));
  }, []);

  useEffect(() => {
    localStorage.setItem('warroom_stealth', JSON.stringify(isStealthMode));
  }, [isStealthMode]);

  const handleLogin = (name: string, id: UserID) => {
    const profile = getInitialProfile(id);
    profile.displayName = name;
    setUser(profile);
    localStorage.setItem('warroom_user', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('warroom_user');
  };

  const handleLogoMouseDown = () => {
    const timer = setTimeout(() => {
      setIsChatPopupOpen(true);
    }, 3000);
    setLogoPressTimer(timer);
  };

  const handleLogoMouseUp = () => {
    if (logoPressTimer) {
      clearTimeout(logoPressTimer);
      setLogoPressTimer(null);
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scheduler', label: isStealthMode ? 'Daily Schedule' : 'Day Scheduler', icon: Clock },
    { id: 'timer', label: 'Study Timer', icon: Zap },
    { id: 'calendar', label: isStealthMode ? 'Study Calendar' : 'War Calendar', icon: CalendarIcon },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'resources', label: isStealthMode ? 'Resources' : 'Vault', icon: Database },
    { id: 'journal', label: 'Journal', icon: Lock },
    { id: 'habits', label: isStealthMode ? 'Habit Tracker' : 'Habit Forge', icon: Flame },
    { id: 'pact', label: isStealthMode ? 'Study Commitment' : 'Study Pact', icon: Shield },
    { id: 'predictor', label: isStealthMode ? 'Performance' : 'Oracle Engine', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Hidden chat item
  const chatItem = { id: 'chat', label: 'Secret Chat', icon: MessageSquare };

  return (
    <div className={cn("flex h-screen bg-dark-bg text-white overflow-hidden transition-all duration-500", isFocusMode && "bg-black")}>
      {/* Sidebar */}
      {!isFocusMode && (
        <motion.aside 
          animate={{ width: isSidebarCollapsed ? 80 : 260 }}
          className="glass-card m-4 mr-0 flex flex-col border-r-0 rounded-r-none"
        >
          <div 
            className="p-6 flex items-center gap-3 cursor-pointer select-none"
            onMouseDown={handleLogoMouseDown}
            onMouseUp={handleLogoMouseUp}
            onMouseLeave={handleLogoMouseUp}
            onTouchStart={handleLogoMouseDown}
            onTouchEnd={handleLogoMouseUp}
          >
            <div className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="text-black" size={24} />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-display font-bold text-xl tracking-tighter">
                {isStealthMode ? 'STUDYBUDDY' : 'WARROOM'}
              </span>
            )}
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  activeTab === item.id 
                    ? "bg-neon-blue/10 text-neon-blue" 
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn(activeTab === item.id ? "text-neon-blue" : "group-hover:text-white")} />
                {!isSidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                {activeTab === item.id && !isSidebarCollapsed && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue" />
                )}
              </button>
            ))}

            {/* Secret Chat Tab (Removed from sidebar, now popup only) */}
          </nav>

          <div className="p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut size={20} />
              {!isSidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </motion.aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Focus Mode Toggle (Always Visible) */}
        <button 
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={cn(
            "absolute top-6 right-8 z-50 p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest",
            isFocusMode ? "bg-neon-blue text-black" : "bg-white/5 text-white/40 hover:text-white"
          )}
        >
          <Zap size={16} className={isFocusMode ? "animate-pulse" : ""} />
          <span>{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
        </button>

        {/* Header */}
        {!isFocusMode && (
          <header 
            className="h-20 flex items-center justify-between px-8 select-none"
            onMouseDown={handleLogoMouseDown}
            onMouseUp={handleLogoMouseUp}
            onMouseLeave={handleLogoMouseUp}
            onTouchStart={handleLogoMouseDown}
            onTouchEnd={handleLogoMouseUp}
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(!isSidebarCollapsed); }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-5 h-0.5 bg-white/50 mb-1" />
                <div className="w-5 h-0.5 bg-white/50 mb-1" />
                <div className="w-3 h-0.5 bg-white/50" />
              </button>
              <h2 className="text-xl font-display font-semibold capitalize">
                {isStealthMode && activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
              </h2>
            </div>

            <div className="flex items-center gap-4 mr-32">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                <Flame size={16} />
                <span className="text-sm font-bold">{user.streak}</span>
              </div>
              
              <div className="h-8 w-px bg-white/10 mx-2" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">{user.displayName}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Ranker Mode</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center font-bold text-neon-purple">
                  {user.avatar}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Content Area */}
        <div className={cn("flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar", isFocusMode && "pt-24")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'scheduler' && <Scheduler user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'timer' && <Timer user={user} />}
              {activeTab === 'calendar' && <SharedCalendar user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'tasks' && <Tasks user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'chat' && <Chat user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'notes' && <Notes user={user} />}
              {activeTab === 'resources' && <Resources user={user} />}
              {activeTab === 'journal' && <Journal user={user} />}
              {activeTab === 'habits' && <HabitTracker user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'pact' && <StudyPact user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'predictor' && <PerformancePredictor user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'analytics' && <Analytics user={user} isStealthMode={isStealthMode} />}
              {activeTab === 'settings' && <SettingsModule user={user} isStealthMode={isStealthMode} setIsStealthMode={setIsStealthMode} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chat Popup */}
        <AnimatePresence>
          {isChatPopupOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-4xl h-[80vh] glass-card flex flex-col border-neon-purple/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neon-purple/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neon-purple/20 rounded-lg flex items-center justify-center text-neon-purple border border-neon-purple/30">
                      <MessageSquare size={18} />
                    </div>
                    <h4 className="font-display font-bold uppercase tracking-widest text-sm">Secure Communication Channel</h4>
                  </div>
                  <button 
                    onClick={() => setIsChatPopupOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden p-6">
                  <Chat user={user} isStealthMode={isStealthMode} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}




// --- Main App ---

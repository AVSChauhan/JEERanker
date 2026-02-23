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
  Brain
} from 'lucide-react';
import { UserID, UserProfile } from './types';
import { HARDCODED_USERS, APP_PASSWORD, getInitialProfile } from './lib/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const LoginScreen = ({ onLogin }: { onLogin: (user: UserID) => void }) => {
  const [selectedUser, setSelectedUser] = useState<UserID | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === APP_PASSWORD) {
      if (selectedUser) onLogin(selectedUser);
    } else {
      setError('Invalid Access Code');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tighter">
            WAR<span className="text-neon-blue">ROOM</span>
          </h1>
          <p className="text-white/50 text-sm uppercase tracking-widest">JEE Buddy OS v1.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(HARDCODED_USERS) as UserID[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedUser(id)}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2",
                  selectedUser === id 
                    ? "bg-neon-blue/10 border-neon-blue neon-glow" 
                    : "bg-white/5 border-white/10 hover:border-white/30"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold">
                  {HARDCODED_USERS[id].avatar}
                </div>
                <span className="font-medium">{HARDCODED_USERS[id].name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/40 ml-1">Access Code</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!selectedUser}
            className="w-full py-4 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
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
  const [isChatUnlocked, setIsChatUnlocked] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Load user from local storage on mount (for persistence)
  useEffect(() => {
    const savedUser = localStorage.getItem('warroom_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (id: UserID) => {
    const profile = getInitialProfile(id);
    setUser(profile);
    localStorage.setItem('warroom_user', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('warroom_user');
  };

  const handleLogoTap = () => {
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (newCount === 3) {
      setIsChatUnlocked(!isChatUnlocked);
      setLogoTapCount(0);
    }
    setTimeout(() => setLogoTapCount(0), 1000);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scheduler', label: 'Day Scheduler', icon: Clock },
    { id: 'timer', label: 'Study Timer', icon: Zap },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'resources', label: 'Vault', icon: Database },
    { id: 'journal', label: 'Journal', icon: Lock },
    { id: 'habits', label: 'Habit Forge', icon: Flame },
    { id: 'pact', label: 'Study Pact', icon: Shield },
    { id: 'predictor', label: 'Oracle Engine', icon: Brain },
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
            onClick={handleLogoTap}
          >
            <div className="w-10 h-10 bg-neon-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="text-black" size={24} />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-display font-bold text-xl tracking-tighter">WARROOM</span>
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

            {/* Secret Chat Tab */}
            {isChatUnlocked && (
              <button
                onClick={() => setActiveTab(chatItem.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group border border-neon-purple/20 bg-neon-purple/5",
                  activeTab === chatItem.id 
                    ? "bg-neon-purple/20 text-neon-purple border-neon-purple/40" 
                    : "text-neon-purple/50 hover:bg-neon-purple/10 hover:text-neon-purple"
                )}
              >
                <chatItem.icon size={20} className={cn(activeTab === chatItem.id ? "text-neon-purple" : "group-hover:text-neon-purple")} />
                {!isSidebarCollapsed && <span className="font-medium text-sm">{chatItem.label}</span>}
              </button>
            )}
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
          <header className="h-20 flex items-center justify-between px-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="w-5 h-0.5 bg-white/50 mb-1" />
                <div className="w-5 h-0.5 bg-white/50 mb-1" />
                <div className="w-3 h-0.5 bg-white/50" />
              </button>
              <h2 className="text-xl font-display font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
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
              {activeTab === 'dashboard' && <Dashboard user={user} />}
              {activeTab === 'scheduler' && <Scheduler user={user} />}
              {activeTab === 'timer' && <Timer user={user} />}
              {activeTab === 'tasks' && <Tasks user={user} />}
              {activeTab === 'chat' && <Chat user={user} />}
              {activeTab === 'notes' && <Notes user={user} />}
              {activeTab === 'resources' && <Resources user={user} />}
              {activeTab === 'journal' && <Journal user={user} />}
              {activeTab === 'habits' && <HabitTracker user={user} />}
              {activeTab === 'pact' && <StudyPact user={user} />}
              {activeTab === 'predictor' && <PerformancePredictor user={user} />}
              {activeTab === 'analytics' && <Analytics user={user} />}
              {activeTab === 'settings' && <SettingsModule user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}




// --- Main App ---

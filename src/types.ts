export type UserID = 'AV' | 'GN';

export interface UserProfile {
  uid: string;
  id: UserID;
  displayName: string;
  avatar: string;
  streak: number;
  totalStudyHours: number;
  habits: Habit[];
  moodHistory: MoodEntry[];
  lastActive: number;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  history: Record<string, boolean>; // date string -> completed
}

export interface MoodEntry {
  date: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  note?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration: number; // minutes
  subject: string;
  type: 'pomodoro' | 'deep-work' | 'competitive';
  synced: boolean;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: number;
  estimatedMinutes?: number;
  isShared: boolean;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export interface ScheduleBlock {
  id: string;
  userId?: string;
  title: string;
  subject: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  date: string; // YYYY-MM-DD
  isShared?: boolean;
  completed: boolean;
}

export interface Note {
  id: string;
  userId?: string;
  title: string;
  content: string;
  subject: string;
  folder: string;
  isShared?: boolean;
  updatedAt?: number;
  lastModified?: number;
  isPinned?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: UserID;
  text: string; // Encrypted
  timestamp: number;
  reactions?: Record<string, string[]>;
}

export interface StudyPact {
  id: string;
  goal: string;
  minHoursPerDay: number;
  weeklyTarget: number;
  penalty: string;
  startDate: number;
  active: boolean;
}

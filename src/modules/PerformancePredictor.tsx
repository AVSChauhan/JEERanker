import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, TrendingUp, Target, Zap, AlertCircle, Sparkles, ChevronRight, Loader2, X } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PerformancePredictor({ user }: { user: UserProfile }) {
  const [mockScore, setMockScore] = useState(240);
  const [completion, setCompletion] = useState(85);
  const [studyHours, setStudyHours] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  // Simple prediction formula for demo
  const predictedPercentile = Math.min(99.99, (mockScore / 300 * 50) + (completion / 100 * 30) + (studyHours / 14 * 20)).toFixed(2);

  const generateAIReport = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As a JEE expert, analyze these stats for a student:
        - Mock Score: ${mockScore}/300
        - Syllabus Completion: ${completion}%
        - Study Hours: ${studyHours}h/day
        
        Provide a concise, high-impact study strategy to reach 99.9+ percentile. Include specific topics to focus on in Physics, Chemistry, and Maths. Use a professional, motivating tone.`,
      });
      setReport(response.text || "Failed to generate report.");
    } catch (error) {
      console.error(error);
      setReport("Error generating report. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">Oracle Engine</h3>
        <div className="px-3 py-1 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <Brain size={12} />
          AI Prediction Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Prediction Hero */}
          <div className="glass-card p-8 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-2">Predicted JEE Main Percentile</p>
              <h4 className="text-7xl font-display font-bold tracking-tighter neon-text mb-6">{predictedPercentile}</h4>
              
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-400" />
                  <span className="text-xs font-bold">+0.42% from last week</span>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <Target size={14} className="text-neon-blue" />
                  <span className="text-xs font-bold">Target: 99.95+</span>
                </div>
                <button 
                  onClick={generateAIReport}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-neon-purple text-black font-bold rounded-xl hover:bg-white transition-all text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>Generate AI Strategy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Input Controls */}
          <div className="glass-card p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8">Simulation Parameters</h4>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold">Average Mock Score (out of 300)</label>
                  <span className="text-neon-blue font-mono font-bold">{mockScore}</span>
                </div>
                <input 
                  type="range" min="0" max="300" value={mockScore} 
                  onChange={(e) => setMockScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neon-blue"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold">Syllabus Completion (%)</label>
                  <span className="text-neon-purple font-mono font-bold">{completion}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={completion} 
                  onChange={(e) => setCompletion(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold">Daily Study Hours</label>
                  <span className="text-orange-400 font-mono font-bold">{studyHours}h</span>
                </div>
                <input 
                  type="range" min="0" max="16" value={studyHours} 
                  onChange={(e) => setStudyHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={24} className="text-neon-blue" />
              <h4 className="font-bold text-sm uppercase tracking-widest">Weak Spots</h4>
            </div>
            <div className="space-y-4">
              {[
                { subject: 'Physics', topic: 'Rotational Motion', impact: 'High' },
                { subject: 'Maths', topic: 'Probability', impact: 'Medium' },
                { subject: 'Chemistry', topic: 'Ionic Equilibrium', impact: 'High' },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-default">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{item.subject}</span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
                      item.impact === 'High' ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                    )}>
                      {item.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm font-bold">{item.topic}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border-neon-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={20} className="text-neon-blue" />
              <h4 className="font-bold text-xs uppercase tracking-widest text-white/40">Oracle Insight</h4>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Based on your current trajectory, increasing study hours to <span className="text-neon-blue font-bold">12h</span> and focusing on <span className="text-neon-blue font-bold">Inorganic Chemistry</span> could boost your percentile by <span className="text-green-400 font-bold">0.85%</span>.
            </p>
          </div>
        </div>
      </div>

      {/* AI Report Modal */}
      <AnimatePresence>
        {report && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-2xl glass-card p-8 border-neon-purple/30 max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/40 backdrop-blur-md p-2 -m-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-neon-purple" />
                  <h4 className="text-xl font-display font-bold">AI Strategy Report</h4>
                </div>
                <button onClick={() => setReport(null)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                <Markdown>{report}</Markdown>
              </div>
              <button 
                onClick={() => setReport(null)}
                className="w-full mt-8 py-4 bg-neon-purple text-black font-bold rounded-xl hover:bg-white transition-all uppercase tracking-widest text-sm"
              >
                Understood, Let's Grind
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Target, PieChart, Activity, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Analytics({ user }: { user: UserProfile }) {
  const barCanvasRef = useRef<HTMLCanvasElement>(null);
  const pieCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Draw Bar Chart
    if (barCanvasRef.current) {
      const ctx = barCanvasRef.current.getContext('2d');
      if (ctx) {
        const data = [65, 80, 45, 90, 70, 85, 60];
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const width = barCanvasRef.current.width;
        const height = barCanvasRef.current.height;
        const barWidth = 40;
        const gap = 20;

        ctx.clearRect(0, 0, width, height);
        
        data.forEach((val, i) => {
          const x = 40 + i * (barWidth + gap);
          const barHeight = (val / 100) * (height - 60);
          
          // Gradient
          const grad = ctx.createLinearGradient(0, height - 40, 0, height - 40 - barHeight);
          grad.addColorStop(0, '#00f2ff22');
          grad.addColorStop(1, '#00f2ff');
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, height - 40 - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = '10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(labels[i], x + barWidth / 2, height - 20);
        });
      }
    }

    // Draw Pie Chart
    if (pieCanvasRef.current) {
      const ctx = pieCanvasRef.current.getContext('2d');
      if (ctx) {
        const data = [40, 30, 20, 10];
        const colors = ['#00f2ff', '#bc13fe', '#f27d26', '#10b981'];
        const centerX = pieCanvasRef.current.width / 2;
        const centerY = pieCanvasRef.current.height / 2;
        const radius = 80;

        let startAngle = 0;
        data.forEach((val, i) => {
          const sliceAngle = (val / 100) * 2 * Math.PI;
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.fillStyle = colors[i];
          ctx.fill();
          
          startAngle += sliceAngle;
        });

        // Inner hole for donut effect
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#0a0a0c';
        ctx.fill();
      }
    }
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl tracking-tight">Performance Intelligence</h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-white/40">
          <TrendingUp size={14} className="text-neon-blue" />
          <span>Efficiency +12.4% this week</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weekly Study Hours */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-neon-blue" />
              <h4 className="font-bold text-sm uppercase tracking-widest">Weekly Study Hours</h4>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] uppercase font-bold text-white/40 focus:outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <canvas ref={barCanvasRef} width={500} height={250} className="w-full h-64" />
        </div>

        {/* Subject Distribution */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-8">
            <PieChart size={20} className="text-neon-purple" />
            <h4 className="font-bold text-sm uppercase tracking-widest">Subject Distribution</h4>
          </div>
          <div className="relative">
            <canvas ref={pieCanvasRef} width={250} height={250} className="w-full h-48" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">124h</span>
              <span className="text-[8px] uppercase tracking-widest text-white/30">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {[
              { label: 'Physics', val: '40%', color: 'bg-neon-blue' },
              { label: 'Maths', val: '30%', color: 'bg-neon-purple' },
              { label: 'Chemistry', val: '20%', color: 'bg-orange-500' },
              { label: 'Mock Tests', val: '10%', color: 'bg-green-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  <span className="text-white/40">{item.label}</span>
                </div>
                <span>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Score Heatmap Placeholder */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="flex items-center gap-3 mb-8">
            <Activity size={20} className="text-green-400" />
            <h4 className="font-bold text-sm uppercase tracking-widest">Focus Intensity Heatmap</h4>
          </div>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 48 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "aspect-square rounded-sm transition-all hover:scale-110 cursor-help",
                  i % 5 === 0 ? "bg-green-500/80" : 
                  i % 3 === 0 ? "bg-green-500/40" : 
                  i % 2 === 0 ? "bg-green-500/20" : "bg-white/5"
                )}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-[8px] uppercase tracking-widest text-white/20">
            <span>Low</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white/5 rounded-sm" />
              <div className="w-2 h-2 bg-green-500/20 rounded-sm" />
              <div className="w-2 h-2 bg-green-500/40 rounded-sm" />
              <div className="w-2 h-2 bg-green-500/80 rounded-sm" />
            </div>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import type { StatItem } from '../../types';

interface StatCardProps {
  stat: StatItem;
  delay?: number;
}

const colorMap = {
  blue: {
    bg: 'bg-electric-blue/10',
    border: 'border-electric-blue/20',
    text: 'text-electric-blue',
    glow: 'shadow-electric-blue/10',
    icon: 'text-electric-blue',
  },
  cyan: {
    bg: 'bg-cyan/10',
    border: 'border-cyan/20',
    text: 'text-cyan',
    glow: 'shadow-cyan/10',
    icon: 'text-cyan',
  },
  purple: {
    bg: 'bg-purple/10',
    border: 'border-purple/20',
    text: 'text-purple',
    glow: 'shadow-purple/10',
    icon: 'text-purple',
  },
  emerald: {
    bg: 'bg-emerald/10',
    border: 'border-emerald/20',
    text: 'text-emerald',
    glow: 'shadow-emerald/10',
    icon: 'text-emerald',
  },
  amber: {
    bg: 'bg-amber/10',
    border: 'border-amber/20',
    text: 'text-amber',
    glow: 'shadow-amber/10',
    icon: 'text-amber',
  },
  rose: {
    bg: 'bg-rose/10',
    border: 'border-rose/20',
    text: 'text-rose',
    glow: 'shadow-rose/10',
    icon: 'text-rose',
  },
};

export default function StatCard({ stat, delay = 0 }: StatCardProps) {
  const colors = colorMap[stat.color];
  const countRef = useRef<HTMLSpanElement>(null);
  const Icon = stat.icon;

  useEffect(() => {
    const controls = animate(0, stat.value, {
      duration: 2,
      delay,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        if (countRef.current) {
          countRef.current.textContent = Math.round(v).toLocaleString();
        }
      },
    });

    return () => controls.stop();
  }, [stat.value, delay]);

  const trendPercent =
    stat.previousValue !== undefined && stat.previousValue > 0
      ? Math.round(((stat.value - stat.previousValue) / stat.previousValue) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl border border-white/10
        p-5 transition-all duration-300
        hover:border-white/20 hover:bg-white/[0.07]
        hover:shadow-lg hover:${colors.glow}
      `}
    >
      {/* Background icon */}
      <div className="absolute -right-4 -bottom-4 opacity-5">
        <Icon className="w-24 h-24" />
      </div>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-1">
            {stat.prefix && (
              <span className={`text-lg font-semibold ${colors.text}`}>
                {stat.prefix}
              </span>
            )}
            <span ref={countRef} className="text-3xl font-bold text-white">
              0
            </span>
            {stat.suffix && (
              <span className="text-sm text-slate-400 ml-0.5">
                {stat.suffix}
              </span>
            )}
          </div>
          {trendPercent !== null && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trendPercent >= 0 ? 'text-emerald' : 'text-rose'
            }`}>
              <span>{trendPercent >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trendPercent)}%</span>
              <span className="text-slate-500">vs last</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SecurityGaugeProps {
  score: number;
  grade: string;
  size?: number;
}

export const SecurityGauge: React.FC<SecurityGaugeProps> = ({ score, grade, size = 240 }) => {
  const [currentScore, setCurrentScore] = useState(0);
  
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getColorClass = () => {
    if (score >= 90) return { stroke: 'stroke-emerald-400', text: 'text-emerald-400', glow: 'glow-emerald' };
    if (score >= 70) return { stroke: 'stroke-cyan-400', text: 'text-cyan-400', glow: 'glow-cyan' };
    if (score >= 50) return { stroke: 'stroke-amber-400', text: 'text-amber-400', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]' };
    return { stroke: 'stroke-rose-500', text: 'text-rose-500', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]' };
  };

  const colors = getColorClass();

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-full bg-navy-900/50 ${colors.glow}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 drop-shadow-xl"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={colors.stroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Score</span>
        <div className="flex items-baseline">
          <span className={`text-6xl font-bold ${colors.text}`}>
            {Math.round(currentScore)}
          </span>
          <span className="text-2xl text-gray-500 ml-1">/100</span>
        </div>
        <div className={`mt-2 text-xl font-bold px-4 py-1 rounded-full bg-white/5 border border-white/10 ${colors.text}`}>
          Grade {grade}
        </div>
      </div>
    </div>
  );
};

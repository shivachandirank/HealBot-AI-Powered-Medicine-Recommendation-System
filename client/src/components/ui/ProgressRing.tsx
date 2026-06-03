import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export default function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  trackColor = 'rgba(255,255,255,0.05)',
  label,
  showValue = true,
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value, 0), max);

  const motionValue = useMotionValue(0);
  const dashOffset = useTransform(
    motionValue,
    [0, max],
    [circumference, circumference - (circumference * normalizedValue) / max]
  );

  const displayValue = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animVal = animate(motionValue, normalizedValue, {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    });

    const animDisplay = animate(displayValue, normalizedValue, {
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        if (displayRef.current) {
          displayRef.current.textContent = Math.round(v).toString();
        }
      },
    });

    return () => {
      animVal.stop();
      animDisplay.stop();
    };
  }, [normalizedValue, motionValue, displayValue]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{ strokeDashoffset: dashOffset }}
          className="drop-shadow-[0_0_6px_var(--tw-shadow-color)]"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span ref={displayRef} className="text-2xl font-bold text-white">
            0
          </span>
          {label && (
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

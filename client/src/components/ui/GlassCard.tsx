import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'strong' | 'subtle';
  glow?: 'blue' | 'purple' | 'cyan' | 'emerald' | 'none';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const glowColors = {
  blue: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  purple: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
  cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  none: '',
};

const variantClasses = {
  default: 'bg-white/5 backdrop-blur-xl border border-white/10',
  strong: 'bg-white/8 backdrop-blur-2xl border border-white/15',
  subtle: 'bg-white/[0.03] backdrop-blur-lg border border-white/[0.06]',
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function GlassCard({
  children,
  variant = 'default',
  glow = 'blue',
  hover = true,
  padding = 'md',
  className = '',
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        rounded-2xl
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${glow !== 'none' ? glowColors[glow] : ''}
        ${hover ? 'hover:border-white/20 hover:bg-white/[0.07]' : ''}
        transition-all duration-300
        ${className}
      `}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

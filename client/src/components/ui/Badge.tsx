import type { Severity } from '../../types';

interface BadgeProps {
  severity?: Severity;
  variant?: 'filled' | 'outline' | 'subtle';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const severityColors = {
  critical: {
    filled: 'bg-red-500 text-white',
    outline: 'border-red-500 text-red-400',
    subtle: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dot: 'bg-red-500',
  },
  high: {
    filled: 'bg-orange-500 text-white',
    outline: 'border-orange-500 text-orange-400',
    subtle: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    dot: 'bg-orange-500',
  },
  medium: {
    filled: 'bg-amber text-black',
    outline: 'border-amber text-amber',
    subtle: 'bg-amber/10 text-amber border border-amber/20',
    dot: 'bg-amber',
  },
  low: {
    filled: 'bg-emerald text-white',
    outline: 'border-emerald text-emerald',
    subtle: 'bg-emerald/10 text-emerald border border-emerald/20',
    dot: 'bg-emerald',
  },
  info: {
    filled: 'bg-electric-blue text-white',
    outline: 'border-electric-blue text-electric-blue',
    subtle: 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20',
    dot: 'bg-electric-blue',
  },
};

const methodColors: Record<string, string> = {
  GET: 'bg-emerald/10 text-emerald border border-emerald/20',
  POST: 'bg-electric-blue/10 text-electric-blue border border-electric-blue/20',
  PUT: 'bg-amber/10 text-amber border border-amber/20',
  PATCH: 'bg-purple/10 text-purple border border-purple/20',
  DELETE: 'bg-rose/10 text-rose border border-rose/20',
};

export default function Badge({
  severity,
  variant = 'subtle',
  children,
  size = 'sm',
  dot = false,
  className = '',
}: BadgeProps) {
  const colors = severity
    ? severityColors[severity]
    : { filled: 'bg-white/10 text-white', outline: 'border-white/30 text-white', subtle: 'bg-white/5 text-slate-300 border border-white/10', dot: 'bg-white' };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-full
        ${sizeClasses}
        ${variant === 'outline' ? `border ${colors.outline}` : colors[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      )}
      {children}
    </span>
  );
}

export function MethodBadge({
  method,
  className = '',
}: {
  method: string;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg
        ${methodColors[method] || 'bg-white/10 text-white'}
        ${className}
      `}
    >
      {method}
    </span>
  );
}

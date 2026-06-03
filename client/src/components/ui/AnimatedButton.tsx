import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  glow?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    'bg-gradient-to-r from-electric-blue to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-electric-blue/20',
  secondary:
    'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30',
  ghost:
    'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
  danger:
    'bg-gradient-to-r from-rose to-red-600 text-white hover:from-red-500 hover:to-red-700 shadow-lg shadow-rose/20',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-xl',
};

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  glow = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${glow && variant === 'primary' ? 'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      {...(props as any)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !loading && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </motion.button>
  );
}

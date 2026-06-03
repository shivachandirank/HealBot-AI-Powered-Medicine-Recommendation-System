import { motion } from 'framer-motion';
import type { TabItem } from '../../types';

interface TabGroupProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TabGroup({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
}: TabGroupProps) {
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  if (variant === 'pills') {
    return (
      <div className={`inline-flex gap-2 ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                ${sizeClasses[size]}
                rounded-xl font-medium transition-all duration-200
                inline-flex items-center gap-2
                ${
                  isActive
                    ? 'bg-electric-blue text-white shadow-lg shadow-electric-blue/20'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-white/20">
                  {tab.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div className={`relative border-b border-white/10 ${className}`}>
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  ${sizeClasses[size]}
                  font-medium transition-all duration-200
                  inline-flex items-center gap-2 relative
                  border-b-2 -mb-px
                  ${
                    isActive
                      ? 'text-white border-electric-blue'
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-white/20'
                  }
                `}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {tab.badge && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${isActive ? 'bg-electric-blue/20 text-electric-blue' : 'bg-white/10 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant with sliding indicator
  return (
    <div className={`relative ${className}`}>
      <div className="relative inline-flex bg-white/5 backdrop-blur-lg rounded-xl p-1 border border-white/10">
        {/* Sliding indicator */}
        <motion.div
          className="absolute top-1 bottom-1 bg-electric-blue/20 border border-electric-blue/30 rounded-lg"
          layoutId="tab-indicator"
          initial={false}
          animate={{
            left: `${activeIndex * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
          }}
          style={{
            left: `calc(${activeIndex * (100 / tabs.length)}% + 4px)`,
            width: `calc(${100 / tabs.length}% - 8px)`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                ${sizeClasses[size]}
                rounded-lg font-medium transition-colors duration-200
                inline-flex items-center gap-2 relative z-10
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
              `}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
              {tab.badge && (
                <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${isActive ? 'bg-electric-blue/30 text-electric-blue-light' : 'bg-white/10 text-slate-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

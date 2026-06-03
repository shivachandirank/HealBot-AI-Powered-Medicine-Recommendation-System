import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, BrainCircuit, Shield, Code, FileCode } from 'lucide-react';
import type { ProcessingStage } from '../../types';

interface LoadingOverlayProps {
  visible: boolean;
  stages?: ProcessingStage[];
  title?: string;
  subtitle?: string;
}

const stageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  analyze: BrainCircuit,
  generate: Code,
  security: Shield,
  files: FileCode,
};

export default function LoadingOverlay({
  visible,
  stages = [],
  title = 'AI is Processing',
  subtitle = 'Generating your secure architecture...',
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative flex flex-col items-center max-w-md mx-auto px-8"
          >
            {/* Animated ring */}
            <div className="relative mb-8">
              <motion.div
                className="w-24 h-24 rounded-full border-2 border-electric-blue/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-0 w-24 h-24 rounded-full border-2 border-transparent border-t-electric-blue border-r-cyan"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 w-20 h-20 rounded-full border-2 border-transparent border-b-purple border-l-purple-light"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-electric-blue animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold gradient-text mb-2">{title}</h2>
            <p className="text-slate-400 text-sm mb-8 text-center">{subtitle}</p>

            {/* Processing stages */}
            {stages.length > 0 && (
              <div className="w-full space-y-3">
                {stages.map((stage, index) => {
                  const Icon = stageIcons[stage.id] || Loader2;
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${stage.status === 'completed' ? 'bg-emerald/20 text-emerald' : ''}
                          ${stage.status === 'active' ? 'bg-electric-blue/20 text-electric-blue' : ''}
                          ${stage.status === 'pending' ? 'bg-white/5 text-slate-500' : ''}
                          ${stage.status === 'error' ? 'bg-rose/20 text-rose' : ''}
                        `}
                      >
                        {stage.status === 'active' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm font-medium ${
                              stage.status === 'completed'
                                ? 'text-emerald'
                                : stage.status === 'active'
                                ? 'text-white'
                                : 'text-slate-500'
                            }`}
                          >
                            {stage.label}
                          </span>
                          {stage.progress !== undefined && stage.status === 'active' && (
                            <span className="text-xs text-electric-blue">
                              {stage.progress}%
                            </span>
                          )}
                        </div>
                        {stage.status === 'active' && stage.progress !== undefined && (
                          <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-electric-blue to-cyan rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${stage.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        )}
                      </div>
                      {stage.status === 'completed' && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-emerald text-sm"
                        >
                          ✓
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

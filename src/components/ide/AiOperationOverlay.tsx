import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, FileText, Sparkles, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { useAiOperationStore } from '@/hooks/useAiOperationEvents';
import { cn } from '@/lib/utils';

export const AiOperationOverlay = () => {
  const operations = useAiOperationStore((state) => state.operations);

  const getIcon = (type: string) => {
    switch (type) {
      case 'creating':
        return <FileText className="w-4 h-4" />;
      case 'editing':
        return <FileCode className="w-4 h-4" />;
      case 'deleting':
        return <Trash2 className="w-4 h-4" />;
      case 'analyzing':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <FileCode className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'creating':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/40';
      case 'editing':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      case 'deleting':
        return 'from-red-500/20 to-orange-500/20 border-red-500/40';
      case 'analyzing':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      default:
        return 'from-primary/20 to-accent/20 border-primary/40';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'creating':
        return 'text-green-400';
      case 'editing':
        return 'text-blue-400';
      case 'deleting':
        return 'text-red-400';
      case 'analyzing':
        return 'text-purple-400';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {operations.map((op) => (
          <motion.div
            key={op.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative overflow-hidden rounded-lg border backdrop-blur-xl p-4 shadow-2xl bg-gradient-to-br',
              getColor(op.type)
            )}
          >
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Content */}
            <div className="relative flex items-start gap-3">
              <div className={cn('flex-shrink-0 p-2 rounded-lg bg-black/30', getTextColor(op.type))}>
                {op.progress === 100 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    {getIcon(op.type)}
                  </motion.div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-sm font-semibold capitalize', getTextColor(op.type))}>
                    {op.type}
                  </span>
                  {op.progress < 100 && (
                    <Loader2 className="w-3 h-3 animate-spin text-white/60" />
                  )}
                </div>
                <p className="text-xs text-white/80 truncate font-mono">{op.target}</p>

                {/* Progress bar */}
                {op.progress < 100 && (
                  <div className="mt-2 h-1 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-white/60 to-white/40"
                      initial={{ width: 0 }}
                      animate={{ width: `${op.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Typing animation for content preview */}
                {op.content && op.progress < 100 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 text-xs text-white/60 font-mono bg-black/20 rounded p-2 overflow-hidden"
                  >
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className="inline-block overflow-hidden whitespace-nowrap"
                    >
                      {op.content.substring(0, 50)}...
                    </motion.span>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1 h-3 bg-white/60 ml-1"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Completion celebration */}
            {op.progress === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="text-green-400"
                >
                  <CheckCircle className="w-8 h-8" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
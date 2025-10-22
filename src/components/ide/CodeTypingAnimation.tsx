import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CodeTypingAnimationProps {
  code: string;
  language: string;
  onComplete?: () => void;
  speed?: number; // characters per second
}

export const CodeTypingAnimation: React.FC<CodeTypingAnimationProps> = ({
  code,
  language,
  onComplete,
  speed = 50,
}) => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < code.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(code.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 1000 / speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, code, speed, onComplete]);

  return (
    <div className="relative">
      {/* AI Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -top-8 left-0 flex items-center gap-2 text-xs text-primary"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
        <span>AI is generating code...</span>
      </motion.div>

      {/* Code with typing cursor */}
      <pre className="font-mono text-sm bg-[#1e1e1e] p-4 rounded-lg overflow-hidden">
        <code className={`language-${language}`}>
          {displayedCode}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-primary ml-1"
          />
        </code>
      </pre>
    </div>
  );
};

// Enhanced version with syntax highlighting simulation
export const AnimatedCodeEditor: React.FC<{
  isAiTyping: boolean;
  children: React.ReactNode;
}> = ({ isAiTyping, children }) => {
  return (
    <div className="relative">
      <AnimatePresence>
        {isAiTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            {/* Glowing border effect */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)',
              }}
              animate={{
                boxShadow: [
                  '0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)',
                  '0 0 0 2px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
                  '0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Particle effects */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ x: '50%', y: '50%', opacity: 0 }}
                animate={{
                  x: [
                    '50%',
                    `${50 + Math.cos(i * 72) * 30}%`,
                    `${50 + Math.cos(i * 72) * 50}%`,
                  ],
                  y: [
                    '50%',
                    `${50 + Math.sin(i * 72) * 30}%`,
                    `${50 + Math.sin(i * 72) * 50}%`,
                  ],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};
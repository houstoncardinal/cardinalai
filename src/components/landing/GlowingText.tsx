import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const GlowingText = ({ children, className = '', delay = 0 }: GlowingTextProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      <motion.div
        animate={{
          textShadow: [
            '0 0 10px hsl(var(--primary) / 0.5)',
            '0 0 20px hsl(var(--primary) / 0.8)',
            '0 0 30px hsl(var(--primary-glow) / 0.6)',
            '0 0 20px hsl(var(--primary) / 0.8)',
            '0 0 10px hsl(var(--primary) / 0.5)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ReactNode, useRef, useState } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const MagneticButton = ({ children, onClick, className }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * 0.15);
    y.set(distanceY * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ x: springX, y: springY }}
      className="relative inline-block"
    >
      {/* Subtle glow */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent blur-2xl"
        animate={isHovered ? {
          opacity: 0.3,
          scale: 1.1,
        } : { 
          opacity: 0,
          scale: 1
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Button container */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Button 
          onClick={onClick} 
          size="lg" 
          className={`relative text-base px-10 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent text-white font-semibold rounded-xl border-0 shadow-glow transition-all duration-300 ${className}`}
        >
          <span className="relative z-10">{children}</span>
          
          {/* Shine effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={isHovered ? {
              x: '200%',
              transition: { duration: 0.8, ease: "easeInOut" }
            } : {}}
          />
        </Button>
      </motion.div>
    </motion.div>
  );
};
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
    
    x.set(distanceX * 0.25);
    y.set(distanceY * 0.25);
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
      {/* Animated glow rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-accent to-primary blur-xl"
          animate={isHovered ? {
            scale: [1, 1.2 + i * 0.1, 1],
            opacity: [0.3, 0.5, 0.3],
          } : { 
            scale: 1,
            opacity: 0 
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Rotating border */}
      <motion.div
        className="absolute -inset-[2px] rounded-xl"
        style={{
          background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Button container */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Button 
          onClick={onClick} 
          size="lg" 
          className={`relative text-lg px-12 py-6 metal-panel border-2 border-border bg-gradient-to-r from-primary to-accent hover:from-primary-glow hover:to-accent text-white font-bold shadow-luxury ${className}`}
        >
          {/* Metallic shine effect */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={isHovered ? {
              x: ['-100%', '200%']
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          <span className="relative z-10 drop-shadow-lg">{children}</span>
          
          {/* Inner glow */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-white/10"
            animate={isHovered ? {
              opacity: [0.1, 0.2, 0.1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </Button>
      </motion.div>

      {/* Particle burst on hover */}
      {isHovered && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          style={{
            left: '50%',
            top: '50%',
            boxShadow: '0 0 10px currentColor'
          }}
          animate={{
            x: Math.cos((i * 30) * Math.PI / 180) * 100,
            y: Math.sin((i * 30) * Math.PI / 180) * 100,
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        />
      ))}
    </motion.div>
  );
};
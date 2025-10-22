import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface HolographicCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const HolographicCard = ({ icon: Icon, title, description, delay = 0 }: HolographicCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group perspective-1000"
    >
      <motion.div
        className="relative glass-panel p-8 rounded-2xl overflow-hidden border border-primary/20"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: isHovered ? (mousePosition.y - 150) / 30 : 0,
          rotateY: isHovered ? (mousePosition.x - 150) / 30 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Holographic gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary-glow) / 0.3), transparent 50%)`,
          }}
        />
        
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: isHovered
              ? `0 0 40px hsl(var(--primary) / 0.6), inset 0 0 40px hsl(var(--primary) / 0.2)`
              : '0 0 0px transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary-glow to-transparent"
            animate={{ top: isHovered ? ['0%', '100%'] : '0%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 space-y-4" style={{ transform: 'translateZ(50px)' }}>
          <motion.div
            className="relative w-16 h-16"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-xl opacity-50" />
            <div className="relative bg-gradient-primary rounded-xl p-4 flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            {title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Floating particles on hover */}
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-primary-glow rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -50],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

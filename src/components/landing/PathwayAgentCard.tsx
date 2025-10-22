import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface PathwayAgentCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export const PathwayAgentCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  delay = 0 
}: PathwayAgentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      onMouseMove={handleMouseMove}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group perspective-1000"
    >
      <motion.div
        className="relative h-full"
        whileHover={{ 
          scale: 1.02,
          z: 50,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Main card */}
        <div className="relative h-full bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden p-8">
          
          {/* Animated gradient overlay */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0`}
            animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Metallic sheen effect */}
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Glowing border effect */}
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0"
            style={{
              background: `linear-gradient(${isHovered ? '45deg' : '0deg'}, transparent, hsl(var(--primary)), transparent)`,
            }}
            animate={isHovered ? { 
              opacity: [0, 0.6, 0],
              rotate: 360
            } : { opacity: 0 }}
            transition={{ 
              duration: 2,
              repeat: isHovered ? Infinity : 0,
              ease: "linear"
            }}
          />

          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%">
              <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
                <path d="M0 2 L40 2 M20 0 L20 40" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#circuit)" />
            </svg>
          </div>

          <div className="relative z-10 h-full flex flex-col">
            {/* Icon container with 3D effect */}
            <motion.div
              className="relative mb-6"
              animate={isHovered ? { 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 2,
                repeat: isHovered ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                {/* Glow effect */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-xl`}
                  animate={isHovered ? {
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1]
                  } : { opacity: 0.2 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Icon */}
                <motion.div
                  animate={isHovered ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  } : {}}
                  transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
                  className="relative z-10"
                >
                  <Icon className="w-10 h-10 text-white drop-shadow-lg" />
                </motion.div>
              </div>

              {/* Orbiting particles */}
              {isHovered && [...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * 120) * Math.PI / 180) * 60],
                    y: [0, Math.sin((i * 120) * Math.PI / 180) * 60],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>

            {/* Title with gradient */}
            <motion.h3 
              className="text-2xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
              animate={isHovered ? { 
                backgroundPosition: ['0%', '100%'],
              } : {}}
              transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
            >
              {title}
            </motion.h3>

            {/* Description */}
            <motion.p 
              className="text-muted-foreground leading-relaxed flex-grow"
              animate={isHovered ? { x: [0, 2, 0] } : {}}
              transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
            >
              {description}
            </motion.p>

            {/* Bottom accent line */}
            <motion.div
              className={`mt-6 h-1 rounded-full bg-gradient-to-r ${gradient}`}
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 1, delay: delay + 0.5 }}
            />
          </div>

          {/* Floating particles on hover */}
          {isHovered && [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/20 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/20 rounded-br-2xl" />
        </div>

        {/* Depth shadow */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} -z-10 blur-2xl`}
          animate={isHovered ? {
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.05, 1],
          } : { opacity: 0.1 }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ transform: 'translateZ(-20px)' }}
        />
      </motion.div>
    </motion.div>
  );
};

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group h-full"
    >
      {/* Glow effect behind card */}
      <motion.div
        className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 blur-3xl`}
        animate={isHovered ? { 
          opacity: 0.3,
          scale: 1.05
        } : { 
          opacity: 0,
          scale: 1
        }}
        transition={{ duration: 0.5 }}
      />

      <motion.div
        className="relative h-full"
        whileHover={{ 
          scale: 1.03,
          rotateX: 2,
          rotateY: 2,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Main metallic card */}
        <div className="relative h-full metal-panel rounded-2xl overflow-hidden p-8 border-2 border-border">
          
          {/* Metallic texture overlay */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-metal-shine/10 via-transparent to-transparent" />
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                hsl(var(--metal-dark)) 2px,
                hsl(var(--metal-dark)) 4px
              )`
            }} />
          </div>

          {/* Animated gradient beam */}
          <motion.div
            className={`absolute inset-0 opacity-0 bg-gradient-to-br ${gradient}`}
            animate={isHovered ? { 
              opacity: [0, 0.15, 0],
              scale: [1, 1.2, 1]
            } : { opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Chrome border effect */}
          <motion.div
            className="absolute -inset-[2px] rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent 60%)`,
            }}
            animate={isHovered ? { 
              rotate: 360
            } : { rotate: 0 }}
            transition={{ 
              duration: 3,
              repeat: isHovered ? Infinity : 0,
              ease: "linear"
            }}
          />
          <div className="absolute inset-[2px] bg-metal-base rounded-2xl" />

          <div className="relative z-10 h-full flex flex-col">
            {/* Icon with metallic frame */}
            <motion.div
              className="mb-6 relative w-24 h-24"
              animate={isHovered ? { 
                rotateY: 360,
              } : {}}
              transition={{ 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              {/* Icon background glow */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-2xl`}
                animate={isHovered ? {
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.3, 1]
                } : { opacity: 0.3 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Metallic icon container */}
              <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center metal-panel border-2 border-border`}>
                <motion.div
                  className="relative z-10"
                  animate={isHovered ? { 
                    scale: [1, 1.15, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-12 h-12 text-white drop-shadow-2xl" />
                </motion.div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  }}
                  animate={isHovered ? {
                    x: ['-100%', '100%']
                  } : {}}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>

              {/* Orbiting energy particles */}
              {isHovered && [...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full bg-gradient-to-r ${gradient}`}
                  style={{
                    top: '50%',
                    left: '50%',
                    boxShadow: `0 0 10px currentColor`
                  }}
                  animate={{
                    x: [0, Math.cos((i * 90) * Math.PI / 180) * 70],
                    y: [0, Math.sin((i * 90) * Math.PI / 180) * 70],
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </motion.div>

            {/* Title with metallic gradient */}
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground via-metal-shine to-foreground bg-clip-text text-transparent">
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed flex-grow text-base">
              {description}
            </p>

            {/* Animated accent bar */}
            <div className="mt-8 relative h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient}`}
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1.5, delay: delay + 0.5, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-white/50 blur-sm"
                animate={isHovered ? {
                  x: ['0%', '300%']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </div>

          {/* Corner chrome accents */}
          <motion.div 
            className={`absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 rounded-tl-2xl bg-gradient-to-br ${gradient}`}
            style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            animate={isHovered ? { opacity: 0.3 } : { opacity: 0.1 }}
          />
          <motion.div 
            className={`absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 rounded-br-2xl bg-gradient-to-tl ${gradient}`}
            style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}
            animate={isHovered ? { opacity: 0.3 } : { opacity: 0.1 }}
          />
        </div>

        {/* 3D depth shadow */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} -z-10 blur-xl`}
          animate={isHovered ? {
            opacity: [0.2, 0.4, 0.2],
            y: [8, 12, 8],
          } : { 
            opacity: 0.2,
            y: 8
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};
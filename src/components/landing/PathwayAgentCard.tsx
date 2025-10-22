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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <motion.div
        className="relative h-full modern-card rounded-2xl overflow-hidden p-8 group"
        whileHover={{ 
          y: -8,
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }}
      >
        {/* Subtle gradient background */}
        <motion.div
          className={`absolute inset-0 opacity-0 bg-gradient-to-br ${gradient}`}
          animate={isHovered ? { opacity: 0.05 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Top accent line */}
        <motion.div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient}`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        />

        {/* Glow effect on hover */}
        <motion.div
          className={`absolute inset-0 opacity-0 blur-2xl bg-gradient-to-br ${gradient}`}
          animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative z-10 h-full flex flex-col">
          {/* Icon container */}
          <motion.div
            className="mb-6 relative w-16 h-16"
            animate={isHovered ? { 
              scale: 1.05,
              transition: { duration: 0.3 }
            } : { scale: 1 }}
          >
            {/* Icon glow */}
            <motion.div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-xl`}
              animate={isHovered ? {
                opacity: 0.4,
                scale: 1.2
              } : { 
                opacity: 0.2,
                scale: 1
              }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Icon background */}
            <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-3 text-foreground">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed flex-grow text-[15px]">
            {description}
          </p>

          {/* Bottom indicator */}
          <motion.div
            className="mt-8 flex items-center gap-2 text-sm font-medium text-muted-foreground"
            animate={isHovered ? { 
              x: 4,
              transition: { duration: 0.3 }
            } : { x: 0 }}
          >
            <span>Learn more</span>
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-muted-foreground"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* Floating particles on hover - minimal */}
        {isHovered && [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full bg-gradient-to-r ${gradient}`}
            style={{
              left: `${30 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -40],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
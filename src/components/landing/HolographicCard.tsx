import { motion } from 'framer-motion';
import { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface HolographicCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export const HolographicCard = ({ icon: Icon, title, description, delay = 0 }: HolographicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group h-full"
    >
      {/* Background glow */}
      <motion.div
        className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary blur-2xl"
        animate={isHovered ? { 
          opacity: 0.25,
          scale: 1.05
        } : { 
          opacity: 0,
          scale: 1
        }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="relative h-full metal-panel p-8 rounded-2xl overflow-hidden border-2 border-border"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {/* Metallic texture */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-metal-shine/20 via-transparent to-transparent" />
        </div>

        {/* Animated scan line */}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={isHovered ? { 
            y: ['0%', '100%']
          } : { y: '0%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Chrome border animation */}
        <motion.div
          className="absolute -inset-[2px] rounded-2xl opacity-0"
          style={{
            background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
          }}
          animate={isHovered ? { 
            opacity: 0.5,
            rotate: 360
          } : { opacity: 0 }}
          transition={{ 
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: 'linear'
          }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Icon container */}
          <motion.div
            className="relative w-20 h-20"
            animate={isHovered ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            } : {}}
            transition={{ duration: 1.5 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl"
              animate={isHovered ? {
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.3, 1]
              } : { opacity: 0.3 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Icon background */}
            <div className="relative bg-gradient-to-br from-primary to-accent rounded-2xl p-5 flex items-center justify-center metal-panel border border-border">
              <Icon className="w-10 h-10 text-white drop-shadow-lg relative z-10" />
              
              {/* Shine overlay */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 via-transparent to-transparent"
                animate={isHovered ? {
                  opacity: [0, 1, 0]
                } : {}}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Animated underline */}
          <motion.div
            className="h-0.5 rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 1, delay: delay + 0.3 }}
          />

          {/* Floating particles on hover */}
          {isHovered && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-primary rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    boxShadow: '0 0 8px currentColor'
                  }}
                  animate={{
                    y: [0, -60],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/30 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent/30 rounded-bl-2xl" />
      </motion.div>
    </motion.div>
  );
};
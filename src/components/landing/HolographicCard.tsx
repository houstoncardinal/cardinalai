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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full"
    >
      <motion.div
        className="relative h-full modern-card p-8 rounded-2xl overflow-hidden group"
        whileHover={{ 
          y: -4,
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }}
      >
        {/* Subtle gradient on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-5">
          {/* Icon container */}
          <motion.div
            className="relative w-14 h-14"
            animate={isHovered ? { 
              scale: 1.05,
              transition: { duration: 0.3 }
            } : { scale: 1 }}
          >
            {/* Icon glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg"
              animate={isHovered ? {
                opacity: 0.3,
                scale: 1.2
              } : { 
                opacity: 0.15,
                scale: 1
              }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Icon background */}
            <div className="relative bg-gradient-to-br from-primary to-accent rounded-xl p-3.5 flex items-center justify-center">
              <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground">
            {title}
          </h3>
          
          {/* Description */}
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            {description}
          </p>
        </div>

        {/* Bottom hover indicator */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isHovered ? { 
            opacity: 1,
            scaleX: 1,
            transition: { duration: 0.4 }
          } : { 
            opacity: 0,
            scaleX: 0
          }}
        />
      </motion.div>
    </motion.div>
  );
};
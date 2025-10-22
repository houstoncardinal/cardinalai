import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface InteractiveCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
}

export const InteractiveCard = ({ icon: Icon, title, description, gradient, delay = 0 }: InteractiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        className="metal-panel p-6 rounded-xl space-y-4 cursor-pointer overflow-hidden relative"
        whileHover={{ 
          scale: 1.05,
          rotateY: 5,
          rotateX: 5,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glowing background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)`,
          }}
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10">
          <motion.div 
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient || 'from-primary to-primary-glow'} flex items-center justify-center`}
            animate={isHovered ? { 
              boxShadow: ['0 0 20px hsl(var(--primary) / 0.5)', '0 0 40px hsl(var(--primary) / 0.8)', '0 0 20px hsl(var(--primary) / 0.5)']
            } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          
          <h3 className="text-xl font-semibold mt-4">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Particle effects */}
        {isHovered && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              opacity: 0 
            }}
            animate={{ 
              y: [null, '-100%'],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.5,
              delay: i * 0.1,
              repeat: Infinity 
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DataPacket {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export const DataFlow = () => {
  const [packets, setPackets] = useState<DataPacket[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPacket: DataPacket = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: -10,
        targetX: Math.random() * window.innerWidth,
        targetY: window.innerHeight + 10,
      };

      setPackets((prev) => [...prev.slice(-15), newPacket]);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {packets.map((packet) => (
        <motion.div
          key={packet.id}
          className="absolute"
          initial={{ x: packet.x, y: packet.y }}
          animate={{ x: packet.targetX, y: packet.targetY }}
          transition={{ duration: 3, ease: "linear" }}
          onAnimationComplete={() => {
            setPackets((prev) => prev.filter((p) => p.id !== packet.id));
          }}
        >
          {/* Data packet visualization */}
          <div className="relative">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                boxShadow: [
                  '0 0 5px hsl(var(--primary))',
                  '0 0 20px hsl(var(--primary))',
                  '0 0 5px hsl(var(--primary))',
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            {/* Trail effect */}
            <motion.div
              className="absolute top-0 left-0 w-0.5 h-8 bg-gradient-to-b from-primary to-transparent"
              style={{ originY: 0 }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

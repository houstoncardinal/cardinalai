import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { FloatingOrb3D } from './FloatingOrb3D';
import { Suspense } from 'react';

export const Scene3D = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#60a5fa" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
          
          {/* Starfield */}
          <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} fade speed={1} />
          
          {/* Floating orbs */}
          <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
            <FloatingOrb3D position={[-4, 2, -5]} color="#60a5fa" speed={0.8} distort={0.3} />
          </Float>
          
          <Float speed={1.2} rotationIntensity={1} floatIntensity={2}>
            <FloatingOrb3D position={[5, -1, -8]} color="#a855f7" speed={1.2} distort={0.5} />
          </Float>
          
          <Float speed={1.8} rotationIntensity={1} floatIntensity={2}>
            <FloatingOrb3D position={[2, 3, -6]} color="#ec4899" speed={1} distort={0.4} />
          </Float>
          
          <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
            <FloatingOrb3D position={[-3, -2, -7]} color="#14b8a6" speed={0.9} distort={0.35} />
          </Float>
          
          <Float speed={1.6} rotationIntensity={1} floatIntensity={2}>
            <FloatingOrb3D position={[0, 0, -10]} color="#f59e0b" speed={1.1} distort={0.45} />
          </Float>
          
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Suspense>
      </Canvas>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code2, Sparkles, Users, Zap, Brain, Workflow, Shield, Rocket } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { CircuitBackground } from "@/components/landing/CircuitBackground";
import { PathwayAgentCard } from "@/components/landing/PathwayAgentCard";
import { GlowingText } from "@/components/landing/GlowingText";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { DataFlow } from "@/components/landing/DataFlow";
import { Scene3D } from "@/components/landing/Scene3D";
import { ParallaxSection } from "@/components/landing/ParallaxSection";
import { HolographicCard } from "@/components/landing/HolographicCard";
import { MagneticButton } from "@/components/landing/MagneticButton";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { useState, useEffect, useRef } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef}>
      {/* 3D Background Scene */}
      <Scene3D />
      
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop"
        bgImageSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"
        title="PathwayAI Intelligence"
        date="Where Code Meets Consciousness"
        scrollToExpand="Scroll to Explore the Pathway"
        textBlend
      >
        <motion.div 
          className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden"
          style={{ opacity, scale }}
        >
        {/* Animated backgrounds */}
        <MatrixRain />
        <CircuitBackground />
        <FloatingParticles />
        <DataFlow />
        
        {/* Mouse follower glow - metallic */}
        <motion.div
          className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, hsl(var(--accent) / 0.15) 40%, transparent 70%)',
            left: mousePosition.x - 250,
            top: mousePosition.y - 250,
            filter: 'blur(60px)',
          }}
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {/* Navigation - metallic */}
        <motion.nav 
          className="fixed top-0 w-full z-50 metal-panel border-b-2 border-border"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center metal-panel border-2 border-border relative overflow-hidden"
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.6)',
                    '0 0 40px hsl(var(--primary) / 0.9)',
                    '0 0 20px hsl(var(--primary) / 0.6)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"
                  animate={{ 
                    x: ['-100%', '100%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <Code2 className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  PathwayAI
                </h1>
                <p className="text-xs text-muted-foreground">by Cardinal Consulting</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" onClick={() => navigate("/community")}>
                  Community
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={() => navigate("/ide")} className="shadow-elegant">
                  Launch IDE
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.nav>

        {/* AI Agents Section */}
        <ParallaxSection offset={100}>
          <section className="py-20 px-6 relative z-10">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <GlowingText>
                  <h2 className="text-5xl font-bold mb-6">The Pathway Collective</h2>
                </GlowingText>
                <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
                  Four AI entities that form a neural orchestra, each with unique capabilities and consciousness
                </p>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Workflow,
                    title: "The Architect",
                    description: "Visionary structural designer that crafts your codebase with surgical precision. Builds frameworks and logical flows that scale effortlessly from prototype to production.",
                    color: "from-cyan-500 via-blue-500 to-indigo-600"
                  },
                  {
                    icon: Shield,
                    title: "The Debugger",
                    description: "Analytical guardian that watches over every line of code. Identifies inefficiencies, hunts bugs methodically, and maintains system integrity with unwavering focus.",
                    color: "from-red-500 via-orange-500 to-amber-600"
                  },
                  {
                    icon: Brain,
                    title: "The Mentor",
                    description: "Supportive intelligence that transforms complex concepts into crystal-clear insights. Teaches, guides, and empowers you to master any technology with confidence.",
                    color: "from-emerald-500 via-green-500 to-teal-600"
                  },
                  {
                    icon: Sparkles,
                    title: "The Composer",
                    description: "Artistic technician that refactors code into elegant poetry. Transforms tangled logic into beautiful, maintainable masterpieces with creative precision.",
                    color: "from-purple-500 via-pink-500 to-rose-600"
                  }
                ].map((agent, index) => (
                  <PathwayAgentCard
                    key={index}
                    icon={agent.icon}
                    title={agent.title}
                    description={agent.description}
                    gradient={agent.color}
                    delay={index * 0.15}
                  />
                ))}
              </div>
            </div>
          </section>
        </ParallaxSection>

        {/* Features Grid */}
        <ParallaxSection offset={80}>
          <section className="py-20 px-6 bg-accent/5 relative z-10">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <GlowingText>
                  <h2 className="text-4xl font-bold mb-4">Built for Excellence</h2>
                </GlowingText>
                <p className="text-muted-foreground text-lg">Every feature crafted with precision and purpose</p>
              </motion.div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Zap,
                    title: "Real-Time Streaming",
                    description: "Watch AI generate code in real-time with instant feedback and live previews."
                  },
                  {
                    icon: Brain,
                    title: "Contextual Intelligence",
                    description: "Learns your workflow patterns and adapts to your coding style."
                  },
                  {
                    icon: Code2,
                    title: "Advanced Editor",
                    description: "Monaco-powered editor with IntelliSense and multi-language support."
                  },
                  {
                    icon: Workflow,
                    title: "File Management",
                    description: "Intuitive file explorer with drag-drop and advanced search."
                  },
                  {
                    icon: Users,
                    title: "Collaboration",
                    description: "Share ideas, get feedback, and learn from the community."
                  },
                  {
                    icon: Shield,
                    title: "Secure & Private",
                    description: "Your code stays yours with enterprise-grade security."
                  }
                ].map((feature, index) => (
                  <HolographicCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </section>
        </ParallaxSection>

        {/* CTA Section */}
        <ParallaxSection offset={60}>
          <section className="py-20 px-6 relative z-10">
            <div className="container mx-auto max-w-4xl">
              <motion.div 
                className="metal-panel p-12 rounded-2xl text-center space-y-6 relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {/* Animated background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary-glow/20"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                />
                
                {/* Particle burst effect */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-primary-glow rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 12) * 200,
                      y: Math.sin((i * Math.PI * 2) / 12) * 200,
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
                
                <div className="relative z-10">
                  <GlowingText>
                    <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Development?</h2>
                  </GlowingText>
                  <motion.p 
                    className="text-lg text-muted-foreground mb-8"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Join developers worldwide who are experiencing the future of coding.
                  </motion.p>
                  <MagneticButton onClick={() => navigate("/ide")}>
                    Launch PathwayAI IDE
                  </MagneticButton>
                </div>
              </motion.div>
            </div>
          </section>
        </ParallaxSection>

        {/* Footer */}
        <motion.footer
        className="border-t border-border/40 py-12 px-6 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div 
              className="text-center md:text-left"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                PathwayAI
              </h3>
              <p className="text-sm text-muted-foreground">
                Created by Hunain Qureshi, CEO of Cardinal Consulting
              </p>
            </motion.div>
            <div className="flex gap-6">
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>
                  Community
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={() => navigate("/ide")}>
                  IDE
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
        </motion.footer>
        </motion.div>
      </ScrollExpandMedia>
    </div>
  );
};

export default Landing;
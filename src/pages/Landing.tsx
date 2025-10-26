import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Zap, Brain, Workflow, Shield, Code2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { CircuitBackground } from "@/components/landing/CircuitBackground";
import { PathwayAgentCard } from "@/components/landing/PathwayAgentCard";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { DataFlow } from "@/components/landing/DataFlow";
import { Scene3D } from "@/components/landing/Scene3D";
import { ParallaxSection } from "@/components/landing/ParallaxSection";
import { HolographicCard } from "@/components/landing/HolographicCard";
import { MagneticButton } from "@/components/landing/MagneticButton";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { HeroSection } from "@/components/ui/hero-section-2";
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
        
        {/* Subtle mouse follower */}
        <motion.div
          className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            filter: 'blur(80px)',
          }}
        />

        {/* New Hero Section */}
        <HeroSection />

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
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
                  The Pathway Collective
                </h2>
                <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
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
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Built for Excellence
                </h2>
                <p className="text-muted-foreground text-base">Every feature crafted with precision and purpose</p>
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
                className="modern-card p-16 rounded-3xl text-center space-y-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
                    Ready to Transform Your Development?
                  </h2>
                  <p className="text-base text-muted-foreground mb-10 leading-relaxed">
                    Join developers worldwide who are experiencing the future of coding.
                  </p>
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
        className="border-t border-border/30 py-12 px-6 relative z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div 
              className="text-center md:text-left"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="font-semibold text-lg mb-2 text-foreground">
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
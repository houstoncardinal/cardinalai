import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code2, Sparkles, Users, Zap, Brain, Workflow, Shield, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { MatrixRain } from "@/components/landing/MatrixRain";
import { CircuitBackground } from "@/components/landing/CircuitBackground";
import { PathwayAgentCard } from "@/components/landing/PathwayAgentCard";
import { GlowingText } from "@/components/landing/GlowingText";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { DataFlow } from "@/components/landing/DataFlow";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1920&auto=format&fit=crop"
      bgImageSrc="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop"
      title="PathwayAI Intelligence"
      date="Where Code Meets Consciousness"
      scrollToExpand="Scroll to Explore the Pathway"
      textBlend
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
        {/* Animated backgrounds */}
        <MatrixRain />
        <CircuitBackground />
        <FloatingParticles />
        <DataFlow />
        
        {/* Mouse follower glow */}
        <motion.div
          className="fixed w-96 h-96 rounded-full pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 w-full z-50 glass-panel border-b border-border/40"
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
                className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    '0 0 20px hsl(var(--primary) / 0.5)',
                    '0 0 40px hsl(var(--primary) / 0.8)',
                    '0 0 20px hsl(var(--primary) / 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Code2 className="w-6 h-6 text-white" />
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

        {/* Features Grid */}
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
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 20px 40px hsl(var(--primary) / 0.2)'
                }}
                className="glass-panel p-8 rounded-xl space-y-4 cursor-pointer group"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-10 h-10 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover effect particles */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
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
            ))}
          </div>
        </div>
        </section>

        {/* CTA Section */}
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
            
            <div className="relative z-10">
              <GlowingText>
                <h2 className="text-4xl font-bold">Ready to Transform Your Development?</h2>
              </GlowingText>
              <motion.p 
                className="text-lg text-muted-foreground"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Join developers worldwide who are experiencing the future of coding.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" onClick={() => navigate("/ide")} className="text-lg px-12 shadow-glow">
                  Launch PathwayAI IDE
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
        </section>

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
      </div>
    </ScrollExpandMedia>
  );
};

export default Landing;
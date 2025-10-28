import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Zap, Brain, Workflow, Network, Layers, Box, Bug, GraduationCap, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { PathwayAgentCard } from "@/components/landing/PathwayAgentCard";
import { ParallaxSection } from "@/components/landing/ParallaxSection";
import { HolographicCard } from "@/components/landing/HolographicCard";
import { MagneticButton } from "@/components/landing/MagneticButton";
import { HeroSection } from "@/components/ui/hero-section-2";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* New Hero Section */}
      <HeroSection />

      {/* AI Agents Section */}
      <ParallaxSection>
        <section id="agents" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
              >
                <span className="text-sm font-semibold text-primary">The Pathway Collective</span>
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Four AI Agents, One Vision
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A neural orchestra of specialized AI entities working in perfect harmony. Each agent brings unique expertise, sharing memory through an intelligent Knowledge Graph that evolves with your coding patterns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <PathwayAgentCard
                icon={Box}
                title="The Architect"
                description="Visionary and structural. Designs frameworks, folder hierarchies, and large-scale logic with confident precision."
                gradient="from-blue-500 via-blue-600 to-purple-600"
                delay={0}
              />
              <PathwayAgentCard
                icon={Bug}
                title="The Debugger"
                description="Analytical and methodical. Identifies problems with calm clarity and reasons through complex issues systematically."
                gradient="from-purple-500 via-purple-600 to-pink-600"
                delay={0.1}
              />
              <PathwayAgentCard
                icon={GraduationCap}
                title="The Mentor"
                description="Supportive and insightful. Breaks down concepts, teaches best practices, and guides you toward mastery."
                gradient="from-pink-500 via-pink-600 to-red-600"
                delay={0.2}
              />
              <PathwayAgentCard
                icon={Code2}
                title="The Composer"
                description="Artistic yet technical. Refactors and beautifies code with poetic efficiency, making every line elegant."
                gradient="from-red-500 via-red-600 to-orange-600"
                delay={0.3}
              />
            </div>
          </motion.div>
        </section>
      </ParallaxSection>

      {/* Features Grid */}
      <ParallaxSection>
        <section id="features" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-accent/5 to-background" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto relative z-10"
          >
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="inline-block mb-4 px-4 py-2 bg-accent/10 rounded-full border border-accent/20"
              >
                <span className="text-sm font-semibold text-accent">Premium Features</span>
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Engineered for <span className="bg-gradient-to-r from-accent via-primary-glow to-primary bg-clip-text text-transparent">Excellence</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Every feature meticulously crafted to transform coding from a task into an art form. Experience development that feels alive, intuitive, and profoundly intelligent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <HolographicCard
                icon={Zap}
                title="Real-Time AI Streaming"
                description="Experience fluid AI responses that flow naturally as you code. Lightning-fast suggestions with sub-second latency that never breaks your creative flow."
                delay={0}
              />
              <HolographicCard
                icon={Brain}
                title="Contextual Intelligence"
                description="Advanced pattern recognition learns your syntax rhythms, framework preferences, and architectural style. Suggestions become more precise with every keystroke."
                delay={0.1}
              />
              <HolographicCard
                icon={Network}
                title="Seamless Collaboration"
                description="Real-time synchronization across voice, touch, and text inputs. Work solo in deep focus or collaborate with teams in perfect harmony."
                delay={0.2}
              />
              <HolographicCard
                icon={Sparkles}
                title="Predictive Workflow"
                description="AI anticipates your next actions and prepares resources proactively. Files load before you click, builds start before you save."
                delay={0.3}
              />
              <HolographicCard
                icon={Workflow}
                title="Multi-Agent System"
                description="Four specialized AI agents collaborate through a unified Knowledge Graph, each contributing their expertise to every task you undertake."
                delay={0.4}
              />
              <HolographicCard
                icon={Layers}
                title="Adaptive Interface"
                description="Dynamic layouts, intelligent tool suggestions, and ambient lighting that responds to your project type, workflow mode, and coding patterns."
                delay={0.5}
              />
            </div>
          </motion.div>
        </section>
      </ParallaxSection>

      {/* CTA Section */}
      <ParallaxSection>
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-glow),0.15),transparent_70%)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <div className="relative p-16 rounded-3xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-glow/10 to-accent/10 backdrop-blur-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-glow),0.2),transparent_70%)]" />
              
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                    Ready to Transform Your Workflow?
                  </h2>
                  <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Join developers who've discovered a new way to code. Where intelligence meets intuition. Where engineering becomes art.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <MagneticButton
                    onClick={() => navigate('/ide')}
                    className="group relative px-12 py-6 text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
                  >
                    <span className="relative z-10 font-semibold">Launch PathwayAI</span>
                  </MagneticButton>
                  <p className="mt-6 text-sm text-muted-foreground">No credit card required • Start coding in seconds</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      </ParallaxSection>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent blur-sm opacity-50" />
                  <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        fill="currentColor"
                        fillOpacity="0.9"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  Cardinal.AI
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
                Where code meets consciousness. A development environment that feels alive.
              </p>
            </div>
            
            <nav className="flex flex-col md:flex-row gap-6 md:gap-8">
              <Link to="/ide" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Launch IDE
              </Link>
              <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Community
              </Link>
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Features
              </a>
              <a href="#agents" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                AI Agents
              </a>
            </nav>
          </div>
          
          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Cardinal.AI. Engineered for excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
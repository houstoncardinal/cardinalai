import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Code2, Sparkles, Users, Zap, Brain, Workflow, Shield, Rocket } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                PathwayAI
              </h1>
              <p className="text-xs text-muted-foreground">by Cardinal Consulting</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/community")}>
              Community
            </Button>
            <Button onClick={() => navigate("/ide")} className="shadow-elegant">
              Launch IDE
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">World-Class AI Development Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Where Code Meets
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Consciousness
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A development environment so aware, it feels alive — so elegant, it turns engineering into art.
              Built by <span className="text-primary font-semibold">Hunain Qureshi</span>, CEO of Cardinal Consulting.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/ide")} className="text-lg px-8 shadow-glow">
                <Rocket className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/community")}>
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">The Pathway Collective</h2>
            <p className="text-muted-foreground text-lg">Four AI entities collaborating like a neural orchestra</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Workflow,
                title: "The Architect",
                description: "Designs your codebase, folder structure, and logic flow with visionary precision.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Shield,
                title: "The Debugger",
                description: "Watches for inefficiency, bugs, and inconsistencies with analytical calm.",
                color: "from-red-500 to-orange-500"
              },
              {
                icon: Brain,
                title: "The Mentor",
                description: "Teaches and explains complex concepts with encouraging insight.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Sparkles,
                title: "The Composer",
                description: "Rewrites and refactors with poetic precision and artistic elegance.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((agent, index) => (
              <div
                key={index}
                className="metal-panel p-6 rounded-xl space-y-4 hover:scale-105 smooth-transition group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center group-hover:shadow-glow smooth-transition`}>
                  <agent.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{agent.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {agent.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Excellence</h2>
            <p className="text-muted-foreground text-lg">Every feature crafted with precision and purpose</p>
          </div>
          
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
              <div key={index} className="glass-panel p-8 rounded-xl space-y-4">
                <feature.icon className="w-10 h-10 text-primary" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="metal-panel p-12 rounded-2xl text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Transform Your Development?</h2>
            <p className="text-lg text-muted-foreground">
              Join developers worldwide who are experiencing the future of coding.
            </p>
            <Button size="lg" onClick={() => navigate("/ide")} className="text-lg px-12 shadow-glow">
              Launch PathwayAI IDE
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg mb-2">PathwayAI</h3>
              <p className="text-sm text-muted-foreground">
                Created by Hunain Qureshi, CEO of Cardinal Consulting
              </p>
            </div>
            <div className="flex gap-6">
              <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>
                Community
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/ide")}>
                IDE
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
import React from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdeStore, ThemeName } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ThemeInfo {
  name: ThemeName;
  label: string;
  description: string;
  gradient: string;
}

const THEMES: ThemeInfo[] = [
  {
    name: 'obsidian',
    label: 'Obsidian',
    description: 'Professional dark metallic',
    gradient: 'linear-gradient(135deg, hsl(0 0% 15%), hsl(0 0% 8%))',
  },
  {
    name: 'pearl',
    label: 'Pearl',
    description: 'Elegant light theme',
    gradient: 'linear-gradient(135deg, hsl(0 0% 95%), hsl(0 0% 100%))',
  },
  {
    name: 'titanium',
    label: 'Titanium',
    description: 'Cool metallic blue-grey',
    gradient: 'linear-gradient(135deg, hsl(210 10% 30%), hsl(210 10% 23%))',
  },
  {
    name: 'neon',
    label: 'Neon',
    description: 'Electric purple & cyan',
    gradient: 'linear-gradient(135deg, hsl(280 80% 65%), hsl(180 80% 60%))',
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Yellow & pink neon',
    gradient: 'linear-gradient(135deg, hsl(60 100% 60%), hsl(330 100% 60%))',
  },
  {
    name: 'forest',
    label: 'Forest',
    description: 'Deep green nature',
    gradient: 'linear-gradient(135deg, hsl(140 60% 55%), hsl(90 60% 55%))',
  },
  {
    name: 'ocean',
    label: 'Ocean',
    description: 'Deep blue aquatic',
    gradient: 'linear-gradient(135deg, hsl(190 70% 55%), hsl(170 65% 50%))',
  },
  {
    name: 'sunset',
    label: 'Sunset',
    description: 'Warm orange & purple',
    gradient: 'linear-gradient(135deg, hsl(20 85% 60%), hsl(280 70% 65%))',
  },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useIdeStore();
  const [open, setOpen] = React.useState(false);

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    // Apply theme to document
    document.documentElement.classList.remove(
      'theme-obsidian',
      'theme-pearl',
      'theme-titanium',
      'theme-neon',
      'theme-cyberpunk',
      'theme-forest',
      'theme-ocean',
      'theme-sunset'
    );
    document.documentElement.classList.add(`theme-${newTheme}`);
    setOpen(false);
  };

  // Apply current theme on mount and when it changes
  React.useEffect(() => {
    document.documentElement.classList.remove(
      'theme-obsidian',
      'theme-pearl',
      'theme-titanium',
      'theme-neon',
      'theme-cyberpunk',
      'theme-forest',
      'theme-ocean',
      'theme-sunset'
    );
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const currentTheme = THEMES.find((t) => t.name === theme);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9 px-3 relative group"
        >
          <div
            className="w-4 h-4 rounded border border-border shadow-lg transition-transform group-hover:scale-110"
            style={{ background: currentTheme?.gradient }}
          />
          <span className="text-xs font-medium">{currentTheme?.label}</span>
          <Sparkles className="w-3.5 h-3.5 ml-1 text-primary animate-pulse" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-[420px] p-0 glass-panel border-2 border-primary/20 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base">Choose Your Theme</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Select a visual style for your IDE</p>
          </div>

          {/* Theme Grid */}
          <div className="p-4 grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
            {THEMES.map((themeInfo, index) => (
              <motion.button
                key={themeInfo.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleThemeChange(themeInfo.name)}
                className={cn(
                  'relative group p-4 rounded-xl border-2 transition-all duration-300',
                  'hover:scale-105 hover:shadow-xl cursor-pointer',
                  theme === themeInfo.name
                    ? 'border-primary shadow-lg shadow-primary/20 bg-primary/5'
                    : 'border-border hover:border-primary/50 bg-background/50'
                )}
              >
                {/* Theme Preview */}
                <div className="relative mb-3 overflow-hidden rounded-lg border border-border">
                  <div
                    className="h-24 w-full transition-transform group-hover:scale-110"
                    style={{ background: themeInfo.gradient }}
                  />
                  
                  {/* Active Indicator */}
                  <AnimatePresence>
                    {theme === themeInfo.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 bg-background rounded-full p-1.5 shadow-lg"
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Info */}
                <div className="text-left">
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    {themeInfo.label}
                    {theme === themeInfo.name && (
                      <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {themeInfo.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div 
                    className="absolute inset-0 rounded-xl blur-xl"
                    style={{ background: themeInfo.gradient, opacity: 0.1 }}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};
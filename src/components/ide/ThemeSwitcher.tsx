import React from 'react';
import { Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdeStore, ThemeName } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9 px-3"
        >
          <div
            className="w-4 h-4 rounded border border-border"
            style={{ background: currentTheme?.gradient }}
          />
          <span className="text-xs">{currentTheme?.label}</span>
          <Palette className="w-3.5 h-3.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 glass-panel">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider">
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-1 space-y-1">
          {THEMES.map((themeInfo) => (
            <DropdownMenuItem
              key={themeInfo.name}
              onClick={() => handleThemeChange(themeInfo.name)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded',
                theme === themeInfo.name && 'bg-primary/10'
              )}
            >
              <div
                className="w-8 h-8 rounded border border-border flex-shrink-0 shadow-md"
                style={{ background: themeInfo.gradient }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{themeInfo.label}</span>
                  <AnimatePresence>
                    {theme === themeInfo.name && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                      >
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs text-muted-foreground">{themeInfo.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
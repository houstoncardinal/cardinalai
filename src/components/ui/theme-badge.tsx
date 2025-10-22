import React from 'react';
import { ThemeName } from '@/store/ideStore';
import { cn } from '@/lib/utils';

interface ThemeBadgeProps {
  theme: ThemeName;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const THEME_GRADIENTS: Record<ThemeName, string> = {
  obsidian: 'linear-gradient(135deg, hsl(0 0% 15%), hsl(0 0% 8%))',
  pearl: 'linear-gradient(135deg, hsl(0 0% 95%), hsl(0 0% 100%))',
  titanium: 'linear-gradient(135deg, hsl(210 10% 30%), hsl(210 10% 23%))',
  neon: 'linear-gradient(135deg, hsl(280 80% 65%), hsl(180 80% 60%))',
  cyberpunk: 'linear-gradient(135deg, hsl(60 100% 60%), hsl(330 100% 60%))',
  forest: 'linear-gradient(135deg, hsl(140 60% 55%), hsl(90 60% 55%))',
  ocean: 'linear-gradient(135deg, hsl(190 70% 55%), hsl(170 65% 50%))',
  sunset: 'linear-gradient(135deg, hsl(20 85% 60%), hsl(280 70% 65%))',
};

export const ThemeBadge: React.FC<ThemeBadgeProps> = ({ theme, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        'rounded border border-border shadow-sm',
        sizeClasses[size],
        className
      )}
      style={{ background: THEME_GRADIENTS[theme] }}
    />
  );
};
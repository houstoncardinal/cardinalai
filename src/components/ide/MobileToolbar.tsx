import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdeStore } from '@/store/ideStore';

export const MobileToolbar = () => {
  const { theme, setTheme } = useIdeStore();
  const [showThemes, setShowThemes] = useState(false);

  const themes = [
    { value: 'obsidian' as const, label: 'Obsidian', bg: 'bg-black' },
    { value: 'pearl' as const, label: 'Pearl', bg: 'bg-white' },
    { value: 'titanium' as const, label: 'Titanium', bg: 'bg-slate-600' },
  ];

  return (
    <div className="md:hidden fixed top-2 right-2 z-40">
      <div className="metal-panel rounded-lg shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-3 gap-2"
          onClick={() => setShowThemes(!showThemes)}
        >
          <div className={`w-4 h-4 rounded ${themes.find(t => t.value === theme)?.bg}`} />
          <span className="text-xs font-medium">
            {themes.find(t => t.value === theme)?.label}
          </span>
          {showThemes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>

        {showThemes && (
          <div className="absolute top-full right-0 mt-2 w-40 glass-panel rounded-lg shadow-lg overflow-hidden">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setShowThemes(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary/20 smooth-transition ${
                  theme === t.value ? 'bg-primary/10' : ''
                }`}
              >
                <div className={`w-4 h-4 rounded ${t.bg} border border-border`} />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

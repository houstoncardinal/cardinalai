import { useState } from 'react';
import { X, Palette, Volume2, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useIdeStore, ThemeName } from '@/store/ideStore';
import { soundManager } from '@/utils/sounds';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const { theme, setTheme } = useIdeStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(30);
  const [animations, setAnimations] = useState(true);

  const themes: { name: ThemeName; label: string; preview: string }[] = [
    { name: 'obsidian', label: 'Obsidian', preview: 'Dark metallic with deep blacks' },
    { name: 'pearl', label: 'Pearl', preview: 'Light metallic with pristine whites' },
    { name: 'titanium', label: 'Titanium', preview: 'Medium metallic with blue tints' },
  ];

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    soundManager.setEnabled(enabled);
    if (enabled) soundManager.click();
  };

  const handleVolumeChange = (value: number[]) => {
    setSoundVolume(value[0]);
    soundManager.setVolume(value[0] / 100);
  };

  const handleThemeChange = (themeName: ThemeName) => {
    setTheme(themeName);
    soundManager.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="metal-panel w-full max-w-2xl max-h-[90vh] overflow-auto rounded-lg">
        {/* Header */}
        <div className="sticky top-0 bg-[hsl(var(--panel-bg))] border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">PathwayAI Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Theme</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleThemeChange(t.name)}
                  className={`glass-panel p-4 rounded-lg smooth-transition text-left ${
                    theme === t.name ? 'ring-2 ring-primary' : 'hover:bg-secondary/20'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.preview}</div>
                  {theme === t.name && (
                    <div className="mt-2 text-xs text-primary font-medium">✓ Active</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sound Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Sound Effects</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled">Enable Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">
                    Hear audio feedback for interactions
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>

              {soundEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume: {soundVolume}%</Label>
                  <Slider
                    id="volume"
                    min={0}
                    max={100}
                    step={5}
                    value={[soundVolume]}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => soundManager.success()}
                    className="text-xs"
                  >
                    Test Sound
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Animation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide">Animations</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-xs text-muted-foreground">
                  Show smooth transitions and effects
                </p>
              </div>
              <Switch
                id="animations"
                checked={animations}
                onCheckedChange={setAnimations}
              />
            </div>
          </div>

          <Separator />

          {/* Info Section */}
          <div className="glass-panel p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Info className="w-4 h-4" />
              <span className="text-sm font-semibold">About PathwayAI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PathwayAI is an intelligent development environment powered by multi-agent AI. 
              Choose between The Architect, Debugger, Mentor, and Composer to enhance your coding workflow.
            </p>
            <div className="text-xs text-muted-foreground">
              Version 1.0.0 • Built with Lovable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

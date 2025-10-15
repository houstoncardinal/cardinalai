import { useState } from 'react';
import { Palette, Download, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { PathwayTheme } from '@/lib/monacoThemes';

export const ThemeDesigner = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState<PathwayTheme>({
    id: 'custom-theme',
    name: 'Custom Theme',
    base: 'vs-dark',
    colors: {
      'editor.background': '#1a1a1a',
      'editor.foreground': '#ffffff',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editor.selectionBackground': '#3a3a3a',
    },
    tokenColors: [
      { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
      { token: 'string', foreground: 'ce9178' },
    ],
  });

  const updateColor = (key: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  const addTokenColor = () => {
    setTheme(prev => ({
      ...prev,
      tokenColors: [
        ...prev.tokenColors,
        { token: 'new-token', foreground: 'ffffff' },
      ],
    }));
  };

  const updateTokenColor = (index: number, field: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      tokenColors: prev.tokenColors.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc
      ),
    }));
  };

  const removeTokenColor = (index: number) => {
    setTheme(prev => ({
      ...prev,
      tokenColors: prev.tokenColors.filter((_, i) => i !== index),
    }));
  };

  const exportTheme = () => {
    const json = JSON.stringify(theme, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.id}.json`;
    a.click();
    toast({
      title: 'Theme exported',
      description: `Saved as ${theme.id}.json`,
    });
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setTheme(imported);
        toast({
          title: 'Theme imported',
          description: `Loaded ${imported.name}`,
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid theme file',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="glass-panel p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">THEME DESIGNER</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={exportTheme}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <label>
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importTheme}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Theme Name</Label>
          <Input
            value={theme.name}
            onChange={(e) => setTheme({ ...theme, name: e.target.value })}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Theme ID</Label>
          <Input
            value={theme.id}
            onChange={(e) => setTheme({ ...theme, id: e.target.value })}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Base Theme</Label>
          <select
            value={theme.base}
            onChange={(e) => setTheme({ ...theme, base: e.target.value as any })}
            className="w-full h-8 px-2 text-xs rounded bg-secondary border border-border"
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>
      </div>

      <div>
        <Label className="text-xs mb-2 block">Editor Colors</Label>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {Object.entries(theme.colors).map(([key, value]) => (
              <div key={key} className="flex gap-2 items-center">
                <Input
                  value={key}
                  disabled
                  className="h-7 text-[10px] flex-1"
                />
                <Input
                  type="color"
                  value={`#${value}`}
                  onChange={(e) => updateColor(key, e.target.value.slice(1))}
                  className="h-7 w-14"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs">Token Colors</Label>
          <Button size="sm" variant="ghost" onClick={addTokenColor} className="h-6 px-2">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {theme.tokenColors.map((tc, idx) => (
              <div key={idx} className="flex gap-2 items-center glass-panel p-2 rounded">
                <Input
                  value={tc.token}
                  onChange={(e) => updateTokenColor(idx, 'token', e.target.value)}
                  placeholder="Token"
                  className="h-7 text-[10px] flex-1"
                />
                <Input
                  type="color"
                  value={`#${tc.foreground}`}
                  onChange={(e) => updateTokenColor(idx, 'foreground', e.target.value.slice(1))}
                  className="h-7 w-14"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTokenColor(idx)}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

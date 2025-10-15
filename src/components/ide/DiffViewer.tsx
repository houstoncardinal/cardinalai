import { useState, useEffect } from 'react';
import { FileCode, Plus, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiffViewerProps {
  file: string;
  oldContent: string;
  newContent: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber: number;
}

export const DiffViewer = ({ file, oldContent, newContent }: DiffViewerProps) => {
  const [diff, setDiff] = useState<DiffLine[]>([]);

  useEffect(() => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const result: DiffLine[] = [];

    // Simple diff algorithm (can be enhanced with proper diff library)
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        result.push({ type: 'context', content: oldLine || '', lineNumber: i + 1 });
      } else {
        if (oldLine !== undefined) {
          result.push({ type: 'remove', content: oldLine, lineNumber: i + 1 });
        }
        if (newLine !== undefined) {
          result.push({ type: 'add', content: newLine, lineNumber: i + 1 });
        }
      }
    }

    setDiff(result);
  }, [oldContent, newContent]);

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center gap-2">
        <FileCode className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{file}</span>
      </div>
      <ScrollArea className="h-96">
        <div className="font-mono text-xs">
          {diff.map((line, idx) => (
            <div
              key={idx}
              className={`px-4 py-1 flex items-center gap-3 ${
                line.type === 'add'
                  ? 'bg-green-500/10 text-green-400'
                  : line.type === 'remove'
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="w-8 text-right opacity-50">{line.lineNumber}</span>
              <span className="w-4">
                {line.type === 'add' && <Plus className="w-3 h-3" />}
                {line.type === 'remove' && <Minus className="w-3 h-3" />}
              </span>
              <span className="flex-1">{line.content}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

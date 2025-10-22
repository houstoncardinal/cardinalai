import { Search, X, Replace, CaseSensitive, Regex, WholeWord } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fileSystem, FileNode } from '@/lib/fileSystem';
import { useIdeStore } from '@/store/ideStore';

interface SearchPanelProps {
  onClose: () => void;
}

export const SearchPanel = ({ onClose }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [results, setResults] = useState<Array<{ file: FileNode; matches: number }>>([]);
  const [showReplace, setShowReplace] = useState(false);
  const { addTab, setActiveTab } = useIdeStore();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      await fileSystem.init();
      const files = await fileSystem.searchFiles(searchQuery);
      
      const searchResults = files.map(file => {
        let count = 0;
        if (file.content) {
          const flags = caseSensitive ? 'g' : 'gi';
          const pattern = useRegex 
            ? new RegExp(searchQuery, flags)
            : new RegExp(
                wholeWord ? `\\b${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b` : searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                flags
              );
          const matches = file.content.match(pattern);
          count = matches ? matches.length : 0;
        }
        return { file, matches: count };
      }).filter(r => r.matches > 0);

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleOpenFile = async (fileId: string) => {
    const file = await fileSystem.getFile(fileId);
    if (!file) return;

    const newTab = {
      id: `${Date.now()}-${file.id}`,
      title: file.name,
      content: file.content || '',
      language: file.language || 'plaintext',
      modified: false,
      fileId: file.id,
    };
    addTab(newTab);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Search & Replace</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search inputs */}
        <div className="p-4 space-y-3 border-b border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {showReplace && (
            <div className="flex gap-2">
              <Input
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Replace className="w-4 h-4 mr-2" />
                Replace
              </Button>
            </div>
          )}

          {/* Search options */}
          <div className="flex items-center gap-2">
            <Button
              variant={caseSensitive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCaseSensitive(!caseSensitive)}
              title="Match Case"
            >
              <CaseSensitive className="w-4 h-4" />
            </Button>
            <Button
              variant={wholeWord ? 'default' : 'outline'}
              size="sm"
              onClick={() => setWholeWord(!wholeWord)}
              title="Match Whole Word"
            >
              <WholeWord className="w-4 h-4" />
            </Button>
            <Button
              variant={useRegex ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUseRegex(!useRegex)}
              title="Use Regular Expression"
            >
              <Regex className="w-4 h-4" />
            </Button>
            <Button
              variant={showReplace ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setShowReplace(!showReplace)}
              className="ml-auto"
            >
              <Replace className="w-4 h-4 mr-2" />
              Replace
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {results.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found</p>
              <p className="text-xs mt-1">Try searching for something else</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(({ file, matches }) => (
                <button
                  key={file.id}
                  onClick={() => handleOpenFile(file.id)}
                  className="w-full text-left p-3 rounded glass-panel hover:bg-primary/10 smooth-transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{file.path}</span>
                    <span className="text-xs text-primary">{matches} matches</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

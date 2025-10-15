import { useState } from 'react';
import { Code2, Wand2, Loader2, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useIdeStore } from '@/store/ideStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';

export const CodeGenerator = () => {
  const { addTab } = useIdeStore();
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const frameworks = [
    { value: 'react', label: 'React + TypeScript' },
    { value: 'vue', label: 'Vue 3' },
    { value: 'angular', label: 'Angular' },
    { value: 'node', label: 'Node.js API' },
    { value: 'python', label: 'Python' },
  ];

  const [framework, setFramework] = useState('react');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Enter a prompt',
        description: 'Please describe what code you want to generate',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setGeneratedCode('');

    try {
      const { data, error } = await supabase.functions.invoke('code-generator', {
        body: {
          prompt,
          framework,
        },
      });

      if (error) throw error;

      setGeneratedCode(data.code);
      setFileName(data.fileName || 'generated.tsx');
      setLanguage(data.language || 'typescript');

      toast({
        title: 'Code generated!',
        description: 'Your code is ready to use',
      });
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const handleAddToEditor = () => {
    if (!generatedCode) return;

    addTab({
      id: `generated-${Date.now()}`,
      title: fileName,
      content: generatedCode,
      language,
      modified: false,
    });

    toast({
      title: 'Added to editor',
      description: `${fileName} opened in a new tab`,
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: `${fileName} saved to your downloads`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border metal-shine">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold tracking-wide">CODE GENERATOR</h2>
        </div>

        <Tabs value={framework} onValueChange={setFramework} className="mb-3">
          <TabsList className="grid grid-cols-5 w-full h-9">
            {frameworks.map((fw) => (
              <TabsTrigger key={fw.value} value={fw.value} className="text-xs">
                {fw.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Textarea
          placeholder="Describe the code you want to generate... (e.g., 'Create a React component for a pricing table with 3 tiers')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="glass-panel border-border resize-none h-24 text-xs mb-3"
        />

        <Button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full metal-shine"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Code2 className="w-3.5 h-3.5 mr-2" />
              Generate Code
            </>
          )}
        </Button>
      </div>

      {generatedCode && (
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <span className="font-mono text-primary">{fileName}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
                title="Copy code"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleDownload}
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs metal-shine"
                onClick={handleAddToEditor}
              >
                Add to Editor
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={generatedCode}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </div>
        </div>
      )}

      {!generatedCode && !loading && (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <Code2 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Describe your code requirements above
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              PathwayAI will generate production-ready code instantly
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

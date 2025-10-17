import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fileSystem } from '@/lib/fileSystem';
import { useIdeStore } from '@/store/ideStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Code, Eye, Save, Wand2, Copy, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ComponentTemplate {
  name: string;
  description: string;
  framework: string;
  preview: string;
  code: string;
}

const TEMPLATES: ComponentTemplate[] = [
  {
    name: 'Button',
    description: 'Interactive button component',
    framework: 'react',
    preview: '<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Click me</button>',
    code: `export const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button
      onClick={onClick}
      className={\`px-4 py-2 rounded font-medium transition-all \${
        variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
        variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' :
        'bg-transparent hover:bg-gray-100'
      }\`}
    >
      {children}
    </button>
  );
};`
  },
  {
    name: 'Card',
    description: 'Container card with shadow',
    framework: 'react',
    preview: '<div class="p-6 bg-white rounded-lg shadow-lg"><h3 class="text-xl font-bold mb-2">Card Title</h3><p class="text-gray-600">Card content goes here</p></div>',
    code: `export const Card = ({ title, children, className = '' }) => {
  return (
    <div className={\`p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow \${className}\`}>
      {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
      <div className="text-gray-600">{children}</div>
    </div>
  );
};`
  },
  {
    name: 'Hero Section',
    description: 'Landing page hero section',
    framework: 'react',
    preview: '<div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-16 text-center"><h1 class="text-5xl font-bold mb-4">Welcome to Your App</h1><p class="text-xl mb-8">Build amazing things</p><button class="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold">Get Started</button></div>',
    code: `export const Hero = ({ title, subtitle, ctaText, onCtaClick }) => {
  return (
    <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-20 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">{title}</h1>
        <p className="text-xl md:text-2xl mb-10 opacity-90">{subtitle}</p>
        <button
          onClick={onCtaClick}
          className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all"
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
};`
  },
];

export const ComponentBuilder = () => {
  const [componentName, setComponentName] = useState('');
  const [componentDescription, setComponentDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addTab } = useIdeStore();

  const handleTemplateSelect = (template: ComponentTemplate) => {
    setSelectedTemplate(template.name);
    setComponentName(template.name);
    setComponentDescription(template.description);
    setGeneratedCode(template.code);
    setPreviewHtml(template.preview);
  };

  const handleGenerateWithAI = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a component description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-file-generator', {
        body: {
          prompt: `Create a React component with the following requirements: ${customPrompt}
          
Include:
1. Clean, modern React code with TypeScript types
2. Tailwind CSS for styling
3. Props interface
4. Responsive design
5. Accessibility features

Return ONLY the component code, no explanations.`,
          projectContext: 'React component with Tailwind CSS',
        },
      });

      if (error) throw error;

      const result = JSON.parse(data);
      if (result.files && result.files[0]) {
        setGeneratedCode(result.files[0].content);
        setComponentName(result.files[0].name.replace('.tsx', '').replace('.jsx', ''));
        
        // Generate preview HTML from the React code
        const previewCode = generatePreviewFromReact(result.files[0].content);
        setPreviewHtml(previewCode);
        
        toast({
          title: 'Component generated',
          description: 'Your component is ready!',
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate component',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewFromReact = (code: string): string => {
    // Simple conversion for preview - in real app you'd use a proper React renderer
    const extractedJSX = code.match(/return \(([\s\S]*?)\);/)?.[1] || '';
    return extractedJSX
      .replace(/className=/g, 'class=')
      .replace(/\{.*?\}/g, 'placeholder')
      .replace(/\n\s*/g, '');
  };

  const handleSaveComponent = async () => {
    if (!componentName || !generatedCode) {
      toast({
        title: 'Error',
        description: 'Please generate or select a component first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await fileSystem.init();
      
      // Find or create components folder
      const rootFiles = await fileSystem.getRootFiles();
      let componentsFolder = rootFiles.find(f => f.name === 'components' && f.type === 'folder');
      
      if (!componentsFolder) {
        componentsFolder = await fileSystem.createFile('components', 'folder', null);
      }

      // Create the component file
      const fileName = `${componentName}.tsx`;
      await fileSystem.createFile(
        fileName,
        'file',
        componentsFolder.id,
        generatedCode,
        'typescript'
      );

      toast({
        title: 'Component saved',
        description: `${fileName} has been created in the components folder`,
      });

      // Open in editor
      const newTab = {
        id: `${Date.now()}-${fileName}`,
        title: fileName,
        content: generatedCode,
        language: 'typescript',
        modified: false,
      };
      addTab(newTab);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save component',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copied',
      description: 'Component code copied to clipboard',
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[hsl(var(--panel-bg))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Component Builder</h2>
            <p className="text-xs text-muted-foreground">Create custom components in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {generatedCode && (
            <>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy
              </Button>
              <Button onClick={handleSaveComponent} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save to Project
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Builder */}
        <div className="w-1/2 border-r border-border flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent px-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="ai">AI Generate</TabsTrigger>
              <TabsTrigger value="custom">Custom Code</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="templates" className="mt-0 space-y-4">
                  <div>
                    <Label>Choose a Template</Label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.name}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-4 text-left rounded-lg border-2 transition-all hover:border-primary ${
                            selectedTemplate === template.name
                              ? 'border-primary bg-primary/5'
                              : 'border-border'
                          }`}
                        >
                          <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="mt-0 space-y-4">
                  <div>
                    <Label>Component Name</Label>
                    <Input
                      placeholder="e.g., ProductCard, NavigationBar"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Describe Your Component</Label>
                    <Textarea
                      placeholder="Describe what you want to build... e.g., 'A pricing card with three tiers, each with a title, price, features list, and a call-to-action button. Make it modern and glassmorphic.'"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="custom" className="mt-0 space-y-4">
                  <div>
                    <Label>Component Name</Label>
                    <Input
                      placeholder="MyComponent"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Component Code</Label>
                    <Textarea
                      placeholder="Paste or write your component code here..."
                      value={generatedCode}
                      onChange={(e) => setGeneratedCode(e.target.value)}
                      className="mt-2 font-mono text-xs min-h-[300px]"
                    />
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Panel - Preview & Code */}
        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="preview" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent px-6">
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 m-0 p-6">
              {previewHtml ? (
                <div className="w-full h-full glass-panel rounded-lg p-8 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Eye className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No component to preview</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select a template or generate with AI
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="code" className="flex-1 m-0">
              {generatedCode ? (
                <ScrollArea className="h-full">
                  <pre className="p-6 text-xs font-mono">
                    <code>{generatedCode}</code>
                  </pre>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Code className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No code generated yet</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Generate a component to see the code
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

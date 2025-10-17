import { useEffect, useRef, useState } from 'react';
import { fileSystem } from '@/lib/fileSystem';
import { useIdeStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

export const LivePreview = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);
  const { tabs } = useIdeStore();

  const buildAndPreview = async () => {
    setLoading(true);
    try {
      // Get all files
      await fileSystem.init();
      const allFiles = await fileSystem.getRootFiles();
      
      // Build HTML with inline CSS and JS
      let html = '';
      let css = '';
      let js = '';
      
      const processNode = async (node: any) => {
        if (node.type === 'file') {
          const file = await fileSystem.getFile(node.id);
          if (!file) return;
          
          if (file.name.endsWith('.html')) {
            html = file.content || '';
          } else if (file.name.endsWith('.css')) {
            css = file.content || '';
          } else if (file.name.endsWith('.js')) {
            js = file.content || '';
          }
        } else if (node.type === 'folder') {
          const children = await fileSystem.getChildren(node.id);
          for (const child of children) {
            await processNode(child);
          }
        }
      };
      
      for (const node of allFiles) {
        await processNode(node);
      }
      
      // If no HTML found, create a basic template
      if (!html) {
        html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
  <div id="app">
    <h1>Preview</h1>
    <p>Create an index.html file to see your app here!</p>
  </div>
</body>
</html>`;
      }
      
      // Inject CSS and JS into HTML
      let finalHtml = html;
      
      if (css) {
        finalHtml = finalHtml.replace('</head>', `<style>${css}</style></head>`);
      }
      
      if (js) {
        finalHtml = finalHtml.replace('</body>', `<script>${js}</script></body>`);
      }
      
      // Update iframe
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(finalHtml);
          iframeDoc.close();
        }
      }
    } catch (error) {
      console.error('Failed to build preview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buildAndPreview();
  }, [tabs]);

  const handleRefresh = () => {
    buildAndPreview();
  };

  const handleOpenInNewTab = () => {
    const iframeDoc = iframeRef.current?.contentDocument;
    if (iframeDoc) {
      const htmlContent = iframeDoc.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[hsl(var(--panel-bg))]">
        <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};

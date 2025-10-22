import { useEffect, useRef, useState } from 'react';
import { fileSystem } from '@/lib/fileSystem';
import { useIdeStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, Maximize2, X, Minimize2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceConfig {
  width: number;
  height: number;
  label: string;
  icon: any;
}

const DEVICES: Record<DeviceType, DeviceConfig> = {
  desktop: { width: 1920, height: 1080, label: 'Desktop', icon: Monitor },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: Tablet },
  mobile: { width: 375, height: 667, label: 'Mobile', icon: Smartphone },
};

interface LivePreviewProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const LivePreview = ({ onClose, showCloseButton = false }: LivePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [zoom, setZoom] = useState(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const { tabs } = useIdeStore();
  
  const currentDevice = DEVICES[device];
  const actualWidth = orientation === 'portrait' ? currentDevice.height : currentDevice.width;
  const actualHeight = orientation === 'portrait' ? currentDevice.width : currentDevice.height;

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

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 10));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(25, prev - 10));
  };

  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scaleX = (container.clientWidth - 40) / actualWidth;
    const scaleY = (container.clientHeight - 40) / actualHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    setZoom(Math.round(scale * 100));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Enhanced Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[hsl(var(--panel-bg))] gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {actualWidth} × {actualHeight}
          </span>
        </div>
        
        {/* Device Selector */}
        <div className="flex items-center gap-1 sm:gap-2">
          {(Object.keys(DEVICES) as DeviceType[]).map((deviceType) => {
            const DeviceIcon = DEVICES[deviceType].icon;
            return (
              <Button
                key={deviceType}
                variant={device === deviceType ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setDevice(deviceType)}
                title={DEVICES[deviceType].label}
                className="w-7 h-7 sm:w-8 sm:h-8"
              >
                <DeviceIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Orientation Toggle */}
          {device !== 'desktop' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleOrientation}
              title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
              className="w-7 h-7 sm:w-8 sm:h-8 hidden sm:flex"
            >
              <div className="relative w-4 h-4">
                <div 
                  className={`absolute inset-0 border-2 border-current rounded transition-transform ${
                    orientation === 'portrait' ? 'w-3 h-4' : 'w-4 h-3'
                  }`}
                />
              </div>
            </Button>
          )}

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 glass-panel rounded">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              className="w-6 h-6"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs font-mono w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="w-6 h-6"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFitToScreen}
            title="Fit to screen"
            className="w-7 h-7 sm:w-8 sm:h-8 hidden sm:flex"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>

          <div className="w-px h-6 bg-border hidden sm:block" />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
            className="w-7 h-7 sm:w-8 sm:h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenInNewTab}
            title="Open in new tab"
            className="w-7 h-7 sm:w-8 sm:h-8 hidden sm:flex"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>

          {showCloseButton && onClose && (
            <>
              <div className="w-px h-6 bg-border" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close preview"
                className="w-7 h-7 sm:w-8 sm:h-8"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[hsl(var(--muted))] p-4 flex items-center justify-center"
      >
        <div
          className="bg-white shadow-2xl transition-all duration-300 rounded-lg overflow-hidden"
          style={{
            width: `${actualWidth}px`,
            height: `${actualHeight}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

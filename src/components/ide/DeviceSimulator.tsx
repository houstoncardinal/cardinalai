import { useState } from 'react';
import { Monitor, Smartphone, Tablet, RotateCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'phone' | 'tablet' | 'desktop';
  os: 'ios' | 'android' | 'web';
}

const devices: Device[] = [
  // iPhones
  { id: 'iphone15pro', name: 'iPhone 15 Pro Max', width: 430, height: 932, type: 'phone', os: 'ios' },
  { id: 'iphone15', name: 'iPhone 15', width: 393, height: 852, type: 'phone', os: 'ios' },
  { id: 'iphone14pro', name: 'iPhone 14 Pro', width: 393, height: 852, type: 'phone', os: 'ios' },
  { id: 'iphoneSE', name: 'iPhone SE', width: 375, height: 667, type: 'phone', os: 'ios' },
  
  // Android Phones
  { id: 'galaxyS24', name: 'Samsung Galaxy S24 Ultra', width: 412, height: 915, type: 'phone', os: 'android' },
  { id: 'galaxyS23', name: 'Samsung Galaxy S23', width: 360, height: 780, type: 'phone', os: 'android' },
  { id: 'pixel8pro', name: 'Google Pixel 8 Pro', width: 412, height: 915, type: 'phone', os: 'android' },
  { id: 'pixel7', name: 'Google Pixel 7', width: 412, height: 915, type: 'phone', os: 'android' },
  
  // Tablets
  { id: 'ipadpro13', name: 'iPad Pro 13"', width: 1024, height: 1366, type: 'tablet', os: 'ios' },
  { id: 'ipadair', name: 'iPad Air', width: 820, height: 1180, type: 'tablet', os: 'ios' },
  { id: 'galaxytabs9', name: 'Samsung Galaxy Tab S9', width: 800, height: 1280, type: 'tablet', os: 'android' },
  
  // Desktop
  { id: 'desktop1080', name: 'Desktop 1920x1080', width: 1920, height: 1080, type: 'desktop', os: 'web' },
  { id: 'desktop1440', name: 'Desktop 2560x1440', width: 2560, height: 1440, type: 'desktop', os: 'web' },
  { id: 'macbook', name: 'MacBook Pro 16"', width: 1728, height: 1117, type: 'desktop', os: 'web' },
];

interface DeviceSimulatorProps {
  onClose: () => void;
}

export const DeviceSimulator = ({ onClose }: DeviceSimulatorProps) => {
  const [selectedDevice, setSelectedDevice] = useState<Device>(devices[0]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [scale, setScale] = useState(0.5);

  const currentWidth = orientation === 'portrait' ? selectedDevice.width : selectedDevice.height;
  const currentHeight = orientation === 'portrait' ? selectedDevice.height : selectedDevice.width;

  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Smartphone className="w-3.5 h-3.5" />;
      case 'tablet': return <Tablet className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 metal-panel border-b flex items-center justify-between px-3 md:px-6 overflow-x-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold tracking-wide">DEVICE SIMULATOR</h2>
            </div>
            
            <div className="flex items-center gap-2 ml-6">
              <Select
                value={selectedDevice.id}
                onValueChange={(id) => {
                  const device = devices.find(d => d.id === id);
                  if (device) setSelectedDevice(device);
                }}
              >
                <SelectTrigger className="w-[180px] md:w-[240px] h-8 text-xs metal-shine">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel">
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        <span>{device.name}</span>
                        <span className="text-muted-foreground ml-auto">
                          {device.width}×{device.height}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 metal-shine"
                onClick={toggleOrientation}
                title="Rotate device"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </Button>

              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-muted-foreground hidden md:inline">Scale:</span>
                <Select
                  value={scale.toString()}
                  onValueChange={(val) => setScale(parseFloat(val))}
                >
                  <SelectTrigger className="w-[80px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel">
                    <SelectItem value="0.25">25%</SelectItem>
                    <SelectItem value="0.5">50%</SelectItem>
                    <SelectItem value="0.75">75%</SelectItem>
                    <SelectItem value="1">100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {currentWidth} × {currentHeight} • {selectedDevice.os.toUpperCase()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Simulator Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/20">
          <div className="min-h-full flex items-center justify-center p-8">
            <div
              className="relative"
              style={{
                width: currentWidth * scale,
                height: currentHeight * scale,
              }}
            >
              {/* Device Frame */}
              <div className="absolute inset-0 rounded-[2.5rem] metal-panel sharp-shadow overflow-hidden">
                {/* Device Notch/Camera (for phones) */}
                {selectedDevice.type === 'phone' && selectedDevice.os === 'ios' && orientation === 'portrait' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-background rounded-b-3xl z-10" />
                )}

                {/* Screen Content */}
                <div className="absolute inset-4 bg-background rounded-[2rem] overflow-hidden">
                  <iframe
                    src={window.location.origin}
                    className="w-full h-full border-0"
                    title="Device Preview"
                    style={{
                      width: currentWidth,
                      height: currentHeight,
                      transform: `scale(${(currentWidth * scale - 32) / currentWidth})`,
                      transformOrigin: 'top left',
                    }}
                  />
                </div>

                {/* Home Indicator (iOS) */}
                {selectedDevice.os === 'ios' && orientation === 'portrait' && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full" />
                )}
              </div>

              {/* Device Info Badge */}
              <div className="absolute -top-8 left-0 glass-panel px-3 py-1.5 rounded text-xs">
                <span className="text-muted-foreground">Device:</span>
                <span className="ml-2 font-semibold text-primary">{selectedDevice.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

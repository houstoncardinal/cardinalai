import React from 'react';
import { Clock, File, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdeStore } from '@/store/ideStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export const RecentFiles: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useIdeStore();
  
  // Get recently opened tabs (last 10)
  const recentTabs = [...tabs]
    .sort((a, b) => {
      // Active tab first
      if (a.id === activeTabId) return -1;
      if (b.id === activeTabId) return 1;
      return 0;
    })
    .slice(0, 10);

  if (recentTabs.length === 0) {
    return (
      <div className="p-4 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No recent files</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      <div className="px-3 py-2 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Files
        </h3>
      </div>
      
      <ScrollArea className="max-h-[200px]">
        <div className="px-2 pb-2 space-y-0.5">
          <AnimatePresence mode="popLayout">
            {recentTabs.map((tab) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'group flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors cursor-pointer',
                  activeTabId === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondary/50 text-foreground'
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <File className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 truncate">{tab.title}</span>
                {tab.modified && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};
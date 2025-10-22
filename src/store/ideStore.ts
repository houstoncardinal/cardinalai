import { create } from 'zustand';

export type ThemeName = 'obsidian' | 'pearl' | 'titanium';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: string;
}

export interface EditorTab {
  id: string;
  title: string;
  content: string;
  language: string;
  modified: boolean;
  fileId?: string;
}

export interface IdeState {
  theme: ThemeName;
  activeTabId: string | null;
  tabs: EditorTab[];
  commandPaletteOpen: boolean;
  aiPanelOpen: boolean;
  terminalOpen: boolean;
  gitPanelOpen: boolean;
  fileExplorerOpen: boolean;
  livePreviewOpen: boolean;
  aiHistory: AiMessage[];
  simulatorOpen: boolean;
  codeGeneratorOpen: boolean;
  componentBuilderOpen: boolean;
  previewUrl: string | null;
  projectInitialized: boolean;
  fileSystemRefreshTrigger: number;
  
  setTheme: (theme: ThemeName) => void;
  triggerFileSystemRefresh: () => void;
  addTab: (tab: EditorTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
  toggleTerminal: () => void;
  toggleGitPanel: () => void;
  toggleFileExplorer: () => void;
  toggleLivePreview: () => void;
  addAiMessage: (message: AiMessage) => void;
  clearAiHistory: () => void;
  toggleSimulator: () => void;
  toggleCodeGenerator: () => void;
  toggleComponentBuilder: () => void;
  setPreviewUrl: (url: string | null) => void;
  setProjectInitialized: (initialized: boolean) => void;
  refreshTabs: () => void;
}

export const useIdeStore = create<IdeState>((set) => ({
  theme: 'obsidian',
  activeTabId: null,
  tabs: [],
  commandPaletteOpen: false,
  aiPanelOpen: true,
  terminalOpen: false,
  gitPanelOpen: false,
  fileExplorerOpen: true,
  livePreviewOpen: true,
  aiHistory: [],
  simulatorOpen: false,
  codeGeneratorOpen: false,
  componentBuilderOpen: false,
  previewUrl: null,
  projectInitialized: false,
  fileSystemRefreshTrigger: 0,
  
  setTheme: (theme) => set({ theme }),
  triggerFileSystemRefresh: () => set((state) => ({ 
    fileSystemRefreshTrigger: state.fileSystemRefreshTrigger + 1 
  })),
  addTab: (tab) => set((state) => ({ 
    tabs: [...state.tabs, tab],
    activeTabId: tab.id
  })),
  closeTab: (id) => set((state) => {
    const newTabs = state.tabs.filter((t) => t.id !== id);
    const newActiveId = state.activeTabId === id 
      ? (newTabs.length > 0 ? newTabs[0].id : null)
      : state.activeTabId;
    return { tabs: newTabs, activeTabId: newActiveId };
  }),
  setActiveTab: (id) => set({ activeTabId: id }),
  updateTabContent: (id, content) => set((state) => ({
    tabs: state.tabs.map((t) => 
      t.id === id ? { ...t, content, modified: true } : t
    )
  })),
  toggleCommandPalette: () => set((state) => ({ 
    commandPaletteOpen: !state.commandPaletteOpen 
  })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  toggleGitPanel: () => set((state) => ({ gitPanelOpen: !state.gitPanelOpen })),
  toggleFileExplorer: () => set((state) => ({ 
    fileExplorerOpen: !state.fileExplorerOpen 
  })),
  toggleLivePreview: () => set((state) => ({ livePreviewOpen: !state.livePreviewOpen })),
  addAiMessage: (message) => set((state) => ({ 
    aiHistory: [...state.aiHistory, message] 
  })),
  clearAiHistory: () => set({ aiHistory: [] }),
  toggleSimulator: () => set((state) => ({ simulatorOpen: !state.simulatorOpen })),
  toggleCodeGenerator: () => set((state) => ({ codeGeneratorOpen: !state.codeGeneratorOpen })),
  toggleComponentBuilder: () => set((state) => ({ componentBuilderOpen: !state.componentBuilderOpen })),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setProjectInitialized: (initialized) => set({ projectInitialized: initialized }),
  refreshTabs: () => set((state) => ({ tabs: [...state.tabs] })),
}));

export interface TokenThemeRule {
  token: string;
  foreground?: string;
  fontStyle?: string;
}

export interface PathwayTheme {
  id: string;
  name: string;
  base: 'vs' | 'vs-dark' | 'hc-black';
  colors: Record<string, string>;
  tokenColors: TokenThemeRule[];
}

export const obsidianTheme: PathwayTheme = {
  id: 'pathway-obsidian',
  name: 'Pathway Obsidian',
  base: 'vs-dark',
  colors: {
    'editor.background': '#121212',
    'editor.foreground': '#fafafa',
    'editor.lineHighlightBackground': '#1a1a1a',
    'editor.selectionBackground': '#2a2a2a',
    'editorCursor.foreground': '#f5f5f5',
    'editorLineNumber.foreground': '#666666',
    'editorLineNumber.activeForeground': '#f5f5f5',
  },
  tokenColors: [
    { token: 'comment', foreground: '666666', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'e5e5e5', fontStyle: 'bold' },
    { token: 'string', foreground: 'a8a8a8' },
    { token: 'number', foreground: 'd4d4d4' },
    { token: 'function', foreground: 'f0f0f0' },
    { token: 'variable', foreground: 'e0e0e0' },
  ],
};

export const pearlTheme: PathwayTheme = {
  id: 'pathway-pearl',
  name: 'Pathway Pearl',
  base: 'vs',
  colors: {
    'editor.background': '#fafafa',
    'editor.foreground': '#1a1a1a',
    'editor.lineHighlightBackground': '#f0f0f0',
    'editor.selectionBackground': '#e0e0e0',
    'editorCursor.foreground': '#1a1a1a',
    'editorLineNumber.foreground': '#999999',
    'editorLineNumber.activeForeground': '#1a1a1a',
  },
  tokenColors: [
    { token: 'comment', foreground: '999999', fontStyle: 'italic' },
    { token: 'keyword', foreground: '1a1a1a', fontStyle: 'bold' },
    { token: 'string', foreground: '4a4a4a' },
    { token: 'number', foreground: '2a2a2a' },
    { token: 'function', foreground: '0a0a0a' },
    { token: 'variable', foreground: '1f1f1f' },
  ],
};

export const titaniumTheme: PathwayTheme = {
  id: 'pathway-titanium',
  name: 'Pathway Titanium',
  base: 'vs-dark',
  colors: {
    'editor.background': '#3a4452',
    'editor.foreground': '#fafafa',
    'editor.lineHighlightBackground': '#424e5e',
    'editor.selectionBackground': '#4a5664',
    'editorCursor.foreground': '#d9e1ec',
    'editorLineNumber.foreground': '#7a8694',
    'editorLineNumber.activeForeground': '#d9e1ec',
  },
  tokenColors: [
    { token: 'comment', foreground: '7a8694', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'd9e1ec', fontStyle: 'bold' },
    { token: 'string', foreground: 'b4c2d4' },
    { token: 'number', foreground: 'c9d5e4' },
    { token: 'function', foreground: 'e5edf5' },
    { token: 'variable', foreground: 'd4dfe9' },
  ],
};

export const themeRegistry: Record<string, PathwayTheme> = {
  obsidian: obsidianTheme,
  pearl: pearlTheme,
  titanium: titaniumTheme,
};

export const defineMonacoTheme = (monaco: any, theme: PathwayTheme) => {
  monaco.editor.defineTheme(theme.id, {
    base: theme.base,
    inherit: true,
    rules: theme.tokenColors.map(rule => ({
      token: rule.token,
      foreground: rule.foreground,
      fontStyle: rule.fontStyle,
    })),
    colors: theme.colors,
  });
};

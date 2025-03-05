import * as monaco from 'monaco-editor';
import CodeFilesPlugin from "./codeFilesPlugin";
import { themes } from './themes';

// Use a very simple worker setup for Monaco
// This approach disables web workers but allows Monaco to work in environments 
// where workers are restricted, like Obsidian
self.MonacoEnvironment = {
  getWorker: function() {
    // Return a proxy worker that does nothing
    return {
      // This is a minimal mock of a Worker to avoid errors
      addEventListener: () => {},
      removeEventListener: () => {},
      postMessage: () => {},
      terminate: () => {}
    };
  }
};

// Store loaded themes to avoid repeated loading
const loadedThemes = new Set<string>();

// Basic Monaco styles as inline CSS
const MONACO_BASE_CSS = `
/* Essential editor styling */
.monaco-editor {
  position: relative;
  overflow: hidden;
  text-rendering: optimizeLegibility;
}

/* Obsidian theme integration */
.monaco-editor,
.monaco-editor-background {
  background-color: var(--background-primary);
}

.monaco-editor,
.monaco-editor .inputarea,
.monaco-editor .view-line span {
  font-family: var(--font-monospace);
  font-size: 14px;
  line-height: 1.5;
}

/* Margins and line numbers */
.monaco-editor .margin {
  background-color: var(--background-secondary);
}

.monaco-editor .margin-view-overlays .line-numbers {
  color: var(--text-muted);
}

/* Cursor */
.monaco-editor .cursor {
  background-color: var(--text-normal);
  width: 2px;
}

/* Selection */
.monaco-editor .selected-text,
.monaco-editor .view-overlays .selected-text {
  background-color: var(--text-selection) !important;
}

/* Line highlight */
.monaco-editor .view-overlays .current-line,
.monaco-editor .margin-view-overlays .current-line-margin {
  background-color: var(--background-modifier-hover);
  border: none;
}

/* Text coloring */
.monaco-editor .mtk1 {
  color: var(--text-normal);
}

/* Input handling */
.monaco-editor .inputarea {
  padding: 0 !important;
  border: 0 !important;
  outline: none !important;
  background: transparent !important;
  color: transparent !important;
}

/* Fix for newline behavior */
.monaco-editor .view-lines {
  white-space: pre;
}

.monaco-editor .view-line {
  position: relative;
  white-space: pre;
}
`;

// Initialize Monaco environment once
let monacoInitialized = false;
function initializeMonaco(plugin: CodeFilesPlugin) {
  if (monacoInitialized) return;
  
  // Disable features that depend on web workers
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ["node_modules/@types"]
  });
  
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2016,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    typeRoots: ["node_modules/@types"]
  });
  
  // Setup Obsidian-specific themes
  monaco.editor.defineTheme('obsidian-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#00000000', // Transparent background
      'editor.foreground': '#dcddde',
    }
  });
  
  monaco.editor.defineTheme('obsidian-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#00000000', // Transparent background
      'editor.foreground': '#2e3338',
    }
  });
  
  // Add Monaco CSS as a style element
  const styleElement = document.createElement('style');
  styleElement.textContent = MONACO_BASE_CSS;
  document.head.appendChild(styleElement);
  
  console.log("Monaco CSS added as inline styles");
  
  monacoInitialized = true;
}

// Helper function to convert theme name to monaco theme ID
function getMonacoTheme(theme: string): string {
  if (theme === 'default') {
    return document.body.classList.contains("theme-dark") 
      ? "obsidian-dark"
      : "obsidian-light";
  }
  
  // Handle VS Code built-in themes
  if (theme === 'vs-dark' || theme === 'vs' || theme === 'hc-black') {
    return theme;
  }
  
  // For custom themes, we'll use the kebab-case theme name
  return theme.toLowerCase().replace(/\s+/g, '-');
}

// Load theme definitions from bundled themes or fallback to CDN
async function loadTheme(themeName: string) {
  try {
    const themeId = getMonacoTheme(themeName);
    
    // Skip if already loaded or using built-in theme
    if (loadedThemes.has(themeId) || ['vs', 'vs-dark', 'hc-black', 'obsidian-dark', 'obsidian-light'].includes(themeId)) {
      return themeId;
    }
    
    // Try to load from CDN as a fallback for custom themes
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/npm/monaco-themes@0.4.4/themes/${themeId}.json`);
      if (response.ok) {
        const data = await response.json();
        monaco.editor.defineTheme(themeId, data);
        loadedThemes.add(themeId);
        return themeId;
      } else {
        console.warn(`Theme not found: ${themeId}, falling back to default`);
        return document.body.classList.contains("theme-dark") ? "obsidian-dark" : "obsidian-light";
      }
    } catch (error) {
      console.error(`Failed to load theme ${themeId}:`, error);
      return document.body.classList.contains("theme-dark") ? "obsidian-dark" : "obsidian-light";
    }
  } catch (error) {
    console.error(`Error in theme loading:`, error);
    return document.body.classList.contains("theme-dark") ? "obsidian-dark" : "obsidian-light";
  }
}

export const createMonacoEditor = async (
  plugin: CodeFilesPlugin,
  language: string,
  initialValue: string,
  container: HTMLElement,
  onChange?: () => void
) => {
  initializeMonaco(plugin);
  
  // Determine theme based on settings
  const themeName = plugin.settings.theme === "default"
    ? (document.body.classList.contains("theme-dark") ? "obsidian-dark" : "obsidian-light")
    : plugin.settings.theme;
  
  // Load theme if needed
  const themeId = await loadTheme(themeName);
  
  // Create editor instance with basic features that don't require workers
  const editor = monaco.editor.create(container, {
    value: initialValue,
    language: language,
    theme: themeId,
    automaticLayout: true,
    folding: plugin.settings.folding,
    lineNumbers: plugin.settings.lineNumbers ? 'on' : 'off',
    minimap: {
      enabled: plugin.settings.minimap
    },
    scrollBeyondLastLine: false,
    // Essential font settings
    fontFamily: 'var(--font-monospace)',
    fontSize: 14,
    lineHeight: 1.5,
    // Disable worker-dependent features
    quickSuggestions: false,
    formatOnType: false,
    formatOnPaste: false,
    parameterHints: { enabled: false },
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: true,
    wordBasedSuggestionsOnlySameLanguage: true,
  });
  
  // Apply transparent background if needed
  if (plugin.settings.overwriteBg) {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .monaco-editor .monaco-editor-background,
      .monaco-editor .margin-view-overlays,
      .monaco-editor .margin-view-overlays .line-numbers {
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Handle changes
  const model = editor.getModel();
  if (model) {
    model.onDidChangeContent(() => {
      onChange?.();
    });
  }
  
  // Return API similar to the existing one for easy integration
  return {
    container,
    editor,
    getValue: () => editor.getValue(),
    setValue: (value: string) => editor.setValue(value),
    clear: () => editor.setValue(""),
    destroy: () => {
      editor.dispose();
      if (model) model.dispose();
    },
  };
}; 
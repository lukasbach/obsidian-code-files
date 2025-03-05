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
.monaco-editor {
  font-feature-settings: "liga" 0, "calt" 0;
  line-height: 1.5;
  word-wrap: break-word;
  -webkit-text-size-adjust: 100%;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 12px;
}

/* Ensure consistent font measurements across editor */
.monaco-editor,
.monaco-editor .view-line span,
.monaco-editor .inputarea {
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0;
}

.monaco-editor .overflow-guard {
  position: relative;
  overflow: hidden;
}

.monaco-editor .cursors-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 4; /* Ensure cursor is above text */
}

.monaco-editor .cursor {
  position: absolute;
  overflow: hidden;
  background-color: var(--text-normal);
  border-color: var(--text-normal);
  width: 2px;
}

.monaco-editor .view-lines {
  position: relative;
  white-space: nowrap;
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0;
}

.monaco-editor .view-line {
  position: relative;
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 12px;
  line-height: 18px;
}

.monaco-editor .margin {
  background-color: var(--background-secondary);
  position: absolute;
  top: 0;
}

.monaco-editor .monaco-editor-background {
  background-color: var(--background-primary);
}

.monaco-editor .line-numbers {
  color: var(--text-muted);
  position: relative;
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: 12px;
}

.monaco-editor .current-line {
  border: none !important;
}

.monaco-editor .view-overlays .current-line {
  background-color: var(--background-modifier-hover);
}

.monaco-editor .margin-view-overlays .current-line-margin {
  background-color: var(--background-modifier-hover);
  border: none;
}

.monaco-editor .view-ruler {
  box-shadow: 1px 0 0 0 var(--background-modifier-border) inset;
}

.monaco-editor .inputarea {
  background-color: transparent !important;
  color: transparent !important;
  position: absolute !important;
  z-index: 1;
  padding: 0 !important;
  outline: none !important;
  resize: none !important;
  border: 0 !important;
  margin: 0 !important;
}

.monaco-editor .editor-scrollable {
  overflow: auto !important;
}

/* Fix for text rendering */
.monaco-editor .mtk1 {
  color: var(--text-normal);
}

.monaco-editor .scroll-decoration {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}

/* Ensure consistent character width */
.monaco-editor .monaco-editor-background,
.monaco-editor .view-lines,
.monaco-editor .view-line,
.monaco-editor .mtk1 {
  font-variant-ligatures: none;
  -webkit-font-feature-settings: "liga" 0, "calt" 0;
  font-feature-settings: "liga" 0, "calt" 0;
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
    automaticLayout: true, // Important for resizing
    folding: plugin.settings.folding,
    lineNumbers: plugin.settings.lineNumbers ? 'on' : 'off',
    minimap: {
      enabled: plugin.settings.minimap
    },
    scrollBeyondLastLine: false,
    // Font settings for proper cursor alignment
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 12,
    lineHeight: 18,
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
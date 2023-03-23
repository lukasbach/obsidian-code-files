
export interface MyPluginSettings {
	extensions: string[];
	folding: boolean;
	lineNumbers: boolean;
	minimap: boolean;
	semanticValidation: boolean;
	syntaxValidation: boolean;
	isDark: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	extensions: ["ts", "tsx", "js", "jsx", "json", "html", "py"],
	folding: true,
	lineNumbers: true,
	minimap: true,
	semanticValidation: true,
	syntaxValidation: true,
	isDark: true,
}


export const viewType = "code-editor";

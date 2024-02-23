export interface MyPluginSettings {
	extensions: string[];
	folding: boolean;
	lineNumbers: boolean;
	minimap: boolean;
	semanticValidation: boolean;
	syntaxValidation: boolean;
	theme: string;
	overwriteBg: boolean;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	extensions: ["ts", "tsx", "js", "jsx", "py"],
	folding: true,
	lineNumbers: true,
	minimap: true,
	semanticValidation: true,
	syntaxValidation: true,
	theme: "default",
	overwriteBg: true,
};

export const viewType = "code-editor";

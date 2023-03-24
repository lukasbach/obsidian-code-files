import {TextFileView, TFile, WorkspaceLeaf} from "obsidian";
import {viewType} from "./common";
import CodeFilesPlugin from "./codeFilesPlugin";

export class CodeEditorView extends TextFileView {
	static i = 0;
	id = CodeEditorView.i++;
	value: string = "";
	iframe: HTMLIFrameElement;

	constructor(leaf: WorkspaceLeaf, private plugin: CodeFilesPlugin) {
		super(leaf);
	}

	getDisplayText(): string {
		return this.file?.name;
	}

	getViewType(): string {
		return viewType;
	}

	getContext(file?: TFile) {
		return file?.path ?? this.file?.path;
	}

	async onClose() {
		await super.onClose();
		console.log("!!onClose", this.file?.name, this.id);
		this.iframe?.remove();
	}

	async onLoadFile(file: TFile) {
		await super.onLoadFile(file);
		console.log("!!onLoadFile", this.id, this.file?.name, file.name)

		const theme = this.plugin.settings.isDark ? "vs-dark" : "vs";

		const queryParameters = new URLSearchParams();
		queryParameters.append("context", this.getContext(file));
		queryParameters.append("lang", this.getLanguage());
		queryParameters.append("theme", theme);
		queryParameters.append("background", "transparent");
		queryParameters.append("folding", this.plugin.settings.folding ? "true" : "false");
		queryParameters.append("lineNumbers", this.plugin.settings.lineNumbers ? "on" : "off");
		queryParameters.append("minimap", this.plugin.settings.minimap ? "true" : "false");
		queryParameters.append("javascriptDefaults", "true");
		queryParameters.append("typescriptDefaults", "true");
		queryParameters.append("javascriptDefaultsNoSemanticValidation", !this.plugin.settings.semanticValidation ? "true" : "false");
		queryParameters.append("typescriptDefaultsNoSemanticValidation", !this.plugin.settings.semanticValidation ? "true" : "false");
		queryParameters.append("javascriptDefaultsNoSyntaxValidation", !this.plugin.settings.syntaxValidation ? "true" : "false");
		queryParameters.append("typescriptDefaultsNoSyntaxValidation", !this.plugin.settings.syntaxValidation ? "true" : "false");

		this.iframe = document.createElement("iframe");
		this.iframe.src = `https://embeddable-monaco.lukasbach.com?${queryParameters.toString()}`;
		this.iframe.style.width = "100%";
		this.iframe.style.height = "100%";
		(this.containerEl.getElementsByClassName("view-content")[0] as HTMLElement).style.overflow = "hidden";
		this.containerEl.getElementsByClassName("view-content")[0].append(this.iframe);
		window.addEventListener("message", ({data}) => {
			switch (data.type) {
				case "ready": {
					this.send("change-value", {value: this.value});
					this.send("change-language", {language: this.getLanguage()});
					this.send("change-background", {background: "transparent", theme});
					break;
				}
				case "change": {
					if (data.context === this.getContext()) {
						console.log("!change event", data.value, data.context);
						this.value = data.value;
					} else {
						console.log("!change event", data.value, data.context, "ignored!!!!!!!!!!!!");
					}
					// this.requestSave();
					break;
				}
			}
		});
	}

	async onUnloadFile(file: TFile) {
		await super.onUnloadFile(file);
		console.log("!!onUnloadFile", this.id, file.name)
		this.iframe?.remove();
	}

	async onOpen() {
		await super.onOpen();
		console.log("!!onOpen", this.id, this.file?.name)
	}

	clear(): void {
		console.log("!!clear", this.id, this.file?.name);
		this.value = "";
		this.send("change-value", {value: ""});
	}

	getViewData(): string {
		console.log("!!get view data", this.id, this.file?.name, this.value)
		return this.value;
	}

	setViewData(data: string, clear = false): void {
		console.log("!!set view data", this.id, this.file?.name, data, clear)
		this.value = data;
		this.send("change-value", {value: data});
	}

	getLanguage() {
		switch (this.file?.extension) {
			case "js":
			case "jsx":
				return "javascript";
			case "ts":
			case "tsx":
				return "typescript";
			case "json":
				return "json";
			case "py":
				return "python";
			case "css":
				return "css";
			case "html":
				return "html";
			case "cpp":
				return "cpp";
			case "graphql":
				return "graphql";
			case "java":
				return "java";
			case "php":
				return "php";
			case "sql":
				return "sql";
			case "yaml":
			case "yml":
				return "yaml";
			default:
				return "plaintext";
		}
	}

	send(type: string, payload: any) {
		// console.log("!!send", this.id, !!this.iframe, !!this.iframe?.contentWindow)
		this.iframe?.contentWindow?.postMessage({
			type,
			...payload
		}, "*");
	}
}

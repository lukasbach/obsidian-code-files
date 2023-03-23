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
		console.log("!!getDisplayText", this.id)
		return this.file?.name;
	}

	getViewType(): string {
		return viewType;
	}

	async onClose() {
		console.log("!!onClose", this.id)
		this.iframe.remove();
	}

	async onLoadFile(file: TFile) {
		await super.onLoadFile(file);
		console.log("!!onLoadFile", this.id, file.name)
		this.send("change-language", {language: this.getLanguage()});
	}

	async onUnloadFile(file: TFile) {
		console.log("!!onUnloadFile", this.id, file.name)
	}

	async onOpen() {
		console.log("!!onOpen", this.id)
		const theme = this.plugin.settings.isDark ? "vs-dark" : "vs-light";
		this.iframe = document.createElement("iframe");
		this.iframe.src = `https://embeddable-monaco.lukasbach.com?lang=${this.getLanguage()}&theme=${theme}&background=transparent`;
		this.iframe.style.width = "100%";
		this.iframe.style.height = "100%";
		(this.containerEl.getElementsByClassName("view-content")[0] as HTMLElement).style.overflow = "hidden";
		this.containerEl.getElementsByClassName("view-content")[0].append(this.iframe);
		window.addEventListener("message", ({data}) => {
			switch (data.type) {
				case "ready": {
					this.send("change-value", {value: this.value});
					this.send("change-background", {background: "transparent", theme: "vs-dark"});
					break;
				}
				case "change": {
					this.value = data.value;
					this.requestSave();
					break;
				}
			}
		});
	}

	clear(): void {
		console.log("!!clear", this.id)
		this.value = "";
		this.send("change-value", {value: ""});
	}

	getViewData(): string {
		return this.value;
	}

	setViewData(data: string, clear = false): void {
		console.log("!!set view data", this.id, data, clear)
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
		console.log("!!send", !!this.iframe.contentWindow)
		this.iframe.contentWindow?.postMessage({
			type,
			...payload
		}, "*");
	}
}

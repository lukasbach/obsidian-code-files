// https://github.com/microsoft/monaco-editor/issues/1288

import { TextFileView, TFile, WorkspaceLeaf } from "obsidian";
import { viewType } from "./common";
import CodeFilesPlugin from "./codeFilesPlugin";
import { createMonacoEditor } from "./monacoEditor";
import { getLanguage } from "./getLanguage";

export class CodeEditorView extends TextFileView {
	static i = 0;

	id = CodeEditorView.i++;

	editorContainer: HTMLElement;

	monacoEditor: Awaited<ReturnType<typeof createMonacoEditor>>;

	initialValue: string;

	constructor(leaf: WorkspaceLeaf, private plugin: CodeFilesPlugin) {
		super(leaf);
		this.editorContainer = document.createElement('div');
		this.editorContainer.className = 'monaco-container';
		this.editorContainer.style.width = '100%';
		this.editorContainer.style.height = '100%';
	}

	getDisplayText(): string {
		return this.file?.name ?? "Code Editor";
	}

	getViewType(): string {
		return viewType;
	}

	getContext(file?: TFile) {
		return file?.path ?? this.file?.path ?? "";
	}

	async onClose() {
		await super.onClose();
		if (this.monacoEditor) {
			this.monacoEditor.destroy();
		}
	}

	async onLoadFile(file: TFile) {
		await super.onLoadFile(file);
		this.contentEl.empty();
		this.contentEl.append(this.editorContainer);
		
		this.monacoEditor = await createMonacoEditor(
			this.plugin,
			getLanguage(file.extension),
			this.initialValue,
			this.editorContainer,
			() => this.requestSave()
		);
	}

	async onUnloadFile(file: TFile) {
		await super.onUnloadFile(file);
		if (this.monacoEditor) {
			this.monacoEditor.destroy();
		}
	}

	async onOpen() {
		await super.onOpen();
	}

	clear(): void {
		if (this.monacoEditor) {
			this.monacoEditor.clear();
		}
	}

	getViewData(): string {
		return this.monacoEditor ? this.monacoEditor.getValue() : this.initialValue || '';
	}

	setViewData(data: string): void {
		this.initialValue = data;
		if (this.monacoEditor) {
			this.monacoEditor.setValue(data);
		}
	}

	static async openFile(file: TFile, plugin: CodeFilesPlugin) {
		const leaf = plugin.app.workspace.getLeaf(true);
		const view = new CodeEditorView(leaf, plugin);
		view.file = file;
		leaf.open(view);
		await view.onLoadFile(file);
		plugin.app.workspace.revealLeaf(leaf);
	}
}

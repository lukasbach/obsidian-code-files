// https://github.com/microsoft/monaco-editor/issues/1288

import { TextFileView, TFile, WorkspaceLeaf } from "obsidian";
import { viewType } from "./common";
import CodeFilesPlugin from "./codeFilesPlugin";
import { mountCodeEditor } from "./mountCodeEditor";
import { getLanguage } from "./getLanguage";

export class CodeEditorView extends TextFileView {
	static i = 0;

	id = CodeEditorView.i++;

	codeEditor: ReturnType<typeof mountCodeEditor>;

	initialValue: string;

	constructor(leaf: WorkspaceLeaf, private plugin: CodeFilesPlugin) {
		super(leaf);
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
		this.codeEditor.destroy();
	}

	async onLoadFile(file: TFile) {
		await super.onLoadFile(file);

		this.codeEditor = mountCodeEditor(
			this.plugin,
			getLanguage(file.extension),
			this.initialValue,
			this.getContext(file)
		);

		this.contentEl.style.overflow = "hidden";
		this.contentEl.append(this.codeEditor.iframe);
	}

	async onUnloadFile(file: TFile) {
		await super.onUnloadFile(file);
		this.codeEditor.destroy();
	}

	async onOpen() {
		await super.onOpen();
	}

	clear(): void {
		this.codeEditor.clear();
	}

	getViewData(): string {
		return this.codeEditor.getValue();
	}

	setViewData(data: string): void {
		this.initialValue = data;
		this.codeEditor?.setValue(data);
	}
}

import { SuggestModal, TFile } from "obsidian";
import { CodeEditorView } from "./codeEditorView";
import CodeFilesPlugin from "./codeFilesPlugin";

export class ChooseCssFileModal extends SuggestModal<string> {
	constructor(private plugin: CodeFilesPlugin, private cssFiles: string[]) {
		super(plugin.app);
	}

	getSuggestions(query: string): string[] {
		return this.cssFiles.filter((item) =>
			item.toLowerCase().includes(query.toLowerCase())
		);
	}

	onChooseSuggestion(item: string): any {
		CodeEditorView.openFile(
			// @ts-ignore
			new TFile(this.app.vault, item),
			this.plugin
		);
	}

	renderSuggestion(value: any, el: HTMLElement): any {
		// eslint-disable-next-line no-param-reassign
		el.innerHTML = value;
		return el;
	}
}

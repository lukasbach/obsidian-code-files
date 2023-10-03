import { SuggestModal, TFile } from "obsidian";
import { CodeEditorView } from "./codeEditorView";
import CodeFilesPlugin from "./codeFilesPlugin";

export class ChooseCssFileModal extends SuggestModal<string> {
	constructor(private plugin: CodeFilesPlugin, private cssFiles: string[]) {
		super(plugin.app);
	}

	getSuggestions(query: string): string[] {
		const files = this.cssFiles.filter((item) =>
			item.toLowerCase().includes(query.toLowerCase())
		);
		if (query) {
			return [...files, `Create new snippet "${query}.css"`];
		}

		return files;
	}

	async onChooseSuggestion(item: string) {
		const maybeCreateFile = item.match(/Create new snippet "(.*)\.css"/);

		if (maybeCreateFile?.[1]) {
			const path = `${this.app.vault.configDir}/snippets/${maybeCreateFile[1]}.css`;
			await this.plugin.app.vault.adapter.write(path, "");
			CodeEditorView.openFile(
				// @ts-ignore
				new TFile(this.app.vault, path),
				this.plugin
			);
			new Notification("Make sure to enable new snippet in options.");
			return;
		}

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

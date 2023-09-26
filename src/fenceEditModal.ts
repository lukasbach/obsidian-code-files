import { Modal } from "obsidian";
import { mountCodeEditor } from "./mountCodeEditor";
import CodeFilesPlugin from "./codeFilesPlugin";
import { getLanguage } from "./getLanguage";

export class FenceEditModal extends Modal {
	private codeEditor: ReturnType<typeof mountCodeEditor>;

	private constructor(
		private plugin: CodeFilesPlugin,
		private code: string,
		private language: string,
		private onSave: (code: string) => void
	) {
		super(plugin.app);
	}

	onOpen() {
		super.onOpen();

		this.codeEditor = mountCodeEditor(
			this.plugin,
			this.language,
			this.code,
			"modal-editor"
		);

		this.contentEl.append(this.codeEditor.iframe);

		this.modalEl.setCssProps({
			"--dialog-width": "90vw",
			"--dialog-height": "90vh",
		});
		this.modalEl.style.height = "var(--dialog-height)";
	}

	onClose() {
		super.onClose();

		this.onSave(this.codeEditor.getValue());
	}

	static openOnCurrentCode(plugin: CodeFilesPlugin) {
		const editor = plugin.app.workspace.activeEditor?.editor;
		const cursor = editor?.getCursor();

		if (!editor || !cursor) return;

		let start = cursor.line;
		let end = cursor.line;
		while (start > 0 && !editor.getLine(start).startsWith("```")) {
			start--;
		}
		while (
			end < editor.lineCount() &&
			!editor.getLine(end).startsWith("```")
		) {
			end++;
		}

		let editorContent = "";
		for (let i = start + 1; i < end; i++) {
			editorContent += `${editor.getLine(i)}\n`;
		}

		editorContent = editorContent.slice(0, editorContent.length - 1);
		const langKey = editor.getLine(start).slice(3).trim();

		new FenceEditModal(
			plugin,
			editorContent,
			getLanguage(langKey),
			(value) => {
				editor.replaceRange(
					`${value}\n`,
					{ line: start + 1, ch: 0 },
					{ line: end, ch: 0 }
				);
			}
		).open();
	}
}

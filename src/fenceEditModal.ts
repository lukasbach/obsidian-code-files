import { Modal, Notice } from "obsidian";
import { createMonacoEditor } from "./monacoEditor";
import CodeFilesPlugin from "./codeFilesPlugin";
import { FenceEditContext } from "./fenceEditContext";

export class FenceEditModal extends Modal {
	private monacoContainer: HTMLElement;
	private monacoEditor: Awaited<ReturnType<typeof createMonacoEditor>> | null = null;

	private constructor(
		private plugin: CodeFilesPlugin,
		private code: string,
		private language: string,
		private onSave: (changedCode: string) => void
	) {
		super(plugin.app);
		this.monacoContainer = document.createElement('div');
		this.monacoContainer.style.width = '100%';
		this.monacoContainer.style.height = '100%';
	}

	async onOpen() {
		super.onOpen();
		
		this.contentEl.append(this.monacoContainer);
		
		this.monacoEditor = await createMonacoEditor(
			this.plugin,
			this.language,
			this.code,
			this.monacoContainer
		);

		this.modalEl.setCssProps({
			"--dialog-width": "90vw",
			"--dialog-height": "90vh",
		});
		this.modalEl.style.height = "var(--dialog-height)";
	}

	onClose() {
		super.onClose();
		if (this.monacoEditor) {
			this.onSave(this.monacoEditor.getValue());
			this.monacoEditor.destroy();
		}
	}

	static async openOnCurrentCode(plugin: CodeFilesPlugin) {
		const context = FenceEditContext.create(plugin);

		if (!context.isInFence()) {
			new Notice("Your cursor is currently not in a valid code block.");
			return;
		}

		const fenceData = context.getFenceData();

		if (!fenceData) {
			return;
		}

		const modal = new FenceEditModal(
			plugin,
			fenceData.content,
			fenceData.language,
			(value) => context.replaceFenceContent(value)
		);
		
		modal.open();
	}
} 
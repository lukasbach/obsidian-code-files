import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, MyPluginSettings, viewType } from "./common";
import { CodeEditorView } from "./codeEditorView";
import { CreateCodeFileModal } from "./createCodeFileModal";
import { CodeFilesSettingsTab } from "./codeFilesSettingsTab";
import { FenceEditModal } from "./fenceEditModal";
import { FenceEditContext } from "./fenceEditContext";

export default class CodeFilesPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(viewType, (leaf) => new CodeEditorView(leaf, this));
		this.registerExtensions(this.settings.extensions, viewType);

		this.addCommand({
			id: "open-codeblock-in-monaco",
			name: "Open current code block in Monaco Editor",
			callback: () => {
				FenceEditModal.openOnCurrentCode(this);
			},
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item.setTitle("Create Code File")
						.setIcon("file-json")
						.onClick(() => {
							new CreateCodeFileModal(this, file).open();
						});
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu) => {
				if (!FenceEditContext.create(this).isInFence()) {
					return;
				}
				menu.addItem((item) => {
					item.setTitle("Edit Code Block in Monaco Editor")
						.setIcon("code")
						.onClick(() => {
							FenceEditModal.openOnCurrentCode(this);
						});
				});
			})
		);

		this.addRibbonIcon("file-json", "Create Code File", () => {
			new CreateCodeFileModal(this).open();
		});

		this.addCommand({
			id: "create",
			name: "Create new Code File",
			callback: () => {
				new CreateCodeFileModal(this).open();
			},
		});

		this.addSettingTab(new CodeFilesSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TextFileView, TFile,
	View
} from 'obsidian';
import * as path from "path";
import {EditorState, Compartment} from "@codemirror/state"
import {EditorView, keymap} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";

// Remember to rename these classes and interfaces!



interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

const viewType = "code-editor";

let i = 0;
class CodeEditorView extends TextFileView {
	id = i++;
	value: string = "";
	iframe: HTMLIFrameElement;

	getDisplayText(): string {
		console.log("!!getDisplayText", this.id)
		return "display text";
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
		this.send("change-language", { language: this.getLanguage() });
	}

	async onUnloadFile(file: TFile) {
		console.log("!!onUnloadFile", this.id, file.name)
	}

	async onOpen() {
		console.log("!!onOpen", this.id)
		this.iframe = document.createElement("iframe");
		this.iframe.src = `https://embeddable-monaco.lukasbach.com?lang=${this.getLanguage()}`;
		this.iframe.style.width = "100%";
		this.iframe.style.height = "100%";
		(this.containerEl.getElementsByClassName("view-content")[0] as HTMLElement).style.overflow = "hidden";
		this.containerEl.getElementsByClassName("view-content")[0].append(this.iframe);
		window.addEventListener("message", ({ data }) => {
			switch(data.type) {
				case "ready": {
					this.send("change-value", { value: this.value });
					this.send("change-background", { background: "transparent", theme: "vs-dark" });
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
		this.send("change-value", { value: "" });
	}

	getViewData(): string {
		return this.value;
	}

	setViewData(data: string, clear = false): void {
		console.log("!!set view data", this.id, data, clear)
		this.value = data;
		this.send("change-value", { value: data });
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

export default class CodeFilesPlugin extends Plugin {
	settings: MyPluginSettings;


	async onload() {
		await this.loadSettings();


		this.registerView(viewType, leaf => new CodeEditorView(leaf));
		this.registerExtensions(["ts", "tsx", "txt"], viewType);



		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CodeFilesSettingsTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class CodeFilesSettingsTab extends PluginSettingTab {
	plugin: CodeFilesPlugin;

	constructor(app: App, plugin: CodeFilesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

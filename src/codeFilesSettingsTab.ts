import { App, PluginSettingTab, Setting } from "obsidian";
import CodeFilesPlugin from "./codeFilesPlugin";
import { themes } from "./themes";

export class CodeFilesSettingsTab extends PluginSettingTab {
	plugin: CodeFilesPlugin;

	constructor(app: App, plugin: CodeFilesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Code Files Settings" });
		containerEl.createEl("p", {
			text: "If you change any settings, you need to reopen already opened files for the changes to take effect.",
		});

		new Setting(containerEl)
			.setName("Theme")
			.setDesc(
				"Theme of the editor, defaults to dark or light based on the current editor theme."
			)
			.addDropdown((dropdown) => {
				dropdown.addOption("default", "Default");
				for (const theme of themes) {
					dropdown.addOption(theme, theme);
				}

				return dropdown
					.setValue(this.plugin.settings.theme)
					.onChange(async (value) => {
						this.plugin.settings.theme = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Overwrite background with Obsidian background")
			.setDesc(
				"Always use the background of Obsidian as background, instead of the theme default background." +
					" It's recommended to turn this off if you are using" +
					" custom themes. Disable this if the text colors are illegible on Obsidians background."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.overwriteBg)
					.onChange((v) => {
						this.plugin.settings.overwriteBg = v;
						this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("File Extensions")
			.setDesc(
				"Files with these extensions will show up in the sidebar, and will " +
					"be available to create new files from. Seperated by commas. " +
					"Changes to the file extensions need a restart to take effect."
			)
			.addText((text) =>
				text
					.setPlaceholder("js,ts")
					.setValue(this.plugin.settings.extensions.join(","))
					.onChange(async (value) => {
						this.plugin.settings.extensions = value.split(",");
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Folding")
			.setDesc("Editor will support code block folding.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.folding)
					.onChange(async (value) => {
						this.plugin.settings.folding = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Line Numbers")
			.setDesc("Editor will show line numbers.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.lineNumbers)
					.onChange(async (value) => {
						this.plugin.settings.lineNumbers = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Minimap")
			.setDesc("Editor will show a minimap.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.minimap)
					.onChange(async (value) => {
						this.plugin.settings.minimap = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Semantic Validation")
			.setDesc("Editor will show semantic validation errors.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.semanticValidation)
					.onChange(async (value) => {
						this.plugin.settings.semanticValidation = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Syntax Validation")
			.setDesc("Editor will show syntax validation errors.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.syntaxValidation)
					.onChange(async (value) => {
						this.plugin.settings.syntaxValidation = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

import { TFile, Vault } from "obsidian";

export class CssFile extends TFile {
	constructor(path: string, vault: Vault) {
		// @ts-ignore
		super(vault, path);
		const pieces = path.split("/");
		this.basename = pieces[pieces.length - 1];
		this.extension = "css";
		this.name = this.basename;
		this.parent = null;
		this.path = path;
		this.vault = vault;
	}
}

import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianLinkArchivePlugin from "./main";
import { defaultArchiveText } from "./constants";

export interface LinkReplaceRule {
    originalPattern: string;
    replacementPattern: string;
}

export const enum ArchiveOptions {
	Wayback,
	Archiveis,
	Both
}

// ReSharper disable once InconsistentNaming
export interface LinkArchivePluginSettings {
	archiveOption: ArchiveOptions;
	archiveText: string;
	linkReplaceRules: LinkReplaceRule[];
	ignoreUrlPatterns: string[];
}

export const defaultSettings: LinkArchivePluginSettings = {
	archiveOption: ArchiveOptions.Archiveis,
	archiveText: defaultArchiveText,
	linkReplaceRules: [],
	ignoreUrlPatterns: []
}


export class LinkArchiveSettingTab extends PluginSettingTab {
	plugin: ObsidianLinkArchivePlugin;

	constructor(app: App, plugin: ObsidianLinkArchivePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const plugin: ObsidianLinkArchivePlugin = (this as any).plugin;
		const { containerEl } = this;

		containerEl.empty();

		// add archive link text customization option
		const archiveSettingsSection = containerEl.createDiv();
		archiveSettingsSection.createEl("h2", { text: "Archive Settings" });

		new Setting(archiveSettingsSection)
		.setName("Link text")
		.setDesc("The text of the archive links")
		.addText(text =>
				 text
		.setValue(plugin.settings.archiveText)
		.onChange(async value => {
			console.log(`Link text: ${value}`);
			plugin.settings.archiveText = value;
			await plugin.saveSettings();
		}));

		// link ignore rules
		const linkIgnoreSection = containerEl.createDiv();
		linkIgnoreSection.createEl("h2", { text: "Link Ignore Rules" });

		new Setting(linkIgnoreSection)
		.setName("Ignore URL Patterns")
		.setDesc("Enter regular expressions to match URLs that should be ignored by the plugin")
		.addButton(button => {
			button.setButtonText("Add Pattern").onClick(() => {
				plugin.settings.ignoreUrlPatterns.push("");
				this.display();
			});
		});

		// add ignore url patterns
		for (let i = 0; i < plugin.settings.ignoreUrlPatterns.length; i++) {
			const pattern = plugin.settings.ignoreUrlPatterns[i];

			const setting = new Setting(containerEl)
			.setName(`Pattern ${i + 1}`)
			.addText(text => text
					 .setPlaceholder("URL Pattern")
					 .setValue(pattern)
					 .onChange(async value => {
						 plugin.settings.ignoreUrlPatterns[i] = value;
						 await plugin.saveSettings();
					 }));

					 setting.addButton(button => {
						 button.setIcon("cross")
						 .onClick(async () => {
							 plugin.settings.ignoreUrlPatterns.splice(i, 1);
							 await plugin.saveSettings();
							 this.display();
						 });
					 });
		}

		// add link replacement rules
		const linkReplacementSection = containerEl.createDiv();
		linkReplacementSection.createEl("h2", { text: "Link Replacement Rules" });

		new Setting(linkReplacementSection)
		.setDesc("Configure rules to replace specific links before archiving.")
		.addButton(button => {
			button.setButtonText("Add Rule").onClick(() => {
				plugin.settings.linkReplaceRules.push({
					originalPattern: "",
					replacementPattern: ""
				});
				this.display();
			});
		});

		// add link replacement rules
		for (let i = 0; i < plugin.settings.linkReplaceRules.length; i++) {
			const rule = plugin.settings.linkReplaceRules[i];

			const setting = new Setting(containerEl)
			.setName(`Rule ${i + 1}`)
			.addText(text => text
					 .setPlaceholder("Original Pattern")
					 .setValue(rule.originalPattern)
					 .onChange(async value => {
						 rule.originalPattern = value;
						 await plugin.saveSettings();
					 }))
					 .addText(text => text
							  .setPlaceholder("Replacement Pattern")
							  .setValue(rule.replacementPattern)
							  .onChange(async value => {
								  rule.replacementPattern = value;
								  await plugin.saveSettings();
							  }));

							  setting.addButton(button => {
								  button.setIcon("cross")
								  .onClick(async () => {
									  plugin.settings.linkReplaceRules.splice(i, 1);
									  await plugin.saveSettings();
									  this.display();
								  });
							  });
		}

		// add about section
		const aboutSection = containerEl.createDiv();
		aboutSection.createEl("h2", { text: "About Link Archive" });

		aboutSection.createEl("p", {text: "This plugin archives links in your note so they're available to you even if the original site goes down or gets removed."});

		aboutSection.createEl("a", {text: "Open GitHub repository", href: "https://github.com/tomzorz/obsidian-link-archive"});

	}
}

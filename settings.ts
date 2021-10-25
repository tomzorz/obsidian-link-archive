import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianLinkArchivePlugin from "./main";
import { defaultArchiveText } from "./constants";

export const enum ArchiveOptions {
	Wayback,
	Archiveis,
	Both
}

// ReSharper disable once InconsistentNaming
export interface LinkArchivePluginSettings {
	archiveOption: ArchiveOptions;
	archiveText: string;
}

export const defaultSettings: LinkArchivePluginSettings = {
	archiveOption: ArchiveOptions.Archiveis,
	archiveText: defaultArchiveText
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

		containerEl.createEl("h2", {text: "Archive Settings"});

        new Setting(containerEl)
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

		// new Setting(containerEl)
		// 	.setName('Archive Provider')
		// 	.setDesc('Choose a provider for the link archive')
		// 	.addDropdown((dropdown) => {
		// 		const options: Record<ArchiveOptions, string> = {
		// 			0: "Internet Archive",
		// 			1: "archive.is",
		// 			2: "Both"
		// 		};

		// 		dropdown
		// 			.addOptions(options)
		// 			.setValue(plugin.settings.archiveOption.toString())
		// 			.onChange(async (value) => {
		// 				console.log('Archive option: ' + value);
		// 				plugin.settings.archiveOption = +value;
		// 				await plugin.saveSettings();
		// 				this.display();
		// 		})
		// 	});

		containerEl.createEl("h2", {text: "About Link Archive"});

		containerEl.createEl("p", {text: "This plugin archives links in your note so they're available to you even if the original site goes down or gets removed."});

		containerEl.createEl("a", {text: "Open GitHub repository", href: "https://github.com/tomzorz/obsidian-link-archive"});

		// TODO github support and ko-fi
	}
}

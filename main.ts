import { Console } from 'console';
import { App, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, request, Setting } from 'obsidian';
import { Url } from 'url';

export const enum ArchiveOptions {
	wayback,
	archiveis,
	both
}

interface LinkArchivePluginSettings {
	archiveOption: ArchiveOptions;
}

const DEFAULT_SETTINGS: LinkArchivePluginSettings = {
	archiveOption: ArchiveOptions.archiveis
}

const urlRegex =/(\b(https?|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

const waybackUrl = 'https://web.archive.org/web/';
const waybackSaveUrl = 'https://web.archive.org/save/';

const archiveText = '[(Archived)]';

export default class ObsidianLinkArchivePlugin extends Plugin {
	settings: LinkArchivePluginSettings;

	async onload() {
		console.log('Loading Link Archive plugin...');

		await this.loadSettings();

		this.addRibbonIcon('restore-file-glyph', 'Archive Links', async () => {
			
			// test save
			//new Notice('Archive option: ' + this.settings.archiveOption.toString());

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);

			if(view) {
				const viewData = view.getViewData();

				let reverseArray: Array<[string, number]> = [];

				let linkArray;
				while ((linkArray = urlRegex.exec(viewData)) !== null) {
					console.log(`Found ${linkArray[0]}. Next starts at ${urlRegex.lastIndex}.`);
					
					if(linkArray[0].startsWith(waybackUrl)) continue;

					if(viewData.substring(urlRegex.lastIndex, urlRegex.lastIndex + 14).contains(archiveText)) continue;

					reverseArray.unshift([linkArray[0], urlRegex.lastIndex]);
				}
				
				console.log(reverseArray);

				if(reverseArray.length == 0) {
					new Notice('No (new) links to archive.');
					return;
				}

				new Notice(`Preparing to archive ${reverseArray.length} link(s), this might take a while - please be patient...`, 10 * 1000);

				for (const tuple of reverseArray) {
					let currentLink = tuple[0];
					let saveLink = `${waybackSaveUrl}${currentLink}`;
					let archiveLink = ` ${archiveText}(${waybackUrl}${currentLink})`;
					let offset = view.editor.offsetToPos(tuple[1]);
					let message = `Successfully archived ${currentLink}!`;

					await request({
						url: saveLink
					});
					
					view.editor.replaceRange(archiveLink, offset);
					console.log(message);
					new Notice(message);
				}
				
				// reverseArray.forEach(async function (tuple) {
				// 	let currentLink = tuple[0];
				// 	let saveLink = `${waybackSaveUrl}${currentLink}`;
				// 	let archiveLink = ` ${archiveText}(${waybackUrl}${currentLink})`;
				// 	let offset = view.editor.offsetToPos(tuple[1]);
				// 	let message = `Successfully archived ${currentLink}!`;

				// 	request({
				// 		url: saveLink
				// 	}).then(function(pageRes) {
				// 		view.editor.replaceRange(archiveLink, offset);
				// 		console.log(message);
				// 		new Notice(message);
				// 	});
				// });

				new Notice('Link archiving done!');
			} else {
				new Notice('Link archiving only works if you have a note open.');
			}
		});

		this.addSettingTab(new LinkArchiveSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading Link Archive plugin...');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class LinkArchiveSettingTab extends PluginSettingTab {
	plugin: ObsidianLinkArchivePlugin;

	constructor(app: App, plugin: ObsidianLinkArchivePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const plugin: ObsidianLinkArchivePlugin = (this as any).plugin;

		let {containerEl} = this;

		containerEl.empty();

		// containerEl.createEl('h2', {text: 'Archive Settings'});

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

		containerEl.createEl('h2', {text: 'About Link Archive'});

		containerEl.createEl('p', {text: 'This plugin archives links in your note so they\'re available to you even if the original site goes down or gets removed.'});

		containerEl.createEl('a', {text: 'Open GitHub repository', href: 'https://github.com/tomzorz/obsidian-link-archive'});

		// TODO github support and ko-fi
	}
}

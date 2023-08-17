import { MarkdownView, Notice, Plugin, request } from "obsidian";
import { waybackSaveUrl, waybackUrl } from "./constants";
import { defaultSettings as DEFAULT_SETTINGS, LinkArchivePluginSettings as LinkArchivePluginSettings, LinkArchiveSettingTab, LinkReplaceRule } from "./settings";

const urlRegex =/(\b(https?|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

function replaceLinks(link: string, replaceRules: LinkReplaceRule[]): string {
	let modifiedLink = link;

	for (const rule of replaceRules) {
		const regex = new RegExp(rule.originalPattern, "g");
		modifiedLink = modifiedLink.replace(regex, rule.replacementPattern);
	}

	return modifiedLink;
}

export default class ObsidianLinkArchivePlugin extends Plugin {
	settings: LinkArchivePluginSettings;

	async onload() {
		console.log("Loading Link Archive plugin...");

		await this.loadSettings();

		this.addRibbonIcon("restore-file-glyph", "Archive Links", async () => {

			// test save
			//new Notice('Archive option: ' + this.settings.archiveOption.toString());

			const archiveText = `[${this.settings.archiveText}]`;
			const dateLinkPart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);

			if(view) {
				const viewData = view.getViewData();

				const reverseArray: Array<[string, number]> = [];

				let linkArray: any;
				while ((linkArray = urlRegex.exec(viewData)) !== null) {
					console.log(`Found ${linkArray[0]}. Next starts at ${urlRegex.lastIndex}.`);

					reverseArray.unshift([linkArray[0], urlRegex.lastIndex]);
				}

				console.log(reverseArray);

				// ReSharper marks the "some" call as an error, but it's actually correct...
				const cleanedList = reverseArray.filter(x =>
					// Filtering out links that start with the archive URL
					!x[0].startsWith(waybackUrl)
					// Testing if a link does not have an archived version in the reverseArray
					&& !reverseArray.some(y => 
						y[0].startsWith(waybackUrl) && y[0].endsWith(x[0]) // Already archived links
						|| y[0].startsWith(waybackUrl) && y[0].endsWith(replaceLinks(x[0], this.settings.linkReplaceRules)) // Already replaced and archived links
					)
					// Testing if the link is not already associated with the archive text in viewData
					&& !viewData.substring(x[1]+2, x[1]+2 + archiveText.length).includes(archiveText)
					// Testing if the link is not in the ignore list
					&& !this.settings.ignoreUrlPatterns.some(pattern => new RegExp(pattern).test(x[0])));

				console.log(cleanedList);

				if (cleanedList.length === 0) {
					this.popNotice("No (new) links to archive.");
					return;
				}

				const processingNotice = new Notice(`Archiving ${cleanedList.length} link(s), this might take a while - please be patient...`, 0);

				let i = 1;
				const totalLinks = cleanedList.length;

				for (const tuple of cleanedList) {
					const currentLink = tuple[0];
					const replacedLink = replaceLinks(currentLink, this.settings.linkReplaceRules);
					const saveLink = `${waybackSaveUrl}${currentLink}`;
					const archiveLink = ` ${archiveText}(${waybackUrl}${dateLinkPart}/${replacedLink})`;
                    const extraOffset = viewData.charAt(tuple[1]) === ")" ? 1 : 0;
					const offset = view.editor.offsetToPos(tuple[1] + extraOffset);
					const message = `(${i}/${totalLinks}) Successfully archived ${replacedLink}!`;
					const failMessage = `(${i}/${totalLinks}) Failed to archive ${replacedLink}!`;
                    i += 1;

                    await this.delay(400);

					try {
                        await request({
                            url: saveLink
						});

                        view.editor.replaceRange(archiveLink, offset);
                        console.log(message);
                        this.popNotice(message);
					}
					catch (exception) {
						this.popNotice(failMessage);
                    }
                }

				this.popNotice("Link archiving done!");

                processingNotice.hide();
			} else {
                this.popNotice("Link archiving only works if you have a note open.");
			}
        });

		this.addSettingTab(new LinkArchiveSettingTab(this.app, this));
	}

	popNotice(message: string, timeInSeconds?: number) {
		// ReSharper disable WrongExpressionStatement
		if (arguments.length === 1) {
			new Notice(message);
		} else {
			new Notice(message, timeInSeconds * 1000);
		}
		// ReSharper restore WrongExpressionStatement
	}

	delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

	onunload() {
		console.log("Unloading Link Archive plugin...");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

import { MarkdownView, Notice, Plugin, request } from "obsidian";
import { waybackSaveUrl, waybackUrl } from "./constants";
import { defaultSettings as DEFAULT_SETTINGS, LinkArchivePluginSettings as LinkArchivePluginSettings, LinkArchiveSettingTab } from "./settings";

const urlRegex =/(\b(https?|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

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

					//if(linkArray[0].startsWith(waybackUrl)) continue;

					//if(viewData.substring(urlRegex.lastIndex, urlRegex.lastIndex + 14).contains(archiveText)) continue;

					// replace clean logic with
					// IF next link is the same except with archiveorg in front of it, skip it

					reverseArray.unshift([linkArray[0], urlRegex.lastIndex]);
				}

                console.log(reverseArray);

				// ReSharper marks the "some" call as an error, but it's actually correct...
                const cleanedList = reverseArray.filter(x =>
                    !x[0].startsWith(waybackUrl)
					&& !reverseArray.some(y => y[0].startsWith(waybackUrl) && y[0].endsWith(x[0])));

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
					const saveLink = `${waybackSaveUrl}${currentLink}`;
					const archiveLink = ` ${archiveText}(${waybackUrl}${dateLinkPart}/${currentLink})`;
                    const extraOffset = viewData.charAt(tuple[1]) === ")" ? 1 : 0;
					const offset = view.editor.offsetToPos(tuple[1] + extraOffset);
					const message = `(${i}/${totalLinks}) Successfully archived ${currentLink}!`;
					const failMessage = `(${i}/${totalLinks}) Failed to archive ${currentLink}!`;
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

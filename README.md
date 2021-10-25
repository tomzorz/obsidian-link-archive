# Obsidian Link Archive

This plugin archives links in your note so they're available to you even if the original site goes down or gets removed.

## How it works

Upon pressing the "Archive Links" button in the ribbon/left sidebar, the plugin:

1. looks up every external link in the current note,
2. sumbits each of them to https://archive.org,
3. as soon as they are saved, it embeds an `(Archived)` link after the regular link in your note.

The plugin will attempt not to recreate archive links for already-archived links (and the archive links themselves) - but this relies on not modifying the formatting of the archive links.

## Installation

In Obsidian, navigate to **Settings > Community Plugins**, turn off **Safe mode** if you haven't yet, then press the **Browse** button - you should be able to find it in the list there.

Alternatively, download the latest release of the repository, and copy the `main.js`, `manifest.json` and `style.css` files to you vault's `.obsidian/plugins/obsidian-link-archive` folder and then enable it under **Settings > Community Plugins** (the note about disabling above applies here as well).

## Changelog

**v0.2.0**

- Added error handling.
- Plugin properly handles markdown links.
- Added better progress reporting.
- Refactored plugin into multiple files.
- Added a setting for a custom link text.
- Improved logic for detecting already-archived links.

**v0.1.1**

- Added missing license.

**v0.1.0**

Initial release.

## Future plans

- Support for other archive providers
﻿"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = require("./rest");
const Locations = require("./locations");
const PlayCache = require("./play-cache");
function itemToHtml(f, currentName) {
    if (f.mimeType == 'application/directory')
        return `<div class="onclick"><i><a class='x-no-color' href='${Locations.getDirectoryUrl(f.sha, f.name, currentName)}'>${f.name}</a> ...</i></div>`;
    else if (f.mimeType == 'application/reference')
        return `<div class="onclick"><i><a class='x-no-color' href='${Locations.getReferenceUrl(f.name)}'>${f.name}</a> ...</i></div>`;
    else if (f.mimeType == 'application/playlist')
        return `<div class="onclick"><i><a class='x-no-color' href='${Locations.getPlaylistUrl(f.name)}'>${f.name}</a> ...</i></div>`;
    else if (f.mimeType.startsWith('audio/'))
        return `<div x-for-sha="${f.sha && f.sha.substr(0, 5)}" class="onclick">${f.name}${PlayCache.hasBeenPlayed(f.sha) ? ' ✔️' : ''}</div>`;
    else
        return `<div x-for-sha="${f.sha && f.sha.substr(0, 5)}" class="onclick"><a href="${Rest.getShaContentUrl(f.sha, f.mimeType, f.name, true, false)}" target="_blank">${f.name}</a> <a class="x-info-display-action mui--text-dark-secondary" href="#">info</a></div>`;
}
exports.itemToHtml = itemToHtml;
//# sourceMappingURL=html-snippets.js.map
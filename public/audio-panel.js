﻿"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const Rest = require("./rest");
const UiTools = require("./ui-tool");
const TITLE = 'title';
const PLAYER = 'player';
const PLAYLIST = 'playlist';
const EXPANDER = 'expander';
const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <h3 class="x-toggled">Playlist</h3>
    <div x-id="${PLAYLIST}" class="x-toggled is-fullwidth mui--text-center"></div>
    <div><h3 x-id="${TITLE}" style="display: inline;"></h3><span x-id="${EXPANDER}" class="onclick mui--pull-right">&nbsp;&nbsp;☰</span></div>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    play: (elements, name, sha, mimeType) => {
        elements.title.innerText = name;
        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
        elements.player.setAttribute('type', mimeType);
        elements.root.classList.remove("is-hidden");
        elements.player.play();
    },
    setPlaylist(elements, html) {
        elements.playlist.innerHTML = html;
    }
};
class AudioJukebox {
    constructor(audioPanel) {
        this.audioPanel = audioPanel;
        this.queue = [];
        this.currentIndex = -1;
        this.audioPanel.player.addEventListener('ended', () => {
            this.currentIndex++;
            if (this.currentIndex < this.queue.length)
                this.play(this.currentIndex + 1);
            else
                this.stop();
        });
        this.audioPanel.expander.addEventListener('click', () => {
            this.toggleLargeDisplay();
        });
    }
    currentItem() {
        if (this.currentIndex < 0 || this.currentIndex >= this.queue.length)
            return null;
        return this.queue[this.currentIndex];
    }
    addAndPlay(item) {
        let currentItem = this.currentItem();
        if (currentItem && currentItem.sha == item.sha)
            return;
        this.queue.push(item);
        this.play(this.queue.length - 1);
    }
    stop() {
        this.play(-1);
    }
    play(index) {
        this.currentIndex = index;
        if (this.currentIndex < 0)
            this.currentIndex = -1;
        this.refreshPlaylist();
        if (index >= 0 && index < this.queue.length) {
            const item = this.queue[index];
            exports.audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType);
        }
    }
    refreshPlaylist() {
        let html = ``;
        for (let i = 0; i < this.queue.length - 1; i++) {
            let item = this.queue[i];
            html += `<div>${item.name}</div>`;
        }
        exports.audioPanel.setPlaylist(this.audioPanel, html);
    }
    toggleLargeDisplay() {
        UiTools.els(this.audioPanel.root, ".x-toggled").forEach(e => e.classList.toggle('is-hidden'));
    }
}
exports.AudioJukebox = AudioJukebox;
//# sourceMappingURL=audio-panel.js.map
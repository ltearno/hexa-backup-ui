"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const Rest = require("./rest");
const PLAYER = 'player';
const PLAYLIST = 'playlist';
const EXPANDER = 'expander';
const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <div><div x-id="${PLAYLIST}" class="is-fullwidth mui--text-center"></div><span x-id="${EXPANDER}" class="onclick mui--pull-right">&nbsp;&nbsp;☰</span></div>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    play: (elements, name, sha, mimeType) => {
        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
        elements.player.setAttribute('type', mimeType);
        elements.root.classList.remove("is-hidden");
        elements.player.play();
    },
};
class AudioJukebox {
    constructor(audioPanel) {
        this.audioPanel = audioPanel;
        this.largeDisplay = false;
        this.queue = [];
        this.currentIndex = -1;
        this.audioPanel.player.addEventListener('ended', () => {
            if (this.currentIndex + 1 < this.queue.length)
                this.play(this.currentIndex + 1);
        });
        this.audioPanel.expander.addEventListener('click', () => {
            this.largeDisplay = !this.largeDisplay;
            this.refreshPlaylist();
        });
        this.audioPanel.root.addEventListener('click', event => {
            const { element, childIndex } = templates_1.templateGetEventLocation(this.audioPanel, event);
            if (element == this.audioPanel.playlist && childIndex >= 0) {
                let queueIndex = element.children.item(childIndex).getAttribute('x-queue-index');
                if (queueIndex.length)
                    this.play(parseInt(queueIndex));
            }
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
        if (this.largeDisplay) {
            let html = `<h3>Playlist</h3>`;
            for (let i = 0; i < this.queue.length; i++) {
                let item = this.queue[i];
                html += `<div x-queue-index="${i}" class="onclick ${i == this.currentIndex ? 'mui--text-headline' : ''}">${item.name}</div>`;
            }
            this.audioPanel.playlist.innerHTML = html;
        }
        else {
            this.audioPanel.playlist.innerHTML = `<div x-queue-index="${this.currentIndex}" class="onclick mui--text-headline">${this.queue[this.currentIndex].name}</div>`;
        }
    }
}
exports.AudioJukebox = AudioJukebox;
//# sourceMappingURL=audio-panel.js.map
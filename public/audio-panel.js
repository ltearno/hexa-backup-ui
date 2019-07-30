"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const Rest = require("./rest");
const TITLE = 'title';
const PLAYER = 'player';
const PLAYLIST = 'playlist';
const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <div x-id="${PLAYLIST}"></div>
    <h3 x-id="${TITLE}"></h3>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml, [TITLE, PLAYER, PLAYLIST]),
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
        this.currentItem = null;
        this.audioPanel.player.addEventListener('ended', () => {
            let currentIndex = this.currentIndex();
            currentIndex++;
            if (currentIndex < this.queue.length - 1)
                this.play(this.queue[currentIndex]);
        });
    }
    currentIndex() {
        return this.queue.indexOf(this.currentItem);
    }
    addAndPlay(item) {
        let currentIndex = this.currentIndex();
        if (!this.queue.length || this.queue[0].sha != item.sha) {
            this.queue.splice(currentIndex, 0, item);
            this.play(item);
        }
    }
    play(item) {
        this.currentItem = item;
        exports.audioPanel.setPlaylist(this.audioPanel, this.queue.map(i => `<div>${i.name} ${i.mimeType} ${i.sha.substr(0, 5)}</div>`).join(''));
        exports.audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType);
    }
}
exports.AudioJukebox = AudioJukebox;
//# sourceMappingURL=audio-panel.js.map
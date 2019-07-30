"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const Rest = require("./rest");
const TITLE = 'title';
const PLAYER = 'player';
const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <h3 x-id="${TITLE}"></h3>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml, [TITLE, PLAYER]),
    play: (elements, name, sha, mimeType) => {
        elements.title.innerText = name;
        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
        elements.player.setAttribute('type', mimeType);
        elements.root.classList.remove("is-hidden");
        elements.player.play();
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
        console.log(JSON.stringify(this.queue));
        console.log(this.currentIndex());
    }
    play(item) {
        this.currentItem = item;
        exports.audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType);
    }
}
exports.AudioJukebox = AudioJukebox;
//# sourceMappingURL=audio-panel.js.map
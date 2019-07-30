"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const SearchPanel = require("./search-panel");
const FilesPanel = require("./files-panel");
const AudioPanel = require("./audio-panel");
const Rest = require("./rest");
const searchPanel = SearchPanel.searchPanel.create();
const filesPanel = FilesPanel.filesPanel.create();
const audioPanel = AudioPanel.audioPanel.create();
document.body.appendChild(audioPanel.root);
searchPanel.form.addEventListener('submit', async (event) => {
    UiTool.stopEvent(event);
    let term = searchPanel.term.value;
    let res = await Rest.search(term, 'audio/%');
    SearchPanel.searchPanel.displayTitle(searchPanel, false);
    FilesPanel.filesPanel.setValues(filesPanel, {
        term: searchPanel.term.value,
        files: res.files
    });
    if (!filesPanel.root.isConnected)
        addContent(filesPanel.root);
});
let contents = [];
function addContent(content) {
    contents.push(content);
    UiTool.el('content-wrapper').appendChild(content);
}
function clearContents() {
    const contentWrapper = UiTool.el('content-wrapper');
    contents.forEach(element => contentWrapper.removeChild(element));
    contents = [];
}
addContent(searchPanel.root);
class AudioJukebox {
    constructor(audioPanel) {
        this.audioPanel = audioPanel;
        this.queue = [];
        this.currentItem = null;
        this.audioPanel.player.addEventListener('ended', () => {
            let currentIndex = this.queue.indexOf(this.currentItem);
            if (currentIndex > 0)
                this.play(this.queue[currentIndex - 1]);
        });
    }
    addAndPlay(item) {
        if (this.queue.length && this.queue[0].sha == item.sha)
            return;
        this.queue.push(item);
        this.play(item);
    }
    play(item) {
        this.currentItem = item;
        this.audioPanel.title.innerText = item.name;
        this.audioPanel.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${item.sha}/content?type=${item.mimeType}`);
        this.audioPanel.player.setAttribute('type', item.mimeType);
        this.audioPanel.root.classList.remove("is-hidden");
        this.audioPanel.player.play();
    }
}
const audioJukebox = new AudioJukebox(audioPanel);
async function playAudio(name, sha, mimeType) {
    audioJukebox.addAndPlay({ name, sha, mimeType });
}
window['playAudio'] = playAudio;
//# sourceMappingURL=index.js.map
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
async function playAudio(name, sha, mimeType) {
    const audioElement = audioPanel.player;
    audioElement.classList.remove("is-hidden");
    audioElement.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
    audioElement.setAttribute('type', mimeType);
    audioElement.play();
}
audioPanel.player.addEventListener('ended', () => {
    //listenNext()
});
window['playAudio'] = playAudio;
//# sourceMappingURL=index.js.map
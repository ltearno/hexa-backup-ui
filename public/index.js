"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const SearchPanel = require("./search-panel");
const FilesPanel = require("./files-panel");
const AudioPanel = require("./audio-panel");
const Rest = require("./rest");
const Auth = require("./auth");
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
const searchPanel = SearchPanel.searchPanel.create();
const filesPanel = FilesPanel.filesPanel.create();
const audioPanel = AudioPanel.audioPanel.create();
document.body.appendChild(audioPanel.root);
addContent(searchPanel.root);
const audioJukebox = new AudioPanel.AudioJukebox(audioPanel);
async function playAudio(name, sha, mimeType) {
    audioJukebox.addAndPlay({ name: decodeURIComponent(name), sha: decodeURIComponent(sha), mimeType: decodeURIComponent(mimeType) });
}
window['playAudio'] = playAudio;
Auth.autoRenewAuth();
/**
 * Events
 */
searchPanel.form.addEventListener('submit', async (event) => {
    UiTool.stopEvent(event);
    let term = searchPanel.term.value;
    SearchPanel.searchPanel.displayTitle(searchPanel, false);
    FilesPanel.filesPanel.displaySearching(filesPanel, term);
    let res = await Rest.search(term, 'audio/%');
    FilesPanel.filesPanel.setValues(filesPanel, {
        term: searchPanel.term.value,
        files: res.files
    });
    if (!filesPanel.root.isConnected)
        addContent(filesPanel.root);
});
//# sourceMappingURL=index.js.map
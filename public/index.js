"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const SearchPanel = require("./search-panel");
const Rest = require("./rest");
const searchPanel = SearchPanel.searchPanel.create();
searchPanel.form.addEventListener('submit', async (event) => {
    UiTool.stopEvent(event);
    let res = await Rest.search(searchPanel.term.value, 'audio/%');
    clearContents();
    addContent(UiTool.elFromHtml(`<div>${res.files.map(f => `<div>${f.fileName}</div>`).join('')}</div>`));
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
//# sourceMappingURL=index.js.map
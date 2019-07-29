"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const SearchPanel = require("./search-panel");
const searchPanel = SearchPanel.searchPanel.create();
searchPanel.form.addEventListener('submit', event => {
    UiTool.stopEvent(event);
    console.log(searchPanel.term.value);
    clearContents();
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
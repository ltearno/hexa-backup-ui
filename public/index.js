"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const Templates = require("./templates");
const searchPanelElement = Templates.searchPanel.createElement();
const searchPanelElements = Templates.searchPanel.elements(searchPanelElement);
searchPanelElements.form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopPropagation();
    console.log(searchPanelElements.term.value);
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
addContent(searchPanelElement);
//# sourceMappingURL=index.js.map
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
});
UiTool.el('content-wrapper').appendChild(searchPanelElement);
//# sourceMappingURL=index.js.map
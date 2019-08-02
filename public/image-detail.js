"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = require("./rest");
const templates_1 = require("./templates");
const UiTool = require("./ui-tool");
let currentUnroller = null;
const template = `
    <div class="x-image-detail">
        <img x-id="image"/>
        <div x-id="toolbar">
        <button x-id="previous" class="mui-btn mui-btn--flat mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button x-id="next" class="mui-btn mui-btn--flat mui-btn--raised">Next</button>
        </div>
    </div>`;
const element = templates_1.createTemplateInstance(template);
element.previous.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (currentUnroller) {
        let previousItem = currentUnroller.previous();
        if (previousItem)
            showInternal(previousItem);
    }
});
element.next.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (currentUnroller) {
        let nextItem = currentUnroller.next();
        if (nextItem)
            showInternal(nextItem);
    }
});
element.close.addEventListener('click', event => {
    UiTool.stopEvent(event);
    currentUnroller = null;
    document.body.querySelector('header').style.display = undefined;
    if (!element.root.isConnected)
        return;
    element.root.parentElement.removeChild(element.root);
});
function show(item, unroller) {
    currentUnroller = unroller;
    showInternal(item);
}
exports.show = show;
function showInternal(item) {
    document.body.querySelector('header').style.display = 'none';
    if (!element.root.isConnected)
        document.body.appendChild(element.root);
    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType);
    element.image.alt = item.name;
}
//# sourceMappingURL=image-detail.js.map
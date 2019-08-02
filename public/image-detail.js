"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = require("./rest");
const templates_1 = require("./templates");
const template = `
    <div class="x-image-detail">
        <img x-id="image"/>
        <div x-id="toolbar">
        <button class="mui-btn mui-btn--flat mui-btn--flat">Previous</button>
        <button class="mui-btn mui-btn--flat">Close</button>
        <button class="mui-btn mui-btn--flat mui-btn--raised">Next</button>
        </div>
    </div>`;
const element = templates_1.createTemplateInstance(template);
function show(item, unroller) {
    document.body.querySelector('header').style.display = 'none';
    if (!element.root.isConnected)
        document.body.appendChild(element.root);
    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType);
    element.image.alt = item.name;
}
exports.show = show;
//# sourceMappingURL=image-detail.js.map
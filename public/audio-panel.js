"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const TID_Title = 'title';
const TID_Player = 'player';
const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <h3 x-id="${TID_Title}"></h3>
    <audio x-id="${TID_Player}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml, [TID_Title, TID_Player])
};
//# sourceMappingURL=audio-panel.js.map
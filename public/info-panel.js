"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = require("./ui-tool");
const Rest = require("./rest");
const templates_1 = require("./templates");
const Messages = require("./messages");
let isShown = false;
const template = `
<div class="mui-container">
    <div class='mui-panel'>
        <div x-id="title" class="mui--text-title"></div>
        <div class="mui-divider"></div>
        <div>sha: <span x-id='sha'></span></div>
        <div>size: <span x-id='size'></span></div>
        <div>mime type: <span x-id='mimeType'></span></div>
        <div class="mui-divider"></div>
        <div><a x-id="download" href="#">download link</a></div>
        <div class="mui-divider"></div>
        <div>names: <span x-id='names'></span></div>
        <div>write dates: <span x-id='writeDates'></span></div>
        <div>parents: <div x-id='parents'></div></div>
        <div>sources: <span x-id='sources'></span></div>
        <div>exif: <pre x-id="exif"></pre></div>
        <div class="mui-divider"></div>
        <div x-id="close" class="mui-btn mui-btn--flat"></div>
    </div>
</div>`;
const content = templates_1.createTemplateInstance(template);
const options = {
    'keyboard': false,
    'static': true,
    'onclose': function () { }
};
content.close.addEventListener('click', event => {
    UiTool.stopEvent(event);
    history.back();
});
function hide() {
    if (!isShown)
        return;
    isShown = false;
    mui.overlay('off');
}
exports.hide = hide;
function show(item) {
    content.title.innerText = `${item.name} details`;
    content.sha.innerText = item.sha;
    content.mimeType.innerText = item.mimeType;
    content.size.innerText = `${item.size} bytes`;
    content.download.href = Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, true);
    if (!isShown)
        mui.overlay('on', options, content.root);
    isShown = true;
    const loadInfo = async () => {
        const info = await Rest.getShaInfo(item.sha);
        if (!info) {
            Messages.displayMessage(`Cannot load detailed information...`, -1);
            return;
        }
        content.mimeType.innerText = info.mimeTypes.join(', ');
        content.names.innerText = info.names.join(', ');
        content.writeDates.innerText = info.writeDates.map(d => new Date(d * 1000).toDateString()).join(', ');
        content.size.innerText = info.sizes.join(', ');
        content.parents.innerHTML = info.parents.map(p => `<div><a href="#/directories/${p}?name=${encodeURIComponent(`${item.name}'s parents`)}">${p}</a></div>`).join('');
        content.sources.innerText = info.sources.join(', ');
        content.exif.innerHTML = JSON.stringify(info.exifs, null, 2);
    };
    loadInfo();
}
exports.show = show;
//# sourceMappingURL=info-panel.js.map
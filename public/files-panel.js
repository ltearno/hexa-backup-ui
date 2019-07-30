"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const TID_SearchTerm = 'term';
const TID_Files = 'files';
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2>Results for '<span x-id="${TID_SearchTerm}"></span>'</h2>
        <div x-id="${TID_Files}"></div>
    </div>
</div>`;
exports.filesPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml, [TID_SearchTerm, TID_Files]),
    setValues: (elements, values) => {
        elements.term.innerText = values.term;
        elements.files.innerHTML = values.files.map(f => `<div onclick='playAudio("${f.sha}", "${f.mimeType}")'>${f.name}</div>`).join('');
    }
};
//# sourceMappingURL=files-panel.js.map
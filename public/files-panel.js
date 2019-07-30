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
    displaySearching: (elements, term) => {
        elements.term.innerText = term;
        elements.files.innerHTML = `<div class="mui--text-dark-hint">Searching ...</div>`;
    },
    setValues: (elements, values) => {
        elements.term.innerText = values.term;
        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div onclick="playAudio('${encodeURIComponent(f.name)}', '${encodeURIComponent(f.sha)}', '${encodeURIComponent(f.mimeType)}')">${f.name}</div>`).join('');
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
    }
};
//# sourceMappingURL=files-panel.js.map
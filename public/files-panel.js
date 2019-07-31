"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const TID_Title = 'title';
const TID_Files = 'files';
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2 x-id="${TID_Title}"></h2>
        <div x-id="${TID_Files}"></div>
    </div>
</div>`;
exports.filesPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    displaySearching: (elements, term) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}...'</div>`;
    },
    setValues: (elements, values) => {
        elements.title.innerHTML = `Results for '${values.term}'`;
        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`).join('');
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
    },
};
//# sourceMappingURL=files-panel.js.map
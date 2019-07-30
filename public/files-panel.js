﻿"use strict";
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
function templateAddEventListener(elements, name, listener) {
    elements.root.addEventListener(name, event => {
        let els = new Set(Object.values(elements));
        let c = event.target;
        let p = null;
        do {
            if (els.has(c)) {
                listener(event, c, p && Array.prototype.indexOf.call(c.children, p));
                return;
            }
            if (c == elements.root)
                return;
            p = c;
            c = c.parentElement;
        } while (c);
    });
}
exports.templateAddEventListener = templateAddEventListener;
exports.filesPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml, [TID_SearchTerm, TID_Files]),
    displaySearching: (elements, term) => {
        elements.term.innerText = term;
        elements.files.innerHTML = `<div class="mui--text-dark-hint">Searching ...</div>`;
    },
    setValues: (elements, values) => {
        elements.term.innerText = values.term;
        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div>${f.name}</div>`).join('');
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
    },
};
//# sourceMappingURL=files-panel.js.map
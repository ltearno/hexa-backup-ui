"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const Snippets = require("./html-snippets");
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items" class="mui-panel" style="display: inline-block;"></div>
    </div>
</div>`;
exports.directoryPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    setLoading: (elements, title) => {
        elements.title.innerHTML = `Loading '${title}' ...`;
        elements.items.innerHTML = ``;
    },
    displaySearching: (elements, term) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`;
        elements.items.innerHTML = ``;
    },
    setValues: (elements, values) => {
        elements.title.innerHTML = `${values.name}`;
        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('');
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
        }
    },
    setImages: (elements, values) => {
        elements.title.innerHTML = values.term;
        let items = values.items
            .filter(i => i.mimeType.startsWith('image/'))
            .concat(values.items.filter(i => i.mimeType != 'application/directory'));
        elements.items.innerHTML = items.map(item => {
            if (item.mimeType.startsWith('image/'))
                return `<img loading="lazy" src="${HEXA_BACKUP_BASE_URL}/sha/${item.sha}/plugins/image/thumbnail?type=${item.mimeType}"/>`;
            else
                return Snippets.itemToHtml(item);
        }).join('');
    },
};
//# sourceMappingURL=directory-panel.js.map
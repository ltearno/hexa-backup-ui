import { TemplateElements, createTemplateInstance } from './templates'

export interface SearchResultPanelElements extends TemplateElements {
    title: HTMLElement
    items: HTMLElement
}

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items"></div>
    </div>
</div>`

export const searchResultPanel = {
    create: () => createTemplateInstance(templateHtml) as SearchResultPanelElements,

    displaySearching: (elements: SearchResultPanelElements, term: string) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`
        elements.items.innerHTML = ``
    },

    setValues: (elements: SearchResultPanelElements, values: { term: string, items: any[] }) => {
        elements.title.innerHTML = `Results for '${values.term}'`

        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(f => {
                if (f.mimeType == 'application/directory')
                    return `<div class="onclick"><i>${f.name} ...</i></div>`
                return `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`
            }).join('')
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
        }
    },
}
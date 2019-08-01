import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'
import * as Rest from './rest'

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

    setValues: (elements: SearchResultPanelElements, values: { term: string, items: Rest.FileDescriptor[] }) => {
        elements.title.innerHTML = `Results for '${values.term}'`

        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('')
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
        }
    },
}
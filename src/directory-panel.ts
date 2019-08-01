import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'

export interface DirectoryPanelElements extends TemplateElements {
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

export const directoryPanel = {
    create: () => createTemplateInstance(templateHtml) as DirectoryPanelElements,

    setLoading: (elements: DirectoryPanelElements, title: string) => {
        elements.title.innerHTML = `Loading '${title}' ...`
        elements.items.innerHTML = ``
    },

    setValues: (elements: DirectoryPanelElements, values: { name: string, items: Rest.FileDescriptor[] }) => {
        elements.title.innerHTML = `${values.name}`

        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('')
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
        }
    },
}
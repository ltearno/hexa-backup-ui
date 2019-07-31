import { TemplateElements, createTemplateInstance } from './templates'

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
    },

    setValues: (elements: DirectoryPanelElements, values: { name: string, items: any[] }) => {
        elements.title.innerHTML = `Directory '${values.name}'`

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
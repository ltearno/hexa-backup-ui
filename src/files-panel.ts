import { TemplateElements, createTemplateInstance } from './templates'

export interface FilesPanelElements extends TemplateElements {
    title: HTMLElement
    files: HTMLElement
    directories: HTMLElement
}

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="directories"></div>
        <div x-id="files"></div>
    </div>
</div>`

export const filesPanel = {
    create: () => createTemplateInstance(templateHtml) as FilesPanelElements,

    displaySearching: (elements: FilesPanelElements, term: string) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`
    },

    setValues: (elements: FilesPanelElements, values: { term: string, directories: any[], files: any[] }) => {
        elements.title.innerHTML = `Results for '${values.term}'`

        if (values.directories && values.directories.length) {
            console.log('dirs', values.directories)
            elements.directories.innerHTML = values.directories.map(d => `<div>${JSON.stringify(d)}</div>`).join('')
        }

        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`).join('')
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
    },
}
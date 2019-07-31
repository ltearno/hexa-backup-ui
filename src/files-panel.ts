import { TemplateElements, createTemplateInstance } from './templates'

export interface FilesPanelElements extends TemplateElements {
    term: HTMLElement
    files: HTMLElement
}

const TID_SearchTerm = 'term'
const TID_Files = 'files'

const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2>Results for '<span x-id="${TID_SearchTerm}"></span>'</h2>
        <div x-id="${TID_Files}"></div>
    </div>
</div>`

export const filesPanel = {
    create: () => createTemplateInstance(templateHtml) as FilesPanelElements,

    displaySearching: (elements: FilesPanelElements, term: string) => {
        elements.term.innerText = term
        elements.files.innerHTML = `<div class="mui--text-dark-hint">Searching ...</div>`
    },

    setValues: (elements: FilesPanelElements, values: { term: string, files: any[] }) => {
        elements.term.innerText = values.term
        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`).join('')
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
    },
}
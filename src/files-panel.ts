import * as UiTool from './ui-tool'
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
    create: () => createTemplateInstance(templateHtml, [TID_SearchTerm, TID_Files]) as FilesPanelElements,

    setValues: (elements: FilesPanelElements, values: { term: string, files: any[] }) => {
        elements.term.innerText = values.term
        elements.files.innerHTML = values.files.map(f => `<div onclick='playAudio("${f.sha}", "${f.mimeType}")'>${f.name}</div>`).join('')
    }
}
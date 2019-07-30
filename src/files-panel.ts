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

export function templateAddEventListener(elements: TemplateElements, name: string, listener: (event: Event, firstTemplateElement: HTMLElement, incomingChildIndex: number) => any) {
    elements.root.addEventListener(name, event => {
        let els = new Set(Object.values(elements))

        let c = event.target as HTMLElement
        let p: HTMLElement = null

        do {
            if (els.has(c)) {
                listener(event, c, p && Array.prototype.indexOf.call(c.children, p))
                return
            }

            if (c == elements.root)
                return

            p = c
            c = c.parentElement
        } while (c)
    })
}

export const filesPanel = {
    create: () => createTemplateInstance(templateHtml, [TID_SearchTerm, TID_Files]) as FilesPanelElements,

    displaySearching: (elements: FilesPanelElements, term: string) => {
        elements.term.innerText = term
        elements.files.innerHTML = `<div class="mui--text-dark-hint">Searching ...</div>`
    },

    setValues: (elements: FilesPanelElements, values: { term: string, files: any[] }) => {
        elements.term.innerText = values.term
        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div onclick='playAudio(${JSON.stringify(f)})'>${f.name}</div>`).join('')
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`
    }
}
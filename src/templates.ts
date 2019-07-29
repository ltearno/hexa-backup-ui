import * as UiTools from './ui-tool'

function templateElement<T extends HTMLElement>(root: HTMLElement, name: string): T {
    let list = UiTools.els(root, `[x-id=${name}]`)
    return list.length ? list.item(0) as T : null
}

const TEMPLATE_HIDDEN_DATA_ATTRIBUTE = 'template-data'
export interface TemplateElements {
    root: HTMLElement
}

export function createElementAndLocateChildren<T extends HTMLElement>(html: string, elementXIds: string[]): T {
    let root = UiTools.elFromHtml(html)

    let data: TemplateElements = {
        root
    }

    for (let id of elementXIds) {
        data[id] = templateElement(root, id)
    }

    root[TEMPLATE_HIDDEN_DATA_ATTRIBUTE] = data

    return root as T
}

export function getTemplateInstanceData<T extends TemplateElements>(root: HTMLElement): T {
    const data = root[TEMPLATE_HIDDEN_DATA_ATTRIBUTE]
    return data as T
}

export function createTemplateInstance<T extends TemplateElements>(html: string, elementXIds: string[]): T {
    let root = createElementAndLocateChildren(html, elementXIds)
    return getTemplateInstanceData(root)
}
import * as UiTools from './ui-tool'

const elementsData = new WeakMap<HTMLElement, TemplateElements>()

function templateElement<T extends HTMLElement>(root: HTMLElement, name: string): T {
    let list = UiTools.els(root, `[x-id=${name}]`)
    return list.length ? list.item(0) as T : null
}

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

    elementsData.set(root, data)

    return root as T
}

export function getTemplateInstanceData<T extends TemplateElements>(root: HTMLElement): T {
    const data = elementsData.get(root)
    return data as T
}

export function createTemplateInstance<T extends TemplateElements>(html: string, elementXIds: string[]): T {
    let root = createElementAndLocateChildren(html, elementXIds)
    return getTemplateInstanceData(root)
}
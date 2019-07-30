import * as UiTools from './ui-tool'

const elementsData = new WeakMap<HTMLElement, TemplateElements>()

export interface TemplateElements {
    root: HTMLElement
}

export function createElementAndLocateChildren<O, T extends HTMLElement>(obj: O, html: string): T & O {
    let root = UiTools.elFromHtml(html)

    obj['root'] = root

    UiTools.els(root, `[x-id]`).forEach(e => obj[e.getAttribute('x-id')] = e)

    elementsData.set(root, obj as any)

    return root as T & O
}

export function getTemplateInstanceData<T extends TemplateElements>(root: HTMLElement): T {
    const data = elementsData.get(root)
    return data as T
}

export function createTemplateInstance<T extends TemplateElements>(html: string): T {
    let root = createElementAndLocateChildren({}, html)
    return getTemplateInstanceData(root)
}

const EMPTY_LOCATION = { element: null, childIndex: -1 }

export function templateGetEventLocation(elements: TemplateElements, event: Event): { element: HTMLElement, childIndex: number } {
    let els = new Set(Object.values(elements))

    let c = event.target as HTMLElement
    let p: HTMLElement = null

    do {
        if (els.has(c)) {
            return {
                element: c,
                childIndex: p && Array.prototype.indexOf.call(c.children, p)
            }
        }

        if (c == elements.root)
            return EMPTY_LOCATION

        p = c
        c = c.parentElement
    } while (c)

    return EMPTY_LOCATION
}
export function el<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T
}

export function els<T extends HTMLElement>(element: HTMLElement, selector: string) {
    return element.querySelectorAll(selector) as NodeListOf<T>
}

export function elFromHtml<T extends HTMLElement>(html: string): T {
    const parent = document.createElement('div')
    parent.innerHTML = html
    return parent.children.item(0) as T
}
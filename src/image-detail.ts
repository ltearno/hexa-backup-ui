import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'
import * as UiTool from './ui-tool'

export interface Unroller {
    previous(): Rest.FileDescriptor
    next(): Rest.FileDescriptor
}

let currentUnroller: Unroller = null

const template = `
    <div class="x-image-detail">
        <img x-id="image"/>
        <div x-id="toolbar">
        <button x-id="previous" class="mui-btn mui-btn--flat mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button x-id="next" class="mui-btn mui-btn--flat mui-btn--raised">Next</button>
        </div>
    </div>`

const element: {
    root: HTMLElement
    image: HTMLImageElement
    toolbar: HTMLElement
    close: HTMLElement
    previous: HTMLElement
    next: HTMLElement
} = createTemplateInstance(template)

element.previous.addEventListener('click', event => {
    UiTool.stopEvent(event)

    if (currentUnroller) {
        let previousItem = currentUnroller.previous()
        if (previousItem)
            showInternal(previousItem)
    }
})

element.next.addEventListener('click', event => {
    UiTool.stopEvent(event)

    if (currentUnroller) {
        let nextItem = currentUnroller.next()
        if (nextItem)
            showInternal(nextItem)
    }
})

element.close.addEventListener('click', event => {
    UiTool.stopEvent(event)

    currentUnroller = null

    document.body.querySelector('header').style.display = undefined

    if (!element.root.isConnected)
        return

    element.root.parentElement.removeChild(element.root)
})

export function show(item: Rest.FileDescriptor, unroller: Unroller) {
    currentUnroller = unroller

    showInternal(item)
}

function showInternal(item: Rest.FileDescriptor) {
    document.body.querySelector('header').style.display = 'none'

    if (!element.root.isConnected)
        document.body.appendChild(element.root)

    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType)
    element.image.alt = item.name
}
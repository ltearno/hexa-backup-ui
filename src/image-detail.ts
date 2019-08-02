import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'
import * as UiTool from './ui-tool'

const template = `
    <div class="x-image-detail">
        <img x-id="image"/>
        <div x-id="toolbar">
        <button class="mui-btn mui-btn--flat mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button class="mui-btn mui-btn--flat mui-btn--raised">Next</button>
        </div>
    </div>`

const element: {
    root: HTMLElement
    image: HTMLImageElement
    toolbar: HTMLElement
    close: HTMLElement
} = createTemplateInstance(template)

element.close.addEventListener('click', event => {
    UiTool.stopEvent(event)

    document.body.querySelector('header').style.display = undefined
    
    if (!element.root.isConnected)
        return

    element.root.parentElement.removeChild(element.root)
})

export interface Unroller {
    previous(): Rest.FileDescriptor
    next(): Rest.FileDescriptor
}

export function show(item: Rest.FileDescriptor, unroller: Unroller) {
    document.body.querySelector('header').style.display = 'none'

    if (!element.root.isConnected)
        document.body.appendChild(element.root)

    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType)
    element.image.alt = item.name
}
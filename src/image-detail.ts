import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'
import * as UiTool from './ui-tool'
import * as Messages from './messages'
import * as Locations from './locations'

export interface Unroller {
    previous(): Rest.FileDescriptor
    next(): Rest.FileDescriptor
}

let currentUnroller: Unroller = null
let shownItem: Rest.FileDescriptor = null

const template = `
    <div class="x-image-detail">
        <a x-id="downloadLink"><img x-id="image"/></a>
        <div x-id="toolbar">
        <button x-id="info" class="mui-btn mui-btn--flat">Info</button>
        <button x-id="previous" class="mui-btn mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button x-id="next" class="mui-btn mui-btn--flat">Next</button>
        <button x-id="diaporama" class="mui-btn mui-btn--flat">Diapo</button>
        </div>
    </div>`

const element: {
    root: HTMLElement
    image: HTMLImageElement
    toolbar: HTMLElement
    info: HTMLElement
    close: HTMLElement
    previous: HTMLElement
    next: HTMLElement
    diaporama: HTMLElement
    downloadLink: HTMLAnchorElement
} = createTemplateInstance(template)

element.info.addEventListener('click', event => {
    UiTool.stopEvent(event)

    if (shownItem) {
        stopDiaporama()
        Locations.goShaInfo(shownItem)
    }
})

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

    showNext()
})

function showNext() {
    if (currentUnroller) {
        let nextItem = currentUnroller.next()
        if (nextItem)
            showInternal(nextItem)
    }
}

let diaporamaTimer = null

element.diaporama.addEventListener('click', event => {
    UiTool.stopEvent(event)

    if (diaporamaTimer) {
        stopDiaporama()
        return
    }

    Messages.displayMessage(`Start diaporama`, 0)

    diaporamaTimer = setInterval(() => showNext(), 2000)

    if (currentUnroller) {
        let nextItem = currentUnroller.next()
        if (nextItem)
            showInternal(nextItem)
    }
})

function stopDiaporama() {
    if (diaporamaTimer) {
        Messages.displayMessage(`Diaporama stopped`, 0)
        clearInterval(diaporamaTimer)
        diaporamaTimer = null
    }
}

element.close.addEventListener('click', event => {
    UiTool.stopEvent(event)

    stopDiaporama()
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
    shownItem = item
    document.body.querySelector('header').style.display = 'none'

    if (!element.root.isConnected)
        document.body.appendChild(element.root)

    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType)
    element.image.alt = item.name
    element.downloadLink.href = Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, true)
}
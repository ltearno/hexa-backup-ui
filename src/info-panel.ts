import * as UiTool from './ui-tool'
import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'

declare var mui: any

let isShown = false

const template = `
<div class="mui-container">
    <div class='mui-panel'>
        <div x-id="title" class="mui--text-title"></div>
        <div class="mui-divider"></div>
        <div>sha: <span x-id='sha'></span></div>
        <div>size: <span x-id='size'></span></div>
        <div>mime type: <span x-id='mimeType'></span></div>
    </div>
</div>`

const content: {
    root: HTMLElement
    title: HTMLElement
    sha: HTMLElement
    mimeType: HTMLElement
    size: HTMLElement
} = createTemplateInstance(template)

const options = {
    'keyboard': false,
    'static': true,
    'onclose': function () { }
}

export function hide() {
    if (!isShown)
        return
    isShown = false

    mui.overlay('off')
}

export function show(item: Rest.FileDescriptor) {
    content.title.innerText = `${item.name} details`
    content.sha.innerText = item.sha
    content.mimeType.innerText = item.mimeType
    content.size.innerText = `${item.size} bytes`

    if (!isShown)
        mui.overlay('on', options, content.root)
    isShown = true
}
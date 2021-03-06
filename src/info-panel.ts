import * as UiTool from './ui-tool'
import * as Rest from './rest'
import { TemplateElements, createTemplateInstance } from './templates'
import * as Snippets from './html-snippets'
import * as Messages from './messages'
import * as MimeTypes from './mime-types-module'

const KB = 1024
const MB = 1024 * KB
const GB = 1024 * MB
const TB = 1024 * GB

function friendlySize(size: number) {
    if (size > 2 * TB)
        return `${(size / TB).toFixed(1)} TBb (${size} bytes)`
    if (size > 2 * GB)
        return `${(size / GB).toFixed(1)} Gb (${size} bytes)`
    if (size > 2 * MB)
        return `${(size / MB).toFixed(1)} Mb (${size} bytes)`
    if (size > 2 * KB)
        return `${(size / KB).toFixed(1)} kb (${size} bytes)`
    if (size > 1)
        return `${size} bytes`
    if (size == 1)
        return `1 byte`
    return `empty`
}

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
        <div class="mui-divider"></div>
        <div><a x-id="download" href="#">download link</a></div>
        <div class="mui-divider"></div>
        <div x-id="extras"></div>

        <div>names: <span x-id='names'></span></div>
        <div>write dates: <span x-id='writeDates'></span></div>
        <div>parents: <div x-id='parents'></div></div>
        <div>sources: <div x-id='sources'></div></div>
        <div>exif: <div x-id="exif"></div></div>
        <div>audio metadata: <div x-id="audioMetadata"></div></div>
        <div class="mui-divider"></div>
        <div x-id="close" class="mui-btn mui-btn--flat mui-btn--primary">Close</div>
    </div>
</div>`

const content: {
    root: HTMLElement
    title: HTMLElement
    sha: HTMLElement
    mimeType: HTMLElement
    size: HTMLElement
    download: HTMLAnchorElement
    exif: HTMLPreElement
    audioMetadata: HTMLElement
    names: HTMLElement
    writeDates: HTMLElement
    parents: HTMLElement
    sources: HTMLElement
    extras: HTMLElement
    close: HTMLButtonElement
} = createTemplateInstance(template)

const options = {
    'keyboard': false,
    'static': true,
    'onclose': function () { }
}

content.close.addEventListener('click', event => {
    UiTool.stopEvent(event)
    history.back()
})

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
    content.size.innerText = friendlySize(item.size)
    let fullName = item.name
    let extension = '.' + MimeTypes.extensionFromMimeType(item.mimeType)
    if (!fullName.endsWith(extension))
        fullName += extension
    content.download.href = Rest.getShaContentUrl(item.sha, item.mimeType, fullName, true, true)

    if (item.mimeType.startsWith('image/')) {
        content.extras.innerHTML = `<a target="_blank" href="${Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, false)}"><img src="${Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)}"/></a><div class="mui-divider"></div>`
    }
    else {
        content.extras.innerHTML = ''
    }

    if (!isShown)
        mui.overlay('on', options, content.root)
    isShown = true

    content.names.innerText = `...`
    content.writeDates.innerText = `...`
    content.parents.innerHTML = `...`
    content.sources.innerHTML = `...`
    content.exif.innerHTML = `...`
    content.audioMetadata.innerHTML = `...`

    const loadInfo = async () => {
        const info = await Rest.getShaInfo(item.sha)
        if (!info) {
            Messages.displayMessage(`Cannot load detailed information...`, -1)
            return
        }

        content.mimeType.innerText = info.mimeTypes.join(', ')
        content.names.innerText = info.names.join(', ')
        content.writeDates.innerText = info.writeDates.map(d => new Date(d / 1000).toDateString()).join(', ')
        content.size.innerText = info.sizes.map(friendlySize).join(', ')
        content.parents.innerHTML = info.parents.map(p => `<div><a href="#/directories/${p}?name=${encodeURIComponent(`${item.name}'s parents`)}">${p}</a></div>`).join('')
        content.sources.innerHTML = info.sources.map(s => `<div><a href="#/refs/${s}">${s}</a></div>`).join('')
        if (info.exifs && info.exifs.length) {
            content.exif.innerHTML = `
                <table class="mui-table">
                    <thead>
                        <tr>
                        <th>Property</th>
                        <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${info.exifs.map(exif => Object.entries(exif).map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`).join('')).join('')}
                    </tbody>
                </table>`
        }
        else {
            content.exif.innerHTML = `no exif data`
        }
        if (info.audioMetadata && info.audioMetadata.length) {
            content.audioMetadata.innerHTML = `<pre>${JSON.stringify(info.audioMetadata, null, 2)}</pre>`
        }
        else {
            content.audioMetadata.innerHTML = `no audio metadata`
        }
    }

    loadInfo()
}
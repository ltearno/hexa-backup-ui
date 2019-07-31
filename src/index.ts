import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as SearchResultPanel from './search-result-panel'
import * as AudioPanel from './audio-panel'
import * as DirectoryPanel from './directory-panel'
import * as Rest from './rest'
import * as Auth from './auth'
import * as Templates from './templates'
import * as MimeTypes from './mime-types-module'

let contents: HTMLElement[] = []
function addContent(content: HTMLElement) {
    contents.push(content)
    UiTool.el('content-wrapper').insertBefore(content, UiTool.el('first-element-after-contents'))
}

function clearContents() {
    const contentWrapper = UiTool.el('content-wrapper')
    contents.forEach(element => contentWrapper.removeChild(element))
    contents = []
}

const searchPanel = SearchPanel.searchPanel.create()
const searchResultPanel = SearchResultPanel.searchResultPanel.create()
const audioPanel = AudioPanel.audioPanel.create()
const directoryPanel = DirectoryPanel.directoryPanel.create()
document.body.appendChild(audioPanel.root)

addContent(searchPanel.root)

const audioJukebox = new AudioPanel.AudioJukebox(audioPanel)

Auth.autoRenewAuth()

/**
 * Events
 */

let lastDisplayedFiles: Rest.FileDescriptor[] = null
let lastSearchTerm: string = null // HACK very temporary

function beautifyNames(items: Rest.FileDescriptor[]) {
    return items.map(file => {
        if (file.mimeType.startsWith('audio/')) {
            let dot = file.name.lastIndexOf('.')
            if (dot)
                file.name = file.name.substring(0, dot)
            file.name = file.name.replace(/'_'/g, ' ')
                .replace(/'  '/g, ' ')
                .replace(/[ ]*-[ ]*/g, ' - ')
        }

        return file
    })
}

async function searchItems(term: string) {
    searchPanel.term.value = term

    SearchPanel.searchPanel.displayTitle(searchPanel, false)
    SearchResultPanel.searchResultPanel.displaySearching(searchResultPanel, term)
    if (!searchResultPanel.root.isConnected)
        addContent(searchResultPanel.root)

    let res = await Rest.search(term, 'audio/%')

    // first files then directories
    res.items = res.items.filter(i => !i.mimeType.startsWith('application/directory')).concat(res.items.filter(i => i.mimeType.startsWith('application/directory')))

    res.items = beautifyNames(res.files)

    SearchResultPanel.searchResultPanel.setValues(searchResultPanel, {
        term: searchPanel.term.value,
        items: res.items
    })

    lastDisplayedFiles = res.items
    lastSearchTerm = term
}

searchPanel.form.addEventListener('submit', event => {
    UiTool.stopEvent(event)

    let term = searchPanel.term.value

    searchItems(term)
})

function getMimeType(f: Rest.DirectoryDescriptorFile) {
    if (f.isDirectory)
        return 'application/directory'

    let pos = f.name.lastIndexOf('.')
    if (pos >= 0) {
        let extension = f.name.substr(pos + 1).toLocaleLowerCase()
        if (extension in MimeTypes.MimeTypes)
            return MimeTypes.MimeTypes[extension]
    }

    return 'application/octet-stream'
}

function directoryDescriptorToFileDescriptor(d: Rest.DirectoryDescriptorFile): Rest.FileDescriptor {
    return {
        sha: d.contentSha,
        name: d.name,
        mimeType: getMimeType(d),
        lastWrite: d.lastWrite,
        size: d.size
    }
}

searchResultPanel.root.addEventListener('click', async event => {
    // todo : knownledge to do that is in files-panel
    let { element, childIndex } = Templates.templateGetEventLocation(searchResultPanel, event)
    if (lastDisplayedFiles && element == searchResultPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        let clickedItem = lastDisplayedFiles[childIndex]

        if (clickedItem.mimeType == 'application/directory') {
            addContent(directoryPanel.root)

            DirectoryPanel.directoryPanel.setLoading(directoryPanel, clickedItem.name)

            let directoryDescriptor = await Rest.getDirectoryDescriptor(clickedItem.sha)
            let items = directoryDescriptor.files.map(directoryDescriptorToFileDescriptor)

            DirectoryPanel.directoryPanel.setValues(directoryPanel, {
                name: clickedItem.name,
                items
            })
        }
        if (clickedItem.mimeType.startsWith('audio/')) {
            audioJukebox.addAndPlay(clickedItem)

            // set an unroller
            if (childIndex >= lastDisplayedFiles.length - 1) {
                audioJukebox.setItemUnroller(null)
            }
            else {
                let term = lastSearchTerm
                let unrolledItems = lastDisplayedFiles.slice(childIndex + 1).filter(f => f.mimeType.startsWith('audio/'))
                let unrollIndex = 0
                if (unrolledItems.length) {
                    audioJukebox.setItemUnroller({
                        name: () => {
                            if (unrollIndex >= 0 && unrollIndex < unrolledItems.length)
                                return `then '${unrolledItems[unrollIndex].name.substr(0, 20)}' and ${unrolledItems.length - unrollIndex - 1} other '${term}' searched items...`
                            return `finished '${term} songs`
                        },
                        unroll: () => unrolledItems[unrollIndex++],
                        hasNext: () => unrollIndex >= 0 && unrollIndex < unrolledItems.length
                    })
                }
            }
        }
    }
})
import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as SearchResultPanel from './search-result-panel'
import * as AudioPanel from './audio-panel'
import * as DirectoryPanel from './directory-panel'
import * as Rest from './rest'
import * as Auth from './auth'
import * as Templates from './templates'
import * as MimeTypes from './mime-types-module'

/*
hash urls :

- ''                                home
- '#/'                              home
- '#'                               home
- '#/search/:term                   search
- '#/directories/:sha?name=xxx      directory
*/

function parseURL(url: string) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }
    return {
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject as any
    }
}

function readHashAndAct() {
    let hash = ''
    if (window.location.hash && window.location.hash.startsWith('#'))
        hash = window.location.hash.substr(1)

    let parsed = parseURL(hash)

    if (parsed.pathname.startsWith('/search/')) {
        searchItems(parsed.pathname.substr('/search/'.length))
    }
    else if (parsed.pathname.startsWith('/directories/')) {
        const sha = parsed.pathname.substring('/directories/'.length)
        const name = parsed.searchObject.name || sha
        loadDirectory({
            lastWrite: 0,
            mimeType: 'application/directory',
            size: 0,
            sha,
            name
        })
    }
}

const searchPanel = SearchPanel.searchPanel.create()
const searchResultPanel = SearchResultPanel.searchResultPanel.create()
const audioPanel = AudioPanel.audioPanel.create()
const audioJukebox = new AudioPanel.AudioJukebox(audioPanel)
const directoryPanel = DirectoryPanel.directoryPanel.create()


let actualContent: HTMLElement = null
function setContent(content: HTMLElement) {
    if (content === actualContent)
        return

    if (actualContent)
        actualContent.parentElement && actualContent.parentElement.removeChild(actualContent)

    actualContent = content

    if (actualContent)
        UiTool.el('content-wrapper').insertBefore(content, UiTool.el('first-element-after-contents'))
}

document.body.appendChild(audioPanel.root)
UiTool.el('content-wrapper').insertBefore(searchPanel.root, UiTool.el('first-element-after-contents'))

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
        setContent(searchResultPanel.root)

    let res = await Rest.search(term, 'audio/%')

    // first files then directories
    res.items = res.items.filter(i => !i.mimeType.startsWith('application/directory')).concat(res.items.filter(i => i.mimeType.startsWith('application/directory')))

    res.items = beautifyNames(res.items)

    lastDisplayedFiles = res.items
    lastSearchTerm = term

    SearchResultPanel.searchResultPanel.setValues(searchResultPanel, {
        term: searchPanel.term.value,
        items: res.items
    })
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

async function loadDirectory(item: Rest.FileDescriptor) {
    setContent(directoryPanel.root)

    DirectoryPanel.directoryPanel.setLoading(directoryPanel, item.name)

    let directoryDescriptor = await Rest.getDirectoryDescriptor(item.sha)
    let items = directoryDescriptor.files.map(directoryDescriptorToFileDescriptor)

    items = beautifyNames(items)

    lastDisplayedFiles = items
    lastSearchTerm = item.name

    DirectoryPanel.directoryPanel.setValues(directoryPanel, {
        name: item.name,
        items
    })
}

function itemDefaultAction(childIndex: number) {
    let clickedItem = lastDisplayedFiles[childIndex]

    if (clickedItem.mimeType == 'application/directory') {
        loadDirectory(clickedItem)
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
                            return `then '${unrolledItems[unrollIndex].name.substr(0, 20)}' and ${unrolledItems.length - unrollIndex - 1} other '${term}' items...`
                        return `finished '${term} songs`
                    },
                    unroll: () => unrolledItems[unrollIndex++],
                    hasNext: () => unrollIndex >= 0 && unrollIndex < unrolledItems.length
                })
            }
        }
    }
}

searchResultPanel.root.addEventListener('click', async event => {
    // todo : knownledge to do that is in files-panel
    let { element, childIndex } = Templates.templateGetEventLocation(searchResultPanel, event)
    if (lastDisplayedFiles && element == searchResultPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        itemDefaultAction(childIndex)
    }
})

directoryPanel.root.addEventListener('click', async event => {
    // todo : knownledge to do that is in files-panel
    let { element, childIndex } = Templates.templateGetEventLocation(directoryPanel, event)
    if (lastDisplayedFiles && element == directoryPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        itemDefaultAction(childIndex)
    }
})

readHashAndAct()
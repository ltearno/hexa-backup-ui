import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as AudioPanel from './audio-panel'
import * as DirectoryPanel from './directory-panel'
import * as Rest from './rest'
import * as Auth from './auth'
import * as Templates from './templates'
import * as MimeTypes from './mime-types-module'
import * as Messages from './messages'
import * as Slideshow from './slideshow'
import * as InfoPanel from './info-panel'
import * as ImageDetails from './image-detail'
import * as Locations from './locations'
import * as SettingsPanel from './settings-panel'

/*
hash urls :

- ''                                home
- '#/'                              home
- '#'                               home
- '#/search/:term                   search
- '#/directories/:sha?name=xxx      directory
- '#/browse'
- '#/refs/:name'
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
        searchObject[split[0]] = decodeURIComponent(split[1])
    }
    return {
        pathname: decodeURIComponent(parser.pathname),
        searchObject: searchObject as any
    }
}

function readHashAndAct() {
    let hideAudioJukebox = false
    let hideInfoPanel = true
    let showSearch = true
    let showSettings = false

    let hash = ''
    if (window.location.hash && window.location.hash.startsWith('#'))
        hash = window.location.hash.substr(1)

    let parsed = parseURL(hash)

    if (parsed.pathname.startsWith('/search/')) {
        searchItems(parsed.pathname.substr('/search/'.length))
    }
    else if (parsed.pathname == '/settings') {
        setContent(settingsPanel.root)
        showSearch = false
        showSettings = true
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
    else if (parsed.pathname == '/browse') {
        loadReferences()
    }
    else if (parsed.pathname.startsWith('/refs/')) {
        const name = parsed.pathname.substring('/refs/'.length)
        loadReference(name)
    }
    else if (parsed.pathname == '/playlists') {
        loadPlaylists()
    }
    else if (parsed.pathname.startsWith('/playlists/')) {
        const name = parsed.pathname.substring('/playlists/'.length)
        loadPlaylist(name)
    }
    else if (parsed.pathname == '/slideshow') {
        hideAudioJukebox = true
        showSlideshow()
    }
    else if (parsed.pathname.startsWith('/info/')) {
        hideInfoPanel = false
        const item: Rest.FileDescriptor = JSON.parse(parsed.pathname.substring('/info/'.length))
        showInfo(item)
    }
    else {
        console.log(`unkown path ${parsed.pathname}`)
    }

    if (hideInfoPanel)
        InfoPanel.hide()

    showIf(!hideAudioJukebox, audioPanel)
    showIf(showSearch, searchPanel)
    showIf(showSettings, settingsPanel)
}

const showIf = (condition: boolean, panel: Templates.TemplateElements) => {
    if (condition)
        panel.root.classList.remove('is-hidden')
    else
        panel.root.classList.add('is-hidden')
}

enum Mode {
    Audio = 0,
    Image = 1
}

const settingsPanel = SettingsPanel.create()
const searchPanel = SearchPanel.searchPanel.create()
const audioPanel = AudioPanel.audioPanel.create()
const audioJukebox = new AudioPanel.AudioJukebox(audioPanel)
const directoryPanel = DirectoryPanel.directoryPanel.create()
let slideshow = null

let lastDisplayedFiles: Rest.FileDescriptor[] = null
let lastSearchTerm: string = null // HACK very temporary
let actualContent: HTMLElement = null
let currentMode = Mode.Audio

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
 * Waiter tool
 */

const beginWait = (callback: () => any) => {
    let isDone = false
    setTimeout(() => isDone || callback(), 500)
    return {
        done: () => {
            isDone = true
        }
    }
}

/**
 * Events
 */

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
    SearchPanel.searchPanel.displayTitle(searchPanel, false)

    const waiting = beginWait(() => Messages.displayMessage(`Still searching '${term}' ...`, 0))

    let mimeType = '%'
    switch (currentMode) {
        case Mode.Audio:
            mimeType = 'audio/%'
            break
        case Mode.Image:
            mimeType = 'image/%'
            break
    }

    let res = await Rest.search(term, mimeType)
    if (!res) {
        waiting.done()
        Messages.displayMessage(`Error occurred, retry please...`, -1)
    }

    // first files then directories
    res.items = res.items
        .filter(i => i.mimeType != 'application/directory')
        .concat(res.items.filter(i => i.mimeType == 'application/directory'))

    res.items = beautifyNames(res.items)

    lastDisplayedFiles = res.items
    lastSearchTerm = term

    waiting.done()

    setContent(directoryPanel.root)
    switch (currentMode) {
        case Mode.Audio:
            DirectoryPanel.directoryPanel.setValues(directoryPanel, {
                name: `Results for '${term}'`,
                items: res.items
            })
            break

        case Mode.Image:
            DirectoryPanel.directoryPanel.setImages(directoryPanel, {
                term: term,
                items: res.items
            })
            break
    }
}

searchPanel.form.addEventListener('submit', event => {
    UiTool.stopEvent(event)

    let term = searchPanel.term.value
    searchPanel.term.blur()

    Locations.goSearchItems(term)
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
    const waiting = beginWait(() => {
        setContent(directoryPanel.root)
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, item.name)
    })

    let directoryDescriptor = await Rest.getDirectoryDescriptor(item.sha)
    let items = directoryDescriptor.files.map(directoryDescriptorToFileDescriptor)

    items = beautifyNames(items)

    lastDisplayedFiles = items
    lastSearchTerm = item.name

    waiting.done()

    setContent(directoryPanel.root)
    switch (currentMode) {
        case Mode.Audio:
            DirectoryPanel.directoryPanel.setValues(directoryPanel, {
                name: item.name,
                items: items
            })
            break

        case Mode.Image:
            DirectoryPanel.directoryPanel.setImages(directoryPanel, {
                term: item.name,
                items: items
            })
            break
    }
}

async function loadReferences() {
    let waiting = beginWait(() => {
        setContent(directoryPanel.root)
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, "References")
    })

    let references = await Rest.getReferences()

    let items: Rest.FileDescriptor[] = references.map(reference => ({
        name: reference,
        lastWrite: 0,
        mimeType: 'application/reference',
        sha: reference,
        size: 0
    }))

    lastDisplayedFiles = items
    lastSearchTerm = ''

    waiting.done()

    setContent(directoryPanel.root)
    DirectoryPanel.directoryPanel.setValues(directoryPanel, {
        name: "References",
        items
    })
}

async function loadPlaylists() {
    let waiting = beginWait(() => {
        setContent(directoryPanel.root)
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, "Playlists")
    })

    let playlists = await Rest.getPlaylists()

    let items: Rest.FileDescriptor[] = playlists
        .map(reference => reference.substr(0, 1).toUpperCase() + reference.substr(1).toLowerCase())
        .map(reference => ({
            name: reference,
            lastWrite: 0,
            mimeType: 'application/playlist',
            sha: reference,
            size: 0
        }))

    lastDisplayedFiles = items
    lastSearchTerm = ''

    waiting.done()

    setContent(directoryPanel.root)
    DirectoryPanel.directoryPanel.setValues(directoryPanel, {
        name: "Playlists",
        items
    })
}

async function loadPlaylist(name: string) {
    const waiting = beginWait(() => {
        setContent(directoryPanel.root)
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, `Playlist '${name}'`)
    })

    let user = await Auth.me()

    let reference = await Rest.getReference(`PLUGIN-PLAYLISTS-${user.uuid.toUpperCase()}-${name.toUpperCase()}`)
    let commit = await Rest.getCommit(reference.currentCommitSha)

    waiting.done()

    await loadDirectory({
        sha: commit.directoryDescriptorSha,
        name,
        mimeType: 'application/directory',
        lastWrite: 0,
        size: 0
    })
}

async function loadReference(name: string) {
    const waiting = beginWait(() => {
        setContent(directoryPanel.root)
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, `Reference '${name}'`)
    })

    let reference = await Rest.getReference(name)
    let commit = await Rest.getCommit(reference.currentCommitSha)

    waiting.done()

    await loadDirectory({
        sha: commit.directoryDescriptorSha,
        name,
        mimeType: 'application/directory',
        lastWrite: 0,
        size: 0
    })
}

function itemDefaultAction(childIndex: number, event: Event) {
    let item = lastDisplayedFiles[childIndex]
    const target = event.target as HTMLElement

    if (target.classList.contains('x-info-display-action')) {
        UiTool.stopEvent(event)
        Locations.goShaInfo(item)
        return
    }

    if (target.classList.contains('x-image-zoom-action')) {
        UiTool.stopEvent(event)
        let unrolledItems = lastDisplayedFiles
        let currentPosition = childIndex

        const nextPosition = (direction: number) => {
            let nextPosition = currentPosition + direction
            while (nextPosition >= 0 && nextPosition < unrolledItems.length && !unrolledItems[nextPosition].mimeType.startsWith('image/')) {
                nextPosition += direction
            }
            if (nextPosition >= 0 && nextPosition < unrolledItems.length) {
                currentPosition = nextPosition
                return unrolledItems[nextPosition]
            }

            return null
        }

        ImageDetails.show(item, {
            next: () => nextPosition(1),
            previous: () => nextPosition(-1)
        })

        return
    }

    if (item.mimeType == 'application/directory') {
        return
    }
    else if (item.mimeType == 'application/reference') {
        return
    }
    else if (item.mimeType == 'application/playlist') {
        return
    }

    UiTool.stopEvent(event)

    if (item.mimeType.startsWith('audio/')) {
        audioJukebox.addAndPlay(item)

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


function showSlideshow() {
    if (!slideshow)
        slideshow = Slideshow.create()
    setContent(slideshow.root)
}

function showInfo(item: Rest.FileDescriptor) {
    InfoPanel.show(item)
}




directoryPanel.root.addEventListener('click', async event => {
    // todo : knownledge to do that is in directoryPanel
    let { element, childIndex } = Templates.templateGetEventLocation(directoryPanel, event)
    if (lastDisplayedFiles && element == directoryPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        itemDefaultAction(childIndex, event)
    }
})

searchPanel.audioMode.addEventListener('click', event => {
    UiTool.stopEvent(event)

    if (currentMode == Mode.Audio) {
        Messages.displayMessage(`Audio mode already activated`, 0)
        return
    }

    Messages.displayMessage(`Audio mode activated`, 0)

    currentMode = Mode.Audio

    readHashAndAct()
})

searchPanel.imageMode.addEventListener('click', event => {
    UiTool.stopEvent(event)

    if (currentMode == Mode.Image) {
        Messages.displayMessage(`Image mode already activated`, 0)
        return
    }

    Messages.displayMessage(`Image mode activated`, 0)

    currentMode = Mode.Image

    readHashAndAct()
})

readHashAndAct()

window.onpopstate = function (event) {
    readHashAndAct()
    /*if (event.state) {
        currentDirectoryDescriptorSha = event.state.currentDirectoryDescriptorSha
        currentClientId = event.state.currentClientId
        currentPictureIndex = event.state.currentPictureIndex || 0
 
        if (!currentClientId)
            el("#menu").classList.remove("is-hidden")
 
        syncUi()
    }
    else {
        fromHash()
 
        syncUi()
    }*/
}

Auth.me().then(user => UiTool.el('user-id').innerText = user.uuid)
import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as FilesPanel from './files-panel'
import * as AudioPanel from './audio-panel'
import * as Rest from './rest'
import * as Auth from './auth'
import * as Templates from './templates'

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
const filesPanel = FilesPanel.filesPanel.create()
const audioPanel = AudioPanel.audioPanel.create()
document.body.appendChild(audioPanel.root)

addContent(searchPanel.root)

const audioJukebox = new AudioPanel.AudioJukebox(audioPanel)

Auth.autoRenewAuth()

/**
 * Events
 */

let lastDisplayedFiles: Rest.FileDescriptor[] = null
let lastSearchTerm: string = null // HACK very temporary

searchPanel.form.addEventListener('submit', async event => {
    UiTool.stopEvent(event)

    let term = searchPanel.term.value

    SearchPanel.searchPanel.displayTitle(searchPanel, false)
    FilesPanel.filesPanel.displaySearching(filesPanel, term)
    if (!filesPanel.root.isConnected)
        addContent(filesPanel.root)

    let res = await Rest.search(term, 'audio/%')

    // HACK seulement parceque c'est de l'audio
    res.files = res.files.map(file => {
        let dot = file.name.lastIndexOf('.')
        if (dot)
            file.name = file.name.substring(0, dot)
        file.name = file.name.replace(/'_'/g, ' ')
            .replace(/'  '/g, ' ')
            .replace(/[ ]*-[ ]*/g, ' - ')
        return file
    })

    lastDisplayedFiles = res.files
    lastSearchTerm = term

    FilesPanel.filesPanel.setValues(filesPanel, {
        term: searchPanel.term.value,
        files: res.files
    })
})

filesPanel.root.addEventListener('click', event => {
    // todo : knownledge to do that is in files-panel
    let { element, childIndex } = Templates.templateGetEventLocation(filesPanel, event)
    if (lastDisplayedFiles && element == filesPanel.files && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        audioJukebox.addAndPlay(lastDisplayedFiles[childIndex])

        // set an unroller
        let term = lastSearchTerm
        let unrollIndex = childIndex + 1
        let files = lastDisplayedFiles
        audioJukebox.setItemUnroller({
            name: () => {
                if (unrollIndex >= 0 && unrollIndex < files.length)
                    return `then '${files[unrollIndex].name.substr(0, 20)}' and other '${term}' search...`
                return `finished '${term} songs`
            },
            unroll: () => files[unrollIndex++],
            hasNext: () => unrollIndex >= 0 && unrollIndex < files.length
        })
    }
})
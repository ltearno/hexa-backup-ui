import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as FilesPanel from './files-panel'
import * as AudioPanel from './audio-panel'
import * as Rest from './rest'
import * as Auth from './auth'

let contents: HTMLElement[] = []
function addContent(content: HTMLElement) {
    contents.push(content)
    UiTool.el('content-wrapper').appendChild(content)
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

searchPanel.form.addEventListener('submit', async event => {
    UiTool.stopEvent(event)

    let term = searchPanel.term.value

    SearchPanel.searchPanel.displayTitle(searchPanel, false)
    FilesPanel.filesPanel.displaySearching(filesPanel, term)
    if (!filesPanel.root.isConnected)
        addContent(filesPanel.root)

    let res = await Rest.search(term, 'audio/%')

    lastDisplayedFiles = res.files

    FilesPanel.filesPanel.setValues(filesPanel, {
        term: searchPanel.term.value,
        files: res.files
    })
})

filesPanel.root.addEventListener('click', event => {
    let { element, childIndex } = FilesPanel.templateGetEventLocation(filesPanel, event)
    if (lastDisplayedFiles && element == filesPanel.files && childIndex >= 0 && childIndex < lastDisplayedFiles.length)
        audioJukebox.addAndPlay(lastDisplayedFiles[childIndex])
})
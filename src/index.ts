import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as FilesPanel from './files-panel'
import * as Rest from './rest'

const audioElement = UiTool.el<HTMLAudioElement>('audio-player')
const searchPanel = SearchPanel.searchPanel.create()
const filesPanel = FilesPanel.filesPanel.create()

searchPanel.form.addEventListener('submit', async event => {
    UiTool.stopEvent(event)

    let term = searchPanel.term.value

    let res = await Rest.search(term, 'audio/%')

    SearchPanel.searchPanel.displayTitle(searchPanel, false)

    FilesPanel.filesPanel.setValues(filesPanel, {
        term: searchPanel.term.value,
        files: res.files
    })

    if (!filesPanel.root.isConnected)
        addContent(filesPanel.root)
})

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

addContent(searchPanel.root)




async function playAudio(sha: string, mimeType: string) {
    audioElement.classList.remove("is-hidden")

    audioElement.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
    audioElement.setAttribute('type', mimeType)
    audioElement.play()
}

audioElement.addEventListener('ended', () => {
    //listenNext()
})

window['playAudio'] = playAudio
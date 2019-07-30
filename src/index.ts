import * as UiTool from './ui-tool'
import * as SearchPanel from './search-panel'
import * as FilesPanel from './files-panel'
import * as AudioPanel from './audio-panel'
import * as Rest from './rest'
import * as Auth from './auth'

const searchPanel = SearchPanel.searchPanel.create()
const filesPanel = FilesPanel.filesPanel.create()
const audioPanel = AudioPanel.audioPanel.create()
document.body.appendChild(audioPanel.root)

searchPanel.form.addEventListener('submit', async event => {
    UiTool.stopEvent(event)

    let term = searchPanel.term.value

    SearchPanel.searchPanel.displayTitle(searchPanel, false)

    let res = await Rest.search(term, 'audio/%')

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


interface JukeboxItem {
    name: string
    sha: string
    mimeType: string
}

class AudioJukebox {
    private queue: JukeboxItem[] = []
    private currentItem: JukeboxItem = null

    constructor(private audioPanel: AudioPanel.AudioPanelElements) {
        this.audioPanel.player.addEventListener('ended', () => {
            let currentIndex = this.currentIndex()
            currentIndex++
            if (currentIndex < this.queue.length - 1)
                this.play(this.queue[currentIndex])
        })
    }

    currentIndex() {
        return this.queue.indexOf(this.currentItem)
    }

    addAndPlay(item: JukeboxItem) {
        let currentIndex = this.currentIndex()

        if (!this.queue.length || this.queue[0].sha != item.sha) {
            this.queue.splice(currentIndex, 0, item)
            this.play(item)
        }

        console.log(JSON.stringify(this.queue))
        console.log(this.currentIndex())
    }

    play(item: JukeboxItem) {
        this.currentItem = item

        this.audioPanel.title.innerText = item.name

        this.audioPanel.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${item.sha}/content?type=${item.mimeType}`)
        this.audioPanel.player.setAttribute('type', item.mimeType)

        this.audioPanel.root.classList.remove("is-hidden")
        this.audioPanel.player.play()
    }
}

const audioJukebox = new AudioJukebox(audioPanel)

async function playAudio(name: string, sha: string, mimeType: string) {
    audioJukebox.addAndPlay({ name, sha, mimeType })
}
window['playAudio'] = playAudio

Auth.autoRenewAuth()
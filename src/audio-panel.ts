import { TemplateElements, createTemplateInstance } from './templates'
import * as Rest from './rest'

export interface AudioPanelElements extends TemplateElements {
    title: HTMLElement
    player: HTMLAudioElement
    playlist: HTMLDivElement
}

const TITLE = 'title'
const PLAYER = 'player'
const PLAYLIST = 'playlist'

const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <div x-id="${PLAYLIST}"></div>
    <h3 x-id="${TITLE}"></h3>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`

export const audioPanel = {
    create: () => createTemplateInstance(templateHtml, [TITLE, PLAYER, PLAYLIST]) as AudioPanelElements,

    play: (elements: AudioPanelElements, name: string, sha: string, mimeType: string) => {
        elements.title.innerText = name

        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
        elements.player.setAttribute('type', mimeType)

        elements.root.classList.remove("is-hidden")
        elements.player.play()
    },

    setPlaylist(elements: AudioPanelElements, html: string) {
        elements.playlist.innerHTML = html
    }
}

export interface JukeboxItem {
    name: string
    sha: string
    mimeType: string
}

export class AudioJukebox {
    private queue: JukeboxItem[] = []
    private currentItem: JukeboxItem = null

    constructor(private audioPanel: AudioPanelElements) {
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

    private play(item: JukeboxItem) {
        this.currentItem = item

        audioPanel.setPlaylist(this.audioPanel, this.queue.map(i => `<div>${i.name} ${i.mimeType} ${i.sha.substr(0, 5)}</div>`).join(''))

        audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType)
    }
}
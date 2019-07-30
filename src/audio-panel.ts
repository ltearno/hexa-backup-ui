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
        elements.title.innerText = name + ' ☰'

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
    private currentIndex: number = -1

    constructor(private audioPanel: AudioPanelElements) {
        this.audioPanel.player.addEventListener('ended', () => {
            this.currentIndex++
            if (this.currentIndex < this.queue.length)
                this.play(this.currentIndex + 1)
            else
                this.stop()
        })

        this.audioPanel.title.addEventListener('click', () => {
            this.audioPanel.playlist.classList.toggle("is-hidden")
        })
    }

    currentItem() {
        if (this.currentIndex < 0 || this.currentIndex >= this.queue.length)
            return null
        return this.queue[this.currentIndex]
    }

    addAndPlay(item: JukeboxItem) {
        let currentItem = this.currentItem()
        if (currentItem && currentItem.sha == item.sha)
            return

        this.queue.push(item)

        this.play(this.queue.length - 1)
    }

    private stop() {
        this.play(-1)
    }

    private play(index: number) {
        this.currentIndex = index
        if (this.currentIndex < 0)
            this.currentIndex = -1

        this.refreshPlaylist()

        if (index >= 0 && index < this.queue.length) {
            const item = this.queue[index]
            audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType)
        }
    }

    private refreshPlaylist() {
        let html = ``
        for (let i = 0; i < this.queue.length - 1; i++) {
            let item = this.queue[i]
            html += `<div>${item.name} ${item.mimeType} ${item.sha.substr(0, 5)}</div>`
        }
        audioPanel.setPlaylist(this.audioPanel, html)
    }
}
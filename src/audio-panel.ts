import { TemplateElements, createTemplateInstance, templateGetEventLocation } from './templates'
import * as Rest from './rest'
import * as UiTools from './ui-tool'

export interface AudioPanelElements extends TemplateElements {
    title: HTMLElement
    player: HTMLAudioElement
    playlist: HTMLDivElement
    expander: HTMLElement
}

const TITLE = 'title'
const PLAYER = 'player'
const PLAYLIST = 'playlist'
const EXPANDER = 'expander'

const templateHtml = `
<div class="audio-footer mui-panel is-hidden">
    <h3 class="x-toggled">Playlist</h3>
    <div x-id="${PLAYLIST}" class="x-toggled is-fullwidth mui--text-center"></div>
    <div><h3 x-id="${TITLE}" style="display: inline;"></h3><span x-id="${EXPANDER}" class="onclick mui--pull-right">&nbsp;&nbsp;☰</span></div>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`

export const audioPanel = {
    create: () => createTemplateInstance(templateHtml) as AudioPanelElements,

    play: (elements: AudioPanelElements, name: string, sha: string, mimeType: string) => {
        elements.title.innerText = name

        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
        elements.player.setAttribute('type', mimeType)

        elements.root.classList.remove("is-hidden")
        elements.player.play()
    },
}

export interface JukeboxItem {
    name: string
    sha: string
    mimeType: string
}

export class AudioJukebox {
    private queue: JukeboxItem[] = []
    private currentIndex: number = -1
    private toggledElements: NodeListOf<HTMLElement>

    constructor(private audioPanel: AudioPanelElements) {
        this.audioPanel.player.addEventListener('ended', () => {
            if (this.currentIndex + 1 < this.queue.length)
                this.play(this.currentIndex + 1)
        })

        this.audioPanel.expander.addEventListener('click', () => {
            this.toggleLargeDisplay()
        })

        this.toggledElements = UiTools.els(this.audioPanel.root, ".x-toggled")
        this.toggledElements.forEach(e => e.classList.add('is-hidden'))

        this.audioPanel.root.addEventListener('click', event => {
            const { element, childIndex } = templateGetEventLocation(this.audioPanel, event)
            if (element == this.audioPanel.playlist && childIndex >= 0 && childIndex < this.queue.length) {
                this.play(childIndex)
            }
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
        else {
            // this.audioPanel.player.stop()
        }
    }

    private refreshPlaylist() {
        let html = ``
        for (let i = 0; i < this.queue.length - 1; i++) {
            let item = this.queue[i]
            html += `<div class="onclick">${item.name}</div>`
        }
        this.audioPanel.playlist.innerHTML = html
    }

    private toggleLargeDisplay() {
        this.toggledElements.forEach(e => e.classList.toggle('is-hidden'))
    }
}
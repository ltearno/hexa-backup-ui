import { TemplateElements, createTemplateInstance, templateGetEventLocation } from './templates'
import * as Rest from './rest'
import * as UiTools from './ui-tool'

const PLAYER = 'player'
const PLAYLIST = 'playlist'
const EXPANDER = 'expander'

const templateHtml = `
<div class="audio-footer mui-panel">
    <div x-id="${PLAYLIST}" class="is-fullwidth mui--text-center"></div>
    <div x-id="${EXPANDER}" class="onclick mui--text-center">☰</div>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
</div>`

export interface AudioPanelElements extends TemplateElements {
    player: HTMLAudioElement
    playlist: HTMLDivElement
    expander: HTMLElement
}

export const audioPanel = {
    create: () => createTemplateInstance(templateHtml) as AudioPanelElements,

    play: (elements: AudioPanelElements, name: string, sha: string, mimeType: string) => {
        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`)
        elements.player.setAttribute('type', mimeType)
        elements.player.play()

        elements.root.classList.remove("is-hidden")
    },
}

export interface JukeboxItem {
    name: string
    sha: string
    mimeType: string
}

export interface JukeboxItemUnroller {
    name(): string
    unroll(): JukeboxItem
    hasNext(): boolean
}

export class AudioJukebox {
    private largeDisplay: boolean = false
    private queue: JukeboxItem[] = []
    private currentIndex: number = -1
    private itemUnroller: JukeboxItemUnroller

    constructor(private audioPanel: AudioPanelElements) {
        try {
            let queue = JSON.parse(localStorage.getItem('playlist-backup'))
            if (queue && queue instanceof Array)
                this.queue = queue
        }
        catch (err) {
            console.error(`error`, err)
        }

        this.audioPanel.player.addEventListener('ended', () => {
            this.playNext()
        })

        this.audioPanel.expander.addEventListener('click', () => {
            this.largeDisplay = !this.largeDisplay
            this.refreshPlaylist()
        })

        this.audioPanel.root.addEventListener('click', event => {
            const { element, childIndex } = templateGetEventLocation(this.audioPanel, event)
            if (element == this.audioPanel.playlist && childIndex >= 0) {
                let queueIndex = element.children.item(childIndex).getAttribute('x-queue-index')
                if (queueIndex.length)
                    this.play(parseInt(queueIndex))
            }
        })

        this.refreshPlaylist()
    }

    currentItem() {
        if (this.currentIndex < 0 || this.currentIndex >= this.queue.length)
            return null
        return this.queue[this.currentIndex]
    }

    addAndPlay(item: JukeboxItem) {
        item = {
            sha: item.sha,
            name: item.name,
            mimeType: item.mimeType
        }

        let currentItem = this.currentItem()
        if (currentItem && currentItem.sha == item.sha)
            return

        this.pushQueueAndPlay(item)
    }

    playNext() {
        if (this.currentIndex + 1 < this.queue.length) {
            this.play(this.currentIndex + 1)
        }
        else if (this.itemUnroller) {
            let item = this.itemUnroller.unroll()
            if (item) {
                if (!this.itemUnroller.hasNext())
                    this.itemUnroller = null
                this.pushQueueAndPlay(item)
            }
            else {
                this.itemUnroller = null
                this.refreshPlaylist()
            }
        }
    }

    setItemUnroller(itemUnroller: JukeboxItemUnroller) {
        this.itemUnroller = itemUnroller
        this.refreshPlaylist()
    }

    private pushQueueAndPlay(item: JukeboxItem) {
        this.queue.push(item)
        localStorage.setItem('playlist-backup', JSON.stringify(this.queue))
        this.play(this.queue.length - 1)
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

    private refreshTimer
    private refreshPlaylist() {
        if (this.refreshTimer)
            clearTimeout(this.refreshTimer)
        this.refreshTimer = setTimeout(() => this.realRefreshPlaylist(), 10)
    }

    private realRefreshPlaylist() {
        if (!this.queue || !this.queue.length) {
            this.audioPanel.playlist.innerHTML = ''
            return
        }

        if (this.largeDisplay) {
            let html = `<h3>Playlist</h3>`
            for (let i = 0; i < this.queue.length; i++) {
                let item = this.queue[i]
                html += this.playlistItemHtml(i, item.name)
            }
            this.audioPanel.playlist.innerHTML = html
        }
        else {
            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length)
                this.audioPanel.playlist.innerHTML = this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name)
            else
                this.audioPanel.playlist.innerHTML = ""
        }

        if (this.itemUnroller)
            this.audioPanel.playlist.innerHTML += `<span class="mui--text-dark-secondary">followed by ${this.itemUnroller.name()}</span>`
    }

    private playlistItemHtml(index: number, name: string) {
        return `<div x-queue-index="${index}" class="onclick ${index == this.currentIndex ? 'mui--text-headline' : ''}">${name}</div>`
    }
}

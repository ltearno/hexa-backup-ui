import { TemplateElements, createTemplateInstance, templateGetEventLocation } from './templates'
import * as Rest from './rest'
import * as UiTools from './ui-tool'

const PLAYER = 'player'
const PLAYLIST = 'playlist'
const EXPANDER = 'expander'

const templateHtml = `
<div class="audio-footer mui-panel">
    <h3 class="x-when-large-display">Playlist</h3>
    <div x-id="${PLAYLIST}"></div>
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
    private expandedElements: NodeListOf<HTMLElement>

    // if scroll to playing item is required after a playlist redraw
    private scrollToPlayingItem = true

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
            this.scrollToPlayingItem = true
            this.refreshPlaylist()
        })

        this.audioPanel.root.addEventListener('click', event => {
            for (let e of UiTools.iter_path_to_root_element(event.target as HTMLElement)) {
                const indexAttr = e.getAttribute('x-queue-index')
                if (typeof indexAttr === 'string') {
                    let index = parseInt(indexAttr)
                    if (index !== NaN) {
                        if (index >= 0 && index < this.queue.length)
                            this.play(index)
                        else
                            this.playNextUnrolled()
                    }
                }
            }

            const { element, childIndex } = templateGetEventLocation(this.audioPanel, event)
            if (element == this.audioPanel.playlist && childIndex >= 0) {
                if (event.target == this.audioPanel.playlist.querySelector(`[x-id='clear-playlist']`)) {
                    let currentItem = this.currentItem()
                    if (currentItem) {
                        this.queue = [currentItem]
                        this.currentIndex = 0
                    }
                    else {
                        this.queue = []
                    }

                    localStorage.removeItem('playlist-backup')
                    this.refreshPlaylist()
                }
            }
        })

        this.expandedElements = UiTools.els(this.audioPanel.root, '.x-when-large-display')

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
        else {
            this.playNextUnrolled()
        }
    }

    playNextUnrolled() {
        if (this.itemUnroller) {
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
        this.scrollToPlayingItem = true
        this.queue.push(item)
        localStorage.setItem('playlist-backup', JSON.stringify(this.queue))
        this.play(this.queue.length - 1)
    }

    private play(index: number) {
        if (index < 0)
            index = -1

        this.currentIndex = index

        this.refreshPlaylist()

        if (index >= 0 && index < this.queue.length) {
            const item = this.queue[index]
            audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType)

            document.querySelectorAll(`[x-for-sha='${item.sha.substr(0, 5)}']`).forEach(e => e.classList.add('is-weighted'))
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
            if (this.largeDisplay)
                this.audioPanel.playlist.innerHTML = '<span class="mui--text-dark-secondary">There are no items in your playlist. Click on songs to play them.</span>'
            else
                this.audioPanel.playlist.innerHTML = ''
            return
        }

        let html = ``

        if (this.largeDisplay) {
            this.expandedElements.forEach(e => e.classList.remove('is-hidden'))

            for (let i = 0; i < this.queue.length; i++) {
                let item = this.queue[i]
                html += this.playlistItemHtml(i, item.name, false)
            }

            if (this.itemUnroller && this.itemUnroller.hasNext())
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`

            html += `<div class="mui--text-dark-secondary"><a x-id='clear-playlist' href='#'>clear playlist</a></div>`
        }
        else {
            this.expandedElements.forEach(e => e.classList.add('is-hidden'))

            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length)
                this.audioPanel.playlist.innerHTML = this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, true)
            else
                this.audioPanel.playlist.innerHTML = ""

            if (this.currentIndex < this.queue.length - 1) {
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.currentIndex + 1}" class="onclick mui--text-dark-secondary is-onelinetext">${this.queue[this.currentIndex + 1]}</div>`
            }
            else if (this.itemUnroller && this.itemUnroller.hasNext()) {
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`
            }
        }

        this.audioPanel.playlist.innerHTML = html

        // after refresh steps
        if (this.largeDisplay && this.scrollToPlayingItem) {
            this.scrollToPlayingItem = false

            this.audioPanel.playlist.scrollTop = this.audioPanel.playlist.scrollHeight
        }
    }

    private playlistItemHtml(index: number, name: string, oneLineText: boolean) {
        return `<div x-queue-index="${index}" class="onclick ${oneLineText ? 'is-onelinetext' : ''} ${index == this.currentIndex ? 'mui--text-headline' : ''}">${name}</div>`
    }
}

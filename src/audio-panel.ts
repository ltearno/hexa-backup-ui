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
            const { element, childIndex } = templateGetEventLocation(this.audioPanel, event)

            if (element == this.audioPanel.playlist && childIndex >= 0) {
                let queueIndex = element.children.item(childIndex).getAttribute('x-queue-index')
                if (queueIndex && queueIndex.length) {
                    let val = parseInt(queueIndex)
                    if (val < this.queue.length)
                        this.play(val)
                    else
                        this.playNext() // will fetch from unroller if present
                    return
                }

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

        if (index == this.queue.length - 1) {
            this.audioPanel.playlist.scrollTop += 100000
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

        if (this.largeDisplay) {
            let html = `<h3>Playlist</h3>`
            for (let i = 0; i < this.queue.length; i++) {
                let item = this.queue[i]
                html += this.playlistItemHtml(i, item.name, false)
            }
            this.audioPanel.playlist.innerHTML = html
        }
        else {
            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length)
                this.audioPanel.playlist.innerHTML = this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, true)
            else
                this.audioPanel.playlist.innerHTML = ""
        }

        if (this.itemUnroller && this.itemUnroller.hasNext())
            this.audioPanel.playlist.innerHTML += `<div x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`

        if (this.largeDisplay)
            this.audioPanel.playlist.innerHTML += `<div class="mui--text-dark-secondary"><a x-id='clear-playlist' href='#'>clear playlist</a></div>`

        // after refresh steps
        if (this.largeDisplay && this.scrollToPlayingItem) {
            this.scrollToPlayingItem = false

            if (this.currentIndex >= 0) {
                let e = this.audioPanel.playlist.querySelector(`[x-queue-index='${this.currentIndex}']`)
                if (e) {
                    //e.scrollIntoView()
                    this.audioPanel.playlist.scrollTop = this.audioPanel.playlist.scrollHeight //e.clientHeight * 2
                }
            }
        }
    }

    private playlistItemHtml(index: number, name: string, oneLineText: boolean) {
        return `<div x-queue-index="${index}" class="onclick ${oneLineText ? 'is-onelinetext' : ''} ${index == this.currentIndex ? 'mui--text-headline' : ''}">${name}</div>`
    }
}

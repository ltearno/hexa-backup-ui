import { TemplateElements, createTemplateInstance, templateGetEventLocation } from './templates'
import * as Rest from './rest'
import * as UiTools from './ui-tool'
import * as MimeTypes from './mime-types-module'
import * as Messages from './messages'

const templateHtml = `
<div class="audio-footer mui-panel">
    <h3 class="x-when-large-display">Playlist</h3>
    <div x-id="playlist"></div>
    <div x-id="expander" class="onclick mui--text-center">☰</div>
    <div class="x-horizontal-flex" style="width:100%;">
        <audio x-id="player" class="audio-player" controls preload="metadata"></audio>
        <a x-id="addPlaylistButton" href="#toto" class="mui-btn mui-btn--fab" style="background-color: #ff408173; color: white;">+ PL.</a></div>
    </div>
</div>`

export interface AudioPanelElements extends TemplateElements {
    player: HTMLAudioElement
    playlist: HTMLDivElement
    expander: HTMLElement
    addPlaylistButton: HTMLElement
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
            console.error(`error loading queue from local storage`, err)
        }

        this.expandedElements = UiTools.els(this.audioPanel.root, '.x-when-large-display')

        this.audioPanel.player.addEventListener('ended', () => {
            this.playNext()
        })

        this.audioPanel.player.addEventListener('error', () => {
            console.log(`audio player error`)
            this.playNext()
        })

        this.audioPanel.player.addEventListener('stalled', () => {
            console.log('stalled, try next')
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
        this.audioPanel.addPlaylistButton.addEventListener('click', async event => {
            UiTools.stopEvent(event)

            const playlist = 'favorites' // todo should be a parameter...

            let item = this.currentItem()
            if (!item) {
                Messages.displayMessage(`Cannot add to playlist, nothing playing`, -1)
                return
            }

            let extension = MimeTypes.extensionFromMimeType(item.mimeType)

            await Rest.putItemToPlaylist(playlist, item.sha, item.mimeType, `${item.name}.${extension}`)
            Messages.displayMessage(`👍 ${item.name} added to playlist '${playlist}'`, 1)
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
        if (!item.mimeType.startsWith('audio/'))
            return

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

            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
                html += this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, true)

                if (this.currentIndex < this.queue.length - 1) {
                    html += `<div style="flex-shrink: 0;" x-queue-index="${this.currentIndex + 1}" class="onclick mui--text-dark-secondary is-onelinetext">followed by '${this.queue[this.currentIndex + 1].name.substr(0, 20)}' ...</div>`
                }
                else if (this.itemUnroller && this.itemUnroller.hasNext()) {
                    html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`
                }
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

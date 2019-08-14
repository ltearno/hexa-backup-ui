"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = require("./templates");
const Rest = require("./rest");
const UiTools = require("./ui-tool");
const MimeTypes = require("./mime-types-module");
const Messages = require("./messages");
const Locations = require("./locations");
const PlayCache = require("./play-cache");
const templateHtml = `
<div class="audio-footer mui-panel">
    <h3 class="x-when-large-display">Playlist</h3>
    <div x-id="playlist"></div>
    <div x-id="expander" class="onclick mui--text-center">☰</div>
    <div class="x-horizontal-flex" style="width:100%;">
        <a x-id="infoButton" href="#" class="mui-btn mui-btn--fab">Info</a>
        <a x-id="nextButton" href="#" class="mui-btn mui-btn--fab">Next</a>
        <audio x-id="player" class="audio-player" controls preload="metadata"></audio>
        <a x-id="addPlaylistButton" href="#toto" class="mui-btn mui-btn--fab" style="background-color: #ff408173; color: white;">+ PL.</a></div>
    </div>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    play: (elements, name, sha, mimeType) => {
        elements.player.setAttribute('src', Rest.getShaContentUrl(sha, mimeType, name, false, false));
        elements.player.setAttribute('type', mimeType);
        elements.player.play();
        elements.root.classList.remove("is-hidden");
    },
};
class AudioJukebox {
    constructor(audioPanel) {
        this.audioPanel = audioPanel;
        this.playImmediately = false;
        this.insertAfterPlaying = false;
        this.skipAlreadyPlayed = false;
        this.largeDisplay = false;
        this.queue = [];
        this.currentIndex = -1;
        this.lastAddedPlaylist = localStorage.getItem('last-added-playlist') || null;
        // if scroll to playing item is required after a playlist redraw
        this.scrollToPlayingItem = true;
        this.playImmediately = localStorage.getItem(`play-immediately`) == 'true';
        this.insertAfterPlaying = localStorage.getItem('insert-after-playing') == 'true';
        this.skipAlreadyPlayed = localStorage.getItem('skip-already-played') == 'true';
        try {
            let queue = JSON.parse(localStorage.getItem('playlist-backup'));
            if (queue && queue instanceof Array)
                this.queue = queue;
        }
        catch (err) {
            console.error(`error loading queue from local storage`, err);
        }
        this.expandedElements = UiTools.els(this.audioPanel.root, '.x-when-large-display');
        this.audioPanel.player.addEventListener('ended', () => {
            this.playNext();
        });
        this.audioPanel.player.addEventListener('error', () => {
            Messages.displayMessage(`Audio player encounter an error, playing next song`, -1);
            this.playNext();
        });
        this.audioPanel.player.addEventListener('stalled', () => {
            Messages.displayMessage(`Audio player is stalled (low network?)`, -1);
        });
        this.audioPanel.expander.addEventListener('click', () => {
            this.largeDisplay = !this.largeDisplay;
            this.scrollToPlayingItem = true;
            this.refreshPlaylist();
        });
        this.audioPanel.root.addEventListener('click', event => {
            for (let e of UiTools.iter_path_to_root_element(event.target)) {
                const indexAttr = e.getAttribute('x-queue-index');
                if (typeof indexAttr === 'string') {
                    let index = parseInt(indexAttr);
                    if (index !== NaN) {
                        if (index >= 0 && index < this.queue.length)
                            this.play(index);
                        else
                            this.playNextUnrolled();
                    }
                }
            }
            const { element, childIndex } = templates_1.templateGetEventLocation(this.audioPanel, event);
            if (element == this.audioPanel.playlist && childIndex >= 0) {
                if (event.target == this.audioPanel.playlist.querySelector(`[x-id='clear-playlist']`)) {
                    let currentItem = this.currentItem();
                    if (currentItem) {
                        this.queue = [currentItem];
                        this.currentIndex = 0;
                    }
                    else {
                        this.queue = [];
                    }
                    localStorage.removeItem('playlist-backup');
                    this.refreshPlaylist();
                }
                else if (event.target == this.audioPanel.playlist.querySelector(`[x-id='play-immediately']`)) {
                    let checkbox = this.audioPanel.playlist.querySelector(`[x-id='play-immediately']`);
                    this.playImmediately = !!checkbox.checked;
                    localStorage.setItem(`play-immediately`, this.playImmediately ? 'true' : 'false');
                }
                else if (event.target == this.audioPanel.playlist.querySelector(`[x-id='insert-after-playing']`)) {
                    let checkbox = this.audioPanel.playlist.querySelector(`[x-id='insert-after-playing']`);
                    this.insertAfterPlaying = !!checkbox.checked;
                    localStorage.setItem(`insert-after-playing`, this.insertAfterPlaying ? 'true' : 'false');
                }
                else if (event.target == this.audioPanel.playlist.querySelector(`[x-id='skip-already-played']`)) {
                    let checkbox = this.audioPanel.playlist.querySelector(`[x-id='skip-already-played']`);
                    this.skipAlreadyPlayed = !!checkbox.checked;
                    localStorage.setItem(`skip-already-played`, this.skipAlreadyPlayed ? 'true' : 'false');
                }
            }
        });
        this.audioPanel.addPlaylistButton.addEventListener('click', async (event) => {
            UiTools.stopEvent(event);
            let item = this.currentItem();
            if (!item) {
                Messages.displayMessage(`Cannot add to playlist, nothing playing`, -1);
                return;
            }
            const options = {
                'keyboard': true,
                'static': false,
                'onclose': function () { }
            };
            let playlists = await Rest.getPlaylists();
            const overlay = templates_1.createTemplateInstance(`
                <div class="mui-container" style="text-align: center;">
                    <div class='mui-panel'>
                        <h2>Choose a playlist to add '${item.name}'</h2>
                        <div x-id='existingPlaylists' style="display:flex; flex-flow: column nowrap;">
                        ${playlists
                .map(p => p.substr(0, 1).toUpperCase() + p.substr(1).toLowerCase())
                .map(p => `<div x-playlist="${p}" class="mui-btn ${p == this.lastAddedPlaylist ? 'mui-btn--primary' : 'mui-btn--flat'}">${p}</div>`)
                .join('')}
                        </div>
                        <form x-id="form" class="mui-form--inline">
                            <div class="mui-textfield">
                                <input x-id="playlistInput" type="text" style="text-align: center;" placeholder="New playlist">
                            </div>
                            <button role="submit" class="mui-btn mui-btn--flat">Create</button>
                        </form>
                        <button x-id='cancel' class="mui-btn mui-btn--flat mui-btn--accent">Cancel</button>
                    </div>
                </div>`);
            mui.overlay('on', options, overlay.root);
            const addToPlaylist = async (playlist) => {
                this.lastAddedPlaylist = playlist;
                localStorage.setItem('last-added-playlist', this.lastAddedPlaylist);
                mui.overlay('off');
                let extension = MimeTypes.extensionFromMimeType(item.mimeType);
                await Rest.putItemToPlaylist(playlist, item.sha, item.mimeType, `${item.name}.${extension}`);
                Messages.displayMessage(`👍 ${item.name} added to playlist '${playlist}'`, 1);
            };
            overlay.existingPlaylists.addEventListener('click', async (event) => {
                UiTools.stopEvent(event);
                const target = event.target;
                if (target.hasAttribute('x-playlist')) {
                    const playlist = target.getAttribute('x-playlist');
                    await addToPlaylist(playlist);
                }
            });
            overlay.form.addEventListener('submit', async (event) => {
                UiTools.stopEvent(event);
                const playlist = overlay.playlistInput.value;
                if (!playlist || playlist.trim() == '')
                    return;
                await addToPlaylist(playlist);
            });
            overlay.cancel.addEventListener('click', event => {
                UiTools.stopEvent(event);
                mui.overlay('off');
            });
        });
        this.audioPanel.infoButton.addEventListener('click', async (event) => {
            UiTools.stopEvent(event);
            let item = this.currentItem();
            if (!item) {
                Messages.displayMessage(`Nothing playing`, -1);
                return;
            }
            Locations.goShaInfo({
                sha: item.sha,
                name: item.name,
                mimeType: item.mimeType,
                lastWrite: 0,
                size: 0
            });
        });
        this.audioPanel.nextButton.addEventListener('click', async (event) => {
            UiTools.stopEvent(event);
            this.playNext();
        });
        this.refreshPlaylist();
    }
    currentItem() {
        if (this.currentIndex < 0 || this.currentIndex >= this.queue.length)
            return null;
        return this.queue[this.currentIndex];
    }
    addAndPlay(item) {
        item = {
            sha: item.sha,
            name: item.name,
            mimeType: item.mimeType
        };
        let currentItem = this.currentItem();
        if (currentItem && currentItem.sha == item.sha)
            return;
        this.pushQueueAndPlay(item);
    }
    playNext() {
        for (let nextIndex = this.currentIndex + 1; nextIndex < this.queue.length; nextIndex++) {
            if (this.skipAlreadyPlayed && PlayCache.hasBeenPlayed(this.queue[nextIndex].sha)) {
                Messages.displayMessage(`skip ${this.queue[nextIndex].name} because it has already been played`, 0);
                continue;
            }
            this.play(nextIndex);
            return;
        }
        this.playNextUnrolled();
    }
    playNextUnrolled() {
        while (true) {
            if (this.itemUnroller) {
                let item = this.itemUnroller.unroll();
                if (item) {
                    if (!this.itemUnroller.hasNext())
                        this.itemUnroller = null;
                    if (this.skipAlreadyPlayed && PlayCache.hasBeenPlayed(item.sha)) {
                        Messages.displayMessage(`skip ${item.name} because it has already been played`, 0);
                        continue;
                    }
                    this.pushQueueAndPlay(item);
                    return;
                }
                else {
                    this.itemUnroller = null;
                    this.refreshPlaylist();
                    return;
                }
            }
            else {
                return;
            }
        }
    }
    setItemUnroller(itemUnroller) {
        this.itemUnroller = itemUnroller;
        this.refreshPlaylist();
    }
    pushQueueAndPlay(item) {
        if (!item.mimeType.startsWith('audio/'))
            return;
        let insertedAt = -1;
        if (this.insertAfterPlaying && this.currentIndex >= 0 && this.currentIndex < this.queue.length - 1) {
            insertedAt = this.currentIndex + 1;
            this.queue.splice(insertedAt, 0, item);
        }
        else {
            insertedAt = this.queue.length;
            this.queue.push(item);
        }
        localStorage.setItem('playlist-backup', JSON.stringify(this.queue));
        if (this.playImmediately || !this.isPlaying())
            this.play(insertedAt);
        else
            Messages.displayMessage(`${item.name} added to playlist`, 0);
    }
    play(index) {
        if (index < 0)
            index = -1;
        this.currentIndex = index;
        this.refreshPlaylist();
        if (index >= 0 && index < this.queue.length) {
            const item = this.queue[index];
            exports.audioPanel.play(this.audioPanel, item.name, item.sha, item.mimeType);
            document.querySelectorAll(`[x-for-sha='${item.sha.substr(0, 5)}']`).forEach(e => e.classList.add('is-weighted'));
            document.title = `${item.name} playing by Raccoon`;
            PlayCache.setPlayed(item.sha);
        }
        else {
            document.title = `Raccoon`;
        }
    }
    refreshPlaylist() {
        if (this.refreshTimer)
            clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(() => this.realRefreshPlaylist(), 10);
    }
    realRefreshPlaylist() {
        if (!this.queue || !this.queue.length) {
            if (this.largeDisplay)
                this.audioPanel.playlist.innerHTML = '<span class="mui--text-dark-secondary">There are no items in your playlist. Click on songs to play them.</span>';
            else
                this.audioPanel.playlist.innerHTML = '';
            return;
        }
        let html = ``;
        if (this.largeDisplay) {
            this.expandedElements.forEach(e => e.classList.remove('is-hidden'));
            for (let i = 0; i < this.queue.length; i++) {
                let item = this.queue[i];
                html += this.playlistItemHtml(i, item.name, item.sha, false);
            }
            if (this.itemUnroller && this.itemUnroller.hasNext())
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`;
            html += `<div class="mui--text-dark-secondary"><a x-id='clear-playlist' href='#'>clear playlist</a></div>`;
            html += `<div class="mui--text-dark-secondary">
                    <div><label><input x-id='play-immediately' class="mui-checkbox--inline" ${this.playImmediately ? 'checked' : ''} type="checkbox"/> Play immediately</label></div>
                    <div><label><input x-id='insert-after-playing' class="mui-checkbox--inline" ${this.insertAfterPlaying ? 'checked' : ''} type="checkbox"/> Insert after playing item</label></div>
                    <div><label><input x-id='skip-already-played' class="mui-checkbox--inline" ${this.skipAlreadyPlayed ? 'checked' : ''} type="checkbox"/> Skip played items</label></div>
                </div>`;
        }
        else {
            this.expandedElements.forEach(e => e.classList.add('is-hidden'));
            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
                html += this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, null, true);
                if (this.currentIndex < this.queue.length - 1) {
                    html += `<div style="flex-shrink: 0;" x-queue-index="${this.currentIndex + 1}" class="onclick mui--text-dark-secondary is-onelinetext">followed by '${this.queue[this.currentIndex + 1].name.substr(0, 20)}' ...</div>`;
                }
                else if (this.itemUnroller && this.itemUnroller.hasNext()) {
                    html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`;
                }
            }
        }
        this.audioPanel.playlist.innerHTML = html;
        // after refresh steps
        if (this.largeDisplay && this.scrollToPlayingItem) {
            this.scrollToPlayingItem = false;
            this.audioPanel.playlist.scrollTop = this.audioPanel.playlist.scrollHeight;
        }
    }
    playlistItemHtml(index, name, sha, oneLineText) {
        return `<div x-queue-index="${index}" class="onclick ${oneLineText ? 'is-onelinetext' : ''} ${index == this.currentIndex ? 'mui--text-headline' : ''}">${name}${sha && PlayCache.hasBeenPlayed(sha) ? ' ✔️' : ''}</div>`;
    }
    isPlaying() {
        return this.audioPanel.player.currentSrc
            && this.audioPanel.player.currentTime > 0
            && !this.audioPanel.player.paused
            && !this.audioPanel.player.ended
            && this.audioPanel.player.readyState > 2;
    }
}
exports.AudioJukebox = AudioJukebox;
//# sourceMappingURL=audio-panel.js.map
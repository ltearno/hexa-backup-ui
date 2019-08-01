/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./public/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/audio-panel.js":
/*!*******************************!*\
  !*** ./public/audio-panel.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const UiTools = __webpack_require__(/*! ./ui-tool */ "./public/ui-tool.js");
const MimeTypes = __webpack_require__(/*! ./mime-types-module */ "./public/mime-types-module.js");
const Messages = __webpack_require__(/*! ./messages */ "./public/messages.js");
const templateHtml = `
<div class="audio-footer mui-panel">
    <h3 class="x-when-large-display">Playlist</h3>
    <div x-id="playlist"></div>
    <div x-id="expander" class="onclick mui--text-center">☰</div>
    <div class="x-horizontal-flex" style="width:100%;">
        <audio x-id="player" class="audio-player" controls preload="metadata"></audio>
        <a x-id="addPlaylistButton" href="#toto" class="mui-btn mui-btn--fab" style="background-color: #ff408173; color: white;">+ PL.</a></div>
    </div>
</div>`;
exports.audioPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    play: (elements, name, sha, mimeType) => {
        elements.player.setAttribute('src', `${Rest.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${mimeType}`);
        elements.player.setAttribute('type', mimeType);
        elements.player.play();
        elements.root.classList.remove("is-hidden");
    },
};
class AudioJukebox {
    constructor(audioPanel) {
        this.audioPanel = audioPanel;
        this.largeDisplay = false;
        this.queue = [];
        this.currentIndex = -1;
        // if scroll to playing item is required after a playlist redraw
        this.scrollToPlayingItem = true;
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
            console.log(`audio player error`);
            this.playNext();
        });
        this.audioPanel.player.addEventListener('stalled', () => {
            console.log('stalled, try next');
            this.playNext();
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
            }
        });
        this.audioPanel.addPlaylistButton.addEventListener('click', async (event) => {
            UiTools.stopEvent(event);
            const playlist = 'favorites'; // todo should be a parameter...
            let item = this.currentItem();
            if (!item) {
                Messages.displayMessage(`Cannot add to playlist, nothing playing`, -1);
                return;
            }
            let extension = MimeTypes.extensionFromMimeType(item.mimeType);
            await Rest.putItemToPlaylist(playlist, item.sha, item.mimeType, `${item.name}.${extension}`);
            Messages.displayMessage(`👍 ${item.name} added to playlist '${playlist}'`, 1);
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
        if (this.currentIndex + 1 < this.queue.length) {
            this.play(this.currentIndex + 1);
        }
        else {
            this.playNextUnrolled();
        }
    }
    playNextUnrolled() {
        if (this.itemUnroller) {
            let item = this.itemUnroller.unroll();
            if (item) {
                if (!this.itemUnroller.hasNext())
                    this.itemUnroller = null;
                this.pushQueueAndPlay(item);
            }
            else {
                this.itemUnroller = null;
                this.refreshPlaylist();
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
        this.scrollToPlayingItem = true;
        this.queue.push(item);
        localStorage.setItem('playlist-backup', JSON.stringify(this.queue));
        this.play(this.queue.length - 1);
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
                html += this.playlistItemHtml(i, item.name, false);
            }
            if (this.itemUnroller && this.itemUnroller.hasNext())
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`;
            html += `<div class="mui--text-dark-secondary"><a x-id='clear-playlist' href='#'>clear playlist</a></div>`;
        }
        else {
            this.expandedElements.forEach(e => e.classList.add('is-hidden'));
            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length) {
                html += this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, true);
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
    playlistItemHtml(index, name, oneLineText) {
        return `<div x-queue-index="${index}" class="onclick ${oneLineText ? 'is-onelinetext' : ''} ${index == this.currentIndex ? 'mui--text-headline' : ''}">${name}</div>`;
    }
}
exports.AudioJukebox = AudioJukebox;
//# sourceMappingURL=audio-panel.js.map

/***/ }),

/***/ "./public/auth.js":
/*!************************!*\
  !*** ./public/auth.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const Network = __webpack_require__(/*! ./network */ "./public/network.js");
function wait(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
let authenticatedUser = null;
class Auth {
    onError() {
        window.location.reload();
    }
    async loop() {
        while (true) {
            try {
                let response = await Network.postData(`https://home.lteconsulting.fr/auth`);
                if (response && response.token) {
                    let res = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/setCookie`, { 'Authorization': `Bearer ${response.token}` });
                    if (!res || !res.lifetime) {
                        console.error(`cannot setCookie`, res);
                        this.onError();
                    }
                    authenticatedUser = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/me`);
                }
                else {
                    console.error(`cannot obtain auth token`);
                    this.onError();
                }
            }
            catch (err) {
                console.error(`cannot refresh auth (${err})`);
                this.onError();
            }
            // every 30 minutes
            await wait(1000 * 60 * 30);
        }
    }
}
function autoRenewAuth() {
    let auth = new Auth();
    auth.loop();
}
exports.autoRenewAuth = autoRenewAuth;
function me() {
    return authenticatedUser;
}
exports.me = me;
//# sourceMappingURL=auth.js.map

/***/ }),

/***/ "./public/directory-panel.js":
/*!***********************************!*\
  !*** ./public/directory-panel.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Snippets = __webpack_require__(/*! ./html-snippets */ "./public/html-snippets.js");
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items" class="mui-panel" style="display: inline-block;"></div>
    </div>
</div>`;
exports.directoryPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    setLoading: (elements, title) => {
        elements.title.innerHTML = `Loading '${title}' ...`;
        elements.items.innerHTML = ``;
    },
    setValues: (elements, values) => {
        elements.title.innerHTML = `${values.name}`;
        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('');
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
        }
    },
};
//# sourceMappingURL=directory-panel.js.map

/***/ }),

/***/ "./public/html-snippets.js":
/*!*********************************!*\
  !*** ./public/html-snippets.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
function itemToHtml(f) {
    if (f.mimeType == 'application/directory')
        return `<div class="onclick"><i>${f.name} ...</i></div>`;
    else if (f.mimeType == 'application/reference')
        return `<div class="onclick"><i>${f.name} ...</i></div>`;
    else if (f.mimeType == 'application/playlist')
        return `<div class="onclick"><i>${f.name} ...</i></div>`;
    else if (f.mimeType.startsWith('audio/'))
        return `<div x-for-sha="${f.sha && f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`;
    else
        return `<div x-for-sha="${f.sha && f.sha.substr(0, 5)}" class="onclick"><a href="${Rest.getShaContentUrl(f.sha, f.mimeType, f.name, false)}" target="_blank">${f.name}</a> <a class="mui--text-dark-secondary" href="${Rest.getShaContentUrl(f.sha, f.mimeType, f.name, true)}">dl</a></div>`;
}
exports.itemToHtml = itemToHtml;
//# sourceMappingURL=html-snippets.js.map

/***/ }),

/***/ "./public/index.js":
/*!*************************!*\
  !*** ./public/index.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = __webpack_require__(/*! ./ui-tool */ "./public/ui-tool.js");
const SearchPanel = __webpack_require__(/*! ./search-panel */ "./public/search-panel.js");
const SearchResultPanel = __webpack_require__(/*! ./search-result-panel */ "./public/search-result-panel.js");
const AudioPanel = __webpack_require__(/*! ./audio-panel */ "./public/audio-panel.js");
const DirectoryPanel = __webpack_require__(/*! ./directory-panel */ "./public/directory-panel.js");
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const Auth = __webpack_require__(/*! ./auth */ "./public/auth.js");
const Templates = __webpack_require__(/*! ./templates */ "./public/templates.js");
const MimeTypes = __webpack_require__(/*! ./mime-types-module */ "./public/mime-types-module.js");
/*
hash urls :

- ''                                home
- '#/'                              home
- '#'                               home
- '#/search/:term                   search
- '#/directories/:sha?name=xxx      directory
- '#/browse'
- '#/refs/:name'
*/
function parseURL(url) {
    var parser = document.createElement('a'), searchObject = {}, queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = decodeURIComponent(split[1]);
    }
    return {
        pathname: decodeURIComponent(parser.pathname),
        searchObject: searchObject
    };
}
function readHashAndAct() {
    let hash = '';
    if (window.location.hash && window.location.hash.startsWith('#'))
        hash = window.location.hash.substr(1);
    let parsed = parseURL(hash);
    if (parsed.pathname.startsWith('/search/')) {
        searchItems(parsed.pathname.substr('/search/'.length));
    }
    else if (parsed.pathname.startsWith('/directories/')) {
        const sha = parsed.pathname.substring('/directories/'.length);
        const name = parsed.searchObject.name || sha;
        loadDirectory({
            lastWrite: 0,
            mimeType: 'application/directory',
            size: 0,
            sha,
            name
        });
    }
    else if (parsed.pathname == '/browse') {
        loadReferences();
    }
    else if (parsed.pathname.startsWith('/refs/')) {
        const name = parsed.pathname.substring('/refs/'.length);
        loadReference(name);
    }
    else if (parsed.pathname == '/playlists') {
        loadPlaylists();
    }
    else if (parsed.pathname.startsWith('/playlists/')) {
        const name = parsed.pathname.substring('/playlists/'.length);
        loadPlaylist(name);
    }
    else {
        console.log(`unkown path ${parsed.pathname}`);
    }
}
const searchPanel = SearchPanel.searchPanel.create();
const searchResultPanel = SearchResultPanel.searchResultPanel.create();
const audioPanel = AudioPanel.audioPanel.create();
const audioJukebox = new AudioPanel.AudioJukebox(audioPanel);
const directoryPanel = DirectoryPanel.directoryPanel.create();
let actualContent = null;
function setContent(content) {
    if (content === actualContent)
        return;
    if (actualContent)
        actualContent.parentElement && actualContent.parentElement.removeChild(actualContent);
    actualContent = content;
    if (actualContent)
        UiTool.el('content-wrapper').insertBefore(content, UiTool.el('first-element-after-contents'));
}
document.body.appendChild(audioPanel.root);
UiTool.el('content-wrapper').insertBefore(searchPanel.root, UiTool.el('first-element-after-contents'));
Auth.autoRenewAuth();
/**
 * Waiter tool
 */
const beginWait = (callback) => {
    let isDone = false;
    setTimeout(() => isDone || callback(), 500);
    return {
        done: () => {
            isDone = true;
        }
    };
};
/**
 * Events
 */
let lastDisplayedFiles = null;
let lastSearchTerm = null; // HACK very temporary
function beautifyNames(items) {
    return items.map(file => {
        if (file.mimeType.startsWith('audio/')) {
            let dot = file.name.lastIndexOf('.');
            if (dot)
                file.name = file.name.substring(0, dot);
            file.name = file.name.replace(/'_'/g, ' ')
                .replace(/'  '/g, ' ')
                .replace(/[ ]*-[ ]*/g, ' - ');
        }
        return file;
    });
}
function goSearchItems(term) {
    const url = `#/search/${term}`;
    window.location.href = url;
}
async function searchItems(term) {
    SearchPanel.searchPanel.displayTitle(searchPanel, false);
    const waiting = beginWait(() => {
        setContent(searchResultPanel.root);
        SearchResultPanel.searchResultPanel.displaySearching(searchResultPanel, term);
    });
    let res = await Rest.search(term, 'audio/%');
    // first files then directories
    res.items = res.items.filter(i => !i.mimeType.startsWith('application/directory')).concat(res.items.filter(i => i.mimeType.startsWith('application/directory')));
    res.items = beautifyNames(res.items);
    lastDisplayedFiles = res.items;
    lastSearchTerm = term;
    waiting.done();
    setContent(searchResultPanel.root);
    SearchResultPanel.searchResultPanel.setValues(searchResultPanel, {
        term: term,
        items: res.items
    });
}
searchPanel.form.addEventListener('submit', event => {
    UiTool.stopEvent(event);
    let term = searchPanel.term.value;
    searchPanel.term.blur();
    goSearchItems(term);
});
function getMimeType(f) {
    if (f.isDirectory)
        return 'application/directory';
    let pos = f.name.lastIndexOf('.');
    if (pos >= 0) {
        let extension = f.name.substr(pos + 1).toLocaleLowerCase();
        if (extension in MimeTypes.MimeTypes)
            return MimeTypes.MimeTypes[extension];
    }
    return 'application/octet-stream';
}
function directoryDescriptorToFileDescriptor(d) {
    return {
        sha: d.contentSha,
        name: d.name,
        mimeType: getMimeType(d),
        lastWrite: d.lastWrite,
        size: d.size
    };
}
function goLoadDirectory(sha, name) {
    const url = `#/directories/${sha}?name=${encodeURIComponent(lastSearchTerm ? (lastSearchTerm + '/' + name) : name)}`;
    window.location.href = url;
}
function goReference(name) {
    const url = `#/refs/${name}`;
    window.location.href = url;
}
function goPlaylist(name) {
    window.location.href = `#/playlists/${name}`;
}
async function loadDirectory(item) {
    const waiting = beginWait(() => {
        setContent(directoryPanel.root);
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, item.name);
    });
    let directoryDescriptor = await Rest.getDirectoryDescriptor(item.sha);
    let items = directoryDescriptor.files.map(directoryDescriptorToFileDescriptor);
    items = beautifyNames(items);
    lastDisplayedFiles = items;
    lastSearchTerm = item.name;
    waiting.done();
    setContent(directoryPanel.root);
    DirectoryPanel.directoryPanel.setValues(directoryPanel, {
        name: item.name,
        items
    });
}
async function loadReferences() {
    let waiting = beginWait(() => {
        setContent(directoryPanel.root);
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, "References");
    });
    let references = await Rest.getReferences();
    let items = references.map(reference => ({
        name: reference,
        lastWrite: 0,
        mimeType: 'application/reference',
        sha: reference,
        size: 0
    }));
    lastDisplayedFiles = items;
    lastSearchTerm = '';
    waiting.done();
    setContent(directoryPanel.root);
    DirectoryPanel.directoryPanel.setValues(directoryPanel, {
        name: "References",
        items
    });
}
async function loadPlaylists() {
    let waiting = beginWait(() => {
        setContent(directoryPanel.root);
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, "Playlists");
    });
    let references = await Rest.getReferences();
    let user = await Auth.me();
    const prefix = `PLUGIN-PLAYLISTS-${user.uuid.toUpperCase()}-`;
    let items = references
        .filter(reference => reference.toUpperCase().startsWith(prefix))
        .map(reference => reference.substr(prefix.length))
        .map(reference => reference.substr(0, 1).toUpperCase() + reference.substr(1).toLowerCase())
        .map(reference => ({
        name: reference,
        lastWrite: 0,
        mimeType: 'application/playlist',
        sha: reference,
        size: 0
    }));
    lastDisplayedFiles = items;
    lastSearchTerm = '';
    waiting.done();
    setContent(directoryPanel.root);
    DirectoryPanel.directoryPanel.setValues(directoryPanel, {
        name: "Playlists",
        items
    });
}
async function loadPlaylist(name) {
    const waiting = beginWait(() => {
        setContent(directoryPanel.root);
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, `Playlist '${name}'`);
    });
    let user = await Auth.me();
    let reference = await Rest.getReference(`PLUGIN-PLAYLISTS-${user.uuid.toUpperCase()}-${name.toUpperCase()}`);
    let commit = await Rest.getCommit(reference.currentCommitSha);
    waiting.done();
    await loadDirectory({
        sha: commit.directoryDescriptorSha,
        name,
        mimeType: 'application/directory',
        lastWrite: 0,
        size: 0
    });
}
async function loadReference(name) {
    const waiting = beginWait(() => {
        setContent(directoryPanel.root);
        DirectoryPanel.directoryPanel.setLoading(directoryPanel, `Reference '${name}'`);
    });
    let reference = await Rest.getReference(name);
    let commit = await Rest.getCommit(reference.currentCommitSha);
    waiting.done();
    await loadDirectory({
        sha: commit.directoryDescriptorSha,
        name,
        mimeType: 'application/directory',
        lastWrite: 0,
        size: 0
    });
}
function itemDefaultAction(childIndex) {
    let item = lastDisplayedFiles[childIndex];
    if (item.mimeType == 'application/directory') {
        goLoadDirectory(item.sha, item.name);
    }
    else if (item.mimeType == 'application/reference') {
        goReference(item.sha);
    }
    else if (item.mimeType == 'application/playlist') {
        goPlaylist(item.sha);
    }
    else if (item.mimeType.startsWith('audio/')) {
        audioJukebox.addAndPlay(item);
        // set an unroller
        if (childIndex >= lastDisplayedFiles.length - 1) {
            audioJukebox.setItemUnroller(null);
        }
        else {
            let term = lastSearchTerm;
            let unrolledItems = lastDisplayedFiles.slice(childIndex + 1).filter(f => f.mimeType.startsWith('audio/'));
            let unrollIndex = 0;
            if (unrolledItems.length) {
                audioJukebox.setItemUnroller({
                    name: () => {
                        if (unrollIndex >= 0 && unrollIndex < unrolledItems.length)
                            return `then '${unrolledItems[unrollIndex].name.substr(0, 20)}' and ${unrolledItems.length - unrollIndex - 1} other '${term}' items...`;
                        return `finished '${term} songs`;
                    },
                    unroll: () => unrolledItems[unrollIndex++],
                    hasNext: () => unrollIndex >= 0 && unrollIndex < unrolledItems.length
                });
            }
        }
    }
}
searchResultPanel.root.addEventListener('click', async (event) => {
    // todo : knownledge to do that is in searchResultPanel
    let { element, childIndex } = Templates.templateGetEventLocation(searchResultPanel, event);
    if (lastDisplayedFiles && element == searchResultPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        itemDefaultAction(childIndex);
    }
});
directoryPanel.root.addEventListener('click', async (event) => {
    // todo : knownledge to do that is in directoryPanel
    let { element, childIndex } = Templates.templateGetEventLocation(directoryPanel, event);
    if (lastDisplayedFiles && element == directoryPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        itemDefaultAction(childIndex);
    }
});
readHashAndAct();
window.onpopstate = function (event) {
    readHashAndAct();
    /*if (event.state) {
        currentDirectoryDescriptorSha = event.state.currentDirectoryDescriptorSha
        currentClientId = event.state.currentClientId
        currentPictureIndex = event.state.currentPictureIndex || 0
 
        if (!currentClientId)
            el("#menu").classList.remove("is-hidden")
 
        syncUi()
    }
    else {
        fromHash()
 
        syncUi()
    }*/
};
Auth.me().then(user => UiTool.el('user-id').innerText = user.uuid);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./public/messages.js":
/*!****************************!*\
  !*** ./public/messages.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
let messages = [];
const popupTemplate = `
    <div x-id="messages">
    </div>`;
let popup = templates_1.createTemplateInstance(popupTemplate);
function refresh() {
    popup.messages.innerHTML = messages.map(message => {
        let style = '';
        if (message.feeling > 0)
            style = `background-color: #70ca85; color: white;`;
        else if (message.feeling < 0)
            style = `background-color: #F44336; color: white;`;
        return `<div class="mui-panel x-message-panel" style="${style}">${message.html}</div>`;
    }).join('');
}
function displayMessage(html, feeling) {
    messages.push({
        html,
        feeling
    });
    refresh();
    if (!popup.root.isConnected)
        document.body.appendChild(popup.root);
    setTimeout(() => {
        messages.shift();
        refresh();
        if (!messages.length)
            document.body.removeChild(popup.root);
    }, 4000);
}
exports.displayMessage = displayMessage;
//# sourceMappingURL=messages.js.map

/***/ }),

/***/ "./public/mime-types-module.js":
/*!*************************************!*\
  !*** ./public/mime-types-module.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
function extensionFromMimeType(mimeType) {
    for (let [extension, value] of Object.entries(exports.MimeTypes)) {
        if (mimeType == value)
            return extension;
    }
    return null;
}
exports.extensionFromMimeType = extensionFromMimeType;
exports.MimeTypes = {
    "3dml": "text/vnd.in3d.3dml",
    "3ds": "image/x-3ds",
    "3g2": "video/3gpp2",
    "3gp": "video/3gpp",
    "7z": "application/x-7z-compressed",
    "aab": "application/x-authorware-bin",
    "aac": "audio/x-aac",
    "aam": "application/x-authorware-map",
    "aas": "application/x-authorware-seg",
    "abw": "application/x-abiword",
    "ac": "application/pkix-attr-cert",
    "acc": "application/vnd.americandynamics.acc",
    "ace": "application/x-ace-compressed",
    "acu": "application/vnd.acucobol",
    "acutc": "application/vnd.acucorp",
    "adp": "audio/adpcm",
    "aep": "application/vnd.audiograph",
    "afm": "application/x-font-type1",
    "afp": "application/vnd.ibm.modcap",
    "ahead": "application/vnd.ahead.space",
    "ai": "application/postscript",
    "aif": "audio/x-aiff",
    "aifc": "audio/x-aiff",
    "aiff": "audio/x-aiff",
    "air": "application/vnd.adobe.air-application-installer-package+zip",
    "ait": "application/vnd.dvb.ait",
    "ami": "application/vnd.amiga.ami",
    "ape": "audio/ape",
    "apk": "application/vnd.android.package-archive",
    "appcache": "text/cache-manifest",
    "application": "application/x-ms-application",
    "apr": "application/vnd.lotus-approach",
    "arc": "application/x-freearc",
    "asa": "text/plain",
    "asax": "application/octet-stream",
    "asc": "application/pgp-signature",
    "ascx": "text/plain",
    "asf": "video/x-ms-asf",
    "ashx": "text/plain",
    "asm": "text/x-asm",
    "asmx": "text/plain",
    "aso": "application/vnd.accpac.simply.aso",
    "asp": "text/plain",
    "aspx": "text/plain",
    "asx": "video/x-ms-asf",
    "atc": "application/vnd.acucorp",
    "atom": "application/atom+xml",
    "atomcat": "application/atomcat+xml",
    "atomsvc": "application/atomsvc+xml",
    "atx": "application/vnd.antix.game-component",
    "au": "audio/basic",
    "avi": "video/x-msvideo",
    "aw": "application/applixware",
    "axd": "text/plain",
    "azf": "application/vnd.airzip.filesecure.azf",
    "azs": "application/vnd.airzip.filesecure.azs",
    "azw": "application/vnd.amazon.ebook",
    "bat": "application/x-msdownload",
    "bcpio": "application/x-bcpio",
    "bdf": "application/x-font-bdf",
    "bdm": "application/vnd.syncml.dm+wbxml",
    "bed": "application/vnd.realvnc.bed",
    "bh2": "application/vnd.fujitsu.oasysprs",
    "bin": "application/octet-stream",
    "blb": "application/x-blorb",
    "blorb": "application/x-blorb",
    "bmi": "application/vnd.bmi",
    "bmp": "image/bmp",
    "book": "application/vnd.framemaker",
    "box": "application/vnd.previewsystems.box",
    "boz": "application/x-bzip2",
    "bpk": "application/octet-stream",
    "btif": "image/prs.btif",
    "bz": "application/x-bzip",
    "bz2": "application/x-bzip2",
    "c": "text/x-c",
    "c11amc": "application/vnd.cluetrust.cartomobile-config",
    "c11amz": "application/vnd.cluetrust.cartomobile-config-pkg",
    "c4d": "application/vnd.clonk.c4group",
    "c4f": "application/vnd.clonk.c4group",
    "c4g": "application/vnd.clonk.c4group",
    "c4p": "application/vnd.clonk.c4group",
    "c4u": "application/vnd.clonk.c4group",
    "cab": "application/vnd.ms-cab-compressed",
    "caf": "audio/x-caf",
    "cap": "application/vnd.tcpdump.pcap",
    "car": "application/vnd.curl.car",
    "cat": "application/vnd.ms-pki.seccat",
    "cb7": "application/x-cbr",
    "cba": "application/x-cbr",
    "cbr": "application/x-cbr",
    "cbt": "application/x-cbr",
    "cbz": "application/x-cbr",
    "cc": "text/x-c",
    "cct": "application/x-director",
    "ccxml": "application/ccxml+xml",
    "cdbcmsg": "application/vnd.contact.cmsg",
    "cdf": "application/x-netcdf",
    "cdkey": "application/vnd.mediastation.cdkey",
    "cdmia": "application/cdmi-capability",
    "cdmic": "application/cdmi-container",
    "cdmid": "application/cdmi-domain",
    "cdmio": "application/cdmi-object",
    "cdmiq": "application/cdmi-queue",
    "cdx": "chemical/x-cdx",
    "cdxml": "application/vnd.chemdraw+xml",
    "cdy": "application/vnd.cinderella",
    "cer": "application/pkix-cert",
    "cfc": "application/x-coldfusion",
    "cfm": "application/x-coldfusion",
    "cfs": "application/x-cfs-compressed",
    "cgm": "image/cgm",
    "chat": "application/x-chat",
    "chm": "application/vnd.ms-htmlhelp",
    "chrt": "application/vnd.kde.kchart",
    "cif": "chemical/x-cif",
    "cii": "application/vnd.anser-web-certificate-issue-initiation",
    "cil": "application/vnd.ms-artgalry",
    "cla": "application/vnd.claymore",
    "class": "application/java-vm",
    "clkk": "application/vnd.crick.clicker.keyboard",
    "clkp": "application/vnd.crick.clicker.palette",
    "clkt": "application/vnd.crick.clicker.template",
    "clkw": "application/vnd.crick.clicker.wordbank",
    "clkx": "application/vnd.crick.clicker",
    "clp": "application/x-msclip",
    "cmc": "application/vnd.cosmocaller",
    "cmdf": "chemical/x-cmdf",
    "cml": "chemical/x-cml",
    "cmp": "application/vnd.yellowriver-custom-menu",
    "cmx": "image/x-cmx",
    "cod": "application/vnd.rim.cod",
    "com": "application/x-msdownload",
    "conf": "text/plain",
    "cpio": "application/x-cpio",
    "cpp": "text/x-c",
    "cpt": "application/mac-compactpro",
    "crd": "application/x-mscardfile",
    "crl": "application/pkix-crl",
    "crt": "application/x-x509-ca-cert",
    "crx": "application/octet-stream",
    "cryptonote": "application/vnd.rig.cryptonote",
    "cs": "text/plain",
    "csh": "application/x-csh",
    "csml": "chemical/x-csml",
    "csp": "application/vnd.commonspace",
    "css": "text/css",
    "cst": "application/x-director",
    "csv": "text/csv",
    "cu": "application/cu-seeme",
    "curl": "text/vnd.curl",
    "cww": "application/prs.cww",
    "cxt": "application/x-director",
    "cxx": "text/x-c",
    "dae": "model/vnd.collada+xml",
    "daf": "application/vnd.mobius.daf",
    "dart": "application/vnd.dart",
    "dataless": "application/vnd.fdsn.seed",
    "davmount": "application/davmount+xml",
    "dbk": "application/docbook+xml",
    "dcr": "application/x-director",
    "dcurl": "text/vnd.curl.dcurl",
    "dd2": "application/vnd.oma.dd2+xml",
    "ddd": "application/vnd.fujixerox.ddd",
    "deb": "application/x-debian-package",
    "def": "text/plain",
    "deploy": "application/octet-stream",
    "der": "application/x-x509-ca-cert",
    "dfac": "application/vnd.dreamfactory",
    "dgc": "application/x-dgc-compressed",
    "dic": "text/x-c",
    "dir": "application/x-director",
    "dis": "application/vnd.mobius.dis",
    "dist": "application/octet-stream",
    "distz": "application/octet-stream",
    "djv": "image/vnd.djvu",
    "djvu": "image/vnd.djvu",
    "dll": "application/x-msdownload",
    "dmg": "application/x-apple-diskimage",
    "dmp": "application/vnd.tcpdump.pcap",
    "dms": "application/octet-stream",
    "dna": "application/vnd.dna",
    "doc": "application/msword",
    "docm": "application/vnd.ms-word.document.macroenabled.12",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "dot": "application/msword",
    "dotm": "application/vnd.ms-word.template.macroenabled.12",
    "dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "dp": "application/vnd.osgi.dp",
    "dpg": "application/vnd.dpgraph",
    "dra": "audio/vnd.dra",
    "dsc": "text/prs.lines.tag",
    "dssc": "application/dssc+der",
    "dtb": "application/x-dtbook+xml",
    "dtd": "application/xml-dtd",
    "dts": "audio/vnd.dts",
    "dtshd": "audio/vnd.dts.hd",
    "dump": "application/octet-stream",
    "dvb": "video/vnd.dvb.file",
    "dvi": "application/x-dvi",
    "dwf": "model/vnd.dwf",
    "dwg": "image/vnd.dwg",
    "dxf": "image/vnd.dxf",
    "dxp": "application/vnd.spotfire.dxp",
    "dxr": "application/x-director",
    "ecelp4800": "audio/vnd.nuera.ecelp4800",
    "ecelp7470": "audio/vnd.nuera.ecelp7470",
    "ecelp9600": "audio/vnd.nuera.ecelp9600",
    "ecma": "application/ecmascript",
    "edm": "application/vnd.novadigm.edm",
    "edx": "application/vnd.novadigm.edx",
    "efif": "application/vnd.picsel",
    "ei6": "application/vnd.pg.osasli",
    "elc": "application/octet-stream",
    "emf": "application/x-msmetafile",
    "eml": "message/rfc822",
    "emma": "application/emma+xml",
    "emz": "application/x-msmetafile",
    "eol": "audio/vnd.digital-winds",
    "eot": "application/vnd.ms-fontobject",
    "eps": "application/postscript",
    "epub": "application/epub+zip",
    "es3": "application/vnd.eszigno3+xml",
    "esa": "application/vnd.osgi.subsystem",
    "esf": "application/vnd.epson.esf",
    "et3": "application/vnd.eszigno3+xml",
    "etx": "text/x-setext",
    "eva": "application/x-eva",
    "evy": "application/x-envoy",
    "exe": "application/x-msdownload",
    "exi": "application/exi",
    "ext": "application/vnd.novadigm.ext",
    "ez": "application/andrew-inset",
    "ez2": "application/vnd.ezpix-album",
    "ez3": "application/vnd.ezpix-package",
    "f": "text/x-fortran",
    "f4v": "video/x-f4v",
    "f77": "text/x-fortran",
    "f90": "text/x-fortran",
    "fbs": "image/vnd.fastbidsheet",
    "fcdt": "application/vnd.adobe.formscentral.fcdt",
    "fcs": "application/vnd.isac.fcs",
    "fdf": "application/vnd.fdf",
    "fe_launch": "application/vnd.denovo.fcselayout-link",
    "fg5": "application/vnd.fujitsu.oasysgp",
    "fgd": "application/x-director",
    "fh": "image/x-freehand",
    "fh4": "image/x-freehand",
    "fh5": "image/x-freehand",
    "fh7": "image/x-freehand",
    "fhc": "image/x-freehand",
    "fig": "application/x-xfig",
    "flac": "audio/x-flac",
    "fli": "video/x-fli",
    "flo": "application/vnd.micrografx.flo",
    "flv": "video/x-flv",
    "flw": "application/vnd.kde.kivio",
    "flx": "text/vnd.fmi.flexstor",
    "fly": "text/vnd.fly",
    "fm": "application/vnd.framemaker",
    "fnc": "application/vnd.frogans.fnc",
    "for": "text/x-fortran",
    "fpx": "image/vnd.fpx",
    "frame": "application/vnd.framemaker",
    "fsc": "application/vnd.fsc.weblaunch",
    "fst": "image/vnd.fst",
    "ftc": "application/vnd.fluxtime.clip",
    "fti": "application/vnd.anser-web-funds-transfer-initiation",
    "fvt": "video/vnd.fvt",
    "fxp": "application/vnd.adobe.fxp",
    "fxpl": "application/vnd.adobe.fxp",
    "fzs": "application/vnd.fuzzysheet",
    "g2w": "application/vnd.geoplan",
    "g3": "image/g3fax",
    "g3w": "application/vnd.geospace",
    "gac": "application/vnd.groove-account",
    "gam": "application/x-tads",
    "gbr": "application/rpki-ghostbusters",
    "gca": "application/x-gca-compressed",
    "gdl": "model/vnd.gdl",
    "geo": "application/vnd.dynageo",
    "gex": "application/vnd.geometry-explorer",
    "ggb": "application/vnd.geogebra.file",
    "ggt": "application/vnd.geogebra.tool",
    "ghf": "application/vnd.groove-help",
    "gif": "image/gif",
    "gim": "application/vnd.groove-identity-message",
    "gml": "application/gml+xml",
    "gmx": "application/vnd.gmx",
    "gnumeric": "application/x-gnumeric",
    "gph": "application/vnd.flographit",
    "gpx": "application/gpx+xml",
    "gqf": "application/vnd.grafeq",
    "gqs": "application/vnd.grafeq",
    "gram": "application/srgs",
    "gramps": "application/x-gramps-xml",
    "gre": "application/vnd.geometry-explorer",
    "grv": "application/vnd.groove-injector",
    "grxml": "application/srgs+xml",
    "gsf": "application/x-font-ghostscript",
    "gtar": "application/x-gtar",
    "gtm": "application/vnd.groove-tool-message",
    "gtw": "model/vnd.gtw",
    "gv": "text/vnd.graphviz",
    "gxf": "application/gxf",
    "gxt": "application/vnd.geonext",
    "gz": "application/x-gzip",
    "h": "text/x-c",
    "h261": "video/h261",
    "h263": "video/h263",
    "h264": "video/h264",
    "hal": "application/vnd.hal+xml",
    "hbci": "application/vnd.hbci",
    "hdf": "application/x-hdf",
    "hh": "text/x-c",
    "hlp": "application/winhlp",
    "hpgl": "application/vnd.hp-hpgl",
    "hpid": "application/vnd.hp-hpid",
    "hps": "application/vnd.hp-hps",
    "hqx": "application/mac-binhex40",
    "hta": "application/octet-stream",
    "htc": "text/html",
    "htke": "application/vnd.kenameaapp",
    "htm": "text/html",
    "html": "text/html",
    "hvd": "application/vnd.yamaha.hv-dic",
    "hvp": "application/vnd.yamaha.hv-voice",
    "hvs": "application/vnd.yamaha.hv-script",
    "i2g": "application/vnd.intergeo",
    "icc": "application/vnd.iccprofile",
    "ice": "x-conference/x-cooltalk",
    "icm": "application/vnd.iccprofile",
    "ico": "image/x-icon",
    "ics": "text/calendar",
    "ief": "image/ief",
    "ifb": "text/calendar",
    "ifm": "application/vnd.shana.informed.formdata",
    "iges": "model/iges",
    "igl": "application/vnd.igloader",
    "igm": "application/vnd.insors.igm",
    "igs": "model/iges",
    "igx": "application/vnd.micrografx.igx",
    "iif": "application/vnd.shana.informed.interchange",
    "imp": "application/vnd.accpac.simply.imp",
    "ims": "application/vnd.ms-ims",
    "in": "text/plain",
    "ini": "text/plain",
    "ink": "application/inkml+xml",
    "inkml": "application/inkml+xml",
    "install": "application/x-install-instructions",
    "iota": "application/vnd.astraea-software.iota",
    "ipa": "application/octet-stream",
    "ipfix": "application/ipfix",
    "ipk": "application/vnd.shana.informed.package",
    "irm": "application/vnd.ibm.rights-management",
    "irp": "application/vnd.irepository.package+xml",
    "iso": "application/x-iso9660-image",
    "itp": "application/vnd.shana.informed.formtemplate",
    "ivp": "application/vnd.immervision-ivp",
    "ivu": "application/vnd.immervision-ivu",
    "jad": "text/vnd.sun.j2me.app-descriptor",
    "jam": "application/vnd.jam",
    "jar": "application/java-archive",
    "java": "text/x-java-source",
    "jisp": "application/vnd.jisp",
    "jlt": "application/vnd.hp-jlyt",
    "jnlp": "application/x-java-jnlp-file",
    "joda": "application/vnd.joost.joda-archive",
    "jpe": "image/jpeg",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "jpgm": "video/jpm",
    "jpgv": "video/jpeg",
    "jpm": "video/jpm",
    "js": "text/javascript",
    "json": "application/json",
    "jsonml": "application/jsonml+json",
    "kar": "audio/midi",
    "karbon": "application/vnd.kde.karbon",
    "kfo": "application/vnd.kde.kformula",
    "kia": "application/vnd.kidspiration",
    "kml": "application/vnd.google-earth.kml+xml",
    "kmz": "application/vnd.google-earth.kmz",
    "kne": "application/vnd.kinar",
    "knp": "application/vnd.kinar",
    "kon": "application/vnd.kde.kontour",
    "kpr": "application/vnd.kde.kpresenter",
    "kpt": "application/vnd.kde.kpresenter",
    "kpxx": "application/vnd.ds-keypoint",
    "ksp": "application/vnd.kde.kspread",
    "ktr": "application/vnd.kahootz",
    "ktx": "image/ktx",
    "ktz": "application/vnd.kahootz",
    "kwd": "application/vnd.kde.kword",
    "kwt": "application/vnd.kde.kword",
    "lasxml": "application/vnd.las.las+xml",
    "latex": "application/x-latex",
    "lbd": "application/vnd.llamagraphics.life-balance.desktop",
    "lbe": "application/vnd.llamagraphics.life-balance.exchange+xml",
    "les": "application/vnd.hhe.lesson-player",
    "lha": "application/x-lzh-compressed",
    "link66": "application/vnd.route66.link66+xml",
    "list": "text/plain",
    "list3820": "application/vnd.ibm.modcap",
    "listafp": "application/vnd.ibm.modcap",
    "lnk": "application/x-ms-shortcut",
    "log": "text/plain",
    "lostxml": "application/lost+xml",
    "lrf": "application/octet-stream",
    "lrm": "application/vnd.ms-lrm",
    "ltf": "application/vnd.frogans.ltf",
    "lvp": "audio/vnd.lucent.voice",
    "lwp": "application/vnd.lotus-wordpro",
    "lz": "application/x-lzip",
    "lzh": "application/x-lzh-compressed",
    "lzma": "application/x-lzma",
    "lzo": "application/x-lzop",
    "m13": "application/x-msmediaview",
    "m14": "application/x-msmediaview",
    "m1v": "video/mpeg",
    "m21": "application/mp21",
    "m2a": "audio/mpeg",
    "m2v": "video/mpeg",
    "m3a": "audio/mpeg",
    "m3u": "audio/x-mpegurl",
    "m3u8": "application/vnd.apple.mpegurl",
    "m4a": "audio/mp4",
    "m4u": "video/vnd.mpegurl",
    "m4v": "video/mp4",
    "ma": "application/mathematica",
    "mads": "application/mads+xml",
    "mag": "application/vnd.ecowin.chart",
    "maker": "application/vnd.framemaker",
    "man": "text/troff",
    "mar": "application/octet-stream",
    "mathml": "application/mathml+xml",
    "mb": "application/mathematica",
    "mbk": "application/vnd.mobius.mbk",
    "mbox": "application/mbox",
    "mc1": "application/vnd.medcalcdata",
    "mcd": "application/vnd.mcd",
    "mcurl": "text/vnd.curl.mcurl",
    'md': 'text/plain',
    "mdb": "application/x-msaccess",
    "mdi": "image/vnd.ms-modi",
    "me": "text/troff",
    "mesh": "model/mesh",
    "meta4": "application/metalink4+xml",
    "metalink": "application/metalink+xml",
    "mets": "application/mets+xml",
    "mfm": "application/vnd.mfmp",
    "mft": "application/rpki-manifest",
    "mgp": "application/vnd.osgeo.mapguide.package",
    "mgz": "application/vnd.proteus.magazine",
    "mid": "audio/midi",
    "midi": "audio/midi",
    "mie": "application/x-mie",
    "mif": "application/vnd.mif",
    "mime": "message/rfc822",
    "mj2": "video/mj2",
    "mjp2": "video/mj2",
    "mk3d": "video/x-matroska",
    "mka": "audio/x-matroska",
    "mks": "video/x-matroska",
    "mkv": "video/x-matroska",
    "mlp": "application/vnd.dolby.mlp",
    "mmd": "application/vnd.chipnuts.karaoke-mmd",
    "mmf": "application/vnd.smaf",
    "mmr": "image/vnd.fujixerox.edmics-mmr",
    "mng": "video/x-mng",
    "mny": "application/x-msmoney",
    "mobi": "application/x-mobipocket-ebook",
    "mods": "application/mods+xml",
    "mov": "video/quicktime",
    "movie": "video/x-sgi-movie",
    "mp2": "audio/mpeg",
    "mp21": "application/mp21",
    "mp2a": "audio/mpeg",
    "mp3": "audio/mpeg",
    "opus": "audio/opus",
    "mp4": "video/mp4",
    "mp4a": "audio/mp4",
    "mp4s": "application/mp4",
    "mp4v": "video/mp4",
    "mpc": "application/vnd.mophun.certificate",
    "mpe": "video/mpeg",
    "mpeg": "video/mpeg",
    "mpg": "video/mpeg",
    "mpg4": "video/mp4",
    "mpga": "audio/mpeg",
    "mpkg": "application/vnd.apple.installer+xml",
    "mpm": "application/vnd.blueice.multipass",
    "mpn": "application/vnd.mophun.application",
    "mpp": "application/vnd.ms-project",
    "mpt": "application/vnd.ms-project",
    "mpy": "application/vnd.ibm.minipay",
    "mqy": "application/vnd.mobius.mqy",
    "mrc": "application/marc",
    "mrcx": "application/marcxml+xml",
    "ms": "text/troff",
    "mscml": "application/mediaservercontrol+xml",
    "mseed": "application/vnd.fdsn.mseed",
    "mseq": "application/vnd.mseq",
    "msf": "application/vnd.epson.msf",
    "msh": "model/mesh",
    "msi": "application/x-msdownload",
    "msl": "application/vnd.mobius.msl",
    "msty": "application/vnd.muvee.style",
    //"mts": "model/vnd.mts",
    "mts": "video/mts",
    "mus": "application/vnd.musician",
    "musicxml": "application/vnd.recordare.musicxml+xml",
    "mvb": "application/x-msmediaview",
    "mwf": "application/vnd.mfer",
    "mxf": "application/mxf",
    "mxl": "application/vnd.recordare.musicxml",
    "mxml": "application/xv+xml",
    "mxs": "application/vnd.triscape.mxs",
    "mxu": "video/vnd.mpegurl",
    "n-gage": "application/vnd.nokia.n-gage.symbian.install",
    "n3": "text/n3",
    "nb": "application/mathematica",
    "nbp": "application/vnd.wolfram.player",
    "nc": "application/x-netcdf",
    "ncx": "application/x-dtbncx+xml",
    "nfo": "text/x-nfo",
    "ngdat": "application/vnd.nokia.n-gage.data",
    "nitf": "application/vnd.nitf",
    "nlu": "application/vnd.neurolanguage.nlu",
    "nml": "application/vnd.enliven",
    "nnd": "application/vnd.noblenet-directory",
    "nns": "application/vnd.noblenet-sealer",
    "nnw": "application/vnd.noblenet-web",
    "npx": "image/vnd.net-fpx",
    "nsc": "application/x-conference",
    "nsf": "application/vnd.lotus-notes",
    "ntf": "application/vnd.nitf",
    "nzb": "application/x-nzb",
    "oa2": "application/vnd.fujitsu.oasys2",
    "oa3": "application/vnd.fujitsu.oasys3",
    "oas": "application/vnd.fujitsu.oasys",
    "obd": "application/x-msbinder",
    "obj": "application/x-tgif",
    "oda": "application/oda",
    "odb": "application/vnd.oasis.opendocument.database",
    "odc": "application/vnd.oasis.opendocument.chart",
    "odf": "application/vnd.oasis.opendocument.formula",
    "odft": "application/vnd.oasis.opendocument.formula-template",
    "odg": "application/vnd.oasis.opendocument.graphics",
    "odi": "application/vnd.oasis.opendocument.image",
    "odm": "application/vnd.oasis.opendocument.text-master",
    "odp": "application/vnd.oasis.opendocument.presentation",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odt": "application/vnd.oasis.opendocument.text",
    "oga": "audio/ogg",
    "ogg": "audio/ogg",
    "ogv": "video/ogg",
    "ogx": "application/ogg",
    "omdoc": "application/omdoc+xml",
    "onepkg": "application/onenote",
    "onetmp": "application/onenote",
    "onetoc": "application/onenote",
    "onetoc2": "application/onenote",
    "opf": "application/oebps-package+xml",
    "opml": "text/x-opml",
    "oprc": "application/vnd.palm",
    "org": "application/vnd.lotus-organizer",
    "osf": "application/vnd.yamaha.openscoreformat",
    "osfpvg": "application/vnd.yamaha.openscoreformat.osfpvg+xml",
    "otc": "application/vnd.oasis.opendocument.chart-template",
    "otf": "application/x-font-otf",
    "otg": "application/vnd.oasis.opendocument.graphics-template",
    "oth": "application/vnd.oasis.opendocument.text-web",
    "oti": "application/vnd.oasis.opendocument.image-template",
    "otp": "application/vnd.oasis.opendocument.presentation-template",
    "ots": "application/vnd.oasis.opendocument.spreadsheet-template",
    "ott": "application/vnd.oasis.opendocument.text-template",
    "oxps": "application/oxps",
    "oxt": "application/vnd.openofficeorg.extension",
    "p": "text/x-pascal",
    "p10": "application/pkcs10",
    "p12": "application/x-pkcs12",
    "p7b": "application/x-pkcs7-certificates",
    "p7c": "application/pkcs7-mime",
    "p7m": "application/pkcs7-mime",
    "p7r": "application/x-pkcs7-certreqresp",
    "p7s": "application/pkcs7-signature",
    "p8": "application/pkcs8",
    "pas": "text/x-pascal",
    "paw": "application/vnd.pawaafile",
    "pbd": "application/vnd.powerbuilder6",
    "pbm": "image/x-portable-bitmap",
    "pcap": "application/vnd.tcpdump.pcap",
    "pcf": "application/x-font-pcf",
    "pcl": "application/vnd.hp-pcl",
    "pclxl": "application/vnd.hp-pclxl",
    "pct": "image/x-pict",
    "pcurl": "application/vnd.curl.pcurl",
    "pcx": "image/x-pcx",
    "pdb": "application/vnd.palm",
    "pdf": "application/pdf",
    "pfa": "application/x-font-type1",
    "pfb": "application/x-font-type1",
    "pfm": "application/x-font-type1",
    "pfr": "application/font-tdpfr",
    "pfx": "application/x-pkcs12",
    "pgm": "image/x-portable-graymap",
    "pgn": "application/x-chess-pgn",
    "pgp": "application/pgp-encrypted",
    "phar": "application/octet-stream",
    "php": "text/plain",
    "phps": "application/x-httpd-phps",
    "pic": "image/x-pict",
    "pkg": "application/octet-stream",
    "pki": "application/pkixcmp",
    "pkipath": "application/pkix-pkipath",
    "plb": "application/vnd.3gpp.pic-bw-large",
    "plc": "application/vnd.mobius.plc",
    "plf": "application/vnd.pocketlearn",
    "plist": "application/x-plist",
    "pls": "application/pls+xml",
    "pml": "application/vnd.ctc-posml",
    "png": "image/png",
    "pnm": "image/x-portable-anymap",
    "portpkg": "application/vnd.macports.portpkg",
    "pot": "application/vnd.ms-powerpoint",
    "potm": "application/vnd.ms-powerpoint.template.macroenabled.12",
    "potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
    "ppam": "application/vnd.ms-powerpoint.addin.macroenabled.12",
    "ppd": "application/vnd.cups-ppd",
    "ppm": "image/x-portable-pixmap",
    "pps": "application/vnd.ms-powerpoint",
    "ppsm": "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
    "ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "ppt": "application/vnd.ms-powerpoint",
    "pptm": "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "pqa": "application/vnd.palm",
    "prc": "application/x-mobipocket-ebook",
    "pre": "application/vnd.lotus-freelance",
    "prf": "application/pics-rules",
    "ps": "application/postscript",
    "psb": "application/vnd.3gpp.pic-bw-small",
    "psd": "image/vnd.adobe.photoshop",
    "psf": "application/x-font-linux-psf",
    "pskcxml": "application/pskc+xml",
    "ptid": "application/vnd.pvi.ptid1",
    "pub": "application/x-mspublisher",
    "pvb": "application/vnd.3gpp.pic-bw-var",
    "pwn": "application/vnd.3m.post-it-notes",
    "pya": "audio/vnd.ms-playready.media.pya",
    "pyv": "video/vnd.ms-playready.media.pyv",
    "qam": "application/vnd.epson.quickanime",
    "qbo": "application/vnd.intu.qbo",
    "qfx": "application/vnd.intu.qfx",
    "qps": "application/vnd.publishare-delta-tree",
    "qt": "video/quicktime",
    "qwd": "application/vnd.quark.quarkxpress",
    "qwt": "application/vnd.quark.quarkxpress",
    "qxb": "application/vnd.quark.quarkxpress",
    "qxd": "application/vnd.quark.quarkxpress",
    "qxl": "application/vnd.quark.quarkxpress",
    "qxt": "application/vnd.quark.quarkxpress",
    "ra": "audio/x-pn-realaudio",
    "ram": "audio/x-pn-realaudio",
    "rar": "application/x-rar-compressed",
    "ras": "image/x-cmu-raster",
    "rb": "text/plain",
    "rcprofile": "application/vnd.ipunplugged.rcprofile",
    "rdf": "application/rdf+xml",
    "rdz": "application/vnd.data-vision.rdz",
    "rep": "application/vnd.businessobjects",
    "res": "application/x-dtbresource+xml",
    "resx": "text/xml",
    "rgb": "image/x-rgb",
    "rif": "application/reginfo+xml",
    "rip": "audio/vnd.rip",
    "ris": "application/x-research-info-systems",
    "rl": "application/resource-lists+xml",
    "rlc": "image/vnd.fujixerox.edmics-rlc",
    "rld": "application/resource-lists-diff+xml",
    "rm": "application/vnd.rn-realmedia",
    "rmi": "audio/midi",
    "rmp": "audio/x-pn-realaudio-plugin",
    "rms": "application/vnd.jcp.javame.midlet-rms",
    "rmvb": "application/vnd.rn-realmedia-vbr",
    "rnc": "application/relax-ng-compact-syntax",
    "roa": "application/rpki-roa",
    "roff": "text/troff",
    "rp9": "application/vnd.cloanto.rp9",
    "rpm": "application/x-rpm",
    "rpss": "application/vnd.nokia.radio-presets",
    "rpst": "application/vnd.nokia.radio-preset",
    "rq": "application/sparql-query",
    "rs": "application/rls-services+xml",
    "rsd": "application/rsd+xml",
    "rss": "application/rss+xml",
    "rtf": "application/rtf",
    "rtx": "text/richtext",
    "s": "text/x-asm",
    "s3m": "audio/s3m",
    "s7z": "application/x-7z-compressed",
    "saf": "application/vnd.yamaha.smaf-audio",
    "safariextz": "application/octet-stream",
    "sass": "text/x-sass",
    "sbml": "application/sbml+xml",
    "sc": "application/vnd.ibm.secure-container",
    "scd": "application/x-msschedule",
    "scm": "application/vnd.lotus-screencam",
    "scq": "application/scvp-cv-request",
    "scs": "application/scvp-cv-response",
    "scss": "text/x-scss",
    "scurl": "text/vnd.curl.scurl",
    "sda": "application/vnd.stardivision.draw",
    "sdc": "application/vnd.stardivision.calc",
    "sdd": "application/vnd.stardivision.impress",
    "sdkd": "application/vnd.solent.sdkm+xml",
    "sdkm": "application/vnd.solent.sdkm+xml",
    "sdp": "application/sdp",
    "sdw": "application/vnd.stardivision.writer",
    "see": "application/vnd.seemail",
    "seed": "application/vnd.fdsn.seed",
    "sema": "application/vnd.sema",
    "semd": "application/vnd.semd",
    "semf": "application/vnd.semf",
    "ser": "application/java-serialized-object",
    "setpay": "application/set-payment-initiation",
    "setreg": "application/set-registration-initiation",
    "sfd-hdstx": "application/vnd.hydrostatix.sof-data",
    "sfs": "application/vnd.spotfire.sfs",
    "sfv": "text/x-sfv",
    "sgi": "image/sgi",
    "sgl": "application/vnd.stardivision.writer-global",
    "sgm": "text/sgml",
    "sgml": "text/sgml",
    "sh": "application/x-sh",
    "shar": "application/x-shar",
    "shf": "application/shf+xml",
    "sid": "image/x-mrsid-image",
    "sig": "application/pgp-signature",
    "sil": "audio/silk",
    "silo": "model/mesh",
    "sis": "application/vnd.symbian.install",
    "sisx": "application/vnd.symbian.install",
    "sit": "application/x-stuffit",
    "sitx": "application/x-stuffitx",
    "skd": "application/vnd.koan",
    "skm": "application/vnd.koan",
    "skp": "application/vnd.koan",
    "skt": "application/vnd.koan",
    "sldm": "application/vnd.ms-powerpoint.slide.macroenabled.12",
    "sldx": "application/vnd.openxmlformats-officedocument.presentationml.slide",
    "slt": "application/vnd.epson.salt",
    "sm": "application/vnd.stepmania.stepchart",
    "smf": "application/vnd.stardivision.math",
    "smi": "application/smil+xml",
    "smil": "application/smil+xml",
    "smv": "video/x-smv",
    "smzip": "application/vnd.stepmania.package",
    "snd": "audio/basic",
    "snf": "application/x-font-snf",
    "so": "application/octet-stream",
    "spc": "application/x-pkcs7-certificates",
    "spf": "application/vnd.yamaha.smaf-phrase",
    "spl": "application/x-futuresplash",
    "spot": "text/vnd.in3d.spot",
    "spp": "application/scvp-vp-response",
    "spq": "application/scvp-vp-request",
    "spx": "audio/ogg",
    "sql": "application/x-sql",
    "src": "application/x-wais-source",
    "srt": "application/x-subrip",
    "sru": "application/sru+xml",
    "srx": "application/sparql-results+xml",
    "ssdl": "application/ssdl+xml",
    "sse": "application/vnd.kodak-descriptor",
    "ssf": "application/vnd.epson.ssf",
    "ssml": "application/ssml+xml",
    "st": "application/vnd.sailingtracker.track",
    "stc": "application/vnd.sun.xml.calc.template",
    "std": "application/vnd.sun.xml.draw.template",
    "stf": "application/vnd.wt.stf",
    "sti": "application/vnd.sun.xml.impress.template",
    "stk": "application/hyperstudio",
    "stl": "application/vnd.ms-pki.stl",
    "str": "application/vnd.pg.format",
    "stw": "application/vnd.sun.xml.writer.template",
    "styl": "text/x-styl",
    "sub": "image/vnd.dvb.subtitle",
    "sus": "application/vnd.sus-calendar",
    "susp": "application/vnd.sus-calendar",
    "sv4cpio": "application/x-sv4cpio",
    "sv4crc": "application/x-sv4crc",
    "svc": "application/vnd.dvb.service",
    "svd": "application/vnd.svd",
    "svg": "image/svg+xml",
    "svgz": "image/svg+xml",
    "swa": "application/x-director",
    "swf": "application/x-shockwave-flash",
    "swi": "application/vnd.aristanetworks.swi",
    "sxc": "application/vnd.sun.xml.calc",
    "sxd": "application/vnd.sun.xml.draw",
    "sxg": "application/vnd.sun.xml.writer.global",
    "sxi": "application/vnd.sun.xml.impress",
    "sxm": "application/vnd.sun.xml.math",
    "sxw": "application/vnd.sun.xml.writer",
    "t": "text/troff",
    "t3": "application/x-t3vm-image",
    "taglet": "application/vnd.mynfc",
    "tao": "application/vnd.tao.intent-module-archive",
    "tar": "application/x-tar",
    "tcap": "application/vnd.3gpp2.tcap",
    "tcl": "application/x-tcl",
    "teacher": "application/vnd.smart.teacher",
    "tei": "application/tei+xml",
    "teicorpus": "application/tei+xml",
    "tex": "application/x-tex",
    "texi": "application/x-texinfo",
    "texinfo": "application/x-texinfo",
    "text": "text/plain",
    "tfi": "application/thraud+xml",
    "tfm": "application/x-tex-tfm",
    "tga": "image/x-tga",
    "tgz": "application/x-gzip",
    "thmx": "application/vnd.ms-officetheme",
    "tif": "image/tiff",
    "tiff": "image/tiff",
    "tmo": "application/vnd.tmobile-livetv",
    "torrent": "application/x-bittorrent",
    "tpl": "application/vnd.groove-tool-template",
    "tpt": "application/vnd.trid.tpt",
    "tr": "text/troff",
    "tra": "application/vnd.trueapp",
    "trm": "application/x-msterminal",
    "tsd": "application/timestamped-data",
    "tsv": "text/tab-separated-values",
    "ttc": "application/x-font-ttf",
    "ttf": "application/x-font-ttf",
    "ttl": "text/turtle",
    "twd": "application/vnd.simtech-mindmapper",
    "twds": "application/vnd.simtech-mindmapper",
    "txd": "application/vnd.genomatix.tuxedo",
    "txf": "application/vnd.mobius.txf",
    "txt": "text/plain",
    "u32": "application/x-authorware-bin",
    "udeb": "application/x-debian-package",
    "ufd": "application/vnd.ufdl",
    "ufdl": "application/vnd.ufdl",
    "ulx": "application/x-glulx",
    "umj": "application/vnd.umajin",
    "unityweb": "application/vnd.unity",
    "uoml": "application/vnd.uoml+xml",
    "uri": "text/uri-list",
    "uris": "text/uri-list",
    "urls": "text/uri-list",
    "ustar": "application/x-ustar",
    "utz": "application/vnd.uiq.theme",
    "uu": "text/x-uuencode",
    "uva": "audio/vnd.dece.audio",
    "uvd": "application/vnd.dece.data",
    "uvf": "application/vnd.dece.data",
    "uvg": "image/vnd.dece.graphic",
    "uvh": "video/vnd.dece.hd",
    "uvi": "image/vnd.dece.graphic",
    "uvm": "video/vnd.dece.mobile",
    "uvp": "video/vnd.dece.pd",
    "uvs": "video/vnd.dece.sd",
    "uvt": "application/vnd.dece.ttml+xml",
    "uvu": "video/vnd.uvvu.mp4",
    "uvv": "video/vnd.dece.video",
    "uvva": "audio/vnd.dece.audio",
    "uvvd": "application/vnd.dece.data",
    "uvvf": "application/vnd.dece.data",
    "uvvg": "image/vnd.dece.graphic",
    "uvvh": "video/vnd.dece.hd",
    "uvvi": "image/vnd.dece.graphic",
    "uvvm": "video/vnd.dece.mobile",
    "uvvp": "video/vnd.dece.pd",
    "uvvs": "video/vnd.dece.sd",
    "uvvt": "application/vnd.dece.ttml+xml",
    "uvvu": "video/vnd.uvvu.mp4",
    "uvvv": "video/vnd.dece.video",
    "uvvx": "application/vnd.dece.unspecified",
    "uvvz": "application/vnd.dece.zip",
    "uvx": "application/vnd.dece.unspecified",
    "uvz": "application/vnd.dece.zip",
    "vcard": "text/vcard",
    "vcd": "application/x-cdlink",
    "vcf": "text/x-vcard",
    "vcg": "application/vnd.groove-vcard",
    "vcs": "text/x-vcalendar",
    "vcx": "application/vnd.vcx",
    "vis": "application/vnd.visionary",
    "viv": "video/vnd.vivo",
    "vob": "video/x-ms-vob",
    "vor": "application/vnd.stardivision.writer",
    "vox": "application/x-authorware-bin",
    "vrml": "model/vrml",
    "vsd": "application/vnd.visio",
    "vsf": "application/vnd.vsf",
    "vss": "application/vnd.visio",
    "vst": "application/vnd.visio",
    "vsw": "application/vnd.visio",
    "vtu": "model/vnd.vtu",
    "vxml": "application/voicexml+xml",
    "w3d": "application/x-director",
    "wad": "application/x-doom",
    "wav": "audio/x-wav",
    "wax": "audio/x-ms-wax",
    "wbmp": "image/vnd.wap.wbmp",
    "wbs": "application/vnd.criticaltools.wbs+xml",
    "wbxml": "application/vnd.wap.wbxml",
    "wcm": "application/vnd.ms-works",
    "wdb": "application/vnd.ms-works",
    "wdp": "image/vnd.ms-photo",
    "weba": "audio/webm",
    "webm": "video/webm",
    "webp": "image/webp",
    "wg": "application/vnd.pmi.widget",
    "wgt": "application/widget",
    "wks": "application/vnd.ms-works",
    "wm": "video/x-ms-wm",
    "wma": "audio/x-ms-wma",
    "wmd": "application/x-ms-wmd",
    "wmf": "application/x-msmetafile",
    "wml": "text/vnd.wap.wml",
    "wmlc": "application/vnd.wap.wmlc",
    "wmls": "text/vnd.wap.wmlscript",
    "wmlsc": "application/vnd.wap.wmlscriptc",
    "wmv": "video/x-ms-wmv",
    "wmx": "video/x-ms-wmx",
    "wmz": "application/x-ms-wmz",
    "woff": "application/x-font-woff",
    "wpd": "application/vnd.wordperfect",
    "wpl": "application/vnd.ms-wpl",
    "wps": "application/vnd.ms-works",
    "wqd": "application/vnd.wqd",
    "wri": "application/x-mswrite",
    "wrl": "model/vrml",
    "wsdl": "application/wsdl+xml",
    "wspolicy": "application/wspolicy+xml",
    "wtb": "application/vnd.webturbo",
    "wvx": "video/x-ms-wvx",
    "x32": "application/x-authorware-bin",
    "x3d": "model/x3d+xml",
    "x3db": "model/x3d+binary",
    "x3dbz": "model/x3d+binary",
    "x3dv": "model/x3d+vrml",
    "x3dvz": "model/x3d+vrml",
    "x3dz": "model/x3d+xml",
    "xaml": "application/xaml+xml",
    "xap": "application/x-silverlight-app",
    "xar": "application/vnd.xara",
    "xbap": "application/x-ms-xbap",
    "xbd": "application/vnd.fujixerox.docuworks.binder",
    "xbm": "image/x-xbitmap",
    "xdf": "application/xcap-diff+xml",
    "xdm": "application/vnd.syncml.dm+xml",
    "xdp": "application/vnd.adobe.xdp+xml",
    "xdssc": "application/dssc+xml",
    "xdw": "application/vnd.fujixerox.docuworks",
    "xenc": "application/xenc+xml",
    "xer": "application/patch-ops-error+xml",
    "xfdf": "application/vnd.adobe.xfdf",
    "xfdl": "application/vnd.xfdl",
    "xht": "application/xhtml+xml",
    "xhtml": "application/xhtml+xml",
    "xhvml": "application/xv+xml",
    "xif": "image/vnd.xiff",
    "xla": "application/vnd.ms-excel",
    "xlam": "application/vnd.ms-excel.addin.macroenabled.12",
    "xlc": "application/vnd.ms-excel",
    "xlf": "application/x-xliff+xml",
    "xlm": "application/vnd.ms-excel",
    "xls": "application/vnd.ms-excel",
    "xlsb": "application/vnd.ms-excel.sheet.binary.macroenabled.12",
    "xlsm": "application/vnd.ms-excel.sheet.macroenabled.12",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "xlt": "application/vnd.ms-excel",
    "xltm": "application/vnd.ms-excel.template.macroenabled.12",
    "xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "xlw": "application/vnd.ms-excel",
    "xm": "audio/xm",
    "xml": "application/xml",
    "xo": "application/vnd.olpc-sugar",
    "xop": "application/xop+xml",
    "xpi": "application/x-xpinstall",
    "xpl": "application/xproc+xml",
    "xpm": "image/x-xpixmap",
    "xpr": "application/vnd.is-xpr",
    "xps": "application/vnd.ms-xpsdocument",
    "xpw": "application/vnd.intercon.formnet",
    "xpx": "application/vnd.intercon.formnet",
    "xsl": "application/xml",
    "xslt": "application/xslt+xml",
    "xsm": "application/vnd.syncml+xml",
    "xspf": "application/xspf+xml",
    "xul": "application/vnd.mozilla.xul+xml",
    "xvm": "application/xv+xml",
    "xvml": "application/xv+xml",
    "xwd": "image/x-xwindowdump",
    "xyz": "chemical/x-xyz",
    "xz": "application/x-xz",
    "yaml": "text/yaml",
    "yang": "application/yang",
    "yin": "application/yin+xml",
    "yml": "text/yaml",
    "z": "application/x-compress",
    "z1": "application/x-zmachine",
    "z2": "application/x-zmachine",
    "z3": "application/x-zmachine",
    "z4": "application/x-zmachine",
    "z5": "application/x-zmachine",
    "z6": "application/x-zmachine",
    "z7": "application/x-zmachine",
    "z8": "application/x-zmachine",
    "zaz": "application/vnd.zzazz.deck+xml",
    "zip": "application/zip",
    "zir": "application/vnd.zul",
    "zirz": "application/vnd.zul",
    "zmm": "application/vnd.handheld-entertainment+xml",
    "123": "application/vnd.lotus-1-2-3"
};
//# sourceMappingURL=mime-types-module.js.map

/***/ }),

/***/ "./public/network.js":
/*!***************************!*\
  !*** ./public/network.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
async function afterFetch(response) {
    if (!response || !response.ok) {
        console.error(`bad response : ${JSON.stringify(response)}`);
        return null;
    }
    let receivedContentType = response.headers.get('Content-Type') || 'application/json';
    let sci = receivedContentType.indexOf(';');
    if (sci >= 0)
        receivedContentType = receivedContentType.substr(0, sci);
    if (receivedContentType == 'application/json')
        return await response.json();
    else
        return await response.text();
}
function getData(url, headers = null) {
    const options = {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer'
    };
    if (headers)
        options.headers = headers;
    return fetch(url, options)
        .then(afterFetch);
}
exports.getData = getData;
function postData(url, data = {}, contentType = 'application/json') {
    return fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: { "Content-Type": contentType },
        body: contentType == 'application/json' ? JSON.stringify(data) : data
    })
        .then(afterFetch);
}
exports.postData = postData;
function putData(url, data = {}, contentType = 'application/json') {
    return fetch(url, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: { "Content-Type": contentType },
        body: contentType == 'application/json' ? JSON.stringify(data) : data
    })
        .then(afterFetch);
}
exports.putData = putData;
function deleteData(url, data = {}, contentType = 'application/json') {
    return fetch(url, {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers: { "Content-Type": contentType },
        body: contentType == 'application/json' ? JSON.stringify(data) : data
    })
        .then(afterFetch);
}
exports.deleteData = deleteData;
//# sourceMappingURL=network.js.map

/***/ }),

/***/ "./public/rest.js":
/*!************************!*\
  !*** ./public/rest.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const Network = __webpack_require__(/*! ./network */ "./public/network.js");
exports.HEXA_BACKUP_BASE_URL = window.location.hostname == "home.lteconsulting.fr" ? "https://home.lteconsulting.fr" : "https://localhost:5005";
async function search(searchText, mimeType) {
    try {
        let searchSpec = {
            name: searchText,
            mimeType: mimeType
        };
        const { resultDirectories, resultFilesddd, items } = await Network.postData(`${exports.HEXA_BACKUP_BASE_URL}/search`, searchSpec);
        return {
            directories: resultDirectories,
            files: resultFilesddd,
            items
        };
    }
    catch (err) {
        return null;
    }
}
exports.search = search;
async function getDirectoryDescriptor(sha) {
    return await Network.getData(`${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=application/json`);
}
exports.getDirectoryDescriptor = getDirectoryDescriptor;
async function getReferences() {
    return await Network.getData(`${exports.HEXA_BACKUP_BASE_URL}/refs`);
}
exports.getReferences = getReferences;
async function getReference(name) {
    return await Network.getData(`${exports.HEXA_BACKUP_BASE_URL}/refs/${name}`);
}
exports.getReference = getReference;
async function getCommit(sha) {
    return await Network.getData(`${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=application/json`);
}
exports.getCommit = getCommit;
function getShaContentUrl(sha, mimeType, name, isDownload) {
    if (!sha)
        return '#';
    let base = `${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${encodeURIComponent(mimeType)}`;
    if (isDownload)
        base += `&fileName=${encodeURIComponent(name || sha)}`;
    return base;
}
exports.getShaContentUrl = getShaContentUrl;
async function putItemToPlaylist(playlistName, sha, mimeType, name) {
    let payload = {
        items: [
            {
                name,
                date: Date.now(),
                isDirectory: mimeType == 'application/directory',
                mimeType,
                sha
            }
        ]
    };
    return await Network.putData(`${exports.HEXA_BACKUP_BASE_URL}/plugins/playlists/${playlistName}`, payload);
}
exports.putItemToPlaylist = putItemToPlaylist;
//# sourceMappingURL=rest.js.map

/***/ }),

/***/ "./public/search-panel.js":
/*!********************************!*\
  !*** ./public/search-panel.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1 x-id="title" class="animated--quick">Raccoon</h1>
        <h4 x-id="subTitle">Search for songs</h4>
        <form x-id="form" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield">
                <input x-id="term" type="text" style="text-align: center;" autofocus>
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br />
    </div>
</div>`;
exports.searchPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    displayTitle: (template, displayed) => {
        if (displayed) {
            template.title.classList.remove('hexa--reduced');
            template.subTitle.style.display = undefined;
        }
        else {
            template.title.classList.add('hexa--reduced');
            template.subTitle.style.display = 'none';
        }
    }
};
//# sourceMappingURL=search-panel.js.map

/***/ }),

/***/ "./public/search-result-panel.js":
/*!***************************************!*\
  !*** ./public/search-result-panel.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Snippets = __webpack_require__(/*! ./html-snippets */ "./public/html-snippets.js");
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items" class="mui-panel" style="display: inline-block;"></div>
    </div>
</div>`;
exports.searchResultPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    displaySearching: (elements, term) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`;
        elements.items.innerHTML = ``;
    },
    setValues: (elements, values) => {
        elements.title.innerHTML = `Results for '${values.term}'`;
        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('');
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
        }
    },
};
//# sourceMappingURL=search-result-panel.js.map

/***/ }),

/***/ "./public/templates.js":
/*!*****************************!*\
  !*** ./public/templates.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const UiTools = __webpack_require__(/*! ./ui-tool */ "./public/ui-tool.js");
const elementsData = new WeakMap();
function createElementAndLocateChildren(obj, html) {
    let root = UiTools.elFromHtml(html);
    obj['root'] = root;
    UiTools.els(root, `[x-id]`).forEach(e => obj[e.getAttribute('x-id')] = e);
    if (root.hasAttribute('x-id'))
        obj[root.getAttribute('x-id')] = root;
    elementsData.set(root, obj);
    return root;
}
exports.createElementAndLocateChildren = createElementAndLocateChildren;
function getTemplateInstanceData(root) {
    const data = elementsData.get(root);
    return data;
}
exports.getTemplateInstanceData = getTemplateInstanceData;
function createTemplateInstance(html) {
    let root = createElementAndLocateChildren({}, html);
    return getTemplateInstanceData(root);
}
exports.createTemplateInstance = createTemplateInstance;
const EMPTY_LOCATION = { element: null, childIndex: -1 };
function templateGetEventLocation(elements, event) {
    let els = new Set(Object.values(elements));
    let c = event.target;
    let p = null;
    do {
        if (els.has(c)) {
            return {
                element: c,
                childIndex: p && Array.prototype.indexOf.call(c.children, p)
            };
        }
        if (c == elements.root)
            return EMPTY_LOCATION;
        p = c;
        c = c.parentElement;
    } while (c);
    return EMPTY_LOCATION;
}
exports.templateGetEventLocation = templateGetEventLocation;
//# sourceMappingURL=templates.js.map

/***/ }),

/***/ "./public/ui-tool.js":
/*!***************************!*\
  !*** ./public/ui-tool.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
function el(id) {
    return document.getElementById(id);
}
exports.el = el;
function els(element, selector) {
    return element.querySelectorAll(selector);
}
exports.els = els;
function elFromHtml(html) {
    const parent = document.createElement('div');
    parent.innerHTML = html;
    return parent.children.item(0);
}
exports.elFromHtml = elFromHtml;
function stopEvent(event) {
    event.preventDefault();
    event.stopPropagation();
}
exports.stopEvent = stopEvent;
function* iter_path_to_root_element(start) {
    while (start) {
        yield start;
        start = start.parentElement;
    }
}
exports.iter_path_to_root_element = iter_path_to_root_element;
//# sourceMappingURL=ui-tool.js.map

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2h0bWwtc25pcHBldHMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZGV4LmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9tZXNzYWdlcy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbWltZS10eXBlcy1tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL25ldHdvcmsuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3Jlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3NlYXJjaC1wYW5lbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXJlc3VsdC1wYW5lbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdGVtcGxhdGVzLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy91aS10b29sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Qzs7Ozs7Ozs7Ozs7O0FDaENBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RCxvQkFBb0IsbUJBQU8sQ0FBQywwQ0FBYTtBQUN6QyxpQkFBaUIsbUJBQU8sQ0FBQyxrREFBaUI7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUU7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtGQUFrRixLQUFLO0FBQ3ZGO0FBQ0EsS0FBSztBQUNMO0FBQ0EsbURBQW1ELFlBQVk7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsK0M7Ozs7Ozs7Ozs7OztBQzNCQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsZ0JBQWdCLG1CQUFPLENBQUMsc0NBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHFDOzs7Ozs7Ozs7Ozs7QUM1Q0EsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3B1YmxpYy9pbmRleC5qc1wiKTtcbiIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgTWltZVR5cGVzID0gcmVxdWlyZShcIi4vbWltZS10eXBlcy1tb2R1bGVcIik7XG5jb25zdCBNZXNzYWdlcyA9IHJlcXVpcmUoXCIuL21lc3NhZ2VzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz1cImF1ZGlvLWZvb3RlciBtdWktcGFuZWxcIj5cbiAgICA8aDMgY2xhc3M9XCJ4LXdoZW4tbGFyZ2UtZGlzcGxheVwiPlBsYXlsaXN0PC9oMz5cbiAgICA8ZGl2IHgtaWQ9XCJwbGF5bGlzdFwiPjwvZGl2PlxuICAgIDxkaXYgeC1pZD1cImV4cGFuZGVyXCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1jZW50ZXJcIj7imLA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwieC1ob3Jpem9udGFsLWZsZXhcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCI+XG4gICAgICAgIDxhdWRpbyB4LWlkPVwicGxheWVyXCIgY2xhc3M9XCJhdWRpby1wbGF5ZXJcIiBjb250cm9scyBwcmVsb2FkPVwibWV0YWRhdGFcIj48L2F1ZGlvPlxuICAgICAgICA8YSB4LWlkPVwiYWRkUGxheWxpc3RCdXR0b25cIiBocmVmPVwiI3RvdG9cIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmFiXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmY0MDgxNzM7IGNvbG9yOiB3aGl0ZTtcIj4rIFBMLjwvYT48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIGAke1Jlc3QuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPSR7bWltZVR5cGV9YCk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBtaW1lVHlwZSk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5wbGF5KCk7XG4gICAgICAgIGVsZW1lbnRzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShcImlzLWhpZGRlblwiKTtcbiAgICB9LFxufTtcbmNsYXNzIEF1ZGlvSnVrZWJveCB7XG4gICAgY29uc3RydWN0b3IoYXVkaW9QYW5lbCkge1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwgPSBhdWRpb1BhbmVsO1xuICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIC8vIGlmIHNjcm9sbCB0byBwbGF5aW5nIGl0ZW0gaXMgcmVxdWlyZWQgYWZ0ZXIgYSBwbGF5bGlzdCByZWRyYXdcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBxdWV1ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcpKTtcbiAgICAgICAgICAgIGlmIChxdWV1ZSAmJiBxdWV1ZSBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBlcnJvciBsb2FkaW5nIHF1ZXVlIGZyb20gbG9jYWwgc3RvcmFnZWAsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzID0gVWlUb29scy5lbHModGhpcy5hdWRpb1BhbmVsLnJvb3QsICcueC13aGVuLWxhcmdlLWRpc3BsYXknKTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgYXVkaW8gcGxheWVyIGVycm9yYCk7XG4gICAgICAgICAgICB0aGlzLnBsYXlOZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3N0YWxsZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3RhbGxlZCwgdHJ5IG5leHQnKTtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5leHBhbmRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gIXRoaXMubGFyZ2VEaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgVWlUb29scy5pdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleEF0dHIgPSBlLmdldEF0dHJpYnV0ZSgneC1xdWV1ZS1pbmRleCcpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXhBdHRyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbmRleEF0dHIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IE5hTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyBlbGVtZW50LCBjaGlsZEluZGV4IH0gPSB0ZW1wbGF0ZXNfMS50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24odGhpcy5hdWRpb1BhbmVsLCBldmVudCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCA9PSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QgJiYgY2hpbGRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QucXVlcnlTZWxlY3RvcihgW3gtaWQ9J2NsZWFyLXBsYXlsaXN0J11gKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IFtjdXJyZW50SXRlbV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5hZGRQbGF5bGlzdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChldmVudCkgPT4ge1xuICAgICAgICAgICAgVWlUb29scy5zdG9wRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgY29uc3QgcGxheWxpc3QgPSAnZmF2b3JpdGVzJzsgLy8gdG9kbyBzaG91bGQgYmUgYSBwYXJhbWV0ZXIuLi5cbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYENhbm5vdCBhZGQgdG8gcGxheWxpc3QsIG5vdGhpbmcgcGxheWluZ2AsIC0xKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXh0ZW5zaW9uID0gTWltZVR5cGVzLmV4dGVuc2lvbkZyb21NaW1lVHlwZShpdGVtLm1pbWVUeXBlKTtcbiAgICAgICAgICAgIGF3YWl0IFJlc3QucHV0SXRlbVRvUGxheWxpc3QocGxheWxpc3QsIGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlLCBgJHtpdGVtLm5hbWV9LiR7ZXh0ZW5zaW9ufWApO1xuICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYPCfkY0gJHtpdGVtLm5hbWV9IGFkZGVkIHRvIHBsYXlsaXN0ICcke3BsYXlsaXN0fSdgLCAxKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgfVxuICAgIGN1cnJlbnRJdGVtKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCAwIHx8IHRoaXMuY3VycmVudEluZGV4ID49IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4XTtcbiAgICB9XG4gICAgYWRkQW5kUGxheShpdGVtKSB7XG4gICAgICAgIGl0ZW0gPSB7XG4gICAgICAgICAgICBzaGE6IGl0ZW0uc2hhLFxuICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgbWltZVR5cGU6IGl0ZW0ubWltZVR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICBpZiAoY3VycmVudEl0ZW0gJiYgY3VycmVudEl0ZW0uc2hhID09IGl0ZW0uc2hhKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgfVxuICAgIHBsYXlOZXh0KCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggKyAxIDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucGxheSh0aGlzLmN1cnJlbnRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGxheU5leHRVbnJvbGxlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXRlbVVucm9sbGVyKSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbVVucm9sbGVyLnVucm9sbCgpO1xuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXRlbVVucm9sbGVyLmhhc05leHQoKSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaFF1ZXVlQW5kUGxheShpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHNldEl0ZW1VbnJvbGxlcihpdGVtVW5yb2xsZXIpIHtcbiAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBpdGVtVW5yb2xsZXI7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgfVxuICAgIHB1c2hRdWV1ZUFuZFBsYXkoaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0ubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IHRydWU7XG4gICAgICAgIHRoaXMucXVldWUucHVzaChpdGVtKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcsIEpTT04uc3RyaW5naWZ5KHRoaXMucXVldWUpKTtcbiAgICAgICAgdGhpcy5wbGF5KHRoaXMucXVldWUubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIHBsYXkoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnF1ZXVlW2luZGV4XTtcbiAgICAgICAgICAgIGV4cG9ydHMuYXVkaW9QYW5lbC5wbGF5KHRoaXMuYXVkaW9QYW5lbCwgaXRlbS5uYW1lLCBpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbeC1mb3Itc2hhPScke2l0ZW0uc2hhLnN1YnN0cigwLCA1KX0nXWApLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLXdlaWdodGVkJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZnJlc2hQbGF5bGlzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVmcmVzaFRpbWVyKVxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVmcmVzaFRpbWVyKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVhbFJlZnJlc2hQbGF5bGlzdCgpLCAxMCk7XG4gICAgfVxuICAgIHJlYWxSZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICghdGhpcy5xdWV1ZSB8fCAhdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSlcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwibXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5XCI+VGhlcmUgYXJlIG5vIGl0ZW1zIGluIHlvdXIgcGxheWxpc3QuIENsaWNrIG9uIHNvbmdzIHRvIHBsYXkgdGhlbS48L3NwYW4+JztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGh0bWwgPSBgYDtcbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5KSB7XG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaGlkZGVuJykpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLnF1ZXVlW2ldO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5wbGF5bGlzdEl0ZW1IdG1sKGksIGl0ZW0ubmFtZSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaXRlbVVucm9sbGVyICYmIHRoaXMuaXRlbVVucm9sbGVyLmhhc05leHQoKSlcbiAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5xdWV1ZS5sZW5ndGh9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeSBpcy1vbmVsaW5ldGV4dFwiPiR7dGhpcy5pdGVtVW5yb2xsZXIubmFtZSgpfTwvZGl2PmA7XG4gICAgICAgICAgICBodG1sICs9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5XCI+PGEgeC1pZD0nY2xlYXItcGxheWxpc3QnIGhyZWY9JyMnPmNsZWFyIHBsYXlsaXN0PC9hPjwvZGl2PmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LmFkZCgnaXMtaGlkZGVuJykpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID49IDAgJiYgdGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5wbGF5bGlzdEl0ZW1IdG1sKHRoaXMuY3VycmVudEluZGV4LCB0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4XS5uYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMuY3VycmVudEluZGV4ICsgMX1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+Zm9sbG93ZWQgYnkgJyR7dGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleCArIDFdLm5hbWUuc3Vic3RyKDAsIDIwKX0nIC4uLjwvZGl2PmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXRlbVVucm9sbGVyICYmIHRoaXMuaXRlbVVucm9sbGVyLmhhc05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5xdWV1ZS5sZW5ndGh9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeSBpcy1vbmVsaW5ldGV4dFwiPiR7dGhpcy5pdGVtVW5yb2xsZXIubmFtZSgpfTwvZGl2PmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAvLyBhZnRlciByZWZyZXNoIHN0ZXBzXG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSAmJiB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbFRvcCA9IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGxheWxpc3RJdGVtSHRtbChpbmRleCwgbmFtZSwgb25lTGluZVRleHQpIHtcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtcXVldWUtaW5kZXg9XCIke2luZGV4fVwiIGNsYXNzPVwib25jbGljayAke29uZUxpbmVUZXh0ID8gJ2lzLW9uZWxpbmV0ZXh0JyA6ICcnfSAke2luZGV4ID09IHRoaXMuY3VycmVudEluZGV4ID8gJ211aS0tdGV4dC1oZWFkbGluZScgOiAnJ31cIj4ke25hbWV9PC9kaXY+YDtcbiAgICB9XG59XG5leHBvcnRzLkF1ZGlvSnVrZWJveCA9IEF1ZGlvSnVrZWJveDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1ZGlvLXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5mdW5jdGlvbiB3YWl0KGR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbikpO1xufVxubGV0IGF1dGhlbnRpY2F0ZWRVc2VyID0gbnVsbDtcbmNsYXNzIEF1dGgge1xuICAgIG9uRXJyb3IoKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gICAgYXN5bmMgbG9vcCgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvYXV0aGApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL3NldENvb2tpZWAsIHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cmVzcG9uc2UudG9rZW59YCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXMgfHwgIXJlcy5saWZldGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHNldENvb2tpZWAsIHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGVkVXNlciA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9tZWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IG9idGFpbiBhdXRoIHRva2VuYCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3QgcmVmcmVzaCBhdXRoICgke2Vycn0pYCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBldmVyeSAzMCBtaW51dGVzXG4gICAgICAgICAgICBhd2FpdCB3YWl0KDEwMDAgKiA2MCAqIDMwKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGF1dG9SZW5ld0F1dGgoKSB7XG4gICAgbGV0IGF1dGggPSBuZXcgQXV0aCgpO1xuICAgIGF1dGgubG9vcCgpO1xufVxuZXhwb3J0cy5hdXRvUmVuZXdBdXRoID0gYXV0b1JlbmV3QXV0aDtcbmZ1bmN0aW9uIG1lKCkge1xuICAgIHJldHVybiBhdXRoZW50aWNhdGVkVXNlcjtcbn1cbmV4cG9ydHMubWUgPSBtZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1dGguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFNuaXBwZXRzID0gcmVxdWlyZShcIi4vaHRtbC1zbmlwcGV0c1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXInPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMiB4LWlkPVwidGl0bGVcIj48L2gyPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJpdGVtc1wiIGNsYXNzPVwibXVpLXBhbmVsXCIgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5kaXJlY3RvcnlQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBzZXRMb2FkaW5nOiAoZWxlbWVudHMsIHRpdGxlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGBMb2FkaW5nICcke3RpdGxlfScgLi4uYDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYGA7XG4gICAgfSxcbiAgICBzZXRWYWx1ZXM6IChlbGVtZW50cywgdmFsdWVzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGAke3ZhbHVlcy5uYW1lfWA7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChTbmlwcGV0cy5pdGVtVG9IdG1sKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RvcnktcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmZ1bmN0aW9uIGl0ZW1Ub0h0bWwoZikge1xuICAgIGlmIChmLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKVxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJvbmNsaWNrXCI+PGk+JHtmLm5hbWV9IC4uLjwvaT48L2Rpdj5gO1xuICAgIGVsc2UgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3JlZmVyZW5jZScpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcGxheWxpc3QnKVxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJvbmNsaWNrXCI+PGk+JHtmLm5hbWV9IC4uLjwvaT48L2Rpdj5gO1xuICAgIGVsc2UgaWYgKGYubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpXG4gICAgICAgIHJldHVybiBgPGRpdiB4LWZvci1zaGE9XCIke2Yuc2hhICYmIGYuc2hhLnN1YnN0cigwLCA1KX1cIiBjbGFzcz1cIm9uY2xpY2tcIj4ke2YubmFtZX08L2Rpdj5gO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEgJiYgZi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPjxhIGhyZWY9XCIke1Jlc3QuZ2V0U2hhQ29udGVudFVybChmLnNoYSwgZi5taW1lVHlwZSwgZi5uYW1lLCBmYWxzZSl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHtmLm5hbWV9PC9hPiA8YSBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiIGhyZWY9XCIke1Jlc3QuZ2V0U2hhQ29udGVudFVybChmLnNoYSwgZi5taW1lVHlwZSwgZi5uYW1lLCB0cnVlKX1cIj5kbDwvYT48L2Rpdj5gO1xufVxuZXhwb3J0cy5pdGVtVG9IdG1sID0gaXRlbVRvSHRtbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bWwtc25pcHBldHMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2wgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgU2VhcmNoUGFuZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtcGFuZWxcIik7XG5jb25zdCBTZWFyY2hSZXN1bHRQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1yZXN1bHQtcGFuZWxcIik7XG5jb25zdCBBdWRpb1BhbmVsID0gcmVxdWlyZShcIi4vYXVkaW8tcGFuZWxcIik7XG5jb25zdCBEaXJlY3RvcnlQYW5lbCA9IHJlcXVpcmUoXCIuL2RpcmVjdG9yeS1wYW5lbFwiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgQXV0aCA9IHJlcXVpcmUoXCIuL2F1dGhcIik7XG5jb25zdCBUZW1wbGF0ZXMgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBNaW1lVHlwZXMgPSByZXF1aXJlKFwiLi9taW1lLXR5cGVzLW1vZHVsZVwiKTtcbi8qXG5oYXNoIHVybHMgOlxuXG4tICcnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob21lXG4tICcjLycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob21lXG4tICcjJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob21lXG4tICcjL3NlYXJjaC86dGVybSAgICAgICAgICAgICAgICAgICBzZWFyY2hcbi0gJyMvZGlyZWN0b3JpZXMvOnNoYT9uYW1lPXh4eCAgICAgIGRpcmVjdG9yeVxuLSAnIy9icm93c2UnXG4tICcjL3JlZnMvOm5hbWUnXG4qL1xuZnVuY3Rpb24gcGFyc2VVUkwodXJsKSB7XG4gICAgdmFyIHBhcnNlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKSwgc2VhcmNoT2JqZWN0ID0ge30sIHF1ZXJpZXMsIHNwbGl0LCBpO1xuICAgIC8vIExldCB0aGUgYnJvd3NlciBkbyB0aGUgd29ya1xuICAgIHBhcnNlci5ocmVmID0gdXJsO1xuICAgIC8vIENvbnZlcnQgcXVlcnkgc3RyaW5nIHRvIG9iamVjdFxuICAgIHF1ZXJpZXMgPSBwYXJzZXIuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykuc3BsaXQoJyYnKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgcXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzcGxpdCA9IHF1ZXJpZXNbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgc2VhcmNoT2JqZWN0W3NwbGl0WzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChzcGxpdFsxXSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHBhdGhuYW1lOiBkZWNvZGVVUklDb21wb25lbnQocGFyc2VyLnBhdGhuYW1lKSxcbiAgICAgICAgc2VhcmNoT2JqZWN0OiBzZWFyY2hPYmplY3RcbiAgICB9O1xufVxuZnVuY3Rpb24gcmVhZEhhc2hBbmRBY3QoKSB7XG4gICAgbGV0IGhhc2ggPSAnJztcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggJiYgd2luZG93LmxvY2F0aW9uLmhhc2guc3RhcnRzV2l0aCgnIycpKVxuICAgICAgICBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xuICAgIGxldCBwYXJzZWQgPSBwYXJzZVVSTChoYXNoKTtcbiAgICBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9zZWFyY2gvJykpIHtcbiAgICAgICAgc2VhcmNoSXRlbXMocGFyc2VkLnBhdGhuYW1lLnN1YnN0cignL3NlYXJjaC8nLmxlbmd0aCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL2RpcmVjdG9yaWVzLycpKSB7XG4gICAgICAgIGNvbnN0IHNoYSA9IHBhcnNlZC5wYXRobmFtZS5zdWJzdHJpbmcoJy9kaXJlY3Rvcmllcy8nLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWQuc2VhcmNoT2JqZWN0Lm5hbWUgfHwgc2hhO1xuICAgICAgICBsb2FkRGlyZWN0b3J5KHtcbiAgICAgICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JyxcbiAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgICAgICBzaGEsXG4gICAgICAgICAgICBuYW1lXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUgPT0gJy9icm93c2UnKSB7XG4gICAgICAgIGxvYWRSZWZlcmVuY2VzKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvcmVmcy8nKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyc2VkLnBhdGhuYW1lLnN1YnN0cmluZygnL3JlZnMvJy5sZW5ndGgpO1xuICAgICAgICBsb2FkUmVmZXJlbmNlKG5hbWUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUgPT0gJy9wbGF5bGlzdHMnKSB7XG4gICAgICAgIGxvYWRQbGF5bGlzdHMoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9wbGF5bGlzdHMvJykpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnNlZC5wYXRobmFtZS5zdWJzdHJpbmcoJy9wbGF5bGlzdHMvJy5sZW5ndGgpO1xuICAgICAgICBsb2FkUGxheWxpc3QobmFtZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgdW5rb3duIHBhdGggJHtwYXJzZWQucGF0aG5hbWV9YCk7XG4gICAgfVxufVxuY29uc3Qgc2VhcmNoUGFuZWwgPSBTZWFyY2hQYW5lbC5zZWFyY2hQYW5lbC5jcmVhdGUoKTtcbmNvbnN0IHNlYXJjaFJlc3VsdFBhbmVsID0gU2VhcmNoUmVzdWx0UGFuZWwuc2VhcmNoUmVzdWx0UGFuZWwuY3JlYXRlKCk7XG5jb25zdCBhdWRpb1BhbmVsID0gQXVkaW9QYW5lbC5hdWRpb1BhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9KdWtlYm94ID0gbmV3IEF1ZGlvUGFuZWwuQXVkaW9KdWtlYm94KGF1ZGlvUGFuZWwpO1xuY29uc3QgZGlyZWN0b3J5UGFuZWwgPSBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5jcmVhdGUoKTtcbmxldCBhY3R1YWxDb250ZW50ID0gbnVsbDtcbmZ1bmN0aW9uIHNldENvbnRlbnQoY29udGVudCkge1xuICAgIGlmIChjb250ZW50ID09PSBhY3R1YWxDb250ZW50KVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudCAmJiBhY3R1YWxDb250ZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYWN0dWFsQ29udGVudCk7XG4gICAgYWN0dWFsQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIFVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKGNvbnRlbnQsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbn1cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW9QYW5lbC5yb290KTtcblVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKHNlYXJjaFBhbmVsLnJvb3QsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbkF1dGguYXV0b1JlbmV3QXV0aCgpO1xuLyoqXG4gKiBXYWl0ZXIgdG9vbFxuICovXG5jb25zdCBiZWdpbldhaXQgPSAoY2FsbGJhY2spID0+IHtcbiAgICBsZXQgaXNEb25lID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCgoKSA9PiBpc0RvbmUgfHwgY2FsbGJhY2soKSwgNTAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgICAgICBpc0RvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4vKipcbiAqIEV2ZW50c1xuICovXG5sZXQgbGFzdERpc3BsYXllZEZpbGVzID0gbnVsbDtcbmxldCBsYXN0U2VhcmNoVGVybSA9IG51bGw7IC8vIEhBQ0sgdmVyeSB0ZW1wb3JhcnlcbmZ1bmN0aW9uIGJlYXV0aWZ5TmFtZXMoaXRlbXMpIHtcbiAgICByZXR1cm4gaXRlbXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBpZiAoZmlsZS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICAgICAgbGV0IGRvdCA9IGZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICAgICAgaWYgKGRvdClcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUuc3Vic3RyaW5nKDAsIGRvdCk7XG4gICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvJ18nL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvJyAgJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1sgXSotWyBdKi9nLCAnIC0gJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBnb1NlYXJjaEl0ZW1zKHRlcm0pIHtcbiAgICBjb25zdCB1cmwgPSBgIy9zZWFyY2gvJHt0ZXJtfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5hc3luYyBmdW5jdGlvbiBzZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuZGlzcGxheVRpdGxlKHNlYXJjaFBhbmVsLCBmYWxzZSk7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLmRpc3BsYXlTZWFyY2hpbmcoc2VhcmNoUmVzdWx0UGFuZWwsIHRlcm0pO1xuICAgIH0pO1xuICAgIGxldCByZXMgPSBhd2FpdCBSZXN0LnNlYXJjaCh0ZXJtLCAnYXVkaW8vJScpO1xuICAgIC8vIGZpcnN0IGZpbGVzIHRoZW4gZGlyZWN0b3JpZXNcbiAgICByZXMuaXRlbXMgPSByZXMuaXRlbXMuZmlsdGVyKGkgPT4gIWkubWltZVR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vZGlyZWN0b3J5JykpLmNvbmNhdChyZXMuaXRlbXMuZmlsdGVyKGkgPT4gaS5taW1lVHlwZS5zdGFydHNXaXRoKCdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSkpO1xuICAgIHJlcy5pdGVtcyA9IGJlYXV0aWZ5TmFtZXMocmVzLml0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgU2VhcmNoUmVzdWx0UGFuZWwuc2VhcmNoUmVzdWx0UGFuZWwuc2V0VmFsdWVzKHNlYXJjaFJlc3VsdFBhbmVsLCB7XG4gICAgICAgIHRlcm06IHRlcm0sXG4gICAgICAgIGl0ZW1zOiByZXMuaXRlbXNcbiAgICB9KTtcbn1cbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGxldCB0ZXJtID0gc2VhcmNoUGFuZWwudGVybS52YWx1ZTtcbiAgICBzZWFyY2hQYW5lbC50ZXJtLmJsdXIoKTtcbiAgICBnb1NlYXJjaEl0ZW1zKHRlcm0pO1xufSk7XG5mdW5jdGlvbiBnZXRNaW1lVHlwZShmKSB7XG4gICAgaWYgKGYuaXNEaXJlY3RvcnkpXG4gICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JztcbiAgICBsZXQgcG9zID0gZi5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIGxldCBleHRlbnNpb24gPSBmLm5hbWUuc3Vic3RyKHBvcyArIDEpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChleHRlbnNpb24gaW4gTWltZVR5cGVzLk1pbWVUeXBlcylcbiAgICAgICAgICAgIHJldHVybiBNaW1lVHlwZXMuTWltZVR5cGVzW2V4dGVuc2lvbl07XG4gICAgfVxuICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbn1cbmZ1bmN0aW9uIGRpcmVjdG9yeURlc2NyaXB0b3JUb0ZpbGVEZXNjcmlwdG9yKGQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaGE6IGQuY29udGVudFNoYSxcbiAgICAgICAgbmFtZTogZC5uYW1lLFxuICAgICAgICBtaW1lVHlwZTogZ2V0TWltZVR5cGUoZCksXG4gICAgICAgIGxhc3RXcml0ZTogZC5sYXN0V3JpdGUsXG4gICAgICAgIHNpemU6IGQuc2l6ZVxuICAgIH07XG59XG5mdW5jdGlvbiBnb0xvYWREaXJlY3Rvcnkoc2hhLCBuYW1lKSB7XG4gICAgY29uc3QgdXJsID0gYCMvZGlyZWN0b3JpZXMvJHtzaGF9P25hbWU9JHtlbmNvZGVVUklDb21wb25lbnQobGFzdFNlYXJjaFRlcm0gPyAobGFzdFNlYXJjaFRlcm0gKyAnLycgKyBuYW1lKSA6IG5hbWUpfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5mdW5jdGlvbiBnb1JlZmVyZW5jZShuYW1lKSB7XG4gICAgY29uc3QgdXJsID0gYCMvcmVmcy8ke25hbWV9YDtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbn1cbmZ1bmN0aW9uIGdvUGxheWxpc3QobmFtZSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYCMvcGxheWxpc3RzLyR7bmFtZX1gO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZERpcmVjdG9yeShpdGVtKSB7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIGl0ZW0ubmFtZSk7XG4gICAgfSk7XG4gICAgbGV0IGRpcmVjdG9yeURlc2NyaXB0b3IgPSBhd2FpdCBSZXN0LmdldERpcmVjdG9yeURlc2NyaXB0b3IoaXRlbS5zaGEpO1xuICAgIGxldCBpdGVtcyA9IGRpcmVjdG9yeURlc2NyaXB0b3IuZmlsZXMubWFwKGRpcmVjdG9yeURlc2NyaXB0b3JUb0ZpbGVEZXNjcmlwdG9yKTtcbiAgICBpdGVtcyA9IGJlYXV0aWZ5TmFtZXMoaXRlbXMpO1xuICAgIGxhc3REaXNwbGF5ZWRGaWxlcyA9IGl0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gaXRlbS5uYW1lO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgaXRlbXNcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZWZlcmVuY2VzKCkge1xuICAgIGxldCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgXCJSZWZlcmVuY2VzXCIpO1xuICAgIH0pO1xuICAgIGxldCByZWZlcmVuY2VzID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2VzKCk7XG4gICAgbGV0IGl0ZW1zID0gcmVmZXJlbmNlcy5tYXAocmVmZXJlbmNlID0+ICh7XG4gICAgICAgIG5hbWU6IHJlZmVyZW5jZSxcbiAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL3JlZmVyZW5jZScsXG4gICAgICAgIHNoYTogcmVmZXJlbmNlLFxuICAgICAgICBzaXplOiAwXG4gICAgfSkpO1xuICAgIGxhc3REaXNwbGF5ZWRGaWxlcyA9IGl0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gJyc7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRWYWx1ZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgbmFtZTogXCJSZWZlcmVuY2VzXCIsXG4gICAgICAgIGl0ZW1zXG4gICAgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUGxheWxpc3RzKCkge1xuICAgIGxldCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgXCJQbGF5bGlzdHNcIik7XG4gICAgfSk7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSBhd2FpdCBSZXN0LmdldFJlZmVyZW5jZXMoKTtcbiAgICBsZXQgdXNlciA9IGF3YWl0IEF1dGgubWUoKTtcbiAgICBjb25zdCBwcmVmaXggPSBgUExVR0lOLVBMQVlMSVNUUy0ke3VzZXIudXVpZC50b1VwcGVyQ2FzZSgpfS1gO1xuICAgIGxldCBpdGVtcyA9IHJlZmVyZW5jZXNcbiAgICAgICAgLmZpbHRlcihyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnRvVXBwZXJDYXNlKCkuc3RhcnRzV2l0aChwcmVmaXgpKVxuICAgICAgICAubWFwKHJlZmVyZW5jZSA9PiByZWZlcmVuY2Uuc3Vic3RyKHByZWZpeC5sZW5ndGgpKVxuICAgICAgICAubWFwKHJlZmVyZW5jZSA9PiByZWZlcmVuY2Uuc3Vic3RyKDAsIDEpLnRvVXBwZXJDYXNlKCkgKyByZWZlcmVuY2Uuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgIC5tYXAocmVmZXJlbmNlID0+ICh7XG4gICAgICAgIG5hbWU6IHJlZmVyZW5jZSxcbiAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL3BsYXlsaXN0JyxcbiAgICAgICAgc2hhOiByZWZlcmVuY2UsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KSk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSAnJztcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldFZhbHVlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICBuYW1lOiBcIlBsYXlsaXN0c1wiLFxuICAgICAgICBpdGVtc1xuICAgIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFBsYXlsaXN0KG5hbWUpIHtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgYFBsYXlsaXN0ICcke25hbWV9J2ApO1xuICAgIH0pO1xuICAgIGxldCB1c2VyID0gYXdhaXQgQXV0aC5tZSgpO1xuICAgIGxldCByZWZlcmVuY2UgPSBhd2FpdCBSZXN0LmdldFJlZmVyZW5jZShgUExVR0lOLVBMQVlMSVNUUy0ke3VzZXIudXVpZC50b1VwcGVyQ2FzZSgpfS0ke25hbWUudG9VcHBlckNhc2UoKX1gKTtcbiAgICBsZXQgY29tbWl0ID0gYXdhaXQgUmVzdC5nZXRDb21taXQocmVmZXJlbmNlLmN1cnJlbnRDb21taXRTaGEpO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIGF3YWl0IGxvYWREaXJlY3Rvcnkoe1xuICAgICAgICBzaGE6IGNvbW1pdC5kaXJlY3RvcnlEZXNjcmlwdG9yU2hhLFxuICAgICAgICBuYW1lLFxuICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFJlZmVyZW5jZShuYW1lKSB7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIGBSZWZlcmVuY2UgJyR7bmFtZX0nYCk7XG4gICAgfSk7XG4gICAgbGV0IHJlZmVyZW5jZSA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlKG5hbWUpO1xuICAgIGxldCBjb21taXQgPSBhd2FpdCBSZXN0LmdldENvbW1pdChyZWZlcmVuY2UuY3VycmVudENvbW1pdFNoYSk7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgYXdhaXQgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgIHNoYTogY29tbWl0LmRpcmVjdG9yeURlc2NyaXB0b3JTaGEsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JyxcbiAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICBzaXplOiAwXG4gICAgfSk7XG59XG5mdW5jdGlvbiBpdGVtRGVmYXVsdEFjdGlvbihjaGlsZEluZGV4KSB7XG4gICAgbGV0IGl0ZW0gPSBsYXN0RGlzcGxheWVkRmlsZXNbY2hpbGRJbmRleF07XG4gICAgaWYgKGl0ZW0ubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpIHtcbiAgICAgICAgZ29Mb2FkRGlyZWN0b3J5KGl0ZW0uc2hhLCBpdGVtLm5hbWUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9yZWZlcmVuY2UnKSB7XG4gICAgICAgIGdvUmVmZXJlbmNlKGl0ZW0uc2hhKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcGxheWxpc3QnKSB7XG4gICAgICAgIGdvUGxheWxpc3QoaXRlbS5zaGEpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKSB7XG4gICAgICAgIGF1ZGlvSnVrZWJveC5hZGRBbmRQbGF5KGl0ZW0pO1xuICAgICAgICAvLyBzZXQgYW4gdW5yb2xsZXJcbiAgICAgICAgaWYgKGNoaWxkSW5kZXggPj0gbGFzdERpc3BsYXllZEZpbGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGF1ZGlvSnVrZWJveC5zZXRJdGVtVW5yb2xsZXIobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgdGVybSA9IGxhc3RTZWFyY2hUZXJtO1xuICAgICAgICAgICAgbGV0IHVucm9sbGVkSXRlbXMgPSBsYXN0RGlzcGxheWVkRmlsZXMuc2xpY2UoY2hpbGRJbmRleCArIDEpLmZpbHRlcihmID0+IGYubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpO1xuICAgICAgICAgICAgbGV0IHVucm9sbEluZGV4ID0gMDtcbiAgICAgICAgICAgIGlmICh1bnJvbGxlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGF1ZGlvSnVrZWJveC5zZXRJdGVtVW5yb2xsZXIoe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5yb2xsSW5kZXggPj0gMCAmJiB1bnJvbGxJbmRleCA8IHVucm9sbGVkSXRlbXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgdGhlbiAnJHt1bnJvbGxlZEl0ZW1zW3Vucm9sbEluZGV4XS5uYW1lLnN1YnN0cigwLCAyMCl9JyBhbmQgJHt1bnJvbGxlZEl0ZW1zLmxlbmd0aCAtIHVucm9sbEluZGV4IC0gMX0gb3RoZXIgJyR7dGVybX0nIGl0ZW1zLi4uYDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgZmluaXNoZWQgJyR7dGVybX0gc29uZ3NgO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB1bnJvbGw6ICgpID0+IHVucm9sbGVkSXRlbXNbdW5yb2xsSW5kZXgrK10sXG4gICAgICAgICAgICAgICAgICAgIGhhc05leHQ6ICgpID0+IHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuc2VhcmNoUmVzdWx0UGFuZWwucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChldmVudCkgPT4ge1xuICAgIC8vIHRvZG8gOiBrbm93bmxlZGdlIHRvIGRvIHRoYXQgaXMgaW4gc2VhcmNoUmVzdWx0UGFuZWxcbiAgICBsZXQgeyBlbGVtZW50LCBjaGlsZEluZGV4IH0gPSBUZW1wbGF0ZXMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKHNlYXJjaFJlc3VsdFBhbmVsLCBldmVudCk7XG4gICAgaWYgKGxhc3REaXNwbGF5ZWRGaWxlcyAmJiBlbGVtZW50ID09IHNlYXJjaFJlc3VsdFBhbmVsLml0ZW1zICYmIGNoaWxkSW5kZXggPj0gMCAmJiBjaGlsZEluZGV4IDwgbGFzdERpc3BsYXllZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICBpdGVtRGVmYXVsdEFjdGlvbihjaGlsZEluZGV4KTtcbiAgICB9XG59KTtcbmRpcmVjdG9yeVBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIGRpcmVjdG9yeVBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihkaXJlY3RvcnlQYW5lbCwgZXZlbnQpO1xuICAgIGlmIChsYXN0RGlzcGxheWVkRmlsZXMgJiYgZWxlbWVudCA9PSBkaXJlY3RvcnlQYW5lbC5pdGVtcyAmJiBjaGlsZEluZGV4ID49IDAgJiYgY2hpbGRJbmRleCA8IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCk7XG4gICAgfVxufSk7XG5yZWFkSGFzaEFuZEFjdCgpO1xud2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xuICAgIC8qaWYgKGV2ZW50LnN0YXRlKSB7XG4gICAgICAgIGN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhID0gZXZlbnQuc3RhdGUuY3VycmVudERpcmVjdG9yeURlc2NyaXB0b3JTaGFcbiAgICAgICAgY3VycmVudENsaWVudElkID0gZXZlbnQuc3RhdGUuY3VycmVudENsaWVudElkXG4gICAgICAgIGN1cnJlbnRQaWN0dXJlSW5kZXggPSBldmVudC5zdGF0ZS5jdXJyZW50UGljdHVyZUluZGV4IHx8IDBcbiBcbiAgICAgICAgaWYgKCFjdXJyZW50Q2xpZW50SWQpXG4gICAgICAgICAgICBlbChcIiNtZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRkZW5cIilcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZyb21IYXNoKClcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9Ki9cbn07XG5BdXRoLm1lKCkudGhlbih1c2VyID0+IFVpVG9vbC5lbCgndXNlci1pZCcpLmlubmVyVGV4dCA9IHVzZXIudXVpZCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xubGV0IG1lc3NhZ2VzID0gW107XG5jb25zdCBwb3B1cFRlbXBsYXRlID0gYFxuICAgIDxkaXYgeC1pZD1cIm1lc3NhZ2VzXCI+XG4gICAgPC9kaXY+YDtcbmxldCBwb3B1cCA9IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UocG9wdXBUZW1wbGF0ZSk7XG5mdW5jdGlvbiByZWZyZXNoKCkge1xuICAgIHBvcHVwLm1lc3NhZ2VzLmlubmVySFRNTCA9IG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgbGV0IHN0eWxlID0gJyc7XG4gICAgICAgIGlmIChtZXNzYWdlLmZlZWxpbmcgPiAwKVxuICAgICAgICAgICAgc3R5bGUgPSBgYmFja2dyb3VuZC1jb2xvcjogIzcwY2E4NTsgY29sb3I6IHdoaXRlO2A7XG4gICAgICAgIGVsc2UgaWYgKG1lc3NhZ2UuZmVlbGluZyA8IDApXG4gICAgICAgICAgICBzdHlsZSA9IGBiYWNrZ3JvdW5kLWNvbG9yOiAjRjQ0MzM2OyBjb2xvcjogd2hpdGU7YDtcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwibXVpLXBhbmVsIHgtbWVzc2FnZS1wYW5lbFwiIHN0eWxlPVwiJHtzdHlsZX1cIj4ke21lc3NhZ2UuaHRtbH08L2Rpdj5gO1xuICAgIH0pLmpvaW4oJycpO1xufVxuZnVuY3Rpb24gZGlzcGxheU1lc3NhZ2UoaHRtbCwgZmVlbGluZykge1xuICAgIG1lc3NhZ2VzLnB1c2goe1xuICAgICAgICBodG1sLFxuICAgICAgICBmZWVsaW5nXG4gICAgfSk7XG4gICAgcmVmcmVzaCgpO1xuICAgIGlmICghcG9wdXAucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwb3B1cC5yb290KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbWVzc2FnZXMuc2hpZnQoKTtcbiAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICBpZiAoIW1lc3NhZ2VzLmxlbmd0aClcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocG9wdXAucm9vdCk7XG4gICAgfSwgNDAwMCk7XG59XG5leHBvcnRzLmRpc3BsYXlNZXNzYWdlID0gZGlzcGxheU1lc3NhZ2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXNzYWdlcy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGV4dGVuc2lvbkZyb21NaW1lVHlwZShtaW1lVHlwZSkge1xuICAgIGZvciAobGV0IFtleHRlbnNpb24sIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzLk1pbWVUeXBlcykpIHtcbiAgICAgICAgaWYgKG1pbWVUeXBlID09IHZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIGV4dGVuc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnRzLmV4dGVuc2lvbkZyb21NaW1lVHlwZSA9IGV4dGVuc2lvbkZyb21NaW1lVHlwZTtcbmV4cG9ydHMuTWltZVR5cGVzID0ge1xuICAgIFwiM2RtbFwiOiBcInRleHQvdm5kLmluM2QuM2RtbFwiLFxuICAgIFwiM2RzXCI6IFwiaW1hZ2UveC0zZHNcIixcbiAgICBcIjNnMlwiOiBcInZpZGVvLzNncHAyXCIsXG4gICAgXCIzZ3BcIjogXCJ2aWRlby8zZ3BwXCIsXG4gICAgXCI3elwiOiBcImFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFwiLFxuICAgIFwiYWFiXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwiYWFjXCI6IFwiYXVkaW8veC1hYWNcIixcbiAgICBcImFhbVwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1tYXBcIixcbiAgICBcImFhc1wiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1zZWdcIixcbiAgICBcImFid1wiOiBcImFwcGxpY2F0aW9uL3gtYWJpd29yZFwiLFxuICAgIFwiYWNcIjogXCJhcHBsaWNhdGlvbi9wa2l4LWF0dHItY2VydFwiLFxuICAgIFwiYWNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmFtZXJpY2FuZHluYW1pY3MuYWNjXCIsXG4gICAgXCJhY2VcIjogXCJhcHBsaWNhdGlvbi94LWFjZS1jb21wcmVzc2VkXCIsXG4gICAgXCJhY3VcIjogXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ib2xcIixcbiAgICBcImFjdXRjXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvcnBcIixcbiAgICBcImFkcFwiOiBcImF1ZGlvL2FkcGNtXCIsXG4gICAgXCJhZXBcIjogXCJhcHBsaWNhdGlvbi92bmQuYXVkaW9ncmFwaFwiLFxuICAgIFwiYWZtXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJhZnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFwiLFxuICAgIFwiYWhlYWRcIjogXCJhcHBsaWNhdGlvbi92bmQuYWhlYWQuc3BhY2VcIixcbiAgICBcImFpXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwiYWlmXCI6IFwiYXVkaW8veC1haWZmXCIsXG4gICAgXCJhaWZjXCI6IFwiYXVkaW8veC1haWZmXCIsXG4gICAgXCJhaWZmXCI6IFwiYXVkaW8veC1haWZmXCIsXG4gICAgXCJhaXJcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWlyLWFwcGxpY2F0aW9uLWluc3RhbGxlci1wYWNrYWdlK3ppcFwiLFxuICAgIFwiYWl0XCI6IFwiYXBwbGljYXRpb24vdm5kLmR2Yi5haXRcIixcbiAgICBcImFtaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWlnYS5hbWlcIixcbiAgICBcImFwZVwiOiBcImF1ZGlvL2FwZVwiLFxuICAgIFwiYXBrXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuZHJvaWQucGFja2FnZS1hcmNoaXZlXCIsXG4gICAgXCJhcHBjYWNoZVwiOiBcInRleHQvY2FjaGUtbWFuaWZlc3RcIixcbiAgICBcImFwcGxpY2F0aW9uXCI6IFwiYXBwbGljYXRpb24veC1tcy1hcHBsaWNhdGlvblwiLFxuICAgIFwiYXByXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLWFwcHJvYWNoXCIsXG4gICAgXCJhcmNcIjogXCJhcHBsaWNhdGlvbi94LWZyZWVhcmNcIixcbiAgICBcImFzYVwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzYXhcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImFzY1wiOiBcImFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcIixcbiAgICBcImFzY3hcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc2ZcIjogXCJ2aWRlby94LW1zLWFzZlwiLFxuICAgIFwiYXNoeFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzbVwiOiBcInRleHQveC1hc21cIixcbiAgICBcImFzbXhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc29cIjogXCJhcHBsaWNhdGlvbi92bmQuYWNjcGFjLnNpbXBseS5hc29cIixcbiAgICBcImFzcFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzcHhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc3hcIjogXCJ2aWRlby94LW1zLWFzZlwiLFxuICAgIFwiYXRjXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvcnBcIixcbiAgICBcImF0b21cIjogXCJhcHBsaWNhdGlvbi9hdG9tK3htbFwiLFxuICAgIFwiYXRvbWNhdFwiOiBcImFwcGxpY2F0aW9uL2F0b21jYXQreG1sXCIsXG4gICAgXCJhdG9tc3ZjXCI6IFwiYXBwbGljYXRpb24vYXRvbXN2Yyt4bWxcIixcbiAgICBcImF0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbnRpeC5nYW1lLWNvbXBvbmVudFwiLFxuICAgIFwiYXVcIjogXCJhdWRpby9iYXNpY1wiLFxuICAgIFwiYXZpXCI6IFwidmlkZW8veC1tc3ZpZGVvXCIsXG4gICAgXCJhd1wiOiBcImFwcGxpY2F0aW9uL2FwcGxpeHdhcmVcIixcbiAgICBcImF4ZFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImF6ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5hemZcIixcbiAgICBcImF6c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5henNcIixcbiAgICBcImF6d1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWF6b24uZWJvb2tcIixcbiAgICBcImJhdFwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiYmNwaW9cIjogXCJhcHBsaWNhdGlvbi94LWJjcGlvXCIsXG4gICAgXCJiZGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtYmRmXCIsXG4gICAgXCJiZG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3dieG1sXCIsXG4gICAgXCJiZWRcIjogXCJhcHBsaWNhdGlvbi92bmQucmVhbHZuYy5iZWRcIixcbiAgICBcImJoMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzcHJzXCIsXG4gICAgXCJiaW5cIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImJsYlwiOiBcImFwcGxpY2F0aW9uL3gtYmxvcmJcIixcbiAgICBcImJsb3JiXCI6IFwiYXBwbGljYXRpb24veC1ibG9yYlwiLFxuICAgIFwiYm1pXCI6IFwiYXBwbGljYXRpb24vdm5kLmJtaVwiLFxuICAgIFwiYm1wXCI6IFwiaW1hZ2UvYm1wXCIsXG4gICAgXCJib29rXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImJveFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wcmV2aWV3c3lzdGVtcy5ib3hcIixcbiAgICBcImJvelwiOiBcImFwcGxpY2F0aW9uL3gtYnppcDJcIixcbiAgICBcImJwa1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiYnRpZlwiOiBcImltYWdlL3Bycy5idGlmXCIsXG4gICAgXCJielwiOiBcImFwcGxpY2F0aW9uL3gtYnppcFwiLFxuICAgIFwiYnoyXCI6IFwiYXBwbGljYXRpb24veC1iemlwMlwiLFxuICAgIFwiY1wiOiBcInRleHQveC1jXCIsXG4gICAgXCJjMTFhbWNcIjogXCJhcHBsaWNhdGlvbi92bmQuY2x1ZXRydXN0LmNhcnRvbW9iaWxlLWNvbmZpZ1wiLFxuICAgIFwiYzExYW16XCI6IFwiYXBwbGljYXRpb24vdm5kLmNsdWV0cnVzdC5jYXJ0b21vYmlsZS1jb25maWctcGtnXCIsXG4gICAgXCJjNGRcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNHBcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzR1XCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImNhYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1jYWItY29tcHJlc3NlZFwiLFxuICAgIFwiY2FmXCI6IFwiYXVkaW8veC1jYWZcIixcbiAgICBcImNhcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIixcbiAgICBcImNhclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXJsLmNhclwiLFxuICAgIFwiY2F0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBraS5zZWNjYXRcIixcbiAgICBcImNiN1wiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYmFcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2JyXCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNidFwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnpcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2NcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiY2N0XCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiY2N4bWxcIjogXCJhcHBsaWNhdGlvbi9jY3htbCt4bWxcIixcbiAgICBcImNkYmNtc2dcIjogXCJhcHBsaWNhdGlvbi92bmQuY29udGFjdC5jbXNnXCIsXG4gICAgXCJjZGZcIjogXCJhcHBsaWNhdGlvbi94LW5ldGNkZlwiLFxuICAgIFwiY2RrZXlcIjogXCJhcHBsaWNhdGlvbi92bmQubWVkaWFzdGF0aW9uLmNka2V5XCIsXG4gICAgXCJjZG1pYVwiOiBcImFwcGxpY2F0aW9uL2NkbWktY2FwYWJpbGl0eVwiLFxuICAgIFwiY2RtaWNcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWNvbnRhaW5lclwiLFxuICAgIFwiY2RtaWRcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWRvbWFpblwiLFxuICAgIFwiY2RtaW9cIjogXCJhcHBsaWNhdGlvbi9jZG1pLW9iamVjdFwiLFxuICAgIFwiY2RtaXFcIjogXCJhcHBsaWNhdGlvbi9jZG1pLXF1ZXVlXCIsXG4gICAgXCJjZHhcIjogXCJjaGVtaWNhbC94LWNkeFwiLFxuICAgIFwiY2R4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQuY2hlbWRyYXcreG1sXCIsXG4gICAgXCJjZHlcIjogXCJhcHBsaWNhdGlvbi92bmQuY2luZGVyZWxsYVwiLFxuICAgIFwiY2VyXCI6IFwiYXBwbGljYXRpb24vcGtpeC1jZXJ0XCIsXG4gICAgXCJjZmNcIjogXCJhcHBsaWNhdGlvbi94LWNvbGRmdXNpb25cIixcbiAgICBcImNmbVwiOiBcImFwcGxpY2F0aW9uL3gtY29sZGZ1c2lvblwiLFxuICAgIFwiY2ZzXCI6IFwiYXBwbGljYXRpb24veC1jZnMtY29tcHJlc3NlZFwiLFxuICAgIFwiY2dtXCI6IFwiaW1hZ2UvY2dtXCIsXG4gICAgXCJjaGF0XCI6IFwiYXBwbGljYXRpb24veC1jaGF0XCIsXG4gICAgXCJjaG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtaHRtbGhlbHBcIixcbiAgICBcImNocnRcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtjaGFydFwiLFxuICAgIFwiY2lmXCI6IFwiY2hlbWljYWwveC1jaWZcIixcbiAgICBcImNpaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbnNlci13ZWItY2VydGlmaWNhdGUtaXNzdWUtaW5pdGlhdGlvblwiLFxuICAgIFwiY2lsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWFydGdhbHJ5XCIsXG4gICAgXCJjbGFcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xheW1vcmVcIixcbiAgICBcImNsYXNzXCI6IFwiYXBwbGljYXRpb24vamF2YS12bVwiLFxuICAgIFwiY2xra1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLmtleWJvYXJkXCIsXG4gICAgXCJjbGtwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIucGFsZXR0ZVwiLFxuICAgIFwiY2xrdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLnRlbXBsYXRlXCIsXG4gICAgXCJjbGt3XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIud29yZGJhbmtcIixcbiAgICBcImNsa3hcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlclwiLFxuICAgIFwiY2xwXCI6IFwiYXBwbGljYXRpb24veC1tc2NsaXBcIixcbiAgICBcImNtY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jb3Ntb2NhbGxlclwiLFxuICAgIFwiY21kZlwiOiBcImNoZW1pY2FsL3gtY21kZlwiLFxuICAgIFwiY21sXCI6IFwiY2hlbWljYWwveC1jbWxcIixcbiAgICBcImNtcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55ZWxsb3dyaXZlci1jdXN0b20tbWVudVwiLFxuICAgIFwiY214XCI6IFwiaW1hZ2UveC1jbXhcIixcbiAgICBcImNvZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yaW0uY29kXCIsXG4gICAgXCJjb21cIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImNvbmZcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJjcGlvXCI6IFwiYXBwbGljYXRpb24veC1jcGlvXCIsXG4gICAgXCJjcHBcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiY3B0XCI6IFwiYXBwbGljYXRpb24vbWFjLWNvbXBhY3Rwcm9cIixcbiAgICBcImNyZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNjYXJkZmlsZVwiLFxuICAgIFwiY3JsXCI6IFwiYXBwbGljYXRpb24vcGtpeC1jcmxcIixcbiAgICBcImNydFwiOiBcImFwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0XCIsXG4gICAgXCJjcnhcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImNyeXB0b25vdGVcIjogXCJhcHBsaWNhdGlvbi92bmQucmlnLmNyeXB0b25vdGVcIixcbiAgICBcImNzXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiY3NoXCI6IFwiYXBwbGljYXRpb24veC1jc2hcIixcbiAgICBcImNzbWxcIjogXCJjaGVtaWNhbC94LWNzbWxcIixcbiAgICBcImNzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jb21tb25zcGFjZVwiLFxuICAgIFwiY3NzXCI6IFwidGV4dC9jc3NcIixcbiAgICBcImNzdFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImNzdlwiOiBcInRleHQvY3N2XCIsXG4gICAgXCJjdVwiOiBcImFwcGxpY2F0aW9uL2N1LXNlZW1lXCIsXG4gICAgXCJjdXJsXCI6IFwidGV4dC92bmQuY3VybFwiLFxuICAgIFwiY3d3XCI6IFwiYXBwbGljYXRpb24vcHJzLmN3d1wiLFxuICAgIFwiY3h0XCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiY3h4XCI6IFwidGV4dC94LWNcIixcbiAgICBcImRhZVwiOiBcIm1vZGVsL3ZuZC5jb2xsYWRhK3htbFwiLFxuICAgIFwiZGFmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5kYWZcIixcbiAgICBcImRhcnRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGFydFwiLFxuICAgIFwiZGF0YWxlc3NcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5zZWVkXCIsXG4gICAgXCJkYXZtb3VudFwiOiBcImFwcGxpY2F0aW9uL2Rhdm1vdW50K3htbFwiLFxuICAgIFwiZGJrXCI6IFwiYXBwbGljYXRpb24vZG9jYm9vayt4bWxcIixcbiAgICBcImRjclwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImRjdXJsXCI6IFwidGV4dC92bmQuY3VybC5kY3VybFwiLFxuICAgIFwiZGQyXCI6IFwiYXBwbGljYXRpb24vdm5kLm9tYS5kZDIreG1sXCIsXG4gICAgXCJkZGRcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRkZFwiLFxuICAgIFwiZGViXCI6IFwiYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVwiLFxuICAgIFwiZGVmXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiZGVwbG95XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkZXJcIjogXCJhcHBsaWNhdGlvbi94LXg1MDktY2EtY2VydFwiLFxuICAgIFwiZGZhY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcmVhbWZhY3RvcnlcIixcbiAgICBcImRnY1wiOiBcImFwcGxpY2F0aW9uL3gtZGdjLWNvbXByZXNzZWRcIixcbiAgICBcImRpY1wiOiBcInRleHQveC1jXCIsXG4gICAgXCJkaXJcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJkaXNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLmRpc1wiLFxuICAgIFwiZGlzdFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGlzdHpcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRqdlwiOiBcImltYWdlL3ZuZC5kanZ1XCIsXG4gICAgXCJkanZ1XCI6IFwiaW1hZ2Uvdm5kLmRqdnVcIixcbiAgICBcImRsbFwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiZG1nXCI6IFwiYXBwbGljYXRpb24veC1hcHBsZS1kaXNraW1hZ2VcIixcbiAgICBcImRtcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIixcbiAgICBcImRtc1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZG5hXCI6IFwiYXBwbGljYXRpb24vdm5kLmRuYVwiLFxuICAgIFwiZG9jXCI6IFwiYXBwbGljYXRpb24vbXN3b3JkXCIsXG4gICAgXCJkb2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmQuZG9jdW1lbnQubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJkb2N4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnRcIixcbiAgICBcImRvdFwiOiBcImFwcGxpY2F0aW9uL21zd29yZFwiLFxuICAgIFwiZG90bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwiZG90eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlXCIsXG4gICAgXCJkcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vc2dpLmRwXCIsXG4gICAgXCJkcGdcIjogXCJhcHBsaWNhdGlvbi92bmQuZHBncmFwaFwiLFxuICAgIFwiZHJhXCI6IFwiYXVkaW8vdm5kLmRyYVwiLFxuICAgIFwiZHNjXCI6IFwidGV4dC9wcnMubGluZXMudGFnXCIsXG4gICAgXCJkc3NjXCI6IFwiYXBwbGljYXRpb24vZHNzYytkZXJcIixcbiAgICBcImR0YlwiOiBcImFwcGxpY2F0aW9uL3gtZHRib29rK3htbFwiLFxuICAgIFwiZHRkXCI6IFwiYXBwbGljYXRpb24veG1sLWR0ZFwiLFxuICAgIFwiZHRzXCI6IFwiYXVkaW8vdm5kLmR0c1wiLFxuICAgIFwiZHRzaGRcIjogXCJhdWRpby92bmQuZHRzLmhkXCIsXG4gICAgXCJkdW1wXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkdmJcIjogXCJ2aWRlby92bmQuZHZiLmZpbGVcIixcbiAgICBcImR2aVwiOiBcImFwcGxpY2F0aW9uL3gtZHZpXCIsXG4gICAgXCJkd2ZcIjogXCJtb2RlbC92bmQuZHdmXCIsXG4gICAgXCJkd2dcIjogXCJpbWFnZS92bmQuZHdnXCIsXG4gICAgXCJkeGZcIjogXCJpbWFnZS92bmQuZHhmXCIsXG4gICAgXCJkeHBcIjogXCJhcHBsaWNhdGlvbi92bmQuc3BvdGZpcmUuZHhwXCIsXG4gICAgXCJkeHJcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJlY2VscDQ4MDBcIjogXCJhdWRpby92bmQubnVlcmEuZWNlbHA0ODAwXCIsXG4gICAgXCJlY2VscDc0NzBcIjogXCJhdWRpby92bmQubnVlcmEuZWNlbHA3NDcwXCIsXG4gICAgXCJlY2VscDk2MDBcIjogXCJhdWRpby92bmQubnVlcmEuZWNlbHA5NjAwXCIsXG4gICAgXCJlY21hXCI6IFwiYXBwbGljYXRpb24vZWNtYXNjcmlwdFwiLFxuICAgIFwiZWRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkbVwiLFxuICAgIFwiZWR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkeFwiLFxuICAgIFwiZWZpZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5waWNzZWxcIixcbiAgICBcImVpNlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wZy5vc2FzbGlcIixcbiAgICBcImVsY1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZW1mXCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJlbWxcIjogXCJtZXNzYWdlL3JmYzgyMlwiLFxuICAgIFwiZW1tYVwiOiBcImFwcGxpY2F0aW9uL2VtbWEreG1sXCIsXG4gICAgXCJlbXpcIjogXCJhcHBsaWNhdGlvbi94LW1zbWV0YWZpbGVcIixcbiAgICBcImVvbFwiOiBcImF1ZGlvL3ZuZC5kaWdpdGFsLXdpbmRzXCIsXG4gICAgXCJlb3RcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZm9udG9iamVjdFwiLFxuICAgIFwiZXBzXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwiZXB1YlwiOiBcImFwcGxpY2F0aW9uL2VwdWIremlwXCIsXG4gICAgXCJlczNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXN6aWdubzMreG1sXCIsXG4gICAgXCJlc2FcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnaS5zdWJzeXN0ZW1cIixcbiAgICBcImVzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5lc2ZcIixcbiAgICBcImV0M1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lc3ppZ25vMyt4bWxcIixcbiAgICBcImV0eFwiOiBcInRleHQveC1zZXRleHRcIixcbiAgICBcImV2YVwiOiBcImFwcGxpY2F0aW9uL3gtZXZhXCIsXG4gICAgXCJldnlcIjogXCJhcHBsaWNhdGlvbi94LWVudm95XCIsXG4gICAgXCJleGVcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImV4aVwiOiBcImFwcGxpY2F0aW9uL2V4aVwiLFxuICAgIFwiZXh0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmV4dFwiLFxuICAgIFwiZXpcIjogXCJhcHBsaWNhdGlvbi9hbmRyZXctaW5zZXRcIixcbiAgICBcImV6MlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lenBpeC1hbGJ1bVwiLFxuICAgIFwiZXozXCI6IFwiYXBwbGljYXRpb24vdm5kLmV6cGl4LXBhY2thZ2VcIixcbiAgICBcImZcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZjR2XCI6IFwidmlkZW8veC1mNHZcIixcbiAgICBcImY3N1wiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmOTBcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZmJzXCI6IFwiaW1hZ2Uvdm5kLmZhc3RiaWRzaGVldFwiLFxuICAgIFwiZmNkdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5mb3Jtc2NlbnRyYWwuZmNkdFwiLFxuICAgIFwiZmNzXCI6IFwiYXBwbGljYXRpb24vdm5kLmlzYWMuZmNzXCIsXG4gICAgXCJmZGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRmXCIsXG4gICAgXCJmZV9sYXVuY2hcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVub3ZvLmZjc2VsYXlvdXQtbGlua1wiLFxuICAgIFwiZmc1XCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNncFwiLFxuICAgIFwiZmdkXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZmhcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaDRcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaDVcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaDdcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaGNcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaWdcIjogXCJhcHBsaWNhdGlvbi94LXhmaWdcIixcbiAgICBcImZsYWNcIjogXCJhdWRpby94LWZsYWNcIixcbiAgICBcImZsaVwiOiBcInZpZGVvL3gtZmxpXCIsXG4gICAgXCJmbG9cIjogXCJhcHBsaWNhdGlvbi92bmQubWljcm9ncmFmeC5mbG9cIixcbiAgICBcImZsdlwiOiBcInZpZGVvL3gtZmx2XCIsXG4gICAgXCJmbHdcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtpdmlvXCIsXG4gICAgXCJmbHhcIjogXCJ0ZXh0L3ZuZC5mbWkuZmxleHN0b3JcIixcbiAgICBcImZseVwiOiBcInRleHQvdm5kLmZseVwiLFxuICAgIFwiZm1cIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwiZm5jXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyb2dhbnMuZm5jXCIsXG4gICAgXCJmb3JcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZnB4XCI6IFwiaW1hZ2Uvdm5kLmZweFwiLFxuICAgIFwiZnJhbWVcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwiZnNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmZzYy53ZWJsYXVuY2hcIixcbiAgICBcImZzdFwiOiBcImltYWdlL3ZuZC5mc3RcIixcbiAgICBcImZ0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mbHV4dGltZS5jbGlwXCIsXG4gICAgXCJmdGlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWZ1bmRzLXRyYW5zZmVyLWluaXRpYXRpb25cIixcbiAgICBcImZ2dFwiOiBcInZpZGVvL3ZuZC5mdnRcIixcbiAgICBcImZ4cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5meHBcIixcbiAgICBcImZ4cGxcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZnhwXCIsXG4gICAgXCJmenNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnV6enlzaGVldFwiLFxuICAgIFwiZzJ3XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb3BsYW5cIixcbiAgICBcImczXCI6IFwiaW1hZ2UvZzNmYXhcIixcbiAgICBcImczd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9zcGFjZVwiLFxuICAgIFwiZ2FjXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1hY2NvdW50XCIsXG4gICAgXCJnYW1cIjogXCJhcHBsaWNhdGlvbi94LXRhZHNcIixcbiAgICBcImdiclwiOiBcImFwcGxpY2F0aW9uL3Jwa2ktZ2hvc3RidXN0ZXJzXCIsXG4gICAgXCJnY2FcIjogXCJhcHBsaWNhdGlvbi94LWdjYS1jb21wcmVzc2VkXCIsXG4gICAgXCJnZGxcIjogXCJtb2RlbC92bmQuZ2RsXCIsXG4gICAgXCJnZW9cIjogXCJhcHBsaWNhdGlvbi92bmQuZHluYWdlb1wiLFxuICAgIFwiZ2V4XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb21ldHJ5LWV4cGxvcmVyXCIsXG4gICAgXCJnZ2JcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEuZmlsZVwiLFxuICAgIFwiZ2d0XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLnRvb2xcIixcbiAgICBcImdoZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaGVscFwiLFxuICAgIFwiZ2lmXCI6IFwiaW1hZ2UvZ2lmXCIsXG4gICAgXCJnaW1cIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWlkZW50aXR5LW1lc3NhZ2VcIixcbiAgICBcImdtbFwiOiBcImFwcGxpY2F0aW9uL2dtbCt4bWxcIixcbiAgICBcImdteFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nbXhcIixcbiAgICBcImdudW1lcmljXCI6IFwiYXBwbGljYXRpb24veC1nbnVtZXJpY1wiLFxuICAgIFwiZ3BoXCI6IFwiYXBwbGljYXRpb24vdm5kLmZsb2dyYXBoaXRcIixcbiAgICBcImdweFwiOiBcImFwcGxpY2F0aW9uL2dweCt4bWxcIixcbiAgICBcImdxZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncmFmZXFcIixcbiAgICBcImdxc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncmFmZXFcIixcbiAgICBcImdyYW1cIjogXCJhcHBsaWNhdGlvbi9zcmdzXCIsXG4gICAgXCJncmFtcHNcIjogXCJhcHBsaWNhdGlvbi94LWdyYW1wcy14bWxcIixcbiAgICBcImdyZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclwiLFxuICAgIFwiZ3J2XCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pbmplY3RvclwiLFxuICAgIFwiZ3J4bWxcIjogXCJhcHBsaWNhdGlvbi9zcmdzK3htbFwiLFxuICAgIFwiZ3NmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWdob3N0c2NyaXB0XCIsXG4gICAgXCJndGFyXCI6IFwiYXBwbGljYXRpb24veC1ndGFyXCIsXG4gICAgXCJndG1cIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtbWVzc2FnZVwiLFxuICAgIFwiZ3R3XCI6IFwibW9kZWwvdm5kLmd0d1wiLFxuICAgIFwiZ3ZcIjogXCJ0ZXh0L3ZuZC5ncmFwaHZpelwiLFxuICAgIFwiZ3hmXCI6IFwiYXBwbGljYXRpb24vZ3hmXCIsXG4gICAgXCJneHRcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbmV4dFwiLFxuICAgIFwiZ3pcIjogXCJhcHBsaWNhdGlvbi94LWd6aXBcIixcbiAgICBcImhcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiaDI2MVwiOiBcInZpZGVvL2gyNjFcIixcbiAgICBcImgyNjNcIjogXCJ2aWRlby9oMjYzXCIsXG4gICAgXCJoMjY0XCI6IFwidmlkZW8vaDI2NFwiLFxuICAgIFwiaGFsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhhbCt4bWxcIixcbiAgICBcImhiY2lcIjogXCJhcHBsaWNhdGlvbi92bmQuaGJjaVwiLFxuICAgIFwiaGRmXCI6IFwiYXBwbGljYXRpb24veC1oZGZcIixcbiAgICBcImhoXCI6IFwidGV4dC94LWNcIixcbiAgICBcImhscFwiOiBcImFwcGxpY2F0aW9uL3dpbmhscFwiLFxuICAgIFwiaHBnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocGdsXCIsXG4gICAgXCJocGlkXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWhwaWRcIixcbiAgICBcImhwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocHNcIixcbiAgICBcImhxeFwiOiBcImFwcGxpY2F0aW9uL21hYy1iaW5oZXg0MFwiLFxuICAgIFwiaHRhXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJodGNcIjogXCJ0ZXh0L2h0bWxcIixcbiAgICBcImh0a2VcIjogXCJhcHBsaWNhdGlvbi92bmQua2VuYW1lYWFwcFwiLFxuICAgIFwiaHRtXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodG1sXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodmRcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LWRpY1wiLFxuICAgIFwiaHZwXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi12b2ljZVwiLFxuICAgIFwiaHZzXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi1zY3JpcHRcIixcbiAgICBcImkyZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnRlcmdlb1wiLFxuICAgIFwiaWNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcIixcbiAgICBcImljZVwiOiBcIngtY29uZmVyZW5jZS94LWNvb2x0YWxrXCIsXG4gICAgXCJpY21cIjogXCJhcHBsaWNhdGlvbi92bmQuaWNjcHJvZmlsZVwiLFxuICAgIFwiaWNvXCI6IFwiaW1hZ2UveC1pY29uXCIsXG4gICAgXCJpY3NcIjogXCJ0ZXh0L2NhbGVuZGFyXCIsXG4gICAgXCJpZWZcIjogXCJpbWFnZS9pZWZcIixcbiAgICBcImlmYlwiOiBcInRleHQvY2FsZW5kYXJcIixcbiAgICBcImlmbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtZGF0YVwiLFxuICAgIFwiaWdlc1wiOiBcIm1vZGVsL2lnZXNcIixcbiAgICBcImlnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pZ2xvYWRlclwiLFxuICAgIFwiaWdtXCI6IFwiYXBwbGljYXRpb24vdm5kLmluc29ycy5pZ21cIixcbiAgICBcImlnc1wiOiBcIm1vZGVsL2lnZXNcIixcbiAgICBcImlneFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5taWNyb2dyYWZ4LmlneFwiLFxuICAgIFwiaWlmXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmludGVyY2hhbmdlXCIsXG4gICAgXCJpbXBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWNjcGFjLnNpbXBseS5pbXBcIixcbiAgICBcImltc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1pbXNcIixcbiAgICBcImluXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiaW5pXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiaW5rXCI6IFwiYXBwbGljYXRpb24vaW5rbWwreG1sXCIsXG4gICAgXCJpbmttbFwiOiBcImFwcGxpY2F0aW9uL2lua21sK3htbFwiLFxuICAgIFwiaW5zdGFsbFwiOiBcImFwcGxpY2F0aW9uL3gtaW5zdGFsbC1pbnN0cnVjdGlvbnNcIixcbiAgICBcImlvdGFcIjogXCJhcHBsaWNhdGlvbi92bmQuYXN0cmFlYS1zb2Z0d2FyZS5pb3RhXCIsXG4gICAgXCJpcGFcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImlwZml4XCI6IFwiYXBwbGljYXRpb24vaXBmaXhcIixcbiAgICBcImlwa1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5wYWNrYWdlXCIsXG4gICAgXCJpcm1cIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLnJpZ2h0cy1tYW5hZ2VtZW50XCIsXG4gICAgXCJpcnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaXJlcG9zaXRvcnkucGFja2FnZSt4bWxcIixcbiAgICBcImlzb1wiOiBcImFwcGxpY2F0aW9uL3gtaXNvOTY2MC1pbWFnZVwiLFxuICAgIFwiaXRwXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm10ZW1wbGF0ZVwiLFxuICAgIFwiaXZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmltbWVydmlzaW9uLWl2cFwiLFxuICAgIFwiaXZ1XCI6IFwiYXBwbGljYXRpb24vdm5kLmltbWVydmlzaW9uLWl2dVwiLFxuICAgIFwiamFkXCI6IFwidGV4dC92bmQuc3VuLmoybWUuYXBwLWRlc2NyaXB0b3JcIixcbiAgICBcImphbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5qYW1cIixcbiAgICBcImphclwiOiBcImFwcGxpY2F0aW9uL2phdmEtYXJjaGl2ZVwiLFxuICAgIFwiamF2YVwiOiBcInRleHQveC1qYXZhLXNvdXJjZVwiLFxuICAgIFwiamlzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5qaXNwXCIsXG4gICAgXCJqbHRcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtamx5dFwiLFxuICAgIFwiam5scFwiOiBcImFwcGxpY2F0aW9uL3gtamF2YS1qbmxwLWZpbGVcIixcbiAgICBcImpvZGFcIjogXCJhcHBsaWNhdGlvbi92bmQuam9vc3Quam9kYS1hcmNoaXZlXCIsXG4gICAgXCJqcGVcIjogXCJpbWFnZS9qcGVnXCIsXG4gICAgXCJqcGVnXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBnXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBnbVwiOiBcInZpZGVvL2pwbVwiLFxuICAgIFwianBndlwiOiBcInZpZGVvL2pwZWdcIixcbiAgICBcImpwbVwiOiBcInZpZGVvL2pwbVwiLFxuICAgIFwianNcIjogXCJ0ZXh0L2phdmFzY3JpcHRcIixcbiAgICBcImpzb25cIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgXCJqc29ubWxcIjogXCJhcHBsaWNhdGlvbi9qc29ubWwranNvblwiLFxuICAgIFwia2FyXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwia2FyYm9uXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rYXJib25cIixcbiAgICBcImtmb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2Zvcm11bGFcIixcbiAgICBcImtpYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raWRzcGlyYXRpb25cIixcbiAgICBcImttbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua21sK3htbFwiLFxuICAgIFwia216XCI6IFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS1lYXJ0aC5rbXpcIixcbiAgICBcImtuZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raW5hclwiLFxuICAgIFwia25wXCI6IFwiYXBwbGljYXRpb24vdm5kLmtpbmFyXCIsXG4gICAgXCJrb25cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtvbnRvdXJcIixcbiAgICBcImtwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3ByZXNlbnRlclwiLFxuICAgIFwia3B0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rcHJlc2VudGVyXCIsXG4gICAgXCJrcHh4XCI6IFwiYXBwbGljYXRpb24vdm5kLmRzLWtleXBvaW50XCIsXG4gICAgXCJrc3BcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtzcHJlYWRcIixcbiAgICBcImt0clwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rYWhvb3R6XCIsXG4gICAgXCJrdHhcIjogXCJpbWFnZS9rdHhcIixcbiAgICBcImt0elwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rYWhvb3R6XCIsXG4gICAgXCJrd2RcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmt3b3JkXCIsXG4gICAgXCJrd3RcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmt3b3JkXCIsXG4gICAgXCJsYXN4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQubGFzLmxhcyt4bWxcIixcbiAgICBcImxhdGV4XCI6IFwiYXBwbGljYXRpb24veC1sYXRleFwiLFxuICAgIFwibGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLmxsYW1hZ3JhcGhpY3MubGlmZS1iYWxhbmNlLmRlc2t0b3BcIixcbiAgICBcImxiZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5leGNoYW5nZSt4bWxcIixcbiAgICBcImxlc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5oaGUubGVzc29uLXBsYXllclwiLFxuICAgIFwibGhhXCI6IFwiYXBwbGljYXRpb24veC1semgtY29tcHJlc3NlZFwiLFxuICAgIFwibGluazY2XCI6IFwiYXBwbGljYXRpb24vdm5kLnJvdXRlNjYubGluazY2K3htbFwiLFxuICAgIFwibGlzdFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImxpc3QzODIwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImxpc3RhZnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFwiLFxuICAgIFwibG5rXCI6IFwiYXBwbGljYXRpb24veC1tcy1zaG9ydGN1dFwiLFxuICAgIFwibG9nXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwibG9zdHhtbFwiOiBcImFwcGxpY2F0aW9uL2xvc3QreG1sXCIsXG4gICAgXCJscmZcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImxybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1scm1cIixcbiAgICBcImx0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcm9nYW5zLmx0ZlwiLFxuICAgIFwibHZwXCI6IFwiYXVkaW8vdm5kLmx1Y2VudC52b2ljZVwiLFxuICAgIFwibHdwXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLXdvcmRwcm9cIixcbiAgICBcImx6XCI6IFwiYXBwbGljYXRpb24veC1semlwXCIsXG4gICAgXCJsemhcIjogXCJhcHBsaWNhdGlvbi94LWx6aC1jb21wcmVzc2VkXCIsXG4gICAgXCJsem1hXCI6IFwiYXBwbGljYXRpb24veC1sem1hXCIsXG4gICAgXCJsem9cIjogXCJhcHBsaWNhdGlvbi94LWx6b3BcIixcbiAgICBcIm0xM1wiOiBcImFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcIixcbiAgICBcIm0xNFwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcIixcbiAgICBcIm0xdlwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm0yMVwiOiBcImFwcGxpY2F0aW9uL21wMjFcIixcbiAgICBcIm0yYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm0ydlwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm0zYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm0zdVwiOiBcImF1ZGlvL3gtbXBlZ3VybFwiLFxuICAgIFwibTN1OFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5tcGVndXJsXCIsXG4gICAgXCJtNGFcIjogXCJhdWRpby9tcDRcIixcbiAgICBcIm00dVwiOiBcInZpZGVvL3ZuZC5tcGVndXJsXCIsXG4gICAgXCJtNHZcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1hXCI6IFwiYXBwbGljYXRpb24vbWF0aGVtYXRpY2FcIixcbiAgICBcIm1hZHNcIjogXCJhcHBsaWNhdGlvbi9tYWRzK3htbFwiLFxuICAgIFwibWFnXCI6IFwiYXBwbGljYXRpb24vdm5kLmVjb3dpbi5jaGFydFwiLFxuICAgIFwibWFrZXJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwibWFuXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwibWFyXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJtYXRobWxcIjogXCJhcHBsaWNhdGlvbi9tYXRobWwreG1sXCIsXG4gICAgXCJtYlwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJtYmtcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1ia1wiLFxuICAgIFwibWJveFwiOiBcImFwcGxpY2F0aW9uL21ib3hcIixcbiAgICBcIm1jMVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZWRjYWxjZGF0YVwiLFxuICAgIFwibWNkXCI6IFwiYXBwbGljYXRpb24vdm5kLm1jZFwiLFxuICAgIFwibWN1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsLm1jdXJsXCIsXG4gICAgJ21kJzogJ3RleHQvcGxhaW4nLFxuICAgIFwibWRiXCI6IFwiYXBwbGljYXRpb24veC1tc2FjY2Vzc1wiLFxuICAgIFwibWRpXCI6IFwiaW1hZ2Uvdm5kLm1zLW1vZGlcIixcbiAgICBcIm1lXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwibWVzaFwiOiBcIm1vZGVsL21lc2hcIixcbiAgICBcIm1ldGE0XCI6IFwiYXBwbGljYXRpb24vbWV0YWxpbms0K3htbFwiLFxuICAgIFwibWV0YWxpbmtcIjogXCJhcHBsaWNhdGlvbi9tZXRhbGluayt4bWxcIixcbiAgICBcIm1ldHNcIjogXCJhcHBsaWNhdGlvbi9tZXRzK3htbFwiLFxuICAgIFwibWZtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1mbXBcIixcbiAgICBcIm1mdFwiOiBcImFwcGxpY2F0aW9uL3Jwa2ktbWFuaWZlc3RcIixcbiAgICBcIm1ncFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vc2dlby5tYXBndWlkZS5wYWNrYWdlXCIsXG4gICAgXCJtZ3pcIjogXCJhcHBsaWNhdGlvbi92bmQucHJvdGV1cy5tYWdhemluZVwiLFxuICAgIFwibWlkXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwibWlkaVwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcIm1pZVwiOiBcImFwcGxpY2F0aW9uL3gtbWllXCIsXG4gICAgXCJtaWZcIjogXCJhcHBsaWNhdGlvbi92bmQubWlmXCIsXG4gICAgXCJtaW1lXCI6IFwibWVzc2FnZS9yZmM4MjJcIixcbiAgICBcIm1qMlwiOiBcInZpZGVvL21qMlwiLFxuICAgIFwibWpwMlwiOiBcInZpZGVvL21qMlwiLFxuICAgIFwibWszZFwiOiBcInZpZGVvL3gtbWF0cm9za2FcIixcbiAgICBcIm1rYVwiOiBcImF1ZGlvL3gtbWF0cm9za2FcIixcbiAgICBcIm1rc1wiOiBcInZpZGVvL3gtbWF0cm9za2FcIixcbiAgICBcIm1rdlwiOiBcInZpZGVvL3gtbWF0cm9za2FcIixcbiAgICBcIm1scFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kb2xieS5tbHBcIixcbiAgICBcIm1tZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jaGlwbnV0cy5rYXJhb2tlLW1tZFwiLFxuICAgIFwibW1mXCI6IFwiYXBwbGljYXRpb24vdm5kLnNtYWZcIixcbiAgICBcIm1tclwiOiBcImltYWdlL3ZuZC5mdWppeGVyb3guZWRtaWNzLW1tclwiLFxuICAgIFwibW5nXCI6IFwidmlkZW8veC1tbmdcIixcbiAgICBcIm1ueVwiOiBcImFwcGxpY2F0aW9uL3gtbXNtb25leVwiLFxuICAgIFwibW9iaVwiOiBcImFwcGxpY2F0aW9uL3gtbW9iaXBvY2tldC1lYm9va1wiLFxuICAgIFwibW9kc1wiOiBcImFwcGxpY2F0aW9uL21vZHMreG1sXCIsXG4gICAgXCJtb3ZcIjogXCJ2aWRlby9xdWlja3RpbWVcIixcbiAgICBcIm1vdmllXCI6IFwidmlkZW8veC1zZ2ktbW92aWVcIixcbiAgICBcIm1wMlwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wMjFcIjogXCJhcHBsaWNhdGlvbi9tcDIxXCIsXG4gICAgXCJtcDJhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXAzXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwib3B1c1wiOiBcImF1ZGlvL29wdXNcIixcbiAgICBcIm1wNFwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibXA0YVwiOiBcImF1ZGlvL21wNFwiLFxuICAgIFwibXA0c1wiOiBcImFwcGxpY2F0aW9uL21wNFwiLFxuICAgIFwibXA0dlwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibXBjXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vcGh1bi5jZXJ0aWZpY2F0ZVwiLFxuICAgIFwibXBlXCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibXBlZ1wiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZ1wiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZzRcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wZ2FcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcGtnXCI6IFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLmluc3RhbGxlcit4bWxcIixcbiAgICBcIm1wbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ibHVlaWNlLm11bHRpcGFzc1wiLFxuICAgIFwibXBuXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vcGh1bi5hcHBsaWNhdGlvblwiLFxuICAgIFwibXBwXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXByb2plY3RcIixcbiAgICBcIm1wdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XCIsXG4gICAgXCJtcHlcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1pbmlwYXlcIixcbiAgICBcIm1xeVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXF5XCIsXG4gICAgXCJtcmNcIjogXCJhcHBsaWNhdGlvbi9tYXJjXCIsXG4gICAgXCJtcmN4XCI6IFwiYXBwbGljYXRpb24vbWFyY3htbCt4bWxcIixcbiAgICBcIm1zXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwibXNjbWxcIjogXCJhcHBsaWNhdGlvbi9tZWRpYXNlcnZlcmNvbnRyb2wreG1sXCIsXG4gICAgXCJtc2VlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLm1zZWVkXCIsXG4gICAgXCJtc2VxXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zZXFcIixcbiAgICBcIm1zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5tc2ZcIixcbiAgICBcIm1zaFwiOiBcIm1vZGVsL21lc2hcIixcbiAgICBcIm1zaVwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwibXNsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tc2xcIixcbiAgICBcIm1zdHlcIjogXCJhcHBsaWNhdGlvbi92bmQubXV2ZWUuc3R5bGVcIixcbiAgICAvL1wibXRzXCI6IFwibW9kZWwvdm5kLm10c1wiLFxuICAgIFwibXRzXCI6IFwidmlkZW8vbXRzXCIsXG4gICAgXCJtdXNcIjogXCJhcHBsaWNhdGlvbi92bmQubXVzaWNpYW5cIixcbiAgICBcIm11c2ljeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbCt4bWxcIixcbiAgICBcIm12YlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcIixcbiAgICBcIm13ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZmVyXCIsXG4gICAgXCJteGZcIjogXCJhcHBsaWNhdGlvbi9teGZcIixcbiAgICBcIm14bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWNvcmRhcmUubXVzaWN4bWxcIixcbiAgICBcIm14bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcIm14c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC50cmlzY2FwZS5teHNcIixcbiAgICBcIm14dVwiOiBcInZpZGVvL3ZuZC5tcGVndXJsXCIsXG4gICAgXCJuLWdhZ2VcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwibjNcIjogXCJ0ZXh0L24zXCIsXG4gICAgXCJuYlwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJuYnBcIjogXCJhcHBsaWNhdGlvbi92bmQud29sZnJhbS5wbGF5ZXJcIixcbiAgICBcIm5jXCI6IFwiYXBwbGljYXRpb24veC1uZXRjZGZcIixcbiAgICBcIm5jeFwiOiBcImFwcGxpY2F0aW9uL3gtZHRibmN4K3htbFwiLFxuICAgIFwibmZvXCI6IFwidGV4dC94LW5mb1wiLFxuICAgIFwibmdkYXRcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLmRhdGFcIixcbiAgICBcIm5pdGZcIjogXCJhcHBsaWNhdGlvbi92bmQubml0ZlwiLFxuICAgIFwibmx1XCI6IFwiYXBwbGljYXRpb24vdm5kLm5ldXJvbGFuZ3VhZ2Uubmx1XCIsXG4gICAgXCJubWxcIjogXCJhcHBsaWNhdGlvbi92bmQuZW5saXZlblwiLFxuICAgIFwibm5kXCI6IFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LWRpcmVjdG9yeVwiLFxuICAgIFwibm5zXCI6IFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LXNlYWxlclwiLFxuICAgIFwibm53XCI6IFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LXdlYlwiLFxuICAgIFwibnB4XCI6IFwiaW1hZ2Uvdm5kLm5ldC1mcHhcIixcbiAgICBcIm5zY1wiOiBcImFwcGxpY2F0aW9uL3gtY29uZmVyZW5jZVwiLFxuICAgIFwibnNmXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLW5vdGVzXCIsXG4gICAgXCJudGZcIjogXCJhcHBsaWNhdGlvbi92bmQubml0ZlwiLFxuICAgIFwibnpiXCI6IFwiYXBwbGljYXRpb24veC1uemJcIixcbiAgICBcIm9hMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzMlwiLFxuICAgIFwib2EzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXMzXCIsXG4gICAgXCJvYXNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c1wiLFxuICAgIFwib2JkXCI6IFwiYXBwbGljYXRpb24veC1tc2JpbmRlclwiLFxuICAgIFwib2JqXCI6IFwiYXBwbGljYXRpb24veC10Z2lmXCIsXG4gICAgXCJvZGFcIjogXCJhcHBsaWNhdGlvbi9vZGFcIixcbiAgICBcIm9kYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZGF0YWJhc2VcIixcbiAgICBcIm9kY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuY2hhcnRcIixcbiAgICBcIm9kZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZm9ybXVsYVwiLFxuICAgIFwib2RmdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZm9ybXVsYS10ZW1wbGF0ZVwiLFxuICAgIFwib2RnXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljc1wiLFxuICAgIFwib2RpXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZVwiLFxuICAgIFwib2RtXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LW1hc3RlclwiLFxuICAgIFwib2RwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb25cIixcbiAgICBcIm9kc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXRcIixcbiAgICBcIm9kdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dFwiLFxuICAgIFwib2dhXCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJvZ2dcIjogXCJhdWRpby9vZ2dcIixcbiAgICBcIm9ndlwiOiBcInZpZGVvL29nZ1wiLFxuICAgIFwib2d4XCI6IFwiYXBwbGljYXRpb24vb2dnXCIsXG4gICAgXCJvbWRvY1wiOiBcImFwcGxpY2F0aW9uL29tZG9jK3htbFwiLFxuICAgIFwib25lcGtnXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib25ldG1wXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib25ldG9jXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib25ldG9jMlwiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9wZlwiOiBcImFwcGxpY2F0aW9uL29lYnBzLXBhY2thZ2UreG1sXCIsXG4gICAgXCJvcG1sXCI6IFwidGV4dC94LW9wbWxcIixcbiAgICBcIm9wcmNcIjogXCJhcHBsaWNhdGlvbi92bmQucGFsbVwiLFxuICAgIFwib3JnXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLW9yZ2FuaXplclwiLFxuICAgIFwib3NmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5vcGVuc2NvcmVmb3JtYXRcIixcbiAgICBcIm9zZnB2Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0Lm9zZnB2Zyt4bWxcIixcbiAgICBcIm90Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuY2hhcnQtdGVtcGxhdGVcIixcbiAgICBcIm90ZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1vdGZcIixcbiAgICBcIm90Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3MtdGVtcGxhdGVcIixcbiAgICBcIm90aFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC13ZWJcIixcbiAgICBcIm90aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2UtdGVtcGxhdGVcIixcbiAgICBcIm90cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uLXRlbXBsYXRlXCIsXG4gICAgXCJvdHNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0LXRlbXBsYXRlXCIsXG4gICAgXCJvdHRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtdGVtcGxhdGVcIixcbiAgICBcIm94cHNcIjogXCJhcHBsaWNhdGlvbi9veHBzXCIsXG4gICAgXCJveHRcIjogXCJhcHBsaWNhdGlvbi92bmQub3Blbm9mZmljZW9yZy5leHRlbnNpb25cIixcbiAgICBcInBcIjogXCJ0ZXh0L3gtcGFzY2FsXCIsXG4gICAgXCJwMTBcIjogXCJhcHBsaWNhdGlvbi9wa2NzMTBcIixcbiAgICBcInAxMlwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczEyXCIsXG4gICAgXCJwN2JcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRpZmljYXRlc1wiLFxuICAgIFwicDdjXCI6IFwiYXBwbGljYXRpb24vcGtjczctbWltZVwiLFxuICAgIFwicDdtXCI6IFwiYXBwbGljYXRpb24vcGtjczctbWltZVwiLFxuICAgIFwicDdyXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0cmVxcmVzcFwiLFxuICAgIFwicDdzXCI6IFwiYXBwbGljYXRpb24vcGtjczctc2lnbmF0dXJlXCIsXG4gICAgXCJwOFwiOiBcImFwcGxpY2F0aW9uL3BrY3M4XCIsXG4gICAgXCJwYXNcIjogXCJ0ZXh0L3gtcGFzY2FsXCIsXG4gICAgXCJwYXdcIjogXCJhcHBsaWNhdGlvbi92bmQucGF3YWFmaWxlXCIsXG4gICAgXCJwYmRcIjogXCJhcHBsaWNhdGlvbi92bmQucG93ZXJidWlsZGVyNlwiLFxuICAgIFwicGJtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1iaXRtYXBcIixcbiAgICBcInBjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJwY2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtcGNmXCIsXG4gICAgXCJwY2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtcGNsXCIsXG4gICAgXCJwY2x4bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1wY2x4bFwiLFxuICAgIFwicGN0XCI6IFwiaW1hZ2UveC1waWN0XCIsXG4gICAgXCJwY3VybFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXJsLnBjdXJsXCIsXG4gICAgXCJwY3hcIjogXCJpbWFnZS94LXBjeFwiLFxuICAgIFwicGRiXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcInBkZlwiOiBcImFwcGxpY2F0aW9uL3BkZlwiLFxuICAgIFwicGZhXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZmJcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmbVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZyXCI6IFwiYXBwbGljYXRpb24vZm9udC10ZHBmclwiLFxuICAgIFwicGZ4XCI6IFwiYXBwbGljYXRpb24veC1wa2NzMTJcIixcbiAgICBcInBnbVwiOiBcImltYWdlL3gtcG9ydGFibGUtZ3JheW1hcFwiLFxuICAgIFwicGduXCI6IFwiYXBwbGljYXRpb24veC1jaGVzcy1wZ25cIixcbiAgICBcInBncFwiOiBcImFwcGxpY2F0aW9uL3BncC1lbmNyeXB0ZWRcIixcbiAgICBcInBoYXJcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInBocFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInBocHNcIjogXCJhcHBsaWNhdGlvbi94LWh0dHBkLXBocHNcIixcbiAgICBcInBpY1wiOiBcImltYWdlL3gtcGljdFwiLFxuICAgIFwicGtnXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJwa2lcIjogXCJhcHBsaWNhdGlvbi9wa2l4Y21wXCIsXG4gICAgXCJwa2lwYXRoXCI6IFwiYXBwbGljYXRpb24vcGtpeC1wa2lwYXRoXCIsXG4gICAgXCJwbGJcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctbGFyZ2VcIixcbiAgICBcInBsY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMucGxjXCIsXG4gICAgXCJwbGZcIjogXCJhcHBsaWNhdGlvbi92bmQucG9ja2V0bGVhcm5cIixcbiAgICBcInBsaXN0XCI6IFwiYXBwbGljYXRpb24veC1wbGlzdFwiLFxuICAgIFwicGxzXCI6IFwiYXBwbGljYXRpb24vcGxzK3htbFwiLFxuICAgIFwicG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmN0Yy1wb3NtbFwiLFxuICAgIFwicG5nXCI6IFwiaW1hZ2UvcG5nXCIsXG4gICAgXCJwbm1cIjogXCJpbWFnZS94LXBvcnRhYmxlLWFueW1hcFwiLFxuICAgIFwicG9ydHBrZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tYWNwb3J0cy5wb3J0cGtnXCIsXG4gICAgXCJwb3RcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFwiLFxuICAgIFwicG90bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicG90eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC50ZW1wbGF0ZVwiLFxuICAgIFwicHBhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LmFkZGluLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHBkXCI6IFwiYXBwbGljYXRpb24vdm5kLmN1cHMtcHBkXCIsXG4gICAgXCJwcG1cIjogXCJpbWFnZS94LXBvcnRhYmxlLXBpeG1hcFwiLFxuICAgIFwicHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBwc21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5zbGlkZXNob3cubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwcHN4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnNsaWRlc2hvd1wiLFxuICAgIFwicHB0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBwdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5wcmVzZW50YXRpb24ubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwcHR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnByZXNlbnRhdGlvblwiLFxuICAgIFwicHFhXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcInByY1wiOiBcImFwcGxpY2F0aW9uL3gtbW9iaXBvY2tldC1lYm9va1wiLFxuICAgIFwicHJlXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLWZyZWVsYW5jZVwiLFxuICAgIFwicHJmXCI6IFwiYXBwbGljYXRpb24vcGljcy1ydWxlc1wiLFxuICAgIFwicHNcIjogXCJhcHBsaWNhdGlvbi9wb3N0c2NyaXB0XCIsXG4gICAgXCJwc2JcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctc21hbGxcIixcbiAgICBcInBzZFwiOiBcImltYWdlL3ZuZC5hZG9iZS5waG90b3Nob3BcIixcbiAgICBcInBzZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1saW51eC1wc2ZcIixcbiAgICBcInBza2N4bWxcIjogXCJhcHBsaWNhdGlvbi9wc2tjK3htbFwiLFxuICAgIFwicHRpZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wdmkucHRpZDFcIixcbiAgICBcInB1YlwiOiBcImFwcGxpY2F0aW9uL3gtbXNwdWJsaXNoZXJcIixcbiAgICBcInB2YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy12YXJcIixcbiAgICBcInB3blwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zbS5wb3N0LWl0LW5vdGVzXCIsXG4gICAgXCJweWFcIjogXCJhdWRpby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5YVwiLFxuICAgIFwicHl2XCI6IFwidmlkZW8vdm5kLm1zLXBsYXlyZWFkeS5tZWRpYS5weXZcIixcbiAgICBcInFhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5xdWlja2FuaW1lXCIsXG4gICAgXCJxYm9cIjogXCJhcHBsaWNhdGlvbi92bmQuaW50dS5xYm9cIixcbiAgICBcInFmeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFmeFwiLFxuICAgIFwicXBzXCI6IFwiYXBwbGljYXRpb24vdm5kLnB1Ymxpc2hhcmUtZGVsdGEtdHJlZVwiLFxuICAgIFwicXRcIjogXCJ2aWRlby9xdWlja3RpbWVcIixcbiAgICBcInF3ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXd0XCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGJcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhsXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeHRcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInJhXCI6IFwiYXVkaW8veC1wbi1yZWFsYXVkaW9cIixcbiAgICBcInJhbVwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvXCIsXG4gICAgXCJyYXJcIjogXCJhcHBsaWNhdGlvbi94LXJhci1jb21wcmVzc2VkXCIsXG4gICAgXCJyYXNcIjogXCJpbWFnZS94LWNtdS1yYXN0ZXJcIixcbiAgICBcInJiXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwicmNwcm9maWxlXCI6IFwiYXBwbGljYXRpb24vdm5kLmlwdW5wbHVnZ2VkLnJjcHJvZmlsZVwiLFxuICAgIFwicmRmXCI6IFwiYXBwbGljYXRpb24vcmRmK3htbFwiLFxuICAgIFwicmR6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRhdGEtdmlzaW9uLnJkelwiLFxuICAgIFwicmVwXCI6IFwiYXBwbGljYXRpb24vdm5kLmJ1c2luZXNzb2JqZWN0c1wiLFxuICAgIFwicmVzXCI6IFwiYXBwbGljYXRpb24veC1kdGJyZXNvdXJjZSt4bWxcIixcbiAgICBcInJlc3hcIjogXCJ0ZXh0L3htbFwiLFxuICAgIFwicmdiXCI6IFwiaW1hZ2UveC1yZ2JcIixcbiAgICBcInJpZlwiOiBcImFwcGxpY2F0aW9uL3JlZ2luZm8reG1sXCIsXG4gICAgXCJyaXBcIjogXCJhdWRpby92bmQucmlwXCIsXG4gICAgXCJyaXNcIjogXCJhcHBsaWNhdGlvbi94LXJlc2VhcmNoLWluZm8tc3lzdGVtc1wiLFxuICAgIFwicmxcIjogXCJhcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cyt4bWxcIixcbiAgICBcInJsY1wiOiBcImltYWdlL3ZuZC5mdWppeGVyb3guZWRtaWNzLXJsY1wiLFxuICAgIFwicmxkXCI6IFwiYXBwbGljYXRpb24vcmVzb3VyY2UtbGlzdHMtZGlmZit4bWxcIixcbiAgICBcInJtXCI6IFwiYXBwbGljYXRpb24vdm5kLnJuLXJlYWxtZWRpYVwiLFxuICAgIFwicm1pXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwicm1wXCI6IFwiYXVkaW8veC1wbi1yZWFsYXVkaW8tcGx1Z2luXCIsXG4gICAgXCJybXNcIjogXCJhcHBsaWNhdGlvbi92bmQuamNwLmphdmFtZS5taWRsZXQtcm1zXCIsXG4gICAgXCJybXZiXCI6IFwiYXBwbGljYXRpb24vdm5kLnJuLXJlYWxtZWRpYS12YnJcIixcbiAgICBcInJuY1wiOiBcImFwcGxpY2F0aW9uL3JlbGF4LW5nLWNvbXBhY3Qtc3ludGF4XCIsXG4gICAgXCJyb2FcIjogXCJhcHBsaWNhdGlvbi9ycGtpLXJvYVwiLFxuICAgIFwicm9mZlwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcInJwOVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9hbnRvLnJwOVwiLFxuICAgIFwicnBtXCI6IFwiYXBwbGljYXRpb24veC1ycG1cIixcbiAgICBcInJwc3NcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEucmFkaW8tcHJlc2V0c1wiLFxuICAgIFwicnBzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5yYWRpby1wcmVzZXRcIixcbiAgICBcInJxXCI6IFwiYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5XCIsXG4gICAgXCJyc1wiOiBcImFwcGxpY2F0aW9uL3Jscy1zZXJ2aWNlcyt4bWxcIixcbiAgICBcInJzZFwiOiBcImFwcGxpY2F0aW9uL3JzZCt4bWxcIixcbiAgICBcInJzc1wiOiBcImFwcGxpY2F0aW9uL3Jzcyt4bWxcIixcbiAgICBcInJ0ZlwiOiBcImFwcGxpY2F0aW9uL3J0ZlwiLFxuICAgIFwicnR4XCI6IFwidGV4dC9yaWNodGV4dFwiLFxuICAgIFwic1wiOiBcInRleHQveC1hc21cIixcbiAgICBcInMzbVwiOiBcImF1ZGlvL3MzbVwiLFxuICAgIFwiczd6XCI6IFwiYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkXCIsXG4gICAgXCJzYWZcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLnNtYWYtYXVkaW9cIixcbiAgICBcInNhZmFyaWV4dHpcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInNhc3NcIjogXCJ0ZXh0L3gtc2Fzc1wiLFxuICAgIFwic2JtbFwiOiBcImFwcGxpY2F0aW9uL3NibWwreG1sXCIsXG4gICAgXCJzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0uc2VjdXJlLWNvbnRhaW5lclwiLFxuICAgIFwic2NkXCI6IFwiYXBwbGljYXRpb24veC1tc3NjaGVkdWxlXCIsXG4gICAgXCJzY21cIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtc2NyZWVuY2FtXCIsXG4gICAgXCJzY3FcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLWN2LXJlcXVlc3RcIixcbiAgICBcInNjc1wiOiBcImFwcGxpY2F0aW9uL3NjdnAtY3YtcmVzcG9uc2VcIixcbiAgICBcInNjc3NcIjogXCJ0ZXh0L3gtc2Nzc1wiLFxuICAgIFwic2N1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsLnNjdXJsXCIsXG4gICAgXCJzZGFcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmRyYXdcIixcbiAgICBcInNkY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uY2FsY1wiLFxuICAgIFwic2RkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5pbXByZXNzXCIsXG4gICAgXCJzZGtkXCI6IFwiYXBwbGljYXRpb24vdm5kLnNvbGVudC5zZGttK3htbFwiLFxuICAgIFwic2RrbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zb2xlbnQuc2RrbSt4bWxcIixcbiAgICBcInNkcFwiOiBcImFwcGxpY2F0aW9uL3NkcFwiLFxuICAgIFwic2R3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXJcIixcbiAgICBcInNlZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZWVtYWlsXCIsXG4gICAgXCJzZWVkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFwiLFxuICAgIFwic2VtYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1hXCIsXG4gICAgXCJzZW1kXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWRcIixcbiAgICBcInNlbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtZlwiLFxuICAgIFwic2VyXCI6IFwiYXBwbGljYXRpb24vamF2YS1zZXJpYWxpemVkLW9iamVjdFwiLFxuICAgIFwic2V0cGF5XCI6IFwiYXBwbGljYXRpb24vc2V0LXBheW1lbnQtaW5pdGlhdGlvblwiLFxuICAgIFwic2V0cmVnXCI6IFwiYXBwbGljYXRpb24vc2V0LXJlZ2lzdHJhdGlvbi1pbml0aWF0aW9uXCIsXG4gICAgXCJzZmQtaGRzdHhcIjogXCJhcHBsaWNhdGlvbi92bmQuaHlkcm9zdGF0aXguc29mLWRhdGFcIixcbiAgICBcInNmc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5zZnNcIixcbiAgICBcInNmdlwiOiBcInRleHQveC1zZnZcIixcbiAgICBcInNnaVwiOiBcImltYWdlL3NnaVwiLFxuICAgIFwic2dsXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXItZ2xvYmFsXCIsXG4gICAgXCJzZ21cIjogXCJ0ZXh0L3NnbWxcIixcbiAgICBcInNnbWxcIjogXCJ0ZXh0L3NnbWxcIixcbiAgICBcInNoXCI6IFwiYXBwbGljYXRpb24veC1zaFwiLFxuICAgIFwic2hhclwiOiBcImFwcGxpY2F0aW9uL3gtc2hhclwiLFxuICAgIFwic2hmXCI6IFwiYXBwbGljYXRpb24vc2hmK3htbFwiLFxuICAgIFwic2lkXCI6IFwiaW1hZ2UveC1tcnNpZC1pbWFnZVwiLFxuICAgIFwic2lnXCI6IFwiYXBwbGljYXRpb24vcGdwLXNpZ25hdHVyZVwiLFxuICAgIFwic2lsXCI6IFwiYXVkaW8vc2lsa1wiLFxuICAgIFwic2lsb1wiOiBcIm1vZGVsL21lc2hcIixcbiAgICBcInNpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcInNpc3hcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJzaXRcIjogXCJhcHBsaWNhdGlvbi94LXN0dWZmaXRcIixcbiAgICBcInNpdHhcIjogXCJhcHBsaWNhdGlvbi94LXN0dWZmaXR4XCIsXG4gICAgXCJza2RcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2ttXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza3RcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2xkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwic2xkeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZVwiLFxuICAgIFwic2x0XCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnNhbHRcIixcbiAgICBcInNtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0ZXBtYW5pYS5zdGVwY2hhcnRcIixcbiAgICBcInNtZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ubWF0aFwiLFxuICAgIFwic21pXCI6IFwiYXBwbGljYXRpb24vc21pbCt4bWxcIixcbiAgICBcInNtaWxcIjogXCJhcHBsaWNhdGlvbi9zbWlsK3htbFwiLFxuICAgIFwic212XCI6IFwidmlkZW8veC1zbXZcIixcbiAgICBcInNtemlwXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0ZXBtYW5pYS5wYWNrYWdlXCIsXG4gICAgXCJzbmRcIjogXCJhdWRpby9iYXNpY1wiLFxuICAgIFwic25mXCI6IFwiYXBwbGljYXRpb24veC1mb250LXNuZlwiLFxuICAgIFwic29cIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInNwY1wiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydGlmaWNhdGVzXCIsXG4gICAgXCJzcGZcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLnNtYWYtcGhyYXNlXCIsXG4gICAgXCJzcGxcIjogXCJhcHBsaWNhdGlvbi94LWZ1dHVyZXNwbGFzaFwiLFxuICAgIFwic3BvdFwiOiBcInRleHQvdm5kLmluM2Quc3BvdFwiLFxuICAgIFwic3BwXCI6IFwiYXBwbGljYXRpb24vc2N2cC12cC1yZXNwb25zZVwiLFxuICAgIFwic3BxXCI6IFwiYXBwbGljYXRpb24vc2N2cC12cC1yZXF1ZXN0XCIsXG4gICAgXCJzcHhcIjogXCJhdWRpby9vZ2dcIixcbiAgICBcInNxbFwiOiBcImFwcGxpY2F0aW9uL3gtc3FsXCIsXG4gICAgXCJzcmNcIjogXCJhcHBsaWNhdGlvbi94LXdhaXMtc291cmNlXCIsXG4gICAgXCJzcnRcIjogXCJhcHBsaWNhdGlvbi94LXN1YnJpcFwiLFxuICAgIFwic3J1XCI6IFwiYXBwbGljYXRpb24vc3J1K3htbFwiLFxuICAgIFwic3J4XCI6IFwiYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMreG1sXCIsXG4gICAgXCJzc2RsXCI6IFwiYXBwbGljYXRpb24vc3NkbCt4bWxcIixcbiAgICBcInNzZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2Rhay1kZXNjcmlwdG9yXCIsXG4gICAgXCJzc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uc3NmXCIsXG4gICAgXCJzc21sXCI6IFwiYXBwbGljYXRpb24vc3NtbCt4bWxcIixcbiAgICBcInN0XCI6IFwiYXBwbGljYXRpb24vdm5kLnNhaWxpbmd0cmFja2VyLnRyYWNrXCIsXG4gICAgXCJzdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjLnRlbXBsYXRlXCIsXG4gICAgXCJzdGRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3LnRlbXBsYXRlXCIsXG4gICAgXCJzdGZcIjogXCJhcHBsaWNhdGlvbi92bmQud3Quc3RmXCIsXG4gICAgXCJzdGlcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5pbXByZXNzLnRlbXBsYXRlXCIsXG4gICAgXCJzdGtcIjogXCJhcHBsaWNhdGlvbi9oeXBlcnN0dWRpb1wiLFxuICAgIFwic3RsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBraS5zdGxcIixcbiAgICBcInN0clwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wZy5mb3JtYXRcIixcbiAgICBcInN0d1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci50ZW1wbGF0ZVwiLFxuICAgIFwic3R5bFwiOiBcInRleHQveC1zdHlsXCIsXG4gICAgXCJzdWJcIjogXCJpbWFnZS92bmQuZHZiLnN1YnRpdGxlXCIsXG4gICAgXCJzdXNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VzLWNhbGVuZGFyXCIsXG4gICAgXCJzdXNwXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1cy1jYWxlbmRhclwiLFxuICAgIFwic3Y0Y3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtc3Y0Y3Bpb1wiLFxuICAgIFwic3Y0Y3JjXCI6IFwiYXBwbGljYXRpb24veC1zdjRjcmNcIixcbiAgICBcInN2Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5kdmIuc2VydmljZVwiLFxuICAgIFwic3ZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN2ZFwiLFxuICAgIFwic3ZnXCI6IFwiaW1hZ2Uvc3ZnK3htbFwiLFxuICAgIFwic3ZnelwiOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICBcInN3YVwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcInN3ZlwiOiBcImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIsXG4gICAgXCJzd2lcIjogXCJhcHBsaWNhdGlvbi92bmQuYXJpc3RhbmV0d29ya3Muc3dpXCIsXG4gICAgXCJzeGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjXCIsXG4gICAgXCJzeGRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3XCIsXG4gICAgXCJzeGdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXIuZ2xvYmFsXCIsXG4gICAgXCJzeGlcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5pbXByZXNzXCIsXG4gICAgXCJzeG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5tYXRoXCIsXG4gICAgXCJzeHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXJcIixcbiAgICBcInRcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJ0M1wiOiBcImFwcGxpY2F0aW9uL3gtdDN2bS1pbWFnZVwiLFxuICAgIFwidGFnbGV0XCI6IFwiYXBwbGljYXRpb24vdm5kLm15bmZjXCIsXG4gICAgXCJ0YW9cIjogXCJhcHBsaWNhdGlvbi92bmQudGFvLmludGVudC1tb2R1bGUtYXJjaGl2ZVwiLFxuICAgIFwidGFyXCI6IFwiYXBwbGljYXRpb24veC10YXJcIixcbiAgICBcInRjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcDIudGNhcFwiLFxuICAgIFwidGNsXCI6IFwiYXBwbGljYXRpb24veC10Y2xcIixcbiAgICBcInRlYWNoZXJcIjogXCJhcHBsaWNhdGlvbi92bmQuc21hcnQudGVhY2hlclwiLFxuICAgIFwidGVpXCI6IFwiYXBwbGljYXRpb24vdGVpK3htbFwiLFxuICAgIFwidGVpY29ycHVzXCI6IFwiYXBwbGljYXRpb24vdGVpK3htbFwiLFxuICAgIFwidGV4XCI6IFwiYXBwbGljYXRpb24veC10ZXhcIixcbiAgICBcInRleGlcIjogXCJhcHBsaWNhdGlvbi94LXRleGluZm9cIixcbiAgICBcInRleGluZm9cIjogXCJhcHBsaWNhdGlvbi94LXRleGluZm9cIixcbiAgICBcInRleHRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJ0ZmlcIjogXCJhcHBsaWNhdGlvbi90aHJhdWQreG1sXCIsXG4gICAgXCJ0Zm1cIjogXCJhcHBsaWNhdGlvbi94LXRleC10Zm1cIixcbiAgICBcInRnYVwiOiBcImltYWdlL3gtdGdhXCIsXG4gICAgXCJ0Z3pcIjogXCJhcHBsaWNhdGlvbi94LWd6aXBcIixcbiAgICBcInRobXhcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtb2ZmaWNldGhlbWVcIixcbiAgICBcInRpZlwiOiBcImltYWdlL3RpZmZcIixcbiAgICBcInRpZmZcIjogXCJpbWFnZS90aWZmXCIsXG4gICAgXCJ0bW9cIjogXCJhcHBsaWNhdGlvbi92bmQudG1vYmlsZS1saXZldHZcIixcbiAgICBcInRvcnJlbnRcIjogXCJhcHBsaWNhdGlvbi94LWJpdHRvcnJlbnRcIixcbiAgICBcInRwbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdG9vbC10ZW1wbGF0ZVwiLFxuICAgIFwidHB0XCI6IFwiYXBwbGljYXRpb24vdm5kLnRyaWQudHB0XCIsXG4gICAgXCJ0clwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcInRyYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC50cnVlYXBwXCIsXG4gICAgXCJ0cm1cIjogXCJhcHBsaWNhdGlvbi94LW1zdGVybWluYWxcIixcbiAgICBcInRzZFwiOiBcImFwcGxpY2F0aW9uL3RpbWVzdGFtcGVkLWRhdGFcIixcbiAgICBcInRzdlwiOiBcInRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcIixcbiAgICBcInR0Y1wiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10dGZcIixcbiAgICBcInR0ZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10dGZcIixcbiAgICBcInR0bFwiOiBcInRleHQvdHVydGxlXCIsXG4gICAgXCJ0d2RcIjogXCJhcHBsaWNhdGlvbi92bmQuc2ltdGVjaC1taW5kbWFwcGVyXCIsXG4gICAgXCJ0d2RzXCI6IFwiYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclwiLFxuICAgIFwidHhkXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlbm9tYXRpeC50dXhlZG9cIixcbiAgICBcInR4ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMudHhmXCIsXG4gICAgXCJ0eHRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJ1MzJcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJ1ZGViXCI6IFwiYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVwiLFxuICAgIFwidWZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnVmZGxcIixcbiAgICBcInVmZGxcIjogXCJhcHBsaWNhdGlvbi92bmQudWZkbFwiLFxuICAgIFwidWx4XCI6IFwiYXBwbGljYXRpb24veC1nbHVseFwiLFxuICAgIFwidW1qXCI6IFwiYXBwbGljYXRpb24vdm5kLnVtYWppblwiLFxuICAgIFwidW5pdHl3ZWJcIjogXCJhcHBsaWNhdGlvbi92bmQudW5pdHlcIixcbiAgICBcInVvbWxcIjogXCJhcHBsaWNhdGlvbi92bmQudW9tbCt4bWxcIixcbiAgICBcInVyaVwiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVyaXNcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1cmxzXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXN0YXJcIjogXCJhcHBsaWNhdGlvbi94LXVzdGFyXCIsXG4gICAgXCJ1dHpcIjogXCJhcHBsaWNhdGlvbi92bmQudWlxLnRoZW1lXCIsXG4gICAgXCJ1dVwiOiBcInRleHQveC11dWVuY29kZVwiLFxuICAgIFwidXZhXCI6IFwiYXVkaW8vdm5kLmRlY2UuYXVkaW9cIixcbiAgICBcInV2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2Z1wiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2aFwiOiBcInZpZGVvL3ZuZC5kZWNlLmhkXCIsXG4gICAgXCJ1dmlcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dm1cIjogXCJ2aWRlby92bmQuZGVjZS5tb2JpbGVcIixcbiAgICBcInV2cFwiOiBcInZpZGVvL3ZuZC5kZWNlLnBkXCIsXG4gICAgXCJ1dnNcIjogXCJ2aWRlby92bmQuZGVjZS5zZFwiLFxuICAgIFwidXZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcIixcbiAgICBcInV2dVwiOiBcInZpZGVvL3ZuZC51dnZ1Lm1wNFwiLFxuICAgIFwidXZ2XCI6IFwidmlkZW8vdm5kLmRlY2UudmlkZW9cIixcbiAgICBcInV2dmFcIjogXCJhdWRpby92bmQuZGVjZS5hdWRpb1wiLFxuICAgIFwidXZ2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2dmZcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dnZnXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZ2aFwiOiBcInZpZGVvL3ZuZC5kZWNlLmhkXCIsXG4gICAgXCJ1dnZpXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZ2bVwiOiBcInZpZGVvL3ZuZC5kZWNlLm1vYmlsZVwiLFxuICAgIFwidXZ2cFwiOiBcInZpZGVvL3ZuZC5kZWNlLnBkXCIsXG4gICAgXCJ1dnZzXCI6IFwidmlkZW8vdm5kLmRlY2Uuc2RcIixcbiAgICBcInV2dnRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS50dG1sK3htbFwiLFxuICAgIFwidXZ2dVwiOiBcInZpZGVvL3ZuZC51dnZ1Lm1wNFwiLFxuICAgIFwidXZ2dlwiOiBcInZpZGVvL3ZuZC5kZWNlLnZpZGVvXCIsXG4gICAgXCJ1dnZ4XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudW5zcGVjaWZpZWRcIixcbiAgICBcInV2dnpcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS56aXBcIixcbiAgICBcInV2eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXCIsXG4gICAgXCJ1dnpcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS56aXBcIixcbiAgICBcInZjYXJkXCI6IFwidGV4dC92Y2FyZFwiLFxuICAgIFwidmNkXCI6IFwiYXBwbGljYXRpb24veC1jZGxpbmtcIixcbiAgICBcInZjZlwiOiBcInRleHQveC12Y2FyZFwiLFxuICAgIFwidmNnXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS12Y2FyZFwiLFxuICAgIFwidmNzXCI6IFwidGV4dC94LXZjYWxlbmRhclwiLFxuICAgIFwidmN4XCI6IFwiYXBwbGljYXRpb24vdm5kLnZjeFwiLFxuICAgIFwidmlzXCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvbmFyeVwiLFxuICAgIFwidml2XCI6IFwidmlkZW8vdm5kLnZpdm9cIixcbiAgICBcInZvYlwiOiBcInZpZGVvL3gtbXMtdm9iXCIsXG4gICAgXCJ2b3JcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclwiLFxuICAgIFwidm94XCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwidnJtbFwiOiBcIm1vZGVsL3ZybWxcIixcbiAgICBcInZzZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnNmXCI6IFwiYXBwbGljYXRpb24vdm5kLnZzZlwiLFxuICAgIFwidnNzXCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c3RcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnR1XCI6IFwibW9kZWwvdm5kLnZ0dVwiLFxuICAgIFwidnhtbFwiOiBcImFwcGxpY2F0aW9uL3ZvaWNleG1sK3htbFwiLFxuICAgIFwidzNkXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwid2FkXCI6IFwiYXBwbGljYXRpb24veC1kb29tXCIsXG4gICAgXCJ3YXZcIjogXCJhdWRpby94LXdhdlwiLFxuICAgIFwid2F4XCI6IFwiYXVkaW8veC1tcy13YXhcIixcbiAgICBcIndibXBcIjogXCJpbWFnZS92bmQud2FwLndibXBcIixcbiAgICBcIndic1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcml0aWNhbHRvb2xzLndicyt4bWxcIixcbiAgICBcIndieG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53YnhtbFwiLFxuICAgIFwid2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3ZGJcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndkcFwiOiBcImltYWdlL3ZuZC5tcy1waG90b1wiLFxuICAgIFwid2ViYVwiOiBcImF1ZGlvL3dlYm1cIixcbiAgICBcIndlYm1cIjogXCJ2aWRlby93ZWJtXCIsXG4gICAgXCJ3ZWJwXCI6IFwiaW1hZ2Uvd2VicFwiLFxuICAgIFwid2dcIjogXCJhcHBsaWNhdGlvbi92bmQucG1pLndpZGdldFwiLFxuICAgIFwid2d0XCI6IFwiYXBwbGljYXRpb24vd2lkZ2V0XCIsXG4gICAgXCJ3a3NcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndtXCI6IFwidmlkZW8veC1tcy13bVwiLFxuICAgIFwid21hXCI6IFwiYXVkaW8veC1tcy13bWFcIixcbiAgICBcIndtZFwiOiBcImFwcGxpY2F0aW9uL3gtbXMtd21kXCIsXG4gICAgXCJ3bWZcIjogXCJhcHBsaWNhdGlvbi94LW1zbWV0YWZpbGVcIixcbiAgICBcIndtbFwiOiBcInRleHQvdm5kLndhcC53bWxcIixcbiAgICBcIndtbGNcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndtbGNcIixcbiAgICBcIndtbHNcIjogXCJ0ZXh0L3ZuZC53YXAud21sc2NyaXB0XCIsXG4gICAgXCJ3bWxzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud21sc2NyaXB0Y1wiLFxuICAgIFwid212XCI6IFwidmlkZW8veC1tcy13bXZcIixcbiAgICBcIndteFwiOiBcInZpZGVvL3gtbXMtd214XCIsXG4gICAgXCJ3bXpcIjogXCJhcHBsaWNhdGlvbi94LW1zLXdtelwiLFxuICAgIFwid29mZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC13b2ZmXCIsXG4gICAgXCJ3cGRcIjogXCJhcHBsaWNhdGlvbi92bmQud29yZHBlcmZlY3RcIixcbiAgICBcIndwbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13cGxcIixcbiAgICBcIndwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid3FkXCI6IFwiYXBwbGljYXRpb24vdm5kLndxZFwiLFxuICAgIFwid3JpXCI6IFwiYXBwbGljYXRpb24veC1tc3dyaXRlXCIsXG4gICAgXCJ3cmxcIjogXCJtb2RlbC92cm1sXCIsXG4gICAgXCJ3c2RsXCI6IFwiYXBwbGljYXRpb24vd3NkbCt4bWxcIixcbiAgICBcIndzcG9saWN5XCI6IFwiYXBwbGljYXRpb24vd3Nwb2xpY3kreG1sXCIsXG4gICAgXCJ3dGJcIjogXCJhcHBsaWNhdGlvbi92bmQud2VidHVyYm9cIixcbiAgICBcInd2eFwiOiBcInZpZGVvL3gtbXMtd3Z4XCIsXG4gICAgXCJ4MzJcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJ4M2RcIjogXCJtb2RlbC94M2QreG1sXCIsXG4gICAgXCJ4M2RiXCI6IFwibW9kZWwveDNkK2JpbmFyeVwiLFxuICAgIFwieDNkYnpcIjogXCJtb2RlbC94M2QrYmluYXJ5XCIsXG4gICAgXCJ4M2R2XCI6IFwibW9kZWwveDNkK3ZybWxcIixcbiAgICBcIngzZHZ6XCI6IFwibW9kZWwveDNkK3ZybWxcIixcbiAgICBcIngzZHpcIjogXCJtb2RlbC94M2QreG1sXCIsXG4gICAgXCJ4YW1sXCI6IFwiYXBwbGljYXRpb24veGFtbCt4bWxcIixcbiAgICBcInhhcFwiOiBcImFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtYXBwXCIsXG4gICAgXCJ4YXJcIjogXCJhcHBsaWNhdGlvbi92bmQueGFyYVwiLFxuICAgIFwieGJhcFwiOiBcImFwcGxpY2F0aW9uL3gtbXMteGJhcFwiLFxuICAgIFwieGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kb2N1d29ya3MuYmluZGVyXCIsXG4gICAgXCJ4Ym1cIjogXCJpbWFnZS94LXhiaXRtYXBcIixcbiAgICBcInhkZlwiOiBcImFwcGxpY2F0aW9uL3hjYXAtZGlmZit4bWxcIixcbiAgICBcInhkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0reG1sXCIsXG4gICAgXCJ4ZHBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUueGRwK3htbFwiLFxuICAgIFwieGRzc2NcIjogXCJhcHBsaWNhdGlvbi9kc3NjK3htbFwiLFxuICAgIFwieGR3XCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kb2N1d29ya3NcIixcbiAgICBcInhlbmNcIjogXCJhcHBsaWNhdGlvbi94ZW5jK3htbFwiLFxuICAgIFwieGVyXCI6IFwiYXBwbGljYXRpb24vcGF0Y2gtb3BzLWVycm9yK3htbFwiLFxuICAgIFwieGZkZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS54ZmRmXCIsXG4gICAgXCJ4ZmRsXCI6IFwiYXBwbGljYXRpb24vdm5kLnhmZGxcIixcbiAgICBcInhodFwiOiBcImFwcGxpY2F0aW9uL3hodG1sK3htbFwiLFxuICAgIFwieGh0bWxcIjogXCJhcHBsaWNhdGlvbi94aHRtbCt4bWxcIixcbiAgICBcInhodm1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJ4aWZcIjogXCJpbWFnZS92bmQueGlmZlwiLFxuICAgIFwieGxhXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bGFtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLmFkZGluLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGxjXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bGZcIjogXCJhcHBsaWNhdGlvbi94LXhsaWZmK3htbFwiLFxuICAgIFwieGxtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsc2JcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQuYmluYXJ5Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGxzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsc3hcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFwiLFxuICAgIFwieGx0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGx0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnRlbXBsYXRlXCIsXG4gICAgXCJ4bHdcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhtXCI6IFwiYXVkaW8veG1cIixcbiAgICBcInhtbFwiOiBcImFwcGxpY2F0aW9uL3htbFwiLFxuICAgIFwieG9cIjogXCJhcHBsaWNhdGlvbi92bmQub2xwYy1zdWdhclwiLFxuICAgIFwieG9wXCI6IFwiYXBwbGljYXRpb24veG9wK3htbFwiLFxuICAgIFwieHBpXCI6IFwiYXBwbGljYXRpb24veC14cGluc3RhbGxcIixcbiAgICBcInhwbFwiOiBcImFwcGxpY2F0aW9uL3hwcm9jK3htbFwiLFxuICAgIFwieHBtXCI6IFwiaW1hZ2UveC14cGl4bWFwXCIsXG4gICAgXCJ4cHJcIjogXCJhcHBsaWNhdGlvbi92bmQuaXMteHByXCIsXG4gICAgXCJ4cHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMteHBzZG9jdW1lbnRcIixcbiAgICBcInhwd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnRlcmNvbi5mb3JtbmV0XCIsXG4gICAgXCJ4cHhcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJjb24uZm9ybW5ldFwiLFxuICAgIFwieHNsXCI6IFwiYXBwbGljYXRpb24veG1sXCIsXG4gICAgXCJ4c2x0XCI6IFwiYXBwbGljYXRpb24veHNsdCt4bWxcIixcbiAgICBcInhzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwreG1sXCIsXG4gICAgXCJ4c3BmXCI6IFwiYXBwbGljYXRpb24veHNwZit4bWxcIixcbiAgICBcInh1bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3ppbGxhLnh1bCt4bWxcIixcbiAgICBcInh2bVwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieHZtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieHdkXCI6IFwiaW1hZ2UveC14d2luZG93ZHVtcFwiLFxuICAgIFwieHl6XCI6IFwiY2hlbWljYWwveC14eXpcIixcbiAgICBcInh6XCI6IFwiYXBwbGljYXRpb24veC14elwiLFxuICAgIFwieWFtbFwiOiBcInRleHQveWFtbFwiLFxuICAgIFwieWFuZ1wiOiBcImFwcGxpY2F0aW9uL3lhbmdcIixcbiAgICBcInlpblwiOiBcImFwcGxpY2F0aW9uL3lpbit4bWxcIixcbiAgICBcInltbFwiOiBcInRleHQveWFtbFwiLFxuICAgIFwielwiOiBcImFwcGxpY2F0aW9uL3gtY29tcHJlc3NcIixcbiAgICBcInoxXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejJcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6M1wiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno0XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejVcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NlwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno3XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejhcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6YXpcIjogXCJhcHBsaWNhdGlvbi92bmQuenphenouZGVjayt4bWxcIixcbiAgICBcInppcFwiOiBcImFwcGxpY2F0aW9uL3ppcFwiLFxuICAgIFwiemlyXCI6IFwiYXBwbGljYXRpb24vdm5kLnp1bFwiLFxuICAgIFwiemlyelwiOiBcImFwcGxpY2F0aW9uL3ZuZC56dWxcIixcbiAgICBcInptbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYW5kaGVsZC1lbnRlcnRhaW5tZW50K3htbFwiLFxuICAgIFwiMTIzXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLTEtMi0zXCJcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1taW1lLXR5cGVzLW1vZHVsZS5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmFzeW5jIGZ1bmN0aW9uIGFmdGVyRmV0Y2gocmVzcG9uc2UpIHtcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBiYWQgcmVzcG9uc2UgOiAke0pTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICBsZXQgc2NpID0gcmVjZWl2ZWRDb250ZW50VHlwZS5pbmRleE9mKCc7Jyk7XG4gICAgaWYgKHNjaSA+PSAwKVxuICAgICAgICByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVjZWl2ZWRDb250ZW50VHlwZS5zdWJzdHIoMCwgc2NpKTtcbiAgICBpZiAocmVjZWl2ZWRDb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xufVxuZnVuY3Rpb24gZ2V0RGF0YSh1cmwsIGhlYWRlcnMgPSBudWxsKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcidcbiAgICB9O1xuICAgIGlmIChoZWFkZXJzKVxuICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgIHJldHVybiBmZXRjaCh1cmwsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5nZXREYXRhID0gZ2V0RGF0YTtcbmZ1bmN0aW9uIHBvc3REYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wb3N0RGF0YSA9IHBvc3REYXRhO1xuZnVuY3Rpb24gcHV0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wdXREYXRhID0gcHV0RGF0YTtcbmZ1bmN0aW9uIGRlbGV0ZURhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZGVsZXRlRGF0YSA9IGRlbGV0ZURhdGE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5leHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwiaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgPyBcImh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgOiBcImh0dHBzOi8vbG9jYWxob3N0OjUwMDVcIjtcbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaChzZWFyY2hUZXh0LCBtaW1lVHlwZSkge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzZWFyY2hTcGVjID0ge1xuICAgICAgICAgICAgbmFtZTogc2VhcmNoVGV4dCxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBtaW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7IHJlc3VsdERpcmVjdG9yaWVzLCByZXN1bHRGaWxlc2RkZCwgaXRlbXMgfSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2VhcmNoYCwgc2VhcmNoU3BlYyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXJlY3RvcmllczogcmVzdWx0RGlyZWN0b3JpZXMsXG4gICAgICAgICAgICBmaWxlczogcmVzdWx0RmlsZXNkZGQsXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuc2VhcmNoID0gc2VhcmNoO1xuYXN5bmMgZnVuY3Rpb24gZ2V0RGlyZWN0b3J5RGVzY3JpcHRvcihzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPWFwcGxpY2F0aW9uL2pzb25gKTtcbn1cbmV4cG9ydHMuZ2V0RGlyZWN0b3J5RGVzY3JpcHRvciA9IGdldERpcmVjdG9yeURlc2NyaXB0b3I7XG5hc3luYyBmdW5jdGlvbiBnZXRSZWZlcmVuY2VzKCkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcmVmc2ApO1xufVxuZXhwb3J0cy5nZXRSZWZlcmVuY2VzID0gZ2V0UmVmZXJlbmNlcztcbmFzeW5jIGZ1bmN0aW9uIGdldFJlZmVyZW5jZShuYW1lKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9yZWZzLyR7bmFtZX1gKTtcbn1cbmV4cG9ydHMuZ2V0UmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlO1xuYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWl0KHNoYSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9YXBwbGljYXRpb24vanNvbmApO1xufVxuZXhwb3J0cy5nZXRDb21taXQgPSBnZXRDb21taXQ7XG5mdW5jdGlvbiBnZXRTaGFDb250ZW50VXJsKHNoYSwgbWltZVR5cGUsIG5hbWUsIGlzRG93bmxvYWQpIHtcbiAgICBpZiAoIXNoYSlcbiAgICAgICAgcmV0dXJuICcjJztcbiAgICBsZXQgYmFzZSA9IGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG1pbWVUeXBlKX1gO1xuICAgIGlmIChpc0Rvd25sb2FkKVxuICAgICAgICBiYXNlICs9IGAmZmlsZU5hbWU9JHtlbmNvZGVVUklDb21wb25lbnQobmFtZSB8fCBzaGEpfWA7XG4gICAgcmV0dXJuIGJhc2U7XG59XG5leHBvcnRzLmdldFNoYUNvbnRlbnRVcmwgPSBnZXRTaGFDb250ZW50VXJsO1xuYXN5bmMgZnVuY3Rpb24gcHV0SXRlbVRvUGxheWxpc3QocGxheWxpc3ROYW1lLCBzaGEsIG1pbWVUeXBlLCBuYW1lKSB7XG4gICAgbGV0IHBheWxvYWQgPSB7XG4gICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICBkYXRlOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgIGlzRGlyZWN0b3J5OiBtaW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JyxcbiAgICAgICAgICAgICAgICBtaW1lVHlwZSxcbiAgICAgICAgICAgICAgICBzaGFcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsucHV0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9wbHVnaW5zL3BsYXlsaXN0cy8ke3BsYXlsaXN0TmFtZX1gLCBwYXlsb2FkKTtcbn1cbmV4cG9ydHMucHV0SXRlbVRvUGxheWxpc3QgPSBwdXRJdGVtVG9QbGF5bGlzdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc3QuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXItZmx1aWQnPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMSB4LWlkPVwidGl0bGVcIiBjbGFzcz1cImFuaW1hdGVkLS1xdWlja1wiPlJhY2Nvb248L2gxPlxuICAgICAgICA8aDQgeC1pZD1cInN1YlRpdGxlXCI+U2VhcmNoIGZvciBzb25nczwvaDQ+XG4gICAgICAgIDxmb3JtIHgtaWQ9XCJmb3JtXCIgY2xhc3M9XCJtdWktZm9ybS0taW5saW5lXCI+XG4gICAgICAgICAgICA8IS0tdGhpcyBpcyBhIGxpdHRsZSBoYWNrIHRvIGhhdmUgdGhpbmdzIGNlbnRlcmVkLS0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW47XCI+8J+UjTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm11aS10ZXh0ZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgeC1pZD1cInRlcm1cIiB0eXBlPVwidGV4dFwiIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiIGF1dG9mb2N1cz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiByb2xlPVwic3VibWl0XCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIj7wn5SNPC9idXR0b24+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgICAgPGJyIC8+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5zZWFyY2hQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBkaXNwbGF5VGl0bGU6ICh0ZW1wbGF0ZSwgZGlzcGxheWVkKSA9PiB7XG4gICAgICAgIGlmIChkaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLnRpdGxlLmNsYXNzTGlzdC5yZW1vdmUoJ2hleGEtLXJlZHVjZWQnKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLnN1YlRpdGxlLnN0eWxlLmRpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QuYWRkKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zdWJUaXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgU25pcHBldHMgPSByZXF1aXJlKFwiLi9odG1sLXNuaXBwZXRzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lcic+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyIHgtaWQ9XCJ0aXRsZVwiPjwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cIml0ZW1zXCIgY2xhc3M9XCJtdWktcGFuZWxcIiBzdHlsZT1cImRpc3BsYXk6IGlubGluZS1ibG9jaztcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLnNlYXJjaFJlc3VsdFBhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIGRpc3BsYXlTZWFyY2hpbmc6IChlbGVtZW50cywgdGVybSkgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLWhpbnRcIj5TZWFyY2hpbmcgJyR7dGVybX0nIC4uLjwvZGl2PmA7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGBgO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgUmVzdWx0cyBmb3IgJyR7dmFsdWVzLnRlcm19J2A7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChTbmlwcGV0cy5pdGVtVG9IdG1sKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZWFyY2gtcmVzdWx0LXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBlbGVtZW50c0RhdGEgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKG9iaiwgaHRtbCkge1xuICAgIGxldCByb290ID0gVWlUb29scy5lbEZyb21IdG1sKGh0bWwpO1xuICAgIG9ialsncm9vdCddID0gcm9vdDtcbiAgICBVaVRvb2xzLmVscyhyb290LCBgW3gtaWRdYCkuZm9yRWFjaChlID0+IG9ialtlLmdldEF0dHJpYnV0ZSgneC1pZCcpXSA9IGUpO1xuICAgIGlmIChyb290Lmhhc0F0dHJpYnV0ZSgneC1pZCcpKVxuICAgICAgICBvYmpbcm9vdC5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSByb290O1xuICAgIGVsZW1lbnRzRGF0YS5zZXQocm9vdCwgb2JqKTtcbiAgICByZXR1cm4gcm9vdDtcbn1cbmV4cG9ydHMuY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuO1xuZnVuY3Rpb24gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCkge1xuICAgIGNvbnN0IGRhdGEgPSBlbGVtZW50c0RhdGEuZ2V0KHJvb3QpO1xuICAgIHJldHVybiBkYXRhO1xufVxuZXhwb3J0cy5nZXRUZW1wbGF0ZUluc3RhbmNlRGF0YSA9IGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhO1xuZnVuY3Rpb24gY3JlYXRlVGVtcGxhdGVJbnN0YW5jZShodG1sKSB7XG4gICAgbGV0IHJvb3QgPSBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4oe30sIGh0bWwpO1xuICAgIHJldHVybiBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YShyb290KTtcbn1cbmV4cG9ydHMuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSA9IGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2U7XG5jb25zdCBFTVBUWV9MT0NBVElPTiA9IHsgZWxlbWVudDogbnVsbCwgY2hpbGRJbmRleDogLTEgfTtcbmZ1bmN0aW9uIHRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihlbGVtZW50cywgZXZlbnQpIHtcbiAgICBsZXQgZWxzID0gbmV3IFNldChPYmplY3QudmFsdWVzKGVsZW1lbnRzKSk7XG4gICAgbGV0IGMgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHAgPSBudWxsO1xuICAgIGRvIHtcbiAgICAgICAgaWYgKGVscy5oYXMoYykpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogYyxcbiAgICAgICAgICAgICAgICBjaGlsZEluZGV4OiBwICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYy5jaGlsZHJlbiwgcClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPT0gZWxlbWVudHMucm9vdClcbiAgICAgICAgICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbiAgICAgICAgcCA9IGM7XG4gICAgICAgIGMgPSBjLnBhcmVudEVsZW1lbnQ7XG4gICAgfSB3aGlsZSAoYyk7XG4gICAgcmV0dXJuIEVNUFRZX0xPQ0FUSU9OO1xufVxuZXhwb3J0cy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24gPSB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb247XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZXMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBlbChpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG59XG5leHBvcnRzLmVsID0gZWw7XG5mdW5jdGlvbiBlbHMoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn1cbmV4cG9ydHMuZWxzID0gZWxzO1xuZnVuY3Rpb24gZWxGcm9tSHRtbChodG1sKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcGFyZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIHBhcmVudC5jaGlsZHJlbi5pdGVtKDApO1xufVxuZXhwb3J0cy5lbEZyb21IdG1sID0gZWxGcm9tSHRtbDtcbmZ1bmN0aW9uIHN0b3BFdmVudChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5leHBvcnRzLnN0b3BFdmVudCA9IHN0b3BFdmVudDtcbmZ1bmN0aW9uKiBpdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50KHN0YXJ0KSB7XG4gICAgd2hpbGUgKHN0YXJ0KSB7XG4gICAgICAgIHlpZWxkIHN0YXJ0O1xuICAgICAgICBzdGFydCA9IHN0YXJ0LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxufVxuZXhwb3J0cy5pdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50ID0gaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVpLXRvb2wuanMubWFwIl0sInNvdXJjZVJvb3QiOiIifQ==
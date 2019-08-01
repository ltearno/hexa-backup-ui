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
                Messages.displayMessage(`cannot add to playlist, nothing playing`);
                return;
            }
            let extension = MimeTypes.extensionFromMimeType(item.mimeType);
            await Rest.putItemToPlaylist(playlist, item.sha, item.mimeType, `${item.name}.${extension}`);
            Messages.displayMessage(`👍 ${item.name} added to playlist '${playlist}'`);
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
    else if (parsed.pathname.startsWith('/browse')) {
        loadReferences();
    }
    else if (parsed.pathname.startsWith('/refs/')) {
        const name = parsed.pathname.substring('/refs/'.length);
        loadReference(name);
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
    popup.messages.innerHTML = messages.map(html => `<div class="mui-panel x-message-panel">${html}</div>`).join('');
}
function displayMessage(html) {
    messages.push(html);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2h0bWwtc25pcHBldHMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZGV4LmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9tZXNzYWdlcy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbWltZS10eXBlcy1tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL25ldHdvcmsuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3Jlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3NlYXJjaC1wYW5lbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXJlc3VsdC1wYW5lbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdGVtcGxhdGVzLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy91aS10b29sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FB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QUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsb0JBQW9CLG1CQUFPLENBQUMsMENBQWE7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEZBQThGLEtBQUs7QUFDbkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0Esb0M7Ozs7Ozs7Ozs7OztBQ3hCQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkM7Ozs7Ozs7Ozs7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQzVDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vcHVibGljL2luZGV4LmpzXCIpO1xuIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBNaW1lVHlwZXMgPSByZXF1aXJlKFwiLi9taW1lLXR5cGVzLW1vZHVsZVwiKTtcbmNvbnN0IE1lc3NhZ2VzID0gcmVxdWlyZShcIi4vbWVzc2FnZXNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPVwiYXVkaW8tZm9vdGVyIG11aS1wYW5lbFwiPlxuICAgIDxoMyBjbGFzcz1cIngtd2hlbi1sYXJnZS1kaXNwbGF5XCI+UGxheWxpc3Q8L2gzPlxuICAgIDxkaXYgeC1pZD1cInBsYXlsaXN0XCI+PC9kaXY+XG4gICAgPGRpdiB4LWlkPVwiZXhwYW5kZXJcIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWNlbnRlclwiPuKYsDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ4LWhvcml6b250YWwtZmxleFwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIj5cbiAgICAgICAgPGF1ZGlvIHgtaWQ9XCJwbGF5ZXJcIiBjbGFzcz1cImF1ZGlvLXBsYXllclwiIGNvbnRyb2xzIHByZWxvYWQ9XCJtZXRhZGF0YVwiPjwvYXVkaW8+XG4gICAgICAgIDxhIHgtaWQ9XCJhZGRQbGF5bGlzdEJ1dHRvblwiIGhyZWY9XCIjdG90b1wiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mYWJcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICNmZjQwODE3MzsgY29sb3I6IHdoaXRlO1wiPisgUEwuPC9hPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuYXVkaW9QYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBwbGF5OiAoZWxlbWVudHMsIG5hbWUsIHNoYSwgbWltZVR5cGUpID0+IHtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgnc3JjJywgYCR7UmVzdC5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9JHttaW1lVHlwZX1gKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgndHlwZScsIG1pbWVUeXBlKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnBsYXkoKTtcbiAgICAgICAgZWxlbWVudHMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpO1xuICAgIH0sXG59O1xuY2xhc3MgQXVkaW9KdWtlYm94IHtcbiAgICBjb25zdHJ1Y3RvcihhdWRpb1BhbmVsKSB7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbCA9IGF1ZGlvUGFuZWw7XG4gICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgLy8gaWYgc2Nyb2xsIHRvIHBsYXlpbmcgaXRlbSBpcyByZXF1aXJlZCBhZnRlciBhIHBsYXlsaXN0IHJlZHJhd1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHF1ZXVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncGxheWxpc3QtYmFja3VwJykpO1xuICAgICAgICAgICAgaWYgKHF1ZXVlICYmIHF1ZXVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yIGxvYWRpbmcgcXVldWUgZnJvbSBsb2NhbCBzdG9yYWdlYCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMgPSBVaVRvb2xzLmVscyh0aGlzLmF1ZGlvUGFuZWwucm9vdCwgJy54LXdoZW4tbGFyZ2UtZGlzcGxheScpO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBhdWRpbyBwbGF5ZXIgZXJyb3JgKTtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RhbGxlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbGVkLCB0cnkgbmV4dCcpO1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmV4cGFuZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSAhdGhpcy5sYXJnZURpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBVaVRvb2xzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QXR0ciA9IGUuZ2V0QXR0cmlidXRlKCd4LXF1ZXVlLWluZGV4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleEF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4QXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gTmFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmFkZFBsYXlsaXN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBVaVRvb2xzLnN0b3BFdmVudChldmVudCk7XG4gICAgICAgICAgICBjb25zdCBwbGF5bGlzdCA9ICdmYXZvcml0ZXMnOyAvLyB0b2RvIHNob3VsZCBiZSBhIHBhcmFtZXRlci4uLlxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgY2Fubm90IGFkZCB0byBwbGF5bGlzdCwgbm90aGluZyBwbGF5aW5nYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGV4dGVuc2lvbiA9IE1pbWVUeXBlcy5leHRlbnNpb25Gcm9tTWltZVR5cGUoaXRlbS5taW1lVHlwZSk7XG4gICAgICAgICAgICBhd2FpdCBSZXN0LnB1dEl0ZW1Ub1BsYXlsaXN0KHBsYXlsaXN0LCBpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSwgYCR7aXRlbS5uYW1lfS4ke2V4dGVuc2lvbn1gKTtcbiAgICAgICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGDwn5GNICR7aXRlbS5uYW1lfSBhZGRlZCB0byBwbGF5bGlzdCAnJHtwbGF5bGlzdH0nYCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBjdXJyZW50SXRlbSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgMCB8fCB0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgfVxuICAgIGFkZEFuZFBsYXkoaXRlbSkge1xuICAgICAgICBpdGVtID0ge1xuICAgICAgICAgICAgc2hhOiBpdGVtLnNoYSxcbiAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBpdGVtLm1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLnNoYSA9PSBpdGVtLnNoYSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgIH1cbiAgICBwbGF5TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlOZXh0VW5yb2xsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1VbnJvbGxlci51bnJvbGwoKTtcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRJdGVtVW5yb2xsZXIoaXRlbVVucm9sbGVyKSB7XG4gICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gaXRlbVVucm9sbGVyO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBwdXNoUXVldWVBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaWYgKCFpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXVlKSk7XG4gICAgICAgIHRoaXMucGxheSh0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBwbGF5KGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5xdWV1ZVtpbmRleF07XG4gICAgICAgICAgICBleHBvcnRzLmF1ZGlvUGFuZWwucGxheSh0aGlzLmF1ZGlvUGFuZWwsIGl0ZW0ubmFtZSwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW3gtZm9yLXNoYT0nJHtpdGVtLnNoYS5zdWJzdHIoMCwgNSl9J11gKS5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy13ZWlnaHRlZCcpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnJlc2hUaW1lcilcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlZnJlc2hUaW1lcik7XG4gICAgICAgIHRoaXMucmVmcmVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlYWxSZWZyZXNoUGxheWxpc3QoKSwgMTApO1xuICAgIH1cbiAgICByZWFsUmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAoIXRoaXMucXVldWUgfHwgIXRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPlRoZXJlIGFyZSBubyBpdGVtcyBpbiB5b3VyIHBsYXlsaXN0LiBDbGljayBvbiBzb25ncyB0byBwbGF5IHRoZW0uPC9zcGFuPic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBodG1sID0gYGA7XG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbChpLCBpdGVtLm5hbWUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPjxhIHgtaWQ9J2NsZWFyLXBsYXlsaXN0JyBocmVmPScjJz5jbGVhciBwbGF5bGlzdDwvYT48L2Rpdj5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA+PSAwICYmIHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbCh0aGlzLmN1cnJlbnRJbmRleCwgdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF0ubmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLmN1cnJlbnRJbmRleCArIDF9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeSBpcy1vbmVsaW5ldGV4dFwiPmZvbGxvd2VkIGJ5ICcke3RoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXggKyAxXS5uYW1lLnN1YnN0cigwLCAyMCl9JyAuLi48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgLy8gYWZ0ZXIgcmVmcmVzaCBzdGVwc1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkgJiYgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxUb3AgPSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlsaXN0SXRlbUh0bWwoaW5kZXgsIG5hbWUsIG9uZUxpbmVUZXh0KSB7XG4gICAgICAgIHJldHVybiBgPGRpdiB4LXF1ZXVlLWluZGV4PVwiJHtpbmRleH1cIiBjbGFzcz1cIm9uY2xpY2sgJHtvbmVMaW5lVGV4dCA/ICdpcy1vbmVsaW5ldGV4dCcgOiAnJ30gJHtpbmRleCA9PSB0aGlzLmN1cnJlbnRJbmRleCA/ICdtdWktLXRleHQtaGVhZGxpbmUnIDogJyd9XCI+JHtuYW1lfTwvZGl2PmA7XG4gICAgfVxufVxuZXhwb3J0cy5BdWRpb0p1a2Vib3ggPSBBdWRpb0p1a2Vib3g7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdWRpby1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZnVuY3Rpb24gd2FpdChkdXJhdGlvbikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZHVyYXRpb24pKTtcbn1cbmNsYXNzIEF1dGgge1xuICAgIG9uRXJyb3IoKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gICAgYXN5bmMgbG9vcCgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvYXV0aGApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL3NldENvb2tpZWAsIHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cmVzcG9uc2UudG9rZW59YCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXMgfHwgIXJlcy5saWZldGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHNldENvb2tpZWAsIHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IG9idGFpbiBhdXRoIHRva2VuYCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3QgcmVmcmVzaCBhdXRoICgke2Vycn0pYCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBldmVyeSAzMCBtaW51dGVzXG4gICAgICAgICAgICBhd2FpdCB3YWl0KDEwMDAgKiA2MCAqIDMwKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGF1dG9SZW5ld0F1dGgoKSB7XG4gICAgbGV0IGF1dGggPSBuZXcgQXV0aCgpO1xuICAgIGF1dGgubG9vcCgpO1xufVxuZXhwb3J0cy5hdXRvUmVuZXdBdXRoID0gYXV0b1JlbmV3QXV0aDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1dGguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFNuaXBwZXRzID0gcmVxdWlyZShcIi4vaHRtbC1zbmlwcGV0c1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXInPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMiB4LWlkPVwidGl0bGVcIj48L2gyPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJpdGVtc1wiIGNsYXNzPVwibXVpLXBhbmVsXCIgc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5kaXJlY3RvcnlQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBzZXRMb2FkaW5nOiAoZWxlbWVudHMsIHRpdGxlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGBMb2FkaW5nICcke3RpdGxlfScgLi4uYDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYGA7XG4gICAgfSxcbiAgICBzZXRWYWx1ZXM6IChlbGVtZW50cywgdmFsdWVzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGAke3ZhbHVlcy5uYW1lfWA7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChTbmlwcGV0cy5pdGVtVG9IdG1sKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RvcnktcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmZ1bmN0aW9uIGl0ZW1Ub0h0bWwoZikge1xuICAgIGlmIChmLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKVxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJvbmNsaWNrXCI+PGk+JHtmLm5hbWV9IC4uLjwvaT48L2Rpdj5gO1xuICAgIGVsc2UgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3JlZmVyZW5jZScpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSlcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEgJiYgZi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPiR7Zi5uYW1lfTwvZGl2PmA7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYSAmJiBmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+PGEgaHJlZj1cIiR7UmVzdC5nZXRTaGFDb250ZW50VXJsKGYuc2hhLCBmLm1pbWVUeXBlLCBmLm5hbWUsIGZhbHNlKX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2YubmFtZX08L2E+IDxhIGNsYXNzPVwibXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5XCIgaHJlZj1cIiR7UmVzdC5nZXRTaGFDb250ZW50VXJsKGYuc2hhLCBmLm1pbWVUeXBlLCBmLm5hbWUsIHRydWUpfVwiPmRsPC9hPjwvZGl2PmA7XG59XG5leHBvcnRzLml0ZW1Ub0h0bWwgPSBpdGVtVG9IdG1sO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbC1zbmlwcGV0cy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1wYW5lbFwiKTtcbmNvbnN0IFNlYXJjaFJlc3VsdFBhbmVsID0gcmVxdWlyZShcIi4vc2VhcmNoLXJlc3VsdC1wYW5lbFwiKTtcbmNvbnN0IEF1ZGlvUGFuZWwgPSByZXF1aXJlKFwiLi9hdWRpby1wYW5lbFwiKTtcbmNvbnN0IERpcmVjdG9yeVBhbmVsID0gcmVxdWlyZShcIi4vZGlyZWN0b3J5LXBhbmVsXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBBdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbmNvbnN0IFRlbXBsYXRlcyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IE1pbWVUeXBlcyA9IHJlcXVpcmUoXCIuL21pbWUtdHlwZXMtbW9kdWxlXCIpO1xuLypcbmhhc2ggdXJscyA6XG5cbi0gJycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVcbi0gJyMvJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVcbi0gJyMnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVcbi0gJyMvc2VhcmNoLzp0ZXJtICAgICAgICAgICAgICAgICAgIHNlYXJjaFxuLSAnIy9kaXJlY3Rvcmllcy86c2hhP25hbWU9eHh4ICAgICAgZGlyZWN0b3J5XG4tICcjL2Jyb3dzZSdcbi0gJyMvcmVmcy86bmFtZSdcbiovXG5mdW5jdGlvbiBwYXJzZVVSTCh1cmwpIHtcbiAgICB2YXIgcGFyc2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpLCBzZWFyY2hPYmplY3QgPSB7fSwgcXVlcmllcywgc3BsaXQsIGk7XG4gICAgLy8gTGV0IHRoZSBicm93c2VyIGRvIHRoZSB3b3JrXG4gICAgcGFyc2VyLmhyZWYgPSB1cmw7XG4gICAgLy8gQ29udmVydCBxdWVyeSBzdHJpbmcgdG8gb2JqZWN0XG4gICAgcXVlcmllcyA9IHBhcnNlci5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKS5zcGxpdCgnJicpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBxdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNwbGl0ID0gcXVlcmllc1tpXS5zcGxpdCgnPScpO1xuICAgICAgICBzZWFyY2hPYmplY3Rbc3BsaXRbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KHNwbGl0WzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aG5hbWU6IGRlY29kZVVSSUNvbXBvbmVudChwYXJzZXIucGF0aG5hbWUpLFxuICAgICAgICBzZWFyY2hPYmplY3Q6IHNlYXJjaE9iamVjdFxuICAgIH07XG59XG5mdW5jdGlvbiByZWFkSGFzaEFuZEFjdCgpIHtcbiAgICBsZXQgaGFzaCA9ICcnO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAmJiB3aW5kb3cubG9jYXRpb24uaGFzaC5zdGFydHNXaXRoKCcjJykpXG4gICAgICAgIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gICAgbGV0IHBhcnNlZCA9IHBhcnNlVVJMKGhhc2gpO1xuICAgIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3NlYXJjaC8nKSkge1xuICAgICAgICBzZWFyY2hJdGVtcyhwYXJzZWQucGF0aG5hbWUuc3Vic3RyKCcvc2VhcmNoLycubGVuZ3RoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvZGlyZWN0b3JpZXMvJykpIHtcbiAgICAgICAgY29uc3Qgc2hhID0gcGFyc2VkLnBhdGhuYW1lLnN1YnN0cmluZygnL2RpcmVjdG9yaWVzLycubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnNlZC5zZWFyY2hPYmplY3QubmFtZSB8fCBzaGE7XG4gICAgICAgIGxvYWREaXJlY3Rvcnkoe1xuICAgICAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgICAgIHNoYSxcbiAgICAgICAgICAgIG5hbWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvYnJvd3NlJykpIHtcbiAgICAgICAgbG9hZFJlZmVyZW5jZXMoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9yZWZzLycpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvcmVmcy8nLmxlbmd0aCk7XG4gICAgICAgIGxvYWRSZWZlcmVuY2UobmFtZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhgdW5rb3duIHBhdGggJHtwYXJzZWQucGF0aG5hbWV9YCk7XG4gICAgfVxufVxuY29uc3Qgc2VhcmNoUGFuZWwgPSBTZWFyY2hQYW5lbC5zZWFyY2hQYW5lbC5jcmVhdGUoKTtcbmNvbnN0IHNlYXJjaFJlc3VsdFBhbmVsID0gU2VhcmNoUmVzdWx0UGFuZWwuc2VhcmNoUmVzdWx0UGFuZWwuY3JlYXRlKCk7XG5jb25zdCBhdWRpb1BhbmVsID0gQXVkaW9QYW5lbC5hdWRpb1BhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9KdWtlYm94ID0gbmV3IEF1ZGlvUGFuZWwuQXVkaW9KdWtlYm94KGF1ZGlvUGFuZWwpO1xuY29uc3QgZGlyZWN0b3J5UGFuZWwgPSBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5jcmVhdGUoKTtcbmxldCBhY3R1YWxDb250ZW50ID0gbnVsbDtcbmZ1bmN0aW9uIHNldENvbnRlbnQoY29udGVudCkge1xuICAgIGlmIChjb250ZW50ID09PSBhY3R1YWxDb250ZW50KVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudCAmJiBhY3R1YWxDb250ZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYWN0dWFsQ29udGVudCk7XG4gICAgYWN0dWFsQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIFVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKGNvbnRlbnQsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbn1cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW9QYW5lbC5yb290KTtcblVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKHNlYXJjaFBhbmVsLnJvb3QsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbkF1dGguYXV0b1JlbmV3QXV0aCgpO1xuLyoqXG4gKiBXYWl0ZXIgdG9vbFxuICovXG5jb25zdCBiZWdpbldhaXQgPSAoY2FsbGJhY2spID0+IHtcbiAgICBsZXQgaXNEb25lID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCgoKSA9PiBpc0RvbmUgfHwgY2FsbGJhY2soKSwgNTAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgICAgICBpc0RvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4vKipcbiAqIEV2ZW50c1xuICovXG5sZXQgbGFzdERpc3BsYXllZEZpbGVzID0gbnVsbDtcbmxldCBsYXN0U2VhcmNoVGVybSA9IG51bGw7IC8vIEhBQ0sgdmVyeSB0ZW1wb3JhcnlcbmZ1bmN0aW9uIGJlYXV0aWZ5TmFtZXMoaXRlbXMpIHtcbiAgICByZXR1cm4gaXRlbXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBpZiAoZmlsZS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICAgICAgbGV0IGRvdCA9IGZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICAgICAgaWYgKGRvdClcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUuc3Vic3RyaW5nKDAsIGRvdCk7XG4gICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvJ18nL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvJyAgJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1sgXSotWyBdKi9nLCAnIC0gJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBnb1NlYXJjaEl0ZW1zKHRlcm0pIHtcbiAgICBjb25zdCB1cmwgPSBgIy9zZWFyY2gvJHt0ZXJtfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5hc3luYyBmdW5jdGlvbiBzZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuZGlzcGxheVRpdGxlKHNlYXJjaFBhbmVsLCBmYWxzZSk7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLmRpc3BsYXlTZWFyY2hpbmcoc2VhcmNoUmVzdWx0UGFuZWwsIHRlcm0pO1xuICAgIH0pO1xuICAgIGxldCByZXMgPSBhd2FpdCBSZXN0LnNlYXJjaCh0ZXJtLCAnYXVkaW8vJScpO1xuICAgIC8vIGZpcnN0IGZpbGVzIHRoZW4gZGlyZWN0b3JpZXNcbiAgICByZXMuaXRlbXMgPSByZXMuaXRlbXMuZmlsdGVyKGkgPT4gIWkubWltZVR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vZGlyZWN0b3J5JykpLmNvbmNhdChyZXMuaXRlbXMuZmlsdGVyKGkgPT4gaS5taW1lVHlwZS5zdGFydHNXaXRoKCdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSkpO1xuICAgIHJlcy5pdGVtcyA9IGJlYXV0aWZ5TmFtZXMocmVzLml0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgU2VhcmNoUmVzdWx0UGFuZWwuc2VhcmNoUmVzdWx0UGFuZWwuc2V0VmFsdWVzKHNlYXJjaFJlc3VsdFBhbmVsLCB7XG4gICAgICAgIHRlcm06IHRlcm0sXG4gICAgICAgIGl0ZW1zOiByZXMuaXRlbXNcbiAgICB9KTtcbn1cbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGxldCB0ZXJtID0gc2VhcmNoUGFuZWwudGVybS52YWx1ZTtcbiAgICBzZWFyY2hQYW5lbC50ZXJtLmJsdXIoKTtcbiAgICBnb1NlYXJjaEl0ZW1zKHRlcm0pO1xufSk7XG5mdW5jdGlvbiBnZXRNaW1lVHlwZShmKSB7XG4gICAgaWYgKGYuaXNEaXJlY3RvcnkpXG4gICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JztcbiAgICBsZXQgcG9zID0gZi5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIGxldCBleHRlbnNpb24gPSBmLm5hbWUuc3Vic3RyKHBvcyArIDEpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChleHRlbnNpb24gaW4gTWltZVR5cGVzLk1pbWVUeXBlcylcbiAgICAgICAgICAgIHJldHVybiBNaW1lVHlwZXMuTWltZVR5cGVzW2V4dGVuc2lvbl07XG4gICAgfVxuICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbn1cbmZ1bmN0aW9uIGRpcmVjdG9yeURlc2NyaXB0b3JUb0ZpbGVEZXNjcmlwdG9yKGQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaGE6IGQuY29udGVudFNoYSxcbiAgICAgICAgbmFtZTogZC5uYW1lLFxuICAgICAgICBtaW1lVHlwZTogZ2V0TWltZVR5cGUoZCksXG4gICAgICAgIGxhc3RXcml0ZTogZC5sYXN0V3JpdGUsXG4gICAgICAgIHNpemU6IGQuc2l6ZVxuICAgIH07XG59XG5mdW5jdGlvbiBnb0xvYWREaXJlY3Rvcnkoc2hhLCBuYW1lKSB7XG4gICAgY29uc3QgdXJsID0gYCMvZGlyZWN0b3JpZXMvJHtzaGF9P25hbWU9JHtlbmNvZGVVUklDb21wb25lbnQobGFzdFNlYXJjaFRlcm0gPyAobGFzdFNlYXJjaFRlcm0gKyAnLycgKyBuYW1lKSA6IG5hbWUpfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5mdW5jdGlvbiBnb1JlZmVyZW5jZShuYW1lKSB7XG4gICAgY29uc3QgdXJsID0gYCMvcmVmcy8ke25hbWV9YDtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWREaXJlY3RvcnkoaXRlbSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBpdGVtLm5hbWUpO1xuICAgIH0pO1xuICAgIGxldCBkaXJlY3RvcnlEZXNjcmlwdG9yID0gYXdhaXQgUmVzdC5nZXREaXJlY3RvcnlEZXNjcmlwdG9yKGl0ZW0uc2hhKTtcbiAgICBsZXQgaXRlbXMgPSBkaXJlY3RvcnlEZXNjcmlwdG9yLmZpbGVzLm1hcChkaXJlY3RvcnlEZXNjcmlwdG9yVG9GaWxlRGVzY3JpcHRvcik7XG4gICAgaXRlbXMgPSBiZWF1dGlmeU5hbWVzKGl0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9IGl0ZW0ubmFtZTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldFZhbHVlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgIGl0ZW1zXG4gICAgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUmVmZXJlbmNlcygpIHtcbiAgICBsZXQgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIFwiUmVmZXJlbmNlc1wiKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlcygpO1xuICAgIGxldCBpdGVtcyA9IHJlZmVyZW5jZXMubWFwKHJlZmVyZW5jZSA9PiAoe1xuICAgICAgICBuYW1lOiByZWZlcmVuY2UsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9yZWZlcmVuY2UnLFxuICAgICAgICBzaGE6IHJlZmVyZW5jZSxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9ICcnO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgIG5hbWU6IFwiUmVmZXJlbmNlc1wiLFxuICAgICAgICBpdGVtc1xuICAgIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFJlZmVyZW5jZShuYW1lKSB7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIGBSZWZlcmVuY2UgJyR7bmFtZX0nYCk7XG4gICAgfSk7XG4gICAgbGV0IHJlZmVyZW5jZSA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlKG5hbWUpO1xuICAgIGxldCBjb21taXQgPSBhd2FpdCBSZXN0LmdldENvbW1pdChyZWZlcmVuY2UuY3VycmVudENvbW1pdFNoYSk7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgYXdhaXQgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgIHNoYTogY29tbWl0LmRpcmVjdG9yeURlc2NyaXB0b3JTaGEsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JyxcbiAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICBzaXplOiAwXG4gICAgfSk7XG59XG5mdW5jdGlvbiBpdGVtRGVmYXVsdEFjdGlvbihjaGlsZEluZGV4KSB7XG4gICAgbGV0IGl0ZW0gPSBsYXN0RGlzcGxheWVkRmlsZXNbY2hpbGRJbmRleF07XG4gICAgaWYgKGl0ZW0ubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpIHtcbiAgICAgICAgZ29Mb2FkRGlyZWN0b3J5KGl0ZW0uc2hhLCBpdGVtLm5hbWUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9yZWZlcmVuY2UnKSB7XG4gICAgICAgIGdvUmVmZXJlbmNlKGl0ZW0uc2hhKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICBhdWRpb0p1a2Vib3guYWRkQW5kUGxheShpdGVtKTtcbiAgICAgICAgLy8gc2V0IGFuIHVucm9sbGVyXG4gICAgICAgIGlmIChjaGlsZEluZGV4ID49IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRlcm0gPSBsYXN0U2VhcmNoVGVybTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxlZEl0ZW1zID0gbGFzdERpc3BsYXllZEZpbGVzLnNsaWNlKGNoaWxkSW5kZXggKyAxKS5maWx0ZXIoZiA9PiBmLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAodW5yb2xsZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRoZW4gJyR7dW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleF0ubmFtZS5zdWJzdHIoMCwgMjApfScgYW5kICR7dW5yb2xsZWRJdGVtcy5sZW5ndGggLSB1bnJvbGxJbmRleCAtIDF9IG90aGVyICcke3Rlcm19JyBpdGVtcy4uLmA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGZpbmlzaGVkICcke3Rlcm19IHNvbmdzYDtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiB1bnJvbGxlZEl0ZW1zW3Vucm9sbEluZGV4KytdLFxuICAgICAgICAgICAgICAgICAgICBoYXNOZXh0OiAoKSA9PiB1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbnNlYXJjaFJlc3VsdFBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIHNlYXJjaFJlc3VsdFBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihzZWFyY2hSZXN1bHRQYW5lbCwgZXZlbnQpO1xuICAgIGlmIChsYXN0RGlzcGxheWVkRmlsZXMgJiYgZWxlbWVudCA9PSBzZWFyY2hSZXN1bHRQYW5lbC5pdGVtcyAmJiBjaGlsZEluZGV4ID49IDAgJiYgY2hpbGRJbmRleCA8IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCk7XG4gICAgfVxufSk7XG5kaXJlY3RvcnlQYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgLy8gdG9kbyA6IGtub3dubGVkZ2UgdG8gZG8gdGhhdCBpcyBpbiBkaXJlY3RvcnlQYW5lbFxuICAgIGxldCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IFRlbXBsYXRlcy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZGlyZWN0b3J5UGFuZWwsIGV2ZW50KTtcbiAgICBpZiAobGFzdERpc3BsYXllZEZpbGVzICYmIGVsZW1lbnQgPT0gZGlyZWN0b3J5UGFuZWwuaXRlbXMgJiYgY2hpbGRJbmRleCA+PSAwICYmIGNoaWxkSW5kZXggPCBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGl0ZW1EZWZhdWx0QWN0aW9uKGNoaWxkSW5kZXgpO1xuICAgIH1cbn0pO1xucmVhZEhhc2hBbmRBY3QoKTtcbndpbmRvdy5vbnBvcHN0YXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgcmVhZEhhc2hBbmRBY3QoKTtcbiAgICAvKmlmIChldmVudC5zdGF0ZSkge1xuICAgICAgICBjdXJyZW50RGlyZWN0b3J5RGVzY3JpcHRvclNoYSA9IGV2ZW50LnN0YXRlLmN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhXG4gICAgICAgIGN1cnJlbnRDbGllbnRJZCA9IGV2ZW50LnN0YXRlLmN1cnJlbnRDbGllbnRJZFxuICAgICAgICBjdXJyZW50UGljdHVyZUluZGV4ID0gZXZlbnQuc3RhdGUuY3VycmVudFBpY3R1cmVJbmRleCB8fCAwXG4gXG4gICAgICAgIGlmICghY3VycmVudENsaWVudElkKVxuICAgICAgICAgICAgZWwoXCIjbWVudVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpXG4gXG4gICAgICAgIHN5bmNVaSgpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmcm9tSGFzaCgpXG4gXG4gICAgICAgIHN5bmNVaSgpXG4gICAgfSovXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmxldCBtZXNzYWdlcyA9IFtdO1xuY29uc3QgcG9wdXBUZW1wbGF0ZSA9IGBcbiAgICA8ZGl2IHgtaWQ9XCJtZXNzYWdlc1wiPlxuICAgIDwvZGl2PmA7XG5sZXQgcG9wdXAgPSB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHBvcHVwVGVtcGxhdGUpO1xuZnVuY3Rpb24gcmVmcmVzaCgpIHtcbiAgICBwb3B1cC5tZXNzYWdlcy5pbm5lckhUTUwgPSBtZXNzYWdlcy5tYXAoaHRtbCA9PiBgPGRpdiBjbGFzcz1cIm11aS1wYW5lbCB4LW1lc3NhZ2UtcGFuZWxcIj4ke2h0bWx9PC9kaXY+YCkuam9pbignJyk7XG59XG5mdW5jdGlvbiBkaXNwbGF5TWVzc2FnZShodG1sKSB7XG4gICAgbWVzc2FnZXMucHVzaChodG1sKTtcbiAgICByZWZyZXNoKCk7XG4gICAgaWYgKCFwb3B1cC5yb290LmlzQ29ubmVjdGVkKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBvcHVwLnJvb3QpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBtZXNzYWdlcy5zaGlmdCgpO1xuICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIGlmICghbWVzc2FnZXMubGVuZ3RoKVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChwb3B1cC5yb290KTtcbiAgICB9LCA0MDAwKTtcbn1cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBkaXNwbGF5TWVzc2FnZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lc3NhZ2VzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZXh0ZW5zaW9uRnJvbU1pbWVUeXBlKG1pbWVUeXBlKSB7XG4gICAgZm9yIChsZXQgW2V4dGVuc2lvbiwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGV4cG9ydHMuTWltZVR5cGVzKSkge1xuICAgICAgICBpZiAobWltZVR5cGUgPT0gdmFsdWUpXG4gICAgICAgICAgICByZXR1cm4gZXh0ZW5zaW9uO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydHMuZXh0ZW5zaW9uRnJvbU1pbWVUeXBlID0gZXh0ZW5zaW9uRnJvbU1pbWVUeXBlO1xuZXhwb3J0cy5NaW1lVHlwZXMgPSB7XG4gICAgXCIzZG1sXCI6IFwidGV4dC92bmQuaW4zZC4zZG1sXCIsXG4gICAgXCIzZHNcIjogXCJpbWFnZS94LTNkc1wiLFxuICAgIFwiM2cyXCI6IFwidmlkZW8vM2dwcDJcIixcbiAgICBcIjNncFwiOiBcInZpZGVvLzNncHBcIixcbiAgICBcIjd6XCI6IFwiYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkXCIsXG4gICAgXCJhYWJcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJhYWNcIjogXCJhdWRpby94LWFhY1wiLFxuICAgIFwiYWFtXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLW1hcFwiLFxuICAgIFwiYWFzXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLXNlZ1wiLFxuICAgIFwiYWJ3XCI6IFwiYXBwbGljYXRpb24veC1hYml3b3JkXCIsXG4gICAgXCJhY1wiOiBcImFwcGxpY2F0aW9uL3BraXgtYXR0ci1jZXJ0XCIsXG4gICAgXCJhY2NcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1lcmljYW5keW5hbWljcy5hY2NcIixcbiAgICBcImFjZVwiOiBcImFwcGxpY2F0aW9uL3gtYWNlLWNvbXByZXNzZWRcIixcbiAgICBcImFjdVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb2JvbFwiLFxuICAgIFwiYWN1dGNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ycFwiLFxuICAgIFwiYWRwXCI6IFwiYXVkaW8vYWRwY21cIixcbiAgICBcImFlcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hdWRpb2dyYXBoXCIsXG4gICAgXCJhZm1cIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcImFmcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJhaGVhZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5haGVhZC5zcGFjZVwiLFxuICAgIFwiYWlcIjogXCJhcHBsaWNhdGlvbi9wb3N0c2NyaXB0XCIsXG4gICAgXCJhaWZcIjogXCJhdWRpby94LWFpZmZcIixcbiAgICBcImFpZmNcIjogXCJhdWRpby94LWFpZmZcIixcbiAgICBcImFpZmZcIjogXCJhdWRpby94LWFpZmZcIixcbiAgICBcImFpclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5haXItYXBwbGljYXRpb24taW5zdGFsbGVyLXBhY2thZ2UremlwXCIsXG4gICAgXCJhaXRcIjogXCJhcHBsaWNhdGlvbi92bmQuZHZiLmFpdFwiLFxuICAgIFwiYW1pXCI6IFwiYXBwbGljYXRpb24vdm5kLmFtaWdhLmFtaVwiLFxuICAgIFwiYXBlXCI6IFwiYXVkaW8vYXBlXCIsXG4gICAgXCJhcGtcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmVcIixcbiAgICBcImFwcGNhY2hlXCI6IFwidGV4dC9jYWNoZS1tYW5pZmVzdFwiLFxuICAgIFwiYXBwbGljYXRpb25cIjogXCJhcHBsaWNhdGlvbi94LW1zLWFwcGxpY2F0aW9uXCIsXG4gICAgXCJhcHJcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtYXBwcm9hY2hcIixcbiAgICBcImFyY1wiOiBcImFwcGxpY2F0aW9uL3gtZnJlZWFyY1wiLFxuICAgIFwiYXNhXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNheFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiYXNjXCI6IFwiYXBwbGljYXRpb24vcGdwLXNpZ25hdHVyZVwiLFxuICAgIFwiYXNjeFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzZlwiOiBcInZpZGVvL3gtbXMtYXNmXCIsXG4gICAgXCJhc2h4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNtXCI6IFwidGV4dC94LWFzbVwiLFxuICAgIFwiYXNteFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmFzb1wiLFxuICAgIFwiYXNwXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNweFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzeFwiOiBcInZpZGVvL3gtbXMtYXNmXCIsXG4gICAgXCJhdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ycFwiLFxuICAgIFwiYXRvbVwiOiBcImFwcGxpY2F0aW9uL2F0b20reG1sXCIsXG4gICAgXCJhdG9tY2F0XCI6IFwiYXBwbGljYXRpb24vYXRvbWNhdCt4bWxcIixcbiAgICBcImF0b21zdmNcIjogXCJhcHBsaWNhdGlvbi9hdG9tc3ZjK3htbFwiLFxuICAgIFwiYXR4XCI6IFwiYXBwbGljYXRpb24vdm5kLmFudGl4LmdhbWUtY29tcG9uZW50XCIsXG4gICAgXCJhdVwiOiBcImF1ZGlvL2Jhc2ljXCIsXG4gICAgXCJhdmlcIjogXCJ2aWRlby94LW1zdmlkZW9cIixcbiAgICBcImF3XCI6IFwiYXBwbGljYXRpb24vYXBwbGl4d2FyZVwiLFxuICAgIFwiYXhkXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXpmXCI6IFwiYXBwbGljYXRpb24vdm5kLmFpcnppcC5maWxlc2VjdXJlLmF6ZlwiLFxuICAgIFwiYXpzXCI6IFwiYXBwbGljYXRpb24vdm5kLmFpcnppcC5maWxlc2VjdXJlLmF6c1wiLFxuICAgIFwiYXp3XCI6IFwiYXBwbGljYXRpb24vdm5kLmFtYXpvbi5lYm9va1wiLFxuICAgIFwiYmF0XCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJiY3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtYmNwaW9cIixcbiAgICBcImJkZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1iZGZcIixcbiAgICBcImJkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0rd2J4bWxcIixcbiAgICBcImJlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWFsdm5jLmJlZFwiLFxuICAgIFwiYmgyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNwcnNcIixcbiAgICBcImJpblwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiYmxiXCI6IFwiYXBwbGljYXRpb24veC1ibG9yYlwiLFxuICAgIFwiYmxvcmJcIjogXCJhcHBsaWNhdGlvbi94LWJsb3JiXCIsXG4gICAgXCJibWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYm1pXCIsXG4gICAgXCJibXBcIjogXCJpbWFnZS9ibXBcIixcbiAgICBcImJvb2tcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwiYm94XCI6IFwiYXBwbGljYXRpb24vdm5kLnByZXZpZXdzeXN0ZW1zLmJveFwiLFxuICAgIFwiYm96XCI6IFwiYXBwbGljYXRpb24veC1iemlwMlwiLFxuICAgIFwiYnBrXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJidGlmXCI6IFwiaW1hZ2UvcHJzLmJ0aWZcIixcbiAgICBcImJ6XCI6IFwiYXBwbGljYXRpb24veC1iemlwXCIsXG4gICAgXCJiejJcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXAyXCIsXG4gICAgXCJjXCI6IFwidGV4dC94LWNcIixcbiAgICBcImMxMWFtY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnXCIsXG4gICAgXCJjMTFhbXpcIjogXCJhcHBsaWNhdGlvbi92bmQuY2x1ZXRydXN0LmNhcnRvbW9iaWxlLWNvbmZpZy1wa2dcIixcbiAgICBcImM0ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNGZcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRnXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNHVcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiY2FiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWNhYi1jb21wcmVzc2VkXCIsXG4gICAgXCJjYWZcIjogXCJhdWRpby94LWNhZlwiLFxuICAgIFwiY2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwiY2FyXCI6IFwiYXBwbGljYXRpb24vdm5kLmN1cmwuY2FyXCIsXG4gICAgXCJjYXRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcGtpLnNlY2NhdFwiLFxuICAgIFwiY2I3XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNiYVwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnJcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2J0XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNielwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjY1wiOiBcInRleHQveC1jXCIsXG4gICAgXCJjY3RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjY3htbFwiOiBcImFwcGxpY2F0aW9uL2NjeG1sK3htbFwiLFxuICAgIFwiY2RiY21zZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jb250YWN0LmNtc2dcIixcbiAgICBcImNkZlwiOiBcImFwcGxpY2F0aW9uL3gtbmV0Y2RmXCIsXG4gICAgXCJjZGtleVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZWRpYXN0YXRpb24uY2RrZXlcIixcbiAgICBcImNkbWlhXCI6IFwiYXBwbGljYXRpb24vY2RtaS1jYXBhYmlsaXR5XCIsXG4gICAgXCJjZG1pY1wiOiBcImFwcGxpY2F0aW9uL2NkbWktY29udGFpbmVyXCIsXG4gICAgXCJjZG1pZFwiOiBcImFwcGxpY2F0aW9uL2NkbWktZG9tYWluXCIsXG4gICAgXCJjZG1pb1wiOiBcImFwcGxpY2F0aW9uL2NkbWktb2JqZWN0XCIsXG4gICAgXCJjZG1pcVwiOiBcImFwcGxpY2F0aW9uL2NkbWktcXVldWVcIixcbiAgICBcImNkeFwiOiBcImNoZW1pY2FsL3gtY2R4XCIsXG4gICAgXCJjZHhtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jaGVtZHJhdyt4bWxcIixcbiAgICBcImNkeVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jaW5kZXJlbGxhXCIsXG4gICAgXCJjZXJcIjogXCJhcHBsaWNhdGlvbi9wa2l4LWNlcnRcIixcbiAgICBcImNmY1wiOiBcImFwcGxpY2F0aW9uL3gtY29sZGZ1c2lvblwiLFxuICAgIFwiY2ZtXCI6IFwiYXBwbGljYXRpb24veC1jb2xkZnVzaW9uXCIsXG4gICAgXCJjZnNcIjogXCJhcHBsaWNhdGlvbi94LWNmcy1jb21wcmVzc2VkXCIsXG4gICAgXCJjZ21cIjogXCJpbWFnZS9jZ21cIixcbiAgICBcImNoYXRcIjogXCJhcHBsaWNhdGlvbi94LWNoYXRcIixcbiAgICBcImNobVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1odG1saGVscFwiLFxuICAgIFwiY2hydFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2NoYXJ0XCIsXG4gICAgXCJjaWZcIjogXCJjaGVtaWNhbC94LWNpZlwiLFxuICAgIFwiY2lpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuc2VyLXdlYi1jZXJ0aWZpY2F0ZS1pc3N1ZS1pbml0aWF0aW9uXCIsXG4gICAgXCJjaWxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtYXJ0Z2FscnlcIixcbiAgICBcImNsYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbGF5bW9yZVwiLFxuICAgIFwiY2xhc3NcIjogXCJhcHBsaWNhdGlvbi9qYXZhLXZtXCIsXG4gICAgXCJjbGtrXCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIua2V5Ym9hcmRcIixcbiAgICBcImNsa3BcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5wYWxldHRlXCIsXG4gICAgXCJjbGt0XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIudGVtcGxhdGVcIixcbiAgICBcImNsa3dcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci53b3JkYmFua1wiLFxuICAgIFwiY2xreFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyXCIsXG4gICAgXCJjbHBcIjogXCJhcHBsaWNhdGlvbi94LW1zY2xpcFwiLFxuICAgIFwiY21jXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvc21vY2FsbGVyXCIsXG4gICAgXCJjbWRmXCI6IFwiY2hlbWljYWwveC1jbWRmXCIsXG4gICAgXCJjbWxcIjogXCJjaGVtaWNhbC94LWNtbFwiLFxuICAgIFwiY21wXCI6IFwiYXBwbGljYXRpb24vdm5kLnllbGxvd3JpdmVyLWN1c3RvbS1tZW51XCIsXG4gICAgXCJjbXhcIjogXCJpbWFnZS94LWNteFwiLFxuICAgIFwiY29kXCI6IFwiYXBwbGljYXRpb24vdm5kLnJpbS5jb2RcIixcbiAgICBcImNvbVwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiY29uZlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImNwaW9cIjogXCJhcHBsaWNhdGlvbi94LWNwaW9cIixcbiAgICBcImNwcFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJjcHRcIjogXCJhcHBsaWNhdGlvbi9tYWMtY29tcGFjdHByb1wiLFxuICAgIFwiY3JkXCI6IFwiYXBwbGljYXRpb24veC1tc2NhcmRmaWxlXCIsXG4gICAgXCJjcmxcIjogXCJhcHBsaWNhdGlvbi9wa2l4LWNybFwiLFxuICAgIFwiY3J0XCI6IFwiYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcIixcbiAgICBcImNyeFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiY3J5cHRvbm90ZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yaWcuY3J5cHRvbm90ZVwiLFxuICAgIFwiY3NcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJjc2hcIjogXCJhcHBsaWNhdGlvbi94LWNzaFwiLFxuICAgIFwiY3NtbFwiOiBcImNoZW1pY2FsL3gtY3NtbFwiLFxuICAgIFwiY3NwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvbW1vbnNwYWNlXCIsXG4gICAgXCJjc3NcIjogXCJ0ZXh0L2Nzc1wiLFxuICAgIFwiY3N0XCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiY3N2XCI6IFwidGV4dC9jc3ZcIixcbiAgICBcImN1XCI6IFwiYXBwbGljYXRpb24vY3Utc2VlbWVcIixcbiAgICBcImN1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsXCIsXG4gICAgXCJjd3dcIjogXCJhcHBsaWNhdGlvbi9wcnMuY3d3XCIsXG4gICAgXCJjeHRcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjeHhcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiZGFlXCI6IFwibW9kZWwvdm5kLmNvbGxhZGEreG1sXCIsXG4gICAgXCJkYWZcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLmRhZlwiLFxuICAgIFwiZGFydFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kYXJ0XCIsXG4gICAgXCJkYXRhbGVzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLnNlZWRcIixcbiAgICBcImRhdm1vdW50XCI6IFwiYXBwbGljYXRpb24vZGF2bW91bnQreG1sXCIsXG4gICAgXCJkYmtcIjogXCJhcHBsaWNhdGlvbi9kb2Nib29rK3htbFwiLFxuICAgIFwiZGNyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZGN1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsLmRjdXJsXCIsXG4gICAgXCJkZDJcIjogXCJhcHBsaWNhdGlvbi92bmQub21hLmRkMit4bWxcIixcbiAgICBcImRkZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZGRkXCIsXG4gICAgXCJkZWJcIjogXCJhcHBsaWNhdGlvbi94LWRlYmlhbi1wYWNrYWdlXCIsXG4gICAgXCJkZWZcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJkZXBsb3lcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRlclwiOiBcImFwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0XCIsXG4gICAgXCJkZmFjXCI6IFwiYXBwbGljYXRpb24vdm5kLmRyZWFtZmFjdG9yeVwiLFxuICAgIFwiZGdjXCI6IFwiYXBwbGljYXRpb24veC1kZ2MtY29tcHJlc3NlZFwiLFxuICAgIFwiZGljXCI6IFwidGV4dC94LWNcIixcbiAgICBcImRpclwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImRpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGlzXCIsXG4gICAgXCJkaXN0XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkaXN0elwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGp2XCI6IFwiaW1hZ2Uvdm5kLmRqdnVcIixcbiAgICBcImRqdnVcIjogXCJpbWFnZS92bmQuZGp2dVwiLFxuICAgIFwiZGxsXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJkbWdcIjogXCJhcHBsaWNhdGlvbi94LWFwcGxlLWRpc2tpbWFnZVwiLFxuICAgIFwiZG1wXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwiZG1zXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkbmFcIjogXCJhcHBsaWNhdGlvbi92bmQuZG5hXCIsXG4gICAgXCJkb2NcIjogXCJhcHBsaWNhdGlvbi9tc3dvcmRcIixcbiAgICBcImRvY21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29yZC5kb2N1bWVudC5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcImRvY3hcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudFwiLFxuICAgIFwiZG90XCI6IFwiYXBwbGljYXRpb24vbXN3b3JkXCIsXG4gICAgXCJkb3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJkb3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwudGVtcGxhdGVcIixcbiAgICBcImRwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2kuZHBcIixcbiAgICBcImRwZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcGdyYXBoXCIsXG4gICAgXCJkcmFcIjogXCJhdWRpby92bmQuZHJhXCIsXG4gICAgXCJkc2NcIjogXCJ0ZXh0L3Bycy5saW5lcy50YWdcIixcbiAgICBcImRzc2NcIjogXCJhcHBsaWNhdGlvbi9kc3NjK2RlclwiLFxuICAgIFwiZHRiXCI6IFwiYXBwbGljYXRpb24veC1kdGJvb2sreG1sXCIsXG4gICAgXCJkdGRcIjogXCJhcHBsaWNhdGlvbi94bWwtZHRkXCIsXG4gICAgXCJkdHNcIjogXCJhdWRpby92bmQuZHRzXCIsXG4gICAgXCJkdHNoZFwiOiBcImF1ZGlvL3ZuZC5kdHMuaGRcIixcbiAgICBcImR1bXBcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImR2YlwiOiBcInZpZGVvL3ZuZC5kdmIuZmlsZVwiLFxuICAgIFwiZHZpXCI6IFwiYXBwbGljYXRpb24veC1kdmlcIixcbiAgICBcImR3ZlwiOiBcIm1vZGVsL3ZuZC5kd2ZcIixcbiAgICBcImR3Z1wiOiBcImltYWdlL3ZuZC5kd2dcIixcbiAgICBcImR4ZlwiOiBcImltYWdlL3ZuZC5keGZcIixcbiAgICBcImR4cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5keHBcIixcbiAgICBcImR4clwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImVjZWxwNDgwMFwiOiBcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDQ4MDBcIixcbiAgICBcImVjZWxwNzQ3MFwiOiBcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDc0NzBcIixcbiAgICBcImVjZWxwOTYwMFwiOiBcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDk2MDBcIixcbiAgICBcImVjbWFcIjogXCJhcHBsaWNhdGlvbi9lY21hc2NyaXB0XCIsXG4gICAgXCJlZG1cIjogXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZWRtXCIsXG4gICAgXCJlZHhcIjogXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZWR4XCIsXG4gICAgXCJlZmlmXCI6IFwiYXBwbGljYXRpb24vdm5kLnBpY3NlbFwiLFxuICAgIFwiZWk2XCI6IFwiYXBwbGljYXRpb24vdm5kLnBnLm9zYXNsaVwiLFxuICAgIFwiZWxjXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJlbWZcIjogXCJhcHBsaWNhdGlvbi94LW1zbWV0YWZpbGVcIixcbiAgICBcImVtbFwiOiBcIm1lc3NhZ2UvcmZjODIyXCIsXG4gICAgXCJlbW1hXCI6IFwiYXBwbGljYXRpb24vZW1tYSt4bWxcIixcbiAgICBcImVtelwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwiZW9sXCI6IFwiYXVkaW8vdm5kLmRpZ2l0YWwtd2luZHNcIixcbiAgICBcImVvdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1mb250b2JqZWN0XCIsXG4gICAgXCJlcHNcIjogXCJhcHBsaWNhdGlvbi9wb3N0c2NyaXB0XCIsXG4gICAgXCJlcHViXCI6IFwiYXBwbGljYXRpb24vZXB1Yit6aXBcIixcbiAgICBcImVzM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lc3ppZ25vMyt4bWxcIixcbiAgICBcImVzYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vc2dpLnN1YnN5c3RlbVwiLFxuICAgIFwiZXNmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLmVzZlwiLFxuICAgIFwiZXQzXCI6IFwiYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFwiLFxuICAgIFwiZXR4XCI6IFwidGV4dC94LXNldGV4dFwiLFxuICAgIFwiZXZhXCI6IFwiYXBwbGljYXRpb24veC1ldmFcIixcbiAgICBcImV2eVwiOiBcImFwcGxpY2F0aW9uL3gtZW52b3lcIixcbiAgICBcImV4ZVwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiZXhpXCI6IFwiYXBwbGljYXRpb24vZXhpXCIsXG4gICAgXCJleHRcIjogXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZXh0XCIsXG4gICAgXCJlelwiOiBcImFwcGxpY2F0aW9uL2FuZHJldy1pbnNldFwiLFxuICAgIFwiZXoyXCI6IFwiYXBwbGljYXRpb24vdm5kLmV6cGl4LWFsYnVtXCIsXG4gICAgXCJlejNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXpwaXgtcGFja2FnZVwiLFxuICAgIFwiZlwiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmNHZcIjogXCJ2aWRlby94LWY0dlwiLFxuICAgIFwiZjc3XCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImY5MFwiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmYnNcIjogXCJpbWFnZS92bmQuZmFzdGJpZHNoZWV0XCIsXG4gICAgXCJmY2R0XCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZvcm1zY2VudHJhbC5mY2R0XCIsXG4gICAgXCJmY3NcIjogXCJhcHBsaWNhdGlvbi92bmQuaXNhYy5mY3NcIixcbiAgICBcImZkZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZGZcIixcbiAgICBcImZlX2xhdW5jaFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZW5vdm8uZmNzZWxheW91dC1saW5rXCIsXG4gICAgXCJmZzVcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c2dwXCIsXG4gICAgXCJmZ2RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJmaFwiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoNFwiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoNVwiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoN1wiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoY1wiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZpZ1wiOiBcImFwcGxpY2F0aW9uL3gteGZpZ1wiLFxuICAgIFwiZmxhY1wiOiBcImF1ZGlvL3gtZmxhY1wiLFxuICAgIFwiZmxpXCI6IFwidmlkZW8veC1mbGlcIixcbiAgICBcImZsb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5taWNyb2dyYWZ4LmZsb1wiLFxuICAgIFwiZmx2XCI6IFwidmlkZW8veC1mbHZcIixcbiAgICBcImZsd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2l2aW9cIixcbiAgICBcImZseFwiOiBcInRleHQvdm5kLmZtaS5mbGV4c3RvclwiLFxuICAgIFwiZmx5XCI6IFwidGV4dC92bmQuZmx5XCIsXG4gICAgXCJmbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJmbmNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5mbmNcIixcbiAgICBcImZvclwiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmcHhcIjogXCJpbWFnZS92bmQuZnB4XCIsXG4gICAgXCJmcmFtZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJmc2NcIjogXCJhcHBsaWNhdGlvbi92bmQuZnNjLndlYmxhdW5jaFwiLFxuICAgIFwiZnN0XCI6IFwiaW1hZ2Uvdm5kLmZzdFwiLFxuICAgIFwiZnRjXCI6IFwiYXBwbGljYXRpb24vdm5kLmZsdXh0aW1lLmNsaXBcIixcbiAgICBcImZ0aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbnNlci13ZWItZnVuZHMtdHJhbnNmZXItaW5pdGlhdGlvblwiLFxuICAgIFwiZnZ0XCI6IFwidmlkZW8vdm5kLmZ2dFwiLFxuICAgIFwiZnhwXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFwiLFxuICAgIFwiZnhwbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5meHBcIixcbiAgICBcImZ6c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdXp6eXNoZWV0XCIsXG4gICAgXCJnMndcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvcGxhblwiLFxuICAgIFwiZzNcIjogXCJpbWFnZS9nM2ZheFwiLFxuICAgIFwiZzN3XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb3NwYWNlXCIsXG4gICAgXCJnYWNcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWFjY291bnRcIixcbiAgICBcImdhbVwiOiBcImFwcGxpY2F0aW9uL3gtdGFkc1wiLFxuICAgIFwiZ2JyXCI6IFwiYXBwbGljYXRpb24vcnBraS1naG9zdGJ1c3RlcnNcIixcbiAgICBcImdjYVwiOiBcImFwcGxpY2F0aW9uL3gtZ2NhLWNvbXByZXNzZWRcIixcbiAgICBcImdkbFwiOiBcIm1vZGVsL3ZuZC5nZGxcIixcbiAgICBcImdlb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5keW5hZ2VvXCIsXG4gICAgXCJnZXhcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbWV0cnktZXhwbG9yZXJcIixcbiAgICBcImdnYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9nZWJyYS5maWxlXCIsXG4gICAgXCJnZ3RcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEudG9vbFwiLFxuICAgIFwiZ2hmXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1oZWxwXCIsXG4gICAgXCJnaWZcIjogXCJpbWFnZS9naWZcIixcbiAgICBcImdpbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaWRlbnRpdHktbWVzc2FnZVwiLFxuICAgIFwiZ21sXCI6IFwiYXBwbGljYXRpb24vZ21sK3htbFwiLFxuICAgIFwiZ214XCI6IFwiYXBwbGljYXRpb24vdm5kLmdteFwiLFxuICAgIFwiZ251bWVyaWNcIjogXCJhcHBsaWNhdGlvbi94LWdudW1lcmljXCIsXG4gICAgXCJncGhcIjogXCJhcHBsaWNhdGlvbi92bmQuZmxvZ3JhcGhpdFwiLFxuICAgIFwiZ3B4XCI6IFwiYXBwbGljYXRpb24vZ3B4K3htbFwiLFxuICAgIFwiZ3FmXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyYWZlcVwiLFxuICAgIFwiZ3FzXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyYWZlcVwiLFxuICAgIFwiZ3JhbVwiOiBcImFwcGxpY2F0aW9uL3NyZ3NcIixcbiAgICBcImdyYW1wc1wiOiBcImFwcGxpY2F0aW9uL3gtZ3JhbXBzLXhtbFwiLFxuICAgIFwiZ3JlXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb21ldHJ5LWV4cGxvcmVyXCIsXG4gICAgXCJncnZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWluamVjdG9yXCIsXG4gICAgXCJncnhtbFwiOiBcImFwcGxpY2F0aW9uL3NyZ3MreG1sXCIsXG4gICAgXCJnc2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtZ2hvc3RzY3JpcHRcIixcbiAgICBcImd0YXJcIjogXCJhcHBsaWNhdGlvbi94LWd0YXJcIixcbiAgICBcImd0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdG9vbC1tZXNzYWdlXCIsXG4gICAgXCJndHdcIjogXCJtb2RlbC92bmQuZ3R3XCIsXG4gICAgXCJndlwiOiBcInRleHQvdm5kLmdyYXBodml6XCIsXG4gICAgXCJneGZcIjogXCJhcHBsaWNhdGlvbi9neGZcIixcbiAgICBcImd4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9uZXh0XCIsXG4gICAgXCJnelwiOiBcImFwcGxpY2F0aW9uL3gtZ3ppcFwiLFxuICAgIFwiaFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJoMjYxXCI6IFwidmlkZW8vaDI2MVwiLFxuICAgIFwiaDI2M1wiOiBcInZpZGVvL2gyNjNcIixcbiAgICBcImgyNjRcIjogXCJ2aWRlby9oMjY0XCIsXG4gICAgXCJoYWxcIjogXCJhcHBsaWNhdGlvbi92bmQuaGFsK3htbFwiLFxuICAgIFwiaGJjaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYmNpXCIsXG4gICAgXCJoZGZcIjogXCJhcHBsaWNhdGlvbi94LWhkZlwiLFxuICAgIFwiaGhcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiaGxwXCI6IFwiYXBwbGljYXRpb24vd2luaGxwXCIsXG4gICAgXCJocGdsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWhwZ2xcIixcbiAgICBcImhwaWRcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBpZFwiLFxuICAgIFwiaHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWhwc1wiLFxuICAgIFwiaHF4XCI6IFwiYXBwbGljYXRpb24vbWFjLWJpbmhleDQwXCIsXG4gICAgXCJodGFcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImh0Y1wiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHRrZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZW5hbWVhYXBwXCIsXG4gICAgXCJodG1cIjogXCJ0ZXh0L2h0bWxcIixcbiAgICBcImh0bWxcIjogXCJ0ZXh0L2h0bWxcIixcbiAgICBcImh2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtZGljXCIsXG4gICAgXCJodnBcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LXZvaWNlXCIsXG4gICAgXCJodnNcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LXNjcmlwdFwiLFxuICAgIFwiaTJnXCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyZ2VvXCIsXG4gICAgXCJpY2NcIjogXCJhcHBsaWNhdGlvbi92bmQuaWNjcHJvZmlsZVwiLFxuICAgIFwiaWNlXCI6IFwieC1jb25mZXJlbmNlL3gtY29vbHRhbGtcIixcbiAgICBcImljbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pY2Nwcm9maWxlXCIsXG4gICAgXCJpY29cIjogXCJpbWFnZS94LWljb25cIixcbiAgICBcImljc1wiOiBcInRleHQvY2FsZW5kYXJcIixcbiAgICBcImllZlwiOiBcImltYWdlL2llZlwiLFxuICAgIFwiaWZiXCI6IFwidGV4dC9jYWxlbmRhclwiLFxuICAgIFwiaWZtXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm1kYXRhXCIsXG4gICAgXCJpZ2VzXCI6IFwibW9kZWwvaWdlc1wiLFxuICAgIFwiaWdsXCI6IFwiYXBwbGljYXRpb24vdm5kLmlnbG9hZGVyXCIsXG4gICAgXCJpZ21cIjogXCJhcHBsaWNhdGlvbi92bmQuaW5zb3JzLmlnbVwiLFxuICAgIFwiaWdzXCI6IFwibW9kZWwvaWdlc1wiLFxuICAgIFwiaWd4XCI6IFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguaWd4XCIsXG4gICAgXCJpaWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuaW50ZXJjaGFuZ2VcIixcbiAgICBcImltcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmltcFwiLFxuICAgIFwiaW1zXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWltc1wiLFxuICAgIFwiaW5cIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJpbmlcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJpbmtcIjogXCJhcHBsaWNhdGlvbi9pbmttbCt4bWxcIixcbiAgICBcImlua21sXCI6IFwiYXBwbGljYXRpb24vaW5rbWwreG1sXCIsXG4gICAgXCJpbnN0YWxsXCI6IFwiYXBwbGljYXRpb24veC1pbnN0YWxsLWluc3RydWN0aW9uc1wiLFxuICAgIFwiaW90YVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hc3RyYWVhLXNvZnR3YXJlLmlvdGFcIixcbiAgICBcImlwYVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiaXBmaXhcIjogXCJhcHBsaWNhdGlvbi9pcGZpeFwiLFxuICAgIFwiaXBrXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLnBhY2thZ2VcIixcbiAgICBcImlybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ucmlnaHRzLW1hbmFnZW1lbnRcIixcbiAgICBcImlycFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcmVwb3NpdG9yeS5wYWNrYWdlK3htbFwiLFxuICAgIFwiaXNvXCI6IFwiYXBwbGljYXRpb24veC1pc285NjYwLWltYWdlXCIsXG4gICAgXCJpdHBcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuZm9ybXRlbXBsYXRlXCIsXG4gICAgXCJpdnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaW1tZXJ2aXNpb24taXZwXCIsXG4gICAgXCJpdnVcIjogXCJhcHBsaWNhdGlvbi92bmQuaW1tZXJ2aXNpb24taXZ1XCIsXG4gICAgXCJqYWRcIjogXCJ0ZXh0L3ZuZC5zdW4uajJtZS5hcHAtZGVzY3JpcHRvclwiLFxuICAgIFwiamFtXCI6IFwiYXBwbGljYXRpb24vdm5kLmphbVwiLFxuICAgIFwiamFyXCI6IFwiYXBwbGljYXRpb24vamF2YS1hcmNoaXZlXCIsXG4gICAgXCJqYXZhXCI6IFwidGV4dC94LWphdmEtc291cmNlXCIsXG4gICAgXCJqaXNwXCI6IFwiYXBwbGljYXRpb24vdm5kLmppc3BcIixcbiAgICBcImpsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1qbHl0XCIsXG4gICAgXCJqbmxwXCI6IFwiYXBwbGljYXRpb24veC1qYXZhLWpubHAtZmlsZVwiLFxuICAgIFwiam9kYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5qb29zdC5qb2RhLWFyY2hpdmVcIixcbiAgICBcImpwZVwiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZWdcIjogXCJpbWFnZS9qcGVnXCIsXG4gICAgXCJqcGdcIjogXCJpbWFnZS9qcGVnXCIsXG4gICAgXCJqcGdtXCI6IFwidmlkZW8vanBtXCIsXG4gICAgXCJqcGd2XCI6IFwidmlkZW8vanBlZ1wiLFxuICAgIFwianBtXCI6IFwidmlkZW8vanBtXCIsXG4gICAgXCJqc1wiOiBcInRleHQvamF2YXNjcmlwdFwiLFxuICAgIFwianNvblwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICBcImpzb25tbFwiOiBcImFwcGxpY2F0aW9uL2pzb25tbCtqc29uXCIsXG4gICAgXCJrYXJcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJrYXJib25cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmthcmJvblwiLFxuICAgIFwia2ZvXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rZm9ybXVsYVwiLFxuICAgIFwia2lhXCI6IFwiYXBwbGljYXRpb24vdm5kLmtpZHNwaXJhdGlvblwiLFxuICAgIFwia21sXCI6IFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS1lYXJ0aC5rbWwreG1sXCIsXG4gICAgXCJrbXpcIjogXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWVhcnRoLmttelwiLFxuICAgIFwia25lXCI6IFwiYXBwbGljYXRpb24vdm5kLmtpbmFyXCIsXG4gICAgXCJrbnBcIjogXCJhcHBsaWNhdGlvbi92bmQua2luYXJcIixcbiAgICBcImtvblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua29udG91clwiLFxuICAgIFwia3ByXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rcHJlc2VudGVyXCIsXG4gICAgXCJrcHRcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcIixcbiAgICBcImtweHhcIjogXCJhcHBsaWNhdGlvbi92bmQuZHMta2V5cG9pbnRcIixcbiAgICBcImtzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3NwcmVhZFwiLFxuICAgIFwia3RyXCI6IFwiYXBwbGljYXRpb24vdm5kLmthaG9vdHpcIixcbiAgICBcImt0eFwiOiBcImltYWdlL2t0eFwiLFxuICAgIFwia3R6XCI6IFwiYXBwbGljYXRpb24vdm5kLmthaG9vdHpcIixcbiAgICBcImt3ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3dvcmRcIixcbiAgICBcImt3dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3dvcmRcIixcbiAgICBcImxhc3htbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sYXMubGFzK3htbFwiLFxuICAgIFwibGF0ZXhcIjogXCJhcHBsaWNhdGlvbi94LWxhdGV4XCIsXG4gICAgXCJsYmRcIjogXCJhcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZGVza3RvcFwiLFxuICAgIFwibGJlXCI6IFwiYXBwbGljYXRpb24vdm5kLmxsYW1hZ3JhcGhpY3MubGlmZS1iYWxhbmNlLmV4Y2hhbmdlK3htbFwiLFxuICAgIFwibGVzXCI6IFwiYXBwbGljYXRpb24vdm5kLmhoZS5sZXNzb24tcGxheWVyXCIsXG4gICAgXCJsaGFcIjogXCJhcHBsaWNhdGlvbi94LWx6aC1jb21wcmVzc2VkXCIsXG4gICAgXCJsaW5rNjZcIjogXCJhcHBsaWNhdGlvbi92bmQucm91dGU2Ni5saW5rNjYreG1sXCIsXG4gICAgXCJsaXN0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwibGlzdDM4MjBcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFwiLFxuICAgIFwibGlzdGFmcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJsbmtcIjogXCJhcHBsaWNhdGlvbi94LW1zLXNob3J0Y3V0XCIsXG4gICAgXCJsb2dcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJsb3N0eG1sXCI6IFwiYXBwbGljYXRpb24vbG9zdCt4bWxcIixcbiAgICBcImxyZlwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwibHJtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWxybVwiLFxuICAgIFwibHRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyb2dhbnMubHRmXCIsXG4gICAgXCJsdnBcIjogXCJhdWRpby92bmQubHVjZW50LnZvaWNlXCIsXG4gICAgXCJsd3BcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtd29yZHByb1wiLFxuICAgIFwibHpcIjogXCJhcHBsaWNhdGlvbi94LWx6aXBcIixcbiAgICBcImx6aFwiOiBcImFwcGxpY2F0aW9uL3gtbHpoLWNvbXByZXNzZWRcIixcbiAgICBcImx6bWFcIjogXCJhcHBsaWNhdGlvbi94LWx6bWFcIixcbiAgICBcImx6b1wiOiBcImFwcGxpY2F0aW9uL3gtbHpvcFwiLFxuICAgIFwibTEzXCI6IFwiYXBwbGljYXRpb24veC1tc21lZGlhdmlld1wiLFxuICAgIFwibTE0XCI6IFwiYXBwbGljYXRpb24veC1tc21lZGlhdmlld1wiLFxuICAgIFwibTF2XCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibTIxXCI6IFwiYXBwbGljYXRpb24vbXAyMVwiLFxuICAgIFwibTJhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibTJ2XCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibTNhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibTN1XCI6IFwiYXVkaW8veC1tcGVndXJsXCIsXG4gICAgXCJtM3U4XCI6IFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLm1wZWd1cmxcIixcbiAgICBcIm00YVwiOiBcImF1ZGlvL21wNFwiLFxuICAgIFwibTR1XCI6IFwidmlkZW8vdm5kLm1wZWd1cmxcIixcbiAgICBcIm00dlwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibWFcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibWFkc1wiOiBcImFwcGxpY2F0aW9uL21hZHMreG1sXCIsXG4gICAgXCJtYWdcIjogXCJhcHBsaWNhdGlvbi92bmQuZWNvd2luLmNoYXJ0XCIsXG4gICAgXCJtYWtlclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJtYW5cIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJtYXJcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcIm1hdGhtbFwiOiBcImFwcGxpY2F0aW9uL21hdGhtbCt4bWxcIixcbiAgICBcIm1iXCI6IFwiYXBwbGljYXRpb24vbWF0aGVtYXRpY2FcIixcbiAgICBcIm1ia1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubWJrXCIsXG4gICAgXCJtYm94XCI6IFwiYXBwbGljYXRpb24vbWJveFwiLFxuICAgIFwibWMxXCI6IFwiYXBwbGljYXRpb24vdm5kLm1lZGNhbGNkYXRhXCIsXG4gICAgXCJtY2RcIjogXCJhcHBsaWNhdGlvbi92bmQubWNkXCIsXG4gICAgXCJtY3VybFwiOiBcInRleHQvdm5kLmN1cmwubWN1cmxcIixcbiAgICAnbWQnOiAndGV4dC9wbGFpbicsXG4gICAgXCJtZGJcIjogXCJhcHBsaWNhdGlvbi94LW1zYWNjZXNzXCIsXG4gICAgXCJtZGlcIjogXCJpbWFnZS92bmQubXMtbW9kaVwiLFxuICAgIFwibWVcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJtZXNoXCI6IFwibW9kZWwvbWVzaFwiLFxuICAgIFwibWV0YTRcIjogXCJhcHBsaWNhdGlvbi9tZXRhbGluazQreG1sXCIsXG4gICAgXCJtZXRhbGlua1wiOiBcImFwcGxpY2F0aW9uL21ldGFsaW5rK3htbFwiLFxuICAgIFwibWV0c1wiOiBcImFwcGxpY2F0aW9uL21ldHMreG1sXCIsXG4gICAgXCJtZm1cIjogXCJhcHBsaWNhdGlvbi92bmQubWZtcFwiLFxuICAgIFwibWZ0XCI6IFwiYXBwbGljYXRpb24vcnBraS1tYW5pZmVzdFwiLFxuICAgIFwibWdwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2VvLm1hcGd1aWRlLnBhY2thZ2VcIixcbiAgICBcIm1nelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wcm90ZXVzLm1hZ2F6aW5lXCIsXG4gICAgXCJtaWRcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJtaWRpXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwibWllXCI6IFwiYXBwbGljYXRpb24veC1taWVcIixcbiAgICBcIm1pZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5taWZcIixcbiAgICBcIm1pbWVcIjogXCJtZXNzYWdlL3JmYzgyMlwiLFxuICAgIFwibWoyXCI6IFwidmlkZW8vbWoyXCIsXG4gICAgXCJtanAyXCI6IFwidmlkZW8vbWoyXCIsXG4gICAgXCJtazNkXCI6IFwidmlkZW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWthXCI6IFwiYXVkaW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWtzXCI6IFwidmlkZW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWt2XCI6IFwidmlkZW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWxwXCI6IFwiYXBwbGljYXRpb24vdm5kLmRvbGJ5Lm1scFwiLFxuICAgIFwibW1kXCI6IFwiYXBwbGljYXRpb24vdm5kLmNoaXBudXRzLmthcmFva2UtbW1kXCIsXG4gICAgXCJtbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc21hZlwiLFxuICAgIFwibW1yXCI6IFwiaW1hZ2Uvdm5kLmZ1aml4ZXJveC5lZG1pY3MtbW1yXCIsXG4gICAgXCJtbmdcIjogXCJ2aWRlby94LW1uZ1wiLFxuICAgIFwibW55XCI6IFwiYXBwbGljYXRpb24veC1tc21vbmV5XCIsXG4gICAgXCJtb2JpXCI6IFwiYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rXCIsXG4gICAgXCJtb2RzXCI6IFwiYXBwbGljYXRpb24vbW9kcyt4bWxcIixcbiAgICBcIm1vdlwiOiBcInZpZGVvL3F1aWNrdGltZVwiLFxuICAgIFwibW92aWVcIjogXCJ2aWRlby94LXNnaS1tb3ZpZVwiLFxuICAgIFwibXAyXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXAyMVwiOiBcImFwcGxpY2F0aW9uL21wMjFcIixcbiAgICBcIm1wMmFcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcDNcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJvcHVzXCI6IFwiYXVkaW8vb3B1c1wiLFxuICAgIFwibXA0XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcDRhXCI6IFwiYXVkaW8vbXA0XCIsXG4gICAgXCJtcDRzXCI6IFwiYXBwbGljYXRpb24vbXA0XCIsXG4gICAgXCJtcDR2XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcGNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9waHVuLmNlcnRpZmljYXRlXCIsXG4gICAgXCJtcGVcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGVnXCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibXBnXCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibXBnNFwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibXBnYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wa2dcIjogXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbFwiLFxuICAgIFwibXBtXCI6IFwiYXBwbGljYXRpb24vdm5kLmJsdWVpY2UubXVsdGlwYXNzXCIsXG4gICAgXCJtcG5cIjogXCJhcHBsaWNhdGlvbi92bmQubW9waHVuLmFwcGxpY2F0aW9uXCIsXG4gICAgXCJtcHBcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcHJvamVjdFwiLFxuICAgIFwibXB0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXByb2plY3RcIixcbiAgICBcIm1weVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubWluaXBheVwiLFxuICAgIFwibXF5XCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tcXlcIixcbiAgICBcIm1yY1wiOiBcImFwcGxpY2F0aW9uL21hcmNcIixcbiAgICBcIm1yY3hcIjogXCJhcHBsaWNhdGlvbi9tYXJjeG1sK3htbFwiLFxuICAgIFwibXNcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJtc2NtbFwiOiBcImFwcGxpY2F0aW9uL21lZGlhc2VydmVyY29udHJvbCt4bWxcIixcbiAgICBcIm1zZWVkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24ubXNlZWRcIixcbiAgICBcIm1zZXFcIjogXCJhcHBsaWNhdGlvbi92bmQubXNlcVwiLFxuICAgIFwibXNmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLm1zZlwiLFxuICAgIFwibXNoXCI6IFwibW9kZWwvbWVzaFwiLFxuICAgIFwibXNpXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJtc2xcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1zbFwiLFxuICAgIFwibXN0eVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tdXZlZS5zdHlsZVwiLFxuICAgIC8vXCJtdHNcIjogXCJtb2RlbC92bmQubXRzXCIsXG4gICAgXCJtdHNcIjogXCJ2aWRlby9tdHNcIixcbiAgICBcIm11c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tdXNpY2lhblwiLFxuICAgIFwibXVzaWN4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sK3htbFwiLFxuICAgIFwibXZiXCI6IFwiYXBwbGljYXRpb24veC1tc21lZGlhdmlld1wiLFxuICAgIFwibXdmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1mZXJcIixcbiAgICBcIm14ZlwiOiBcImFwcGxpY2F0aW9uL214ZlwiLFxuICAgIFwibXhsXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbFwiLFxuICAgIFwibXhtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwibXhzXCI6IFwiYXBwbGljYXRpb24vdm5kLnRyaXNjYXBlLm14c1wiLFxuICAgIFwibXh1XCI6IFwidmlkZW8vdm5kLm1wZWd1cmxcIixcbiAgICBcIm4tZ2FnZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5uLWdhZ2Uuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJuM1wiOiBcInRleHQvbjNcIixcbiAgICBcIm5iXCI6IFwiYXBwbGljYXRpb24vbWF0aGVtYXRpY2FcIixcbiAgICBcIm5icFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53b2xmcmFtLnBsYXllclwiLFxuICAgIFwibmNcIjogXCJhcHBsaWNhdGlvbi94LW5ldGNkZlwiLFxuICAgIFwibmN4XCI6IFwiYXBwbGljYXRpb24veC1kdGJuY3greG1sXCIsXG4gICAgXCJuZm9cIjogXCJ0ZXh0L3gtbmZvXCIsXG4gICAgXCJuZ2RhdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5uLWdhZ2UuZGF0YVwiLFxuICAgIFwibml0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uaXRmXCIsXG4gICAgXCJubHVcIjogXCJhcHBsaWNhdGlvbi92bmQubmV1cm9sYW5ndWFnZS5ubHVcIixcbiAgICBcIm5tbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lbmxpdmVuXCIsXG4gICAgXCJubmRcIjogXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtZGlyZWN0b3J5XCIsXG4gICAgXCJubnNcIjogXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtc2VhbGVyXCIsXG4gICAgXCJubndcIjogXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtd2ViXCIsXG4gICAgXCJucHhcIjogXCJpbWFnZS92bmQubmV0LWZweFwiLFxuICAgIFwibnNjXCI6IFwiYXBwbGljYXRpb24veC1jb25mZXJlbmNlXCIsXG4gICAgXCJuc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtbm90ZXNcIixcbiAgICBcIm50ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uaXRmXCIsXG4gICAgXCJuemJcIjogXCJhcHBsaWNhdGlvbi94LW56YlwiLFxuICAgIFwib2EyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXMyXCIsXG4gICAgXCJvYTNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5czNcIixcbiAgICBcIm9hc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzXCIsXG4gICAgXCJvYmRcIjogXCJhcHBsaWNhdGlvbi94LW1zYmluZGVyXCIsXG4gICAgXCJvYmpcIjogXCJhcHBsaWNhdGlvbi94LXRnaWZcIixcbiAgICBcIm9kYVwiOiBcImFwcGxpY2F0aW9uL29kYVwiLFxuICAgIFwib2RiXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5kYXRhYmFzZVwiLFxuICAgIFwib2RjXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydFwiLFxuICAgIFwib2RmXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhXCIsXG4gICAgXCJvZGZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhLXRlbXBsYXRlXCIsXG4gICAgXCJvZGdcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzXCIsXG4gICAgXCJvZGlcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlXCIsXG4gICAgXCJvZG1cIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtbWFzdGVyXCIsXG4gICAgXCJvZHBcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvblwiLFxuICAgIFwib2RzXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldFwiLFxuICAgIFwib2R0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0XCIsXG4gICAgXCJvZ2FcIjogXCJhdWRpby9vZ2dcIixcbiAgICBcIm9nZ1wiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwib2d2XCI6IFwidmlkZW8vb2dnXCIsXG4gICAgXCJvZ3hcIjogXCJhcHBsaWNhdGlvbi9vZ2dcIixcbiAgICBcIm9tZG9jXCI6IFwiYXBwbGljYXRpb24vb21kb2MreG1sXCIsXG4gICAgXCJvbmVwa2dcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvbmV0bXBcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvbmV0b2NcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvbmV0b2MyXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib3BmXCI6IFwiYXBwbGljYXRpb24vb2VicHMtcGFja2FnZSt4bWxcIixcbiAgICBcIm9wbWxcIjogXCJ0ZXh0L3gtb3BtbFwiLFxuICAgIFwib3ByY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJvcmdcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtb3JnYW5pemVyXCIsXG4gICAgXCJvc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLm9wZW5zY29yZWZvcm1hdFwiLFxuICAgIFwib3NmcHZnXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5vcGVuc2NvcmVmb3JtYXQub3NmcHZnK3htbFwiLFxuICAgIFwib3RjXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydC10ZW1wbGF0ZVwiLFxuICAgIFwib3RmXCI6IFwiYXBwbGljYXRpb24veC1mb250LW90ZlwiLFxuICAgIFwib3RnXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljcy10ZW1wbGF0ZVwiLFxuICAgIFwib3RoXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXdlYlwiLFxuICAgIFwib3RpXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZS10ZW1wbGF0ZVwiLFxuICAgIFwib3RwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb24tdGVtcGxhdGVcIixcbiAgICBcIm90c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQtdGVtcGxhdGVcIixcbiAgICBcIm90dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC10ZW1wbGF0ZVwiLFxuICAgIFwib3hwc1wiOiBcImFwcGxpY2F0aW9uL294cHNcIixcbiAgICBcIm94dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVub2ZmaWNlb3JnLmV4dGVuc2lvblwiLFxuICAgIFwicFwiOiBcInRleHQveC1wYXNjYWxcIixcbiAgICBcInAxMFwiOiBcImFwcGxpY2F0aW9uL3BrY3MxMFwiLFxuICAgIFwicDEyXCI6IFwiYXBwbGljYXRpb24veC1wa2NzMTJcIixcbiAgICBcInA3YlwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydGlmaWNhdGVzXCIsXG4gICAgXCJwN2NcIjogXCJhcHBsaWNhdGlvbi9wa2NzNy1taW1lXCIsXG4gICAgXCJwN21cIjogXCJhcHBsaWNhdGlvbi9wa2NzNy1taW1lXCIsXG4gICAgXCJwN3JcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRyZXFyZXNwXCIsXG4gICAgXCJwN3NcIjogXCJhcHBsaWNhdGlvbi9wa2NzNy1zaWduYXR1cmVcIixcbiAgICBcInA4XCI6IFwiYXBwbGljYXRpb24vcGtjczhcIixcbiAgICBcInBhc1wiOiBcInRleHQveC1wYXNjYWxcIixcbiAgICBcInBhd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYXdhYWZpbGVcIixcbiAgICBcInBiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wb3dlcmJ1aWxkZXI2XCIsXG4gICAgXCJwYm1cIjogXCJpbWFnZS94LXBvcnRhYmxlLWJpdG1hcFwiLFxuICAgIFwicGNhcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIixcbiAgICBcInBjZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1wY2ZcIixcbiAgICBcInBjbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1wY2xcIixcbiAgICBcInBjbHhsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLXBjbHhsXCIsXG4gICAgXCJwY3RcIjogXCJpbWFnZS94LXBpY3RcIixcbiAgICBcInBjdXJsXCI6IFwiYXBwbGljYXRpb24vdm5kLmN1cmwucGN1cmxcIixcbiAgICBcInBjeFwiOiBcImltYWdlL3gtcGN4XCIsXG4gICAgXCJwZGJcIjogXCJhcHBsaWNhdGlvbi92bmQucGFsbVwiLFxuICAgIFwicGRmXCI6IFwiYXBwbGljYXRpb24vcGRmXCIsXG4gICAgXCJwZmFcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmYlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZtXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZnJcIjogXCJhcHBsaWNhdGlvbi9mb250LXRkcGZyXCIsXG4gICAgXCJwZnhcIjogXCJhcHBsaWNhdGlvbi94LXBrY3MxMlwiLFxuICAgIFwicGdtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1ncmF5bWFwXCIsXG4gICAgXCJwZ25cIjogXCJhcHBsaWNhdGlvbi94LWNoZXNzLXBnblwiLFxuICAgIFwicGdwXCI6IFwiYXBwbGljYXRpb24vcGdwLWVuY3J5cHRlZFwiLFxuICAgIFwicGhhclwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwicGhwXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwicGhwc1wiOiBcImFwcGxpY2F0aW9uL3gtaHR0cGQtcGhwc1wiLFxuICAgIFwicGljXCI6IFwiaW1hZ2UveC1waWN0XCIsXG4gICAgXCJwa2dcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInBraVwiOiBcImFwcGxpY2F0aW9uL3BraXhjbXBcIixcbiAgICBcInBraXBhdGhcIjogXCJhcHBsaWNhdGlvbi9wa2l4LXBraXBhdGhcIixcbiAgICBcInBsYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1sYXJnZVwiLFxuICAgIFwicGxjXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5wbGNcIixcbiAgICBcInBsZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wb2NrZXRsZWFyblwiLFxuICAgIFwicGxpc3RcIjogXCJhcHBsaWNhdGlvbi94LXBsaXN0XCIsXG4gICAgXCJwbHNcIjogXCJhcHBsaWNhdGlvbi9wbHMreG1sXCIsXG4gICAgXCJwbWxcIjogXCJhcHBsaWNhdGlvbi92bmQuY3RjLXBvc21sXCIsXG4gICAgXCJwbmdcIjogXCJpbWFnZS9wbmdcIixcbiAgICBcInBubVwiOiBcImltYWdlL3gtcG9ydGFibGUtYW55bWFwXCIsXG4gICAgXCJwb3J0cGtnXCI6IFwiYXBwbGljYXRpb24vdm5kLm1hY3BvcnRzLnBvcnRwa2dcIixcbiAgICBcInBvdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwb3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwb3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnRlbXBsYXRlXCIsXG4gICAgXCJwcGFtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuYWRkaW4ubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwcGRcIjogXCJhcHBsaWNhdGlvbi92bmQuY3Vwcy1wcGRcIixcbiAgICBcInBwbVwiOiBcImltYWdlL3gtcG9ydGFibGUtcGl4bWFwXCIsXG4gICAgXCJwcHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFwiLFxuICAgIFwicHBzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlc2hvdy5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwc3hcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVzaG93XCIsXG4gICAgXCJwcHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFwiLFxuICAgIFwicHB0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnByZXNlbnRhdGlvbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uXCIsXG4gICAgXCJwcWFcIjogXCJhcHBsaWNhdGlvbi92bmQucGFsbVwiLFxuICAgIFwicHJjXCI6IFwiYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rXCIsXG4gICAgXCJwcmVcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtZnJlZWxhbmNlXCIsXG4gICAgXCJwcmZcIjogXCJhcHBsaWNhdGlvbi9waWNzLXJ1bGVzXCIsXG4gICAgXCJwc1wiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcInBzYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1zbWFsbFwiLFxuICAgIFwicHNkXCI6IFwiaW1hZ2Uvdm5kLmFkb2JlLnBob3Rvc2hvcFwiLFxuICAgIFwicHNmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWxpbnV4LXBzZlwiLFxuICAgIFwicHNrY3htbFwiOiBcImFwcGxpY2F0aW9uL3Bza2MreG1sXCIsXG4gICAgXCJwdGlkXCI6IFwiYXBwbGljYXRpb24vdm5kLnB2aS5wdGlkMVwiLFxuICAgIFwicHViXCI6IFwiYXBwbGljYXRpb24veC1tc3B1Ymxpc2hlclwiLFxuICAgIFwicHZiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LXZhclwiLFxuICAgIFwicHduXCI6IFwiYXBwbGljYXRpb24vdm5kLjNtLnBvc3QtaXQtbm90ZXNcIixcbiAgICBcInB5YVwiOiBcImF1ZGlvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHlhXCIsXG4gICAgXCJweXZcIjogXCJ2aWRlby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5dlwiLFxuICAgIFwicWFtXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnF1aWNrYW5pbWVcIixcbiAgICBcInFib1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFib1wiLFxuICAgIFwicWZ4XCI6IFwiYXBwbGljYXRpb24vdm5kLmludHUucWZ4XCIsXG4gICAgXCJxcHNcIjogXCJhcHBsaWNhdGlvbi92bmQucHVibGlzaGFyZS1kZWx0YS10cmVlXCIsXG4gICAgXCJxdFwiOiBcInZpZGVvL3F1aWNrdGltZVwiLFxuICAgIFwicXdkXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxd3RcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhkXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGxcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicmFcIjogXCJhdWRpby94LXBuLXJlYWxhdWRpb1wiLFxuICAgIFwicmFtXCI6IFwiYXVkaW8veC1wbi1yZWFsYXVkaW9cIixcbiAgICBcInJhclwiOiBcImFwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWRcIixcbiAgICBcInJhc1wiOiBcImltYWdlL3gtY211LXJhc3RlclwiLFxuICAgIFwicmJcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJyY3Byb2ZpbGVcIjogXCJhcHBsaWNhdGlvbi92bmQuaXB1bnBsdWdnZWQucmNwcm9maWxlXCIsXG4gICAgXCJyZGZcIjogXCJhcHBsaWNhdGlvbi9yZGYreG1sXCIsXG4gICAgXCJyZHpcIjogXCJhcHBsaWNhdGlvbi92bmQuZGF0YS12aXNpb24ucmR6XCIsXG4gICAgXCJyZXBcIjogXCJhcHBsaWNhdGlvbi92bmQuYnVzaW5lc3NvYmplY3RzXCIsXG4gICAgXCJyZXNcIjogXCJhcHBsaWNhdGlvbi94LWR0YnJlc291cmNlK3htbFwiLFxuICAgIFwicmVzeFwiOiBcInRleHQveG1sXCIsXG4gICAgXCJyZ2JcIjogXCJpbWFnZS94LXJnYlwiLFxuICAgIFwicmlmXCI6IFwiYXBwbGljYXRpb24vcmVnaW5mbyt4bWxcIixcbiAgICBcInJpcFwiOiBcImF1ZGlvL3ZuZC5yaXBcIixcbiAgICBcInJpc1wiOiBcImFwcGxpY2F0aW9uL3gtcmVzZWFyY2gtaW5mby1zeXN0ZW1zXCIsXG4gICAgXCJybFwiOiBcImFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzK3htbFwiLFxuICAgIFwicmxjXCI6IFwiaW1hZ2Uvdm5kLmZ1aml4ZXJveC5lZG1pY3MtcmxjXCIsXG4gICAgXCJybGRcIjogXCJhcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cy1kaWZmK3htbFwiLFxuICAgIFwicm1cIjogXCJhcHBsaWNhdGlvbi92bmQucm4tcmVhbG1lZGlhXCIsXG4gICAgXCJybWlcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJybXBcIjogXCJhdWRpby94LXBuLXJlYWxhdWRpby1wbHVnaW5cIixcbiAgICBcInJtc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5qY3AuamF2YW1lLm1pZGxldC1ybXNcIixcbiAgICBcInJtdmJcIjogXCJhcHBsaWNhdGlvbi92bmQucm4tcmVhbG1lZGlhLXZiclwiLFxuICAgIFwicm5jXCI6IFwiYXBwbGljYXRpb24vcmVsYXgtbmctY29tcGFjdC1zeW50YXhcIixcbiAgICBcInJvYVwiOiBcImFwcGxpY2F0aW9uL3Jwa2ktcm9hXCIsXG4gICAgXCJyb2ZmXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwicnA5XCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb2FudG8ucnA5XCIsXG4gICAgXCJycG1cIjogXCJhcHBsaWNhdGlvbi94LXJwbVwiLFxuICAgIFwicnBzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5yYWRpby1wcmVzZXRzXCIsXG4gICAgXCJycHN0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldFwiLFxuICAgIFwicnFcIjogXCJhcHBsaWNhdGlvbi9zcGFycWwtcXVlcnlcIixcbiAgICBcInJzXCI6IFwiYXBwbGljYXRpb24vcmxzLXNlcnZpY2VzK3htbFwiLFxuICAgIFwicnNkXCI6IFwiYXBwbGljYXRpb24vcnNkK3htbFwiLFxuICAgIFwicnNzXCI6IFwiYXBwbGljYXRpb24vcnNzK3htbFwiLFxuICAgIFwicnRmXCI6IFwiYXBwbGljYXRpb24vcnRmXCIsXG4gICAgXCJydHhcIjogXCJ0ZXh0L3JpY2h0ZXh0XCIsXG4gICAgXCJzXCI6IFwidGV4dC94LWFzbVwiLFxuICAgIFwiczNtXCI6IFwiYXVkaW8vczNtXCIsXG4gICAgXCJzN3pcIjogXCJhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWRcIixcbiAgICBcInNhZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1hdWRpb1wiLFxuICAgIFwic2FmYXJpZXh0elwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwic2Fzc1wiOiBcInRleHQveC1zYXNzXCIsXG4gICAgXCJzYm1sXCI6IFwiYXBwbGljYXRpb24vc2JtbCt4bWxcIixcbiAgICBcInNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5zZWN1cmUtY29udGFpbmVyXCIsXG4gICAgXCJzY2RcIjogXCJhcHBsaWNhdGlvbi94LW1zc2NoZWR1bGVcIixcbiAgICBcInNjbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1zY3JlZW5jYW1cIixcbiAgICBcInNjcVwiOiBcImFwcGxpY2F0aW9uL3NjdnAtY3YtcmVxdWVzdFwiLFxuICAgIFwic2NzXCI6IFwiYXBwbGljYXRpb24vc2N2cC1jdi1yZXNwb25zZVwiLFxuICAgIFwic2Nzc1wiOiBcInRleHQveC1zY3NzXCIsXG4gICAgXCJzY3VybFwiOiBcInRleHQvdm5kLmN1cmwuc2N1cmxcIixcbiAgICBcInNkYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uZHJhd1wiLFxuICAgIFwic2RjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5jYWxjXCIsXG4gICAgXCJzZGRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmltcHJlc3NcIixcbiAgICBcInNka2RcIjogXCJhcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXCIsXG4gICAgXCJzZGttXCI6IFwiYXBwbGljYXRpb24vdm5kLnNvbGVudC5zZGttK3htbFwiLFxuICAgIFwic2RwXCI6IFwiYXBwbGljYXRpb24vc2RwXCIsXG4gICAgXCJzZHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclwiLFxuICAgIFwic2VlXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlZW1haWxcIixcbiAgICBcInNlZWRcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5zZWVkXCIsXG4gICAgXCJzZW1hXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWFcIixcbiAgICBcInNlbWRcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtZFwiLFxuICAgIFwic2VtZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1mXCIsXG4gICAgXCJzZXJcIjogXCJhcHBsaWNhdGlvbi9qYXZhLXNlcmlhbGl6ZWQtb2JqZWN0XCIsXG4gICAgXCJzZXRwYXlcIjogXCJhcHBsaWNhdGlvbi9zZXQtcGF5bWVudC1pbml0aWF0aW9uXCIsXG4gICAgXCJzZXRyZWdcIjogXCJhcHBsaWNhdGlvbi9zZXQtcmVnaXN0cmF0aW9uLWluaXRpYXRpb25cIixcbiAgICBcInNmZC1oZHN0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oeWRyb3N0YXRpeC5zb2YtZGF0YVwiLFxuICAgIFwic2ZzXCI6IFwiYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLnNmc1wiLFxuICAgIFwic2Z2XCI6IFwidGV4dC94LXNmdlwiLFxuICAgIFwic2dpXCI6IFwiaW1hZ2Uvc2dpXCIsXG4gICAgXCJzZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlci1nbG9iYWxcIixcbiAgICBcInNnbVwiOiBcInRleHQvc2dtbFwiLFxuICAgIFwic2dtbFwiOiBcInRleHQvc2dtbFwiLFxuICAgIFwic2hcIjogXCJhcHBsaWNhdGlvbi94LXNoXCIsXG4gICAgXCJzaGFyXCI6IFwiYXBwbGljYXRpb24veC1zaGFyXCIsXG4gICAgXCJzaGZcIjogXCJhcHBsaWNhdGlvbi9zaGYreG1sXCIsXG4gICAgXCJzaWRcIjogXCJpbWFnZS94LW1yc2lkLWltYWdlXCIsXG4gICAgXCJzaWdcIjogXCJhcHBsaWNhdGlvbi9wZ3Atc2lnbmF0dXJlXCIsXG4gICAgXCJzaWxcIjogXCJhdWRpby9zaWxrXCIsXG4gICAgXCJzaWxvXCI6IFwibW9kZWwvbWVzaFwiLFxuICAgIFwic2lzXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwic2lzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcInNpdFwiOiBcImFwcGxpY2F0aW9uL3gtc3R1ZmZpdFwiLFxuICAgIFwic2l0eFwiOiBcImFwcGxpY2F0aW9uL3gtc3R1ZmZpdHhcIixcbiAgICBcInNrZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza21cIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2twXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJzbGRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJzbGR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnNsaWRlXCIsXG4gICAgXCJzbHRcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uc2FsdFwiLFxuICAgIFwic21cIjogXCJhcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnN0ZXBjaGFydFwiLFxuICAgIFwic21mXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5tYXRoXCIsXG4gICAgXCJzbWlcIjogXCJhcHBsaWNhdGlvbi9zbWlsK3htbFwiLFxuICAgIFwic21pbFwiOiBcImFwcGxpY2F0aW9uL3NtaWwreG1sXCIsXG4gICAgXCJzbXZcIjogXCJ2aWRlby94LXNtdlwiLFxuICAgIFwic216aXBcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnBhY2thZ2VcIixcbiAgICBcInNuZFwiOiBcImF1ZGlvL2Jhc2ljXCIsXG4gICAgXCJzbmZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtc25mXCIsXG4gICAgXCJzb1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwic3BjXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcIixcbiAgICBcInNwZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1waHJhc2VcIixcbiAgICBcInNwbFwiOiBcImFwcGxpY2F0aW9uL3gtZnV0dXJlc3BsYXNoXCIsXG4gICAgXCJzcG90XCI6IFwidGV4dC92bmQuaW4zZC5zcG90XCIsXG4gICAgXCJzcHBcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLXZwLXJlc3BvbnNlXCIsXG4gICAgXCJzcHFcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLXZwLXJlcXVlc3RcIixcbiAgICBcInNweFwiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwic3FsXCI6IFwiYXBwbGljYXRpb24veC1zcWxcIixcbiAgICBcInNyY1wiOiBcImFwcGxpY2F0aW9uL3gtd2Fpcy1zb3VyY2VcIixcbiAgICBcInNydFwiOiBcImFwcGxpY2F0aW9uL3gtc3VicmlwXCIsXG4gICAgXCJzcnVcIjogXCJhcHBsaWNhdGlvbi9zcnUreG1sXCIsXG4gICAgXCJzcnhcIjogXCJhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cyt4bWxcIixcbiAgICBcInNzZGxcIjogXCJhcHBsaWNhdGlvbi9zc2RsK3htbFwiLFxuICAgIFwic3NlXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvZGFrLWRlc2NyaXB0b3JcIixcbiAgICBcInNzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5zc2ZcIixcbiAgICBcInNzbWxcIjogXCJhcHBsaWNhdGlvbi9zc21sK3htbFwiLFxuICAgIFwic3RcIjogXCJhcHBsaWNhdGlvbi92bmQuc2FpbGluZ3RyYWNrZXIudHJhY2tcIixcbiAgICBcInN0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmNhbGMudGVtcGxhdGVcIixcbiAgICBcInN0ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXcudGVtcGxhdGVcIixcbiAgICBcInN0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC53dC5zdGZcIixcbiAgICBcInN0aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3MudGVtcGxhdGVcIixcbiAgICBcInN0a1wiOiBcImFwcGxpY2F0aW9uL2h5cGVyc3R1ZGlvXCIsXG4gICAgXCJzdGxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcGtpLnN0bFwiLFxuICAgIFwic3RyXCI6IFwiYXBwbGljYXRpb24vdm5kLnBnLmZvcm1hdFwiLFxuICAgIFwic3R3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLnRlbXBsYXRlXCIsXG4gICAgXCJzdHlsXCI6IFwidGV4dC94LXN0eWxcIixcbiAgICBcInN1YlwiOiBcImltYWdlL3ZuZC5kdmIuc3VidGl0bGVcIixcbiAgICBcInN1c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcIixcbiAgICBcInN1c3BcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VzLWNhbGVuZGFyXCIsXG4gICAgXCJzdjRjcGlvXCI6IFwiYXBwbGljYXRpb24veC1zdjRjcGlvXCIsXG4gICAgXCJzdjRjcmNcIjogXCJhcHBsaWNhdGlvbi94LXN2NGNyY1wiLFxuICAgIFwic3ZjXCI6IFwiYXBwbGljYXRpb24vdm5kLmR2Yi5zZXJ2aWNlXCIsXG4gICAgXCJzdmRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ZkXCIsXG4gICAgXCJzdmdcIjogXCJpbWFnZS9zdmcreG1sXCIsXG4gICAgXCJzdmd6XCI6IFwiaW1hZ2Uvc3ZnK3htbFwiLFxuICAgIFwic3dhXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwic3dmXCI6IFwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIixcbiAgICBcInN3aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcmlzdGFuZXR3b3Jrcy5zd2lcIixcbiAgICBcInN4Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmNhbGNcIixcbiAgICBcInN4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXdcIixcbiAgICBcInN4Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci5nbG9iYWxcIixcbiAgICBcInN4aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3NcIixcbiAgICBcInN4bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLm1hdGhcIixcbiAgICBcInN4d1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlclwiLFxuICAgIFwidFwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcInQzXCI6IFwiYXBwbGljYXRpb24veC10M3ZtLWltYWdlXCIsXG4gICAgXCJ0YWdsZXRcIjogXCJhcHBsaWNhdGlvbi92bmQubXluZmNcIixcbiAgICBcInRhb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC50YW8uaW50ZW50LW1vZHVsZS1hcmNoaXZlXCIsXG4gICAgXCJ0YXJcIjogXCJhcHBsaWNhdGlvbi94LXRhclwiLFxuICAgIFwidGNhcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwMi50Y2FwXCIsXG4gICAgXCJ0Y2xcIjogXCJhcHBsaWNhdGlvbi94LXRjbFwiLFxuICAgIFwidGVhY2hlclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zbWFydC50ZWFjaGVyXCIsXG4gICAgXCJ0ZWlcIjogXCJhcHBsaWNhdGlvbi90ZWkreG1sXCIsXG4gICAgXCJ0ZWljb3JwdXNcIjogXCJhcHBsaWNhdGlvbi90ZWkreG1sXCIsXG4gICAgXCJ0ZXhcIjogXCJhcHBsaWNhdGlvbi94LXRleFwiLFxuICAgIFwidGV4aVwiOiBcImFwcGxpY2F0aW9uL3gtdGV4aW5mb1wiLFxuICAgIFwidGV4aW5mb1wiOiBcImFwcGxpY2F0aW9uL3gtdGV4aW5mb1wiLFxuICAgIFwidGV4dFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInRmaVwiOiBcImFwcGxpY2F0aW9uL3RocmF1ZCt4bWxcIixcbiAgICBcInRmbVwiOiBcImFwcGxpY2F0aW9uL3gtdGV4LXRmbVwiLFxuICAgIFwidGdhXCI6IFwiaW1hZ2UveC10Z2FcIixcbiAgICBcInRnelwiOiBcImFwcGxpY2F0aW9uL3gtZ3ppcFwiLFxuICAgIFwidGhteFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1vZmZpY2V0aGVtZVwiLFxuICAgIFwidGlmXCI6IFwiaW1hZ2UvdGlmZlwiLFxuICAgIFwidGlmZlwiOiBcImltYWdlL3RpZmZcIixcbiAgICBcInRtb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC50bW9iaWxlLWxpdmV0dlwiLFxuICAgIFwidG9ycmVudFwiOiBcImFwcGxpY2F0aW9uL3gtYml0dG9ycmVudFwiLFxuICAgIFwidHBsXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLXRlbXBsYXRlXCIsXG4gICAgXCJ0cHRcIjogXCJhcHBsaWNhdGlvbi92bmQudHJpZC50cHRcIixcbiAgICBcInRyXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwidHJhXCI6IFwiYXBwbGljYXRpb24vdm5kLnRydWVhcHBcIixcbiAgICBcInRybVwiOiBcImFwcGxpY2F0aW9uL3gtbXN0ZXJtaW5hbFwiLFxuICAgIFwidHNkXCI6IFwiYXBwbGljYXRpb24vdGltZXN0YW1wZWQtZGF0YVwiLFxuICAgIFwidHN2XCI6IFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiLFxuICAgIFwidHRjXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR0ZlwiLFxuICAgIFwidHRmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR0ZlwiLFxuICAgIFwidHRsXCI6IFwidGV4dC90dXJ0bGVcIixcbiAgICBcInR3ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaW10ZWNoLW1pbmRtYXBwZXJcIixcbiAgICBcInR3ZHNcIjogXCJhcHBsaWNhdGlvbi92bmQuc2ltdGVjaC1taW5kbWFwcGVyXCIsXG4gICAgXCJ0eGRcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2Vub21hdGl4LnR1eGVkb1wiLFxuICAgIFwidHhmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy50eGZcIixcbiAgICBcInR4dFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInUzMlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcInVkZWJcIjogXCJhcHBsaWNhdGlvbi94LWRlYmlhbi1wYWNrYWdlXCIsXG4gICAgXCJ1ZmRcIjogXCJhcHBsaWNhdGlvbi92bmQudWZkbFwiLFxuICAgIFwidWZkbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51ZmRsXCIsXG4gICAgXCJ1bHhcIjogXCJhcHBsaWNhdGlvbi94LWdsdWx4XCIsXG4gICAgXCJ1bWpcIjogXCJhcHBsaWNhdGlvbi92bmQudW1hamluXCIsXG4gICAgXCJ1bml0eXdlYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC51bml0eVwiLFxuICAgIFwidW9tbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51b21sK3htbFwiLFxuICAgIFwidXJpXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXJpc1wiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVybHNcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1c3RhclwiOiBcImFwcGxpY2F0aW9uL3gtdXN0YXJcIixcbiAgICBcInV0elwiOiBcImFwcGxpY2F0aW9uL3ZuZC51aXEudGhlbWVcIixcbiAgICBcInV1XCI6IFwidGV4dC94LXV1ZW5jb2RlXCIsXG4gICAgXCJ1dmFcIjogXCJhdWRpby92bmQuZGVjZS5hdWRpb1wiLFxuICAgIFwidXZkXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZmXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZnXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZoXCI6IFwidmlkZW8vdm5kLmRlY2UuaGRcIixcbiAgICBcInV2aVwiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2bVwiOiBcInZpZGVvL3ZuZC5kZWNlLm1vYmlsZVwiLFxuICAgIFwidXZwXCI6IFwidmlkZW8vdm5kLmRlY2UucGRcIixcbiAgICBcInV2c1wiOiBcInZpZGVvL3ZuZC5kZWNlLnNkXCIsXG4gICAgXCJ1dnRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS50dG1sK3htbFwiLFxuICAgIFwidXZ1XCI6IFwidmlkZW8vdm5kLnV2dnUubXA0XCIsXG4gICAgXCJ1dnZcIjogXCJ2aWRlby92bmQuZGVjZS52aWRlb1wiLFxuICAgIFwidXZ2YVwiOiBcImF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXCIsXG4gICAgXCJ1dnZkXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZ2ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2dmdcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dnZoXCI6IFwidmlkZW8vdm5kLmRlY2UuaGRcIixcbiAgICBcInV2dmlcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dnZtXCI6IFwidmlkZW8vdm5kLmRlY2UubW9iaWxlXCIsXG4gICAgXCJ1dnZwXCI6IFwidmlkZW8vdm5kLmRlY2UucGRcIixcbiAgICBcInV2dnNcIjogXCJ2aWRlby92bmQuZGVjZS5zZFwiLFxuICAgIFwidXZ2dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnR0bWwreG1sXCIsXG4gICAgXCJ1dnZ1XCI6IFwidmlkZW8vdm5kLnV2dnUubXA0XCIsXG4gICAgXCJ1dnZ2XCI6IFwidmlkZW8vdm5kLmRlY2UudmlkZW9cIixcbiAgICBcInV2dnhcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS51bnNwZWNpZmllZFwiLFxuICAgIFwidXZ2elwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnppcFwiLFxuICAgIFwidXZ4XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudW5zcGVjaWZpZWRcIixcbiAgICBcInV2elwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnppcFwiLFxuICAgIFwidmNhcmRcIjogXCJ0ZXh0L3ZjYXJkXCIsXG4gICAgXCJ2Y2RcIjogXCJhcHBsaWNhdGlvbi94LWNkbGlua1wiLFxuICAgIFwidmNmXCI6IFwidGV4dC94LXZjYXJkXCIsXG4gICAgXCJ2Y2dcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXZjYXJkXCIsXG4gICAgXCJ2Y3NcIjogXCJ0ZXh0L3gtdmNhbGVuZGFyXCIsXG4gICAgXCJ2Y3hcIjogXCJhcHBsaWNhdGlvbi92bmQudmN4XCIsXG4gICAgXCJ2aXNcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9uYXJ5XCIsXG4gICAgXCJ2aXZcIjogXCJ2aWRlby92bmQudml2b1wiLFxuICAgIFwidm9iXCI6IFwidmlkZW8veC1tcy12b2JcIixcbiAgICBcInZvclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyXCIsXG4gICAgXCJ2b3hcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJ2cm1sXCI6IFwibW9kZWwvdnJtbFwiLFxuICAgIFwidnNkXCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c2ZcIjogXCJhcHBsaWNhdGlvbi92bmQudnNmXCIsXG4gICAgXCJ2c3NcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnN3XCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2dHVcIjogXCJtb2RlbC92bmQudnR1XCIsXG4gICAgXCJ2eG1sXCI6IFwiYXBwbGljYXRpb24vdm9pY2V4bWwreG1sXCIsXG4gICAgXCJ3M2RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJ3YWRcIjogXCJhcHBsaWNhdGlvbi94LWRvb21cIixcbiAgICBcIndhdlwiOiBcImF1ZGlvL3gtd2F2XCIsXG4gICAgXCJ3YXhcIjogXCJhdWRpby94LW1zLXdheFwiLFxuICAgIFwid2JtcFwiOiBcImltYWdlL3ZuZC53YXAud2JtcFwiLFxuICAgIFwid2JzXCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaXRpY2FsdG9vbHMud2JzK3htbFwiLFxuICAgIFwid2J4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndieG1sXCIsXG4gICAgXCJ3Y21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndkYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid2RwXCI6IFwiaW1hZ2Uvdm5kLm1zLXBob3RvXCIsXG4gICAgXCJ3ZWJhXCI6IFwiYXVkaW8vd2VibVwiLFxuICAgIFwid2VibVwiOiBcInZpZGVvL3dlYm1cIixcbiAgICBcIndlYnBcIjogXCJpbWFnZS93ZWJwXCIsXG4gICAgXCJ3Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wbWkud2lkZ2V0XCIsXG4gICAgXCJ3Z3RcIjogXCJhcHBsaWNhdGlvbi93aWRnZXRcIixcbiAgICBcIndrc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid21cIjogXCJ2aWRlby94LW1zLXdtXCIsXG4gICAgXCJ3bWFcIjogXCJhdWRpby94LW1zLXdtYVwiLFxuICAgIFwid21kXCI6IFwiYXBwbGljYXRpb24veC1tcy13bWRcIixcbiAgICBcIndtZlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwid21sXCI6IFwidGV4dC92bmQud2FwLndtbFwiLFxuICAgIFwid21sY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud21sY1wiLFxuICAgIFwid21sc1wiOiBcInRleHQvdm5kLndhcC53bWxzY3JpcHRcIixcbiAgICBcIndtbHNjXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53bWxzY3JpcHRjXCIsXG4gICAgXCJ3bXZcIjogXCJ2aWRlby94LW1zLXdtdlwiLFxuICAgIFwid214XCI6IFwidmlkZW8veC1tcy13bXhcIixcbiAgICBcIndtelwiOiBcImFwcGxpY2F0aW9uL3gtbXMtd216XCIsXG4gICAgXCJ3b2ZmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXdvZmZcIixcbiAgICBcIndwZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53b3JkcGVyZmVjdFwiLFxuICAgIFwid3BsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdwbFwiLFxuICAgIFwid3BzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3cWRcIjogXCJhcHBsaWNhdGlvbi92bmQud3FkXCIsXG4gICAgXCJ3cmlcIjogXCJhcHBsaWNhdGlvbi94LW1zd3JpdGVcIixcbiAgICBcIndybFwiOiBcIm1vZGVsL3ZybWxcIixcbiAgICBcIndzZGxcIjogXCJhcHBsaWNhdGlvbi93c2RsK3htbFwiLFxuICAgIFwid3Nwb2xpY3lcIjogXCJhcHBsaWNhdGlvbi93c3BvbGljeSt4bWxcIixcbiAgICBcInd0YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC53ZWJ0dXJib1wiLFxuICAgIFwid3Z4XCI6IFwidmlkZW8veC1tcy13dnhcIixcbiAgICBcIngzMlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcIngzZFwiOiBcIm1vZGVsL3gzZCt4bWxcIixcbiAgICBcIngzZGJcIjogXCJtb2RlbC94M2QrYmluYXJ5XCIsXG4gICAgXCJ4M2RielwiOiBcIm1vZGVsL3gzZCtiaW5hcnlcIixcbiAgICBcIngzZHZcIjogXCJtb2RlbC94M2QrdnJtbFwiLFxuICAgIFwieDNkdnpcIjogXCJtb2RlbC94M2QrdnJtbFwiLFxuICAgIFwieDNkelwiOiBcIm1vZGVsL3gzZCt4bWxcIixcbiAgICBcInhhbWxcIjogXCJhcHBsaWNhdGlvbi94YW1sK3htbFwiLFxuICAgIFwieGFwXCI6IFwiYXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC1hcHBcIixcbiAgICBcInhhclwiOiBcImFwcGxpY2F0aW9uL3ZuZC54YXJhXCIsXG4gICAgXCJ4YmFwXCI6IFwiYXBwbGljYXRpb24veC1tcy14YmFwXCIsXG4gICAgXCJ4YmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrcy5iaW5kZXJcIixcbiAgICBcInhibVwiOiBcImltYWdlL3gteGJpdG1hcFwiLFxuICAgIFwieGRmXCI6IFwiYXBwbGljYXRpb24veGNhcC1kaWZmK3htbFwiLFxuICAgIFwieGRtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbSt4bWxcIixcbiAgICBcInhkcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS54ZHAreG1sXCIsXG4gICAgXCJ4ZHNzY1wiOiBcImFwcGxpY2F0aW9uL2Rzc2MreG1sXCIsXG4gICAgXCJ4ZHdcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrc1wiLFxuICAgIFwieGVuY1wiOiBcImFwcGxpY2F0aW9uL3hlbmMreG1sXCIsXG4gICAgXCJ4ZXJcIjogXCJhcHBsaWNhdGlvbi9wYXRjaC1vcHMtZXJyb3IreG1sXCIsXG4gICAgXCJ4ZmRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLnhmZGZcIixcbiAgICBcInhmZGxcIjogXCJhcHBsaWNhdGlvbi92bmQueGZkbFwiLFxuICAgIFwieGh0XCI6IFwiYXBwbGljYXRpb24veGh0bWwreG1sXCIsXG4gICAgXCJ4aHRtbFwiOiBcImFwcGxpY2F0aW9uL3hodG1sK3htbFwiLFxuICAgIFwieGh2bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInhpZlwiOiBcImltYWdlL3ZuZC54aWZmXCIsXG4gICAgXCJ4bGFcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsYW1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuYWRkaW4ubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bGNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsZlwiOiBcImFwcGxpY2F0aW9uL3gteGxpZmYreG1sXCIsXG4gICAgXCJ4bG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxzYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGxzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCIsXG4gICAgXCJ4bHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGVcIixcbiAgICBcInhsd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieG1cIjogXCJhdWRpby94bVwiLFxuICAgIFwieG1sXCI6IFwiYXBwbGljYXRpb24veG1sXCIsXG4gICAgXCJ4b1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vbHBjLXN1Z2FyXCIsXG4gICAgXCJ4b3BcIjogXCJhcHBsaWNhdGlvbi94b3AreG1sXCIsXG4gICAgXCJ4cGlcIjogXCJhcHBsaWNhdGlvbi94LXhwaW5zdGFsbFwiLFxuICAgIFwieHBsXCI6IFwiYXBwbGljYXRpb24veHByb2MreG1sXCIsXG4gICAgXCJ4cG1cIjogXCJpbWFnZS94LXhwaXhtYXBcIixcbiAgICBcInhwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcy14cHJcIixcbiAgICBcInhwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy14cHNkb2N1bWVudFwiLFxuICAgIFwieHB3XCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyY29uLmZvcm1uZXRcIixcbiAgICBcInhweFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnRlcmNvbi5mb3JtbmV0XCIsXG4gICAgXCJ4c2xcIjogXCJhcHBsaWNhdGlvbi94bWxcIixcbiAgICBcInhzbHRcIjogXCJhcHBsaWNhdGlvbi94c2x0K3htbFwiLFxuICAgIFwieHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbCt4bWxcIixcbiAgICBcInhzcGZcIjogXCJhcHBsaWNhdGlvbi94c3BmK3htbFwiLFxuICAgIFwieHVsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vemlsbGEueHVsK3htbFwiLFxuICAgIFwieHZtXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJ4dm1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJ4d2RcIjogXCJpbWFnZS94LXh3aW5kb3dkdW1wXCIsXG4gICAgXCJ4eXpcIjogXCJjaGVtaWNhbC94LXh5elwiLFxuICAgIFwieHpcIjogXCJhcHBsaWNhdGlvbi94LXh6XCIsXG4gICAgXCJ5YW1sXCI6IFwidGV4dC95YW1sXCIsXG4gICAgXCJ5YW5nXCI6IFwiYXBwbGljYXRpb24veWFuZ1wiLFxuICAgIFwieWluXCI6IFwiYXBwbGljYXRpb24veWluK3htbFwiLFxuICAgIFwieW1sXCI6IFwidGV4dC95YW1sXCIsXG4gICAgXCJ6XCI6IFwiYXBwbGljYXRpb24veC1jb21wcmVzc1wiLFxuICAgIFwiejFcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6MlwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInozXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejRcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NVwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno2XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejdcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6OFwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInphelwiOiBcImFwcGxpY2F0aW9uL3ZuZC56emF6ei5kZWNrK3htbFwiLFxuICAgIFwiemlwXCI6IFwiYXBwbGljYXRpb24vemlwXCIsXG4gICAgXCJ6aXJcIjogXCJhcHBsaWNhdGlvbi92bmQuenVsXCIsXG4gICAgXCJ6aXJ6XCI6IFwiYXBwbGljYXRpb24vdm5kLnp1bFwiLFxuICAgIFwiem1tXCI6IFwiYXBwbGljYXRpb24vdm5kLmhhbmRoZWxkLWVudGVydGFpbm1lbnQreG1sXCIsXG4gICAgXCIxMjNcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtMS0yLTNcIlxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pbWUtdHlwZXMtbW9kdWxlLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuYXN5bmMgZnVuY3Rpb24gYWZ0ZXJGZXRjaChyZXNwb25zZSkge1xuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYGJhZCByZXNwb25zZSA6ICR7SlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpfWApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IHJlY2VpdmVkQ29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgfHwgJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgIGxldCBzY2kgPSByZWNlaXZlZENvbnRlbnRUeXBlLmluZGV4T2YoJzsnKTtcbiAgICBpZiAoc2NpID49IDApXG4gICAgICAgIHJlY2VpdmVkQ29udGVudFR5cGUgPSByZWNlaXZlZENvbnRlbnRUeXBlLnN1YnN0cigwLCBzY2kpO1xuICAgIGlmIChyZWNlaXZlZENvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG59XG5mdW5jdGlvbiBnZXREYXRhKHVybCwgaGVhZGVycyA9IG51bGwpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJ1xuICAgIH07XG4gICAgaWYgKGhlYWRlcnMpXG4gICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgcmV0dXJuIGZldGNoKHVybCwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmdldERhdGEgPSBnZXREYXRhO1xuZnVuY3Rpb24gcG9zdERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLnBvc3REYXRhID0gcG9zdERhdGE7XG5mdW5jdGlvbiBwdXREYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLnB1dERhdGEgPSBwdXREYXRhO1xuZnVuY3Rpb24gZGVsZXRlRGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5kZWxldGVEYXRhID0gZGVsZXRlRGF0YTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5ldHdvcmsuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmV4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT0gXCJob21lLmx0ZWNvbnN1bHRpbmcuZnJcIiA/IFwiaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnJcIiA6IFwiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwNVwiO1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoKHNlYXJjaFRleHQsIG1pbWVUeXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHNlYXJjaFNwZWMgPSB7XG4gICAgICAgICAgICBuYW1lOiBzZWFyY2hUZXh0LFxuICAgICAgICAgICAgbWltZVR5cGU6IG1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0RGlyZWN0b3JpZXMsIHJlc3VsdEZpbGVzZGRkLCBpdGVtcyB9ID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zZWFyY2hgLCBzZWFyY2hTcGVjKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzOiByZXN1bHREaXJlY3RvcmllcyxcbiAgICAgICAgICAgIGZpbGVzOiByZXN1bHRGaWxlc2RkZCxcbiAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5zZWFyY2ggPSBzZWFyY2g7XG5hc3luYyBmdW5jdGlvbiBnZXREaXJlY3RvcnlEZXNjcmlwdG9yKHNoYSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9YXBwbGljYXRpb24vanNvbmApO1xufVxuZXhwb3J0cy5nZXREaXJlY3RvcnlEZXNjcmlwdG9yID0gZ2V0RGlyZWN0b3J5RGVzY3JpcHRvcjtcbmFzeW5jIGZ1bmN0aW9uIGdldFJlZmVyZW5jZXMoKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9yZWZzYCk7XG59XG5leHBvcnRzLmdldFJlZmVyZW5jZXMgPSBnZXRSZWZlcmVuY2VzO1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlKG5hbWUpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3JlZnMvJHtuYW1lfWApO1xufVxuZXhwb3J0cy5nZXRSZWZlcmVuY2UgPSBnZXRSZWZlcmVuY2U7XG5hc3luYyBmdW5jdGlvbiBnZXRDb21taXQoc2hhKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT1hcHBsaWNhdGlvbi9qc29uYCk7XG59XG5leHBvcnRzLmdldENvbW1pdCA9IGdldENvbW1pdDtcbmZ1bmN0aW9uIGdldFNoYUNvbnRlbnRVcmwoc2hhLCBtaW1lVHlwZSwgbmFtZSwgaXNEb3dubG9hZCkge1xuICAgIGlmICghc2hhKVxuICAgICAgICByZXR1cm4gJyMnO1xuICAgIGxldCBiYXNlID0gYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9JHtlbmNvZGVVUklDb21wb25lbnQobWltZVR5cGUpfWA7XG4gICAgaWYgKGlzRG93bmxvYWQpXG4gICAgICAgIGJhc2UgKz0gYCZmaWxlTmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lIHx8IHNoYSl9YDtcbiAgICByZXR1cm4gYmFzZTtcbn1cbmV4cG9ydHMuZ2V0U2hhQ29udGVudFVybCA9IGdldFNoYUNvbnRlbnRVcmw7XG5hc3luYyBmdW5jdGlvbiBwdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdE5hbWUsIHNoYSwgbWltZVR5cGUsIG5hbWUpIHtcbiAgICBsZXQgcGF5bG9hZCA9IHtcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IG1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIG1pbWVUeXBlLFxuICAgICAgICAgICAgICAgIHNoYVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5wdXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3BsdWdpbnMvcGxheWxpc3RzLyR7cGxheWxpc3ROYW1lfWAsIHBheWxvYWQpO1xufVxuZXhwb3J0cy5wdXRJdGVtVG9QbGF5bGlzdCA9IHB1dEl0ZW1Ub1BsYXlsaXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzdC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgxIHgtaWQ9XCJ0aXRsZVwiIGNsYXNzPVwiYW5pbWF0ZWQtLXF1aWNrXCI+UmFjY29vbjwvaDE+XG4gICAgICAgIDxoNCB4LWlkPVwic3ViVGl0bGVcIj5TZWFyY2ggZm9yIHNvbmdzPC9oND5cbiAgICAgICAgPGZvcm0geC1pZD1cImZvcm1cIiBjbGFzcz1cIm11aS1mb3JtLS1pbmxpbmVcIj5cbiAgICAgICAgICAgIDwhLS10aGlzIGlzIGEgbGl0dGxlIGhhY2sgdG8gaGF2ZSB0aGluZ3MgY2VudGVyZWQtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIj7wn5SNPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLXRleHRmaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB4LWlkPVwidGVybVwiIHR5cGU9XCJ0ZXh0XCIgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCIgYXV0b2ZvY3VzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHJvbGU9XCJzdWJtaXRcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPvCflI08L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgICA8YnIgLz5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLnNlYXJjaFBhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIGRpc3BsYXlUaXRsZTogKHRlbXBsYXRlLCBkaXNwbGF5ZWQpID0+IHtcbiAgICAgICAgaWYgKGRpc3BsYXllZCkge1xuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LnJlbW92ZSgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICAgICAgdGVtcGxhdGUuc3ViVGl0bGUuc3R5bGUuZGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLnRpdGxlLmNsYXNzTGlzdC5hZGQoJ2hleGEtLXJlZHVjZWQnKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLnN1YlRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2VhcmNoLXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBTbmlwcGV0cyA9IHJlcXVpcmUoXCIuL2h0bWwtc25pcHBldHNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDIgeC1pZD1cInRpdGxlXCI+PC9oMj5cbiAgICAgICAgPGRpdiB4LWlkPVwiaXRlbXNcIiBjbGFzcz1cIm11aS1wYW5lbFwiIHN0eWxlPVwiZGlzcGxheTogaW5saW5lLWJsb2NrO1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUmVzdWx0UGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVNlYXJjaGluZzogKGVsZW1lbnRzLCB0ZXJtKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPlNlYXJjaGluZyAnJHt0ZXJtfScgLi4uPC9kaXY+YDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYGA7XG4gICAgfSxcbiAgICBzZXRWYWx1ZXM6IChlbGVtZW50cywgdmFsdWVzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGBSZXN1bHRzIGZvciAnJHt2YWx1ZXMudGVybX0nYDtcbiAgICAgICAgaWYgKHZhbHVlcy5pdGVtcyAmJiB2YWx1ZXMuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSB2YWx1ZXMuaXRlbXMubWFwKFNuaXBwZXRzLml0ZW1Ub0h0bWwpLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+Tm8gcmVzdWx0czwvZGl2PmA7XG4gICAgICAgIH1cbiAgICB9LFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1yZXN1bHQtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2xzID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IGVsZW1lbnRzRGF0YSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4ob2JqLCBodG1sKSB7XG4gICAgbGV0IHJvb3QgPSBVaVRvb2xzLmVsRnJvbUh0bWwoaHRtbCk7XG4gICAgb2JqWydyb290J10gPSByb290O1xuICAgIFVpVG9vbHMuZWxzKHJvb3QsIGBbeC1pZF1gKS5mb3JFYWNoKGUgPT4gb2JqW2UuZ2V0QXR0cmlidXRlKCd4LWlkJyldID0gZSk7XG4gICAgaWYgKHJvb3QuaGFzQXR0cmlidXRlKCd4LWlkJykpXG4gICAgICAgIG9ialtyb290LmdldEF0dHJpYnV0ZSgneC1pZCcpXSA9IHJvb3Q7XG4gICAgZWxlbWVudHNEYXRhLnNldChyb290LCBvYmopO1xuICAgIHJldHVybiByb290O1xufVxuZXhwb3J0cy5jcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4gPSBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW47XG5mdW5jdGlvbiBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YShyb290KSB7XG4gICAgY29uc3QgZGF0YSA9IGVsZW1lbnRzRGF0YS5nZXQocm9vdCk7XG4gICAgcmV0dXJuIGRhdGE7XG59XG5leHBvcnRzLmdldFRlbXBsYXRlSW5zdGFuY2VEYXRhID0gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGE7XG5mdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlKGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbih7fSwgaHRtbCk7XG4gICAgcmV0dXJuIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpO1xufVxuZXhwb3J0cy5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlID0gY3JlYXRlVGVtcGxhdGVJbnN0YW5jZTtcbmNvbnN0IEVNUFRZX0xPQ0FUSU9OID0geyBlbGVtZW50OiBudWxsLCBjaGlsZEluZGV4OiAtMSB9O1xuZnVuY3Rpb24gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKGVsZW1lbnRzLCBldmVudCkge1xuICAgIGxldCBlbHMgPSBuZXcgU2V0KE9iamVjdC52YWx1ZXMoZWxlbWVudHMpKTtcbiAgICBsZXQgYyA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgcCA9IG51bGw7XG4gICAgZG8ge1xuICAgICAgICBpZiAoZWxzLmhhcyhjKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBjLFxuICAgICAgICAgICAgICAgIGNoaWxkSW5kZXg6IHAgJiYgQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjLmNoaWxkcmVuLCBwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYyA9PSBlbGVtZW50cy5yb290KVxuICAgICAgICAgICAgcmV0dXJuIEVNUFRZX0xPQ0FUSU9OO1xuICAgICAgICBwID0gYztcbiAgICAgICAgYyA9IGMucGFyZW50RWxlbWVudDtcbiAgICB9IHdoaWxlIChjKTtcbiAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG59XG5leHBvcnRzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbiA9IHRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlcy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGVsKGlkKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbn1cbmV4cG9ydHMuZWwgPSBlbDtcbmZ1bmN0aW9uIGVscyhlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufVxuZXhwb3J0cy5lbHMgPSBlbHM7XG5mdW5jdGlvbiBlbEZyb21IdG1sKGh0bWwpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gcGFyZW50LmNoaWxkcmVuLml0ZW0oMCk7XG59XG5leHBvcnRzLmVsRnJvbUh0bWwgPSBlbEZyb21IdG1sO1xuZnVuY3Rpb24gc3RvcEV2ZW50KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbn1cbmV4cG9ydHMuc3RvcEV2ZW50ID0gc3RvcEV2ZW50O1xuZnVuY3Rpb24qIGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoc3RhcnQpIHtcbiAgICB3aGlsZSAoc3RhcnQpIHtcbiAgICAgICAgeWllbGQgc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucGFyZW50RWxlbWVudDtcbiAgICB9XG59XG5leHBvcnRzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQgPSBpdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dWktdG9vbC5qcy5tYXAiXSwic291cmNlUm9vdCI6IiJ9
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
        elements.player.setAttribute('src', Rest.getShaContentUrl(sha, mimeType, name, false, false));
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
async function me() {
    if (!authenticatedUser)
        authenticatedUser = await Network.getData(`https://home.lteconsulting.fr/well-known/v1/me`);
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
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Snippets = __webpack_require__(/*! ./html-snippets */ "./public/html-snippets.js");
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items" class="mui-panel"></div>
    </div>
</div>`;
exports.directoryPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    setLoading: (elements, title) => {
        elements.title.innerHTML = `Loading '${title}' ...`;
        elements.items.innerHTML = ``;
    },
    displaySearching: (elements, term) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`;
        elements.items.innerHTML = ``;
    },
    setValues: (elements, values) => {
        elements.title.innerHTML = `${values.name}`;
        elements.items.classList.remove('x-image-panel');
        elements.items.classList.add('x-items-panel');
        if (values.items && values.items.length) {
            elements.items.innerHTML = values.items.map(Snippets.itemToHtml).join('');
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
        }
    },
    setImages: (elements, values) => {
        elements.title.innerHTML = values.term;
        elements.items.classList.add('x-image-panel');
        elements.items.classList.remove('x-items-panel');
        elements.items.innerHTML = values.items.map(item => {
            if (item.mimeType.startsWith('image/')) {
                return `<div><img class="x-image-zoom-action onclick" loading="lazy" src="blank.jpeg" data-src="${Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)}"/></div>`;
            }
            else {
                return `<div>${Snippets.itemToHtml(item)}</div>`;
            }
        }).join('');
        let nbFirst = 25;
        let timeAfter = 2000;
        let toObserve = values.items
            .map((item, index) => ({ item, index }))
            .filter(e => e.item.mimeType.startsWith('image/'));
        let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.getAttribute('data-src');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        toObserve.slice(0, nbFirst).forEach(e => lazyImageObserver.observe(elements.items.children.item(e.index).children.item(0)));
        if (toObserve.length > nbFirst) {
            setTimeout(() => {
                toObserve.slice(nbFirst).forEach(e => lazyImageObserver.observe(elements.items.children.item(e.index).children.item(0)));
            }, timeAfter);
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
        return `<div x-for-sha="${f.sha && f.sha.substr(0, 5)}" class="onclick"><a href="${Rest.getShaContentUrl(f.sha, f.mimeType, f.name, true, false)}" target="_blank">${f.name}</a> <a class="x-info-display-action mui--text-dark-secondary" href="#">info</a></div>`;
}
exports.itemToHtml = itemToHtml;
//# sourceMappingURL=html-snippets.js.map

/***/ }),

/***/ "./public/image-detail.js":
/*!********************************!*\
  !*** ./public/image-detail.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const UiTool = __webpack_require__(/*! ./ui-tool */ "./public/ui-tool.js");
const template = `
    <div class="x-image-detail">
        <img x-id="image"/>
        <div x-id="toolbar">
        <button class="mui-btn mui-btn--flat mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button class="mui-btn mui-btn--flat mui-btn--raised">Next</button>
        </div>
    </div>`;
const element = templates_1.createTemplateInstance(template);
element.close.addEventListener('click', event => {
    UiTool.stopEvent(event);
    document.body.querySelector('header').style.display = undefined;
    if (!element.root.isConnected)
        return;
    element.root.parentElement.removeChild(element.root);
});
function show(item, unroller) {
    document.body.querySelector('header').style.display = 'none';
    if (!element.root.isConnected)
        document.body.appendChild(element.root);
    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType);
    element.image.alt = item.name;
}
exports.show = show;
//# sourceMappingURL=image-detail.js.map

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
const AudioPanel = __webpack_require__(/*! ./audio-panel */ "./public/audio-panel.js");
const DirectoryPanel = __webpack_require__(/*! ./directory-panel */ "./public/directory-panel.js");
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const Auth = __webpack_require__(/*! ./auth */ "./public/auth.js");
const Templates = __webpack_require__(/*! ./templates */ "./public/templates.js");
const MimeTypes = __webpack_require__(/*! ./mime-types-module */ "./public/mime-types-module.js");
const Messages = __webpack_require__(/*! ./messages */ "./public/messages.js");
const Slideshow = __webpack_require__(/*! ./slideshow */ "./public/slideshow.js");
const InfoPanel = __webpack_require__(/*! ./info-panel */ "./public/info-panel.js");
const ImageDetails = __webpack_require__(/*! ./image-detail */ "./public/image-detail.js");
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
    let hideAudioJukebox = false;
    let hideInfoPanel = true;
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
    else if (parsed.pathname == '/slideshow') {
        hideAudioJukebox = true;
        showSlideshow();
    }
    else if (parsed.pathname.startsWith('/info/')) {
        hideInfoPanel = false;
        const item = JSON.parse(parsed.pathname.substring('/info/'.length));
        showInfo(item);
    }
    else {
        console.log(`unkown path ${parsed.pathname}`);
    }
    if (hideInfoPanel)
        InfoPanel.hide();
    if (hideAudioJukebox)
        audioPanel.root.classList.add('is-hidden');
    else
        audioPanel.root.classList.remove('is-hidden');
}
var Mode;
(function (Mode) {
    Mode[Mode["Audio"] = 0] = "Audio";
    Mode[Mode["Image"] = 1] = "Image";
})(Mode || (Mode = {}));
const searchPanel = SearchPanel.searchPanel.create();
const audioPanel = AudioPanel.audioPanel.create();
const audioJukebox = new AudioPanel.AudioJukebox(audioPanel);
const directoryPanel = DirectoryPanel.directoryPanel.create();
let slideshow = null;
let lastDisplayedFiles = null;
let lastSearchTerm = null; // HACK very temporary
let actualContent = null;
let currentMode = Mode.Audio;
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
function goShaInfo(item) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`;
}
function goSearchItems(term) {
    const url = `#/search/${term}`;
    window.location.href = url;
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
async function searchItems(term) {
    SearchPanel.searchPanel.displayTitle(searchPanel, false);
    const waiting = beginWait(() => Messages.displayMessage(`Still searching '${term}' ...`, 0));
    let mimeType = '%';
    switch (currentMode) {
        case Mode.Audio:
            mimeType = 'audio/%';
            break;
        case Mode.Image:
            mimeType = 'image/%';
            break;
    }
    let res = await Rest.search(term, mimeType);
    if (!res) {
        waiting.done();
        Messages.displayMessage(`Error occurred, retry please...`, -1);
    }
    // first files then directories
    res.items = res.items
        .filter(i => i.mimeType != 'application/directory')
        .concat(res.items.filter(i => i.mimeType == 'application/directory'));
    res.items = beautifyNames(res.items);
    lastDisplayedFiles = res.items;
    lastSearchTerm = term;
    waiting.done();
    setContent(directoryPanel.root);
    switch (currentMode) {
        case Mode.Audio:
            DirectoryPanel.directoryPanel.setValues(directoryPanel, {
                name: `Results for '${term}'`,
                items: res.items
            });
            break;
        case Mode.Image:
            DirectoryPanel.directoryPanel.setImages(directoryPanel, {
                term: term,
                items: res.items
            });
            break;
    }
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
    switch (currentMode) {
        case Mode.Audio:
            DirectoryPanel.directoryPanel.setValues(directoryPanel, {
                name: item.name,
                items: items
            });
            break;
        case Mode.Image:
            DirectoryPanel.directoryPanel.setImages(directoryPanel, {
                term: item.name,
                items: items
            });
            break;
    }
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
function itemDefaultAction(childIndex, event) {
    let item = lastDisplayedFiles[childIndex];
    if (event.target.classList.contains('x-info-display-action')) {
        goShaInfo(item);
        return;
    }
    if (event.target.classList.contains('x-image-zoom-action')) {
        ImageDetails.show(item, null);
        return;
    }
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
function showSlideshow() {
    if (!slideshow)
        slideshow = Slideshow.create();
    setContent(slideshow.root);
}
function showInfo(item) {
    InfoPanel.show(item);
}
directoryPanel.root.addEventListener('click', async (event) => {
    UiTool.stopEvent(event);
    // todo : knownledge to do that is in directoryPanel
    let { element, childIndex } = Templates.templateGetEventLocation(directoryPanel, event);
    if (lastDisplayedFiles && element == directoryPanel.items && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        itemDefaultAction(childIndex, event);
    }
});
searchPanel.audioMode.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (currentMode == Mode.Audio) {
        Messages.displayMessage(`Audio mode already activated`, 0);
        return;
    }
    Messages.displayMessage(`Audio mode activated`, 0);
    currentMode = Mode.Audio;
    readHashAndAct();
});
searchPanel.imageMode.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (currentMode == Mode.Image) {
        Messages.displayMessage(`Image mode already activated`, 0);
        return;
    }
    Messages.displayMessage(`Image mode activated`, 0);
    currentMode = Mode.Image;
    readHashAndAct();
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

/***/ "./public/info-panel.js":
/*!******************************!*\
  !*** ./public/info-panel.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = __webpack_require__(/*! ./ui-tool */ "./public/ui-tool.js");
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Messages = __webpack_require__(/*! ./messages */ "./public/messages.js");
const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;
const TB = 1024 * GB;
function friendlySize(size) {
    if (size > 2 * TB)
        return `${(size / TB).toFixed(1)} TBb (${size} bytes)`;
    if (size > 2 * GB)
        return `${(size / GB).toFixed(1)} Gb (${size} bytes)`;
    if (size > 2 * MB)
        return `${(size / MB).toFixed(1)} Mb (${size} bytes)`;
    if (size > 2 * KB)
        return `${(size / KB).toFixed(1)} kb (${size} bytes)`;
    if (size > 1)
        return `${size} bytes`;
    if (size == 1)
        return `1 byte`;
    return `empty`;
}
let isShown = false;
const template = `
<div class="mui-container">
    <div class='mui-panel'>
        <div x-id="title" class="mui--text-title"></div>
        <div class="mui-divider"></div>
        <div>sha: <span x-id='sha'></span></div>
        <div>size: <span x-id='size'></span></div>
        <div>mime type: <span x-id='mimeType'></span></div>
        <div class="mui-divider"></div>
        <div><a x-id="download" href="#">download link</a></div>
        <div class="mui-divider"></div>
        <div x-id="extras"></div>

        <div>names: <span x-id='names'></span></div>
        <div>write dates: <span x-id='writeDates'></span></div>
        <div>parents: <div x-id='parents'></div></div>
        <div>sources: <div x-id='sources'></div></div>
        <div>exif: <div x-id="exif"></div></div>
        <div class="mui-divider"></div>
        <div x-id="close" class="mui-btn mui-btn--flat mui-btn--primary">Close</div>
    </div>
</div>`;
const content = templates_1.createTemplateInstance(template);
const options = {
    'keyboard': false,
    'static': true,
    'onclose': function () { }
};
content.close.addEventListener('click', event => {
    UiTool.stopEvent(event);
    history.back();
});
function hide() {
    if (!isShown)
        return;
    isShown = false;
    mui.overlay('off');
}
exports.hide = hide;
function show(item) {
    content.title.innerText = `${item.name} details`;
    content.sha.innerText = item.sha;
    content.mimeType.innerText = item.mimeType;
    content.size.innerText = friendlySize(item.size);
    content.download.href = Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, true);
    if (item.mimeType.startsWith('image/')) {
        content.extras.innerHTML = `<a target="_blank" href="${Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, false)}"><img src="${Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)}"/></a><div class="mui-divider"></div>`;
    }
    else {
        content.extras.innerHTML = '';
    }
    if (!isShown)
        mui.overlay('on', options, content.root);
    isShown = true;
    const loadInfo = async () => {
        const info = await Rest.getShaInfo(item.sha);
        if (!info) {
            Messages.displayMessage(`Cannot load detailed information...`, -1);
            return;
        }
        content.mimeType.innerText = info.mimeTypes.join(', ');
        content.names.innerText = info.names.join(', ');
        content.writeDates.innerText = info.writeDates.map(d => new Date(d / 1000).toDateString()).join(', ');
        content.size.innerText = info.sizes.map(friendlySize).join(', ');
        content.parents.innerHTML = info.parents.map(p => `<div><a href="#/directories/${p}?name=${encodeURIComponent(`${item.name}'s parents`)}">${p}</a></div>`).join('');
        content.sources.innerHTML = info.sources.map(s => `<div><a href="#/refs/${s}">${s}</a></div>`).join('');
        if (info.exifs && info.exifs.length) {
            content.exif.innerHTML = `
                <table class="mui-table">
                    <thead>
                        <tr>
                        <th>Property</th>
                        <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${info.exifs.map(exif => Object.entries(exif).map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`).join('')).join('')}
                    </tbody>
                </table>`;
        }
        else {
            content.exif.innerHTML = `no exif data`;
        }
    };
    loadInfo();
}
exports.show = show;
//# sourceMappingURL=info-panel.js.map

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
async function searchEx(searchSpec) {
    try {
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
exports.searchEx = searchEx;
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
async function getShaInfo(sha) {
    return await Network.getData(`${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/info`);
}
exports.getShaInfo = getShaInfo;
function getShaContentUrl(sha, mimeType, name, withPhantom, isDownload) {
    if (!sha)
        return '#';
    let base = withPhantom ?
        `${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/content/${encodeURIComponent(name)}?type=${encodeURIComponent(mimeType)}` :
        `${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/content?type=${encodeURIComponent(mimeType)}`;
    if (isDownload)
        base += `&fileName=${encodeURIComponent(name || sha)}`;
    return base;
}
exports.getShaContentUrl = getShaContentUrl;
function getShaImageThumbnailUrl(sha, mimeType) {
    return `${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/thumbnail?type=${mimeType}`;
}
exports.getShaImageThumbnailUrl = getShaImageThumbnailUrl;
function getShaImageMediumThumbnailUrl(sha, mimeType) {
    return `${exports.HEXA_BACKUP_BASE_URL}/sha/${sha}/plugins/image/medium?type=${mimeType}`;
}
exports.getShaImageMediumThumbnailUrl = getShaImageMediumThumbnailUrl;
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
        <span><a x-id='audioMode' href="#">🎶</a>&nbsp;<a x-id='imageMode' href="#">️🎞️</a></span>
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

/***/ "./public/slideshow.js":
/*!*****************************!*\
  !*** ./public/slideshow.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Messages = __webpack_require__(/*! ./messages */ "./public/messages.js");
const wait = (duration) => new Promise(resolve => setTimeout(resolve, duration));
const rand = max => Math.floor(max * Math.random());
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2>Slideshow</h2>
        <div x-id="items" class="mui-panel x-slideshow"></div>
        speed: <input x-id="speed" type="range" min="50" max="3000" value="2000"/>
        nb rows: <input x-id="nbRows" type="number" min="1" max="150" value="1"/>
        nb images: <input x-id="nbImages" type="number" min="1" max="100" value="3"/>
        interval: <input x-id="interval" type="number" min="1" max="365" value="15" value="50"/>
        <input x-id="date" type="range" min="-${365 * 20}" max="0" value="0" style="width:100%;"/>
        <div x-id="remark"></div>
    </div>
</div>`;
function create() {
    let els = templates_1.createTemplateInstance(templateHtml);
    const removeRandomImage = () => {
        let imageElement = pickRandomImage();
        if (imageElement) {
            let parent = imageElement.parentElement;
            parent.removeChild(imageElement);
            if (!parent.children.length)
                parent.parentElement.removeChild(parent);
        }
        return imageElement;
    };
    const addRandomImage = (nbDesiredRows) => {
        let imageElement = document.createElement('img');
        let row = null;
        if (els.items.children.length < nbDesiredRows) {
            row = document.createElement('div');
            els.items.appendChild(row);
        }
        else {
            row = els.items.children.item(rand(els.items.children.length));
        }
        row.appendChild(imageElement);
        return imageElement;
    };
    const pickRandomImage = () => {
        let possibleElements = [];
        for (let row of els.items.children) {
            for (let img of row.children)
                possibleElements.push(img);
        }
        if (!possibleElements.length)
            return null;
        return possibleElements[rand(possibleElements.length)];
    };
    const enumImages = (s) => {
        for (let rowIdx = 0; rowIdx < els.items.children.length; rowIdx++) {
            const row = els.items.children.item(rowIdx);
            for (let i = 0; i < row.children.length; i++) {
                s.add(row.children.item(i));
            }
        }
    };
    const imagesCount = () => {
        let count = 0;
        for (let rowIdx = 0; rowIdx < els.items.children.length; rowIdx++) {
            const row = els.items.children.item(rowIdx);
            count += row.children.length;
        }
        return count;
    };
    (async () => {
        let possibleImages = [];
        let lastSearchDate = null;
        let lastSearchInterval = null;
        let currentOffset = 0;
        let finished = false;
        let toRemove = new Set();
        while (true) {
            try {
                const timeFromNowInMs = (parseInt(els.date.value || '0')) * 1000 * 60 * 60 * 24;
                const intervalInDays = parseInt(els.interval.value) || 1;
                const intervalInMs = intervalInDays * 1000 * 60 * 60 * 24;
                const nbWantedImages = parseInt(els.nbImages.value) || 1;
                const nbDesiredRows = parseInt(els.nbRows.value) || 1;
                const waitDurationInMs = parseInt(els.speed.value) || 2000;
                let center = new Date().getTime() + timeFromNowInMs;
                let doSearch = false;
                if (lastSearchDate != timeFromNowInMs || lastSearchInterval != intervalInMs) {
                    currentOffset = 0;
                    doSearch = true;
                    // all current images are no more part of the last search
                    toRemove = new Set();
                    enumImages(toRemove);
                }
                else if (!possibleImages || !possibleImages.length) {
                    doSearch = !finished;
                }
                if (doSearch) {
                    lastSearchDate = timeFromNowInMs;
                    lastSearchInterval = intervalInMs;
                    console.log(`do a search on ${center} +/- ${intervalInDays} @ ${currentOffset}`);
                    let searchSpec = {
                        mimeType: 'image/%',
                        noDirectory: true,
                        limit: 13,
                        offset: currentOffset,
                        dateMin: center - intervalInMs,
                        dateMax: center + intervalInMs
                    };
                    const results = await Rest.searchEx(searchSpec);
                    possibleImages = results && results.items;
                    if (possibleImages.length)
                        currentOffset += possibleImages.length;
                    else
                        currentOffset = 0;
                    finished = possibleImages.length == 0;
                }
                if (possibleImages && possibleImages.length) {
                    els.remark.innerHTML = `${new Date(center).toDateString()} : ${nbWantedImages} images on ${nbDesiredRows} rows +/- ${intervalInDays} days (@${currentOffset})`;
                    if (imagesCount() > nbWantedImages) {
                        let imageElement = removeRandomImage();
                        if (imageElement) {
                            if (toRemove.has(imageElement))
                                toRemove.delete(imageElement);
                        }
                    }
                    else {
                        let imageElement = null;
                        if (imagesCount() < nbWantedImages) {
                            imageElement = addRandomImage(nbDesiredRows);
                        }
                        else {
                            imageElement = pickRandomImage();
                        }
                        if (toRemove.has(imageElement))
                            toRemove.delete(imageElement);
                        let imageIndex = rand(possibleImages.length);
                        let [usedImage] = possibleImages.splice(imageIndex, 1);
                        if (usedImage)
                            imageElement.src = Rest.getShaImageThumbnailUrl(usedImage.sha, usedImage.mimeType);
                    }
                }
                else {
                    els.remark.innerHTML = `${new Date(center).toDateString()}, no more image, change the cursors`;
                    if (toRemove.size) {
                        let imageElements = [];
                        toRemove.forEach(imageElement => imageElements.push(imageElement));
                        if (imageElements.length) {
                            let imageElement = imageElements[rand(imageElements.length)];
                            imageElement.parentElement.removeChild(imageElement);
                            toRemove.delete(imageElement);
                        }
                    }
                }
                await wait(waitDurationInMs);
            }
            catch (err) {
                Messages.displayMessage(`error in slideshow, waiting 5s`, -1);
                await wait(5000);
            }
        }
    })();
    return els;
}
exports.create = create;
//# sourceMappingURL=slideshow.js.map

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2h0bWwtc25pcHBldHMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2ltYWdlLWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZm8tcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL21lc3NhZ2VzLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9taW1lLXR5cGVzLW1vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbmV0d29yay5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zbGlkZXNob3cuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3RlbXBsYXRlcy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdWktdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QyxjQUFjO0FBQzdELGdFQUFnRSxNQUFNLElBQUksYUFBYTtBQUN2RixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxvQzs7Ozs7Ozs7Ozs7O0FDbENBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Qzs7Ozs7Ozs7Ozs7O0FDMWdDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFD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QUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQ3RLQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsZ0JBQWdCLG1CQUFPLENBQUMsc0NBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHFDOzs7Ozs7Ozs7Ozs7QUM1Q0EsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3B1YmxpYy9pbmRleC5qc1wiKTtcbiIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgTWltZVR5cGVzID0gcmVxdWlyZShcIi4vbWltZS10eXBlcy1tb2R1bGVcIik7XG5jb25zdCBNZXNzYWdlcyA9IHJlcXVpcmUoXCIuL21lc3NhZ2VzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz1cImF1ZGlvLWZvb3RlciBtdWktcGFuZWxcIj5cbiAgICA8aDMgY2xhc3M9XCJ4LXdoZW4tbGFyZ2UtZGlzcGxheVwiPlBsYXlsaXN0PC9oMz5cbiAgICA8ZGl2IHgtaWQ9XCJwbGF5bGlzdFwiPjwvZGl2PlxuICAgIDxkaXYgeC1pZD1cImV4cGFuZGVyXCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1jZW50ZXJcIj7imLA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwieC1ob3Jpem9udGFsLWZsZXhcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCI+XG4gICAgICAgIDxhdWRpbyB4LWlkPVwicGxheWVyXCIgY2xhc3M9XCJhdWRpby1wbGF5ZXJcIiBjb250cm9scyBwcmVsb2FkPVwibWV0YWRhdGFcIj48L2F1ZGlvPlxuICAgICAgICA8YSB4LWlkPVwiYWRkUGxheWxpc3RCdXR0b25cIiBocmVmPVwiI3RvdG9cIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmFiXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmY0MDgxNzM7IGNvbG9yOiB3aGl0ZTtcIj4rIFBMLjwvYT48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIFJlc3QuZ2V0U2hhQ29udGVudFVybChzaGEsIG1pbWVUeXBlLCBuYW1lLCBmYWxzZSwgZmFsc2UpKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgndHlwZScsIG1pbWVUeXBlKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnBsYXkoKTtcbiAgICAgICAgZWxlbWVudHMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpO1xuICAgIH0sXG59O1xuY2xhc3MgQXVkaW9KdWtlYm94IHtcbiAgICBjb25zdHJ1Y3RvcihhdWRpb1BhbmVsKSB7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbCA9IGF1ZGlvUGFuZWw7XG4gICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgLy8gaWYgc2Nyb2xsIHRvIHBsYXlpbmcgaXRlbSBpcyByZXF1aXJlZCBhZnRlciBhIHBsYXlsaXN0IHJlZHJhd1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHF1ZXVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncGxheWxpc3QtYmFja3VwJykpO1xuICAgICAgICAgICAgaWYgKHF1ZXVlICYmIHF1ZXVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yIGxvYWRpbmcgcXVldWUgZnJvbSBsb2NhbCBzdG9yYWdlYCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMgPSBVaVRvb2xzLmVscyh0aGlzLmF1ZGlvUGFuZWwucm9vdCwgJy54LXdoZW4tbGFyZ2UtZGlzcGxheScpO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBhdWRpbyBwbGF5ZXIgZXJyb3JgKTtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RhbGxlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbGVkLCB0cnkgbmV4dCcpO1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmV4cGFuZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSAhdGhpcy5sYXJnZURpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBVaVRvb2xzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QXR0ciA9IGUuZ2V0QXR0cmlidXRlKCd4LXF1ZXVlLWluZGV4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleEF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4QXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gTmFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmFkZFBsYXlsaXN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBVaVRvb2xzLnN0b3BFdmVudChldmVudCk7XG4gICAgICAgICAgICBjb25zdCBwbGF5bGlzdCA9ICdmYXZvcml0ZXMnOyAvLyB0b2RvIHNob3VsZCBiZSBhIHBhcmFtZXRlci4uLlxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQ2Fubm90IGFkZCB0byBwbGF5bGlzdCwgbm90aGluZyBwbGF5aW5nYCwgLTEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBNaW1lVHlwZXMuZXh0ZW5zaW9uRnJvbU1pbWVUeXBlKGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgYXdhaXQgUmVzdC5wdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdCwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGAke2l0ZW0ubmFtZX0uJHtleHRlbnNpb259YCk7XG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShg8J+RjSAke2l0ZW0ubmFtZX0gYWRkZWQgdG8gcGxheWxpc3QgJyR7cGxheWxpc3R9J2AsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgY3VycmVudEl0ZW0oKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IDAgfHwgdGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgIH1cbiAgICBhZGRBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaXRlbSA9IHtcbiAgICAgICAgICAgIHNoYTogaXRlbS5zaGEsXG4gICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICBtaW1lVHlwZTogaXRlbS5taW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGlmIChjdXJyZW50SXRlbSAmJiBjdXJyZW50SXRlbS5zaGEgPT0gaXRlbS5zaGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMucHVzaFF1ZXVlQW5kUGxheShpdGVtKTtcbiAgICB9XG4gICAgcGxheU5leHQoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCArIDEgPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRoaXMuY3VycmVudEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlOZXh0VW5yb2xsZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5TmV4dFVucm9sbGVkKCkge1xuICAgICAgICBpZiAodGhpcy5pdGVtVW5yb2xsZXIpIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5pdGVtVW5yb2xsZXIudW5yb2xsKCk7XG4gICAgICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0SXRlbVVucm9sbGVyKGl0ZW1VbnJvbGxlcikge1xuICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IGl0ZW1VbnJvbGxlcjtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgcHVzaFF1ZXVlQW5kUGxheShpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGl0ZW0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncGxheWxpc3QtYmFja3VwJywgSlNPTi5zdHJpbmdpZnkodGhpcy5xdWV1ZSkpO1xuICAgICAgICB0aGlzLnBsYXkodGhpcy5xdWV1ZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgcGxheShpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucXVldWVbaW5kZXhdO1xuICAgICAgICAgICAgZXhwb3J0cy5hdWRpb1BhbmVsLnBsYXkodGhpcy5hdWRpb1BhbmVsLCBpdGVtLm5hbWUsIGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFt4LWZvci1zaGE9JyR7aXRlbS5zaGEuc3Vic3RyKDAsIDUpfSddYCkuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LmFkZCgnaXMtd2VpZ2h0ZWQnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAodGhpcy5yZWZyZXNoVGltZXIpXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZWZyZXNoVGltZXIpO1xuICAgICAgICB0aGlzLnJlZnJlc2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZWFsUmVmcmVzaFBsYXlsaXN0KCksIDEwKTtcbiAgICB9XG4gICAgcmVhbFJlZnJlc2hQbGF5bGlzdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnF1ZXVlIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5KVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj5UaGVyZSBhcmUgbm8gaXRlbXMgaW4geW91ciBwbGF5bGlzdC4gQ2xpY2sgb24gc29uZ3MgdG8gcGxheSB0aGVtLjwvc3Bhbj4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaHRtbCA9IGBgO1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMucXVldWVbaV07XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwoaSwgaXRlbS5uYW1lLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj48YSB4LWlkPSdjbGVhci1wbGF5bGlzdCcgaHJlZj0nIyc+Y2xlYXIgcGxheWxpc3Q8L2E+PC9kaXY+YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gMCAmJiB0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwodGhpcy5jdXJyZW50SW5kZXgsIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdLm5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5jdXJyZW50SW5kZXggKyAxfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj5mb2xsb3dlZCBieSAnJHt0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4ICsgMV0ubmFtZS5zdWJzdHIoMCwgMjApfScgLi4uPC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIC8vIGFmdGVyIHJlZnJlc2ggc3RlcHNcbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5ICYmIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsVG9wID0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5bGlzdEl0ZW1IdG1sKGluZGV4LCBuYW1lLCBvbmVMaW5lVGV4dCkge1xuICAgICAgICByZXR1cm4gYDxkaXYgeC1xdWV1ZS1pbmRleD1cIiR7aW5kZXh9XCIgY2xhc3M9XCJvbmNsaWNrICR7b25lTGluZVRleHQgPyAnaXMtb25lbGluZXRleHQnIDogJyd9ICR7aW5kZXggPT0gdGhpcy5jdXJyZW50SW5kZXggPyAnbXVpLS10ZXh0LWhlYWRsaW5lJyA6ICcnfVwiPiR7bmFtZX08L2Rpdj5gO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9KdWtlYm94ID0gQXVkaW9KdWtlYm94O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXVkaW8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmZ1bmN0aW9uIHdhaXQoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKSk7XG59XG5sZXQgYXV0aGVudGljYXRlZFVzZXIgPSBudWxsO1xuY2xhc3MgQXV0aCB7XG4gICAgb25FcnJvcigpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgICBhc3luYyBsb29wKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci9hdXRoYCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXMgPSBhd2FpdCBOZXR3b3JrLmdldERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL3dlbGwta25vd24vdjEvc2V0Q29va2llYCwgeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtyZXNwb25zZS50b2tlbn1gIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcyB8fCAhcmVzLmxpZmV0aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3Qgc2V0Q29va2llYCwgcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0ZWRVc2VyID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL21lYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3Qgb2J0YWluIGF1dGggdG9rZW5gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCByZWZyZXNoIGF1dGggKCR7ZXJyfSlgKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGV2ZXJ5IDMwIG1pbnV0ZXNcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAwMCAqIDYwICogMzApO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXV0b1JlbmV3QXV0aCgpIHtcbiAgICBsZXQgYXV0aCA9IG5ldyBBdXRoKCk7XG4gICAgYXV0aC5sb29wKCk7XG59XG5leHBvcnRzLmF1dG9SZW5ld0F1dGggPSBhdXRvUmVuZXdBdXRoO1xuYXN5bmMgZnVuY3Rpb24gbWUoKSB7XG4gICAgaWYgKCFhdXRoZW50aWNhdGVkVXNlcilcbiAgICAgICAgYXV0aGVudGljYXRlZFVzZXIgPSBhd2FpdCBOZXR3b3JrLmdldERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL3dlbGwta25vd24vdjEvbWVgKTtcbiAgICByZXR1cm4gYXV0aGVudGljYXRlZFVzZXI7XG59XG5leHBvcnRzLm1lID0gbWU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRoLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFNuaXBwZXRzID0gcmVxdWlyZShcIi4vaHRtbC1zbmlwcGV0c1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXInPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMiB4LWlkPVwidGl0bGVcIj48L2gyPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJpdGVtc1wiIGNsYXNzPVwibXVpLXBhbmVsXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5kaXJlY3RvcnlQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBzZXRMb2FkaW5nOiAoZWxlbWVudHMsIHRpdGxlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGBMb2FkaW5nICcke3RpdGxlfScgLi4uYDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYGA7XG4gICAgfSxcbiAgICBkaXNwbGF5U2VhcmNoaW5nOiAoZWxlbWVudHMsIHRlcm0pID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+U2VhcmNoaW5nICcke3Rlcm19JyAuLi48L2Rpdj5gO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSBgYDtcbiAgICB9LFxuICAgIHNldFZhbHVlczogKGVsZW1lbnRzLCB2YWx1ZXMpID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYCR7dmFsdWVzLm5hbWV9YDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuY2xhc3NMaXN0LnJlbW92ZSgneC1pbWFnZS1wYW5lbCcpO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5jbGFzc0xpc3QuYWRkKCd4LWl0ZW1zLXBhbmVsJyk7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChTbmlwcGV0cy5pdGVtVG9IdG1sKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzZXRJbWFnZXM6IChlbGVtZW50cywgdmFsdWVzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IHZhbHVlcy50ZXJtO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5jbGFzc0xpc3QuYWRkKCd4LWltYWdlLXBhbmVsJyk7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmNsYXNzTGlzdC5yZW1vdmUoJ3gtaXRlbXMtcGFuZWwnKTtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2PjxpbWcgY2xhc3M9XCJ4LWltYWdlLXpvb20tYWN0aW9uIG9uY2xpY2tcIiBsb2FkaW5nPVwibGF6eVwiIHNyYz1cImJsYW5rLmpwZWdcIiBkYXRhLXNyYz1cIiR7UmVzdC5nZXRTaGFJbWFnZVRodW1ibmFpbFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSl9XCIvPjwvZGl2PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxkaXY+JHtTbmlwcGV0cy5pdGVtVG9IdG1sKGl0ZW0pfTwvZGl2PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICBsZXQgbmJGaXJzdCA9IDI1O1xuICAgICAgICBsZXQgdGltZUFmdGVyID0gMjAwMDtcbiAgICAgICAgbGV0IHRvT2JzZXJ2ZSA9IHZhbHVlcy5pdGVtc1xuICAgICAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAgICAgLmZpbHRlcihlID0+IGUuaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSk7XG4gICAgICAgIGxldCBsYXp5SW1hZ2VPYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihmdW5jdGlvbiAoZW50cmllcywgb2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhenlJbWFnZSA9IGVudHJ5LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgbGF6eUltYWdlLnNyYyA9IGxhenlJbWFnZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhenlJbWFnZU9ic2VydmVyLnVub2JzZXJ2ZShsYXp5SW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdG9PYnNlcnZlLnNsaWNlKDAsIG5iRmlyc3QpLmZvckVhY2goZSA9PiBsYXp5SW1hZ2VPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnRzLml0ZW1zLmNoaWxkcmVuLml0ZW0oZS5pbmRleCkuY2hpbGRyZW4uaXRlbSgwKSkpO1xuICAgICAgICBpZiAodG9PYnNlcnZlLmxlbmd0aCA+IG5iRmlyc3QpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRvT2JzZXJ2ZS5zbGljZShuYkZpcnN0KS5mb3JFYWNoKGUgPT4gbGF6eUltYWdlT2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50cy5pdGVtcy5jaGlsZHJlbi5pdGVtKGUuaW5kZXgpLmNoaWxkcmVuLml0ZW0oMCkpKTtcbiAgICAgICAgICAgIH0sIHRpbWVBZnRlcik7XG4gICAgICAgIH1cbiAgICB9LFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcmVjdG9yeS1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuZnVuY3Rpb24gaXRlbVRvSHRtbChmKSB7XG4gICAgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcmVmZXJlbmNlJylcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwib25jbGlja1wiPjxpPiR7Zi5uYW1lfSAuLi48L2k+PC9kaXY+YDtcbiAgICBlbHNlIGlmIChmLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9wbGF5bGlzdCcpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSlcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEgJiYgZi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPiR7Zi5uYW1lfTwvZGl2PmA7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYSAmJiBmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+PGEgaHJlZj1cIiR7UmVzdC5nZXRTaGFDb250ZW50VXJsKGYuc2hhLCBmLm1pbWVUeXBlLCBmLm5hbWUsIHRydWUsIGZhbHNlKX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2YubmFtZX08L2E+IDxhIGNsYXNzPVwieC1pbmZvLWRpc3BsYXktYWN0aW9uIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiIGhyZWY9XCIjXCI+aW5mbzwvYT48L2Rpdj5gO1xufVxuZXhwb3J0cy5pdGVtVG9IdG1sID0gaXRlbVRvSHRtbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bWwtc25pcHBldHMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgVWlUb29sID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IHRlbXBsYXRlID0gYFxuICAgIDxkaXYgY2xhc3M9XCJ4LWltYWdlLWRldGFpbFwiPlxuICAgICAgICA8aW1nIHgtaWQ9XCJpbWFnZVwiLz5cbiAgICAgICAgPGRpdiB4LWlkPVwidG9vbGJhclwiPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0IG11aS1idG4tLWZsYXRcIj5QcmV2aW91czwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJjbG9zZVwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+Q2xvc2U8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdCBtdWktYnRuLS1yYWlzZWRcIj5OZXh0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmA7XG5jb25zdCBlbGVtZW50ID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSk7XG5lbGVtZW50LmNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignaGVhZGVyJykuc3R5bGUuZGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIWVsZW1lbnQucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIGVsZW1lbnQucm9vdC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQucm9vdCk7XG59KTtcbmZ1bmN0aW9uIHNob3coaXRlbSwgdW5yb2xsZXIpIHtcbiAgICBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKCFlbGVtZW50LnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudC5yb290KTtcbiAgICBlbGVtZW50LmltYWdlLnNyYyA9IFJlc3QuZ2V0U2hhSW1hZ2VNZWRpdW1UaHVtYm5haWxVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpO1xuICAgIGVsZW1lbnQuaW1hZ2UuYWx0ID0gaXRlbS5uYW1lO1xufVxuZXhwb3J0cy5zaG93ID0gc2hvdztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWltYWdlLWRldGFpbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1wYW5lbFwiKTtcbmNvbnN0IEF1ZGlvUGFuZWwgPSByZXF1aXJlKFwiLi9hdWRpby1wYW5lbFwiKTtcbmNvbnN0IERpcmVjdG9yeVBhbmVsID0gcmVxdWlyZShcIi4vZGlyZWN0b3J5LXBhbmVsXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBBdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbmNvbnN0IFRlbXBsYXRlcyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IE1pbWVUeXBlcyA9IHJlcXVpcmUoXCIuL21pbWUtdHlwZXMtbW9kdWxlXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IFNsaWRlc2hvdyA9IHJlcXVpcmUoXCIuL3NsaWRlc2hvd1wiKTtcbmNvbnN0IEluZm9QYW5lbCA9IHJlcXVpcmUoXCIuL2luZm8tcGFuZWxcIik7XG5jb25zdCBJbWFnZURldGFpbHMgPSByZXF1aXJlKFwiLi9pbWFnZS1kZXRhaWxcIik7XG4vKlxuaGFzaCB1cmxzIDpcblxuLSAnJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIy8nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIy9zZWFyY2gvOnRlcm0gICAgICAgICAgICAgICAgICAgc2VhcmNoXG4tICcjL2RpcmVjdG9yaWVzLzpzaGE/bmFtZT14eHggICAgICBkaXJlY3Rvcnlcbi0gJyMvYnJvd3NlJ1xuLSAnIy9yZWZzLzpuYW1lJ1xuKi9cbmZ1bmN0aW9uIHBhcnNlVVJMKHVybCkge1xuICAgIHZhciBwYXJzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyksIHNlYXJjaE9iamVjdCA9IHt9LCBxdWVyaWVzLCBzcGxpdCwgaTtcbiAgICAvLyBMZXQgdGhlIGJyb3dzZXIgZG8gdGhlIHdvcmtcbiAgICBwYXJzZXIuaHJlZiA9IHVybDtcbiAgICAvLyBDb252ZXJ0IHF1ZXJ5IHN0cmluZyB0byBvYmplY3RcbiAgICBxdWVyaWVzID0gcGFyc2VyLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpLnNwbGl0KCcmJyk7XG4gICAgZm9yIChpID0gMDsgaSA8IHF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3BsaXQgPSBxdWVyaWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgIHNlYXJjaE9iamVjdFtzcGxpdFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQoc3BsaXRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRobmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHBhcnNlci5wYXRobmFtZSksXG4gICAgICAgIHNlYXJjaE9iamVjdDogc2VhcmNoT2JqZWN0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlYWRIYXNoQW5kQWN0KCkge1xuICAgIGxldCBoaWRlQXVkaW9KdWtlYm94ID0gZmFsc2U7XG4gICAgbGV0IGhpZGVJbmZvUGFuZWwgPSB0cnVlO1xuICAgIGxldCBoYXNoID0gJyc7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyMnKSlcbiAgICAgICAgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgICBsZXQgcGFyc2VkID0gcGFyc2VVUkwoaGFzaCk7XG4gICAgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvc2VhcmNoLycpKSB7XG4gICAgICAgIHNlYXJjaEl0ZW1zKHBhcnNlZC5wYXRobmFtZS5zdWJzdHIoJy9zZWFyY2gvJy5sZW5ndGgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9kaXJlY3Rvcmllcy8nKSkge1xuICAgICAgICBjb25zdCBzaGEgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvZGlyZWN0b3JpZXMvJy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyc2VkLnNlYXJjaE9iamVjdC5uYW1lIHx8IHNoYTtcbiAgICAgICAgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgICAgICBzaXplOiAwLFxuICAgICAgICAgICAgc2hhLFxuICAgICAgICAgICAgbmFtZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lID09ICcvYnJvd3NlJykge1xuICAgICAgICBsb2FkUmVmZXJlbmNlcygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3JlZnMvJykpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnNlZC5wYXRobmFtZS5zdWJzdHJpbmcoJy9yZWZzLycubGVuZ3RoKTtcbiAgICAgICAgbG9hZFJlZmVyZW5jZShuYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lID09ICcvcGxheWxpc3RzJykge1xuICAgICAgICBsb2FkUGxheWxpc3RzKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvcGxheWxpc3RzLycpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvcGxheWxpc3RzLycubGVuZ3RoKTtcbiAgICAgICAgbG9hZFBsYXlsaXN0KG5hbWUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUgPT0gJy9zbGlkZXNob3cnKSB7XG4gICAgICAgIGhpZGVBdWRpb0p1a2Vib3ggPSB0cnVlO1xuICAgICAgICBzaG93U2xpZGVzaG93KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvaW5mby8nKSkge1xuICAgICAgICBoaWRlSW5mb1BhbmVsID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBKU09OLnBhcnNlKHBhcnNlZC5wYXRobmFtZS5zdWJzdHJpbmcoJy9pbmZvLycubGVuZ3RoKSk7XG4gICAgICAgIHNob3dJbmZvKGl0ZW0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVua293biBwYXRoICR7cGFyc2VkLnBhdGhuYW1lfWApO1xuICAgIH1cbiAgICBpZiAoaGlkZUluZm9QYW5lbClcbiAgICAgICAgSW5mb1BhbmVsLmhpZGUoKTtcbiAgICBpZiAoaGlkZUF1ZGlvSnVrZWJveClcbiAgICAgICAgYXVkaW9QYW5lbC5yb290LmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpO1xuICAgIGVsc2VcbiAgICAgICAgYXVkaW9QYW5lbC5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpO1xufVxudmFyIE1vZGU7XG4oZnVuY3Rpb24gKE1vZGUpIHtcbiAgICBNb2RlW01vZGVbXCJBdWRpb1wiXSA9IDBdID0gXCJBdWRpb1wiO1xuICAgIE1vZGVbTW9kZVtcIkltYWdlXCJdID0gMV0gPSBcIkltYWdlXCI7XG59KShNb2RlIHx8IChNb2RlID0ge30pKTtcbmNvbnN0IHNlYXJjaFBhbmVsID0gU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuY3JlYXRlKCk7XG5jb25zdCBhdWRpb1BhbmVsID0gQXVkaW9QYW5lbC5hdWRpb1BhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9KdWtlYm94ID0gbmV3IEF1ZGlvUGFuZWwuQXVkaW9KdWtlYm94KGF1ZGlvUGFuZWwpO1xuY29uc3QgZGlyZWN0b3J5UGFuZWwgPSBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5jcmVhdGUoKTtcbmxldCBzbGlkZXNob3cgPSBudWxsO1xubGV0IGxhc3REaXNwbGF5ZWRGaWxlcyA9IG51bGw7XG5sZXQgbGFzdFNlYXJjaFRlcm0gPSBudWxsOyAvLyBIQUNLIHZlcnkgdGVtcG9yYXJ5XG5sZXQgYWN0dWFsQ29udGVudCA9IG51bGw7XG5sZXQgY3VycmVudE1vZGUgPSBNb2RlLkF1ZGlvO1xuZnVuY3Rpb24gc2V0Q29udGVudChjb250ZW50KSB7XG4gICAgaWYgKGNvbnRlbnQgPT09IGFjdHVhbENvbnRlbnQpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAoYWN0dWFsQ29udGVudClcbiAgICAgICAgYWN0dWFsQ29udGVudC5wYXJlbnRFbGVtZW50ICYmIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChhY3R1YWxDb250ZW50KTtcbiAgICBhY3R1YWxDb250ZW50ID0gY29udGVudDtcbiAgICBpZiAoYWN0dWFsQ29udGVudClcbiAgICAgICAgVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoY29udGVudCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xufVxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdWRpb1BhbmVsLnJvb3QpO1xuVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoc2VhcmNoUGFuZWwucm9vdCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xuQXV0aC5hdXRvUmVuZXdBdXRoKCk7XG4vKipcbiAqIFdhaXRlciB0b29sXG4gKi9cbmNvbnN0IGJlZ2luV2FpdCA9IChjYWxsYmFjaykgPT4ge1xuICAgIGxldCBpc0RvbmUgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGlzRG9uZSB8fCBjYWxsYmFjaygpLCA1MDApO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgICAgIGlzRG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbi8qKlxuICogRXZlbnRzXG4gKi9cbmZ1bmN0aW9uIGJlYXV0aWZ5TmFtZXMoaXRlbXMpIHtcbiAgICByZXR1cm4gaXRlbXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBpZiAoZmlsZS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICAgICAgbGV0IGRvdCA9IGZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICAgICAgaWYgKGRvdClcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUuc3Vic3RyaW5nKDAsIGRvdCk7XG4gICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvJ18nL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvJyAgJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1sgXSotWyBdKi9nLCAnIC0gJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBnb1NoYUluZm8oaXRlbSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYCMvaW5mby8ke2VuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShpdGVtKSl9YDtcbn1cbmZ1bmN0aW9uIGdvU2VhcmNoSXRlbXModGVybSkge1xuICAgIGNvbnN0IHVybCA9IGAjL3NlYXJjaC8ke3Rlcm19YDtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbn1cbmZ1bmN0aW9uIGdvTG9hZERpcmVjdG9yeShzaGEsIG5hbWUpIHtcbiAgICBjb25zdCB1cmwgPSBgIy9kaXJlY3Rvcmllcy8ke3NoYX0/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChsYXN0U2VhcmNoVGVybSA/IChsYXN0U2VhcmNoVGVybSArICcvJyArIG5hbWUpIDogbmFtZSl9YDtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbn1cbmZ1bmN0aW9uIGdvUmVmZXJlbmNlKG5hbWUpIHtcbiAgICBjb25zdCB1cmwgPSBgIy9yZWZzLyR7bmFtZX1gO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xufVxuZnVuY3Rpb24gZ29QbGF5bGlzdChuYW1lKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgIy9wbGF5bGlzdHMvJHtuYW1lfWA7XG59XG5hc3luYyBmdW5jdGlvbiBzZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuZGlzcGxheVRpdGxlKHNlYXJjaFBhbmVsLCBmYWxzZSk7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgU3RpbGwgc2VhcmNoaW5nICcke3Rlcm19JyAuLi5gLCAwKSk7XG4gICAgbGV0IG1pbWVUeXBlID0gJyUnO1xuICAgIHN3aXRjaCAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgY2FzZSBNb2RlLkF1ZGlvOlxuICAgICAgICAgICAgbWltZVR5cGUgPSAnYXVkaW8vJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNb2RlLkltYWdlOlxuICAgICAgICAgICAgbWltZVR5cGUgPSAnaW1hZ2UvJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IHJlcyA9IGF3YWl0IFJlc3Quc2VhcmNoKHRlcm0sIG1pbWVUeXBlKTtcbiAgICBpZiAoIXJlcykge1xuICAgICAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEVycm9yIG9jY3VycmVkLCByZXRyeSBwbGVhc2UuLi5gLCAtMSk7XG4gICAgfVxuICAgIC8vIGZpcnN0IGZpbGVzIHRoZW4gZGlyZWN0b3JpZXNcbiAgICByZXMuaXRlbXMgPSByZXMuaXRlbXNcbiAgICAgICAgLmZpbHRlcihpID0+IGkubWltZVR5cGUgIT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpXG4gICAgICAgIC5jb25jYXQocmVzLml0ZW1zLmZpbHRlcihpID0+IGkubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpKTtcbiAgICByZXMuaXRlbXMgPSBiZWF1dGlmeU5hbWVzKHJlcy5pdGVtcyk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gcmVzLml0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gdGVybTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIHN3aXRjaCAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgY2FzZSBNb2RlLkF1ZGlvOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogYFJlc3VsdHMgZm9yICcke3Rlcm19J2AsXG4gICAgICAgICAgICAgICAgaXRlbXM6IHJlcy5pdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNb2RlLkltYWdlOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0SW1hZ2VzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgdGVybTogdGVybSxcbiAgICAgICAgICAgICAgICBpdGVtczogcmVzLml0ZW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGxldCB0ZXJtID0gc2VhcmNoUGFuZWwudGVybS52YWx1ZTtcbiAgICBzZWFyY2hQYW5lbC50ZXJtLmJsdXIoKTtcbiAgICBnb1NlYXJjaEl0ZW1zKHRlcm0pO1xufSk7XG5mdW5jdGlvbiBnZXRNaW1lVHlwZShmKSB7XG4gICAgaWYgKGYuaXNEaXJlY3RvcnkpXG4gICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JztcbiAgICBsZXQgcG9zID0gZi5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIGxldCBleHRlbnNpb24gPSBmLm5hbWUuc3Vic3RyKHBvcyArIDEpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChleHRlbnNpb24gaW4gTWltZVR5cGVzLk1pbWVUeXBlcylcbiAgICAgICAgICAgIHJldHVybiBNaW1lVHlwZXMuTWltZVR5cGVzW2V4dGVuc2lvbl07XG4gICAgfVxuICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbn1cbmZ1bmN0aW9uIGRpcmVjdG9yeURlc2NyaXB0b3JUb0ZpbGVEZXNjcmlwdG9yKGQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaGE6IGQuY29udGVudFNoYSxcbiAgICAgICAgbmFtZTogZC5uYW1lLFxuICAgICAgICBtaW1lVHlwZTogZ2V0TWltZVR5cGUoZCksXG4gICAgICAgIGxhc3RXcml0ZTogZC5sYXN0V3JpdGUsXG4gICAgICAgIHNpemU6IGQuc2l6ZVxuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkRGlyZWN0b3J5KGl0ZW0pIHtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgaXRlbS5uYW1lKTtcbiAgICB9KTtcbiAgICBsZXQgZGlyZWN0b3J5RGVzY3JpcHRvciA9IGF3YWl0IFJlc3QuZ2V0RGlyZWN0b3J5RGVzY3JpcHRvcihpdGVtLnNoYSk7XG4gICAgbGV0IGl0ZW1zID0gZGlyZWN0b3J5RGVzY3JpcHRvci5maWxlcy5tYXAoZGlyZWN0b3J5RGVzY3JpcHRvclRvRmlsZURlc2NyaXB0b3IpO1xuICAgIGl0ZW1zID0gYmVhdXRpZnlOYW1lcyhpdGVtcyk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSBpdGVtLm5hbWU7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICBzd2l0Y2ggKGN1cnJlbnRNb2RlKSB7XG4gICAgICAgIGNhc2UgTW9kZS5BdWRpbzpcbiAgICAgICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldFZhbHVlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTW9kZS5JbWFnZTpcbiAgICAgICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldEltYWdlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICAgICAgICAgIHRlcm06IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFJlZmVyZW5jZXMoKSB7XG4gICAgbGV0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBcIlJlZmVyZW5jZXNcIik7XG4gICAgfSk7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSBhd2FpdCBSZXN0LmdldFJlZmVyZW5jZXMoKTtcbiAgICBsZXQgaXRlbXMgPSByZWZlcmVuY2VzLm1hcChyZWZlcmVuY2UgPT4gKHtcbiAgICAgICAgbmFtZTogcmVmZXJlbmNlLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vcmVmZXJlbmNlJyxcbiAgICAgICAgc2hhOiByZWZlcmVuY2UsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KSk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSAnJztcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldFZhbHVlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICBuYW1lOiBcIlJlZmVyZW5jZXNcIixcbiAgICAgICAgaXRlbXNcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdHMoKSB7XG4gICAgbGV0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBcIlBsYXlsaXN0c1wiKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlcygpO1xuICAgIGxldCB1c2VyID0gYXdhaXQgQXV0aC5tZSgpO1xuICAgIGNvbnN0IHByZWZpeCA9IGBQTFVHSU4tUExBWUxJU1RTLSR7dXNlci51dWlkLnRvVXBwZXJDYXNlKCl9LWA7XG4gICAgbGV0IGl0ZW1zID0gcmVmZXJlbmNlc1xuICAgICAgICAuZmlsdGVyKHJlZmVyZW5jZSA9PiByZWZlcmVuY2UudG9VcHBlckNhc2UoKS5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgIC5tYXAocmVmZXJlbmNlID0+IHJlZmVyZW5jZS5zdWJzdHIocHJlZml4Lmxlbmd0aCkpXG4gICAgICAgIC5tYXAocmVmZXJlbmNlID0+IHJlZmVyZW5jZS5zdWJzdHIoMCwgMSkudG9VcHBlckNhc2UoKSArIHJlZmVyZW5jZS5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgLm1hcChyZWZlcmVuY2UgPT4gKHtcbiAgICAgICAgbmFtZTogcmVmZXJlbmNlLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vcGxheWxpc3QnLFxuICAgICAgICBzaGE6IHJlZmVyZW5jZSxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9ICcnO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgIG5hbWU6IFwiUGxheWxpc3RzXCIsXG4gICAgICAgIGl0ZW1zXG4gICAgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUGxheWxpc3QobmFtZSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBgUGxheWxpc3QgJyR7bmFtZX0nYCk7XG4gICAgfSk7XG4gICAgbGV0IHVzZXIgPSBhd2FpdCBBdXRoLm1lKCk7XG4gICAgbGV0IHJlZmVyZW5jZSA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlKGBQTFVHSU4tUExBWUxJU1RTLSR7dXNlci51dWlkLnRvVXBwZXJDYXNlKCl9LSR7bmFtZS50b1VwcGVyQ2FzZSgpfWApO1xuICAgIGxldCBjb21taXQgPSBhd2FpdCBSZXN0LmdldENvbW1pdChyZWZlcmVuY2UuY3VycmVudENvbW1pdFNoYSk7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgYXdhaXQgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgIHNoYTogY29tbWl0LmRpcmVjdG9yeURlc2NyaXB0b3JTaGEsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JyxcbiAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICBzaXplOiAwXG4gICAgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUmVmZXJlbmNlKG5hbWUpIHtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgYFJlZmVyZW5jZSAnJHtuYW1lfSdgKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2UobmFtZSk7XG4gICAgbGV0IGNvbW1pdCA9IGF3YWl0IFJlc3QuZ2V0Q29tbWl0KHJlZmVyZW5jZS5jdXJyZW50Q29tbWl0U2hhKTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBhd2FpdCBsb2FkRGlyZWN0b3J5KHtcbiAgICAgICAgc2hhOiBjb21taXQuZGlyZWN0b3J5RGVzY3JpcHRvclNoYSxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGl0ZW1EZWZhdWx0QWN0aW9uKGNoaWxkSW5kZXgsIGV2ZW50KSB7XG4gICAgbGV0IGl0ZW0gPSBsYXN0RGlzcGxheWVkRmlsZXNbY2hpbGRJbmRleF07XG4gICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3gtaW5mby1kaXNwbGF5LWFjdGlvbicpKSB7XG4gICAgICAgIGdvU2hhSW5mbyhpdGVtKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygneC1pbWFnZS16b29tLWFjdGlvbicpKSB7XG4gICAgICAgIEltYWdlRGV0YWlscy5zaG93KGl0ZW0sIG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSB7XG4gICAgICAgIGdvTG9hZERpcmVjdG9yeShpdGVtLnNoYSwgaXRlbS5uYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcmVmZXJlbmNlJykge1xuICAgICAgICBnb1JlZmVyZW5jZShpdGVtLnNoYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3BsYXlsaXN0Jykge1xuICAgICAgICBnb1BsYXlsaXN0KGl0ZW0uc2hhKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICBhdWRpb0p1a2Vib3guYWRkQW5kUGxheShpdGVtKTtcbiAgICAgICAgLy8gc2V0IGFuIHVucm9sbGVyXG4gICAgICAgIGlmIChjaGlsZEluZGV4ID49IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRlcm0gPSBsYXN0U2VhcmNoVGVybTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxlZEl0ZW1zID0gbGFzdERpc3BsYXllZEZpbGVzLnNsaWNlKGNoaWxkSW5kZXggKyAxKS5maWx0ZXIoZiA9PiBmLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAodW5yb2xsZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRoZW4gJyR7dW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleF0ubmFtZS5zdWJzdHIoMCwgMjApfScgYW5kICR7dW5yb2xsZWRJdGVtcy5sZW5ndGggLSB1bnJvbGxJbmRleCAtIDF9IG90aGVyICcke3Rlcm19JyBpdGVtcy4uLmA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGZpbmlzaGVkICcke3Rlcm19IHNvbmdzYDtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiB1bnJvbGxlZEl0ZW1zW3Vucm9sbEluZGV4KytdLFxuICAgICAgICAgICAgICAgICAgICBoYXNOZXh0OiAoKSA9PiB1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNob3dTbGlkZXNob3coKSB7XG4gICAgaWYgKCFzbGlkZXNob3cpXG4gICAgICAgIHNsaWRlc2hvdyA9IFNsaWRlc2hvdy5jcmVhdGUoKTtcbiAgICBzZXRDb250ZW50KHNsaWRlc2hvdy5yb290KTtcbn1cbmZ1bmN0aW9uIHNob3dJbmZvKGl0ZW0pIHtcbiAgICBJbmZvUGFuZWwuc2hvdyhpdGVtKTtcbn1cbmRpcmVjdG9yeVBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIGRpcmVjdG9yeVBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihkaXJlY3RvcnlQYW5lbCwgZXZlbnQpO1xuICAgIGlmIChsYXN0RGlzcGxheWVkRmlsZXMgJiYgZWxlbWVudCA9PSBkaXJlY3RvcnlQYW5lbC5pdGVtcyAmJiBjaGlsZEluZGV4ID49IDAgJiYgY2hpbGRJbmRleCA8IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCwgZXZlbnQpO1xuICAgIH1cbn0pO1xuc2VhcmNoUGFuZWwuYXVkaW9Nb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGlmIChjdXJyZW50TW9kZSA9PSBNb2RlLkF1ZGlvKSB7XG4gICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBBdWRpbyBtb2RlIGFscmVhZHkgYWN0aXZhdGVkYCwgMCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEF1ZGlvIG1vZGUgYWN0aXZhdGVkYCwgMCk7XG4gICAgY3VycmVudE1vZGUgPSBNb2RlLkF1ZGlvO1xuICAgIHJlYWRIYXNoQW5kQWN0KCk7XG59KTtcbnNlYXJjaFBhbmVsLmltYWdlTW9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoY3VycmVudE1vZGUgPT0gTW9kZS5JbWFnZSkge1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgSW1hZ2UgbW9kZSBhbHJlYWR5IGFjdGl2YXRlZGAsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBJbWFnZSBtb2RlIGFjdGl2YXRlZGAsIDApO1xuICAgIGN1cnJlbnRNb2RlID0gTW9kZS5JbWFnZTtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xufSk7XG5yZWFkSGFzaEFuZEFjdCgpO1xud2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xuICAgIC8qaWYgKGV2ZW50LnN0YXRlKSB7XG4gICAgICAgIGN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhID0gZXZlbnQuc3RhdGUuY3VycmVudERpcmVjdG9yeURlc2NyaXB0b3JTaGFcbiAgICAgICAgY3VycmVudENsaWVudElkID0gZXZlbnQuc3RhdGUuY3VycmVudENsaWVudElkXG4gICAgICAgIGN1cnJlbnRQaWN0dXJlSW5kZXggPSBldmVudC5zdGF0ZS5jdXJyZW50UGljdHVyZUluZGV4IHx8IDBcbiBcbiAgICAgICAgaWYgKCFjdXJyZW50Q2xpZW50SWQpXG4gICAgICAgICAgICBlbChcIiNtZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRkZW5cIilcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZyb21IYXNoKClcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9Ki9cbn07XG5BdXRoLm1lKCkudGhlbih1c2VyID0+IFVpVG9vbC5lbCgndXNlci1pZCcpLmlubmVyVGV4dCA9IHVzZXIudXVpZCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IEtCID0gMTAyNDtcbmNvbnN0IE1CID0gMTAyNCAqIEtCO1xuY29uc3QgR0IgPSAxMDI0ICogTUI7XG5jb25zdCBUQiA9IDEwMjQgKiBHQjtcbmZ1bmN0aW9uIGZyaWVuZGx5U2l6ZShzaXplKSB7XG4gICAgaWYgKHNpemUgPiAyICogVEIpXG4gICAgICAgIHJldHVybiBgJHsoc2l6ZSAvIFRCKS50b0ZpeGVkKDEpfSBUQmIgKCR7c2l6ZX0gYnl0ZXMpYDtcbiAgICBpZiAoc2l6ZSA+IDIgKiBHQilcbiAgICAgICAgcmV0dXJuIGAkeyhzaXplIC8gR0IpLnRvRml4ZWQoMSl9IEdiICgke3NpemV9IGJ5dGVzKWA7XG4gICAgaWYgKHNpemUgPiAyICogTUIpXG4gICAgICAgIHJldHVybiBgJHsoc2l6ZSAvIE1CKS50b0ZpeGVkKDEpfSBNYiAoJHtzaXplfSBieXRlcylgO1xuICAgIGlmIChzaXplID4gMiAqIEtCKVxuICAgICAgICByZXR1cm4gYCR7KHNpemUgLyBLQikudG9GaXhlZCgxKX0ga2IgKCR7c2l6ZX0gYnl0ZXMpYDtcbiAgICBpZiAoc2l6ZSA+IDEpXG4gICAgICAgIHJldHVybiBgJHtzaXplfSBieXRlc2A7XG4gICAgaWYgKHNpemUgPT0gMSlcbiAgICAgICAgcmV0dXJuIGAxIGJ5dGVgO1xuICAgIHJldHVybiBgZW1wdHlgO1xufVxubGV0IGlzU2hvd24gPSBmYWxzZTtcbmNvbnN0IHRlbXBsYXRlID0gYFxuPGRpdiBjbGFzcz1cIm11aS1jb250YWluZXJcIj5cbiAgICA8ZGl2IGNsYXNzPSdtdWktcGFuZWwnPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJ0aXRsZVwiIGNsYXNzPVwibXVpLS10ZXh0LXRpdGxlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2PnNoYTogPHNwYW4geC1pZD0nc2hhJz48L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXY+c2l6ZTogPHNwYW4geC1pZD0nc2l6ZSc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2Pm1pbWUgdHlwZTogPHNwYW4geC1pZD0nbWltZVR5cGUnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXY+PGEgeC1pZD1cImRvd25sb2FkXCIgaHJlZj1cIiNcIj5kb3dubG9hZCBsaW5rPC9hPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiB4LWlkPVwiZXh0cmFzXCI+PC9kaXY+XG5cbiAgICAgICAgPGRpdj5uYW1lczogPHNwYW4geC1pZD0nbmFtZXMnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdj53cml0ZSBkYXRlczogPHNwYW4geC1pZD0nd3JpdGVEYXRlcyc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2PnBhcmVudHM6IDxkaXYgeC1pZD0ncGFyZW50cyc+PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXY+c291cmNlczogPGRpdiB4LWlkPSdzb3VyY2VzJz48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdj5leGlmOiA8ZGl2IHgtaWQ9XCJleGlmXCI+PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2IHgtaWQ9XCJjbG9zZVwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0IG11aS1idG4tLXByaW1hcnlcIj5DbG9zZTwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlKTtcbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgJ2tleWJvYXJkJzogZmFsc2UsXG4gICAgJ3N0YXRpYyc6IHRydWUsXG4gICAgJ29uY2xvc2UnOiBmdW5jdGlvbiAoKSB7IH1cbn07XG5jb250ZW50LmNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGhpc3RvcnkuYmFjaygpO1xufSk7XG5mdW5jdGlvbiBoaWRlKCkge1xuICAgIGlmICghaXNTaG93bilcbiAgICAgICAgcmV0dXJuO1xuICAgIGlzU2hvd24gPSBmYWxzZTtcbiAgICBtdWkub3ZlcmxheSgnb2ZmJyk7XG59XG5leHBvcnRzLmhpZGUgPSBoaWRlO1xuZnVuY3Rpb24gc2hvdyhpdGVtKSB7XG4gICAgY29udGVudC50aXRsZS5pbm5lclRleHQgPSBgJHtpdGVtLm5hbWV9IGRldGFpbHNgO1xuICAgIGNvbnRlbnQuc2hhLmlubmVyVGV4dCA9IGl0ZW0uc2hhO1xuICAgIGNvbnRlbnQubWltZVR5cGUuaW5uZXJUZXh0ID0gaXRlbS5taW1lVHlwZTtcbiAgICBjb250ZW50LnNpemUuaW5uZXJUZXh0ID0gZnJpZW5kbHlTaXplKGl0ZW0uc2l6ZSk7XG4gICAgY29udGVudC5kb3dubG9hZC5ocmVmID0gUmVzdC5nZXRTaGFDb250ZW50VXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlLCBpdGVtLm5hbWUsIHRydWUsIHRydWUpO1xuICAgIGlmIChpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XG4gICAgICAgIGNvbnRlbnQuZXh0cmFzLmlubmVySFRNTCA9IGA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtSZXN0LmdldFNoYUNvbnRlbnRVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGl0ZW0ubmFtZSwgdHJ1ZSwgZmFsc2UpfVwiPjxpbWcgc3JjPVwiJHtSZXN0LmdldFNoYUltYWdlVGh1bWJuYWlsVXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKX1cIi8+PC9hPjxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PmA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb250ZW50LmV4dHJhcy5pbm5lckhUTUwgPSAnJztcbiAgICB9XG4gICAgaWYgKCFpc1Nob3duKVxuICAgICAgICBtdWkub3ZlcmxheSgnb24nLCBvcHRpb25zLCBjb250ZW50LnJvb3QpO1xuICAgIGlzU2hvd24gPSB0cnVlO1xuICAgIGNvbnN0IGxvYWRJbmZvID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgUmVzdC5nZXRTaGFJbmZvKGl0ZW0uc2hhKTtcbiAgICAgICAgaWYgKCFpbmZvKSB7XG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQ2Fubm90IGxvYWQgZGV0YWlsZWQgaW5mb3JtYXRpb24uLi5gLCAtMSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudC5taW1lVHlwZS5pbm5lclRleHQgPSBpbmZvLm1pbWVUeXBlcy5qb2luKCcsICcpO1xuICAgICAgICBjb250ZW50Lm5hbWVzLmlubmVyVGV4dCA9IGluZm8ubmFtZXMuam9pbignLCAnKTtcbiAgICAgICAgY29udGVudC53cml0ZURhdGVzLmlubmVyVGV4dCA9IGluZm8ud3JpdGVEYXRlcy5tYXAoZCA9PiBuZXcgRGF0ZShkIC8gMTAwMCkudG9EYXRlU3RyaW5nKCkpLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnRlbnQuc2l6ZS5pbm5lclRleHQgPSBpbmZvLnNpemVzLm1hcChmcmllbmRseVNpemUpLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnRlbnQucGFyZW50cy5pbm5lckhUTUwgPSBpbmZvLnBhcmVudHMubWFwKHAgPT4gYDxkaXY+PGEgaHJlZj1cIiMvZGlyZWN0b3JpZXMvJHtwfT9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGAke2l0ZW0ubmFtZX0ncyBwYXJlbnRzYCl9XCI+JHtwfTwvYT48L2Rpdj5gKS5qb2luKCcnKTtcbiAgICAgICAgY29udGVudC5zb3VyY2VzLmlubmVySFRNTCA9IGluZm8uc291cmNlcy5tYXAocyA9PiBgPGRpdj48YSBocmVmPVwiIy9yZWZzLyR7c31cIj4ke3N9PC9hPjwvZGl2PmApLmpvaW4oJycpO1xuICAgICAgICBpZiAoaW5mby5leGlmcyAmJiBpbmZvLmV4aWZzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGVudC5leGlmLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJtdWktdGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPlByb3BlcnR5PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5WYWx1ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAke2luZm8uZXhpZnMubWFwKGV4aWYgPT4gT2JqZWN0LmVudHJpZXMoZXhpZikubWFwKChba2V5LCB2YWx1ZV0pID0+IGA8dHI+PHRkPiR7a2V5fTwvdGQ+PHRkPiR7dmFsdWV9PC90ZD48L3RyPmApLmpvaW4oJycpKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50LmV4aWYuaW5uZXJIVE1MID0gYG5vIGV4aWYgZGF0YWA7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGxvYWRJbmZvKCk7XG59XG5leHBvcnRzLnNob3cgPSBzaG93O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5mby1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xubGV0IG1lc3NhZ2VzID0gW107XG5jb25zdCBwb3B1cFRlbXBsYXRlID0gYFxuICAgIDxkaXYgeC1pZD1cIm1lc3NhZ2VzXCI+XG4gICAgPC9kaXY+YDtcbmxldCBwb3B1cCA9IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UocG9wdXBUZW1wbGF0ZSk7XG5mdW5jdGlvbiByZWZyZXNoKCkge1xuICAgIHBvcHVwLm1lc3NhZ2VzLmlubmVySFRNTCA9IG1lc3NhZ2VzLm1hcChtZXNzYWdlID0+IHtcbiAgICAgICAgbGV0IHN0eWxlID0gJyc7XG4gICAgICAgIGlmIChtZXNzYWdlLmZlZWxpbmcgPiAwKVxuICAgICAgICAgICAgc3R5bGUgPSBgYmFja2dyb3VuZC1jb2xvcjogIzcwY2E4NTsgY29sb3I6IHdoaXRlO2A7XG4gICAgICAgIGVsc2UgaWYgKG1lc3NhZ2UuZmVlbGluZyA8IDApXG4gICAgICAgICAgICBzdHlsZSA9IGBiYWNrZ3JvdW5kLWNvbG9yOiAjRjQ0MzM2OyBjb2xvcjogd2hpdGU7YDtcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwibXVpLXBhbmVsIHgtbWVzc2FnZS1wYW5lbFwiIHN0eWxlPVwiJHtzdHlsZX1cIj4ke21lc3NhZ2UuaHRtbH08L2Rpdj5gO1xuICAgIH0pLmpvaW4oJycpO1xufVxuZnVuY3Rpb24gZGlzcGxheU1lc3NhZ2UoaHRtbCwgZmVlbGluZykge1xuICAgIG1lc3NhZ2VzLnB1c2goe1xuICAgICAgICBodG1sLFxuICAgICAgICBmZWVsaW5nXG4gICAgfSk7XG4gICAgcmVmcmVzaCgpO1xuICAgIGlmICghcG9wdXAucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwb3B1cC5yb290KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbWVzc2FnZXMuc2hpZnQoKTtcbiAgICAgICAgcmVmcmVzaCgpO1xuICAgICAgICBpZiAoIW1lc3NhZ2VzLmxlbmd0aClcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocG9wdXAucm9vdCk7XG4gICAgfSwgNDAwMCk7XG59XG5leHBvcnRzLmRpc3BsYXlNZXNzYWdlID0gZGlzcGxheU1lc3NhZ2U7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tZXNzYWdlcy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGV4dGVuc2lvbkZyb21NaW1lVHlwZShtaW1lVHlwZSkge1xuICAgIGZvciAobGV0IFtleHRlbnNpb24sIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzLk1pbWVUeXBlcykpIHtcbiAgICAgICAgaWYgKG1pbWVUeXBlID09IHZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIGV4dGVuc2lvbjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5leHBvcnRzLmV4dGVuc2lvbkZyb21NaW1lVHlwZSA9IGV4dGVuc2lvbkZyb21NaW1lVHlwZTtcbmV4cG9ydHMuTWltZVR5cGVzID0ge1xuICAgIFwiM2RtbFwiOiBcInRleHQvdm5kLmluM2QuM2RtbFwiLFxuICAgIFwiM2RzXCI6IFwiaW1hZ2UveC0zZHNcIixcbiAgICBcIjNnMlwiOiBcInZpZGVvLzNncHAyXCIsXG4gICAgXCIzZ3BcIjogXCJ2aWRlby8zZ3BwXCIsXG4gICAgXCI3elwiOiBcImFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFwiLFxuICAgIFwiYWFiXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwiYWFjXCI6IFwiYXVkaW8veC1hYWNcIixcbiAgICBcImFhbVwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1tYXBcIixcbiAgICBcImFhc1wiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1zZWdcIixcbiAgICBcImFid1wiOiBcImFwcGxpY2F0aW9uL3gtYWJpd29yZFwiLFxuICAgIFwiYWNcIjogXCJhcHBsaWNhdGlvbi9wa2l4LWF0dHItY2VydFwiLFxuICAgIFwiYWNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmFtZXJpY2FuZHluYW1pY3MuYWNjXCIsXG4gICAgXCJhY2VcIjogXCJhcHBsaWNhdGlvbi94LWFjZS1jb21wcmVzc2VkXCIsXG4gICAgXCJhY3VcIjogXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ib2xcIixcbiAgICBcImFjdXRjXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvcnBcIixcbiAgICBcImFkcFwiOiBcImF1ZGlvL2FkcGNtXCIsXG4gICAgXCJhZXBcIjogXCJhcHBsaWNhdGlvbi92bmQuYXVkaW9ncmFwaFwiLFxuICAgIFwiYWZtXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJhZnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFwiLFxuICAgIFwiYWhlYWRcIjogXCJhcHBsaWNhdGlvbi92bmQuYWhlYWQuc3BhY2VcIixcbiAgICBcImFpXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwiYWlmXCI6IFwiYXVkaW8veC1haWZmXCIsXG4gICAgXCJhaWZjXCI6IFwiYXVkaW8veC1haWZmXCIsXG4gICAgXCJhaWZmXCI6IFwiYXVkaW8veC1haWZmXCIsXG4gICAgXCJhaXJcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuYWlyLWFwcGxpY2F0aW9uLWluc3RhbGxlci1wYWNrYWdlK3ppcFwiLFxuICAgIFwiYWl0XCI6IFwiYXBwbGljYXRpb24vdm5kLmR2Yi5haXRcIixcbiAgICBcImFtaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWlnYS5hbWlcIixcbiAgICBcImFwZVwiOiBcImF1ZGlvL2FwZVwiLFxuICAgIFwiYXBrXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuZHJvaWQucGFja2FnZS1hcmNoaXZlXCIsXG4gICAgXCJhcHBjYWNoZVwiOiBcInRleHQvY2FjaGUtbWFuaWZlc3RcIixcbiAgICBcImFwcGxpY2F0aW9uXCI6IFwiYXBwbGljYXRpb24veC1tcy1hcHBsaWNhdGlvblwiLFxuICAgIFwiYXByXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLWFwcHJvYWNoXCIsXG4gICAgXCJhcmNcIjogXCJhcHBsaWNhdGlvbi94LWZyZWVhcmNcIixcbiAgICBcImFzYVwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzYXhcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImFzY1wiOiBcImFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcIixcbiAgICBcImFzY3hcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc2ZcIjogXCJ2aWRlby94LW1zLWFzZlwiLFxuICAgIFwiYXNoeFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzbVwiOiBcInRleHQveC1hc21cIixcbiAgICBcImFzbXhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc29cIjogXCJhcHBsaWNhdGlvbi92bmQuYWNjcGFjLnNpbXBseS5hc29cIixcbiAgICBcImFzcFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzcHhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc3hcIjogXCJ2aWRlby94LW1zLWFzZlwiLFxuICAgIFwiYXRjXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvcnBcIixcbiAgICBcImF0b21cIjogXCJhcHBsaWNhdGlvbi9hdG9tK3htbFwiLFxuICAgIFwiYXRvbWNhdFwiOiBcImFwcGxpY2F0aW9uL2F0b21jYXQreG1sXCIsXG4gICAgXCJhdG9tc3ZjXCI6IFwiYXBwbGljYXRpb24vYXRvbXN2Yyt4bWxcIixcbiAgICBcImF0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbnRpeC5nYW1lLWNvbXBvbmVudFwiLFxuICAgIFwiYXVcIjogXCJhdWRpby9iYXNpY1wiLFxuICAgIFwiYXZpXCI6IFwidmlkZW8veC1tc3ZpZGVvXCIsXG4gICAgXCJhd1wiOiBcImFwcGxpY2F0aW9uL2FwcGxpeHdhcmVcIixcbiAgICBcImF4ZFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImF6ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5hemZcIixcbiAgICBcImF6c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5haXJ6aXAuZmlsZXNlY3VyZS5henNcIixcbiAgICBcImF6d1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWF6b24uZWJvb2tcIixcbiAgICBcImJhdFwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiYmNwaW9cIjogXCJhcHBsaWNhdGlvbi94LWJjcGlvXCIsXG4gICAgXCJiZGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtYmRmXCIsXG4gICAgXCJiZG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3dieG1sXCIsXG4gICAgXCJiZWRcIjogXCJhcHBsaWNhdGlvbi92bmQucmVhbHZuYy5iZWRcIixcbiAgICBcImJoMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzcHJzXCIsXG4gICAgXCJiaW5cIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImJsYlwiOiBcImFwcGxpY2F0aW9uL3gtYmxvcmJcIixcbiAgICBcImJsb3JiXCI6IFwiYXBwbGljYXRpb24veC1ibG9yYlwiLFxuICAgIFwiYm1pXCI6IFwiYXBwbGljYXRpb24vdm5kLmJtaVwiLFxuICAgIFwiYm1wXCI6IFwiaW1hZ2UvYm1wXCIsXG4gICAgXCJib29rXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImJveFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wcmV2aWV3c3lzdGVtcy5ib3hcIixcbiAgICBcImJvelwiOiBcImFwcGxpY2F0aW9uL3gtYnppcDJcIixcbiAgICBcImJwa1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiYnRpZlwiOiBcImltYWdlL3Bycy5idGlmXCIsXG4gICAgXCJielwiOiBcImFwcGxpY2F0aW9uL3gtYnppcFwiLFxuICAgIFwiYnoyXCI6IFwiYXBwbGljYXRpb24veC1iemlwMlwiLFxuICAgIFwiY1wiOiBcInRleHQveC1jXCIsXG4gICAgXCJjMTFhbWNcIjogXCJhcHBsaWNhdGlvbi92bmQuY2x1ZXRydXN0LmNhcnRvbW9iaWxlLWNvbmZpZ1wiLFxuICAgIFwiYzExYW16XCI6IFwiYXBwbGljYXRpb24vdm5kLmNsdWV0cnVzdC5jYXJ0b21vYmlsZS1jb25maWctcGtnXCIsXG4gICAgXCJjNGRcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNHBcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzR1XCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImNhYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1jYWItY29tcHJlc3NlZFwiLFxuICAgIFwiY2FmXCI6IFwiYXVkaW8veC1jYWZcIixcbiAgICBcImNhcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIixcbiAgICBcImNhclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXJsLmNhclwiLFxuICAgIFwiY2F0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBraS5zZWNjYXRcIixcbiAgICBcImNiN1wiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYmFcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2JyXCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNidFwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnpcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2NcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiY2N0XCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiY2N4bWxcIjogXCJhcHBsaWNhdGlvbi9jY3htbCt4bWxcIixcbiAgICBcImNkYmNtc2dcIjogXCJhcHBsaWNhdGlvbi92bmQuY29udGFjdC5jbXNnXCIsXG4gICAgXCJjZGZcIjogXCJhcHBsaWNhdGlvbi94LW5ldGNkZlwiLFxuICAgIFwiY2RrZXlcIjogXCJhcHBsaWNhdGlvbi92bmQubWVkaWFzdGF0aW9uLmNka2V5XCIsXG4gICAgXCJjZG1pYVwiOiBcImFwcGxpY2F0aW9uL2NkbWktY2FwYWJpbGl0eVwiLFxuICAgIFwiY2RtaWNcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWNvbnRhaW5lclwiLFxuICAgIFwiY2RtaWRcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWRvbWFpblwiLFxuICAgIFwiY2RtaW9cIjogXCJhcHBsaWNhdGlvbi9jZG1pLW9iamVjdFwiLFxuICAgIFwiY2RtaXFcIjogXCJhcHBsaWNhdGlvbi9jZG1pLXF1ZXVlXCIsXG4gICAgXCJjZHhcIjogXCJjaGVtaWNhbC94LWNkeFwiLFxuICAgIFwiY2R4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQuY2hlbWRyYXcreG1sXCIsXG4gICAgXCJjZHlcIjogXCJhcHBsaWNhdGlvbi92bmQuY2luZGVyZWxsYVwiLFxuICAgIFwiY2VyXCI6IFwiYXBwbGljYXRpb24vcGtpeC1jZXJ0XCIsXG4gICAgXCJjZmNcIjogXCJhcHBsaWNhdGlvbi94LWNvbGRmdXNpb25cIixcbiAgICBcImNmbVwiOiBcImFwcGxpY2F0aW9uL3gtY29sZGZ1c2lvblwiLFxuICAgIFwiY2ZzXCI6IFwiYXBwbGljYXRpb24veC1jZnMtY29tcHJlc3NlZFwiLFxuICAgIFwiY2dtXCI6IFwiaW1hZ2UvY2dtXCIsXG4gICAgXCJjaGF0XCI6IFwiYXBwbGljYXRpb24veC1jaGF0XCIsXG4gICAgXCJjaG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtaHRtbGhlbHBcIixcbiAgICBcImNocnRcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtjaGFydFwiLFxuICAgIFwiY2lmXCI6IFwiY2hlbWljYWwveC1jaWZcIixcbiAgICBcImNpaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbnNlci13ZWItY2VydGlmaWNhdGUtaXNzdWUtaW5pdGlhdGlvblwiLFxuICAgIFwiY2lsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWFydGdhbHJ5XCIsXG4gICAgXCJjbGFcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xheW1vcmVcIixcbiAgICBcImNsYXNzXCI6IFwiYXBwbGljYXRpb24vamF2YS12bVwiLFxuICAgIFwiY2xra1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLmtleWJvYXJkXCIsXG4gICAgXCJjbGtwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIucGFsZXR0ZVwiLFxuICAgIFwiY2xrdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLnRlbXBsYXRlXCIsXG4gICAgXCJjbGt3XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIud29yZGJhbmtcIixcbiAgICBcImNsa3hcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlclwiLFxuICAgIFwiY2xwXCI6IFwiYXBwbGljYXRpb24veC1tc2NsaXBcIixcbiAgICBcImNtY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jb3Ntb2NhbGxlclwiLFxuICAgIFwiY21kZlwiOiBcImNoZW1pY2FsL3gtY21kZlwiLFxuICAgIFwiY21sXCI6IFwiY2hlbWljYWwveC1jbWxcIixcbiAgICBcImNtcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55ZWxsb3dyaXZlci1jdXN0b20tbWVudVwiLFxuICAgIFwiY214XCI6IFwiaW1hZ2UveC1jbXhcIixcbiAgICBcImNvZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yaW0uY29kXCIsXG4gICAgXCJjb21cIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImNvbmZcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJjcGlvXCI6IFwiYXBwbGljYXRpb24veC1jcGlvXCIsXG4gICAgXCJjcHBcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiY3B0XCI6IFwiYXBwbGljYXRpb24vbWFjLWNvbXBhY3Rwcm9cIixcbiAgICBcImNyZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNjYXJkZmlsZVwiLFxuICAgIFwiY3JsXCI6IFwiYXBwbGljYXRpb24vcGtpeC1jcmxcIixcbiAgICBcImNydFwiOiBcImFwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0XCIsXG4gICAgXCJjcnhcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImNyeXB0b25vdGVcIjogXCJhcHBsaWNhdGlvbi92bmQucmlnLmNyeXB0b25vdGVcIixcbiAgICBcImNzXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiY3NoXCI6IFwiYXBwbGljYXRpb24veC1jc2hcIixcbiAgICBcImNzbWxcIjogXCJjaGVtaWNhbC94LWNzbWxcIixcbiAgICBcImNzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jb21tb25zcGFjZVwiLFxuICAgIFwiY3NzXCI6IFwidGV4dC9jc3NcIixcbiAgICBcImNzdFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImNzdlwiOiBcInRleHQvY3N2XCIsXG4gICAgXCJjdVwiOiBcImFwcGxpY2F0aW9uL2N1LXNlZW1lXCIsXG4gICAgXCJjdXJsXCI6IFwidGV4dC92bmQuY3VybFwiLFxuICAgIFwiY3d3XCI6IFwiYXBwbGljYXRpb24vcHJzLmN3d1wiLFxuICAgIFwiY3h0XCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiY3h4XCI6IFwidGV4dC94LWNcIixcbiAgICBcImRhZVwiOiBcIm1vZGVsL3ZuZC5jb2xsYWRhK3htbFwiLFxuICAgIFwiZGFmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5kYWZcIixcbiAgICBcImRhcnRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGFydFwiLFxuICAgIFwiZGF0YWxlc3NcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5zZWVkXCIsXG4gICAgXCJkYXZtb3VudFwiOiBcImFwcGxpY2F0aW9uL2Rhdm1vdW50K3htbFwiLFxuICAgIFwiZGJrXCI6IFwiYXBwbGljYXRpb24vZG9jYm9vayt4bWxcIixcbiAgICBcImRjclwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImRjdXJsXCI6IFwidGV4dC92bmQuY3VybC5kY3VybFwiLFxuICAgIFwiZGQyXCI6IFwiYXBwbGljYXRpb24vdm5kLm9tYS5kZDIreG1sXCIsXG4gICAgXCJkZGRcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRkZFwiLFxuICAgIFwiZGViXCI6IFwiYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVwiLFxuICAgIFwiZGVmXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiZGVwbG95XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkZXJcIjogXCJhcHBsaWNhdGlvbi94LXg1MDktY2EtY2VydFwiLFxuICAgIFwiZGZhY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcmVhbWZhY3RvcnlcIixcbiAgICBcImRnY1wiOiBcImFwcGxpY2F0aW9uL3gtZGdjLWNvbXByZXNzZWRcIixcbiAgICBcImRpY1wiOiBcInRleHQveC1jXCIsXG4gICAgXCJkaXJcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJkaXNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLmRpc1wiLFxuICAgIFwiZGlzdFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGlzdHpcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRqdlwiOiBcImltYWdlL3ZuZC5kanZ1XCIsXG4gICAgXCJkanZ1XCI6IFwiaW1hZ2Uvdm5kLmRqdnVcIixcbiAgICBcImRsbFwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiZG1nXCI6IFwiYXBwbGljYXRpb24veC1hcHBsZS1kaXNraW1hZ2VcIixcbiAgICBcImRtcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIixcbiAgICBcImRtc1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZG5hXCI6IFwiYXBwbGljYXRpb24vdm5kLmRuYVwiLFxuICAgIFwiZG9jXCI6IFwiYXBwbGljYXRpb24vbXN3b3JkXCIsXG4gICAgXCJkb2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmQuZG9jdW1lbnQubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJkb2N4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnRcIixcbiAgICBcImRvdFwiOiBcImFwcGxpY2F0aW9uL21zd29yZFwiLFxuICAgIFwiZG90bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwiZG90eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlXCIsXG4gICAgXCJkcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vc2dpLmRwXCIsXG4gICAgXCJkcGdcIjogXCJhcHBsaWNhdGlvbi92bmQuZHBncmFwaFwiLFxuICAgIFwiZHJhXCI6IFwiYXVkaW8vdm5kLmRyYVwiLFxuICAgIFwiZHNjXCI6IFwidGV4dC9wcnMubGluZXMudGFnXCIsXG4gICAgXCJkc3NjXCI6IFwiYXBwbGljYXRpb24vZHNzYytkZXJcIixcbiAgICBcImR0YlwiOiBcImFwcGxpY2F0aW9uL3gtZHRib29rK3htbFwiLFxuICAgIFwiZHRkXCI6IFwiYXBwbGljYXRpb24veG1sLWR0ZFwiLFxuICAgIFwiZHRzXCI6IFwiYXVkaW8vdm5kLmR0c1wiLFxuICAgIFwiZHRzaGRcIjogXCJhdWRpby92bmQuZHRzLmhkXCIsXG4gICAgXCJkdW1wXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkdmJcIjogXCJ2aWRlby92bmQuZHZiLmZpbGVcIixcbiAgICBcImR2aVwiOiBcImFwcGxpY2F0aW9uL3gtZHZpXCIsXG4gICAgXCJkd2ZcIjogXCJtb2RlbC92bmQuZHdmXCIsXG4gICAgXCJkd2dcIjogXCJpbWFnZS92bmQuZHdnXCIsXG4gICAgXCJkeGZcIjogXCJpbWFnZS92bmQuZHhmXCIsXG4gICAgXCJkeHBcIjogXCJhcHBsaWNhdGlvbi92bmQuc3BvdGZpcmUuZHhwXCIsXG4gICAgXCJkeHJcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJlY2VscDQ4MDBcIjogXCJhdWRpby92bmQubnVlcmEuZWNlbHA0ODAwXCIsXG4gICAgXCJlY2VscDc0NzBcIjogXCJhdWRpby92bmQubnVlcmEuZWNlbHA3NDcwXCIsXG4gICAgXCJlY2VscDk2MDBcIjogXCJhdWRpby92bmQubnVlcmEuZWNlbHA5NjAwXCIsXG4gICAgXCJlY21hXCI6IFwiYXBwbGljYXRpb24vZWNtYXNjcmlwdFwiLFxuICAgIFwiZWRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkbVwiLFxuICAgIFwiZWR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmVkeFwiLFxuICAgIFwiZWZpZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5waWNzZWxcIixcbiAgICBcImVpNlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wZy5vc2FzbGlcIixcbiAgICBcImVsY1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZW1mXCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJlbWxcIjogXCJtZXNzYWdlL3JmYzgyMlwiLFxuICAgIFwiZW1tYVwiOiBcImFwcGxpY2F0aW9uL2VtbWEreG1sXCIsXG4gICAgXCJlbXpcIjogXCJhcHBsaWNhdGlvbi94LW1zbWV0YWZpbGVcIixcbiAgICBcImVvbFwiOiBcImF1ZGlvL3ZuZC5kaWdpdGFsLXdpbmRzXCIsXG4gICAgXCJlb3RcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZm9udG9iamVjdFwiLFxuICAgIFwiZXBzXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwiZXB1YlwiOiBcImFwcGxpY2F0aW9uL2VwdWIremlwXCIsXG4gICAgXCJlczNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXN6aWdubzMreG1sXCIsXG4gICAgXCJlc2FcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnaS5zdWJzeXN0ZW1cIixcbiAgICBcImVzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5lc2ZcIixcbiAgICBcImV0M1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lc3ppZ25vMyt4bWxcIixcbiAgICBcImV0eFwiOiBcInRleHQveC1zZXRleHRcIixcbiAgICBcImV2YVwiOiBcImFwcGxpY2F0aW9uL3gtZXZhXCIsXG4gICAgXCJldnlcIjogXCJhcHBsaWNhdGlvbi94LWVudm95XCIsXG4gICAgXCJleGVcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImV4aVwiOiBcImFwcGxpY2F0aW9uL2V4aVwiLFxuICAgIFwiZXh0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5vdmFkaWdtLmV4dFwiLFxuICAgIFwiZXpcIjogXCJhcHBsaWNhdGlvbi9hbmRyZXctaW5zZXRcIixcbiAgICBcImV6MlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lenBpeC1hbGJ1bVwiLFxuICAgIFwiZXozXCI6IFwiYXBwbGljYXRpb24vdm5kLmV6cGl4LXBhY2thZ2VcIixcbiAgICBcImZcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZjR2XCI6IFwidmlkZW8veC1mNHZcIixcbiAgICBcImY3N1wiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmOTBcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZmJzXCI6IFwiaW1hZ2Uvdm5kLmZhc3RiaWRzaGVldFwiLFxuICAgIFwiZmNkdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5mb3Jtc2NlbnRyYWwuZmNkdFwiLFxuICAgIFwiZmNzXCI6IFwiYXBwbGljYXRpb24vdm5kLmlzYWMuZmNzXCIsXG4gICAgXCJmZGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRmXCIsXG4gICAgXCJmZV9sYXVuY2hcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVub3ZvLmZjc2VsYXlvdXQtbGlua1wiLFxuICAgIFwiZmc1XCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNncFwiLFxuICAgIFwiZmdkXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZmhcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaDRcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaDVcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaDdcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaGNcIjogXCJpbWFnZS94LWZyZWVoYW5kXCIsXG4gICAgXCJmaWdcIjogXCJhcHBsaWNhdGlvbi94LXhmaWdcIixcbiAgICBcImZsYWNcIjogXCJhdWRpby94LWZsYWNcIixcbiAgICBcImZsaVwiOiBcInZpZGVvL3gtZmxpXCIsXG4gICAgXCJmbG9cIjogXCJhcHBsaWNhdGlvbi92bmQubWljcm9ncmFmeC5mbG9cIixcbiAgICBcImZsdlwiOiBcInZpZGVvL3gtZmx2XCIsXG4gICAgXCJmbHdcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtpdmlvXCIsXG4gICAgXCJmbHhcIjogXCJ0ZXh0L3ZuZC5mbWkuZmxleHN0b3JcIixcbiAgICBcImZseVwiOiBcInRleHQvdm5kLmZseVwiLFxuICAgIFwiZm1cIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwiZm5jXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyb2dhbnMuZm5jXCIsXG4gICAgXCJmb3JcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZnB4XCI6IFwiaW1hZ2Uvdm5kLmZweFwiLFxuICAgIFwiZnJhbWVcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwiZnNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmZzYy53ZWJsYXVuY2hcIixcbiAgICBcImZzdFwiOiBcImltYWdlL3ZuZC5mc3RcIixcbiAgICBcImZ0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mbHV4dGltZS5jbGlwXCIsXG4gICAgXCJmdGlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWZ1bmRzLXRyYW5zZmVyLWluaXRpYXRpb25cIixcbiAgICBcImZ2dFwiOiBcInZpZGVvL3ZuZC5mdnRcIixcbiAgICBcImZ4cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5meHBcIixcbiAgICBcImZ4cGxcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZnhwXCIsXG4gICAgXCJmenNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnV6enlzaGVldFwiLFxuICAgIFwiZzJ3XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb3BsYW5cIixcbiAgICBcImczXCI6IFwiaW1hZ2UvZzNmYXhcIixcbiAgICBcImczd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9zcGFjZVwiLFxuICAgIFwiZ2FjXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1hY2NvdW50XCIsXG4gICAgXCJnYW1cIjogXCJhcHBsaWNhdGlvbi94LXRhZHNcIixcbiAgICBcImdiclwiOiBcImFwcGxpY2F0aW9uL3Jwa2ktZ2hvc3RidXN0ZXJzXCIsXG4gICAgXCJnY2FcIjogXCJhcHBsaWNhdGlvbi94LWdjYS1jb21wcmVzc2VkXCIsXG4gICAgXCJnZGxcIjogXCJtb2RlbC92bmQuZ2RsXCIsXG4gICAgXCJnZW9cIjogXCJhcHBsaWNhdGlvbi92bmQuZHluYWdlb1wiLFxuICAgIFwiZ2V4XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb21ldHJ5LWV4cGxvcmVyXCIsXG4gICAgXCJnZ2JcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEuZmlsZVwiLFxuICAgIFwiZ2d0XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLnRvb2xcIixcbiAgICBcImdoZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaGVscFwiLFxuICAgIFwiZ2lmXCI6IFwiaW1hZ2UvZ2lmXCIsXG4gICAgXCJnaW1cIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWlkZW50aXR5LW1lc3NhZ2VcIixcbiAgICBcImdtbFwiOiBcImFwcGxpY2F0aW9uL2dtbCt4bWxcIixcbiAgICBcImdteFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nbXhcIixcbiAgICBcImdudW1lcmljXCI6IFwiYXBwbGljYXRpb24veC1nbnVtZXJpY1wiLFxuICAgIFwiZ3BoXCI6IFwiYXBwbGljYXRpb24vdm5kLmZsb2dyYXBoaXRcIixcbiAgICBcImdweFwiOiBcImFwcGxpY2F0aW9uL2dweCt4bWxcIixcbiAgICBcImdxZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncmFmZXFcIixcbiAgICBcImdxc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncmFmZXFcIixcbiAgICBcImdyYW1cIjogXCJhcHBsaWNhdGlvbi9zcmdzXCIsXG4gICAgXCJncmFtcHNcIjogXCJhcHBsaWNhdGlvbi94LWdyYW1wcy14bWxcIixcbiAgICBcImdyZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclwiLFxuICAgIFwiZ3J2XCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pbmplY3RvclwiLFxuICAgIFwiZ3J4bWxcIjogXCJhcHBsaWNhdGlvbi9zcmdzK3htbFwiLFxuICAgIFwiZ3NmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWdob3N0c2NyaXB0XCIsXG4gICAgXCJndGFyXCI6IFwiYXBwbGljYXRpb24veC1ndGFyXCIsXG4gICAgXCJndG1cIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtbWVzc2FnZVwiLFxuICAgIFwiZ3R3XCI6IFwibW9kZWwvdm5kLmd0d1wiLFxuICAgIFwiZ3ZcIjogXCJ0ZXh0L3ZuZC5ncmFwaHZpelwiLFxuICAgIFwiZ3hmXCI6IFwiYXBwbGljYXRpb24vZ3hmXCIsXG4gICAgXCJneHRcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbmV4dFwiLFxuICAgIFwiZ3pcIjogXCJhcHBsaWNhdGlvbi94LWd6aXBcIixcbiAgICBcImhcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiaDI2MVwiOiBcInZpZGVvL2gyNjFcIixcbiAgICBcImgyNjNcIjogXCJ2aWRlby9oMjYzXCIsXG4gICAgXCJoMjY0XCI6IFwidmlkZW8vaDI2NFwiLFxuICAgIFwiaGFsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhhbCt4bWxcIixcbiAgICBcImhiY2lcIjogXCJhcHBsaWNhdGlvbi92bmQuaGJjaVwiLFxuICAgIFwiaGRmXCI6IFwiYXBwbGljYXRpb24veC1oZGZcIixcbiAgICBcImhoXCI6IFwidGV4dC94LWNcIixcbiAgICBcImhscFwiOiBcImFwcGxpY2F0aW9uL3dpbmhscFwiLFxuICAgIFwiaHBnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocGdsXCIsXG4gICAgXCJocGlkXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWhwaWRcIixcbiAgICBcImhwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocHNcIixcbiAgICBcImhxeFwiOiBcImFwcGxpY2F0aW9uL21hYy1iaW5oZXg0MFwiLFxuICAgIFwiaHRhXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJodGNcIjogXCJ0ZXh0L2h0bWxcIixcbiAgICBcImh0a2VcIjogXCJhcHBsaWNhdGlvbi92bmQua2VuYW1lYWFwcFwiLFxuICAgIFwiaHRtXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodG1sXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodmRcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LWRpY1wiLFxuICAgIFwiaHZwXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi12b2ljZVwiLFxuICAgIFwiaHZzXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi1zY3JpcHRcIixcbiAgICBcImkyZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnRlcmdlb1wiLFxuICAgIFwiaWNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcIixcbiAgICBcImljZVwiOiBcIngtY29uZmVyZW5jZS94LWNvb2x0YWxrXCIsXG4gICAgXCJpY21cIjogXCJhcHBsaWNhdGlvbi92bmQuaWNjcHJvZmlsZVwiLFxuICAgIFwiaWNvXCI6IFwiaW1hZ2UveC1pY29uXCIsXG4gICAgXCJpY3NcIjogXCJ0ZXh0L2NhbGVuZGFyXCIsXG4gICAgXCJpZWZcIjogXCJpbWFnZS9pZWZcIixcbiAgICBcImlmYlwiOiBcInRleHQvY2FsZW5kYXJcIixcbiAgICBcImlmbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtZGF0YVwiLFxuICAgIFwiaWdlc1wiOiBcIm1vZGVsL2lnZXNcIixcbiAgICBcImlnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pZ2xvYWRlclwiLFxuICAgIFwiaWdtXCI6IFwiYXBwbGljYXRpb24vdm5kLmluc29ycy5pZ21cIixcbiAgICBcImlnc1wiOiBcIm1vZGVsL2lnZXNcIixcbiAgICBcImlneFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5taWNyb2dyYWZ4LmlneFwiLFxuICAgIFwiaWlmXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmludGVyY2hhbmdlXCIsXG4gICAgXCJpbXBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWNjcGFjLnNpbXBseS5pbXBcIixcbiAgICBcImltc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1pbXNcIixcbiAgICBcImluXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiaW5pXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiaW5rXCI6IFwiYXBwbGljYXRpb24vaW5rbWwreG1sXCIsXG4gICAgXCJpbmttbFwiOiBcImFwcGxpY2F0aW9uL2lua21sK3htbFwiLFxuICAgIFwiaW5zdGFsbFwiOiBcImFwcGxpY2F0aW9uL3gtaW5zdGFsbC1pbnN0cnVjdGlvbnNcIixcbiAgICBcImlvdGFcIjogXCJhcHBsaWNhdGlvbi92bmQuYXN0cmFlYS1zb2Z0d2FyZS5pb3RhXCIsXG4gICAgXCJpcGFcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImlwZml4XCI6IFwiYXBwbGljYXRpb24vaXBmaXhcIixcbiAgICBcImlwa1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5wYWNrYWdlXCIsXG4gICAgXCJpcm1cIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLnJpZ2h0cy1tYW5hZ2VtZW50XCIsXG4gICAgXCJpcnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaXJlcG9zaXRvcnkucGFja2FnZSt4bWxcIixcbiAgICBcImlzb1wiOiBcImFwcGxpY2F0aW9uL3gtaXNvOTY2MC1pbWFnZVwiLFxuICAgIFwiaXRwXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm10ZW1wbGF0ZVwiLFxuICAgIFwiaXZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmltbWVydmlzaW9uLWl2cFwiLFxuICAgIFwiaXZ1XCI6IFwiYXBwbGljYXRpb24vdm5kLmltbWVydmlzaW9uLWl2dVwiLFxuICAgIFwiamFkXCI6IFwidGV4dC92bmQuc3VuLmoybWUuYXBwLWRlc2NyaXB0b3JcIixcbiAgICBcImphbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5qYW1cIixcbiAgICBcImphclwiOiBcImFwcGxpY2F0aW9uL2phdmEtYXJjaGl2ZVwiLFxuICAgIFwiamF2YVwiOiBcInRleHQveC1qYXZhLXNvdXJjZVwiLFxuICAgIFwiamlzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5qaXNwXCIsXG4gICAgXCJqbHRcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtamx5dFwiLFxuICAgIFwiam5scFwiOiBcImFwcGxpY2F0aW9uL3gtamF2YS1qbmxwLWZpbGVcIixcbiAgICBcImpvZGFcIjogXCJhcHBsaWNhdGlvbi92bmQuam9vc3Quam9kYS1hcmNoaXZlXCIsXG4gICAgXCJqcGVcIjogXCJpbWFnZS9qcGVnXCIsXG4gICAgXCJqcGVnXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBnXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBnbVwiOiBcInZpZGVvL2pwbVwiLFxuICAgIFwianBndlwiOiBcInZpZGVvL2pwZWdcIixcbiAgICBcImpwbVwiOiBcInZpZGVvL2pwbVwiLFxuICAgIFwianNcIjogXCJ0ZXh0L2phdmFzY3JpcHRcIixcbiAgICBcImpzb25cIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgXCJqc29ubWxcIjogXCJhcHBsaWNhdGlvbi9qc29ubWwranNvblwiLFxuICAgIFwia2FyXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwia2FyYm9uXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rYXJib25cIixcbiAgICBcImtmb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2Zvcm11bGFcIixcbiAgICBcImtpYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raWRzcGlyYXRpb25cIixcbiAgICBcImttbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua21sK3htbFwiLFxuICAgIFwia216XCI6IFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS1lYXJ0aC5rbXpcIixcbiAgICBcImtuZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raW5hclwiLFxuICAgIFwia25wXCI6IFwiYXBwbGljYXRpb24vdm5kLmtpbmFyXCIsXG4gICAgXCJrb25cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtvbnRvdXJcIixcbiAgICBcImtwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3ByZXNlbnRlclwiLFxuICAgIFwia3B0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rcHJlc2VudGVyXCIsXG4gICAgXCJrcHh4XCI6IFwiYXBwbGljYXRpb24vdm5kLmRzLWtleXBvaW50XCIsXG4gICAgXCJrc3BcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtzcHJlYWRcIixcbiAgICBcImt0clwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rYWhvb3R6XCIsXG4gICAgXCJrdHhcIjogXCJpbWFnZS9rdHhcIixcbiAgICBcImt0elwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rYWhvb3R6XCIsXG4gICAgXCJrd2RcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmt3b3JkXCIsXG4gICAgXCJrd3RcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmt3b3JkXCIsXG4gICAgXCJsYXN4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQubGFzLmxhcyt4bWxcIixcbiAgICBcImxhdGV4XCI6IFwiYXBwbGljYXRpb24veC1sYXRleFwiLFxuICAgIFwibGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLmxsYW1hZ3JhcGhpY3MubGlmZS1iYWxhbmNlLmRlc2t0b3BcIixcbiAgICBcImxiZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5leGNoYW5nZSt4bWxcIixcbiAgICBcImxlc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5oaGUubGVzc29uLXBsYXllclwiLFxuICAgIFwibGhhXCI6IFwiYXBwbGljYXRpb24veC1semgtY29tcHJlc3NlZFwiLFxuICAgIFwibGluazY2XCI6IFwiYXBwbGljYXRpb24vdm5kLnJvdXRlNjYubGluazY2K3htbFwiLFxuICAgIFwibGlzdFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImxpc3QzODIwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImxpc3RhZnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFwiLFxuICAgIFwibG5rXCI6IFwiYXBwbGljYXRpb24veC1tcy1zaG9ydGN1dFwiLFxuICAgIFwibG9nXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwibG9zdHhtbFwiOiBcImFwcGxpY2F0aW9uL2xvc3QreG1sXCIsXG4gICAgXCJscmZcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImxybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1scm1cIixcbiAgICBcImx0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcm9nYW5zLmx0ZlwiLFxuICAgIFwibHZwXCI6IFwiYXVkaW8vdm5kLmx1Y2VudC52b2ljZVwiLFxuICAgIFwibHdwXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLXdvcmRwcm9cIixcbiAgICBcImx6XCI6IFwiYXBwbGljYXRpb24veC1semlwXCIsXG4gICAgXCJsemhcIjogXCJhcHBsaWNhdGlvbi94LWx6aC1jb21wcmVzc2VkXCIsXG4gICAgXCJsem1hXCI6IFwiYXBwbGljYXRpb24veC1sem1hXCIsXG4gICAgXCJsem9cIjogXCJhcHBsaWNhdGlvbi94LWx6b3BcIixcbiAgICBcIm0xM1wiOiBcImFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcIixcbiAgICBcIm0xNFwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcIixcbiAgICBcIm0xdlwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm0yMVwiOiBcImFwcGxpY2F0aW9uL21wMjFcIixcbiAgICBcIm0yYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm0ydlwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm0zYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm0zdVwiOiBcImF1ZGlvL3gtbXBlZ3VybFwiLFxuICAgIFwibTN1OFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5tcGVndXJsXCIsXG4gICAgXCJtNGFcIjogXCJhdWRpby9tcDRcIixcbiAgICBcIm00dVwiOiBcInZpZGVvL3ZuZC5tcGVndXJsXCIsXG4gICAgXCJtNHZcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1hXCI6IFwiYXBwbGljYXRpb24vbWF0aGVtYXRpY2FcIixcbiAgICBcIm1hZHNcIjogXCJhcHBsaWNhdGlvbi9tYWRzK3htbFwiLFxuICAgIFwibWFnXCI6IFwiYXBwbGljYXRpb24vdm5kLmVjb3dpbi5jaGFydFwiLFxuICAgIFwibWFrZXJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwibWFuXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwibWFyXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJtYXRobWxcIjogXCJhcHBsaWNhdGlvbi9tYXRobWwreG1sXCIsXG4gICAgXCJtYlwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJtYmtcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1ia1wiLFxuICAgIFwibWJveFwiOiBcImFwcGxpY2F0aW9uL21ib3hcIixcbiAgICBcIm1jMVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZWRjYWxjZGF0YVwiLFxuICAgIFwibWNkXCI6IFwiYXBwbGljYXRpb24vdm5kLm1jZFwiLFxuICAgIFwibWN1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsLm1jdXJsXCIsXG4gICAgJ21kJzogJ3RleHQvcGxhaW4nLFxuICAgIFwibWRiXCI6IFwiYXBwbGljYXRpb24veC1tc2FjY2Vzc1wiLFxuICAgIFwibWRpXCI6IFwiaW1hZ2Uvdm5kLm1zLW1vZGlcIixcbiAgICBcIm1lXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwibWVzaFwiOiBcIm1vZGVsL21lc2hcIixcbiAgICBcIm1ldGE0XCI6IFwiYXBwbGljYXRpb24vbWV0YWxpbms0K3htbFwiLFxuICAgIFwibWV0YWxpbmtcIjogXCJhcHBsaWNhdGlvbi9tZXRhbGluayt4bWxcIixcbiAgICBcIm1ldHNcIjogXCJhcHBsaWNhdGlvbi9tZXRzK3htbFwiLFxuICAgIFwibWZtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1mbXBcIixcbiAgICBcIm1mdFwiOiBcImFwcGxpY2F0aW9uL3Jwa2ktbWFuaWZlc3RcIixcbiAgICBcIm1ncFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vc2dlby5tYXBndWlkZS5wYWNrYWdlXCIsXG4gICAgXCJtZ3pcIjogXCJhcHBsaWNhdGlvbi92bmQucHJvdGV1cy5tYWdhemluZVwiLFxuICAgIFwibWlkXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwibWlkaVwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcIm1pZVwiOiBcImFwcGxpY2F0aW9uL3gtbWllXCIsXG4gICAgXCJtaWZcIjogXCJhcHBsaWNhdGlvbi92bmQubWlmXCIsXG4gICAgXCJtaW1lXCI6IFwibWVzc2FnZS9yZmM4MjJcIixcbiAgICBcIm1qMlwiOiBcInZpZGVvL21qMlwiLFxuICAgIFwibWpwMlwiOiBcInZpZGVvL21qMlwiLFxuICAgIFwibWszZFwiOiBcInZpZGVvL3gtbWF0cm9za2FcIixcbiAgICBcIm1rYVwiOiBcImF1ZGlvL3gtbWF0cm9za2FcIixcbiAgICBcIm1rc1wiOiBcInZpZGVvL3gtbWF0cm9za2FcIixcbiAgICBcIm1rdlwiOiBcInZpZGVvL3gtbWF0cm9za2FcIixcbiAgICBcIm1scFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kb2xieS5tbHBcIixcbiAgICBcIm1tZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jaGlwbnV0cy5rYXJhb2tlLW1tZFwiLFxuICAgIFwibW1mXCI6IFwiYXBwbGljYXRpb24vdm5kLnNtYWZcIixcbiAgICBcIm1tclwiOiBcImltYWdlL3ZuZC5mdWppeGVyb3guZWRtaWNzLW1tclwiLFxuICAgIFwibW5nXCI6IFwidmlkZW8veC1tbmdcIixcbiAgICBcIm1ueVwiOiBcImFwcGxpY2F0aW9uL3gtbXNtb25leVwiLFxuICAgIFwibW9iaVwiOiBcImFwcGxpY2F0aW9uL3gtbW9iaXBvY2tldC1lYm9va1wiLFxuICAgIFwibW9kc1wiOiBcImFwcGxpY2F0aW9uL21vZHMreG1sXCIsXG4gICAgXCJtb3ZcIjogXCJ2aWRlby9xdWlja3RpbWVcIixcbiAgICBcIm1vdmllXCI6IFwidmlkZW8veC1zZ2ktbW92aWVcIixcbiAgICBcIm1wMlwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wMjFcIjogXCJhcHBsaWNhdGlvbi9tcDIxXCIsXG4gICAgXCJtcDJhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXAzXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwib3B1c1wiOiBcImF1ZGlvL29wdXNcIixcbiAgICBcIm1wNFwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibXA0YVwiOiBcImF1ZGlvL21wNFwiLFxuICAgIFwibXA0c1wiOiBcImFwcGxpY2F0aW9uL21wNFwiLFxuICAgIFwibXA0dlwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibXBjXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vcGh1bi5jZXJ0aWZpY2F0ZVwiLFxuICAgIFwibXBlXCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibXBlZ1wiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZ1wiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZzRcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wZ2FcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcGtnXCI6IFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLmluc3RhbGxlcit4bWxcIixcbiAgICBcIm1wbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ibHVlaWNlLm11bHRpcGFzc1wiLFxuICAgIFwibXBuXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vcGh1bi5hcHBsaWNhdGlvblwiLFxuICAgIFwibXBwXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXByb2plY3RcIixcbiAgICBcIm1wdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XCIsXG4gICAgXCJtcHlcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1pbmlwYXlcIixcbiAgICBcIm1xeVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXF5XCIsXG4gICAgXCJtcmNcIjogXCJhcHBsaWNhdGlvbi9tYXJjXCIsXG4gICAgXCJtcmN4XCI6IFwiYXBwbGljYXRpb24vbWFyY3htbCt4bWxcIixcbiAgICBcIm1zXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwibXNjbWxcIjogXCJhcHBsaWNhdGlvbi9tZWRpYXNlcnZlcmNvbnRyb2wreG1sXCIsXG4gICAgXCJtc2VlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLm1zZWVkXCIsXG4gICAgXCJtc2VxXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zZXFcIixcbiAgICBcIm1zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5tc2ZcIixcbiAgICBcIm1zaFwiOiBcIm1vZGVsL21lc2hcIixcbiAgICBcIm1zaVwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwibXNsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tc2xcIixcbiAgICBcIm1zdHlcIjogXCJhcHBsaWNhdGlvbi92bmQubXV2ZWUuc3R5bGVcIixcbiAgICAvL1wibXRzXCI6IFwibW9kZWwvdm5kLm10c1wiLFxuICAgIFwibXRzXCI6IFwidmlkZW8vbXRzXCIsXG4gICAgXCJtdXNcIjogXCJhcHBsaWNhdGlvbi92bmQubXVzaWNpYW5cIixcbiAgICBcIm11c2ljeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbCt4bWxcIixcbiAgICBcIm12YlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZWRpYXZpZXdcIixcbiAgICBcIm13ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZmVyXCIsXG4gICAgXCJteGZcIjogXCJhcHBsaWNhdGlvbi9teGZcIixcbiAgICBcIm14bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWNvcmRhcmUubXVzaWN4bWxcIixcbiAgICBcIm14bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcIm14c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC50cmlzY2FwZS5teHNcIixcbiAgICBcIm14dVwiOiBcInZpZGVvL3ZuZC5tcGVndXJsXCIsXG4gICAgXCJuLWdhZ2VcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwibjNcIjogXCJ0ZXh0L24zXCIsXG4gICAgXCJuYlwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJuYnBcIjogXCJhcHBsaWNhdGlvbi92bmQud29sZnJhbS5wbGF5ZXJcIixcbiAgICBcIm5jXCI6IFwiYXBwbGljYXRpb24veC1uZXRjZGZcIixcbiAgICBcIm5jeFwiOiBcImFwcGxpY2F0aW9uL3gtZHRibmN4K3htbFwiLFxuICAgIFwibmZvXCI6IFwidGV4dC94LW5mb1wiLFxuICAgIFwibmdkYXRcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEubi1nYWdlLmRhdGFcIixcbiAgICBcIm5pdGZcIjogXCJhcHBsaWNhdGlvbi92bmQubml0ZlwiLFxuICAgIFwibmx1XCI6IFwiYXBwbGljYXRpb24vdm5kLm5ldXJvbGFuZ3VhZ2Uubmx1XCIsXG4gICAgXCJubWxcIjogXCJhcHBsaWNhdGlvbi92bmQuZW5saXZlblwiLFxuICAgIFwibm5kXCI6IFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LWRpcmVjdG9yeVwiLFxuICAgIFwibm5zXCI6IFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LXNlYWxlclwiLFxuICAgIFwibm53XCI6IFwiYXBwbGljYXRpb24vdm5kLm5vYmxlbmV0LXdlYlwiLFxuICAgIFwibnB4XCI6IFwiaW1hZ2Uvdm5kLm5ldC1mcHhcIixcbiAgICBcIm5zY1wiOiBcImFwcGxpY2F0aW9uL3gtY29uZmVyZW5jZVwiLFxuICAgIFwibnNmXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLW5vdGVzXCIsXG4gICAgXCJudGZcIjogXCJhcHBsaWNhdGlvbi92bmQubml0ZlwiLFxuICAgIFwibnpiXCI6IFwiYXBwbGljYXRpb24veC1uemJcIixcbiAgICBcIm9hMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzMlwiLFxuICAgIFwib2EzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXMzXCIsXG4gICAgXCJvYXNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c1wiLFxuICAgIFwib2JkXCI6IFwiYXBwbGljYXRpb24veC1tc2JpbmRlclwiLFxuICAgIFwib2JqXCI6IFwiYXBwbGljYXRpb24veC10Z2lmXCIsXG4gICAgXCJvZGFcIjogXCJhcHBsaWNhdGlvbi9vZGFcIixcbiAgICBcIm9kYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZGF0YWJhc2VcIixcbiAgICBcIm9kY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuY2hhcnRcIixcbiAgICBcIm9kZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZm9ybXVsYVwiLFxuICAgIFwib2RmdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZm9ybXVsYS10ZW1wbGF0ZVwiLFxuICAgIFwib2RnXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljc1wiLFxuICAgIFwib2RpXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZVwiLFxuICAgIFwib2RtXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LW1hc3RlclwiLFxuICAgIFwib2RwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb25cIixcbiAgICBcIm9kc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXRcIixcbiAgICBcIm9kdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dFwiLFxuICAgIFwib2dhXCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJvZ2dcIjogXCJhdWRpby9vZ2dcIixcbiAgICBcIm9ndlwiOiBcInZpZGVvL29nZ1wiLFxuICAgIFwib2d4XCI6IFwiYXBwbGljYXRpb24vb2dnXCIsXG4gICAgXCJvbWRvY1wiOiBcImFwcGxpY2F0aW9uL29tZG9jK3htbFwiLFxuICAgIFwib25lcGtnXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib25ldG1wXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib25ldG9jXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib25ldG9jMlwiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9wZlwiOiBcImFwcGxpY2F0aW9uL29lYnBzLXBhY2thZ2UreG1sXCIsXG4gICAgXCJvcG1sXCI6IFwidGV4dC94LW9wbWxcIixcbiAgICBcIm9wcmNcIjogXCJhcHBsaWNhdGlvbi92bmQucGFsbVwiLFxuICAgIFwib3JnXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLW9yZ2FuaXplclwiLFxuICAgIFwib3NmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5vcGVuc2NvcmVmb3JtYXRcIixcbiAgICBcIm9zZnB2Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0Lm9zZnB2Zyt4bWxcIixcbiAgICBcIm90Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuY2hhcnQtdGVtcGxhdGVcIixcbiAgICBcIm90ZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1vdGZcIixcbiAgICBcIm90Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3MtdGVtcGxhdGVcIixcbiAgICBcIm90aFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC13ZWJcIixcbiAgICBcIm90aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2UtdGVtcGxhdGVcIixcbiAgICBcIm90cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uLXRlbXBsYXRlXCIsXG4gICAgXCJvdHNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0LXRlbXBsYXRlXCIsXG4gICAgXCJvdHRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtdGVtcGxhdGVcIixcbiAgICBcIm94cHNcIjogXCJhcHBsaWNhdGlvbi9veHBzXCIsXG4gICAgXCJveHRcIjogXCJhcHBsaWNhdGlvbi92bmQub3Blbm9mZmljZW9yZy5leHRlbnNpb25cIixcbiAgICBcInBcIjogXCJ0ZXh0L3gtcGFzY2FsXCIsXG4gICAgXCJwMTBcIjogXCJhcHBsaWNhdGlvbi9wa2NzMTBcIixcbiAgICBcInAxMlwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczEyXCIsXG4gICAgXCJwN2JcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRpZmljYXRlc1wiLFxuICAgIFwicDdjXCI6IFwiYXBwbGljYXRpb24vcGtjczctbWltZVwiLFxuICAgIFwicDdtXCI6IFwiYXBwbGljYXRpb24vcGtjczctbWltZVwiLFxuICAgIFwicDdyXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0cmVxcmVzcFwiLFxuICAgIFwicDdzXCI6IFwiYXBwbGljYXRpb24vcGtjczctc2lnbmF0dXJlXCIsXG4gICAgXCJwOFwiOiBcImFwcGxpY2F0aW9uL3BrY3M4XCIsXG4gICAgXCJwYXNcIjogXCJ0ZXh0L3gtcGFzY2FsXCIsXG4gICAgXCJwYXdcIjogXCJhcHBsaWNhdGlvbi92bmQucGF3YWFmaWxlXCIsXG4gICAgXCJwYmRcIjogXCJhcHBsaWNhdGlvbi92bmQucG93ZXJidWlsZGVyNlwiLFxuICAgIFwicGJtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1iaXRtYXBcIixcbiAgICBcInBjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJwY2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtcGNmXCIsXG4gICAgXCJwY2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtcGNsXCIsXG4gICAgXCJwY2x4bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1wY2x4bFwiLFxuICAgIFwicGN0XCI6IFwiaW1hZ2UveC1waWN0XCIsXG4gICAgXCJwY3VybFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXJsLnBjdXJsXCIsXG4gICAgXCJwY3hcIjogXCJpbWFnZS94LXBjeFwiLFxuICAgIFwicGRiXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcInBkZlwiOiBcImFwcGxpY2F0aW9uL3BkZlwiLFxuICAgIFwicGZhXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZmJcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmbVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZyXCI6IFwiYXBwbGljYXRpb24vZm9udC10ZHBmclwiLFxuICAgIFwicGZ4XCI6IFwiYXBwbGljYXRpb24veC1wa2NzMTJcIixcbiAgICBcInBnbVwiOiBcImltYWdlL3gtcG9ydGFibGUtZ3JheW1hcFwiLFxuICAgIFwicGduXCI6IFwiYXBwbGljYXRpb24veC1jaGVzcy1wZ25cIixcbiAgICBcInBncFwiOiBcImFwcGxpY2F0aW9uL3BncC1lbmNyeXB0ZWRcIixcbiAgICBcInBoYXJcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInBocFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInBocHNcIjogXCJhcHBsaWNhdGlvbi94LWh0dHBkLXBocHNcIixcbiAgICBcInBpY1wiOiBcImltYWdlL3gtcGljdFwiLFxuICAgIFwicGtnXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJwa2lcIjogXCJhcHBsaWNhdGlvbi9wa2l4Y21wXCIsXG4gICAgXCJwa2lwYXRoXCI6IFwiYXBwbGljYXRpb24vcGtpeC1wa2lwYXRoXCIsXG4gICAgXCJwbGJcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctbGFyZ2VcIixcbiAgICBcInBsY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMucGxjXCIsXG4gICAgXCJwbGZcIjogXCJhcHBsaWNhdGlvbi92bmQucG9ja2V0bGVhcm5cIixcbiAgICBcInBsaXN0XCI6IFwiYXBwbGljYXRpb24veC1wbGlzdFwiLFxuICAgIFwicGxzXCI6IFwiYXBwbGljYXRpb24vcGxzK3htbFwiLFxuICAgIFwicG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmN0Yy1wb3NtbFwiLFxuICAgIFwicG5nXCI6IFwiaW1hZ2UvcG5nXCIsXG4gICAgXCJwbm1cIjogXCJpbWFnZS94LXBvcnRhYmxlLWFueW1hcFwiLFxuICAgIFwicG9ydHBrZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tYWNwb3J0cy5wb3J0cGtnXCIsXG4gICAgXCJwb3RcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFwiLFxuICAgIFwicG90bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicG90eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC50ZW1wbGF0ZVwiLFxuICAgIFwicHBhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LmFkZGluLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHBkXCI6IFwiYXBwbGljYXRpb24vdm5kLmN1cHMtcHBkXCIsXG4gICAgXCJwcG1cIjogXCJpbWFnZS94LXBvcnRhYmxlLXBpeG1hcFwiLFxuICAgIFwicHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBwc21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5zbGlkZXNob3cubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwcHN4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnNsaWRlc2hvd1wiLFxuICAgIFwicHB0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBwdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5wcmVzZW50YXRpb24ubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwcHR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnByZXNlbnRhdGlvblwiLFxuICAgIFwicHFhXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcInByY1wiOiBcImFwcGxpY2F0aW9uL3gtbW9iaXBvY2tldC1lYm9va1wiLFxuICAgIFwicHJlXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLWZyZWVsYW5jZVwiLFxuICAgIFwicHJmXCI6IFwiYXBwbGljYXRpb24vcGljcy1ydWxlc1wiLFxuICAgIFwicHNcIjogXCJhcHBsaWNhdGlvbi9wb3N0c2NyaXB0XCIsXG4gICAgXCJwc2JcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctc21hbGxcIixcbiAgICBcInBzZFwiOiBcImltYWdlL3ZuZC5hZG9iZS5waG90b3Nob3BcIixcbiAgICBcInBzZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1saW51eC1wc2ZcIixcbiAgICBcInBza2N4bWxcIjogXCJhcHBsaWNhdGlvbi9wc2tjK3htbFwiLFxuICAgIFwicHRpZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wdmkucHRpZDFcIixcbiAgICBcInB1YlwiOiBcImFwcGxpY2F0aW9uL3gtbXNwdWJsaXNoZXJcIixcbiAgICBcInB2YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy12YXJcIixcbiAgICBcInB3blwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zbS5wb3N0LWl0LW5vdGVzXCIsXG4gICAgXCJweWFcIjogXCJhdWRpby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5YVwiLFxuICAgIFwicHl2XCI6IFwidmlkZW8vdm5kLm1zLXBsYXlyZWFkeS5tZWRpYS5weXZcIixcbiAgICBcInFhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5xdWlja2FuaW1lXCIsXG4gICAgXCJxYm9cIjogXCJhcHBsaWNhdGlvbi92bmQuaW50dS5xYm9cIixcbiAgICBcInFmeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFmeFwiLFxuICAgIFwicXBzXCI6IFwiYXBwbGljYXRpb24vdm5kLnB1Ymxpc2hhcmUtZGVsdGEtdHJlZVwiLFxuICAgIFwicXRcIjogXCJ2aWRlby9xdWlja3RpbWVcIixcbiAgICBcInF3ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXd0XCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGJcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhsXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeHRcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInJhXCI6IFwiYXVkaW8veC1wbi1yZWFsYXVkaW9cIixcbiAgICBcInJhbVwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvXCIsXG4gICAgXCJyYXJcIjogXCJhcHBsaWNhdGlvbi94LXJhci1jb21wcmVzc2VkXCIsXG4gICAgXCJyYXNcIjogXCJpbWFnZS94LWNtdS1yYXN0ZXJcIixcbiAgICBcInJiXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwicmNwcm9maWxlXCI6IFwiYXBwbGljYXRpb24vdm5kLmlwdW5wbHVnZ2VkLnJjcHJvZmlsZVwiLFxuICAgIFwicmRmXCI6IFwiYXBwbGljYXRpb24vcmRmK3htbFwiLFxuICAgIFwicmR6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRhdGEtdmlzaW9uLnJkelwiLFxuICAgIFwicmVwXCI6IFwiYXBwbGljYXRpb24vdm5kLmJ1c2luZXNzb2JqZWN0c1wiLFxuICAgIFwicmVzXCI6IFwiYXBwbGljYXRpb24veC1kdGJyZXNvdXJjZSt4bWxcIixcbiAgICBcInJlc3hcIjogXCJ0ZXh0L3htbFwiLFxuICAgIFwicmdiXCI6IFwiaW1hZ2UveC1yZ2JcIixcbiAgICBcInJpZlwiOiBcImFwcGxpY2F0aW9uL3JlZ2luZm8reG1sXCIsXG4gICAgXCJyaXBcIjogXCJhdWRpby92bmQucmlwXCIsXG4gICAgXCJyaXNcIjogXCJhcHBsaWNhdGlvbi94LXJlc2VhcmNoLWluZm8tc3lzdGVtc1wiLFxuICAgIFwicmxcIjogXCJhcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cyt4bWxcIixcbiAgICBcInJsY1wiOiBcImltYWdlL3ZuZC5mdWppeGVyb3guZWRtaWNzLXJsY1wiLFxuICAgIFwicmxkXCI6IFwiYXBwbGljYXRpb24vcmVzb3VyY2UtbGlzdHMtZGlmZit4bWxcIixcbiAgICBcInJtXCI6IFwiYXBwbGljYXRpb24vdm5kLnJuLXJlYWxtZWRpYVwiLFxuICAgIFwicm1pXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwicm1wXCI6IFwiYXVkaW8veC1wbi1yZWFsYXVkaW8tcGx1Z2luXCIsXG4gICAgXCJybXNcIjogXCJhcHBsaWNhdGlvbi92bmQuamNwLmphdmFtZS5taWRsZXQtcm1zXCIsXG4gICAgXCJybXZiXCI6IFwiYXBwbGljYXRpb24vdm5kLnJuLXJlYWxtZWRpYS12YnJcIixcbiAgICBcInJuY1wiOiBcImFwcGxpY2F0aW9uL3JlbGF4LW5nLWNvbXBhY3Qtc3ludGF4XCIsXG4gICAgXCJyb2FcIjogXCJhcHBsaWNhdGlvbi9ycGtpLXJvYVwiLFxuICAgIFwicm9mZlwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcInJwOVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9hbnRvLnJwOVwiLFxuICAgIFwicnBtXCI6IFwiYXBwbGljYXRpb24veC1ycG1cIixcbiAgICBcInJwc3NcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEucmFkaW8tcHJlc2V0c1wiLFxuICAgIFwicnBzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5yYWRpby1wcmVzZXRcIixcbiAgICBcInJxXCI6IFwiYXBwbGljYXRpb24vc3BhcnFsLXF1ZXJ5XCIsXG4gICAgXCJyc1wiOiBcImFwcGxpY2F0aW9uL3Jscy1zZXJ2aWNlcyt4bWxcIixcbiAgICBcInJzZFwiOiBcImFwcGxpY2F0aW9uL3JzZCt4bWxcIixcbiAgICBcInJzc1wiOiBcImFwcGxpY2F0aW9uL3Jzcyt4bWxcIixcbiAgICBcInJ0ZlwiOiBcImFwcGxpY2F0aW9uL3J0ZlwiLFxuICAgIFwicnR4XCI6IFwidGV4dC9yaWNodGV4dFwiLFxuICAgIFwic1wiOiBcInRleHQveC1hc21cIixcbiAgICBcInMzbVwiOiBcImF1ZGlvL3MzbVwiLFxuICAgIFwiczd6XCI6IFwiYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkXCIsXG4gICAgXCJzYWZcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLnNtYWYtYXVkaW9cIixcbiAgICBcInNhZmFyaWV4dHpcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInNhc3NcIjogXCJ0ZXh0L3gtc2Fzc1wiLFxuICAgIFwic2JtbFwiOiBcImFwcGxpY2F0aW9uL3NibWwreG1sXCIsXG4gICAgXCJzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0uc2VjdXJlLWNvbnRhaW5lclwiLFxuICAgIFwic2NkXCI6IFwiYXBwbGljYXRpb24veC1tc3NjaGVkdWxlXCIsXG4gICAgXCJzY21cIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtc2NyZWVuY2FtXCIsXG4gICAgXCJzY3FcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLWN2LXJlcXVlc3RcIixcbiAgICBcInNjc1wiOiBcImFwcGxpY2F0aW9uL3NjdnAtY3YtcmVzcG9uc2VcIixcbiAgICBcInNjc3NcIjogXCJ0ZXh0L3gtc2Nzc1wiLFxuICAgIFwic2N1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsLnNjdXJsXCIsXG4gICAgXCJzZGFcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmRyYXdcIixcbiAgICBcInNkY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uY2FsY1wiLFxuICAgIFwic2RkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5pbXByZXNzXCIsXG4gICAgXCJzZGtkXCI6IFwiYXBwbGljYXRpb24vdm5kLnNvbGVudC5zZGttK3htbFwiLFxuICAgIFwic2RrbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zb2xlbnQuc2RrbSt4bWxcIixcbiAgICBcInNkcFwiOiBcImFwcGxpY2F0aW9uL3NkcFwiLFxuICAgIFwic2R3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXJcIixcbiAgICBcInNlZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZWVtYWlsXCIsXG4gICAgXCJzZWVkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFwiLFxuICAgIFwic2VtYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1hXCIsXG4gICAgXCJzZW1kXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWRcIixcbiAgICBcInNlbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtZlwiLFxuICAgIFwic2VyXCI6IFwiYXBwbGljYXRpb24vamF2YS1zZXJpYWxpemVkLW9iamVjdFwiLFxuICAgIFwic2V0cGF5XCI6IFwiYXBwbGljYXRpb24vc2V0LXBheW1lbnQtaW5pdGlhdGlvblwiLFxuICAgIFwic2V0cmVnXCI6IFwiYXBwbGljYXRpb24vc2V0LXJlZ2lzdHJhdGlvbi1pbml0aWF0aW9uXCIsXG4gICAgXCJzZmQtaGRzdHhcIjogXCJhcHBsaWNhdGlvbi92bmQuaHlkcm9zdGF0aXguc29mLWRhdGFcIixcbiAgICBcInNmc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5zZnNcIixcbiAgICBcInNmdlwiOiBcInRleHQveC1zZnZcIixcbiAgICBcInNnaVwiOiBcImltYWdlL3NnaVwiLFxuICAgIFwic2dsXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXItZ2xvYmFsXCIsXG4gICAgXCJzZ21cIjogXCJ0ZXh0L3NnbWxcIixcbiAgICBcInNnbWxcIjogXCJ0ZXh0L3NnbWxcIixcbiAgICBcInNoXCI6IFwiYXBwbGljYXRpb24veC1zaFwiLFxuICAgIFwic2hhclwiOiBcImFwcGxpY2F0aW9uL3gtc2hhclwiLFxuICAgIFwic2hmXCI6IFwiYXBwbGljYXRpb24vc2hmK3htbFwiLFxuICAgIFwic2lkXCI6IFwiaW1hZ2UveC1tcnNpZC1pbWFnZVwiLFxuICAgIFwic2lnXCI6IFwiYXBwbGljYXRpb24vcGdwLXNpZ25hdHVyZVwiLFxuICAgIFwic2lsXCI6IFwiYXVkaW8vc2lsa1wiLFxuICAgIFwic2lsb1wiOiBcIm1vZGVsL21lc2hcIixcbiAgICBcInNpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcInNpc3hcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJzaXRcIjogXCJhcHBsaWNhdGlvbi94LXN0dWZmaXRcIixcbiAgICBcInNpdHhcIjogXCJhcHBsaWNhdGlvbi94LXN0dWZmaXR4XCIsXG4gICAgXCJza2RcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2ttXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza3RcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2xkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwic2xkeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZVwiLFxuICAgIFwic2x0XCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnNhbHRcIixcbiAgICBcInNtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0ZXBtYW5pYS5zdGVwY2hhcnRcIixcbiAgICBcInNtZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ubWF0aFwiLFxuICAgIFwic21pXCI6IFwiYXBwbGljYXRpb24vc21pbCt4bWxcIixcbiAgICBcInNtaWxcIjogXCJhcHBsaWNhdGlvbi9zbWlsK3htbFwiLFxuICAgIFwic212XCI6IFwidmlkZW8veC1zbXZcIixcbiAgICBcInNtemlwXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0ZXBtYW5pYS5wYWNrYWdlXCIsXG4gICAgXCJzbmRcIjogXCJhdWRpby9iYXNpY1wiLFxuICAgIFwic25mXCI6IFwiYXBwbGljYXRpb24veC1mb250LXNuZlwiLFxuICAgIFwic29cIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInNwY1wiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydGlmaWNhdGVzXCIsXG4gICAgXCJzcGZcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLnNtYWYtcGhyYXNlXCIsXG4gICAgXCJzcGxcIjogXCJhcHBsaWNhdGlvbi94LWZ1dHVyZXNwbGFzaFwiLFxuICAgIFwic3BvdFwiOiBcInRleHQvdm5kLmluM2Quc3BvdFwiLFxuICAgIFwic3BwXCI6IFwiYXBwbGljYXRpb24vc2N2cC12cC1yZXNwb25zZVwiLFxuICAgIFwic3BxXCI6IFwiYXBwbGljYXRpb24vc2N2cC12cC1yZXF1ZXN0XCIsXG4gICAgXCJzcHhcIjogXCJhdWRpby9vZ2dcIixcbiAgICBcInNxbFwiOiBcImFwcGxpY2F0aW9uL3gtc3FsXCIsXG4gICAgXCJzcmNcIjogXCJhcHBsaWNhdGlvbi94LXdhaXMtc291cmNlXCIsXG4gICAgXCJzcnRcIjogXCJhcHBsaWNhdGlvbi94LXN1YnJpcFwiLFxuICAgIFwic3J1XCI6IFwiYXBwbGljYXRpb24vc3J1K3htbFwiLFxuICAgIFwic3J4XCI6IFwiYXBwbGljYXRpb24vc3BhcnFsLXJlc3VsdHMreG1sXCIsXG4gICAgXCJzc2RsXCI6IFwiYXBwbGljYXRpb24vc3NkbCt4bWxcIixcbiAgICBcInNzZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2Rhay1kZXNjcmlwdG9yXCIsXG4gICAgXCJzc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uc3NmXCIsXG4gICAgXCJzc21sXCI6IFwiYXBwbGljYXRpb24vc3NtbCt4bWxcIixcbiAgICBcInN0XCI6IFwiYXBwbGljYXRpb24vdm5kLnNhaWxpbmd0cmFja2VyLnRyYWNrXCIsXG4gICAgXCJzdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjLnRlbXBsYXRlXCIsXG4gICAgXCJzdGRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3LnRlbXBsYXRlXCIsXG4gICAgXCJzdGZcIjogXCJhcHBsaWNhdGlvbi92bmQud3Quc3RmXCIsXG4gICAgXCJzdGlcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5pbXByZXNzLnRlbXBsYXRlXCIsXG4gICAgXCJzdGtcIjogXCJhcHBsaWNhdGlvbi9oeXBlcnN0dWRpb1wiLFxuICAgIFwic3RsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBraS5zdGxcIixcbiAgICBcInN0clwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wZy5mb3JtYXRcIixcbiAgICBcInN0d1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci50ZW1wbGF0ZVwiLFxuICAgIFwic3R5bFwiOiBcInRleHQveC1zdHlsXCIsXG4gICAgXCJzdWJcIjogXCJpbWFnZS92bmQuZHZiLnN1YnRpdGxlXCIsXG4gICAgXCJzdXNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VzLWNhbGVuZGFyXCIsXG4gICAgXCJzdXNwXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1cy1jYWxlbmRhclwiLFxuICAgIFwic3Y0Y3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtc3Y0Y3Bpb1wiLFxuICAgIFwic3Y0Y3JjXCI6IFwiYXBwbGljYXRpb24veC1zdjRjcmNcIixcbiAgICBcInN2Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5kdmIuc2VydmljZVwiLFxuICAgIFwic3ZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN2ZFwiLFxuICAgIFwic3ZnXCI6IFwiaW1hZ2Uvc3ZnK3htbFwiLFxuICAgIFwic3ZnelwiOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICBcInN3YVwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcInN3ZlwiOiBcImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIsXG4gICAgXCJzd2lcIjogXCJhcHBsaWNhdGlvbi92bmQuYXJpc3RhbmV0d29ya3Muc3dpXCIsXG4gICAgXCJzeGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5jYWxjXCIsXG4gICAgXCJzeGRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5kcmF3XCIsXG4gICAgXCJzeGdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXIuZ2xvYmFsXCIsXG4gICAgXCJzeGlcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5pbXByZXNzXCIsXG4gICAgXCJzeG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC5tYXRoXCIsXG4gICAgXCJzeHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXJcIixcbiAgICBcInRcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJ0M1wiOiBcImFwcGxpY2F0aW9uL3gtdDN2bS1pbWFnZVwiLFxuICAgIFwidGFnbGV0XCI6IFwiYXBwbGljYXRpb24vdm5kLm15bmZjXCIsXG4gICAgXCJ0YW9cIjogXCJhcHBsaWNhdGlvbi92bmQudGFvLmludGVudC1tb2R1bGUtYXJjaGl2ZVwiLFxuICAgIFwidGFyXCI6IFwiYXBwbGljYXRpb24veC10YXJcIixcbiAgICBcInRjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcDIudGNhcFwiLFxuICAgIFwidGNsXCI6IFwiYXBwbGljYXRpb24veC10Y2xcIixcbiAgICBcInRlYWNoZXJcIjogXCJhcHBsaWNhdGlvbi92bmQuc21hcnQudGVhY2hlclwiLFxuICAgIFwidGVpXCI6IFwiYXBwbGljYXRpb24vdGVpK3htbFwiLFxuICAgIFwidGVpY29ycHVzXCI6IFwiYXBwbGljYXRpb24vdGVpK3htbFwiLFxuICAgIFwidGV4XCI6IFwiYXBwbGljYXRpb24veC10ZXhcIixcbiAgICBcInRleGlcIjogXCJhcHBsaWNhdGlvbi94LXRleGluZm9cIixcbiAgICBcInRleGluZm9cIjogXCJhcHBsaWNhdGlvbi94LXRleGluZm9cIixcbiAgICBcInRleHRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJ0ZmlcIjogXCJhcHBsaWNhdGlvbi90aHJhdWQreG1sXCIsXG4gICAgXCJ0Zm1cIjogXCJhcHBsaWNhdGlvbi94LXRleC10Zm1cIixcbiAgICBcInRnYVwiOiBcImltYWdlL3gtdGdhXCIsXG4gICAgXCJ0Z3pcIjogXCJhcHBsaWNhdGlvbi94LWd6aXBcIixcbiAgICBcInRobXhcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtb2ZmaWNldGhlbWVcIixcbiAgICBcInRpZlwiOiBcImltYWdlL3RpZmZcIixcbiAgICBcInRpZmZcIjogXCJpbWFnZS90aWZmXCIsXG4gICAgXCJ0bW9cIjogXCJhcHBsaWNhdGlvbi92bmQudG1vYmlsZS1saXZldHZcIixcbiAgICBcInRvcnJlbnRcIjogXCJhcHBsaWNhdGlvbi94LWJpdHRvcnJlbnRcIixcbiAgICBcInRwbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdG9vbC10ZW1wbGF0ZVwiLFxuICAgIFwidHB0XCI6IFwiYXBwbGljYXRpb24vdm5kLnRyaWQudHB0XCIsXG4gICAgXCJ0clwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcInRyYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC50cnVlYXBwXCIsXG4gICAgXCJ0cm1cIjogXCJhcHBsaWNhdGlvbi94LW1zdGVybWluYWxcIixcbiAgICBcInRzZFwiOiBcImFwcGxpY2F0aW9uL3RpbWVzdGFtcGVkLWRhdGFcIixcbiAgICBcInRzdlwiOiBcInRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcIixcbiAgICBcInR0Y1wiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10dGZcIixcbiAgICBcInR0ZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10dGZcIixcbiAgICBcInR0bFwiOiBcInRleHQvdHVydGxlXCIsXG4gICAgXCJ0d2RcIjogXCJhcHBsaWNhdGlvbi92bmQuc2ltdGVjaC1taW5kbWFwcGVyXCIsXG4gICAgXCJ0d2RzXCI6IFwiYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclwiLFxuICAgIFwidHhkXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlbm9tYXRpeC50dXhlZG9cIixcbiAgICBcInR4ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMudHhmXCIsXG4gICAgXCJ0eHRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJ1MzJcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJ1ZGViXCI6IFwiYXBwbGljYXRpb24veC1kZWJpYW4tcGFja2FnZVwiLFxuICAgIFwidWZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnVmZGxcIixcbiAgICBcInVmZGxcIjogXCJhcHBsaWNhdGlvbi92bmQudWZkbFwiLFxuICAgIFwidWx4XCI6IFwiYXBwbGljYXRpb24veC1nbHVseFwiLFxuICAgIFwidW1qXCI6IFwiYXBwbGljYXRpb24vdm5kLnVtYWppblwiLFxuICAgIFwidW5pdHl3ZWJcIjogXCJhcHBsaWNhdGlvbi92bmQudW5pdHlcIixcbiAgICBcInVvbWxcIjogXCJhcHBsaWNhdGlvbi92bmQudW9tbCt4bWxcIixcbiAgICBcInVyaVwiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVyaXNcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1cmxzXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXN0YXJcIjogXCJhcHBsaWNhdGlvbi94LXVzdGFyXCIsXG4gICAgXCJ1dHpcIjogXCJhcHBsaWNhdGlvbi92bmQudWlxLnRoZW1lXCIsXG4gICAgXCJ1dVwiOiBcInRleHQveC11dWVuY29kZVwiLFxuICAgIFwidXZhXCI6IFwiYXVkaW8vdm5kLmRlY2UuYXVkaW9cIixcbiAgICBcInV2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2Z1wiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2aFwiOiBcInZpZGVvL3ZuZC5kZWNlLmhkXCIsXG4gICAgXCJ1dmlcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dm1cIjogXCJ2aWRlby92bmQuZGVjZS5tb2JpbGVcIixcbiAgICBcInV2cFwiOiBcInZpZGVvL3ZuZC5kZWNlLnBkXCIsXG4gICAgXCJ1dnNcIjogXCJ2aWRlby92bmQuZGVjZS5zZFwiLFxuICAgIFwidXZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcIixcbiAgICBcInV2dVwiOiBcInZpZGVvL3ZuZC51dnZ1Lm1wNFwiLFxuICAgIFwidXZ2XCI6IFwidmlkZW8vdm5kLmRlY2UudmlkZW9cIixcbiAgICBcInV2dmFcIjogXCJhdWRpby92bmQuZGVjZS5hdWRpb1wiLFxuICAgIFwidXZ2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2dmZcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dnZnXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZ2aFwiOiBcInZpZGVvL3ZuZC5kZWNlLmhkXCIsXG4gICAgXCJ1dnZpXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZ2bVwiOiBcInZpZGVvL3ZuZC5kZWNlLm1vYmlsZVwiLFxuICAgIFwidXZ2cFwiOiBcInZpZGVvL3ZuZC5kZWNlLnBkXCIsXG4gICAgXCJ1dnZzXCI6IFwidmlkZW8vdm5kLmRlY2Uuc2RcIixcbiAgICBcInV2dnRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS50dG1sK3htbFwiLFxuICAgIFwidXZ2dVwiOiBcInZpZGVvL3ZuZC51dnZ1Lm1wNFwiLFxuICAgIFwidXZ2dlwiOiBcInZpZGVvL3ZuZC5kZWNlLnZpZGVvXCIsXG4gICAgXCJ1dnZ4XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudW5zcGVjaWZpZWRcIixcbiAgICBcInV2dnpcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS56aXBcIixcbiAgICBcInV2eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXCIsXG4gICAgXCJ1dnpcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS56aXBcIixcbiAgICBcInZjYXJkXCI6IFwidGV4dC92Y2FyZFwiLFxuICAgIFwidmNkXCI6IFwiYXBwbGljYXRpb24veC1jZGxpbmtcIixcbiAgICBcInZjZlwiOiBcInRleHQveC12Y2FyZFwiLFxuICAgIFwidmNnXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS12Y2FyZFwiLFxuICAgIFwidmNzXCI6IFwidGV4dC94LXZjYWxlbmRhclwiLFxuICAgIFwidmN4XCI6IFwiYXBwbGljYXRpb24vdm5kLnZjeFwiLFxuICAgIFwidmlzXCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvbmFyeVwiLFxuICAgIFwidml2XCI6IFwidmlkZW8vdm5kLnZpdm9cIixcbiAgICBcInZvYlwiOiBcInZpZGVvL3gtbXMtdm9iXCIsXG4gICAgXCJ2b3JcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclwiLFxuICAgIFwidm94XCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwidnJtbFwiOiBcIm1vZGVsL3ZybWxcIixcbiAgICBcInZzZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnNmXCI6IFwiYXBwbGljYXRpb24vdm5kLnZzZlwiLFxuICAgIFwidnNzXCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c3RcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnR1XCI6IFwibW9kZWwvdm5kLnZ0dVwiLFxuICAgIFwidnhtbFwiOiBcImFwcGxpY2F0aW9uL3ZvaWNleG1sK3htbFwiLFxuICAgIFwidzNkXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwid2FkXCI6IFwiYXBwbGljYXRpb24veC1kb29tXCIsXG4gICAgXCJ3YXZcIjogXCJhdWRpby94LXdhdlwiLFxuICAgIFwid2F4XCI6IFwiYXVkaW8veC1tcy13YXhcIixcbiAgICBcIndibXBcIjogXCJpbWFnZS92bmQud2FwLndibXBcIixcbiAgICBcIndic1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcml0aWNhbHRvb2xzLndicyt4bWxcIixcbiAgICBcIndieG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53YnhtbFwiLFxuICAgIFwid2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3ZGJcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndkcFwiOiBcImltYWdlL3ZuZC5tcy1waG90b1wiLFxuICAgIFwid2ViYVwiOiBcImF1ZGlvL3dlYm1cIixcbiAgICBcIndlYm1cIjogXCJ2aWRlby93ZWJtXCIsXG4gICAgXCJ3ZWJwXCI6IFwiaW1hZ2Uvd2VicFwiLFxuICAgIFwid2dcIjogXCJhcHBsaWNhdGlvbi92bmQucG1pLndpZGdldFwiLFxuICAgIFwid2d0XCI6IFwiYXBwbGljYXRpb24vd2lkZ2V0XCIsXG4gICAgXCJ3a3NcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndtXCI6IFwidmlkZW8veC1tcy13bVwiLFxuICAgIFwid21hXCI6IFwiYXVkaW8veC1tcy13bWFcIixcbiAgICBcIndtZFwiOiBcImFwcGxpY2F0aW9uL3gtbXMtd21kXCIsXG4gICAgXCJ3bWZcIjogXCJhcHBsaWNhdGlvbi94LW1zbWV0YWZpbGVcIixcbiAgICBcIndtbFwiOiBcInRleHQvdm5kLndhcC53bWxcIixcbiAgICBcIndtbGNcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndtbGNcIixcbiAgICBcIndtbHNcIjogXCJ0ZXh0L3ZuZC53YXAud21sc2NyaXB0XCIsXG4gICAgXCJ3bWxzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud21sc2NyaXB0Y1wiLFxuICAgIFwid212XCI6IFwidmlkZW8veC1tcy13bXZcIixcbiAgICBcIndteFwiOiBcInZpZGVvL3gtbXMtd214XCIsXG4gICAgXCJ3bXpcIjogXCJhcHBsaWNhdGlvbi94LW1zLXdtelwiLFxuICAgIFwid29mZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC13b2ZmXCIsXG4gICAgXCJ3cGRcIjogXCJhcHBsaWNhdGlvbi92bmQud29yZHBlcmZlY3RcIixcbiAgICBcIndwbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13cGxcIixcbiAgICBcIndwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid3FkXCI6IFwiYXBwbGljYXRpb24vdm5kLndxZFwiLFxuICAgIFwid3JpXCI6IFwiYXBwbGljYXRpb24veC1tc3dyaXRlXCIsXG4gICAgXCJ3cmxcIjogXCJtb2RlbC92cm1sXCIsXG4gICAgXCJ3c2RsXCI6IFwiYXBwbGljYXRpb24vd3NkbCt4bWxcIixcbiAgICBcIndzcG9saWN5XCI6IFwiYXBwbGljYXRpb24vd3Nwb2xpY3kreG1sXCIsXG4gICAgXCJ3dGJcIjogXCJhcHBsaWNhdGlvbi92bmQud2VidHVyYm9cIixcbiAgICBcInd2eFwiOiBcInZpZGVvL3gtbXMtd3Z4XCIsXG4gICAgXCJ4MzJcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJ4M2RcIjogXCJtb2RlbC94M2QreG1sXCIsXG4gICAgXCJ4M2RiXCI6IFwibW9kZWwveDNkK2JpbmFyeVwiLFxuICAgIFwieDNkYnpcIjogXCJtb2RlbC94M2QrYmluYXJ5XCIsXG4gICAgXCJ4M2R2XCI6IFwibW9kZWwveDNkK3ZybWxcIixcbiAgICBcIngzZHZ6XCI6IFwibW9kZWwveDNkK3ZybWxcIixcbiAgICBcIngzZHpcIjogXCJtb2RlbC94M2QreG1sXCIsXG4gICAgXCJ4YW1sXCI6IFwiYXBwbGljYXRpb24veGFtbCt4bWxcIixcbiAgICBcInhhcFwiOiBcImFwcGxpY2F0aW9uL3gtc2lsdmVybGlnaHQtYXBwXCIsXG4gICAgXCJ4YXJcIjogXCJhcHBsaWNhdGlvbi92bmQueGFyYVwiLFxuICAgIFwieGJhcFwiOiBcImFwcGxpY2F0aW9uL3gtbXMteGJhcFwiLFxuICAgIFwieGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kb2N1d29ya3MuYmluZGVyXCIsXG4gICAgXCJ4Ym1cIjogXCJpbWFnZS94LXhiaXRtYXBcIixcbiAgICBcInhkZlwiOiBcImFwcGxpY2F0aW9uL3hjYXAtZGlmZit4bWxcIixcbiAgICBcInhkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0reG1sXCIsXG4gICAgXCJ4ZHBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUueGRwK3htbFwiLFxuICAgIFwieGRzc2NcIjogXCJhcHBsaWNhdGlvbi9kc3NjK3htbFwiLFxuICAgIFwieGR3XCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kb2N1d29ya3NcIixcbiAgICBcInhlbmNcIjogXCJhcHBsaWNhdGlvbi94ZW5jK3htbFwiLFxuICAgIFwieGVyXCI6IFwiYXBwbGljYXRpb24vcGF0Y2gtb3BzLWVycm9yK3htbFwiLFxuICAgIFwieGZkZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS54ZmRmXCIsXG4gICAgXCJ4ZmRsXCI6IFwiYXBwbGljYXRpb24vdm5kLnhmZGxcIixcbiAgICBcInhodFwiOiBcImFwcGxpY2F0aW9uL3hodG1sK3htbFwiLFxuICAgIFwieGh0bWxcIjogXCJhcHBsaWNhdGlvbi94aHRtbCt4bWxcIixcbiAgICBcInhodm1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJ4aWZcIjogXCJpbWFnZS92bmQueGlmZlwiLFxuICAgIFwieGxhXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bGFtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLmFkZGluLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGxjXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bGZcIjogXCJhcHBsaWNhdGlvbi94LXhsaWZmK3htbFwiLFxuICAgIFwieGxtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsc2JcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQuYmluYXJ5Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGxzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsc3hcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldFwiLFxuICAgIFwieGx0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnRlbXBsYXRlLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGx0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnRlbXBsYXRlXCIsXG4gICAgXCJ4bHdcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhtXCI6IFwiYXVkaW8veG1cIixcbiAgICBcInhtbFwiOiBcImFwcGxpY2F0aW9uL3htbFwiLFxuICAgIFwieG9cIjogXCJhcHBsaWNhdGlvbi92bmQub2xwYy1zdWdhclwiLFxuICAgIFwieG9wXCI6IFwiYXBwbGljYXRpb24veG9wK3htbFwiLFxuICAgIFwieHBpXCI6IFwiYXBwbGljYXRpb24veC14cGluc3RhbGxcIixcbiAgICBcInhwbFwiOiBcImFwcGxpY2F0aW9uL3hwcm9jK3htbFwiLFxuICAgIFwieHBtXCI6IFwiaW1hZ2UveC14cGl4bWFwXCIsXG4gICAgXCJ4cHJcIjogXCJhcHBsaWNhdGlvbi92bmQuaXMteHByXCIsXG4gICAgXCJ4cHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMteHBzZG9jdW1lbnRcIixcbiAgICBcInhwd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnRlcmNvbi5mb3JtbmV0XCIsXG4gICAgXCJ4cHhcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJjb24uZm9ybW5ldFwiLFxuICAgIFwieHNsXCI6IFwiYXBwbGljYXRpb24veG1sXCIsXG4gICAgXCJ4c2x0XCI6IFwiYXBwbGljYXRpb24veHNsdCt4bWxcIixcbiAgICBcInhzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwreG1sXCIsXG4gICAgXCJ4c3BmXCI6IFwiYXBwbGljYXRpb24veHNwZit4bWxcIixcbiAgICBcInh1bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3ppbGxhLnh1bCt4bWxcIixcbiAgICBcInh2bVwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieHZtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieHdkXCI6IFwiaW1hZ2UveC14d2luZG93ZHVtcFwiLFxuICAgIFwieHl6XCI6IFwiY2hlbWljYWwveC14eXpcIixcbiAgICBcInh6XCI6IFwiYXBwbGljYXRpb24veC14elwiLFxuICAgIFwieWFtbFwiOiBcInRleHQveWFtbFwiLFxuICAgIFwieWFuZ1wiOiBcImFwcGxpY2F0aW9uL3lhbmdcIixcbiAgICBcInlpblwiOiBcImFwcGxpY2F0aW9uL3lpbit4bWxcIixcbiAgICBcInltbFwiOiBcInRleHQveWFtbFwiLFxuICAgIFwielwiOiBcImFwcGxpY2F0aW9uL3gtY29tcHJlc3NcIixcbiAgICBcInoxXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejJcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6M1wiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno0XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejVcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NlwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno3XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejhcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6YXpcIjogXCJhcHBsaWNhdGlvbi92bmQuenphenouZGVjayt4bWxcIixcbiAgICBcInppcFwiOiBcImFwcGxpY2F0aW9uL3ppcFwiLFxuICAgIFwiemlyXCI6IFwiYXBwbGljYXRpb24vdm5kLnp1bFwiLFxuICAgIFwiemlyelwiOiBcImFwcGxpY2F0aW9uL3ZuZC56dWxcIixcbiAgICBcInptbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYW5kaGVsZC1lbnRlcnRhaW5tZW50K3htbFwiLFxuICAgIFwiMTIzXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLTEtMi0zXCJcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1taW1lLXR5cGVzLW1vZHVsZS5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmFzeW5jIGZ1bmN0aW9uIGFmdGVyRmV0Y2gocmVzcG9uc2UpIHtcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBiYWQgcmVzcG9uc2UgOiAke0pTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICBsZXQgc2NpID0gcmVjZWl2ZWRDb250ZW50VHlwZS5pbmRleE9mKCc7Jyk7XG4gICAgaWYgKHNjaSA+PSAwKVxuICAgICAgICByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVjZWl2ZWRDb250ZW50VHlwZS5zdWJzdHIoMCwgc2NpKTtcbiAgICBpZiAocmVjZWl2ZWRDb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xufVxuZnVuY3Rpb24gZ2V0RGF0YSh1cmwsIGhlYWRlcnMgPSBudWxsKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcidcbiAgICB9O1xuICAgIGlmIChoZWFkZXJzKVxuICAgICAgICBvcHRpb25zLmhlYWRlcnMgPSBoZWFkZXJzO1xuICAgIHJldHVybiBmZXRjaCh1cmwsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5nZXREYXRhID0gZ2V0RGF0YTtcbmZ1bmN0aW9uIHBvc3REYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wb3N0RGF0YSA9IHBvc3REYXRhO1xuZnVuY3Rpb24gcHV0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wdXREYXRhID0gcHV0RGF0YTtcbmZ1bmN0aW9uIGRlbGV0ZURhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZGVsZXRlRGF0YSA9IGRlbGV0ZURhdGE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5leHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwiaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgPyBcImh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgOiBcImh0dHBzOi8vbG9jYWxob3N0OjUwMDVcIjtcbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaChzZWFyY2hUZXh0LCBtaW1lVHlwZSkge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzZWFyY2hTcGVjID0ge1xuICAgICAgICAgICAgbmFtZTogc2VhcmNoVGV4dCxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBtaW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7IHJlc3VsdERpcmVjdG9yaWVzLCByZXN1bHRGaWxlc2RkZCwgaXRlbXMgfSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2VhcmNoYCwgc2VhcmNoU3BlYyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXJlY3RvcmllczogcmVzdWx0RGlyZWN0b3JpZXMsXG4gICAgICAgICAgICBmaWxlczogcmVzdWx0RmlsZXNkZGQsXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuc2VhcmNoID0gc2VhcmNoO1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoRXgoc2VhcmNoU3BlYykge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0RGlyZWN0b3JpZXMsIHJlc3VsdEZpbGVzZGRkLCBpdGVtcyB9ID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zZWFyY2hgLCBzZWFyY2hTcGVjKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzOiByZXN1bHREaXJlY3RvcmllcyxcbiAgICAgICAgICAgIGZpbGVzOiByZXN1bHRGaWxlc2RkZCxcbiAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5zZWFyY2hFeCA9IHNlYXJjaEV4O1xuYXN5bmMgZnVuY3Rpb24gZ2V0RGlyZWN0b3J5RGVzY3JpcHRvcihzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPWFwcGxpY2F0aW9uL2pzb25gKTtcbn1cbmV4cG9ydHMuZ2V0RGlyZWN0b3J5RGVzY3JpcHRvciA9IGdldERpcmVjdG9yeURlc2NyaXB0b3I7XG5hc3luYyBmdW5jdGlvbiBnZXRSZWZlcmVuY2VzKCkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcmVmc2ApO1xufVxuZXhwb3J0cy5nZXRSZWZlcmVuY2VzID0gZ2V0UmVmZXJlbmNlcztcbmFzeW5jIGZ1bmN0aW9uIGdldFJlZmVyZW5jZShuYW1lKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9yZWZzLyR7bmFtZX1gKTtcbn1cbmV4cG9ydHMuZ2V0UmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlO1xuYXN5bmMgZnVuY3Rpb24gZ2V0Q29tbWl0KHNoYSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9YXBwbGljYXRpb24vanNvbmApO1xufVxuZXhwb3J0cy5nZXRDb21taXQgPSBnZXRDb21taXQ7XG5hc3luYyBmdW5jdGlvbiBnZXRTaGFJbmZvKHNoYSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9pbmZvYCk7XG59XG5leHBvcnRzLmdldFNoYUluZm8gPSBnZXRTaGFJbmZvO1xuZnVuY3Rpb24gZ2V0U2hhQ29udGVudFVybChzaGEsIG1pbWVUeXBlLCBuYW1lLCB3aXRoUGhhbnRvbSwgaXNEb3dubG9hZCkge1xuICAgIGlmICghc2hhKVxuICAgICAgICByZXR1cm4gJyMnO1xuICAgIGxldCBiYXNlID0gd2l0aFBoYW50b20gP1xuICAgICAgICBgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQvJHtlbmNvZGVVUklDb21wb25lbnQobmFtZSl9P3R5cGU9JHtlbmNvZGVVUklDb21wb25lbnQobWltZVR5cGUpfWAgOlxuICAgICAgICBgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT0ke2VuY29kZVVSSUNvbXBvbmVudChtaW1lVHlwZSl9YDtcbiAgICBpZiAoaXNEb3dubG9hZClcbiAgICAgICAgYmFzZSArPSBgJmZpbGVOYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUgfHwgc2hhKX1gO1xuICAgIHJldHVybiBiYXNlO1xufVxuZXhwb3J0cy5nZXRTaGFDb250ZW50VXJsID0gZ2V0U2hhQ29udGVudFVybDtcbmZ1bmN0aW9uIGdldFNoYUltYWdlVGh1bWJuYWlsVXJsKHNoYSwgbWltZVR5cGUpIHtcbiAgICByZXR1cm4gYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9wbHVnaW5zL2ltYWdlL3RodW1ibmFpbD90eXBlPSR7bWltZVR5cGV9YDtcbn1cbmV4cG9ydHMuZ2V0U2hhSW1hZ2VUaHVtYm5haWxVcmwgPSBnZXRTaGFJbWFnZVRodW1ibmFpbFVybDtcbmZ1bmN0aW9uIGdldFNoYUltYWdlTWVkaXVtVGh1bWJuYWlsVXJsKHNoYSwgbWltZVR5cGUpIHtcbiAgICByZXR1cm4gYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9wbHVnaW5zL2ltYWdlL21lZGl1bT90eXBlPSR7bWltZVR5cGV9YDtcbn1cbmV4cG9ydHMuZ2V0U2hhSW1hZ2VNZWRpdW1UaHVtYm5haWxVcmwgPSBnZXRTaGFJbWFnZU1lZGl1bVRodW1ibmFpbFVybDtcbmFzeW5jIGZ1bmN0aW9uIHB1dEl0ZW1Ub1BsYXlsaXN0KHBsYXlsaXN0TmFtZSwgc2hhLCBtaW1lVHlwZSwgbmFtZSkge1xuICAgIGxldCBwYXlsb2FkID0ge1xuICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBpc0RpcmVjdG9yeTogbWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgICAgICAgICAgbWltZVR5cGUsXG4gICAgICAgICAgICAgICAgc2hhXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLnB1dERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcGx1Z2lucy9wbGF5bGlzdHMvJHtwbGF5bGlzdE5hbWV9YCwgcGF5bG9hZCk7XG59XG5leHBvcnRzLnB1dEl0ZW1Ub1BsYXlsaXN0ID0gcHV0SXRlbVRvUGxheWxpc3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXN0LmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDEgeC1pZD1cInRpdGxlXCIgY2xhc3M9XCJhbmltYXRlZC0tcXVpY2tcIj5SYWNjb29uPC9oMT5cbiAgICAgICAgPGg0IHgtaWQ9XCJzdWJUaXRsZVwiPlNlYXJjaCBmb3Igc29uZ3M8L2g0PlxuICAgICAgICA8Zm9ybSB4LWlkPVwiZm9ybVwiIGNsYXNzPVwibXVpLWZvcm0tLWlubGluZVwiPlxuICAgICAgICAgICAgPCEtLXRoaXMgaXMgYSBsaXR0bGUgaGFjayB0byBoYXZlIHRoaW5ncyBjZW50ZXJlZC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiPvCflI08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktdGV4dGZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHgtaWQ9XCJ0ZXJtXCIgdHlwZT1cInRleHRcIiBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIiBhdXRvZm9jdXM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gcm9sZT1cInN1Ym1pdFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+8J+UjTwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDxzcGFuPjxhIHgtaWQ9J2F1ZGlvTW9kZScgaHJlZj1cIiNcIj7wn462PC9hPiZuYnNwOzxhIHgtaWQ9J2ltYWdlTW9kZScgaHJlZj1cIiNcIj7vuI/wn46e77iPPC9hPjwvc3Bhbj5cbiAgICAgICAgPGJyIC8+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5zZWFyY2hQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBkaXNwbGF5VGl0bGU6ICh0ZW1wbGF0ZSwgZGlzcGxheWVkKSA9PiB7XG4gICAgICAgIGlmIChkaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLnRpdGxlLmNsYXNzTGlzdC5yZW1vdmUoJ2hleGEtLXJlZHVjZWQnKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLnN1YlRpdGxlLnN0eWxlLmRpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QuYWRkKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zdWJUaXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBNZXNzYWdlcyA9IHJlcXVpcmUoXCIuL21lc3NhZ2VzXCIpO1xuY29uc3Qgd2FpdCA9IChkdXJhdGlvbikgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKSk7XG5jb25zdCByYW5kID0gbWF4ID0+IE1hdGguZmxvb3IobWF4ICogTWF0aC5yYW5kb20oKSk7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDI+U2xpZGVzaG93PC9oMj5cbiAgICAgICAgPGRpdiB4LWlkPVwiaXRlbXNcIiBjbGFzcz1cIm11aS1wYW5lbCB4LXNsaWRlc2hvd1wiPjwvZGl2PlxuICAgICAgICBzcGVlZDogPGlucHV0IHgtaWQ9XCJzcGVlZFwiIHR5cGU9XCJyYW5nZVwiIG1pbj1cIjUwXCIgbWF4PVwiMzAwMFwiIHZhbHVlPVwiMjAwMFwiLz5cbiAgICAgICAgbmIgcm93czogPGlucHV0IHgtaWQ9XCJuYlJvd3NcIiB0eXBlPVwibnVtYmVyXCIgbWluPVwiMVwiIG1heD1cIjE1MFwiIHZhbHVlPVwiMVwiLz5cbiAgICAgICAgbmIgaW1hZ2VzOiA8aW5wdXQgeC1pZD1cIm5iSW1hZ2VzXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjFcIiBtYXg9XCIxMDBcIiB2YWx1ZT1cIjNcIi8+XG4gICAgICAgIGludGVydmFsOiA8aW5wdXQgeC1pZD1cImludGVydmFsXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjFcIiBtYXg9XCIzNjVcIiB2YWx1ZT1cIjE1XCIgdmFsdWU9XCI1MFwiLz5cbiAgICAgICAgPGlucHV0IHgtaWQ9XCJkYXRlXCIgdHlwZT1cInJhbmdlXCIgbWluPVwiLSR7MzY1ICogMjB9XCIgbWF4PVwiMFwiIHZhbHVlPVwiMFwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIi8+XG4gICAgICAgIDxkaXYgeC1pZD1cInJlbWFya1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBsZXQgZWxzID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpO1xuICAgIGNvbnN0IHJlbW92ZVJhbmRvbUltYWdlID0gKCkgPT4ge1xuICAgICAgICBsZXQgaW1hZ2VFbGVtZW50ID0gcGlja1JhbmRvbUltYWdlKCk7XG4gICAgICAgIGlmIChpbWFnZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSBpbWFnZUVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChpbWFnZUVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKCFwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHBhcmVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHBhcmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGltYWdlRWxlbWVudDtcbiAgICB9O1xuICAgIGNvbnN0IGFkZFJhbmRvbUltYWdlID0gKG5iRGVzaXJlZFJvd3MpID0+IHtcbiAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICBsZXQgcm93ID0gbnVsbDtcbiAgICAgICAgaWYgKGVscy5pdGVtcy5jaGlsZHJlbi5sZW5ndGggPCBuYkRlc2lyZWRSb3dzKSB7XG4gICAgICAgICAgICByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGVscy5pdGVtcy5hcHBlbmRDaGlsZChyb3cpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcm93ID0gZWxzLml0ZW1zLmNoaWxkcmVuLml0ZW0ocmFuZChlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcm93LmFwcGVuZENoaWxkKGltYWdlRWxlbWVudCk7XG4gICAgICAgIHJldHVybiBpbWFnZUVsZW1lbnQ7XG4gICAgfTtcbiAgICBjb25zdCBwaWNrUmFuZG9tSW1hZ2UgPSAoKSA9PiB7XG4gICAgICAgIGxldCBwb3NzaWJsZUVsZW1lbnRzID0gW107XG4gICAgICAgIGZvciAobGV0IHJvdyBvZiBlbHMuaXRlbXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGZvciAobGV0IGltZyBvZiByb3cuY2hpbGRyZW4pXG4gICAgICAgICAgICAgICAgcG9zc2libGVFbGVtZW50cy5wdXNoKGltZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwb3NzaWJsZUVsZW1lbnRzLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gcG9zc2libGVFbGVtZW50c1tyYW5kKHBvc3NpYmxlRWxlbWVudHMubGVuZ3RoKV07XG4gICAgfTtcbiAgICBjb25zdCBlbnVtSW1hZ2VzID0gKHMpID0+IHtcbiAgICAgICAgZm9yIChsZXQgcm93SWR4ID0gMDsgcm93SWR4IDwgZWxzLml0ZW1zLmNoaWxkcmVuLmxlbmd0aDsgcm93SWR4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IGVscy5pdGVtcy5jaGlsZHJlbi5pdGVtKHJvd0lkeCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHMuYWRkKHJvdy5jaGlsZHJlbi5pdGVtKGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaW1hZ2VzQ291bnQgPSAoKSA9PiB7XG4gICAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IGVscy5pdGVtcy5jaGlsZHJlbi5sZW5ndGg7IHJvd0lkeCsrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSBlbHMuaXRlbXMuY2hpbGRyZW4uaXRlbShyb3dJZHgpO1xuICAgICAgICAgICAgY291bnQgKz0gcm93LmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfTtcbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgcG9zc2libGVJbWFnZXMgPSBbXTtcbiAgICAgICAgbGV0IGxhc3RTZWFyY2hEYXRlID0gbnVsbDtcbiAgICAgICAgbGV0IGxhc3RTZWFyY2hJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIGxldCBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgbGV0IGZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgIGxldCB0b1JlbW92ZSA9IG5ldyBTZXQoKTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZUZyb21Ob3dJbk1zID0gKHBhcnNlSW50KGVscy5kYXRlLnZhbHVlIHx8ICcwJykpICogMTAwMCAqIDYwICogNjAgKiAyNDtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnZhbEluRGF5cyA9IHBhcnNlSW50KGVscy5pbnRlcnZhbC52YWx1ZSkgfHwgMTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnRlcnZhbEluTXMgPSBpbnRlcnZhbEluRGF5cyAqIDEwMDAgKiA2MCAqIDYwICogMjQ7XG4gICAgICAgICAgICAgICAgY29uc3QgbmJXYW50ZWRJbWFnZXMgPSBwYXJzZUludChlbHMubmJJbWFnZXMudmFsdWUpIHx8IDE7XG4gICAgICAgICAgICAgICAgY29uc3QgbmJEZXNpcmVkUm93cyA9IHBhcnNlSW50KGVscy5uYlJvd3MudmFsdWUpIHx8IDE7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2FpdER1cmF0aW9uSW5NcyA9IHBhcnNlSW50KGVscy5zcGVlZC52YWx1ZSkgfHwgMjAwMDtcbiAgICAgICAgICAgICAgICBsZXQgY2VudGVyID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgKyB0aW1lRnJvbU5vd0luTXM7XG4gICAgICAgICAgICAgICAgbGV0IGRvU2VhcmNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RTZWFyY2hEYXRlICE9IHRpbWVGcm9tTm93SW5NcyB8fCBsYXN0U2VhcmNoSW50ZXJ2YWwgIT0gaW50ZXJ2YWxJbk1zKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPZmZzZXQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBkb1NlYXJjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFsbCBjdXJyZW50IGltYWdlcyBhcmUgbm8gbW9yZSBwYXJ0IG9mIHRoZSBsYXN0IHNlYXJjaFxuICAgICAgICAgICAgICAgICAgICB0b1JlbW92ZSA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgZW51bUltYWdlcyh0b1JlbW92ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFwb3NzaWJsZUltYWdlcyB8fCAhcG9zc2libGVJbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvU2VhcmNoID0gIWZpbmlzaGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZG9TZWFyY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNlYXJjaERhdGUgPSB0aW1lRnJvbU5vd0luTXM7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWFyY2hJbnRlcnZhbCA9IGludGVydmFsSW5NcztcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYGRvIGEgc2VhcmNoIG9uICR7Y2VudGVyfSArLy0gJHtpbnRlcnZhbEluRGF5c30gQCAke2N1cnJlbnRPZmZzZXR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWFyY2hTcGVjID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWltZVR5cGU6ICdpbWFnZS8lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vRGlyZWN0b3J5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGltaXQ6IDEzLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBjdXJyZW50T2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZU1pbjogY2VudGVyIC0gaW50ZXJ2YWxJbk1zLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZU1heDogY2VudGVyICsgaW50ZXJ2YWxJbk1zXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBSZXN0LnNlYXJjaEV4KHNlYXJjaFNwZWMpO1xuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUltYWdlcyA9IHJlc3VsdHMgJiYgcmVzdWx0cy5pdGVtcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlSW1hZ2VzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRPZmZzZXQgKz0gcG9zc2libGVJbWFnZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQgPSBwb3NzaWJsZUltYWdlcy5sZW5ndGggPT0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHBvc3NpYmxlSW1hZ2VzICYmIHBvc3NpYmxlSW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBlbHMucmVtYXJrLmlubmVySFRNTCA9IGAke25ldyBEYXRlKGNlbnRlcikudG9EYXRlU3RyaW5nKCl9IDogJHtuYldhbnRlZEltYWdlc30gaW1hZ2VzIG9uICR7bmJEZXNpcmVkUm93c30gcm93cyArLy0gJHtpbnRlcnZhbEluRGF5c30gZGF5cyAoQCR7Y3VycmVudE9mZnNldH0pYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlc0NvdW50KCkgPiBuYldhbnRlZEltYWdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IHJlbW92ZVJhbmRvbUltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlLmhhcyhpbWFnZUVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1JlbW92ZS5kZWxldGUoaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlc0NvdW50KCkgPCBuYldhbnRlZEltYWdlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IGFkZFJhbmRvbUltYWdlKG5iRGVzaXJlZFJvd3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50ID0gcGlja1JhbmRvbUltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodG9SZW1vdmUuaGFzKGltYWdlRWxlbWVudCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VJbmRleCA9IHJhbmQocG9zc2libGVJbWFnZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBbdXNlZEltYWdlXSA9IHBvc3NpYmxlSW1hZ2VzLnNwbGljZShpbWFnZUluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VkSW1hZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50LnNyYyA9IFJlc3QuZ2V0U2hhSW1hZ2VUaHVtYm5haWxVcmwodXNlZEltYWdlLnNoYSwgdXNlZEltYWdlLm1pbWVUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxzLnJlbWFyay5pbm5lckhUTUwgPSBgJHtuZXcgRGF0ZShjZW50ZXIpLnRvRGF0ZVN0cmluZygpfSwgbm8gbW9yZSBpbWFnZSwgY2hhbmdlIHRoZSBjdXJzb3JzYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlLnNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUVsZW1lbnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0b1JlbW92ZS5mb3JFYWNoKGltYWdlRWxlbWVudCA9PiBpbWFnZUVsZW1lbnRzLnB1c2goaW1hZ2VFbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2VFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50ID0gaW1hZ2VFbGVtZW50c1tyYW5kKGltYWdlRWxlbWVudHMubGVuZ3RoKV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b1JlbW92ZS5kZWxldGUoaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB3YWl0KHdhaXREdXJhdGlvbkluTXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBlcnJvciBpbiBzbGlkZXNob3csIHdhaXRpbmcgNXNgLCAtMSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgd2FpdCg1MDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pKCk7XG4gICAgcmV0dXJuIGVscztcbn1cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2xpZGVzaG93LmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBlbGVtZW50c0RhdGEgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKG9iaiwgaHRtbCkge1xuICAgIGxldCByb290ID0gVWlUb29scy5lbEZyb21IdG1sKGh0bWwpO1xuICAgIG9ialsncm9vdCddID0gcm9vdDtcbiAgICBVaVRvb2xzLmVscyhyb290LCBgW3gtaWRdYCkuZm9yRWFjaChlID0+IG9ialtlLmdldEF0dHJpYnV0ZSgneC1pZCcpXSA9IGUpO1xuICAgIGlmIChyb290Lmhhc0F0dHJpYnV0ZSgneC1pZCcpKVxuICAgICAgICBvYmpbcm9vdC5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSByb290O1xuICAgIGVsZW1lbnRzRGF0YS5zZXQocm9vdCwgb2JqKTtcbiAgICByZXR1cm4gcm9vdDtcbn1cbmV4cG9ydHMuY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuO1xuZnVuY3Rpb24gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCkge1xuICAgIGNvbnN0IGRhdGEgPSBlbGVtZW50c0RhdGEuZ2V0KHJvb3QpO1xuICAgIHJldHVybiBkYXRhO1xufVxuZXhwb3J0cy5nZXRUZW1wbGF0ZUluc3RhbmNlRGF0YSA9IGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhO1xuZnVuY3Rpb24gY3JlYXRlVGVtcGxhdGVJbnN0YW5jZShodG1sKSB7XG4gICAgbGV0IHJvb3QgPSBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4oe30sIGh0bWwpO1xuICAgIHJldHVybiBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YShyb290KTtcbn1cbmV4cG9ydHMuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSA9IGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2U7XG5jb25zdCBFTVBUWV9MT0NBVElPTiA9IHsgZWxlbWVudDogbnVsbCwgY2hpbGRJbmRleDogLTEgfTtcbmZ1bmN0aW9uIHRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihlbGVtZW50cywgZXZlbnQpIHtcbiAgICBsZXQgZWxzID0gbmV3IFNldChPYmplY3QudmFsdWVzKGVsZW1lbnRzKSk7XG4gICAgbGV0IGMgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHAgPSBudWxsO1xuICAgIGRvIHtcbiAgICAgICAgaWYgKGVscy5oYXMoYykpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogYyxcbiAgICAgICAgICAgICAgICBjaGlsZEluZGV4OiBwICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYy5jaGlsZHJlbiwgcClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPT0gZWxlbWVudHMucm9vdClcbiAgICAgICAgICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbiAgICAgICAgcCA9IGM7XG4gICAgICAgIGMgPSBjLnBhcmVudEVsZW1lbnQ7XG4gICAgfSB3aGlsZSAoYyk7XG4gICAgcmV0dXJuIEVNUFRZX0xPQ0FUSU9OO1xufVxuZXhwb3J0cy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24gPSB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb247XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZXMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBlbChpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG59XG5leHBvcnRzLmVsID0gZWw7XG5mdW5jdGlvbiBlbHMoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn1cbmV4cG9ydHMuZWxzID0gZWxzO1xuZnVuY3Rpb24gZWxGcm9tSHRtbChodG1sKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcGFyZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIHBhcmVudC5jaGlsZHJlbi5pdGVtKDApO1xufVxuZXhwb3J0cy5lbEZyb21IdG1sID0gZWxGcm9tSHRtbDtcbmZ1bmN0aW9uIHN0b3BFdmVudChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5leHBvcnRzLnN0b3BFdmVudCA9IHN0b3BFdmVudDtcbmZ1bmN0aW9uKiBpdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50KHN0YXJ0KSB7XG4gICAgd2hpbGUgKHN0YXJ0KSB7XG4gICAgICAgIHlpZWxkIHN0YXJ0O1xuICAgICAgICBzdGFydCA9IHN0YXJ0LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxufVxuZXhwb3J0cy5pdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50ID0gaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVpLXRvb2wuanMubWFwIl0sInNvdXJjZVJvb3QiOiIifQ==
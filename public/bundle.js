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
let currentUnroller = null;
const template = `
    <div class="x-image-detail">
        <img x-id="image"/>
        <div x-id="toolbar">
        <button x-id="previous" class="mui-btn mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button x-id="next" class="mui-btn mui-btn--flat">Next</button>
        <button x-id="diaporama" class="mui-btn mui-btn--flat">Diaporama</button>
        </div>
    </div>`;
const element = templates_1.createTemplateInstance(template);
element.previous.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (currentUnroller) {
        let previousItem = currentUnroller.previous();
        if (previousItem)
            showInternal(previousItem);
    }
});
element.next.addEventListener('click', event => {
    UiTool.stopEvent(event);
    showNext();
});
function showNext() {
    if (currentUnroller) {
        let nextItem = currentUnroller.next();
        if (nextItem)
            showInternal(nextItem);
    }
}
let diaporamaTimer = null;
element.diaporama.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (diaporamaTimer) {
        stopDiaporama();
        return;
    }
    diaporamaTimer = setInterval(() => showNext(), 2000);
    if (currentUnroller) {
        let nextItem = currentUnroller.next();
        if (nextItem)
            showInternal(nextItem);
    }
});
function stopDiaporama() {
    if (diaporamaTimer) {
        clearInterval(diaporamaTimer);
        diaporamaTimer = null;
    }
}
element.close.addEventListener('click', event => {
    UiTool.stopEvent(event);
    stopDiaporama();
    currentUnroller = null;
    document.body.querySelector('header').style.display = undefined;
    if (!element.root.isConnected)
        return;
    element.root.parentElement.removeChild(element.root);
});
function show(item, unroller) {
    currentUnroller = unroller;
    showInternal(item);
}
exports.show = show;
function showInternal(item) {
    document.body.querySelector('header').style.display = 'none';
    if (!element.root.isConnected)
        document.body.appendChild(element.root);
    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType);
    element.image.alt = item.name;
}
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
        let unrolledItems = lastDisplayedFiles;
        let currentPosition = childIndex;
        const nextPosition = (direction) => {
            let nextPosition = currentPosition + direction;
            while (nextPosition >= 0 && nextPosition < unrolledItems.length && !unrolledItems[nextPosition].mimeType.startsWith('image/')) {
                nextPosition += direction;
            }
            if (nextPosition >= 0 && nextPosition < unrolledItems.length) {
                currentPosition = nextPosition;
                return unrolledItems[nextPosition];
            }
            return null;
        };
        ImageDetails.show(item, {
            next: () => nextPosition(1),
            previous: () => nextPosition(-1)
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2h0bWwtc25pcHBldHMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2ltYWdlLWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZm8tcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL21lc3NhZ2VzLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9taW1lLXR5cGVzLW1vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbmV0d29yay5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zbGlkZXNob3cuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3RlbXBsYXRlcy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdWktdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFrQjtBQUMxRTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsZ0NBQWdDLEtBQUssZUFBZSxhQUFhLGNBQWMsWUFBWSxlQUFlLFVBQVUsY0FBYztBQUNoTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsZ0NBQWdDO0FBQzlFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQ3RLQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsZ0JBQWdCLG1CQUFPLENBQUMsc0NBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHFDOzs7Ozs7Ozs7Ozs7QUM1Q0EsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3B1YmxpYy9pbmRleC5qc1wiKTtcbiIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgTWltZVR5cGVzID0gcmVxdWlyZShcIi4vbWltZS10eXBlcy1tb2R1bGVcIik7XG5jb25zdCBNZXNzYWdlcyA9IHJlcXVpcmUoXCIuL21lc3NhZ2VzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz1cImF1ZGlvLWZvb3RlciBtdWktcGFuZWxcIj5cbiAgICA8aDMgY2xhc3M9XCJ4LXdoZW4tbGFyZ2UtZGlzcGxheVwiPlBsYXlsaXN0PC9oMz5cbiAgICA8ZGl2IHgtaWQ9XCJwbGF5bGlzdFwiPjwvZGl2PlxuICAgIDxkaXYgeC1pZD1cImV4cGFuZGVyXCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1jZW50ZXJcIj7imLA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwieC1ob3Jpem9udGFsLWZsZXhcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCI+XG4gICAgICAgIDxhdWRpbyB4LWlkPVwicGxheWVyXCIgY2xhc3M9XCJhdWRpby1wbGF5ZXJcIiBjb250cm9scyBwcmVsb2FkPVwibWV0YWRhdGFcIj48L2F1ZGlvPlxuICAgICAgICA8YSB4LWlkPVwiYWRkUGxheWxpc3RCdXR0b25cIiBocmVmPVwiI3RvdG9cIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmFiXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmY0MDgxNzM7IGNvbG9yOiB3aGl0ZTtcIj4rIFBMLjwvYT48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIFJlc3QuZ2V0U2hhQ29udGVudFVybChzaGEsIG1pbWVUeXBlLCBuYW1lLCBmYWxzZSwgZmFsc2UpKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgndHlwZScsIG1pbWVUeXBlKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnBsYXkoKTtcbiAgICAgICAgZWxlbWVudHMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpO1xuICAgIH0sXG59O1xuY2xhc3MgQXVkaW9KdWtlYm94IHtcbiAgICBjb25zdHJ1Y3RvcihhdWRpb1BhbmVsKSB7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbCA9IGF1ZGlvUGFuZWw7XG4gICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgLy8gaWYgc2Nyb2xsIHRvIHBsYXlpbmcgaXRlbSBpcyByZXF1aXJlZCBhZnRlciBhIHBsYXlsaXN0IHJlZHJhd1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHF1ZXVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncGxheWxpc3QtYmFja3VwJykpO1xuICAgICAgICAgICAgaWYgKHF1ZXVlICYmIHF1ZXVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yIGxvYWRpbmcgcXVldWUgZnJvbSBsb2NhbCBzdG9yYWdlYCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMgPSBVaVRvb2xzLmVscyh0aGlzLmF1ZGlvUGFuZWwucm9vdCwgJy54LXdoZW4tbGFyZ2UtZGlzcGxheScpO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBhdWRpbyBwbGF5ZXIgZXJyb3JgKTtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RhbGxlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbGVkLCB0cnkgbmV4dCcpO1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmV4cGFuZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSAhdGhpcy5sYXJnZURpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBVaVRvb2xzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QXR0ciA9IGUuZ2V0QXR0cmlidXRlKCd4LXF1ZXVlLWluZGV4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleEF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4QXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gTmFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmFkZFBsYXlsaXN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBVaVRvb2xzLnN0b3BFdmVudChldmVudCk7XG4gICAgICAgICAgICBjb25zdCBwbGF5bGlzdCA9ICdmYXZvcml0ZXMnOyAvLyB0b2RvIHNob3VsZCBiZSBhIHBhcmFtZXRlci4uLlxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQ2Fubm90IGFkZCB0byBwbGF5bGlzdCwgbm90aGluZyBwbGF5aW5nYCwgLTEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBNaW1lVHlwZXMuZXh0ZW5zaW9uRnJvbU1pbWVUeXBlKGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgYXdhaXQgUmVzdC5wdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdCwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGAke2l0ZW0ubmFtZX0uJHtleHRlbnNpb259YCk7XG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShg8J+RjSAke2l0ZW0ubmFtZX0gYWRkZWQgdG8gcGxheWxpc3QgJyR7cGxheWxpc3R9J2AsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgY3VycmVudEl0ZW0oKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IDAgfHwgdGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgIH1cbiAgICBhZGRBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaXRlbSA9IHtcbiAgICAgICAgICAgIHNoYTogaXRlbS5zaGEsXG4gICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICBtaW1lVHlwZTogaXRlbS5taW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGlmIChjdXJyZW50SXRlbSAmJiBjdXJyZW50SXRlbS5zaGEgPT0gaXRlbS5zaGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMucHVzaFF1ZXVlQW5kUGxheShpdGVtKTtcbiAgICB9XG4gICAgcGxheU5leHQoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCArIDEgPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRoaXMuY3VycmVudEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBsYXlOZXh0VW5yb2xsZWQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5TmV4dFVucm9sbGVkKCkge1xuICAgICAgICBpZiAodGhpcy5pdGVtVW5yb2xsZXIpIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5pdGVtVW5yb2xsZXIudW5yb2xsKCk7XG4gICAgICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0SXRlbVVucm9sbGVyKGl0ZW1VbnJvbGxlcikge1xuICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IGl0ZW1VbnJvbGxlcjtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgcHVzaFF1ZXVlQW5kUGxheShpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGl0ZW0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncGxheWxpc3QtYmFja3VwJywgSlNPTi5zdHJpbmdpZnkodGhpcy5xdWV1ZSkpO1xuICAgICAgICB0aGlzLnBsYXkodGhpcy5xdWV1ZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgcGxheShpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucXVldWVbaW5kZXhdO1xuICAgICAgICAgICAgZXhwb3J0cy5hdWRpb1BhbmVsLnBsYXkodGhpcy5hdWRpb1BhbmVsLCBpdGVtLm5hbWUsIGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFt4LWZvci1zaGE9JyR7aXRlbS5zaGEuc3Vic3RyKDAsIDUpfSddYCkuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LmFkZCgnaXMtd2VpZ2h0ZWQnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAodGhpcy5yZWZyZXNoVGltZXIpXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZWZyZXNoVGltZXIpO1xuICAgICAgICB0aGlzLnJlZnJlc2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZWFsUmVmcmVzaFBsYXlsaXN0KCksIDEwKTtcbiAgICB9XG4gICAgcmVhbFJlZnJlc2hQbGF5bGlzdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnF1ZXVlIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5KVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj5UaGVyZSBhcmUgbm8gaXRlbXMgaW4geW91ciBwbGF5bGlzdC4gQ2xpY2sgb24gc29uZ3MgdG8gcGxheSB0aGVtLjwvc3Bhbj4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaHRtbCA9IGBgO1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMucXVldWVbaV07XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwoaSwgaXRlbS5uYW1lLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj48YSB4LWlkPSdjbGVhci1wbGF5bGlzdCcgaHJlZj0nIyc+Y2xlYXIgcGxheWxpc3Q8L2E+PC9kaXY+YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gMCAmJiB0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwodGhpcy5jdXJyZW50SW5kZXgsIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdLm5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5jdXJyZW50SW5kZXggKyAxfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj5mb2xsb3dlZCBieSAnJHt0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4ICsgMV0ubmFtZS5zdWJzdHIoMCwgMjApfScgLi4uPC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIC8vIGFmdGVyIHJlZnJlc2ggc3RlcHNcbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5ICYmIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsVG9wID0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5bGlzdEl0ZW1IdG1sKGluZGV4LCBuYW1lLCBvbmVMaW5lVGV4dCkge1xuICAgICAgICByZXR1cm4gYDxkaXYgeC1xdWV1ZS1pbmRleD1cIiR7aW5kZXh9XCIgY2xhc3M9XCJvbmNsaWNrICR7b25lTGluZVRleHQgPyAnaXMtb25lbGluZXRleHQnIDogJyd9ICR7aW5kZXggPT0gdGhpcy5jdXJyZW50SW5kZXggPyAnbXVpLS10ZXh0LWhlYWRsaW5lJyA6ICcnfVwiPiR7bmFtZX08L2Rpdj5gO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9KdWtlYm94ID0gQXVkaW9KdWtlYm94O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXVkaW8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmZ1bmN0aW9uIHdhaXQoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKSk7XG59XG5sZXQgYXV0aGVudGljYXRlZFVzZXIgPSBudWxsO1xuY2xhc3MgQXV0aCB7XG4gICAgb25FcnJvcigpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgICBhc3luYyBsb29wKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci9hdXRoYCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXMgPSBhd2FpdCBOZXR3b3JrLmdldERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL3dlbGwta25vd24vdjEvc2V0Q29va2llYCwgeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtyZXNwb25zZS50b2tlbn1gIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcyB8fCAhcmVzLmxpZmV0aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3Qgc2V0Q29va2llYCwgcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGF1dGhlbnRpY2F0ZWRVc2VyID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL21lYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3Qgb2J0YWluIGF1dGggdG9rZW5gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCByZWZyZXNoIGF1dGggKCR7ZXJyfSlgKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGV2ZXJ5IDMwIG1pbnV0ZXNcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAwMCAqIDYwICogMzApO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXV0b1JlbmV3QXV0aCgpIHtcbiAgICBsZXQgYXV0aCA9IG5ldyBBdXRoKCk7XG4gICAgYXV0aC5sb29wKCk7XG59XG5leHBvcnRzLmF1dG9SZW5ld0F1dGggPSBhdXRvUmVuZXdBdXRoO1xuYXN5bmMgZnVuY3Rpb24gbWUoKSB7XG4gICAgaWYgKCFhdXRoZW50aWNhdGVkVXNlcilcbiAgICAgICAgYXV0aGVudGljYXRlZFVzZXIgPSBhd2FpdCBOZXR3b3JrLmdldERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL3dlbGwta25vd24vdjEvbWVgKTtcbiAgICByZXR1cm4gYXV0aGVudGljYXRlZFVzZXI7XG59XG5leHBvcnRzLm1lID0gbWU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRoLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFNuaXBwZXRzID0gcmVxdWlyZShcIi4vaHRtbC1zbmlwcGV0c1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXInPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMiB4LWlkPVwidGl0bGVcIj48L2gyPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJpdGVtc1wiIGNsYXNzPVwibXVpLXBhbmVsXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5kaXJlY3RvcnlQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBzZXRMb2FkaW5nOiAoZWxlbWVudHMsIHRpdGxlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGBMb2FkaW5nICcke3RpdGxlfScgLi4uYDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYGA7XG4gICAgfSxcbiAgICBkaXNwbGF5U2VhcmNoaW5nOiAoZWxlbWVudHMsIHRlcm0pID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+U2VhcmNoaW5nICcke3Rlcm19JyAuLi48L2Rpdj5gO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSBgYDtcbiAgICB9LFxuICAgIHNldFZhbHVlczogKGVsZW1lbnRzLCB2YWx1ZXMpID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYCR7dmFsdWVzLm5hbWV9YDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuY2xhc3NMaXN0LnJlbW92ZSgneC1pbWFnZS1wYW5lbCcpO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5jbGFzc0xpc3QuYWRkKCd4LWl0ZW1zLXBhbmVsJyk7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChTbmlwcGV0cy5pdGVtVG9IdG1sKS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzZXRJbWFnZXM6IChlbGVtZW50cywgdmFsdWVzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IHZhbHVlcy50ZXJtO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5jbGFzc0xpc3QuYWRkKCd4LWltYWdlLXBhbmVsJyk7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmNsYXNzTGlzdC5yZW1vdmUoJ3gtaXRlbXMtcGFuZWwnKTtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgICAgIGlmIChpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2PjxpbWcgY2xhc3M9XCJ4LWltYWdlLXpvb20tYWN0aW9uIG9uY2xpY2tcIiBsb2FkaW5nPVwibGF6eVwiIHNyYz1cImJsYW5rLmpwZWdcIiBkYXRhLXNyYz1cIiR7UmVzdC5nZXRTaGFJbWFnZVRodW1ibmFpbFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSl9XCIvPjwvZGl2PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxkaXY+JHtTbmlwcGV0cy5pdGVtVG9IdG1sKGl0ZW0pfTwvZGl2PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICBsZXQgbmJGaXJzdCA9IDI1O1xuICAgICAgICBsZXQgdGltZUFmdGVyID0gMjAwMDtcbiAgICAgICAgbGV0IHRvT2JzZXJ2ZSA9IHZhbHVlcy5pdGVtc1xuICAgICAgICAgICAgLm1hcCgoaXRlbSwgaW5kZXgpID0+ICh7IGl0ZW0sIGluZGV4IH0pKVxuICAgICAgICAgICAgLmZpbHRlcihlID0+IGUuaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSk7XG4gICAgICAgIGxldCBsYXp5SW1hZ2VPYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihmdW5jdGlvbiAoZW50cmllcywgb2JzZXJ2ZXIpIHtcbiAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhenlJbWFnZSA9IGVudHJ5LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgbGF6eUltYWdlLnNyYyA9IGxhenlJbWFnZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgIGxhenlJbWFnZU9ic2VydmVyLnVub2JzZXJ2ZShsYXp5SW1hZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdG9PYnNlcnZlLnNsaWNlKDAsIG5iRmlyc3QpLmZvckVhY2goZSA9PiBsYXp5SW1hZ2VPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnRzLml0ZW1zLmNoaWxkcmVuLml0ZW0oZS5pbmRleCkuY2hpbGRyZW4uaXRlbSgwKSkpO1xuICAgICAgICBpZiAodG9PYnNlcnZlLmxlbmd0aCA+IG5iRmlyc3QpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRvT2JzZXJ2ZS5zbGljZShuYkZpcnN0KS5mb3JFYWNoKGUgPT4gbGF6eUltYWdlT2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50cy5pdGVtcy5jaGlsZHJlbi5pdGVtKGUuaW5kZXgpLmNoaWxkcmVuLml0ZW0oMCkpKTtcbiAgICAgICAgICAgIH0sIHRpbWVBZnRlcik7XG4gICAgICAgIH1cbiAgICB9LFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRpcmVjdG9yeS1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuZnVuY3Rpb24gaXRlbVRvSHRtbChmKSB7XG4gICAgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcmVmZXJlbmNlJylcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwib25jbGlja1wiPjxpPiR7Zi5uYW1lfSAuLi48L2k+PC9kaXY+YDtcbiAgICBlbHNlIGlmIChmLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9wbGF5bGlzdCcpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSlcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEgJiYgZi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPiR7Zi5uYW1lfTwvZGl2PmA7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYSAmJiBmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+PGEgaHJlZj1cIiR7UmVzdC5nZXRTaGFDb250ZW50VXJsKGYuc2hhLCBmLm1pbWVUeXBlLCBmLm5hbWUsIHRydWUsIGZhbHNlKX1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2YubmFtZX08L2E+IDxhIGNsYXNzPVwieC1pbmZvLWRpc3BsYXktYWN0aW9uIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiIGhyZWY9XCIjXCI+aW5mbzwvYT48L2Rpdj5gO1xufVxuZXhwb3J0cy5pdGVtVG9IdG1sID0gaXRlbVRvSHRtbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWh0bWwtc25pcHBldHMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgVWlUb29sID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmxldCBjdXJyZW50VW5yb2xsZXIgPSBudWxsO1xuY29uc3QgdGVtcGxhdGUgPSBgXG4gICAgPGRpdiBjbGFzcz1cIngtaW1hZ2UtZGV0YWlsXCI+XG4gICAgICAgIDxpbWcgeC1pZD1cImltYWdlXCIvPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJ0b29sYmFyXCI+XG4gICAgICAgIDxidXR0b24geC1pZD1cInByZXZpb3VzXCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIj5QcmV2aW91czwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJjbG9zZVwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+Q2xvc2U8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB4LWlkPVwibmV4dFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+TmV4dDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJkaWFwb3JhbWFcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPkRpYXBvcmFtYTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gO1xuY29uc3QgZWxlbWVudCA9IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGUpO1xuZWxlbWVudC5wcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoY3VycmVudFVucm9sbGVyKSB7XG4gICAgICAgIGxldCBwcmV2aW91c0l0ZW0gPSBjdXJyZW50VW5yb2xsZXIucHJldmlvdXMoKTtcbiAgICAgICAgaWYgKHByZXZpb3VzSXRlbSlcbiAgICAgICAgICAgIHNob3dJbnRlcm5hbChwcmV2aW91c0l0ZW0pO1xuICAgIH1cbn0pO1xuZWxlbWVudC5uZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIHNob3dOZXh0KCk7XG59KTtcbmZ1bmN0aW9uIHNob3dOZXh0KCkge1xuICAgIGlmIChjdXJyZW50VW5yb2xsZXIpIHtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gY3VycmVudFVucm9sbGVyLm5leHQoKTtcbiAgICAgICAgaWYgKG5leHRJdGVtKVxuICAgICAgICAgICAgc2hvd0ludGVybmFsKG5leHRJdGVtKTtcbiAgICB9XG59XG5sZXQgZGlhcG9yYW1hVGltZXIgPSBudWxsO1xuZWxlbWVudC5kaWFwb3JhbWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgaWYgKGRpYXBvcmFtYVRpbWVyKSB7XG4gICAgICAgIHN0b3BEaWFwb3JhbWEoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkaWFwb3JhbWFUaW1lciA9IHNldEludGVydmFsKCgpID0+IHNob3dOZXh0KCksIDIwMDApO1xuICAgIGlmIChjdXJyZW50VW5yb2xsZXIpIHtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gY3VycmVudFVucm9sbGVyLm5leHQoKTtcbiAgICAgICAgaWYgKG5leHRJdGVtKVxuICAgICAgICAgICAgc2hvd0ludGVybmFsKG5leHRJdGVtKTtcbiAgICB9XG59KTtcbmZ1bmN0aW9uIHN0b3BEaWFwb3JhbWEoKSB7XG4gICAgaWYgKGRpYXBvcmFtYVRpbWVyKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoZGlhcG9yYW1hVGltZXIpO1xuICAgICAgICBkaWFwb3JhbWFUaW1lciA9IG51bGw7XG4gICAgfVxufVxuZWxlbWVudC5jbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBzdG9wRGlhcG9yYW1hKCk7XG4gICAgY3VycmVudFVucm9sbGVyID0gbnVsbDtcbiAgICBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpLnN0eWxlLmRpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgaWYgKCFlbGVtZW50LnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIHJldHVybjtcbiAgICBlbGVtZW50LnJvb3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LnJvb3QpO1xufSk7XG5mdW5jdGlvbiBzaG93KGl0ZW0sIHVucm9sbGVyKSB7XG4gICAgY3VycmVudFVucm9sbGVyID0gdW5yb2xsZXI7XG4gICAgc2hvd0ludGVybmFsKGl0ZW0pO1xufVxuZXhwb3J0cy5zaG93ID0gc2hvdztcbmZ1bmN0aW9uIHNob3dJbnRlcm5hbChpdGVtKSB7XG4gICAgZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCdoZWFkZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGlmICghZWxlbWVudC5yb290LmlzQ29ubmVjdGVkKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW1lbnQucm9vdCk7XG4gICAgZWxlbWVudC5pbWFnZS5zcmMgPSBSZXN0LmdldFNoYUltYWdlTWVkaXVtVGh1bWJuYWlsVXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKTtcbiAgICBlbGVtZW50LmltYWdlLmFsdCA9IGl0ZW0ubmFtZTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWltYWdlLWRldGFpbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1wYW5lbFwiKTtcbmNvbnN0IEF1ZGlvUGFuZWwgPSByZXF1aXJlKFwiLi9hdWRpby1wYW5lbFwiKTtcbmNvbnN0IERpcmVjdG9yeVBhbmVsID0gcmVxdWlyZShcIi4vZGlyZWN0b3J5LXBhbmVsXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBBdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbmNvbnN0IFRlbXBsYXRlcyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IE1pbWVUeXBlcyA9IHJlcXVpcmUoXCIuL21pbWUtdHlwZXMtbW9kdWxlXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IFNsaWRlc2hvdyA9IHJlcXVpcmUoXCIuL3NsaWRlc2hvd1wiKTtcbmNvbnN0IEluZm9QYW5lbCA9IHJlcXVpcmUoXCIuL2luZm8tcGFuZWxcIik7XG5jb25zdCBJbWFnZURldGFpbHMgPSByZXF1aXJlKFwiLi9pbWFnZS1kZXRhaWxcIik7XG4vKlxuaGFzaCB1cmxzIDpcblxuLSAnJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIy8nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIy9zZWFyY2gvOnRlcm0gICAgICAgICAgICAgICAgICAgc2VhcmNoXG4tICcjL2RpcmVjdG9yaWVzLzpzaGE/bmFtZT14eHggICAgICBkaXJlY3Rvcnlcbi0gJyMvYnJvd3NlJ1xuLSAnIy9yZWZzLzpuYW1lJ1xuKi9cbmZ1bmN0aW9uIHBhcnNlVVJMKHVybCkge1xuICAgIHZhciBwYXJzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyksIHNlYXJjaE9iamVjdCA9IHt9LCBxdWVyaWVzLCBzcGxpdCwgaTtcbiAgICAvLyBMZXQgdGhlIGJyb3dzZXIgZG8gdGhlIHdvcmtcbiAgICBwYXJzZXIuaHJlZiA9IHVybDtcbiAgICAvLyBDb252ZXJ0IHF1ZXJ5IHN0cmluZyB0byBvYmplY3RcbiAgICBxdWVyaWVzID0gcGFyc2VyLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpLnNwbGl0KCcmJyk7XG4gICAgZm9yIChpID0gMDsgaSA8IHF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3BsaXQgPSBxdWVyaWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgIHNlYXJjaE9iamVjdFtzcGxpdFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQoc3BsaXRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRobmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHBhcnNlci5wYXRobmFtZSksXG4gICAgICAgIHNlYXJjaE9iamVjdDogc2VhcmNoT2JqZWN0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlYWRIYXNoQW5kQWN0KCkge1xuICAgIGxldCBoaWRlQXVkaW9KdWtlYm94ID0gZmFsc2U7XG4gICAgbGV0IGhpZGVJbmZvUGFuZWwgPSB0cnVlO1xuICAgIGxldCBoYXNoID0gJyc7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyMnKSlcbiAgICAgICAgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgICBsZXQgcGFyc2VkID0gcGFyc2VVUkwoaGFzaCk7XG4gICAgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvc2VhcmNoLycpKSB7XG4gICAgICAgIHNlYXJjaEl0ZW1zKHBhcnNlZC5wYXRobmFtZS5zdWJzdHIoJy9zZWFyY2gvJy5sZW5ndGgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9kaXJlY3Rvcmllcy8nKSkge1xuICAgICAgICBjb25zdCBzaGEgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvZGlyZWN0b3JpZXMvJy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyc2VkLnNlYXJjaE9iamVjdC5uYW1lIHx8IHNoYTtcbiAgICAgICAgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgICAgICBzaXplOiAwLFxuICAgICAgICAgICAgc2hhLFxuICAgICAgICAgICAgbmFtZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lID09ICcvYnJvd3NlJykge1xuICAgICAgICBsb2FkUmVmZXJlbmNlcygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3JlZnMvJykpIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnNlZC5wYXRobmFtZS5zdWJzdHJpbmcoJy9yZWZzLycubGVuZ3RoKTtcbiAgICAgICAgbG9hZFJlZmVyZW5jZShuYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lID09ICcvcGxheWxpc3RzJykge1xuICAgICAgICBsb2FkUGxheWxpc3RzKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvcGxheWxpc3RzLycpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvcGxheWxpc3RzLycubGVuZ3RoKTtcbiAgICAgICAgbG9hZFBsYXlsaXN0KG5hbWUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUgPT0gJy9zbGlkZXNob3cnKSB7XG4gICAgICAgIGhpZGVBdWRpb0p1a2Vib3ggPSB0cnVlO1xuICAgICAgICBzaG93U2xpZGVzaG93KCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvaW5mby8nKSkge1xuICAgICAgICBoaWRlSW5mb1BhbmVsID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBKU09OLnBhcnNlKHBhcnNlZC5wYXRobmFtZS5zdWJzdHJpbmcoJy9pbmZvLycubGVuZ3RoKSk7XG4gICAgICAgIHNob3dJbmZvKGl0ZW0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coYHVua293biBwYXRoICR7cGFyc2VkLnBhdGhuYW1lfWApO1xuICAgIH1cbiAgICBpZiAoaGlkZUluZm9QYW5lbClcbiAgICAgICAgSW5mb1BhbmVsLmhpZGUoKTtcbiAgICBpZiAoaGlkZUF1ZGlvSnVrZWJveClcbiAgICAgICAgYXVkaW9QYW5lbC5yb290LmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpO1xuICAgIGVsc2VcbiAgICAgICAgYXVkaW9QYW5lbC5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpO1xufVxudmFyIE1vZGU7XG4oZnVuY3Rpb24gKE1vZGUpIHtcbiAgICBNb2RlW01vZGVbXCJBdWRpb1wiXSA9IDBdID0gXCJBdWRpb1wiO1xuICAgIE1vZGVbTW9kZVtcIkltYWdlXCJdID0gMV0gPSBcIkltYWdlXCI7XG59KShNb2RlIHx8IChNb2RlID0ge30pKTtcbmNvbnN0IHNlYXJjaFBhbmVsID0gU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuY3JlYXRlKCk7XG5jb25zdCBhdWRpb1BhbmVsID0gQXVkaW9QYW5lbC5hdWRpb1BhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9KdWtlYm94ID0gbmV3IEF1ZGlvUGFuZWwuQXVkaW9KdWtlYm94KGF1ZGlvUGFuZWwpO1xuY29uc3QgZGlyZWN0b3J5UGFuZWwgPSBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5jcmVhdGUoKTtcbmxldCBzbGlkZXNob3cgPSBudWxsO1xubGV0IGxhc3REaXNwbGF5ZWRGaWxlcyA9IG51bGw7XG5sZXQgbGFzdFNlYXJjaFRlcm0gPSBudWxsOyAvLyBIQUNLIHZlcnkgdGVtcG9yYXJ5XG5sZXQgYWN0dWFsQ29udGVudCA9IG51bGw7XG5sZXQgY3VycmVudE1vZGUgPSBNb2RlLkF1ZGlvO1xuZnVuY3Rpb24gc2V0Q29udGVudChjb250ZW50KSB7XG4gICAgaWYgKGNvbnRlbnQgPT09IGFjdHVhbENvbnRlbnQpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAoYWN0dWFsQ29udGVudClcbiAgICAgICAgYWN0dWFsQ29udGVudC5wYXJlbnRFbGVtZW50ICYmIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChhY3R1YWxDb250ZW50KTtcbiAgICBhY3R1YWxDb250ZW50ID0gY29udGVudDtcbiAgICBpZiAoYWN0dWFsQ29udGVudClcbiAgICAgICAgVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoY29udGVudCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xufVxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdWRpb1BhbmVsLnJvb3QpO1xuVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoc2VhcmNoUGFuZWwucm9vdCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xuQXV0aC5hdXRvUmVuZXdBdXRoKCk7XG4vKipcbiAqIFdhaXRlciB0b29sXG4gKi9cbmNvbnN0IGJlZ2luV2FpdCA9IChjYWxsYmFjaykgPT4ge1xuICAgIGxldCBpc0RvbmUgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGlzRG9uZSB8fCBjYWxsYmFjaygpLCA1MDApO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgICAgIGlzRG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbi8qKlxuICogRXZlbnRzXG4gKi9cbmZ1bmN0aW9uIGJlYXV0aWZ5TmFtZXMoaXRlbXMpIHtcbiAgICByZXR1cm4gaXRlbXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBpZiAoZmlsZS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICAgICAgbGV0IGRvdCA9IGZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICAgICAgaWYgKGRvdClcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUuc3Vic3RyaW5nKDAsIGRvdCk7XG4gICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvJ18nL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvJyAgJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1sgXSotWyBdKi9nLCAnIC0gJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBnb1NoYUluZm8oaXRlbSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYCMvaW5mby8ke2VuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShpdGVtKSl9YDtcbn1cbmZ1bmN0aW9uIGdvU2VhcmNoSXRlbXModGVybSkge1xuICAgIGNvbnN0IHVybCA9IGAjL3NlYXJjaC8ke3Rlcm19YDtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbn1cbmZ1bmN0aW9uIGdvTG9hZERpcmVjdG9yeShzaGEsIG5hbWUpIHtcbiAgICBjb25zdCB1cmwgPSBgIy9kaXJlY3Rvcmllcy8ke3NoYX0/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChsYXN0U2VhcmNoVGVybSA/IChsYXN0U2VhcmNoVGVybSArICcvJyArIG5hbWUpIDogbmFtZSl9YDtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbn1cbmZ1bmN0aW9uIGdvUmVmZXJlbmNlKG5hbWUpIHtcbiAgICBjb25zdCB1cmwgPSBgIy9yZWZzLyR7bmFtZX1gO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xufVxuZnVuY3Rpb24gZ29QbGF5bGlzdChuYW1lKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgIy9wbGF5bGlzdHMvJHtuYW1lfWA7XG59XG5hc3luYyBmdW5jdGlvbiBzZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuZGlzcGxheVRpdGxlKHNlYXJjaFBhbmVsLCBmYWxzZSk7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgU3RpbGwgc2VhcmNoaW5nICcke3Rlcm19JyAuLi5gLCAwKSk7XG4gICAgbGV0IG1pbWVUeXBlID0gJyUnO1xuICAgIHN3aXRjaCAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgY2FzZSBNb2RlLkF1ZGlvOlxuICAgICAgICAgICAgbWltZVR5cGUgPSAnYXVkaW8vJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNb2RlLkltYWdlOlxuICAgICAgICAgICAgbWltZVR5cGUgPSAnaW1hZ2UvJSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IHJlcyA9IGF3YWl0IFJlc3Quc2VhcmNoKHRlcm0sIG1pbWVUeXBlKTtcbiAgICBpZiAoIXJlcykge1xuICAgICAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEVycm9yIG9jY3VycmVkLCByZXRyeSBwbGVhc2UuLi5gLCAtMSk7XG4gICAgfVxuICAgIC8vIGZpcnN0IGZpbGVzIHRoZW4gZGlyZWN0b3JpZXNcbiAgICByZXMuaXRlbXMgPSByZXMuaXRlbXNcbiAgICAgICAgLmZpbHRlcihpID0+IGkubWltZVR5cGUgIT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpXG4gICAgICAgIC5jb25jYXQocmVzLml0ZW1zLmZpbHRlcihpID0+IGkubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpKTtcbiAgICByZXMuaXRlbXMgPSBiZWF1dGlmeU5hbWVzKHJlcy5pdGVtcyk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gcmVzLml0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gdGVybTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIHN3aXRjaCAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgY2FzZSBNb2RlLkF1ZGlvOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogYFJlc3VsdHMgZm9yICcke3Rlcm19J2AsXG4gICAgICAgICAgICAgICAgaXRlbXM6IHJlcy5pdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNb2RlLkltYWdlOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0SW1hZ2VzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgdGVybTogdGVybSxcbiAgICAgICAgICAgICAgICBpdGVtczogcmVzLml0ZW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGxldCB0ZXJtID0gc2VhcmNoUGFuZWwudGVybS52YWx1ZTtcbiAgICBzZWFyY2hQYW5lbC50ZXJtLmJsdXIoKTtcbiAgICBnb1NlYXJjaEl0ZW1zKHRlcm0pO1xufSk7XG5mdW5jdGlvbiBnZXRNaW1lVHlwZShmKSB7XG4gICAgaWYgKGYuaXNEaXJlY3RvcnkpXG4gICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JztcbiAgICBsZXQgcG9zID0gZi5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIGxldCBleHRlbnNpb24gPSBmLm5hbWUuc3Vic3RyKHBvcyArIDEpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChleHRlbnNpb24gaW4gTWltZVR5cGVzLk1pbWVUeXBlcylcbiAgICAgICAgICAgIHJldHVybiBNaW1lVHlwZXMuTWltZVR5cGVzW2V4dGVuc2lvbl07XG4gICAgfVxuICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbn1cbmZ1bmN0aW9uIGRpcmVjdG9yeURlc2NyaXB0b3JUb0ZpbGVEZXNjcmlwdG9yKGQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaGE6IGQuY29udGVudFNoYSxcbiAgICAgICAgbmFtZTogZC5uYW1lLFxuICAgICAgICBtaW1lVHlwZTogZ2V0TWltZVR5cGUoZCksXG4gICAgICAgIGxhc3RXcml0ZTogZC5sYXN0V3JpdGUsXG4gICAgICAgIHNpemU6IGQuc2l6ZVxuICAgIH07XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkRGlyZWN0b3J5KGl0ZW0pIHtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgaXRlbS5uYW1lKTtcbiAgICB9KTtcbiAgICBsZXQgZGlyZWN0b3J5RGVzY3JpcHRvciA9IGF3YWl0IFJlc3QuZ2V0RGlyZWN0b3J5RGVzY3JpcHRvcihpdGVtLnNoYSk7XG4gICAgbGV0IGl0ZW1zID0gZGlyZWN0b3J5RGVzY3JpcHRvci5maWxlcy5tYXAoZGlyZWN0b3J5RGVzY3JpcHRvclRvRmlsZURlc2NyaXB0b3IpO1xuICAgIGl0ZW1zID0gYmVhdXRpZnlOYW1lcyhpdGVtcyk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSBpdGVtLm5hbWU7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICBzd2l0Y2ggKGN1cnJlbnRNb2RlKSB7XG4gICAgICAgIGNhc2UgTW9kZS5BdWRpbzpcbiAgICAgICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldFZhbHVlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTW9kZS5JbWFnZTpcbiAgICAgICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldEltYWdlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICAgICAgICAgIHRlcm06IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBpdGVtczogaXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFJlZmVyZW5jZXMoKSB7XG4gICAgbGV0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBcIlJlZmVyZW5jZXNcIik7XG4gICAgfSk7XG4gICAgbGV0IHJlZmVyZW5jZXMgPSBhd2FpdCBSZXN0LmdldFJlZmVyZW5jZXMoKTtcbiAgICBsZXQgaXRlbXMgPSByZWZlcmVuY2VzLm1hcChyZWZlcmVuY2UgPT4gKHtcbiAgICAgICAgbmFtZTogcmVmZXJlbmNlLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vcmVmZXJlbmNlJyxcbiAgICAgICAgc2hhOiByZWZlcmVuY2UsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KSk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSAnJztcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldFZhbHVlcyhkaXJlY3RvcnlQYW5lbCwge1xuICAgICAgICBuYW1lOiBcIlJlZmVyZW5jZXNcIixcbiAgICAgICAgaXRlbXNcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdHMoKSB7XG4gICAgbGV0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBcIlBsYXlsaXN0c1wiKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlcygpO1xuICAgIGxldCB1c2VyID0gYXdhaXQgQXV0aC5tZSgpO1xuICAgIGNvbnN0IHByZWZpeCA9IGBQTFVHSU4tUExBWUxJU1RTLSR7dXNlci51dWlkLnRvVXBwZXJDYXNlKCl9LWA7XG4gICAgbGV0IGl0ZW1zID0gcmVmZXJlbmNlc1xuICAgICAgICAuZmlsdGVyKHJlZmVyZW5jZSA9PiByZWZlcmVuY2UudG9VcHBlckNhc2UoKS5zdGFydHNXaXRoKHByZWZpeCkpXG4gICAgICAgIC5tYXAocmVmZXJlbmNlID0+IHJlZmVyZW5jZS5zdWJzdHIocHJlZml4Lmxlbmd0aCkpXG4gICAgICAgIC5tYXAocmVmZXJlbmNlID0+IHJlZmVyZW5jZS5zdWJzdHIoMCwgMSkudG9VcHBlckNhc2UoKSArIHJlZmVyZW5jZS5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgLm1hcChyZWZlcmVuY2UgPT4gKHtcbiAgICAgICAgbmFtZTogcmVmZXJlbmNlLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vcGxheWxpc3QnLFxuICAgICAgICBzaGE6IHJlZmVyZW5jZSxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9ICcnO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgIG5hbWU6IFwiUGxheWxpc3RzXCIsXG4gICAgICAgIGl0ZW1zXG4gICAgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUGxheWxpc3QobmFtZSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBgUGxheWxpc3QgJyR7bmFtZX0nYCk7XG4gICAgfSk7XG4gICAgbGV0IHVzZXIgPSBhd2FpdCBBdXRoLm1lKCk7XG4gICAgbGV0IHJlZmVyZW5jZSA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlKGBQTFVHSU4tUExBWUxJU1RTLSR7dXNlci51dWlkLnRvVXBwZXJDYXNlKCl9LSR7bmFtZS50b1VwcGVyQ2FzZSgpfWApO1xuICAgIGxldCBjb21taXQgPSBhd2FpdCBSZXN0LmdldENvbW1pdChyZWZlcmVuY2UuY3VycmVudENvbW1pdFNoYSk7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgYXdhaXQgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgIHNoYTogY29tbWl0LmRpcmVjdG9yeURlc2NyaXB0b3JTaGEsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JyxcbiAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICBzaXplOiAwXG4gICAgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUmVmZXJlbmNlKG5hbWUpIHtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgYFJlZmVyZW5jZSAnJHtuYW1lfSdgKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2UobmFtZSk7XG4gICAgbGV0IGNvbW1pdCA9IGF3YWl0IFJlc3QuZ2V0Q29tbWl0KHJlZmVyZW5jZS5jdXJyZW50Q29tbWl0U2hhKTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBhd2FpdCBsb2FkRGlyZWN0b3J5KHtcbiAgICAgICAgc2hhOiBjb21taXQuZGlyZWN0b3J5RGVzY3JpcHRvclNoYSxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGl0ZW1EZWZhdWx0QWN0aW9uKGNoaWxkSW5kZXgsIGV2ZW50KSB7XG4gICAgbGV0IGl0ZW0gPSBsYXN0RGlzcGxheWVkRmlsZXNbY2hpbGRJbmRleF07XG4gICAgaWYgKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3gtaW5mby1kaXNwbGF5LWFjdGlvbicpKSB7XG4gICAgICAgIGdvU2hhSW5mbyhpdGVtKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygneC1pbWFnZS16b29tLWFjdGlvbicpKSB7XG4gICAgICAgIGxldCB1bnJvbGxlZEl0ZW1zID0gbGFzdERpc3BsYXllZEZpbGVzO1xuICAgICAgICBsZXQgY3VycmVudFBvc2l0aW9uID0gY2hpbGRJbmRleDtcbiAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gKGRpcmVjdGlvbikgPT4ge1xuICAgICAgICAgICAgbGV0IG5leHRQb3NpdGlvbiA9IGN1cnJlbnRQb3NpdGlvbiArIGRpcmVjdGlvbjtcbiAgICAgICAgICAgIHdoaWxlIChuZXh0UG9zaXRpb24gPj0gMCAmJiBuZXh0UG9zaXRpb24gPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aCAmJiAhdW5yb2xsZWRJdGVtc1tuZXh0UG9zaXRpb25dLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XG4gICAgICAgICAgICAgICAgbmV4dFBvc2l0aW9uICs9IGRpcmVjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0UG9zaXRpb24gPj0gMCAmJiBuZXh0UG9zaXRpb24gPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5yb2xsZWRJdGVtc1tuZXh0UG9zaXRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIEltYWdlRGV0YWlscy5zaG93KGl0ZW0sIHtcbiAgICAgICAgICAgIG5leHQ6ICgpID0+IG5leHRQb3NpdGlvbigxKSxcbiAgICAgICAgICAgIHByZXZpb3VzOiAoKSA9PiBuZXh0UG9zaXRpb24oLTEpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaXRlbS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5Jykge1xuICAgICAgICBnb0xvYWREaXJlY3RvcnkoaXRlbS5zaGEsIGl0ZW0ubmFtZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3JlZmVyZW5jZScpIHtcbiAgICAgICAgZ29SZWZlcmVuY2UoaXRlbS5zaGEpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9wbGF5bGlzdCcpIHtcbiAgICAgICAgZ29QbGF5bGlzdChpdGVtLnNoYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpIHtcbiAgICAgICAgYXVkaW9KdWtlYm94LmFkZEFuZFBsYXkoaXRlbSk7XG4gICAgICAgIC8vIHNldCBhbiB1bnJvbGxlclxuICAgICAgICBpZiAoY2hpbGRJbmRleCA+PSBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgYXVkaW9KdWtlYm94LnNldEl0ZW1VbnJvbGxlcihudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0ZXJtID0gbGFzdFNlYXJjaFRlcm07XG4gICAgICAgICAgICBsZXQgdW5yb2xsZWRJdGVtcyA9IGxhc3REaXNwbGF5ZWRGaWxlcy5zbGljZShjaGlsZEluZGV4ICsgMSkuZmlsdGVyKGYgPT4gZi5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSk7XG4gICAgICAgICAgICBsZXQgdW5yb2xsSW5kZXggPSAwO1xuICAgICAgICAgICAgaWYgKHVucm9sbGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9KdWtlYm94LnNldEl0ZW1VbnJvbGxlcih7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGB0aGVuICcke3Vucm9sbGVkSXRlbXNbdW5yb2xsSW5kZXhdLm5hbWUuc3Vic3RyKDAsIDIwKX0nIGFuZCAke3Vucm9sbGVkSXRlbXMubGVuZ3RoIC0gdW5yb2xsSW5kZXggLSAxfSBvdGhlciAnJHt0ZXJtfScgaXRlbXMuLi5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBmaW5pc2hlZCAnJHt0ZXJtfSBzb25nc2A7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVucm9sbDogKCkgPT4gdW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleCsrXSxcbiAgICAgICAgICAgICAgICAgICAgaGFzTmV4dDogKCkgPT4gdW5yb2xsSW5kZXggPj0gMCAmJiB1bnJvbGxJbmRleCA8IHVucm9sbGVkSXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzaG93U2xpZGVzaG93KCkge1xuICAgIGlmICghc2xpZGVzaG93KVxuICAgICAgICBzbGlkZXNob3cgPSBTbGlkZXNob3cuY3JlYXRlKCk7XG4gICAgc2V0Q29udGVudChzbGlkZXNob3cucm9vdCk7XG59XG5mdW5jdGlvbiBzaG93SW5mbyhpdGVtKSB7XG4gICAgSW5mb1BhbmVsLnNob3coaXRlbSk7XG59XG5kaXJlY3RvcnlQYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgLy8gdG9kbyA6IGtub3dubGVkZ2UgdG8gZG8gdGhhdCBpcyBpbiBkaXJlY3RvcnlQYW5lbFxuICAgIGxldCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IFRlbXBsYXRlcy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZGlyZWN0b3J5UGFuZWwsIGV2ZW50KTtcbiAgICBpZiAobGFzdERpc3BsYXllZEZpbGVzICYmIGVsZW1lbnQgPT0gZGlyZWN0b3J5UGFuZWwuaXRlbXMgJiYgY2hpbGRJbmRleCA+PSAwICYmIGNoaWxkSW5kZXggPCBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGl0ZW1EZWZhdWx0QWN0aW9uKGNoaWxkSW5kZXgsIGV2ZW50KTtcbiAgICB9XG59KTtcbnNlYXJjaFBhbmVsLmF1ZGlvTW9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoY3VycmVudE1vZGUgPT0gTW9kZS5BdWRpbykge1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQXVkaW8gbW9kZSBhbHJlYWR5IGFjdGl2YXRlZGAsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBBdWRpbyBtb2RlIGFjdGl2YXRlZGAsIDApO1xuICAgIGN1cnJlbnRNb2RlID0gTW9kZS5BdWRpbztcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xufSk7XG5zZWFyY2hQYW5lbC5pbWFnZU1vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgaWYgKGN1cnJlbnRNb2RlID09IE1vZGUuSW1hZ2UpIHtcbiAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEltYWdlIG1vZGUgYWxyZWFkeSBhY3RpdmF0ZWRgLCAwKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgSW1hZ2UgbW9kZSBhY3RpdmF0ZWRgLCAwKTtcbiAgICBjdXJyZW50TW9kZSA9IE1vZGUuSW1hZ2U7XG4gICAgcmVhZEhhc2hBbmRBY3QoKTtcbn0pO1xucmVhZEhhc2hBbmRBY3QoKTtcbndpbmRvdy5vbnBvcHN0YXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgcmVhZEhhc2hBbmRBY3QoKTtcbiAgICAvKmlmIChldmVudC5zdGF0ZSkge1xuICAgICAgICBjdXJyZW50RGlyZWN0b3J5RGVzY3JpcHRvclNoYSA9IGV2ZW50LnN0YXRlLmN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhXG4gICAgICAgIGN1cnJlbnRDbGllbnRJZCA9IGV2ZW50LnN0YXRlLmN1cnJlbnRDbGllbnRJZFxuICAgICAgICBjdXJyZW50UGljdHVyZUluZGV4ID0gZXZlbnQuc3RhdGUuY3VycmVudFBpY3R1cmVJbmRleCB8fCAwXG4gXG4gICAgICAgIGlmICghY3VycmVudENsaWVudElkKVxuICAgICAgICAgICAgZWwoXCIjbWVudVwiKS5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpXG4gXG4gICAgICAgIHN5bmNVaSgpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmcm9tSGFzaCgpXG4gXG4gICAgICAgIHN5bmNVaSgpXG4gICAgfSovXG59O1xuQXV0aC5tZSgpLnRoZW4odXNlciA9PiBVaVRvb2wuZWwoJ3VzZXItaWQnKS5pbm5lclRleHQgPSB1c2VyLnV1aWQpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2wgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IE1lc3NhZ2VzID0gcmVxdWlyZShcIi4vbWVzc2FnZXNcIik7XG5jb25zdCBLQiA9IDEwMjQ7XG5jb25zdCBNQiA9IDEwMjQgKiBLQjtcbmNvbnN0IEdCID0gMTAyNCAqIE1CO1xuY29uc3QgVEIgPSAxMDI0ICogR0I7XG5mdW5jdGlvbiBmcmllbmRseVNpemUoc2l6ZSkge1xuICAgIGlmIChzaXplID4gMiAqIFRCKVxuICAgICAgICByZXR1cm4gYCR7KHNpemUgLyBUQikudG9GaXhlZCgxKX0gVEJiICgke3NpemV9IGJ5dGVzKWA7XG4gICAgaWYgKHNpemUgPiAyICogR0IpXG4gICAgICAgIHJldHVybiBgJHsoc2l6ZSAvIEdCKS50b0ZpeGVkKDEpfSBHYiAoJHtzaXplfSBieXRlcylgO1xuICAgIGlmIChzaXplID4gMiAqIE1CKVxuICAgICAgICByZXR1cm4gYCR7KHNpemUgLyBNQikudG9GaXhlZCgxKX0gTWIgKCR7c2l6ZX0gYnl0ZXMpYDtcbiAgICBpZiAoc2l6ZSA+IDIgKiBLQilcbiAgICAgICAgcmV0dXJuIGAkeyhzaXplIC8gS0IpLnRvRml4ZWQoMSl9IGtiICgke3NpemV9IGJ5dGVzKWA7XG4gICAgaWYgKHNpemUgPiAxKVxuICAgICAgICByZXR1cm4gYCR7c2l6ZX0gYnl0ZXNgO1xuICAgIGlmIChzaXplID09IDEpXG4gICAgICAgIHJldHVybiBgMSBieXRlYDtcbiAgICByZXR1cm4gYGVtcHR5YDtcbn1cbmxldCBpc1Nob3duID0gZmFsc2U7XG5jb25zdCB0ZW1wbGF0ZSA9IGBcbjxkaXYgY2xhc3M9XCJtdWktY29udGFpbmVyXCI+XG4gICAgPGRpdiBjbGFzcz0nbXVpLXBhbmVsJz5cbiAgICAgICAgPGRpdiB4LWlkPVwidGl0bGVcIiBjbGFzcz1cIm11aS0tdGV4dC10aXRsZVwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdj5zaGE6IDxzcGFuIHgtaWQ9J3NoYSc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2PnNpemU6IDxzcGFuIHgtaWQ9J3NpemUnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdj5taW1lIHR5cGU6IDxzcGFuIHgtaWQ9J21pbWVUeXBlJz48L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2PjxhIHgtaWQ9XCJkb3dubG9hZFwiIGhyZWY9XCIjXCI+ZG93bmxvYWQgbGluazwvYT48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgeC1pZD1cImV4dHJhc1wiPjwvZGl2PlxuXG4gICAgICAgIDxkaXY+bmFtZXM6IDxzcGFuIHgtaWQ9J25hbWVzJz48L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXY+d3JpdGUgZGF0ZXM6IDxzcGFuIHgtaWQ9J3dyaXRlRGF0ZXMnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdj5wYXJlbnRzOiA8ZGl2IHgtaWQ9J3BhcmVudHMnPjwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2PnNvdXJjZXM6IDxkaXYgeC1pZD0nc291cmNlcyc+PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXY+ZXhpZjogPGRpdiB4LWlkPVwiZXhpZlwiPjwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiB4LWlkPVwiY2xvc2VcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdCBtdWktYnRuLS1wcmltYXJ5XCI+Q2xvc2U8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5jb25zdCBjb250ZW50ID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSk7XG5jb25zdCBvcHRpb25zID0ge1xuICAgICdrZXlib2FyZCc6IGZhbHNlLFxuICAgICdzdGF0aWMnOiB0cnVlLFxuICAgICdvbmNsb3NlJzogZnVuY3Rpb24gKCkgeyB9XG59O1xuY29udGVudC5jbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBoaXN0b3J5LmJhY2soKTtcbn0pO1xuZnVuY3Rpb24gaGlkZSgpIHtcbiAgICBpZiAoIWlzU2hvd24pXG4gICAgICAgIHJldHVybjtcbiAgICBpc1Nob3duID0gZmFsc2U7XG4gICAgbXVpLm92ZXJsYXkoJ29mZicpO1xufVxuZXhwb3J0cy5oaWRlID0gaGlkZTtcbmZ1bmN0aW9uIHNob3coaXRlbSkge1xuICAgIGNvbnRlbnQudGl0bGUuaW5uZXJUZXh0ID0gYCR7aXRlbS5uYW1lfSBkZXRhaWxzYDtcbiAgICBjb250ZW50LnNoYS5pbm5lclRleHQgPSBpdGVtLnNoYTtcbiAgICBjb250ZW50Lm1pbWVUeXBlLmlubmVyVGV4dCA9IGl0ZW0ubWltZVR5cGU7XG4gICAgY29udGVudC5zaXplLmlubmVyVGV4dCA9IGZyaWVuZGx5U2l6ZShpdGVtLnNpemUpO1xuICAgIGNvbnRlbnQuZG93bmxvYWQuaHJlZiA9IFJlc3QuZ2V0U2hhQ29udGVudFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSwgaXRlbS5uYW1lLCB0cnVlLCB0cnVlKTtcbiAgICBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSkge1xuICAgICAgICBjb250ZW50LmV4dHJhcy5pbm5lckhUTUwgPSBgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiR7UmVzdC5nZXRTaGFDb250ZW50VXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlLCBpdGVtLm5hbWUsIHRydWUsIGZhbHNlKX1cIj48aW1nIHNyYz1cIiR7UmVzdC5nZXRTaGFJbWFnZVRodW1ibmFpbFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSl9XCIvPjwvYT48ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5gO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29udGVudC5leHRyYXMuaW5uZXJIVE1MID0gJyc7XG4gICAgfVxuICAgIGlmICghaXNTaG93bilcbiAgICAgICAgbXVpLm92ZXJsYXkoJ29uJywgb3B0aW9ucywgY29udGVudC5yb290KTtcbiAgICBpc1Nob3duID0gdHJ1ZTtcbiAgICBjb25zdCBsb2FkSW5mbyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IFJlc3QuZ2V0U2hhSW5mbyhpdGVtLnNoYSk7XG4gICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYENhbm5vdCBsb2FkIGRldGFpbGVkIGluZm9ybWF0aW9uLi4uYCwgLTEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRlbnQubWltZVR5cGUuaW5uZXJUZXh0ID0gaW5mby5taW1lVHlwZXMuam9pbignLCAnKTtcbiAgICAgICAgY29udGVudC5uYW1lcy5pbm5lclRleHQgPSBpbmZvLm5hbWVzLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnRlbnQud3JpdGVEYXRlcy5pbm5lclRleHQgPSBpbmZvLndyaXRlRGF0ZXMubWFwKGQgPT4gbmV3IERhdGUoZCAvIDEwMDApLnRvRGF0ZVN0cmluZygpKS5qb2luKCcsICcpO1xuICAgICAgICBjb250ZW50LnNpemUuaW5uZXJUZXh0ID0gaW5mby5zaXplcy5tYXAoZnJpZW5kbHlTaXplKS5qb2luKCcsICcpO1xuICAgICAgICBjb250ZW50LnBhcmVudHMuaW5uZXJIVE1MID0gaW5mby5wYXJlbnRzLm1hcChwID0+IGA8ZGl2PjxhIGhyZWY9XCIjL2RpcmVjdG9yaWVzLyR7cH0/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChgJHtpdGVtLm5hbWV9J3MgcGFyZW50c2ApfVwiPiR7cH08L2E+PC9kaXY+YCkuam9pbignJyk7XG4gICAgICAgIGNvbnRlbnQuc291cmNlcy5pbm5lckhUTUwgPSBpbmZvLnNvdXJjZXMubWFwKHMgPT4gYDxkaXY+PGEgaHJlZj1cIiMvcmVmcy8ke3N9XCI+JHtzfTwvYT48L2Rpdj5gKS5qb2luKCcnKTtcbiAgICAgICAgaWYgKGluZm8uZXhpZnMgJiYgaW5mby5leGlmcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuZXhpZi5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwibXVpLXRhYmxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5Qcm9wZXJ0eTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+VmFsdWU8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgJHtpbmZvLmV4aWZzLm1hcChleGlmID0+IE9iamVjdC5lbnRyaWVzKGV4aWYpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgPHRyPjx0ZD4ke2tleX08L3RkPjx0ZD4ke3ZhbHVlfTwvdGQ+PC90cj5gKS5qb2luKCcnKSkuam9pbignJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgPC90YWJsZT5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29udGVudC5leGlmLmlubmVySFRNTCA9IGBubyBleGlmIGRhdGFgO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsb2FkSW5mbygpO1xufVxuZXhwb3J0cy5zaG93ID0gc2hvdztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZm8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmxldCBtZXNzYWdlcyA9IFtdO1xuY29uc3QgcG9wdXBUZW1wbGF0ZSA9IGBcbiAgICA8ZGl2IHgtaWQ9XCJtZXNzYWdlc1wiPlxuICAgIDwvZGl2PmA7XG5sZXQgcG9wdXAgPSB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHBvcHVwVGVtcGxhdGUpO1xuZnVuY3Rpb24gcmVmcmVzaCgpIHtcbiAgICBwb3B1cC5tZXNzYWdlcy5pbm5lckhUTUwgPSBtZXNzYWdlcy5tYXAobWVzc2FnZSA9PiB7XG4gICAgICAgIGxldCBzdHlsZSA9ICcnO1xuICAgICAgICBpZiAobWVzc2FnZS5mZWVsaW5nID4gMClcbiAgICAgICAgICAgIHN0eWxlID0gYGJhY2tncm91bmQtY29sb3I6ICM3MGNhODU7IGNvbG9yOiB3aGl0ZTtgO1xuICAgICAgICBlbHNlIGlmIChtZXNzYWdlLmZlZWxpbmcgPCAwKVxuICAgICAgICAgICAgc3R5bGUgPSBgYmFja2dyb3VuZC1jb2xvcjogI0Y0NDMzNjsgY29sb3I6IHdoaXRlO2A7XG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm11aS1wYW5lbCB4LW1lc3NhZ2UtcGFuZWxcIiBzdHlsZT1cIiR7c3R5bGV9XCI+JHttZXNzYWdlLmh0bWx9PC9kaXY+YDtcbiAgICB9KS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIGRpc3BsYXlNZXNzYWdlKGh0bWwsIGZlZWxpbmcpIHtcbiAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgaHRtbCxcbiAgICAgICAgZmVlbGluZ1xuICAgIH0pO1xuICAgIHJlZnJlc2goKTtcbiAgICBpZiAoIXBvcHVwLnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocG9wdXAucm9vdCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG1lc3NhZ2VzLnNoaWZ0KCk7XG4gICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHBvcHVwLnJvb3QpO1xuICAgIH0sIDQwMDApO1xufVxuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGRpc3BsYXlNZXNzYWdlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWVzc2FnZXMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBleHRlbnNpb25Gcm9tTWltZVR5cGUobWltZVR5cGUpIHtcbiAgICBmb3IgKGxldCBbZXh0ZW5zaW9uLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0cy5NaW1lVHlwZXMpKSB7XG4gICAgICAgIGlmIChtaW1lVHlwZSA9PSB2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiBleHRlbnNpb247XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0cy5leHRlbnNpb25Gcm9tTWltZVR5cGUgPSBleHRlbnNpb25Gcm9tTWltZVR5cGU7XG5leHBvcnRzLk1pbWVUeXBlcyA9IHtcbiAgICBcIjNkbWxcIjogXCJ0ZXh0L3ZuZC5pbjNkLjNkbWxcIixcbiAgICBcIjNkc1wiOiBcImltYWdlL3gtM2RzXCIsXG4gICAgXCIzZzJcIjogXCJ2aWRlby8zZ3BwMlwiLFxuICAgIFwiM2dwXCI6IFwidmlkZW8vM2dwcFwiLFxuICAgIFwiN3pcIjogXCJhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWRcIixcbiAgICBcImFhYlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcImFhY1wiOiBcImF1ZGlvL3gtYWFjXCIsXG4gICAgXCJhYW1cIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtbWFwXCIsXG4gICAgXCJhYXNcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtc2VnXCIsXG4gICAgXCJhYndcIjogXCJhcHBsaWNhdGlvbi94LWFiaXdvcmRcIixcbiAgICBcImFjXCI6IFwiYXBwbGljYXRpb24vcGtpeC1hdHRyLWNlcnRcIixcbiAgICBcImFjY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWVyaWNhbmR5bmFtaWNzLmFjY1wiLFxuICAgIFwiYWNlXCI6IFwiYXBwbGljYXRpb24veC1hY2UtY29tcHJlc3NlZFwiLFxuICAgIFwiYWN1XCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvYm9sXCIsXG4gICAgXCJhY3V0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXCIsXG4gICAgXCJhZHBcIjogXCJhdWRpby9hZHBjbVwiLFxuICAgIFwiYWVwXCI6IFwiYXBwbGljYXRpb24vdm5kLmF1ZGlvZ3JhcGhcIixcbiAgICBcImFmbVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwiYWZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImFoZWFkXCI6IFwiYXBwbGljYXRpb24vdm5kLmFoZWFkLnNwYWNlXCIsXG4gICAgXCJhaVwiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcImFpZlwiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlmY1wiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlmZlwiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlyXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmFpci1hcHBsaWNhdGlvbi1pbnN0YWxsZXItcGFja2FnZSt6aXBcIixcbiAgICBcImFpdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kdmIuYWl0XCIsXG4gICAgXCJhbWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1pZ2EuYW1pXCIsXG4gICAgXCJhcGVcIjogXCJhdWRpby9hcGVcIixcbiAgICBcImFwa1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbmRyb2lkLnBhY2thZ2UtYXJjaGl2ZVwiLFxuICAgIFwiYXBwY2FjaGVcIjogXCJ0ZXh0L2NhY2hlLW1hbmlmZXN0XCIsXG4gICAgXCJhcHBsaWNhdGlvblwiOiBcImFwcGxpY2F0aW9uL3gtbXMtYXBwbGljYXRpb25cIixcbiAgICBcImFwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1hcHByb2FjaFwiLFxuICAgIFwiYXJjXCI6IFwiYXBwbGljYXRpb24veC1mcmVlYXJjXCIsXG4gICAgXCJhc2FcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc2F4XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJhc2NcIjogXCJhcHBsaWNhdGlvbi9wZ3Atc2lnbmF0dXJlXCIsXG4gICAgXCJhc2N4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNmXCI6IFwidmlkZW8veC1tcy1hc2ZcIixcbiAgICBcImFzaHhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc21cIjogXCJ0ZXh0L3gtYXNtXCIsXG4gICAgXCJhc214XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNvXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjY3BhYy5zaW1wbHkuYXNvXCIsXG4gICAgXCJhc3BcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc3B4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXN4XCI6IFwidmlkZW8veC1tcy1hc2ZcIixcbiAgICBcImF0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXCIsXG4gICAgXCJhdG9tXCI6IFwiYXBwbGljYXRpb24vYXRvbSt4bWxcIixcbiAgICBcImF0b21jYXRcIjogXCJhcHBsaWNhdGlvbi9hdG9tY2F0K3htbFwiLFxuICAgIFwiYXRvbXN2Y1wiOiBcImFwcGxpY2F0aW9uL2F0b21zdmMreG1sXCIsXG4gICAgXCJhdHhcIjogXCJhcHBsaWNhdGlvbi92bmQuYW50aXguZ2FtZS1jb21wb25lbnRcIixcbiAgICBcImF1XCI6IFwiYXVkaW8vYmFzaWNcIixcbiAgICBcImF2aVwiOiBcInZpZGVvL3gtbXN2aWRlb1wiLFxuICAgIFwiYXdcIjogXCJhcHBsaWNhdGlvbi9hcHBsaXh3YXJlXCIsXG4gICAgXCJheGRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhemZcIjogXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpmXCIsXG4gICAgXCJhenNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpzXCIsXG4gICAgXCJhendcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1hem9uLmVib29rXCIsXG4gICAgXCJiYXRcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImJjcGlvXCI6IFwiYXBwbGljYXRpb24veC1iY3Bpb1wiLFxuICAgIFwiYmRmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWJkZlwiLFxuICAgIFwiYmRtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbSt3YnhtbFwiLFxuICAgIFwiYmVkXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlYWx2bmMuYmVkXCIsXG4gICAgXCJiaDJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c3Byc1wiLFxuICAgIFwiYmluXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJibGJcIjogXCJhcHBsaWNhdGlvbi94LWJsb3JiXCIsXG4gICAgXCJibG9yYlwiOiBcImFwcGxpY2F0aW9uL3gtYmxvcmJcIixcbiAgICBcImJtaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ibWlcIixcbiAgICBcImJtcFwiOiBcImltYWdlL2JtcFwiLFxuICAgIFwiYm9va1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJib3hcIjogXCJhcHBsaWNhdGlvbi92bmQucHJldmlld3N5c3RlbXMuYm94XCIsXG4gICAgXCJib3pcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXAyXCIsXG4gICAgXCJicGtcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImJ0aWZcIjogXCJpbWFnZS9wcnMuYnRpZlwiLFxuICAgIFwiYnpcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXBcIixcbiAgICBcImJ6MlwiOiBcImFwcGxpY2F0aW9uL3gtYnppcDJcIixcbiAgICBcImNcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiYzExYW1jXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsdWV0cnVzdC5jYXJ0b21vYmlsZS1jb25maWdcIixcbiAgICBcImMxMWFtelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnLXBrZ1wiLFxuICAgIFwiYzRkXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNGdcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0dVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjYWJcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtY2FiLWNvbXByZXNzZWRcIixcbiAgICBcImNhZlwiOiBcImF1ZGlvL3gtY2FmXCIsXG4gICAgXCJjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJjYXJcIjogXCJhcHBsaWNhdGlvbi92bmQuY3VybC5jYXJcIixcbiAgICBcImNhdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc2VjY2F0XCIsXG4gICAgXCJjYjdcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2JhXCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNiclwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnRcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2J6XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNjXCI6IFwidGV4dC94LWNcIixcbiAgICBcImNjdFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImNjeG1sXCI6IFwiYXBwbGljYXRpb24vY2N4bWwreG1sXCIsXG4gICAgXCJjZGJjbXNnXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvbnRhY3QuY21zZ1wiLFxuICAgIFwiY2RmXCI6IFwiYXBwbGljYXRpb24veC1uZXRjZGZcIixcbiAgICBcImNka2V5XCI6IFwiYXBwbGljYXRpb24vdm5kLm1lZGlhc3RhdGlvbi5jZGtleVwiLFxuICAgIFwiY2RtaWFcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWNhcGFiaWxpdHlcIixcbiAgICBcImNkbWljXCI6IFwiYXBwbGljYXRpb24vY2RtaS1jb250YWluZXJcIixcbiAgICBcImNkbWlkXCI6IFwiYXBwbGljYXRpb24vY2RtaS1kb21haW5cIixcbiAgICBcImNkbWlvXCI6IFwiYXBwbGljYXRpb24vY2RtaS1vYmplY3RcIixcbiAgICBcImNkbWlxXCI6IFwiYXBwbGljYXRpb24vY2RtaS1xdWV1ZVwiLFxuICAgIFwiY2R4XCI6IFwiY2hlbWljYWwveC1jZHhcIixcbiAgICBcImNkeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmNoZW1kcmF3K3htbFwiLFxuICAgIFwiY2R5XCI6IFwiYXBwbGljYXRpb24vdm5kLmNpbmRlcmVsbGFcIixcbiAgICBcImNlclwiOiBcImFwcGxpY2F0aW9uL3BraXgtY2VydFwiLFxuICAgIFwiY2ZjXCI6IFwiYXBwbGljYXRpb24veC1jb2xkZnVzaW9uXCIsXG4gICAgXCJjZm1cIjogXCJhcHBsaWNhdGlvbi94LWNvbGRmdXNpb25cIixcbiAgICBcImNmc1wiOiBcImFwcGxpY2F0aW9uL3gtY2ZzLWNvbXByZXNzZWRcIixcbiAgICBcImNnbVwiOiBcImltYWdlL2NnbVwiLFxuICAgIFwiY2hhdFwiOiBcImFwcGxpY2F0aW9uL3gtY2hhdFwiLFxuICAgIFwiY2htXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWh0bWxoZWxwXCIsXG4gICAgXCJjaHJ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rY2hhcnRcIixcbiAgICBcImNpZlwiOiBcImNoZW1pY2FsL3gtY2lmXCIsXG4gICAgXCJjaWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWNlcnRpZmljYXRlLWlzc3VlLWluaXRpYXRpb25cIixcbiAgICBcImNpbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1hcnRnYWxyeVwiLFxuICAgIFwiY2xhXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsYXltb3JlXCIsXG4gICAgXCJjbGFzc1wiOiBcImFwcGxpY2F0aW9uL2phdmEtdm1cIixcbiAgICBcImNsa2tcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5rZXlib2FyZFwiLFxuICAgIFwiY2xrcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLnBhbGV0dGVcIixcbiAgICBcImNsa3RcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci50ZW1wbGF0ZVwiLFxuICAgIFwiY2xrd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLndvcmRiYW5rXCIsXG4gICAgXCJjbGt4XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXJcIixcbiAgICBcImNscFwiOiBcImFwcGxpY2F0aW9uL3gtbXNjbGlwXCIsXG4gICAgXCJjbWNcIjogXCJhcHBsaWNhdGlvbi92bmQuY29zbW9jYWxsZXJcIixcbiAgICBcImNtZGZcIjogXCJjaGVtaWNhbC94LWNtZGZcIixcbiAgICBcImNtbFwiOiBcImNoZW1pY2FsL3gtY21sXCIsXG4gICAgXCJjbXBcIjogXCJhcHBsaWNhdGlvbi92bmQueWVsbG93cml2ZXItY3VzdG9tLW1lbnVcIixcbiAgICBcImNteFwiOiBcImltYWdlL3gtY214XCIsXG4gICAgXCJjb2RcIjogXCJhcHBsaWNhdGlvbi92bmQucmltLmNvZFwiLFxuICAgIFwiY29tXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJjb25mXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiY3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtY3Bpb1wiLFxuICAgIFwiY3BwXCI6IFwidGV4dC94LWNcIixcbiAgICBcImNwdFwiOiBcImFwcGxpY2F0aW9uL21hYy1jb21wYWN0cHJvXCIsXG4gICAgXCJjcmRcIjogXCJhcHBsaWNhdGlvbi94LW1zY2FyZGZpbGVcIixcbiAgICBcImNybFwiOiBcImFwcGxpY2F0aW9uL3BraXgtY3JsXCIsXG4gICAgXCJjcnRcIjogXCJhcHBsaWNhdGlvbi94LXg1MDktY2EtY2VydFwiLFxuICAgIFwiY3J4XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJjcnlwdG9ub3RlXCI6IFwiYXBwbGljYXRpb24vdm5kLnJpZy5jcnlwdG9ub3RlXCIsXG4gICAgXCJjc1wiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImNzaFwiOiBcImFwcGxpY2F0aW9uL3gtY3NoXCIsXG4gICAgXCJjc21sXCI6IFwiY2hlbWljYWwveC1jc21sXCIsXG4gICAgXCJjc3BcIjogXCJhcHBsaWNhdGlvbi92bmQuY29tbW9uc3BhY2VcIixcbiAgICBcImNzc1wiOiBcInRleHQvY3NzXCIsXG4gICAgXCJjc3RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjc3ZcIjogXCJ0ZXh0L2NzdlwiLFxuICAgIFwiY3VcIjogXCJhcHBsaWNhdGlvbi9jdS1zZWVtZVwiLFxuICAgIFwiY3VybFwiOiBcInRleHQvdm5kLmN1cmxcIixcbiAgICBcImN3d1wiOiBcImFwcGxpY2F0aW9uL3Bycy5jd3dcIixcbiAgICBcImN4dFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImN4eFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJkYWVcIjogXCJtb2RlbC92bmQuY29sbGFkYSt4bWxcIixcbiAgICBcImRhZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGFmXCIsXG4gICAgXCJkYXJ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRhcnRcIixcbiAgICBcImRhdGFsZXNzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFwiLFxuICAgIFwiZGF2bW91bnRcIjogXCJhcHBsaWNhdGlvbi9kYXZtb3VudCt4bWxcIixcbiAgICBcImRia1wiOiBcImFwcGxpY2F0aW9uL2RvY2Jvb2sreG1sXCIsXG4gICAgXCJkY3JcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJkY3VybFwiOiBcInRleHQvdm5kLmN1cmwuZGN1cmxcIixcbiAgICBcImRkMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vbWEuZGQyK3htbFwiLFxuICAgIFwiZGRkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kZGRcIixcbiAgICBcImRlYlwiOiBcImFwcGxpY2F0aW9uL3gtZGViaWFuLXBhY2thZ2VcIixcbiAgICBcImRlZlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImRlcGxveVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGVyXCI6IFwiYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcIixcbiAgICBcImRmYWNcIjogXCJhcHBsaWNhdGlvbi92bmQuZHJlYW1mYWN0b3J5XCIsXG4gICAgXCJkZ2NcIjogXCJhcHBsaWNhdGlvbi94LWRnYy1jb21wcmVzc2VkXCIsXG4gICAgXCJkaWNcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiZGlyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZGlzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5kaXNcIixcbiAgICBcImRpc3RcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRpc3R6XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkanZcIjogXCJpbWFnZS92bmQuZGp2dVwiLFxuICAgIFwiZGp2dVwiOiBcImltYWdlL3ZuZC5kanZ1XCIsXG4gICAgXCJkbGxcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImRtZ1wiOiBcImFwcGxpY2F0aW9uL3gtYXBwbGUtZGlza2ltYWdlXCIsXG4gICAgXCJkbXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJkbXNcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRuYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kbmFcIixcbiAgICBcImRvY1wiOiBcImFwcGxpY2F0aW9uL21zd29yZFwiLFxuICAgIFwiZG9jbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwiZG9jeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCIsXG4gICAgXCJkb3RcIjogXCJhcHBsaWNhdGlvbi9tc3dvcmRcIixcbiAgICBcImRvdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcImRvdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC50ZW1wbGF0ZVwiLFxuICAgIFwiZHBcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnaS5kcFwiLFxuICAgIFwiZHBnXCI6IFwiYXBwbGljYXRpb24vdm5kLmRwZ3JhcGhcIixcbiAgICBcImRyYVwiOiBcImF1ZGlvL3ZuZC5kcmFcIixcbiAgICBcImRzY1wiOiBcInRleHQvcHJzLmxpbmVzLnRhZ1wiLFxuICAgIFwiZHNzY1wiOiBcImFwcGxpY2F0aW9uL2Rzc2MrZGVyXCIsXG4gICAgXCJkdGJcIjogXCJhcHBsaWNhdGlvbi94LWR0Ym9vayt4bWxcIixcbiAgICBcImR0ZFwiOiBcImFwcGxpY2F0aW9uL3htbC1kdGRcIixcbiAgICBcImR0c1wiOiBcImF1ZGlvL3ZuZC5kdHNcIixcbiAgICBcImR0c2hkXCI6IFwiYXVkaW8vdm5kLmR0cy5oZFwiLFxuICAgIFwiZHVtcFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZHZiXCI6IFwidmlkZW8vdm5kLmR2Yi5maWxlXCIsXG4gICAgXCJkdmlcIjogXCJhcHBsaWNhdGlvbi94LWR2aVwiLFxuICAgIFwiZHdmXCI6IFwibW9kZWwvdm5kLmR3ZlwiLFxuICAgIFwiZHdnXCI6IFwiaW1hZ2Uvdm5kLmR3Z1wiLFxuICAgIFwiZHhmXCI6IFwiaW1hZ2Uvdm5kLmR4ZlwiLFxuICAgIFwiZHhwXCI6IFwiYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLmR4cFwiLFxuICAgIFwiZHhyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZWNlbHA0ODAwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwNDgwMFwiLFxuICAgIFwiZWNlbHA3NDcwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwNzQ3MFwiLFxuICAgIFwiZWNlbHA5NjAwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwOTYwMFwiLFxuICAgIFwiZWNtYVwiOiBcImFwcGxpY2F0aW9uL2VjbWFzY3JpcHRcIixcbiAgICBcImVkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZG1cIixcbiAgICBcImVkeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZHhcIixcbiAgICBcImVmaWZcIjogXCJhcHBsaWNhdGlvbi92bmQucGljc2VsXCIsXG4gICAgXCJlaTZcIjogXCJhcHBsaWNhdGlvbi92bmQucGcub3Nhc2xpXCIsXG4gICAgXCJlbGNcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImVtZlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwiZW1sXCI6IFwibWVzc2FnZS9yZmM4MjJcIixcbiAgICBcImVtbWFcIjogXCJhcHBsaWNhdGlvbi9lbW1hK3htbFwiLFxuICAgIFwiZW16XCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJlb2xcIjogXCJhdWRpby92bmQuZGlnaXRhbC13aW5kc1wiLFxuICAgIFwiZW90XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWZvbnRvYmplY3RcIixcbiAgICBcImVwc1wiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcImVwdWJcIjogXCJhcHBsaWNhdGlvbi9lcHViK3ppcFwiLFxuICAgIFwiZXMzXCI6IFwiYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFwiLFxuICAgIFwiZXNhXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2kuc3Vic3lzdGVtXCIsXG4gICAgXCJlc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uZXNmXCIsXG4gICAgXCJldDNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXN6aWdubzMreG1sXCIsXG4gICAgXCJldHhcIjogXCJ0ZXh0L3gtc2V0ZXh0XCIsXG4gICAgXCJldmFcIjogXCJhcHBsaWNhdGlvbi94LWV2YVwiLFxuICAgIFwiZXZ5XCI6IFwiYXBwbGljYXRpb24veC1lbnZveVwiLFxuICAgIFwiZXhlXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJleGlcIjogXCJhcHBsaWNhdGlvbi9leGlcIixcbiAgICBcImV4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5leHRcIixcbiAgICBcImV6XCI6IFwiYXBwbGljYXRpb24vYW5kcmV3LWluc2V0XCIsXG4gICAgXCJlejJcIjogXCJhcHBsaWNhdGlvbi92bmQuZXpwaXgtYWxidW1cIixcbiAgICBcImV6M1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lenBpeC1wYWNrYWdlXCIsXG4gICAgXCJmXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImY0dlwiOiBcInZpZGVvL3gtZjR2XCIsXG4gICAgXCJmNzdcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZjkwXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImZic1wiOiBcImltYWdlL3ZuZC5mYXN0Ymlkc2hlZXRcIixcbiAgICBcImZjZHRcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZm9ybXNjZW50cmFsLmZjZHRcIixcbiAgICBcImZjc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pc2FjLmZjc1wiLFxuICAgIFwiZmRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkZlwiLFxuICAgIFwiZmVfbGF1bmNoXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlbm92by5mY3NlbGF5b3V0LWxpbmtcIixcbiAgICBcImZnNVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzZ3BcIixcbiAgICBcImZnZFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImZoXCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg0XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg1XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg3XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmhjXCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmlnXCI6IFwiYXBwbGljYXRpb24veC14ZmlnXCIsXG4gICAgXCJmbGFjXCI6IFwiYXVkaW8veC1mbGFjXCIsXG4gICAgXCJmbGlcIjogXCJ2aWRlby94LWZsaVwiLFxuICAgIFwiZmxvXCI6IFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguZmxvXCIsXG4gICAgXCJmbHZcIjogXCJ2aWRlby94LWZsdlwiLFxuICAgIFwiZmx3XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5raXZpb1wiLFxuICAgIFwiZmx4XCI6IFwidGV4dC92bmQuZm1pLmZsZXhzdG9yXCIsXG4gICAgXCJmbHlcIjogXCJ0ZXh0L3ZuZC5mbHlcIixcbiAgICBcImZtXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImZuY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcm9nYW5zLmZuY1wiLFxuICAgIFwiZm9yXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImZweFwiOiBcImltYWdlL3ZuZC5mcHhcIixcbiAgICBcImZyYW1lXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImZzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mc2Mud2VibGF1bmNoXCIsXG4gICAgXCJmc3RcIjogXCJpbWFnZS92bmQuZnN0XCIsXG4gICAgXCJmdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuZmx1eHRpbWUuY2xpcFwiLFxuICAgIFwiZnRpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuc2VyLXdlYi1mdW5kcy10cmFuc2Zlci1pbml0aWF0aW9uXCIsXG4gICAgXCJmdnRcIjogXCJ2aWRlby92bmQuZnZ0XCIsXG4gICAgXCJmeHBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZnhwXCIsXG4gICAgXCJmeHBsXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFwiLFxuICAgIFwiZnpzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1enp5c2hlZXRcIixcbiAgICBcImcyd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9wbGFuXCIsXG4gICAgXCJnM1wiOiBcImltYWdlL2czZmF4XCIsXG4gICAgXCJnM3dcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2Vvc3BhY2VcIixcbiAgICBcImdhY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtYWNjb3VudFwiLFxuICAgIFwiZ2FtXCI6IFwiYXBwbGljYXRpb24veC10YWRzXCIsXG4gICAgXCJnYnJcIjogXCJhcHBsaWNhdGlvbi9ycGtpLWdob3N0YnVzdGVyc1wiLFxuICAgIFwiZ2NhXCI6IFwiYXBwbGljYXRpb24veC1nY2EtY29tcHJlc3NlZFwiLFxuICAgIFwiZ2RsXCI6IFwibW9kZWwvdm5kLmdkbFwiLFxuICAgIFwiZ2VvXCI6IFwiYXBwbGljYXRpb24vdm5kLmR5bmFnZW9cIixcbiAgICBcImdleFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclwiLFxuICAgIFwiZ2diXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLmZpbGVcIixcbiAgICBcImdndFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9nZWJyYS50b29sXCIsXG4gICAgXCJnaGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWhlbHBcIixcbiAgICBcImdpZlwiOiBcImltYWdlL2dpZlwiLFxuICAgIFwiZ2ltXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pZGVudGl0eS1tZXNzYWdlXCIsXG4gICAgXCJnbWxcIjogXCJhcHBsaWNhdGlvbi9nbWwreG1sXCIsXG4gICAgXCJnbXhcIjogXCJhcHBsaWNhdGlvbi92bmQuZ214XCIsXG4gICAgXCJnbnVtZXJpY1wiOiBcImFwcGxpY2F0aW9uL3gtZ251bWVyaWNcIixcbiAgICBcImdwaFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mbG9ncmFwaGl0XCIsXG4gICAgXCJncHhcIjogXCJhcHBsaWNhdGlvbi9ncHgreG1sXCIsXG4gICAgXCJncWZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3JhZmVxXCIsXG4gICAgXCJncXNcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3JhZmVxXCIsXG4gICAgXCJncmFtXCI6IFwiYXBwbGljYXRpb24vc3Jnc1wiLFxuICAgIFwiZ3JhbXBzXCI6IFwiYXBwbGljYXRpb24veC1ncmFtcHMteG1sXCIsXG4gICAgXCJncmVcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbWV0cnktZXhwbG9yZXJcIixcbiAgICBcImdydlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaW5qZWN0b3JcIixcbiAgICBcImdyeG1sXCI6IFwiYXBwbGljYXRpb24vc3Jncyt4bWxcIixcbiAgICBcImdzZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1naG9zdHNjcmlwdFwiLFxuICAgIFwiZ3RhclwiOiBcImFwcGxpY2F0aW9uL3gtZ3RhclwiLFxuICAgIFwiZ3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLW1lc3NhZ2VcIixcbiAgICBcImd0d1wiOiBcIm1vZGVsL3ZuZC5ndHdcIixcbiAgICBcImd2XCI6IFwidGV4dC92bmQuZ3JhcGh2aXpcIixcbiAgICBcImd4ZlwiOiBcImFwcGxpY2F0aW9uL2d4ZlwiLFxuICAgIFwiZ3h0XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb25leHRcIixcbiAgICBcImd6XCI6IFwiYXBwbGljYXRpb24veC1nemlwXCIsXG4gICAgXCJoXCI6IFwidGV4dC94LWNcIixcbiAgICBcImgyNjFcIjogXCJ2aWRlby9oMjYxXCIsXG4gICAgXCJoMjYzXCI6IFwidmlkZW8vaDI2M1wiLFxuICAgIFwiaDI2NFwiOiBcInZpZGVvL2gyNjRcIixcbiAgICBcImhhbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYWwreG1sXCIsXG4gICAgXCJoYmNpXCI6IFwiYXBwbGljYXRpb24vdm5kLmhiY2lcIixcbiAgICBcImhkZlwiOiBcImFwcGxpY2F0aW9uL3gtaGRmXCIsXG4gICAgXCJoaFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJobHBcIjogXCJhcHBsaWNhdGlvbi93aW5obHBcIixcbiAgICBcImhwZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBnbFwiLFxuICAgIFwiaHBpZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocGlkXCIsXG4gICAgXCJocHNcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBzXCIsXG4gICAgXCJocXhcIjogXCJhcHBsaWNhdGlvbi9tYWMtYmluaGV4NDBcIixcbiAgICBcImh0YVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiaHRjXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodGtlXCI6IFwiYXBwbGljYXRpb24vdm5kLmtlbmFtZWFhcHBcIixcbiAgICBcImh0bVwiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHRtbFwiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi1kaWNcIixcbiAgICBcImh2cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtdm9pY2VcIixcbiAgICBcImh2c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtc2NyaXB0XCIsXG4gICAgXCJpMmdcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJnZW9cIixcbiAgICBcImljY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pY2Nwcm9maWxlXCIsXG4gICAgXCJpY2VcIjogXCJ4LWNvbmZlcmVuY2UveC1jb29sdGFsa1wiLFxuICAgIFwiaWNtXCI6IFwiYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcIixcbiAgICBcImljb1wiOiBcImltYWdlL3gtaWNvblwiLFxuICAgIFwiaWNzXCI6IFwidGV4dC9jYWxlbmRhclwiLFxuICAgIFwiaWVmXCI6IFwiaW1hZ2UvaWVmXCIsXG4gICAgXCJpZmJcIjogXCJ0ZXh0L2NhbGVuZGFyXCIsXG4gICAgXCJpZm1cIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuZm9ybWRhdGFcIixcbiAgICBcImlnZXNcIjogXCJtb2RlbC9pZ2VzXCIsXG4gICAgXCJpZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaWdsb2FkZXJcIixcbiAgICBcImlnbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnNvcnMuaWdtXCIsXG4gICAgXCJpZ3NcIjogXCJtb2RlbC9pZ2VzXCIsXG4gICAgXCJpZ3hcIjogXCJhcHBsaWNhdGlvbi92bmQubWljcm9ncmFmeC5pZ3hcIixcbiAgICBcImlpZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5pbnRlcmNoYW5nZVwiLFxuICAgIFwiaW1wXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjY3BhYy5zaW1wbHkuaW1wXCIsXG4gICAgXCJpbXNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtaW1zXCIsXG4gICAgXCJpblwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImluaVwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImlua1wiOiBcImFwcGxpY2F0aW9uL2lua21sK3htbFwiLFxuICAgIFwiaW5rbWxcIjogXCJhcHBsaWNhdGlvbi9pbmttbCt4bWxcIixcbiAgICBcImluc3RhbGxcIjogXCJhcHBsaWNhdGlvbi94LWluc3RhbGwtaW5zdHJ1Y3Rpb25zXCIsXG4gICAgXCJpb3RhXCI6IFwiYXBwbGljYXRpb24vdm5kLmFzdHJhZWEtc29mdHdhcmUuaW90YVwiLFxuICAgIFwiaXBhXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJpcGZpeFwiOiBcImFwcGxpY2F0aW9uL2lwZml4XCIsXG4gICAgXCJpcGtcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQucGFja2FnZVwiLFxuICAgIFwiaXJtXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5yaWdodHMtbWFuYWdlbWVudFwiLFxuICAgIFwiaXJwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlyZXBvc2l0b3J5LnBhY2thZ2UreG1sXCIsXG4gICAgXCJpc29cIjogXCJhcHBsaWNhdGlvbi94LWlzbzk2NjAtaW1hZ2VcIixcbiAgICBcIml0cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtdGVtcGxhdGVcIixcbiAgICBcIml2cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnBcIixcbiAgICBcIml2dVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnVcIixcbiAgICBcImphZFwiOiBcInRleHQvdm5kLnN1bi5qMm1lLmFwcC1kZXNjcmlwdG9yXCIsXG4gICAgXCJqYW1cIjogXCJhcHBsaWNhdGlvbi92bmQuamFtXCIsXG4gICAgXCJqYXJcIjogXCJhcHBsaWNhdGlvbi9qYXZhLWFyY2hpdmVcIixcbiAgICBcImphdmFcIjogXCJ0ZXh0L3gtamF2YS1zb3VyY2VcIixcbiAgICBcImppc3BcIjogXCJhcHBsaWNhdGlvbi92bmQuamlzcFwiLFxuICAgIFwiamx0XCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWpseXRcIixcbiAgICBcImpubHBcIjogXCJhcHBsaWNhdGlvbi94LWphdmEtam5scC1maWxlXCIsXG4gICAgXCJqb2RhXCI6IFwiYXBwbGljYXRpb24vdm5kLmpvb3N0LmpvZGEtYXJjaGl2ZVwiLFxuICAgIFwianBlXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBlZ1wiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZ1wiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZ21cIjogXCJ2aWRlby9qcG1cIixcbiAgICBcImpwZ3ZcIjogXCJ2aWRlby9qcGVnXCIsXG4gICAgXCJqcG1cIjogXCJ2aWRlby9qcG1cIixcbiAgICBcImpzXCI6IFwidGV4dC9qYXZhc2NyaXB0XCIsXG4gICAgXCJqc29uXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIFwianNvbm1sXCI6IFwiYXBwbGljYXRpb24vanNvbm1sK2pzb25cIixcbiAgICBcImthclwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcImthcmJvblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2FyYm9uXCIsXG4gICAgXCJrZm9cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtmb3JtdWxhXCIsXG4gICAgXCJraWFcIjogXCJhcHBsaWNhdGlvbi92bmQua2lkc3BpcmF0aW9uXCIsXG4gICAgXCJrbWxcIjogXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWVhcnRoLmttbCt4bWxcIixcbiAgICBcImttelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua216XCIsXG4gICAgXCJrbmVcIjogXCJhcHBsaWNhdGlvbi92bmQua2luYXJcIixcbiAgICBcImtucFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raW5hclwiLFxuICAgIFwia29uXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rb250b3VyXCIsXG4gICAgXCJrcHJcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcIixcbiAgICBcImtwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3ByZXNlbnRlclwiLFxuICAgIFwia3B4eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcy1rZXlwb2ludFwiLFxuICAgIFwia3NwXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rc3ByZWFkXCIsXG4gICAgXCJrdHJcIjogXCJhcHBsaWNhdGlvbi92bmQua2Fob290elwiLFxuICAgIFwia3R4XCI6IFwiaW1hZ2Uva3R4XCIsXG4gICAgXCJrdHpcIjogXCJhcHBsaWNhdGlvbi92bmQua2Fob290elwiLFxuICAgIFwia3dkXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFwiLFxuICAgIFwia3d0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFwiLFxuICAgIFwibGFzeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmxhcy5sYXMreG1sXCIsXG4gICAgXCJsYXRleFwiOiBcImFwcGxpY2F0aW9uL3gtbGF0ZXhcIixcbiAgICBcImxiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5kZXNrdG9wXCIsXG4gICAgXCJsYmVcIjogXCJhcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZXhjaGFuZ2UreG1sXCIsXG4gICAgXCJsZXNcIjogXCJhcHBsaWNhdGlvbi92bmQuaGhlLmxlc3Nvbi1wbGF5ZXJcIixcbiAgICBcImxoYVwiOiBcImFwcGxpY2F0aW9uL3gtbHpoLWNvbXByZXNzZWRcIixcbiAgICBcImxpbms2NlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yb3V0ZTY2Lmxpbms2Nit4bWxcIixcbiAgICBcImxpc3RcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJsaXN0MzgyMFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJsaXN0YWZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImxua1wiOiBcImFwcGxpY2F0aW9uL3gtbXMtc2hvcnRjdXRcIixcbiAgICBcImxvZ1wiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImxvc3R4bWxcIjogXCJhcHBsaWNhdGlvbi9sb3N0K3htbFwiLFxuICAgIFwibHJmXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJscm1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtbHJtXCIsXG4gICAgXCJsdGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5sdGZcIixcbiAgICBcImx2cFwiOiBcImF1ZGlvL3ZuZC5sdWNlbnQudm9pY2VcIixcbiAgICBcImx3cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy13b3JkcHJvXCIsXG4gICAgXCJselwiOiBcImFwcGxpY2F0aW9uL3gtbHppcFwiLFxuICAgIFwibHpoXCI6IFwiYXBwbGljYXRpb24veC1semgtY29tcHJlc3NlZFwiLFxuICAgIFwibHptYVwiOiBcImFwcGxpY2F0aW9uL3gtbHptYVwiLFxuICAgIFwibHpvXCI6IFwiYXBwbGljYXRpb24veC1sem9wXCIsXG4gICAgXCJtMTNcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtMTRcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtMXZcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtMjFcIjogXCJhcHBsaWNhdGlvbi9tcDIxXCIsXG4gICAgXCJtMmFcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtMnZcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtM2FcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtM3VcIjogXCJhdWRpby94LW1wZWd1cmxcIixcbiAgICBcIm0zdThcIjogXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiLFxuICAgIFwibTRhXCI6IFwiYXVkaW8vbXA0XCIsXG4gICAgXCJtNHVcIjogXCJ2aWRlby92bmQubXBlZ3VybFwiLFxuICAgIFwibTR2XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtYVwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJtYWRzXCI6IFwiYXBwbGljYXRpb24vbWFkcyt4bWxcIixcbiAgICBcIm1hZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lY293aW4uY2hhcnRcIixcbiAgICBcIm1ha2VyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcIm1hblwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1hclwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwibWF0aG1sXCI6IFwiYXBwbGljYXRpb24vbWF0aG1sK3htbFwiLFxuICAgIFwibWJcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibWJrXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tYmtcIixcbiAgICBcIm1ib3hcIjogXCJhcHBsaWNhdGlvbi9tYm94XCIsXG4gICAgXCJtYzFcIjogXCJhcHBsaWNhdGlvbi92bmQubWVkY2FsY2RhdGFcIixcbiAgICBcIm1jZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tY2RcIixcbiAgICBcIm1jdXJsXCI6IFwidGV4dC92bmQuY3VybC5tY3VybFwiLFxuICAgICdtZCc6ICd0ZXh0L3BsYWluJyxcbiAgICBcIm1kYlwiOiBcImFwcGxpY2F0aW9uL3gtbXNhY2Nlc3NcIixcbiAgICBcIm1kaVwiOiBcImltYWdlL3ZuZC5tcy1tb2RpXCIsXG4gICAgXCJtZVwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1lc2hcIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJtZXRhNFwiOiBcImFwcGxpY2F0aW9uL21ldGFsaW5rNCt4bWxcIixcbiAgICBcIm1ldGFsaW5rXCI6IFwiYXBwbGljYXRpb24vbWV0YWxpbmsreG1sXCIsXG4gICAgXCJtZXRzXCI6IFwiYXBwbGljYXRpb24vbWV0cyt4bWxcIixcbiAgICBcIm1mbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZm1wXCIsXG4gICAgXCJtZnRcIjogXCJhcHBsaWNhdGlvbi9ycGtpLW1hbmlmZXN0XCIsXG4gICAgXCJtZ3BcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnZW8ubWFwZ3VpZGUucGFja2FnZVwiLFxuICAgIFwibWd6XCI6IFwiYXBwbGljYXRpb24vdm5kLnByb3RldXMubWFnYXppbmVcIixcbiAgICBcIm1pZFwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcIm1pZGlcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJtaWVcIjogXCJhcHBsaWNhdGlvbi94LW1pZVwiLFxuICAgIFwibWlmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1pZlwiLFxuICAgIFwibWltZVwiOiBcIm1lc3NhZ2UvcmZjODIyXCIsXG4gICAgXCJtajJcIjogXCJ2aWRlby9tajJcIixcbiAgICBcIm1qcDJcIjogXCJ2aWRlby9tajJcIixcbiAgICBcIm1rM2RcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJta2FcIjogXCJhdWRpby94LW1hdHJvc2thXCIsXG4gICAgXCJta3NcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJta3ZcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJtbHBcIjogXCJhcHBsaWNhdGlvbi92bmQuZG9sYnkubWxwXCIsXG4gICAgXCJtbWRcIjogXCJhcHBsaWNhdGlvbi92bmQuY2hpcG51dHMua2FyYW9rZS1tbWRcIixcbiAgICBcIm1tZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zbWFmXCIsXG4gICAgXCJtbXJcIjogXCJpbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1tbXJcIixcbiAgICBcIm1uZ1wiOiBcInZpZGVvL3gtbW5nXCIsXG4gICAgXCJtbnlcIjogXCJhcHBsaWNhdGlvbi94LW1zbW9uZXlcIixcbiAgICBcIm1vYmlcIjogXCJhcHBsaWNhdGlvbi94LW1vYmlwb2NrZXQtZWJvb2tcIixcbiAgICBcIm1vZHNcIjogXCJhcHBsaWNhdGlvbi9tb2RzK3htbFwiLFxuICAgIFwibW92XCI6IFwidmlkZW8vcXVpY2t0aW1lXCIsXG4gICAgXCJtb3ZpZVwiOiBcInZpZGVvL3gtc2dpLW1vdmllXCIsXG4gICAgXCJtcDJcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcDIxXCI6IFwiYXBwbGljYXRpb24vbXAyMVwiLFxuICAgIFwibXAyYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wM1wiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm9wdXNcIjogXCJhdWRpby9vcHVzXCIsXG4gICAgXCJtcDRcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wNGFcIjogXCJhdWRpby9tcDRcIixcbiAgICBcIm1wNHNcIjogXCJhcHBsaWNhdGlvbi9tcDRcIixcbiAgICBcIm1wNHZcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uY2VydGlmaWNhdGVcIixcbiAgICBcIm1wZVwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZWdcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGdcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGc0XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcGdhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXBrZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5pbnN0YWxsZXIreG1sXCIsXG4gICAgXCJtcG1cIjogXCJhcHBsaWNhdGlvbi92bmQuYmx1ZWljZS5tdWx0aXBhc3NcIixcbiAgICBcIm1wblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uYXBwbGljYXRpb25cIixcbiAgICBcIm1wcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XCIsXG4gICAgXCJtcHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcHJvamVjdFwiLFxuICAgIFwibXB5XCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5taW5pcGF5XCIsXG4gICAgXCJtcXlcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1xeVwiLFxuICAgIFwibXJjXCI6IFwiYXBwbGljYXRpb24vbWFyY1wiLFxuICAgIFwibXJjeFwiOiBcImFwcGxpY2F0aW9uL21hcmN4bWwreG1sXCIsXG4gICAgXCJtc1wiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1zY21sXCI6IFwiYXBwbGljYXRpb24vbWVkaWFzZXJ2ZXJjb250cm9sK3htbFwiLFxuICAgIFwibXNlZWRcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5tc2VlZFwiLFxuICAgIFwibXNlcVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tc2VxXCIsXG4gICAgXCJtc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24ubXNmXCIsXG4gICAgXCJtc2hcIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJtc2lcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcIm1zbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXNsXCIsXG4gICAgXCJtc3R5XCI6IFwiYXBwbGljYXRpb24vdm5kLm11dmVlLnN0eWxlXCIsXG4gICAgLy9cIm10c1wiOiBcIm1vZGVsL3ZuZC5tdHNcIixcbiAgICBcIm10c1wiOiBcInZpZGVvL210c1wiLFxuICAgIFwibXVzXCI6IFwiYXBwbGljYXRpb24vdm5kLm11c2ljaWFuXCIsXG4gICAgXCJtdXNpY3htbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWNvcmRhcmUubXVzaWN4bWwreG1sXCIsXG4gICAgXCJtdmJcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtd2ZcIjogXCJhcHBsaWNhdGlvbi92bmQubWZlclwiLFxuICAgIFwibXhmXCI6IFwiYXBwbGljYXRpb24vbXhmXCIsXG4gICAgXCJteGxcIjogXCJhcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sXCIsXG4gICAgXCJteG1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJteHNcIjogXCJhcHBsaWNhdGlvbi92bmQudHJpc2NhcGUubXhzXCIsXG4gICAgXCJteHVcIjogXCJ2aWRlby92bmQubXBlZ3VybFwiLFxuICAgIFwibi1nYWdlXCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcIm4zXCI6IFwidGV4dC9uM1wiLFxuICAgIFwibmJcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibmJwXCI6IFwiYXBwbGljYXRpb24vdm5kLndvbGZyYW0ucGxheWVyXCIsXG4gICAgXCJuY1wiOiBcImFwcGxpY2F0aW9uL3gtbmV0Y2RmXCIsXG4gICAgXCJuY3hcIjogXCJhcHBsaWNhdGlvbi94LWR0Ym5jeCt4bWxcIixcbiAgICBcIm5mb1wiOiBcInRleHQveC1uZm9cIixcbiAgICBcIm5nZGF0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5kYXRhXCIsXG4gICAgXCJuaXRmXCI6IFwiYXBwbGljYXRpb24vdm5kLm5pdGZcIixcbiAgICBcIm5sdVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uZXVyb2xhbmd1YWdlLm5sdVwiLFxuICAgIFwibm1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmVubGl2ZW5cIixcbiAgICBcIm5uZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1kaXJlY3RvcnlcIixcbiAgICBcIm5uc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1zZWFsZXJcIixcbiAgICBcIm5ud1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC13ZWJcIixcbiAgICBcIm5weFwiOiBcImltYWdlL3ZuZC5uZXQtZnB4XCIsXG4gICAgXCJuc2NcIjogXCJhcHBsaWNhdGlvbi94LWNvbmZlcmVuY2VcIixcbiAgICBcIm5zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1ub3Rlc1wiLFxuICAgIFwibnRmXCI6IFwiYXBwbGljYXRpb24vdm5kLm5pdGZcIixcbiAgICBcIm56YlwiOiBcImFwcGxpY2F0aW9uL3gtbnpiXCIsXG4gICAgXCJvYTJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5czJcIixcbiAgICBcIm9hM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzM1wiLFxuICAgIFwib2FzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNcIixcbiAgICBcIm9iZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNiaW5kZXJcIixcbiAgICBcIm9ialwiOiBcImFwcGxpY2F0aW9uL3gtdGdpZlwiLFxuICAgIFwib2RhXCI6IFwiYXBwbGljYXRpb24vb2RhXCIsXG4gICAgXCJvZGJcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmRhdGFiYXNlXCIsXG4gICAgXCJvZGNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0XCIsXG4gICAgXCJvZGZcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGFcIixcbiAgICBcIm9kZnRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGEtdGVtcGxhdGVcIixcbiAgICBcIm9kZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3NcIixcbiAgICBcIm9kaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2VcIixcbiAgICBcIm9kbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC1tYXN0ZXJcIixcbiAgICBcIm9kcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uXCIsXG4gICAgXCJvZHNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0XCIsXG4gICAgXCJvZHRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHRcIixcbiAgICBcIm9nYVwiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwib2dnXCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJvZ3ZcIjogXCJ2aWRlby9vZ2dcIixcbiAgICBcIm9neFwiOiBcImFwcGxpY2F0aW9uL29nZ1wiLFxuICAgIFwib21kb2NcIjogXCJhcHBsaWNhdGlvbi9vbWRvYyt4bWxcIixcbiAgICBcIm9uZXBrZ1wiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRtcFwiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRvY1wiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRvYzJcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvcGZcIjogXCJhcHBsaWNhdGlvbi9vZWJwcy1wYWNrYWdlK3htbFwiLFxuICAgIFwib3BtbFwiOiBcInRleHQveC1vcG1sXCIsXG4gICAgXCJvcHJjXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcIm9yZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1vcmdhbml6ZXJcIixcbiAgICBcIm9zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0XCIsXG4gICAgXCJvc2ZwdmdcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLm9wZW5zY29yZWZvcm1hdC5vc2ZwdmcreG1sXCIsXG4gICAgXCJvdGNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0LXRlbXBsYXRlXCIsXG4gICAgXCJvdGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtb3RmXCIsXG4gICAgXCJvdGdcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzLXRlbXBsYXRlXCIsXG4gICAgXCJvdGhcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtd2ViXCIsXG4gICAgXCJvdGlcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlLXRlbXBsYXRlXCIsXG4gICAgXCJvdHBcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbi10ZW1wbGF0ZVwiLFxuICAgIFwib3RzXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldC10ZW1wbGF0ZVwiLFxuICAgIFwib3R0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXRlbXBsYXRlXCIsXG4gICAgXCJveHBzXCI6IFwiYXBwbGljYXRpb24vb3hwc1wiLFxuICAgIFwib3h0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW5vZmZpY2VvcmcuZXh0ZW5zaW9uXCIsXG4gICAgXCJwXCI6IFwidGV4dC94LXBhc2NhbFwiLFxuICAgIFwicDEwXCI6IFwiYXBwbGljYXRpb24vcGtjczEwXCIsXG4gICAgXCJwMTJcIjogXCJhcHBsaWNhdGlvbi94LXBrY3MxMlwiLFxuICAgIFwicDdiXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcIixcbiAgICBcInA3Y1wiOiBcImFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcIixcbiAgICBcInA3bVwiOiBcImFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcIixcbiAgICBcInA3clwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydHJlcXJlc3BcIixcbiAgICBcInA3c1wiOiBcImFwcGxpY2F0aW9uL3BrY3M3LXNpZ25hdHVyZVwiLFxuICAgIFwicDhcIjogXCJhcHBsaWNhdGlvbi9wa2NzOFwiLFxuICAgIFwicGFzXCI6IFwidGV4dC94LXBhc2NhbFwiLFxuICAgIFwicGF3XCI6IFwiYXBwbGljYXRpb24vdm5kLnBhd2FhZmlsZVwiLFxuICAgIFwicGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLnBvd2VyYnVpbGRlcjZcIixcbiAgICBcInBibVwiOiBcImltYWdlL3gtcG9ydGFibGUtYml0bWFwXCIsXG4gICAgXCJwY2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwicGNmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXBjZlwiLFxuICAgIFwicGNsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLXBjbFwiLFxuICAgIFwicGNseGxcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtcGNseGxcIixcbiAgICBcInBjdFwiOiBcImltYWdlL3gtcGljdFwiLFxuICAgIFwicGN1cmxcIjogXCJhcHBsaWNhdGlvbi92bmQuY3VybC5wY3VybFwiLFxuICAgIFwicGN4XCI6IFwiaW1hZ2UveC1wY3hcIixcbiAgICBcInBkYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJwZGZcIjogXCJhcHBsaWNhdGlvbi9wZGZcIixcbiAgICBcInBmYVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZiXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZm1cIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmclwiOiBcImFwcGxpY2F0aW9uL2ZvbnQtdGRwZnJcIixcbiAgICBcInBmeFwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczEyXCIsXG4gICAgXCJwZ21cIjogXCJpbWFnZS94LXBvcnRhYmxlLWdyYXltYXBcIixcbiAgICBcInBnblwiOiBcImFwcGxpY2F0aW9uL3gtY2hlc3MtcGduXCIsXG4gICAgXCJwZ3BcIjogXCJhcHBsaWNhdGlvbi9wZ3AtZW5jcnlwdGVkXCIsXG4gICAgXCJwaGFyXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJwaHBcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJwaHBzXCI6IFwiYXBwbGljYXRpb24veC1odHRwZC1waHBzXCIsXG4gICAgXCJwaWNcIjogXCJpbWFnZS94LXBpY3RcIixcbiAgICBcInBrZ1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwicGtpXCI6IFwiYXBwbGljYXRpb24vcGtpeGNtcFwiLFxuICAgIFwicGtpcGF0aFwiOiBcImFwcGxpY2F0aW9uL3BraXgtcGtpcGF0aFwiLFxuICAgIFwicGxiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LWxhcmdlXCIsXG4gICAgXCJwbGNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnBsY1wiLFxuICAgIFwicGxmXCI6IFwiYXBwbGljYXRpb24vdm5kLnBvY2tldGxlYXJuXCIsXG4gICAgXCJwbGlzdFwiOiBcImFwcGxpY2F0aW9uL3gtcGxpc3RcIixcbiAgICBcInBsc1wiOiBcImFwcGxpY2F0aW9uL3Bscyt4bWxcIixcbiAgICBcInBtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdGMtcG9zbWxcIixcbiAgICBcInBuZ1wiOiBcImltYWdlL3BuZ1wiLFxuICAgIFwicG5tXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1hbnltYXBcIixcbiAgICBcInBvcnRwa2dcIjogXCJhcHBsaWNhdGlvbi92bmQubWFjcG9ydHMucG9ydHBrZ1wiLFxuICAgIFwicG90XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBvdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBvdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwudGVtcGxhdGVcIixcbiAgICBcInBwYW1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXBzLXBwZFwiLFxuICAgIFwicHBtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1waXhtYXBcIixcbiAgICBcInBwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwcHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGVzaG93Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHBzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZXNob3dcIixcbiAgICBcInBwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwcHRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQucHJlc2VudGF0aW9uLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHB0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIixcbiAgICBcInBxYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJwcmNcIjogXCJhcHBsaWNhdGlvbi94LW1vYmlwb2NrZXQtZWJvb2tcIixcbiAgICBcInByZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1mcmVlbGFuY2VcIixcbiAgICBcInByZlwiOiBcImFwcGxpY2F0aW9uL3BpY3MtcnVsZXNcIixcbiAgICBcInBzXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwicHNiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LXNtYWxsXCIsXG4gICAgXCJwc2RcIjogXCJpbWFnZS92bmQuYWRvYmUucGhvdG9zaG9wXCIsXG4gICAgXCJwc2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtbGludXgtcHNmXCIsXG4gICAgXCJwc2tjeG1sXCI6IFwiYXBwbGljYXRpb24vcHNrYyt4bWxcIixcbiAgICBcInB0aWRcIjogXCJhcHBsaWNhdGlvbi92bmQucHZpLnB0aWQxXCIsXG4gICAgXCJwdWJcIjogXCJhcHBsaWNhdGlvbi94LW1zcHVibGlzaGVyXCIsXG4gICAgXCJwdmJcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctdmFyXCIsXG4gICAgXCJwd25cIjogXCJhcHBsaWNhdGlvbi92bmQuM20ucG9zdC1pdC1ub3Rlc1wiLFxuICAgIFwicHlhXCI6IFwiYXVkaW8vdm5kLm1zLXBsYXlyZWFkeS5tZWRpYS5weWFcIixcbiAgICBcInB5dlwiOiBcInZpZGVvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHl2XCIsXG4gICAgXCJxYW1cIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24ucXVpY2thbmltZVwiLFxuICAgIFwicWJvXCI6IFwiYXBwbGljYXRpb24vdm5kLmludHUucWJvXCIsXG4gICAgXCJxZnhcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50dS5xZnhcIixcbiAgICBcInFwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wdWJsaXNoYXJlLWRlbHRhLXRyZWVcIixcbiAgICBcInF0XCI6IFwidmlkZW8vcXVpY2t0aW1lXCIsXG4gICAgXCJxd2RcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF3dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhiXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGRcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXh0XCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJyYVwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvXCIsXG4gICAgXCJyYW1cIjogXCJhdWRpby94LXBuLXJlYWxhdWRpb1wiLFxuICAgIFwicmFyXCI6IFwiYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZFwiLFxuICAgIFwicmFzXCI6IFwiaW1hZ2UveC1jbXUtcmFzdGVyXCIsXG4gICAgXCJyYlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInJjcHJvZmlsZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcHVucGx1Z2dlZC5yY3Byb2ZpbGVcIixcbiAgICBcInJkZlwiOiBcImFwcGxpY2F0aW9uL3JkZit4bWxcIixcbiAgICBcInJkelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kYXRhLXZpc2lvbi5yZHpcIixcbiAgICBcInJlcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5idXNpbmVzc29iamVjdHNcIixcbiAgICBcInJlc1wiOiBcImFwcGxpY2F0aW9uL3gtZHRicmVzb3VyY2UreG1sXCIsXG4gICAgXCJyZXN4XCI6IFwidGV4dC94bWxcIixcbiAgICBcInJnYlwiOiBcImltYWdlL3gtcmdiXCIsXG4gICAgXCJyaWZcIjogXCJhcHBsaWNhdGlvbi9yZWdpbmZvK3htbFwiLFxuICAgIFwicmlwXCI6IFwiYXVkaW8vdm5kLnJpcFwiLFxuICAgIFwicmlzXCI6IFwiYXBwbGljYXRpb24veC1yZXNlYXJjaC1pbmZvLXN5c3RlbXNcIixcbiAgICBcInJsXCI6IFwiYXBwbGljYXRpb24vcmVzb3VyY2UtbGlzdHMreG1sXCIsXG4gICAgXCJybGNcIjogXCJpbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1ybGNcIixcbiAgICBcInJsZFwiOiBcImFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzLWRpZmYreG1sXCIsXG4gICAgXCJybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWFcIixcbiAgICBcInJtaVwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcInJtcFwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvLXBsdWdpblwiLFxuICAgIFwicm1zXCI6IFwiYXBwbGljYXRpb24vdm5kLmpjcC5qYXZhbWUubWlkbGV0LXJtc1wiLFxuICAgIFwicm12YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWEtdmJyXCIsXG4gICAgXCJybmNcIjogXCJhcHBsaWNhdGlvbi9yZWxheC1uZy1jb21wYWN0LXN5bnRheFwiLFxuICAgIFwicm9hXCI6IFwiYXBwbGljYXRpb24vcnBraS1yb2FcIixcbiAgICBcInJvZmZcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJycDlcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvYW50by5ycDlcIixcbiAgICBcInJwbVwiOiBcImFwcGxpY2F0aW9uL3gtcnBtXCIsXG4gICAgXCJycHNzXCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldHNcIixcbiAgICBcInJwc3RcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEucmFkaW8tcHJlc2V0XCIsXG4gICAgXCJycVwiOiBcImFwcGxpY2F0aW9uL3NwYXJxbC1xdWVyeVwiLFxuICAgIFwicnNcIjogXCJhcHBsaWNhdGlvbi9ybHMtc2VydmljZXMreG1sXCIsXG4gICAgXCJyc2RcIjogXCJhcHBsaWNhdGlvbi9yc2QreG1sXCIsXG4gICAgXCJyc3NcIjogXCJhcHBsaWNhdGlvbi9yc3MreG1sXCIsXG4gICAgXCJydGZcIjogXCJhcHBsaWNhdGlvbi9ydGZcIixcbiAgICBcInJ0eFwiOiBcInRleHQvcmljaHRleHRcIixcbiAgICBcInNcIjogXCJ0ZXh0L3gtYXNtXCIsXG4gICAgXCJzM21cIjogXCJhdWRpby9zM21cIixcbiAgICBcInM3elwiOiBcImFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFwiLFxuICAgIFwic2FmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5zbWFmLWF1ZGlvXCIsXG4gICAgXCJzYWZhcmlleHR6XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJzYXNzXCI6IFwidGV4dC94LXNhc3NcIixcbiAgICBcInNibWxcIjogXCJhcHBsaWNhdGlvbi9zYm1sK3htbFwiLFxuICAgIFwic2NcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLnNlY3VyZS1jb250YWluZXJcIixcbiAgICBcInNjZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNzY2hlZHVsZVwiLFxuICAgIFwic2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLXNjcmVlbmNhbVwiLFxuICAgIFwic2NxXCI6IFwiYXBwbGljYXRpb24vc2N2cC1jdi1yZXF1ZXN0XCIsXG4gICAgXCJzY3NcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLWN2LXJlc3BvbnNlXCIsXG4gICAgXCJzY3NzXCI6IFwidGV4dC94LXNjc3NcIixcbiAgICBcInNjdXJsXCI6IFwidGV4dC92bmQuY3VybC5zY3VybFwiLFxuICAgIFwic2RhXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5kcmF3XCIsXG4gICAgXCJzZGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmNhbGNcIixcbiAgICBcInNkZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uaW1wcmVzc1wiLFxuICAgIFwic2RrZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zb2xlbnQuc2RrbSt4bWxcIixcbiAgICBcInNka21cIjogXCJhcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXCIsXG4gICAgXCJzZHBcIjogXCJhcHBsaWNhdGlvbi9zZHBcIixcbiAgICBcInNkd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyXCIsXG4gICAgXCJzZWVcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VlbWFpbFwiLFxuICAgIFwic2VlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLnNlZWRcIixcbiAgICBcInNlbWFcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtYVwiLFxuICAgIFwic2VtZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1kXCIsXG4gICAgXCJzZW1mXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWZcIixcbiAgICBcInNlclwiOiBcImFwcGxpY2F0aW9uL2phdmEtc2VyaWFsaXplZC1vYmplY3RcIixcbiAgICBcInNldHBheVwiOiBcImFwcGxpY2F0aW9uL3NldC1wYXltZW50LWluaXRpYXRpb25cIixcbiAgICBcInNldHJlZ1wiOiBcImFwcGxpY2F0aW9uL3NldC1yZWdpc3RyYXRpb24taW5pdGlhdGlvblwiLFxuICAgIFwic2ZkLWhkc3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLmh5ZHJvc3RhdGl4LnNvZi1kYXRhXCIsXG4gICAgXCJzZnNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3BvdGZpcmUuc2ZzXCIsXG4gICAgXCJzZnZcIjogXCJ0ZXh0L3gtc2Z2XCIsXG4gICAgXCJzZ2lcIjogXCJpbWFnZS9zZ2lcIixcbiAgICBcInNnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyLWdsb2JhbFwiLFxuICAgIFwic2dtXCI6IFwidGV4dC9zZ21sXCIsXG4gICAgXCJzZ21sXCI6IFwidGV4dC9zZ21sXCIsXG4gICAgXCJzaFwiOiBcImFwcGxpY2F0aW9uL3gtc2hcIixcbiAgICBcInNoYXJcIjogXCJhcHBsaWNhdGlvbi94LXNoYXJcIixcbiAgICBcInNoZlwiOiBcImFwcGxpY2F0aW9uL3NoZit4bWxcIixcbiAgICBcInNpZFwiOiBcImltYWdlL3gtbXJzaWQtaW1hZ2VcIixcbiAgICBcInNpZ1wiOiBcImFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcIixcbiAgICBcInNpbFwiOiBcImF1ZGlvL3NpbGtcIixcbiAgICBcInNpbG9cIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJzaXNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJzaXN4XCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwic2l0XCI6IFwiYXBwbGljYXRpb24veC1zdHVmZml0XCIsXG4gICAgXCJzaXR4XCI6IFwiYXBwbGljYXRpb24veC1zdHVmZml0eFwiLFxuICAgIFwic2tkXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza3BcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2t0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNsZG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5zbGlkZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInNsZHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVcIixcbiAgICBcInNsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5zYWx0XCIsXG4gICAgXCJzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEuc3RlcGNoYXJ0XCIsXG4gICAgXCJzbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLm1hdGhcIixcbiAgICBcInNtaVwiOiBcImFwcGxpY2F0aW9uL3NtaWwreG1sXCIsXG4gICAgXCJzbWlsXCI6IFwiYXBwbGljYXRpb24vc21pbCt4bWxcIixcbiAgICBcInNtdlwiOiBcInZpZGVvL3gtc212XCIsXG4gICAgXCJzbXppcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEucGFja2FnZVwiLFxuICAgIFwic25kXCI6IFwiYXVkaW8vYmFzaWNcIixcbiAgICBcInNuZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1zbmZcIixcbiAgICBcInNvXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJzcGNcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRpZmljYXRlc1wiLFxuICAgIFwic3BmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5zbWFmLXBocmFzZVwiLFxuICAgIFwic3BsXCI6IFwiYXBwbGljYXRpb24veC1mdXR1cmVzcGxhc2hcIixcbiAgICBcInNwb3RcIjogXCJ0ZXh0L3ZuZC5pbjNkLnNwb3RcIixcbiAgICBcInNwcFwiOiBcImFwcGxpY2F0aW9uL3NjdnAtdnAtcmVzcG9uc2VcIixcbiAgICBcInNwcVwiOiBcImFwcGxpY2F0aW9uL3NjdnAtdnAtcmVxdWVzdFwiLFxuICAgIFwic3B4XCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJzcWxcIjogXCJhcHBsaWNhdGlvbi94LXNxbFwiLFxuICAgIFwic3JjXCI6IFwiYXBwbGljYXRpb24veC13YWlzLXNvdXJjZVwiLFxuICAgIFwic3J0XCI6IFwiYXBwbGljYXRpb24veC1zdWJyaXBcIixcbiAgICBcInNydVwiOiBcImFwcGxpY2F0aW9uL3NydSt4bWxcIixcbiAgICBcInNyeFwiOiBcImFwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK3htbFwiLFxuICAgIFwic3NkbFwiOiBcImFwcGxpY2F0aW9uL3NzZGwreG1sXCIsXG4gICAgXCJzc2VcIjogXCJhcHBsaWNhdGlvbi92bmQua29kYWstZGVzY3JpcHRvclwiLFxuICAgIFwic3NmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnNzZlwiLFxuICAgIFwic3NtbFwiOiBcImFwcGxpY2F0aW9uL3NzbWwreG1sXCIsXG4gICAgXCJzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zYWlsaW5ndHJhY2tlci50cmFja1wiLFxuICAgIFwic3RjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsYy50ZW1wbGF0ZVwiLFxuICAgIFwic3RkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuZHJhdy50ZW1wbGF0ZVwiLFxuICAgIFwic3RmXCI6IFwiYXBwbGljYXRpb24vdm5kLnd0LnN0ZlwiLFxuICAgIFwic3RpXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzcy50ZW1wbGF0ZVwiLFxuICAgIFwic3RrXCI6IFwiYXBwbGljYXRpb24vaHlwZXJzdHVkaW9cIixcbiAgICBcInN0bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc3RsXCIsXG4gICAgXCJzdHJcIjogXCJhcHBsaWNhdGlvbi92bmQucGcuZm9ybWF0XCIsXG4gICAgXCJzdHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXIudGVtcGxhdGVcIixcbiAgICBcInN0eWxcIjogXCJ0ZXh0L3gtc3R5bFwiLFxuICAgIFwic3ViXCI6IFwiaW1hZ2Uvdm5kLmR2Yi5zdWJ0aXRsZVwiLFxuICAgIFwic3VzXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1cy1jYWxlbmRhclwiLFxuICAgIFwic3VzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcIixcbiAgICBcInN2NGNwaW9cIjogXCJhcHBsaWNhdGlvbi94LXN2NGNwaW9cIixcbiAgICBcInN2NGNyY1wiOiBcImFwcGxpY2F0aW9uL3gtc3Y0Y3JjXCIsXG4gICAgXCJzdmNcIjogXCJhcHBsaWNhdGlvbi92bmQuZHZiLnNlcnZpY2VcIixcbiAgICBcInN2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdmRcIixcbiAgICBcInN2Z1wiOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICBcInN2Z3pcIjogXCJpbWFnZS9zdmcreG1sXCIsXG4gICAgXCJzd2FcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJzd2ZcIjogXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiLFxuICAgIFwic3dpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFyaXN0YW5ldHdvcmtzLnN3aVwiLFxuICAgIFwic3hjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsY1wiLFxuICAgIFwic3hkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuZHJhd1wiLFxuICAgIFwic3hnXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLmdsb2JhbFwiLFxuICAgIFwic3hpXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzc1wiLFxuICAgIFwic3htXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwubWF0aFwiLFxuICAgIFwic3h3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyXCIsXG4gICAgXCJ0XCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwidDNcIjogXCJhcHBsaWNhdGlvbi94LXQzdm0taW1hZ2VcIixcbiAgICBcInRhZ2xldFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5teW5mY1wiLFxuICAgIFwidGFvXCI6IFwiYXBwbGljYXRpb24vdm5kLnRhby5pbnRlbnQtbW9kdWxlLWFyY2hpdmVcIixcbiAgICBcInRhclwiOiBcImFwcGxpY2F0aW9uL3gtdGFyXCIsXG4gICAgXCJ0Y2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAyLnRjYXBcIixcbiAgICBcInRjbFwiOiBcImFwcGxpY2F0aW9uL3gtdGNsXCIsXG4gICAgXCJ0ZWFjaGVyXCI6IFwiYXBwbGljYXRpb24vdm5kLnNtYXJ0LnRlYWNoZXJcIixcbiAgICBcInRlaVwiOiBcImFwcGxpY2F0aW9uL3RlaSt4bWxcIixcbiAgICBcInRlaWNvcnB1c1wiOiBcImFwcGxpY2F0aW9uL3RlaSt4bWxcIixcbiAgICBcInRleFwiOiBcImFwcGxpY2F0aW9uL3gtdGV4XCIsXG4gICAgXCJ0ZXhpXCI6IFwiYXBwbGljYXRpb24veC10ZXhpbmZvXCIsXG4gICAgXCJ0ZXhpbmZvXCI6IFwiYXBwbGljYXRpb24veC10ZXhpbmZvXCIsXG4gICAgXCJ0ZXh0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwidGZpXCI6IFwiYXBwbGljYXRpb24vdGhyYXVkK3htbFwiLFxuICAgIFwidGZtXCI6IFwiYXBwbGljYXRpb24veC10ZXgtdGZtXCIsXG4gICAgXCJ0Z2FcIjogXCJpbWFnZS94LXRnYVwiLFxuICAgIFwidGd6XCI6IFwiYXBwbGljYXRpb24veC1nemlwXCIsXG4gICAgXCJ0aG14XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLW9mZmljZXRoZW1lXCIsXG4gICAgXCJ0aWZcIjogXCJpbWFnZS90aWZmXCIsXG4gICAgXCJ0aWZmXCI6IFwiaW1hZ2UvdGlmZlwiLFxuICAgIFwidG1vXCI6IFwiYXBwbGljYXRpb24vdm5kLnRtb2JpbGUtbGl2ZXR2XCIsXG4gICAgXCJ0b3JyZW50XCI6IFwiYXBwbGljYXRpb24veC1iaXR0b3JyZW50XCIsXG4gICAgXCJ0cGxcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtdGVtcGxhdGVcIixcbiAgICBcInRwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50cmlkLnRwdFwiLFxuICAgIFwidHJcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJ0cmFcIjogXCJhcHBsaWNhdGlvbi92bmQudHJ1ZWFwcFwiLFxuICAgIFwidHJtXCI6IFwiYXBwbGljYXRpb24veC1tc3Rlcm1pbmFsXCIsXG4gICAgXCJ0c2RcIjogXCJhcHBsaWNhdGlvbi90aW1lc3RhbXBlZC1kYXRhXCIsXG4gICAgXCJ0c3ZcIjogXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsXG4gICAgXCJ0dGNcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHRmXCIsXG4gICAgXCJ0dGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHRmXCIsXG4gICAgXCJ0dGxcIjogXCJ0ZXh0L3R1cnRsZVwiLFxuICAgIFwidHdkXCI6IFwiYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclwiLFxuICAgIFwidHdkc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaW10ZWNoLW1pbmRtYXBwZXJcIixcbiAgICBcInR4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW5vbWF0aXgudHV4ZWRvXCIsXG4gICAgXCJ0eGZcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnR4ZlwiLFxuICAgIFwidHh0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwidTMyXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwidWRlYlwiOiBcImFwcGxpY2F0aW9uL3gtZGViaWFuLXBhY2thZ2VcIixcbiAgICBcInVmZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51ZmRsXCIsXG4gICAgXCJ1ZmRsXCI6IFwiYXBwbGljYXRpb24vdm5kLnVmZGxcIixcbiAgICBcInVseFwiOiBcImFwcGxpY2F0aW9uL3gtZ2x1bHhcIixcbiAgICBcInVtalwiOiBcImFwcGxpY2F0aW9uL3ZuZC51bWFqaW5cIixcbiAgICBcInVuaXR5d2ViXCI6IFwiYXBwbGljYXRpb24vdm5kLnVuaXR5XCIsXG4gICAgXCJ1b21sXCI6IFwiYXBwbGljYXRpb24vdm5kLnVvbWwreG1sXCIsXG4gICAgXCJ1cmlcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1cmlzXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXJsc1wiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVzdGFyXCI6IFwiYXBwbGljYXRpb24veC11c3RhclwiLFxuICAgIFwidXR6XCI6IFwiYXBwbGljYXRpb24vdm5kLnVpcS50aGVtZVwiLFxuICAgIFwidXVcIjogXCJ0ZXh0L3gtdXVlbmNvZGVcIixcbiAgICBcInV2YVwiOiBcImF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXCIsXG4gICAgXCJ1dmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dmZcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dmdcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dmhcIjogXCJ2aWRlby92bmQuZGVjZS5oZFwiLFxuICAgIFwidXZpXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZtXCI6IFwidmlkZW8vdm5kLmRlY2UubW9iaWxlXCIsXG4gICAgXCJ1dnBcIjogXCJ2aWRlby92bmQuZGVjZS5wZFwiLFxuICAgIFwidXZzXCI6IFwidmlkZW8vdm5kLmRlY2Uuc2RcIixcbiAgICBcInV2dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnR0bWwreG1sXCIsXG4gICAgXCJ1dnVcIjogXCJ2aWRlby92bmQudXZ2dS5tcDRcIixcbiAgICBcInV2dlwiOiBcInZpZGVvL3ZuZC5kZWNlLnZpZGVvXCIsXG4gICAgXCJ1dnZhXCI6IFwiYXVkaW8vdm5kLmRlY2UuYXVkaW9cIixcbiAgICBcInV2dmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dnZmXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZ2Z1wiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2dmhcIjogXCJ2aWRlby92bmQuZGVjZS5oZFwiLFxuICAgIFwidXZ2aVwiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2dm1cIjogXCJ2aWRlby92bmQuZGVjZS5tb2JpbGVcIixcbiAgICBcInV2dnBcIjogXCJ2aWRlby92bmQuZGVjZS5wZFwiLFxuICAgIFwidXZ2c1wiOiBcInZpZGVvL3ZuZC5kZWNlLnNkXCIsXG4gICAgXCJ1dnZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcIixcbiAgICBcInV2dnVcIjogXCJ2aWRlby92bmQudXZ2dS5tcDRcIixcbiAgICBcInV2dnZcIjogXCJ2aWRlby92bmQuZGVjZS52aWRlb1wiLFxuICAgIFwidXZ2eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXCIsXG4gICAgXCJ1dnZ6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuemlwXCIsXG4gICAgXCJ1dnhcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS51bnNwZWNpZmllZFwiLFxuICAgIFwidXZ6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuemlwXCIsXG4gICAgXCJ2Y2FyZFwiOiBcInRleHQvdmNhcmRcIixcbiAgICBcInZjZFwiOiBcImFwcGxpY2F0aW9uL3gtY2RsaW5rXCIsXG4gICAgXCJ2Y2ZcIjogXCJ0ZXh0L3gtdmNhcmRcIixcbiAgICBcInZjZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdmNhcmRcIixcbiAgICBcInZjc1wiOiBcInRleHQveC12Y2FsZW5kYXJcIixcbiAgICBcInZjeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52Y3hcIixcbiAgICBcInZpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb25hcnlcIixcbiAgICBcInZpdlwiOiBcInZpZGVvL3ZuZC52aXZvXCIsXG4gICAgXCJ2b2JcIjogXCJ2aWRlby94LW1zLXZvYlwiLFxuICAgIFwidm9yXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXJcIixcbiAgICBcInZveFwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcInZybWxcIjogXCJtb2RlbC92cm1sXCIsXG4gICAgXCJ2c2RcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC52c2ZcIixcbiAgICBcInZzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnN0XCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c3dcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZ0dVwiOiBcIm1vZGVsL3ZuZC52dHVcIixcbiAgICBcInZ4bWxcIjogXCJhcHBsaWNhdGlvbi92b2ljZXhtbCt4bWxcIixcbiAgICBcInczZFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcIndhZFwiOiBcImFwcGxpY2F0aW9uL3gtZG9vbVwiLFxuICAgIFwid2F2XCI6IFwiYXVkaW8veC13YXZcIixcbiAgICBcIndheFwiOiBcImF1ZGlvL3gtbXMtd2F4XCIsXG4gICAgXCJ3Ym1wXCI6IFwiaW1hZ2Uvdm5kLndhcC53Ym1wXCIsXG4gICAgXCJ3YnNcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpdGljYWx0b29scy53YnMreG1sXCIsXG4gICAgXCJ3YnhtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud2J4bWxcIixcbiAgICBcIndjbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid2RiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3ZHBcIjogXCJpbWFnZS92bmQubXMtcGhvdG9cIixcbiAgICBcIndlYmFcIjogXCJhdWRpby93ZWJtXCIsXG4gICAgXCJ3ZWJtXCI6IFwidmlkZW8vd2VibVwiLFxuICAgIFwid2VicFwiOiBcImltYWdlL3dlYnBcIixcbiAgICBcIndnXCI6IFwiYXBwbGljYXRpb24vdm5kLnBtaS53aWRnZXRcIixcbiAgICBcIndndFwiOiBcImFwcGxpY2F0aW9uL3dpZGdldFwiLFxuICAgIFwid2tzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3bVwiOiBcInZpZGVvL3gtbXMtd21cIixcbiAgICBcIndtYVwiOiBcImF1ZGlvL3gtbXMtd21hXCIsXG4gICAgXCJ3bWRcIjogXCJhcHBsaWNhdGlvbi94LW1zLXdtZFwiLFxuICAgIFwid21mXCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJ3bWxcIjogXCJ0ZXh0L3ZuZC53YXAud21sXCIsXG4gICAgXCJ3bWxjXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53bWxjXCIsXG4gICAgXCJ3bWxzXCI6IFwidGV4dC92bmQud2FwLndtbHNjcmlwdFwiLFxuICAgIFwid21sc2NcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndtbHNjcmlwdGNcIixcbiAgICBcIndtdlwiOiBcInZpZGVvL3gtbXMtd212XCIsXG4gICAgXCJ3bXhcIjogXCJ2aWRlby94LW1zLXdteFwiLFxuICAgIFwid216XCI6IFwiYXBwbGljYXRpb24veC1tcy13bXpcIixcbiAgICBcIndvZmZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtd29mZlwiLFxuICAgIFwid3BkXCI6IFwiYXBwbGljYXRpb24vdm5kLndvcmRwZXJmZWN0XCIsXG4gICAgXCJ3cGxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd3BsXCIsXG4gICAgXCJ3cHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndxZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53cWRcIixcbiAgICBcIndyaVwiOiBcImFwcGxpY2F0aW9uL3gtbXN3cml0ZVwiLFxuICAgIFwid3JsXCI6IFwibW9kZWwvdnJtbFwiLFxuICAgIFwid3NkbFwiOiBcImFwcGxpY2F0aW9uL3dzZGwreG1sXCIsXG4gICAgXCJ3c3BvbGljeVwiOiBcImFwcGxpY2F0aW9uL3dzcG9saWN5K3htbFwiLFxuICAgIFwid3RiXCI6IFwiYXBwbGljYXRpb24vdm5kLndlYnR1cmJvXCIsXG4gICAgXCJ3dnhcIjogXCJ2aWRlby94LW1zLXd2eFwiLFxuICAgIFwieDMyXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwieDNkXCI6IFwibW9kZWwveDNkK3htbFwiLFxuICAgIFwieDNkYlwiOiBcIm1vZGVsL3gzZCtiaW5hcnlcIixcbiAgICBcIngzZGJ6XCI6IFwibW9kZWwveDNkK2JpbmFyeVwiLFxuICAgIFwieDNkdlwiOiBcIm1vZGVsL3gzZCt2cm1sXCIsXG4gICAgXCJ4M2R2elwiOiBcIm1vZGVsL3gzZCt2cm1sXCIsXG4gICAgXCJ4M2R6XCI6IFwibW9kZWwveDNkK3htbFwiLFxuICAgIFwieGFtbFwiOiBcImFwcGxpY2F0aW9uL3hhbWwreG1sXCIsXG4gICAgXCJ4YXBcIjogXCJhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LWFwcFwiLFxuICAgIFwieGFyXCI6IFwiYXBwbGljYXRpb24vdm5kLnhhcmFcIixcbiAgICBcInhiYXBcIjogXCJhcHBsaWNhdGlvbi94LW1zLXhiYXBcIixcbiAgICBcInhiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzLmJpbmRlclwiLFxuICAgIFwieGJtXCI6IFwiaW1hZ2UveC14Yml0bWFwXCIsXG4gICAgXCJ4ZGZcIjogXCJhcHBsaWNhdGlvbi94Y2FwLWRpZmYreG1sXCIsXG4gICAgXCJ4ZG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3htbFwiLFxuICAgIFwieGRwXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLnhkcCt4bWxcIixcbiAgICBcInhkc3NjXCI6IFwiYXBwbGljYXRpb24vZHNzYyt4bWxcIixcbiAgICBcInhkd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzXCIsXG4gICAgXCJ4ZW5jXCI6IFwiYXBwbGljYXRpb24veGVuYyt4bWxcIixcbiAgICBcInhlclwiOiBcImFwcGxpY2F0aW9uL3BhdGNoLW9wcy1lcnJvcit4bWxcIixcbiAgICBcInhmZGZcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUueGZkZlwiLFxuICAgIFwieGZkbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC54ZmRsXCIsXG4gICAgXCJ4aHRcIjogXCJhcHBsaWNhdGlvbi94aHRtbCt4bWxcIixcbiAgICBcInhodG1sXCI6IFwiYXBwbGljYXRpb24veGh0bWwreG1sXCIsXG4gICAgXCJ4aHZtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieGlmXCI6IFwiaW1hZ2Uvdm5kLnhpZmZcIixcbiAgICBcInhsYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxmXCI6IFwiYXBwbGljYXRpb24veC14bGlmZit4bWxcIixcbiAgICBcInhsbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHNiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0LmJpbmFyeS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsc21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHN4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXRcIixcbiAgICBcInhsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGx0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZVwiLFxuICAgIFwieGx3XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bVwiOiBcImF1ZGlvL3htXCIsXG4gICAgXCJ4bWxcIjogXCJhcHBsaWNhdGlvbi94bWxcIixcbiAgICBcInhvXCI6IFwiYXBwbGljYXRpb24vdm5kLm9scGMtc3VnYXJcIixcbiAgICBcInhvcFwiOiBcImFwcGxpY2F0aW9uL3hvcCt4bWxcIixcbiAgICBcInhwaVwiOiBcImFwcGxpY2F0aW9uL3gteHBpbnN0YWxsXCIsXG4gICAgXCJ4cGxcIjogXCJhcHBsaWNhdGlvbi94cHJvYyt4bWxcIixcbiAgICBcInhwbVwiOiBcImltYWdlL3gteHBpeG1hcFwiLFxuICAgIFwieHByXCI6IFwiYXBwbGljYXRpb24vdm5kLmlzLXhwclwiLFxuICAgIFwieHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXhwc2RvY3VtZW50XCIsXG4gICAgXCJ4cHdcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJjb24uZm9ybW5ldFwiLFxuICAgIFwieHB4XCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyY29uLmZvcm1uZXRcIixcbiAgICBcInhzbFwiOiBcImFwcGxpY2F0aW9uL3htbFwiLFxuICAgIFwieHNsdFwiOiBcImFwcGxpY2F0aW9uL3hzbHQreG1sXCIsXG4gICAgXCJ4c21cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sK3htbFwiLFxuICAgIFwieHNwZlwiOiBcImFwcGxpY2F0aW9uL3hzcGYreG1sXCIsXG4gICAgXCJ4dWxcIjogXCJhcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sXCIsXG4gICAgXCJ4dm1cIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInh2bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInh3ZFwiOiBcImltYWdlL3gteHdpbmRvd2R1bXBcIixcbiAgICBcInh5elwiOiBcImNoZW1pY2FsL3gteHl6XCIsXG4gICAgXCJ4elwiOiBcImFwcGxpY2F0aW9uL3gteHpcIixcbiAgICBcInlhbWxcIjogXCJ0ZXh0L3lhbWxcIixcbiAgICBcInlhbmdcIjogXCJhcHBsaWNhdGlvbi95YW5nXCIsXG4gICAgXCJ5aW5cIjogXCJhcHBsaWNhdGlvbi95aW4reG1sXCIsXG4gICAgXCJ5bWxcIjogXCJ0ZXh0L3lhbWxcIixcbiAgICBcInpcIjogXCJhcHBsaWNhdGlvbi94LWNvbXByZXNzXCIsXG4gICAgXCJ6MVwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInoyXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejNcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NFwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno1XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejZcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6N1wiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno4XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiemF6XCI6IFwiYXBwbGljYXRpb24vdm5kLnp6YXp6LmRlY2sreG1sXCIsXG4gICAgXCJ6aXBcIjogXCJhcHBsaWNhdGlvbi96aXBcIixcbiAgICBcInppclwiOiBcImFwcGxpY2F0aW9uL3ZuZC56dWxcIixcbiAgICBcInppcnpcIjogXCJhcHBsaWNhdGlvbi92bmQuenVsXCIsXG4gICAgXCJ6bW1cIjogXCJhcHBsaWNhdGlvbi92bmQuaGFuZGhlbGQtZW50ZXJ0YWlubWVudCt4bWxcIixcbiAgICBcIjEyM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy0xLTItM1wiXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWltZS10eXBlcy1tb2R1bGUuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5hc3luYyBmdW5jdGlvbiBhZnRlckZldGNoKHJlc3BvbnNlKSB7XG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgYmFkIHJlc3BvbnNlIDogJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSB8fCAnYXBwbGljYXRpb24vanNvbic7XG4gICAgbGV0IHNjaSA9IHJlY2VpdmVkQ29udGVudFR5cGUuaW5kZXhPZignOycpO1xuICAgIGlmIChzY2kgPj0gMClcbiAgICAgICAgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlY2VpdmVkQ29udGVudFR5cGUuc3Vic3RyKDAsIHNjaSk7XG4gICAgaWYgKHJlY2VpdmVkQ29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cbmZ1bmN0aW9uIGdldERhdGEodXJsLCBoZWFkZXJzID0gbnVsbCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInXG4gICAgfTtcbiAgICBpZiAoaGVhZGVycylcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0gaGVhZGVycztcbiAgICByZXR1cm4gZmV0Y2godXJsLCBvcHRpb25zKVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZ2V0RGF0YSA9IGdldERhdGE7XG5mdW5jdGlvbiBwb3N0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucG9zdERhdGEgPSBwb3N0RGF0YTtcbmZ1bmN0aW9uIHB1dERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucHV0RGF0YSA9IHB1dERhdGE7XG5mdW5jdGlvbiBkZWxldGVEYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmRlbGV0ZURhdGEgPSBkZWxldGVEYXRhO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PSBcImhvbWUubHRlY29uc3VsdGluZy5mclwiID8gXCJodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mclwiIDogXCJodHRwczovL2xvY2FsaG9zdDo1MDA1XCI7XG5hc3luYyBmdW5jdGlvbiBzZWFyY2goc2VhcmNoVGV4dCwgbWltZVR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgIG5hbWU6IHNlYXJjaFRleHQsXG4gICAgICAgICAgICBtaW1lVHlwZTogbWltZVR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyByZXN1bHREaXJlY3RvcmllcywgcmVzdWx0RmlsZXNkZGQsIGl0ZW1zIH0gPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NlYXJjaGAsIHNlYXJjaFNwZWMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IHJlc3VsdERpcmVjdG9yaWVzLFxuICAgICAgICAgICAgZmlsZXM6IHJlc3VsdEZpbGVzZGRkLFxuICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLnNlYXJjaCA9IHNlYXJjaDtcbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEV4KHNlYXJjaFNwZWMpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHJlc3VsdERpcmVjdG9yaWVzLCByZXN1bHRGaWxlc2RkZCwgaXRlbXMgfSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2VhcmNoYCwgc2VhcmNoU3BlYyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXJlY3RvcmllczogcmVzdWx0RGlyZWN0b3JpZXMsXG4gICAgICAgICAgICBmaWxlczogcmVzdWx0RmlsZXNkZGQsXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuc2VhcmNoRXggPSBzZWFyY2hFeDtcbmFzeW5jIGZ1bmN0aW9uIGdldERpcmVjdG9yeURlc2NyaXB0b3Ioc2hhKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT1hcHBsaWNhdGlvbi9qc29uYCk7XG59XG5leHBvcnRzLmdldERpcmVjdG9yeURlc2NyaXB0b3IgPSBnZXREaXJlY3RvcnlEZXNjcmlwdG9yO1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3JlZnNgKTtcbn1cbmV4cG9ydHMuZ2V0UmVmZXJlbmNlcyA9IGdldFJlZmVyZW5jZXM7XG5hc3luYyBmdW5jdGlvbiBnZXRSZWZlcmVuY2UobmFtZSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcmVmcy8ke25hbWV9YCk7XG59XG5leHBvcnRzLmdldFJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZTtcbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1pdChzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPWFwcGxpY2F0aW9uL2pzb25gKTtcbn1cbmV4cG9ydHMuZ2V0Q29tbWl0ID0gZ2V0Q29tbWl0O1xuYXN5bmMgZnVuY3Rpb24gZ2V0U2hhSW5mbyhzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vaW5mb2ApO1xufVxuZXhwb3J0cy5nZXRTaGFJbmZvID0gZ2V0U2hhSW5mbztcbmZ1bmN0aW9uIGdldFNoYUNvbnRlbnRVcmwoc2hhLCBtaW1lVHlwZSwgbmFtZSwgd2l0aFBoYW50b20sIGlzRG93bmxvYWQpIHtcbiAgICBpZiAoIXNoYSlcbiAgICAgICAgcmV0dXJuICcjJztcbiAgICBsZXQgYmFzZSA9IHdpdGhQaGFudG9tID9cbiAgICAgICAgYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50LyR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfT90eXBlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG1pbWVUeXBlKX1gIDpcbiAgICAgICAgYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9JHtlbmNvZGVVUklDb21wb25lbnQobWltZVR5cGUpfWA7XG4gICAgaWYgKGlzRG93bmxvYWQpXG4gICAgICAgIGJhc2UgKz0gYCZmaWxlTmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lIHx8IHNoYSl9YDtcbiAgICByZXR1cm4gYmFzZTtcbn1cbmV4cG9ydHMuZ2V0U2hhQ29udGVudFVybCA9IGdldFNoYUNvbnRlbnRVcmw7XG5mdW5jdGlvbiBnZXRTaGFJbWFnZVRodW1ibmFpbFVybChzaGEsIG1pbWVUeXBlKSB7XG4gICAgcmV0dXJuIGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vcGx1Z2lucy9pbWFnZS90aHVtYm5haWw/dHlwZT0ke21pbWVUeXBlfWA7XG59XG5leHBvcnRzLmdldFNoYUltYWdlVGh1bWJuYWlsVXJsID0gZ2V0U2hhSW1hZ2VUaHVtYm5haWxVcmw7XG5mdW5jdGlvbiBnZXRTaGFJbWFnZU1lZGl1bVRodW1ibmFpbFVybChzaGEsIG1pbWVUeXBlKSB7XG4gICAgcmV0dXJuIGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vcGx1Z2lucy9pbWFnZS9tZWRpdW0/dHlwZT0ke21pbWVUeXBlfWA7XG59XG5leHBvcnRzLmdldFNoYUltYWdlTWVkaXVtVGh1bWJuYWlsVXJsID0gZ2V0U2hhSW1hZ2VNZWRpdW1UaHVtYm5haWxVcmw7XG5hc3luYyBmdW5jdGlvbiBwdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdE5hbWUsIHNoYSwgbWltZVR5cGUsIG5hbWUpIHtcbiAgICBsZXQgcGF5bG9hZCA9IHtcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IG1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIG1pbWVUeXBlLFxuICAgICAgICAgICAgICAgIHNoYVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5wdXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3BsdWdpbnMvcGxheWxpc3RzLyR7cGxheWxpc3ROYW1lfWAsIHBheWxvYWQpO1xufVxuZXhwb3J0cy5wdXRJdGVtVG9QbGF5bGlzdCA9IHB1dEl0ZW1Ub1BsYXlsaXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzdC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgxIHgtaWQ9XCJ0aXRsZVwiIGNsYXNzPVwiYW5pbWF0ZWQtLXF1aWNrXCI+UmFjY29vbjwvaDE+XG4gICAgICAgIDxoNCB4LWlkPVwic3ViVGl0bGVcIj5TZWFyY2ggZm9yIHNvbmdzPC9oND5cbiAgICAgICAgPGZvcm0geC1pZD1cImZvcm1cIiBjbGFzcz1cIm11aS1mb3JtLS1pbmxpbmVcIj5cbiAgICAgICAgICAgIDwhLS10aGlzIGlzIGEgbGl0dGxlIGhhY2sgdG8gaGF2ZSB0aGluZ3MgY2VudGVyZWQtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIj7wn5SNPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLXRleHRmaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB4LWlkPVwidGVybVwiIHR5cGU9XCJ0ZXh0XCIgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCIgYXV0b2ZvY3VzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHJvbGU9XCJzdWJtaXRcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPvCflI08L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgICA8c3Bhbj48YSB4LWlkPSdhdWRpb01vZGUnIGhyZWY9XCIjXCI+8J+OtjwvYT4mbmJzcDs8YSB4LWlkPSdpbWFnZU1vZGUnIGhyZWY9XCIjXCI+77iP8J+Onu+4jzwvYT48L3NwYW4+XG4gICAgICAgIDxiciAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVRpdGxlOiAodGVtcGxhdGUsIGRpc3BsYXllZCkgPT4ge1xuICAgICAgICBpZiAoZGlzcGxheWVkKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QucmVtb3ZlKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zdWJUaXRsZS5zdHlsZS5kaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LmFkZCgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICAgICAgdGVtcGxhdGUuc3ViVGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZWFyY2gtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IHdhaXQgPSAoZHVyYXRpb24pID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbikpO1xuY29uc3QgcmFuZCA9IG1heCA9PiBNYXRoLmZsb29yKG1heCAqIE1hdGgucmFuZG9tKCkpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lcic+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyPlNsaWRlc2hvdzwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cIml0ZW1zXCIgY2xhc3M9XCJtdWktcGFuZWwgeC1zbGlkZXNob3dcIj48L2Rpdj5cbiAgICAgICAgc3BlZWQ6IDxpbnB1dCB4LWlkPVwic3BlZWRcIiB0eXBlPVwicmFuZ2VcIiBtaW49XCI1MFwiIG1heD1cIjMwMDBcIiB2YWx1ZT1cIjIwMDBcIi8+XG4gICAgICAgIG5iIHJvd3M6IDxpbnB1dCB4LWlkPVwibmJSb3dzXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjFcIiBtYXg9XCIxNTBcIiB2YWx1ZT1cIjFcIi8+XG4gICAgICAgIG5iIGltYWdlczogPGlucHV0IHgtaWQ9XCJuYkltYWdlc1wiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgbWF4PVwiMTAwXCIgdmFsdWU9XCIzXCIvPlxuICAgICAgICBpbnRlcnZhbDogPGlucHV0IHgtaWQ9XCJpbnRlcnZhbFwiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgbWF4PVwiMzY1XCIgdmFsdWU9XCIxNVwiIHZhbHVlPVwiNTBcIi8+XG4gICAgICAgIDxpbnB1dCB4LWlkPVwiZGF0ZVwiIHR5cGU9XCJyYW5nZVwiIG1pbj1cIi0kezM2NSAqIDIwfVwiIG1heD1cIjBcIiB2YWx1ZT1cIjBcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCIvPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJyZW1hcmtcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgbGV0IGVscyA9IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKTtcbiAgICBjb25zdCByZW1vdmVSYW5kb21JbWFnZSA9ICgpID0+IHtcbiAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IHBpY2tSYW5kb21JbWFnZSgpO1xuICAgICAgICBpZiAoaW1hZ2VFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gaW1hZ2VFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aClcbiAgICAgICAgICAgICAgICBwYXJlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZUVsZW1lbnQ7XG4gICAgfTtcbiAgICBjb25zdCBhZGRSYW5kb21JbWFnZSA9IChuYkRlc2lyZWRSb3dzKSA9PiB7XG4gICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgbGV0IHJvdyA9IG51bGw7XG4gICAgICAgIGlmIChlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoIDwgbmJEZXNpcmVkUm93cykge1xuICAgICAgICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBlbHMuaXRlbXMuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvdyA9IGVscy5pdGVtcy5jaGlsZHJlbi5pdGVtKHJhbmQoZWxzLml0ZW1zLmNoaWxkcmVuLmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChpbWFnZUVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gaW1hZ2VFbGVtZW50O1xuICAgIH07XG4gICAgY29uc3QgcGlja1JhbmRvbUltYWdlID0gKCkgPT4ge1xuICAgICAgICBsZXQgcG9zc2libGVFbGVtZW50cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCByb3cgb2YgZWxzLml0ZW1zLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbWcgb2Ygcm93LmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRWxlbWVudHMucHVzaChpbWcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcG9zc2libGVFbGVtZW50cy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlRWxlbWVudHNbcmFuZChwb3NzaWJsZUVsZW1lbnRzLmxlbmd0aCldO1xuICAgIH07XG4gICAgY29uc3QgZW51bUltYWdlcyA9IChzKSA9PiB7XG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IGVscy5pdGVtcy5jaGlsZHJlbi5sZW5ndGg7IHJvd0lkeCsrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSBlbHMuaXRlbXMuY2hpbGRyZW4uaXRlbShyb3dJZHgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3cuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzLmFkZChyb3cuY2hpbGRyZW4uaXRlbShpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGltYWdlc0NvdW50ID0gKCkgPT4ge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoOyByb3dJZHgrKykge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gZWxzLml0ZW1zLmNoaWxkcmVuLml0ZW0ocm93SWR4KTtcbiAgICAgICAgICAgIGNvdW50ICs9IHJvdy5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IHBvc3NpYmxlSW1hZ2VzID0gW107XG4gICAgICAgIGxldCBsYXN0U2VhcmNoRGF0ZSA9IG51bGw7XG4gICAgICAgIGxldCBsYXN0U2VhcmNoSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICBsZXQgY3VycmVudE9mZnNldCA9IDA7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVGcm9tTm93SW5NcyA9IChwYXJzZUludChlbHMuZGF0ZS52YWx1ZSB8fCAnMCcpKSAqIDEwMDAgKiA2MCAqIDYwICogMjQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJbkRheXMgPSBwYXJzZUludChlbHMuaW50ZXJ2YWwudmFsdWUpIHx8IDE7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJbk1zID0gaW50ZXJ2YWxJbkRheXMgKiAxMDAwICogNjAgKiA2MCAqIDI0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iV2FudGVkSW1hZ2VzID0gcGFyc2VJbnQoZWxzLm5iSW1hZ2VzLnZhbHVlKSB8fCAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iRGVzaXJlZFJvd3MgPSBwYXJzZUludChlbHMubmJSb3dzLnZhbHVlKSB8fCAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXREdXJhdGlvbkluTXMgPSBwYXJzZUludChlbHMuc3BlZWQudmFsdWUpIHx8IDIwMDA7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgdGltZUZyb21Ob3dJbk1zO1xuICAgICAgICAgICAgICAgIGxldCBkb1NlYXJjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0U2VhcmNoRGF0ZSAhPSB0aW1lRnJvbU5vd0luTXMgfHwgbGFzdFNlYXJjaEludGVydmFsICE9IGludGVydmFsSW5Ncykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZG9TZWFyY2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBhbGwgY3VycmVudCBpbWFnZXMgYXJlIG5vIG1vcmUgcGFydCBvZiB0aGUgbGFzdCBzZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGVudW1JbWFnZXModG9SZW1vdmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICghcG9zc2libGVJbWFnZXMgfHwgIXBvc3NpYmxlSW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkb1NlYXJjaCA9ICFmaW5pc2hlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRvU2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWFyY2hEYXRlID0gdGltZUZyb21Ob3dJbk1zO1xuICAgICAgICAgICAgICAgICAgICBsYXN0U2VhcmNoSW50ZXJ2YWwgPSBpbnRlcnZhbEluTXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBkbyBhIHNlYXJjaCBvbiAke2NlbnRlcn0gKy8tICR7aW50ZXJ2YWxJbkRheXN9IEAgJHtjdXJyZW50T2Zmc2V0fWApO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlOiAnaW1hZ2UvJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBub0RpcmVjdG9yeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogY3VycmVudE9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVNaW46IGNlbnRlciAtIGludGVydmFsSW5NcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVNYXg6IGNlbnRlciArIGludGVydmFsSW5Nc1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUmVzdC5zZWFyY2hFeChzZWFyY2hTcGVjKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zc2libGVJbWFnZXMgPSByZXN1bHRzICYmIHJlc3VsdHMuaXRlbXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUltYWdlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ICs9IHBvc3NpYmxlSW1hZ2VzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9mZnNldCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gcG9zc2libGVJbWFnZXMubGVuZ3RoID09IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUltYWdlcyAmJiBwb3NzaWJsZUltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxzLnJlbWFyay5pbm5lckhUTUwgPSBgJHtuZXcgRGF0ZShjZW50ZXIpLnRvRGF0ZVN0cmluZygpfSA6ICR7bmJXYW50ZWRJbWFnZXN9IGltYWdlcyBvbiAke25iRGVzaXJlZFJvd3N9IHJvd3MgKy8tICR7aW50ZXJ2YWxJbkRheXN9IGRheXMgKEAke2N1cnJlbnRPZmZzZXR9KWA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZXNDb3VudCgpID4gbmJXYW50ZWRJbWFnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSByZW1vdmVSYW5kb21JbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZS5oYXMoaW1hZ2VFbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZXNDb3VudCgpIDwgbmJXYW50ZWRJbWFnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUVsZW1lbnQgPSBhZGRSYW5kb21JbWFnZShuYkRlc2lyZWRSb3dzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IHBpY2tSYW5kb21JbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlLmhhcyhpbWFnZUVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvUmVtb3ZlLmRlbGV0ZShpbWFnZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlSW5kZXggPSByYW5kKHBvc3NpYmxlSW1hZ2VzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3VzZWRJbWFnZV0gPSBwb3NzaWJsZUltYWdlcy5zcGxpY2UoaW1hZ2VJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlZEltYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5zcmMgPSBSZXN0LmdldFNoYUltYWdlVGh1bWJuYWlsVXJsKHVzZWRJbWFnZS5zaGEsIHVzZWRJbWFnZS5taW1lVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVscy5yZW1hcmsuaW5uZXJIVE1MID0gYCR7bmV3IERhdGUoY2VudGVyKS50b0RhdGVTdHJpbmcoKX0sIG5vIG1vcmUgaW1hZ2UsIGNoYW5nZSB0aGUgY3Vyc29yc2A7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZS5zaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZm9yRWFjaChpbWFnZUVsZW1lbnQgPT4gaW1hZ2VFbGVtZW50cy5wdXNoKGltYWdlRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IGltYWdlRWxlbWVudHNbcmFuZChpbWFnZUVsZW1lbnRzLmxlbmd0aCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgd2FpdCh3YWl0RHVyYXRpb25Jbk1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgZXJyb3IgaW4gc2xpZGVzaG93LCB3YWl0aW5nIDVzYCwgLTEpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdhaXQoNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBlbHM7XG59XG5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNsaWRlc2hvdy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgZWxlbWVudHNEYXRhID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbihvYmosIGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IFVpVG9vbHMuZWxGcm9tSHRtbChodG1sKTtcbiAgICBvYmpbJ3Jvb3QnXSA9IHJvb3Q7XG4gICAgVWlUb29scy5lbHMocm9vdCwgYFt4LWlkXWApLmZvckVhY2goZSA9PiBvYmpbZS5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSBlKTtcbiAgICBpZiAocm9vdC5oYXNBdHRyaWJ1dGUoJ3gtaWQnKSlcbiAgICAgICAgb2JqW3Jvb3QuZ2V0QXR0cmlidXRlKCd4LWlkJyldID0gcm9vdDtcbiAgICBlbGVtZW50c0RhdGEuc2V0KHJvb3QsIG9iaik7XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5leHBvcnRzLmNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbiA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbjtcbmZ1bmN0aW9uIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpIHtcbiAgICBjb25zdCBkYXRhID0gZWxlbWVudHNEYXRhLmdldChyb290KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbmV4cG9ydHMuZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEgPSBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YTtcbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UoaHRtbCkge1xuICAgIGxldCByb290ID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKHt9LCBodG1sKTtcbiAgICByZXR1cm4gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCk7XG59XG5leHBvcnRzLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UgPSBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlO1xuY29uc3QgRU1QVFlfTE9DQVRJT04gPSB7IGVsZW1lbnQ6IG51bGwsIGNoaWxkSW5kZXg6IC0xIH07XG5mdW5jdGlvbiB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZWxlbWVudHMsIGV2ZW50KSB7XG4gICAgbGV0IGVscyA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyhlbGVtZW50cykpO1xuICAgIGxldCBjID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBwID0gbnVsbDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChlbHMuaGFzKGMpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgICAgICAgY2hpbGRJbmRleDogcCAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMuY2hpbGRyZW4sIHApXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjID09IGVsZW1lbnRzLnJvb3QpXG4gICAgICAgICAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG4gICAgICAgIHAgPSBjO1xuICAgICAgICBjID0gYy5wYXJlbnRFbGVtZW50O1xuICAgIH0gd2hpbGUgKGMpO1xuICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbn1cbmV4cG9ydHMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uID0gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGVzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZWwoaWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufVxuZXhwb3J0cy5lbCA9IGVsO1xuZnVuY3Rpb24gZWxzKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmVscyA9IGVscztcbmZ1bmN0aW9uIGVsRnJvbUh0bWwoaHRtbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBwYXJlbnQuY2hpbGRyZW4uaXRlbSgwKTtcbn1cbmV4cG9ydHMuZWxGcm9tSHRtbCA9IGVsRnJvbUh0bWw7XG5mdW5jdGlvbiBzdG9wRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxuZXhwb3J0cy5zdG9wRXZlbnQgPSBzdG9wRXZlbnQ7XG5mdW5jdGlvbiogaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChzdGFydCkge1xuICAgIHdoaWxlIChzdGFydCkge1xuICAgICAgICB5aWVsZCBzdGFydDtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmV4cG9ydHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudCA9IGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11aS10b29sLmpzLm1hcCJdLCJzb3VyY2VSb290IjoiIn0=
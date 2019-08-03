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
const Locations = __webpack_require__(/*! ./locations */ "./public/locations.js");
const templateHtml = `
<div class="audio-footer mui-panel">
    <h3 class="x-when-large-display">Playlist</h3>
    <div x-id="playlist"></div>
    <div x-id="expander" class="onclick mui--text-center">☰</div>
    <div class="x-horizontal-flex" style="width:100%;">
        <a x-id="infoButton" href="#" class="mui-btn mui-btn--fab">Info</a>
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
const Messages = __webpack_require__(/*! ./messages */ "./public/messages.js");
const Locations = __webpack_require__(/*! ./locations */ "./public/locations.js");
let currentUnroller = null;
let shownItem = null;
const template = `
    <div class="x-image-detail">
        <a x-id="downloadLink"><img x-id="image"/></a>
        <div x-id="toolbar">
        <button x-id="info" class="mui-btn mui-btn--flat">Info</button>
        <button x-id="previous" class="mui-btn mui-btn--flat">Previous</button>
        <button x-id="close" class="mui-btn mui-btn--flat">Close</button>
        <button x-id="next" class="mui-btn mui-btn--flat">Next</button>
        <button x-id="diaporama" class="mui-btn mui-btn--flat">Diapo</button>
        </div>
    </div>`;
const element = templates_1.createTemplateInstance(template);
element.info.addEventListener('click', event => {
    UiTool.stopEvent(event);
    if (shownItem) {
        stopDiaporama();
        Locations.goShaInfo(shownItem);
    }
});
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
    Messages.displayMessage(`Start diaporama`, 0);
    diaporamaTimer = setInterval(() => showNext(), 2000);
    if (currentUnroller) {
        let nextItem = currentUnroller.next();
        if (nextItem)
            showInternal(nextItem);
    }
});
function stopDiaporama() {
    if (diaporamaTimer) {
        Messages.displayMessage(`Diaporama stopped`, 0);
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
    shownItem = item;
    document.body.querySelector('header').style.display = 'none';
    if (!element.root.isConnected)
        document.body.appendChild(element.root);
    element.image.src = Rest.getShaImageMediumThumbnailUrl(item.sha, item.mimeType);
    element.image.alt = item.name;
    element.downloadLink.href = Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, true);
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
const Locations = __webpack_require__(/*! ./locations */ "./public/locations.js");
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
    Locations.goShaInfo(item);
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

/***/ "./public/locations.js":
/*!*****************************!*\
  !*** ./public/locations.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
function goShaInfo(item) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`;
}
exports.goShaInfo = goShaInfo;
//# sourceMappingURL=locations.js.map

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2h0bWwtc25pcHBldHMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2ltYWdlLWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZm8tcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2xvY2F0aW9ucy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbWVzc2FnZXMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL21pbWUtdHlwZXMtbW9kdWxlLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9uZXR3b3JrLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9yZXN0LmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zZWFyY2gtcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3NsaWRlc2hvdy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdGVtcGxhdGVzLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy91aS10b29sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFD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QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkM7Ozs7Ozs7Ozs7OztBQzFnQ0EsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQSx3Q0FBd0MseUJBQXlCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNB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QTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxxQzs7Ozs7Ozs7Ozs7O0FDNUNBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9wdWJsaWMvaW5kZXguanNcIik7XG4iLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBVaVRvb2xzID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IE1pbWVUeXBlcyA9IHJlcXVpcmUoXCIuL21pbWUtdHlwZXMtbW9kdWxlXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IExvY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2xvY2F0aW9uc1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9XCJhdWRpby1mb290ZXIgbXVpLXBhbmVsXCI+XG4gICAgPGgzIGNsYXNzPVwieC13aGVuLWxhcmdlLWRpc3BsYXlcIj5QbGF5bGlzdDwvaDM+XG4gICAgPGRpdiB4LWlkPVwicGxheWxpc3RcIj48L2Rpdj5cbiAgICA8ZGl2IHgtaWQ9XCJleHBhbmRlclwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtY2VudGVyXCI+4piwPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cIngtaG9yaXpvbnRhbC1mbGV4XCIgc3R5bGU9XCJ3aWR0aDoxMDAlO1wiPlxuICAgICAgICA8YSB4LWlkPVwiaW5mb0J1dHRvblwiIGhyZWY9XCIjXCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZhYlwiPkluZm88L2E+XG4gICAgICAgIDxhdWRpbyB4LWlkPVwicGxheWVyXCIgY2xhc3M9XCJhdWRpby1wbGF5ZXJcIiBjb250cm9scyBwcmVsb2FkPVwibWV0YWRhdGFcIj48L2F1ZGlvPlxuICAgICAgICA8YSB4LWlkPVwiYWRkUGxheWxpc3RCdXR0b25cIiBocmVmPVwiI3RvdG9cIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmFiXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAjZmY0MDgxNzM7IGNvbG9yOiB3aGl0ZTtcIj4rIFBMLjwvYT48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIFJlc3QuZ2V0U2hhQ29udGVudFVybChzaGEsIG1pbWVUeXBlLCBuYW1lLCBmYWxzZSwgZmFsc2UpKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgndHlwZScsIG1pbWVUeXBlKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnBsYXkoKTtcbiAgICAgICAgZWxlbWVudHMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpO1xuICAgIH0sXG59O1xuY2xhc3MgQXVkaW9KdWtlYm94IHtcbiAgICBjb25zdHJ1Y3RvcihhdWRpb1BhbmVsKSB7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbCA9IGF1ZGlvUGFuZWw7XG4gICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgLy8gaWYgc2Nyb2xsIHRvIHBsYXlpbmcgaXRlbSBpcyByZXF1aXJlZCBhZnRlciBhIHBsYXlsaXN0IHJlZHJhd1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHF1ZXVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncGxheWxpc3QtYmFja3VwJykpO1xuICAgICAgICAgICAgaWYgKHF1ZXVlICYmIHF1ZXVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yIGxvYWRpbmcgcXVldWUgZnJvbSBsb2NhbCBzdG9yYWdlYCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMgPSBVaVRvb2xzLmVscyh0aGlzLmF1ZGlvUGFuZWwucm9vdCwgJy54LXdoZW4tbGFyZ2UtZGlzcGxheScpO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBhdWRpbyBwbGF5ZXIgZXJyb3JgKTtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RhbGxlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbGVkLCB0cnkgbmV4dCcpO1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmV4cGFuZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSAhdGhpcy5sYXJnZURpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBVaVRvb2xzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QXR0ciA9IGUuZ2V0QXR0cmlidXRlKCd4LXF1ZXVlLWluZGV4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleEF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4QXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gTmFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmFkZFBsYXlsaXN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBVaVRvb2xzLnN0b3BFdmVudChldmVudCk7XG4gICAgICAgICAgICBjb25zdCBwbGF5bGlzdCA9ICdmYXZvcml0ZXMnOyAvLyB0b2RvIHNob3VsZCBiZSBhIHBhcmFtZXRlci4uLlxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQ2Fubm90IGFkZCB0byBwbGF5bGlzdCwgbm90aGluZyBwbGF5aW5nYCwgLTEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBNaW1lVHlwZXMuZXh0ZW5zaW9uRnJvbU1pbWVUeXBlKGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgYXdhaXQgUmVzdC5wdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdCwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGAke2l0ZW0ubmFtZX0uJHtleHRlbnNpb259YCk7XG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShg8J+RjSAke2l0ZW0ubmFtZX0gYWRkZWQgdG8gcGxheWxpc3QgJyR7cGxheWxpc3R9J2AsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmluZm9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIFVpVG9vbHMuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYE5vdGhpbmcgcGxheWluZ2AsIC0xKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBMb2NhdGlvbnMuZ29TaGFJbmZvKHtcbiAgICAgICAgICAgICAgICBzaGE6IGl0ZW0uc2hhLFxuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBtaW1lVHlwZTogaXRlbS5taW1lVHlwZSxcbiAgICAgICAgICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgICAgICAgICAgc2l6ZTogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBjdXJyZW50SXRlbSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgMCB8fCB0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgfVxuICAgIGFkZEFuZFBsYXkoaXRlbSkge1xuICAgICAgICBpdGVtID0ge1xuICAgICAgICAgICAgc2hhOiBpdGVtLnNoYSxcbiAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBpdGVtLm1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLnNoYSA9PSBpdGVtLnNoYSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgIH1cbiAgICBwbGF5TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlOZXh0VW5yb2xsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1VbnJvbGxlci51bnJvbGwoKTtcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRJdGVtVW5yb2xsZXIoaXRlbVVucm9sbGVyKSB7XG4gICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gaXRlbVVucm9sbGVyO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBwdXNoUXVldWVBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaWYgKCFpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXVlKSk7XG4gICAgICAgIHRoaXMucGxheSh0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBwbGF5KGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5xdWV1ZVtpbmRleF07XG4gICAgICAgICAgICBleHBvcnRzLmF1ZGlvUGFuZWwucGxheSh0aGlzLmF1ZGlvUGFuZWwsIGl0ZW0ubmFtZSwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW3gtZm9yLXNoYT0nJHtpdGVtLnNoYS5zdWJzdHIoMCwgNSl9J11gKS5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy13ZWlnaHRlZCcpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnJlc2hUaW1lcilcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlZnJlc2hUaW1lcik7XG4gICAgICAgIHRoaXMucmVmcmVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlYWxSZWZyZXNoUGxheWxpc3QoKSwgMTApO1xuICAgIH1cbiAgICByZWFsUmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAoIXRoaXMucXVldWUgfHwgIXRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPlRoZXJlIGFyZSBubyBpdGVtcyBpbiB5b3VyIHBsYXlsaXN0LiBDbGljayBvbiBzb25ncyB0byBwbGF5IHRoZW0uPC9zcGFuPic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBodG1sID0gYGA7XG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbChpLCBpdGVtLm5hbWUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPjxhIHgtaWQ9J2NsZWFyLXBsYXlsaXN0JyBocmVmPScjJz5jbGVhciBwbGF5bGlzdDwvYT48L2Rpdj5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA+PSAwICYmIHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbCh0aGlzLmN1cnJlbnRJbmRleCwgdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF0ubmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLmN1cnJlbnRJbmRleCArIDF9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeSBpcy1vbmVsaW5ldGV4dFwiPmZvbGxvd2VkIGJ5ICcke3RoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXggKyAxXS5uYW1lLnN1YnN0cigwLCAyMCl9JyAuLi48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgLy8gYWZ0ZXIgcmVmcmVzaCBzdGVwc1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkgJiYgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxUb3AgPSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlsaXN0SXRlbUh0bWwoaW5kZXgsIG5hbWUsIG9uZUxpbmVUZXh0KSB7XG4gICAgICAgIHJldHVybiBgPGRpdiB4LXF1ZXVlLWluZGV4PVwiJHtpbmRleH1cIiBjbGFzcz1cIm9uY2xpY2sgJHtvbmVMaW5lVGV4dCA/ICdpcy1vbmVsaW5ldGV4dCcgOiAnJ30gJHtpbmRleCA9PSB0aGlzLmN1cnJlbnRJbmRleCA/ICdtdWktLXRleHQtaGVhZGxpbmUnIDogJyd9XCI+JHtuYW1lfTwvZGl2PmA7XG4gICAgfVxufVxuZXhwb3J0cy5BdWRpb0p1a2Vib3ggPSBBdWRpb0p1a2Vib3g7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdWRpby1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZnVuY3Rpb24gd2FpdChkdXJhdGlvbikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZHVyYXRpb24pKTtcbn1cbmxldCBhdXRoZW50aWNhdGVkVXNlciA9IG51bGw7XG5jbGFzcyBBdXRoIHtcbiAgICBvbkVycm9yKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfVxuICAgIGFzeW5jIGxvb3AoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL2F1dGhgKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlcyA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9zZXRDb29raWVgLCB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Jlc3BvbnNlLnRva2VufWAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzIHx8ICFyZXMubGlmZXRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBzZXRDb29raWVgLCByZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYXV0aGVudGljYXRlZFVzZXIgPSBhd2FpdCBOZXR3b3JrLmdldERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL3dlbGwta25vd24vdjEvbWVgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBvYnRhaW4gYXV0aCB0b2tlbmApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHJlZnJlc2ggYXV0aCAoJHtlcnJ9KWApO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXZlcnkgMzAgbWludXRlc1xuICAgICAgICAgICAgYXdhaXQgd2FpdCgxMDAwICogNjAgKiAzMCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhdXRvUmVuZXdBdXRoKCkge1xuICAgIGxldCBhdXRoID0gbmV3IEF1dGgoKTtcbiAgICBhdXRoLmxvb3AoKTtcbn1cbmV4cG9ydHMuYXV0b1JlbmV3QXV0aCA9IGF1dG9SZW5ld0F1dGg7XG5hc3luYyBmdW5jdGlvbiBtZSgpIHtcbiAgICBpZiAoIWF1dGhlbnRpY2F0ZWRVc2VyKVxuICAgICAgICBhdXRoZW50aWNhdGVkVXNlciA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9tZWApO1xuICAgIHJldHVybiBhdXRoZW50aWNhdGVkVXNlcjtcbn1cbmV4cG9ydHMubWUgPSBtZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1dGguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgU25pcHBldHMgPSByZXF1aXJlKFwiLi9odG1sLXNuaXBwZXRzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lcic+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyIHgtaWQ9XCJ0aXRsZVwiPjwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cIml0ZW1zXCIgY2xhc3M9XCJtdWktcGFuZWxcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLmRpcmVjdG9yeVBhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIHNldExvYWRpbmc6IChlbGVtZW50cywgdGl0bGUpID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYExvYWRpbmcgJyR7dGl0bGV9JyAuLi5gO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSBgYDtcbiAgICB9LFxuICAgIGRpc3BsYXlTZWFyY2hpbmc6IChlbGVtZW50cywgdGVybSkgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLWhpbnRcIj5TZWFyY2hpbmcgJyR7dGVybX0nIC4uLjwvZGl2PmA7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGBgO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgJHt2YWx1ZXMubmFtZX1gO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5jbGFzc0xpc3QucmVtb3ZlKCd4LWltYWdlLXBhbmVsJyk7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmNsYXNzTGlzdC5hZGQoJ3gtaXRlbXMtcGFuZWwnKTtcbiAgICAgICAgaWYgKHZhbHVlcy5pdGVtcyAmJiB2YWx1ZXMuaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSB2YWx1ZXMuaXRlbXMubWFwKFNuaXBwZXRzLml0ZW1Ub0h0bWwpLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+Tm8gcmVzdWx0czwvZGl2PmA7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNldEltYWdlczogKGVsZW1lbnRzLCB2YWx1ZXMpID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gdmFsdWVzLnRlcm07XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmNsYXNzTGlzdC5hZGQoJ3gtaW1hZ2UtcGFuZWwnKTtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuY2xhc3NMaXN0LnJlbW92ZSgneC1pdGVtcy1wYW5lbCcpO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSB2YWx1ZXMuaXRlbXMubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgaWYgKGl0ZW0ubWltZVR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxkaXY+PGltZyBjbGFzcz1cIngtaW1hZ2Utem9vbS1hY3Rpb24gb25jbGlja1wiIGxvYWRpbmc9XCJsYXp5XCIgc3JjPVwiYmxhbmsuanBlZ1wiIGRhdGEtc3JjPVwiJHtSZXN0LmdldFNoYUltYWdlVGh1bWJuYWlsVXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKX1cIi8+PC9kaXY+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdj4ke1NuaXBwZXRzLml0ZW1Ub0h0bWwoaXRlbSl9PC9kaXY+YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuam9pbignJyk7XG4gICAgICAgIGxldCBuYkZpcnN0ID0gMjU7XG4gICAgICAgIGxldCB0aW1lQWZ0ZXIgPSAyMDAwO1xuICAgICAgICBsZXQgdG9PYnNlcnZlID0gdmFsdWVzLml0ZW1zXG4gICAgICAgICAgICAubWFwKChpdGVtLCBpbmRleCkgPT4gKHsgaXRlbSwgaW5kZXggfSkpXG4gICAgICAgICAgICAuZmlsdGVyKGUgPT4gZS5pdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKTtcbiAgICAgICAgbGV0IGxhenlJbWFnZU9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChlbnRyaWVzLCBvYnNlcnZlcikge1xuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pc0ludGVyc2VjdGluZykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGF6eUltYWdlID0gZW50cnkudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBsYXp5SW1hZ2Uuc3JjID0gbGF6eUltYWdlLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmMnKTtcbiAgICAgICAgICAgICAgICAgICAgbGF6eUltYWdlT2JzZXJ2ZXIudW5vYnNlcnZlKGxhenlJbWFnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0b09ic2VydmUuc2xpY2UoMCwgbmJGaXJzdCkuZm9yRWFjaChlID0+IGxhenlJbWFnZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudHMuaXRlbXMuY2hpbGRyZW4uaXRlbShlLmluZGV4KS5jaGlsZHJlbi5pdGVtKDApKSk7XG4gICAgICAgIGlmICh0b09ic2VydmUubGVuZ3RoID4gbmJGaXJzdCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9PYnNlcnZlLnNsaWNlKG5iRmlyc3QpLmZvckVhY2goZSA9PiBsYXp5SW1hZ2VPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnRzLml0ZW1zLmNoaWxkcmVuLml0ZW0oZS5pbmRleCkuY2hpbGRyZW4uaXRlbSgwKSkpO1xuICAgICAgICAgICAgfSwgdGltZUFmdGVyKTtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGlyZWN0b3J5LXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5mdW5jdGlvbiBpdGVtVG9IdG1sKGYpIHtcbiAgICBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JylcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwib25jbGlja1wiPjxpPiR7Zi5uYW1lfSAuLi48L2k+PC9kaXY+YDtcbiAgICBlbHNlIGlmIChmLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9yZWZlcmVuY2UnKVxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJvbmNsaWNrXCI+PGk+JHtmLm5hbWV9IC4uLjwvaT48L2Rpdj5gO1xuICAgIGVsc2UgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3BsYXlsaXN0JylcbiAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwib25jbGlja1wiPjxpPiR7Zi5uYW1lfSAuLi48L2k+PC9kaXY+YDtcbiAgICBlbHNlIGlmIChmLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKVxuICAgICAgICByZXR1cm4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYSAmJiBmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+JHtmLm5hbWV9PC9kaXY+YDtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBgPGRpdiB4LWZvci1zaGE9XCIke2Yuc2hhICYmIGYuc2hhLnN1YnN0cigwLCA1KX1cIiBjbGFzcz1cIm9uY2xpY2tcIj48YSBocmVmPVwiJHtSZXN0LmdldFNoYUNvbnRlbnRVcmwoZi5zaGEsIGYubWltZVR5cGUsIGYubmFtZSwgdHJ1ZSwgZmFsc2UpfVwiIHRhcmdldD1cIl9ibGFua1wiPiR7Zi5uYW1lfTwvYT4gPGEgY2xhc3M9XCJ4LWluZm8tZGlzcGxheS1hY3Rpb24gbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5XCIgaHJlZj1cIiNcIj5pbmZvPC9hPjwvZGl2PmA7XG59XG5leHBvcnRzLml0ZW1Ub0h0bWwgPSBpdGVtVG9IdG1sO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbC1zbmlwcGV0cy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBVaVRvb2wgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IExvY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2xvY2F0aW9uc1wiKTtcbmxldCBjdXJyZW50VW5yb2xsZXIgPSBudWxsO1xubGV0IHNob3duSXRlbSA9IG51bGw7XG5jb25zdCB0ZW1wbGF0ZSA9IGBcbiAgICA8ZGl2IGNsYXNzPVwieC1pbWFnZS1kZXRhaWxcIj5cbiAgICAgICAgPGEgeC1pZD1cImRvd25sb2FkTGlua1wiPjxpbWcgeC1pZD1cImltYWdlXCIvPjwvYT5cbiAgICAgICAgPGRpdiB4LWlkPVwidG9vbGJhclwiPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJpbmZvXCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIj5JbmZvPC9idXR0b24+XG4gICAgICAgIDxidXR0b24geC1pZD1cInByZXZpb3VzXCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIj5QcmV2aW91czwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJjbG9zZVwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+Q2xvc2U8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB4LWlkPVwibmV4dFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+TmV4dDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJkaWFwb3JhbWFcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPkRpYXBvPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PmA7XG5jb25zdCBlbGVtZW50ID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSk7XG5lbGVtZW50LmluZm8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgaWYgKHNob3duSXRlbSkge1xuICAgICAgICBzdG9wRGlhcG9yYW1hKCk7XG4gICAgICAgIExvY2F0aW9ucy5nb1NoYUluZm8oc2hvd25JdGVtKTtcbiAgICB9XG59KTtcbmVsZW1lbnQucHJldmlvdXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgaWYgKGN1cnJlbnRVbnJvbGxlcikge1xuICAgICAgICBsZXQgcHJldmlvdXNJdGVtID0gY3VycmVudFVucm9sbGVyLnByZXZpb3VzKCk7XG4gICAgICAgIGlmIChwcmV2aW91c0l0ZW0pXG4gICAgICAgICAgICBzaG93SW50ZXJuYWwocHJldmlvdXNJdGVtKTtcbiAgICB9XG59KTtcbmVsZW1lbnQubmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBzaG93TmV4dCgpO1xufSk7XG5mdW5jdGlvbiBzaG93TmV4dCgpIHtcbiAgICBpZiAoY3VycmVudFVucm9sbGVyKSB7XG4gICAgICAgIGxldCBuZXh0SXRlbSA9IGN1cnJlbnRVbnJvbGxlci5uZXh0KCk7XG4gICAgICAgIGlmIChuZXh0SXRlbSlcbiAgICAgICAgICAgIHNob3dJbnRlcm5hbChuZXh0SXRlbSk7XG4gICAgfVxufVxubGV0IGRpYXBvcmFtYVRpbWVyID0gbnVsbDtcbmVsZW1lbnQuZGlhcG9yYW1hLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGlmIChkaWFwb3JhbWFUaW1lcikge1xuICAgICAgICBzdG9wRGlhcG9yYW1hKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYFN0YXJ0IGRpYXBvcmFtYWAsIDApO1xuICAgIGRpYXBvcmFtYVRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4gc2hvd05leHQoKSwgMjAwMCk7XG4gICAgaWYgKGN1cnJlbnRVbnJvbGxlcikge1xuICAgICAgICBsZXQgbmV4dEl0ZW0gPSBjdXJyZW50VW5yb2xsZXIubmV4dCgpO1xuICAgICAgICBpZiAobmV4dEl0ZW0pXG4gICAgICAgICAgICBzaG93SW50ZXJuYWwobmV4dEl0ZW0pO1xuICAgIH1cbn0pO1xuZnVuY3Rpb24gc3RvcERpYXBvcmFtYSgpIHtcbiAgICBpZiAoZGlhcG9yYW1hVGltZXIpIHtcbiAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYERpYXBvcmFtYSBzdG9wcGVkYCwgMCk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoZGlhcG9yYW1hVGltZXIpO1xuICAgICAgICBkaWFwb3JhbWFUaW1lciA9IG51bGw7XG4gICAgfVxufVxuZWxlbWVudC5jbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBzdG9wRGlhcG9yYW1hKCk7XG4gICAgY3VycmVudFVucm9sbGVyID0gbnVsbDtcbiAgICBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpLnN0eWxlLmRpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgaWYgKCFlbGVtZW50LnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIHJldHVybjtcbiAgICBlbGVtZW50LnJvb3QucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50LnJvb3QpO1xufSk7XG5mdW5jdGlvbiBzaG93KGl0ZW0sIHVucm9sbGVyKSB7XG4gICAgY3VycmVudFVucm9sbGVyID0gdW5yb2xsZXI7XG4gICAgc2hvd0ludGVybmFsKGl0ZW0pO1xufVxuZXhwb3J0cy5zaG93ID0gc2hvdztcbmZ1bmN0aW9uIHNob3dJbnRlcm5hbChpdGVtKSB7XG4gICAgc2hvd25JdGVtID0gaXRlbTtcbiAgICBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgaWYgKCFlbGVtZW50LnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWxlbWVudC5yb290KTtcbiAgICBlbGVtZW50LmltYWdlLnNyYyA9IFJlc3QuZ2V0U2hhSW1hZ2VNZWRpdW1UaHVtYm5haWxVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpO1xuICAgIGVsZW1lbnQuaW1hZ2UuYWx0ID0gaXRlbS5uYW1lO1xuICAgIGVsZW1lbnQuZG93bmxvYWRMaW5rLmhyZWYgPSBSZXN0LmdldFNoYUNvbnRlbnRVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGl0ZW0ubmFtZSwgdHJ1ZSwgdHJ1ZSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbWFnZS1kZXRhaWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2wgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgU2VhcmNoUGFuZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtcGFuZWxcIik7XG5jb25zdCBBdWRpb1BhbmVsID0gcmVxdWlyZShcIi4vYXVkaW8tcGFuZWxcIik7XG5jb25zdCBEaXJlY3RvcnlQYW5lbCA9IHJlcXVpcmUoXCIuL2RpcmVjdG9yeS1wYW5lbFwiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgQXV0aCA9IHJlcXVpcmUoXCIuL2F1dGhcIik7XG5jb25zdCBUZW1wbGF0ZXMgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBNaW1lVHlwZXMgPSByZXF1aXJlKFwiLi9taW1lLXR5cGVzLW1vZHVsZVwiKTtcbmNvbnN0IE1lc3NhZ2VzID0gcmVxdWlyZShcIi4vbWVzc2FnZXNcIik7XG5jb25zdCBTbGlkZXNob3cgPSByZXF1aXJlKFwiLi9zbGlkZXNob3dcIik7XG5jb25zdCBJbmZvUGFuZWwgPSByZXF1aXJlKFwiLi9pbmZvLXBhbmVsXCIpO1xuY29uc3QgSW1hZ2VEZXRhaWxzID0gcmVxdWlyZShcIi4vaW1hZ2UtZGV0YWlsXCIpO1xuY29uc3QgTG9jYXRpb25zID0gcmVxdWlyZShcIi4vbG9jYXRpb25zXCIpO1xuLypcbmhhc2ggdXJscyA6XG5cbi0gJycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVcbi0gJyMvJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVcbi0gJyMnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvbWVcbi0gJyMvc2VhcmNoLzp0ZXJtICAgICAgICAgICAgICAgICAgIHNlYXJjaFxuLSAnIy9kaXJlY3Rvcmllcy86c2hhP25hbWU9eHh4ICAgICAgZGlyZWN0b3J5XG4tICcjL2Jyb3dzZSdcbi0gJyMvcmVmcy86bmFtZSdcbiovXG5mdW5jdGlvbiBwYXJzZVVSTCh1cmwpIHtcbiAgICB2YXIgcGFyc2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpLCBzZWFyY2hPYmplY3QgPSB7fSwgcXVlcmllcywgc3BsaXQsIGk7XG4gICAgLy8gTGV0IHRoZSBicm93c2VyIGRvIHRoZSB3b3JrXG4gICAgcGFyc2VyLmhyZWYgPSB1cmw7XG4gICAgLy8gQ29udmVydCBxdWVyeSBzdHJpbmcgdG8gb2JqZWN0XG4gICAgcXVlcmllcyA9IHBhcnNlci5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKS5zcGxpdCgnJicpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBxdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNwbGl0ID0gcXVlcmllc1tpXS5zcGxpdCgnPScpO1xuICAgICAgICBzZWFyY2hPYmplY3Rbc3BsaXRbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KHNwbGl0WzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aG5hbWU6IGRlY29kZVVSSUNvbXBvbmVudChwYXJzZXIucGF0aG5hbWUpLFxuICAgICAgICBzZWFyY2hPYmplY3Q6IHNlYXJjaE9iamVjdFxuICAgIH07XG59XG5mdW5jdGlvbiByZWFkSGFzaEFuZEFjdCgpIHtcbiAgICBsZXQgaGlkZUF1ZGlvSnVrZWJveCA9IGZhbHNlO1xuICAgIGxldCBoaWRlSW5mb1BhbmVsID0gdHJ1ZTtcbiAgICBsZXQgaGFzaCA9ICcnO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAmJiB3aW5kb3cubG9jYXRpb24uaGFzaC5zdGFydHNXaXRoKCcjJykpXG4gICAgICAgIGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gICAgbGV0IHBhcnNlZCA9IHBhcnNlVVJMKGhhc2gpO1xuICAgIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3NlYXJjaC8nKSkge1xuICAgICAgICBzZWFyY2hJdGVtcyhwYXJzZWQucGF0aG5hbWUuc3Vic3RyKCcvc2VhcmNoLycubGVuZ3RoKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvZGlyZWN0b3JpZXMvJykpIHtcbiAgICAgICAgY29uc3Qgc2hhID0gcGFyc2VkLnBhdGhuYW1lLnN1YnN0cmluZygnL2RpcmVjdG9yaWVzLycubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnNlZC5zZWFyY2hPYmplY3QubmFtZSB8fCBzaGE7XG4gICAgICAgIGxvYWREaXJlY3Rvcnkoe1xuICAgICAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgICAgIHNoYSxcbiAgICAgICAgICAgIG5hbWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZSA9PSAnL2Jyb3dzZScpIHtcbiAgICAgICAgbG9hZFJlZmVyZW5jZXMoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9yZWZzLycpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvcmVmcy8nLmxlbmd0aCk7XG4gICAgICAgIGxvYWRSZWZlcmVuY2UobmFtZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZSA9PSAnL3BsYXlsaXN0cycpIHtcbiAgICAgICAgbG9hZFBsYXlsaXN0cygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3BsYXlsaXN0cy8nKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyc2VkLnBhdGhuYW1lLnN1YnN0cmluZygnL3BsYXlsaXN0cy8nLmxlbmd0aCk7XG4gICAgICAgIGxvYWRQbGF5bGlzdChuYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lID09ICcvc2xpZGVzaG93Jykge1xuICAgICAgICBoaWRlQXVkaW9KdWtlYm94ID0gdHJ1ZTtcbiAgICAgICAgc2hvd1NsaWRlc2hvdygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL2luZm8vJykpIHtcbiAgICAgICAgaGlkZUluZm9QYW5lbCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpdGVtID0gSlNPTi5wYXJzZShwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvaW5mby8nLmxlbmd0aCkpO1xuICAgICAgICBzaG93SW5mbyhpdGVtKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB1bmtvd24gcGF0aCAke3BhcnNlZC5wYXRobmFtZX1gKTtcbiAgICB9XG4gICAgaWYgKGhpZGVJbmZvUGFuZWwpXG4gICAgICAgIEluZm9QYW5lbC5oaWRlKCk7XG4gICAgaWYgKGhpZGVBdWRpb0p1a2Vib3gpXG4gICAgICAgIGF1ZGlvUGFuZWwucm9vdC5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKTtcbiAgICBlbHNlXG4gICAgICAgIGF1ZGlvUGFuZWwucm9vdC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKTtcbn1cbnZhciBNb2RlO1xuKGZ1bmN0aW9uIChNb2RlKSB7XG4gICAgTW9kZVtNb2RlW1wiQXVkaW9cIl0gPSAwXSA9IFwiQXVkaW9cIjtcbiAgICBNb2RlW01vZGVbXCJJbWFnZVwiXSA9IDFdID0gXCJJbWFnZVwiO1xufSkoTW9kZSB8fCAoTW9kZSA9IHt9KSk7XG5jb25zdCBzZWFyY2hQYW5lbCA9IFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9QYW5lbCA9IEF1ZGlvUGFuZWwuYXVkaW9QYW5lbC5jcmVhdGUoKTtcbmNvbnN0IGF1ZGlvSnVrZWJveCA9IG5ldyBBdWRpb1BhbmVsLkF1ZGlvSnVrZWJveChhdWRpb1BhbmVsKTtcbmNvbnN0IGRpcmVjdG9yeVBhbmVsID0gRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuY3JlYXRlKCk7XG5sZXQgc2xpZGVzaG93ID0gbnVsbDtcbmxldCBsYXN0RGlzcGxheWVkRmlsZXMgPSBudWxsO1xubGV0IGxhc3RTZWFyY2hUZXJtID0gbnVsbDsgLy8gSEFDSyB2ZXJ5IHRlbXBvcmFyeVxubGV0IGFjdHVhbENvbnRlbnQgPSBudWxsO1xubGV0IGN1cnJlbnRNb2RlID0gTW9kZS5BdWRpbztcbmZ1bmN0aW9uIHNldENvbnRlbnQoY29udGVudCkge1xuICAgIGlmIChjb250ZW50ID09PSBhY3R1YWxDb250ZW50KVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudCAmJiBhY3R1YWxDb250ZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYWN0dWFsQ29udGVudCk7XG4gICAgYWN0dWFsQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIFVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKGNvbnRlbnQsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbn1cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW9QYW5lbC5yb290KTtcblVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKHNlYXJjaFBhbmVsLnJvb3QsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbkF1dGguYXV0b1JlbmV3QXV0aCgpO1xuLyoqXG4gKiBXYWl0ZXIgdG9vbFxuICovXG5jb25zdCBiZWdpbldhaXQgPSAoY2FsbGJhY2spID0+IHtcbiAgICBsZXQgaXNEb25lID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCgoKSA9PiBpc0RvbmUgfHwgY2FsbGJhY2soKSwgNTAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgICAgICBpc0RvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4vKipcbiAqIEV2ZW50c1xuICovXG5mdW5jdGlvbiBiZWF1dGlmeU5hbWVzKGl0ZW1zKSB7XG4gICAgcmV0dXJuIGl0ZW1zLm1hcChmaWxlID0+IHtcbiAgICAgICAgaWYgKGZpbGUubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpIHtcbiAgICAgICAgICAgIGxldCBkb3QgPSBmaWxlLm5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgICAgIGlmIChkb3QpXG4gICAgICAgICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5uYW1lLnN1YnN0cmluZygwLCBkb3QpO1xuICAgICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5uYW1lLnJlcGxhY2UoLydfJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLycgICcvZywgJyAnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bIF0qLVsgXSovZywgJyAtICcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZ29TaGFJbmZvKGl0ZW0pIHtcbiAgICBMb2NhdGlvbnMuZ29TaGFJbmZvKGl0ZW0pO1xufVxuZnVuY3Rpb24gZ29TZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgY29uc3QgdXJsID0gYCMvc2VhcmNoLyR7dGVybX1gO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xufVxuZnVuY3Rpb24gZ29Mb2FkRGlyZWN0b3J5KHNoYSwgbmFtZSkge1xuICAgIGNvbnN0IHVybCA9IGAjL2RpcmVjdG9yaWVzLyR7c2hhfT9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGxhc3RTZWFyY2hUZXJtID8gKGxhc3RTZWFyY2hUZXJtICsgJy8nICsgbmFtZSkgOiBuYW1lKX1gO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xufVxuZnVuY3Rpb24gZ29SZWZlcmVuY2UobmFtZSkge1xuICAgIGNvbnN0IHVybCA9IGAjL3JlZnMvJHtuYW1lfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5mdW5jdGlvbiBnb1BsYXlsaXN0KG5hbWUpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAjL3BsYXlsaXN0cy8ke25hbWV9YDtcbn1cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEl0ZW1zKHRlcm0pIHtcbiAgICBTZWFyY2hQYW5lbC5zZWFyY2hQYW5lbC5kaXNwbGF5VGl0bGUoc2VhcmNoUGFuZWwsIGZhbHNlKTtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBTdGlsbCBzZWFyY2hpbmcgJyR7dGVybX0nIC4uLmAsIDApKTtcbiAgICBsZXQgbWltZVR5cGUgPSAnJSc7XG4gICAgc3dpdGNoIChjdXJyZW50TW9kZSkge1xuICAgICAgICBjYXNlIE1vZGUuQXVkaW86XG4gICAgICAgICAgICBtaW1lVHlwZSA9ICdhdWRpby8lJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1vZGUuSW1hZ2U6XG4gICAgICAgICAgICBtaW1lVHlwZSA9ICdpbWFnZS8lJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgcmVzID0gYXdhaXQgUmVzdC5zZWFyY2godGVybSwgbWltZVR5cGUpO1xuICAgIGlmICghcmVzKSB7XG4gICAgICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgRXJyb3Igb2NjdXJyZWQsIHJldHJ5IHBsZWFzZS4uLmAsIC0xKTtcbiAgICB9XG4gICAgLy8gZmlyc3QgZmlsZXMgdGhlbiBkaXJlY3Rvcmllc1xuICAgIHJlcy5pdGVtcyA9IHJlcy5pdGVtc1xuICAgICAgICAuZmlsdGVyKGkgPT4gaS5taW1lVHlwZSAhPSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JylcbiAgICAgICAgLmNvbmNhdChyZXMuaXRlbXMuZmlsdGVyKGkgPT4gaS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JykpO1xuICAgIHJlcy5pdGVtcyA9IGJlYXV0aWZ5TmFtZXMocmVzLml0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgc3dpdGNoIChjdXJyZW50TW9kZSkge1xuICAgICAgICBjYXNlIE1vZGUuQXVkaW86XG4gICAgICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRWYWx1ZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBgUmVzdWx0cyBmb3IgJyR7dGVybX0nYCxcbiAgICAgICAgICAgICAgICBpdGVtczogcmVzLml0ZW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1vZGUuSW1hZ2U6XG4gICAgICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRJbWFnZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgICAgICAgICB0ZXJtOiB0ZXJtLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiByZXMuaXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuc2VhcmNoUGFuZWwuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgbGV0IHRlcm0gPSBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlO1xuICAgIHNlYXJjaFBhbmVsLnRlcm0uYmx1cigpO1xuICAgIGdvU2VhcmNoSXRlbXModGVybSk7XG59KTtcbmZ1bmN0aW9uIGdldE1pbWVUeXBlKGYpIHtcbiAgICBpZiAoZi5pc0RpcmVjdG9yeSlcbiAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknO1xuICAgIGxldCBwb3MgPSBmLm5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAocG9zID49IDApIHtcbiAgICAgICAgbGV0IGV4dGVuc2lvbiA9IGYubmFtZS5zdWJzdHIocG9zICsgMSkudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGV4dGVuc2lvbiBpbiBNaW1lVHlwZXMuTWltZVR5cGVzKVxuICAgICAgICAgICAgcmV0dXJuIE1pbWVUeXBlcy5NaW1lVHlwZXNbZXh0ZW5zaW9uXTtcbiAgICB9XG4gICAgcmV0dXJuICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xufVxuZnVuY3Rpb24gZGlyZWN0b3J5RGVzY3JpcHRvclRvRmlsZURlc2NyaXB0b3IoZCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNoYTogZC5jb250ZW50U2hhLFxuICAgICAgICBuYW1lOiBkLm5hbWUsXG4gICAgICAgIG1pbWVUeXBlOiBnZXRNaW1lVHlwZShkKSxcbiAgICAgICAgbGFzdFdyaXRlOiBkLmxhc3RXcml0ZSxcbiAgICAgICAgc2l6ZTogZC5zaXplXG4gICAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWREaXJlY3RvcnkoaXRlbSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBpdGVtLm5hbWUpO1xuICAgIH0pO1xuICAgIGxldCBkaXJlY3RvcnlEZXNjcmlwdG9yID0gYXdhaXQgUmVzdC5nZXREaXJlY3RvcnlEZXNjcmlwdG9yKGl0ZW0uc2hhKTtcbiAgICBsZXQgaXRlbXMgPSBkaXJlY3RvcnlEZXNjcmlwdG9yLmZpbGVzLm1hcChkaXJlY3RvcnlEZXNjcmlwdG9yVG9GaWxlRGVzY3JpcHRvcik7XG4gICAgaXRlbXMgPSBiZWF1dGlmeU5hbWVzKGl0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9IGl0ZW0ubmFtZTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIHN3aXRjaCAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgY2FzZSBNb2RlLkF1ZGlvOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNb2RlLkltYWdlOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0SW1hZ2VzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgdGVybTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUmVmZXJlbmNlcygpIHtcbiAgICBsZXQgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIFwiUmVmZXJlbmNlc1wiKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlcygpO1xuICAgIGxldCBpdGVtcyA9IHJlZmVyZW5jZXMubWFwKHJlZmVyZW5jZSA9PiAoe1xuICAgICAgICBuYW1lOiByZWZlcmVuY2UsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9yZWZlcmVuY2UnLFxuICAgICAgICBzaGE6IHJlZmVyZW5jZSxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9ICcnO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgIG5hbWU6IFwiUmVmZXJlbmNlc1wiLFxuICAgICAgICBpdGVtc1xuICAgIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFBsYXlsaXN0cygpIHtcbiAgICBsZXQgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIFwiUGxheWxpc3RzXCIpO1xuICAgIH0pO1xuICAgIGxldCByZWZlcmVuY2VzID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2VzKCk7XG4gICAgbGV0IHVzZXIgPSBhd2FpdCBBdXRoLm1lKCk7XG4gICAgY29uc3QgcHJlZml4ID0gYFBMVUdJTi1QTEFZTElTVFMtJHt1c2VyLnV1aWQudG9VcHBlckNhc2UoKX0tYDtcbiAgICBsZXQgaXRlbXMgPSByZWZlcmVuY2VzXG4gICAgICAgIC5maWx0ZXIocmVmZXJlbmNlID0+IHJlZmVyZW5jZS50b1VwcGVyQ2FzZSgpLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgLm1hcChyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnN1YnN0cihwcmVmaXgubGVuZ3RoKSlcbiAgICAgICAgLm1hcChyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnN1YnN0cigwLCAxKS50b1VwcGVyQ2FzZSgpICsgcmVmZXJlbmNlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAubWFwKHJlZmVyZW5jZSA9PiAoe1xuICAgICAgICBuYW1lOiByZWZlcmVuY2UsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9wbGF5bGlzdCcsXG4gICAgICAgIHNoYTogcmVmZXJlbmNlLFxuICAgICAgICBzaXplOiAwXG4gICAgfSkpO1xuICAgIGxhc3REaXNwbGF5ZWRGaWxlcyA9IGl0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gJyc7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRWYWx1ZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgbmFtZTogXCJQbGF5bGlzdHNcIixcbiAgICAgICAgaXRlbXNcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdChuYW1lKSB7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIGBQbGF5bGlzdCAnJHtuYW1lfSdgKTtcbiAgICB9KTtcbiAgICBsZXQgdXNlciA9IGF3YWl0IEF1dGgubWUoKTtcbiAgICBsZXQgcmVmZXJlbmNlID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2UoYFBMVUdJTi1QTEFZTElTVFMtJHt1c2VyLnV1aWQudG9VcHBlckNhc2UoKX0tJHtuYW1lLnRvVXBwZXJDYXNlKCl9YCk7XG4gICAgbGV0IGNvbW1pdCA9IGF3YWl0IFJlc3QuZ2V0Q29tbWl0KHJlZmVyZW5jZS5jdXJyZW50Q29tbWl0U2hhKTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBhd2FpdCBsb2FkRGlyZWN0b3J5KHtcbiAgICAgICAgc2hhOiBjb21taXQuZGlyZWN0b3J5RGVzY3JpcHRvclNoYSxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZWZlcmVuY2UobmFtZSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBgUmVmZXJlbmNlICcke25hbWV9J2ApO1xuICAgIH0pO1xuICAgIGxldCByZWZlcmVuY2UgPSBhd2FpdCBSZXN0LmdldFJlZmVyZW5jZShuYW1lKTtcbiAgICBsZXQgY29tbWl0ID0gYXdhaXQgUmVzdC5nZXRDb21taXQocmVmZXJlbmNlLmN1cnJlbnRDb21taXRTaGEpO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIGF3YWl0IGxvYWREaXJlY3Rvcnkoe1xuICAgICAgICBzaGE6IGNvbW1pdC5kaXJlY3RvcnlEZXNjcmlwdG9yU2hhLFxuICAgICAgICBuYW1lLFxuICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pO1xufVxuZnVuY3Rpb24gaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCwgZXZlbnQpIHtcbiAgICBsZXQgaXRlbSA9IGxhc3REaXNwbGF5ZWRGaWxlc1tjaGlsZEluZGV4XTtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygneC1pbmZvLWRpc3BsYXktYWN0aW9uJykpIHtcbiAgICAgICAgZ29TaGFJbmZvKGl0ZW0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCd4LWltYWdlLXpvb20tYWN0aW9uJykpIHtcbiAgICAgICAgbGV0IHVucm9sbGVkSXRlbXMgPSBsYXN0RGlzcGxheWVkRmlsZXM7XG4gICAgICAgIGxldCBjdXJyZW50UG9zaXRpb24gPSBjaGlsZEluZGV4O1xuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmV4dFBvc2l0aW9uID0gY3VycmVudFBvc2l0aW9uICsgZGlyZWN0aW9uO1xuICAgICAgICAgICAgd2hpbGUgKG5leHRQb3NpdGlvbiA+PSAwICYmIG5leHRQb3NpdGlvbiA8IHVucm9sbGVkSXRlbXMubGVuZ3RoICYmICF1bnJvbGxlZEl0ZW1zW25leHRQb3NpdGlvbl0ubWltZVR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpIHtcbiAgICAgICAgICAgICAgICBuZXh0UG9zaXRpb24gKz0gZGlyZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5leHRQb3NpdGlvbiA+PSAwICYmIG5leHRQb3NpdGlvbiA8IHVucm9sbGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bnJvbGxlZEl0ZW1zW25leHRQb3NpdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgSW1hZ2VEZXRhaWxzLnNob3coaXRlbSwge1xuICAgICAgICAgICAgbmV4dDogKCkgPT4gbmV4dFBvc2l0aW9uKDEpLFxuICAgICAgICAgICAgcHJldmlvdXM6ICgpID0+IG5leHRQb3NpdGlvbigtMSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSB7XG4gICAgICAgIGdvTG9hZERpcmVjdG9yeShpdGVtLnNoYSwgaXRlbS5uYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcmVmZXJlbmNlJykge1xuICAgICAgICBnb1JlZmVyZW5jZShpdGVtLnNoYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3BsYXlsaXN0Jykge1xuICAgICAgICBnb1BsYXlsaXN0KGl0ZW0uc2hhKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICBhdWRpb0p1a2Vib3guYWRkQW5kUGxheShpdGVtKTtcbiAgICAgICAgLy8gc2V0IGFuIHVucm9sbGVyXG4gICAgICAgIGlmIChjaGlsZEluZGV4ID49IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRlcm0gPSBsYXN0U2VhcmNoVGVybTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxlZEl0ZW1zID0gbGFzdERpc3BsYXllZEZpbGVzLnNsaWNlKGNoaWxkSW5kZXggKyAxKS5maWx0ZXIoZiA9PiBmLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAodW5yb2xsZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRoZW4gJyR7dW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleF0ubmFtZS5zdWJzdHIoMCwgMjApfScgYW5kICR7dW5yb2xsZWRJdGVtcy5sZW5ndGggLSB1bnJvbGxJbmRleCAtIDF9IG90aGVyICcke3Rlcm19JyBpdGVtcy4uLmA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGZpbmlzaGVkICcke3Rlcm19IHNvbmdzYDtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiB1bnJvbGxlZEl0ZW1zW3Vucm9sbEluZGV4KytdLFxuICAgICAgICAgICAgICAgICAgICBoYXNOZXh0OiAoKSA9PiB1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNob3dTbGlkZXNob3coKSB7XG4gICAgaWYgKCFzbGlkZXNob3cpXG4gICAgICAgIHNsaWRlc2hvdyA9IFNsaWRlc2hvdy5jcmVhdGUoKTtcbiAgICBzZXRDb250ZW50KHNsaWRlc2hvdy5yb290KTtcbn1cbmZ1bmN0aW9uIHNob3dJbmZvKGl0ZW0pIHtcbiAgICBJbmZvUGFuZWwuc2hvdyhpdGVtKTtcbn1cbmRpcmVjdG9yeVBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIGRpcmVjdG9yeVBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihkaXJlY3RvcnlQYW5lbCwgZXZlbnQpO1xuICAgIGlmIChsYXN0RGlzcGxheWVkRmlsZXMgJiYgZWxlbWVudCA9PSBkaXJlY3RvcnlQYW5lbC5pdGVtcyAmJiBjaGlsZEluZGV4ID49IDAgJiYgY2hpbGRJbmRleCA8IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCwgZXZlbnQpO1xuICAgIH1cbn0pO1xuc2VhcmNoUGFuZWwuYXVkaW9Nb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGlmIChjdXJyZW50TW9kZSA9PSBNb2RlLkF1ZGlvKSB7XG4gICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBBdWRpbyBtb2RlIGFscmVhZHkgYWN0aXZhdGVkYCwgMCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEF1ZGlvIG1vZGUgYWN0aXZhdGVkYCwgMCk7XG4gICAgY3VycmVudE1vZGUgPSBNb2RlLkF1ZGlvO1xuICAgIHJlYWRIYXNoQW5kQWN0KCk7XG59KTtcbnNlYXJjaFBhbmVsLmltYWdlTW9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoY3VycmVudE1vZGUgPT0gTW9kZS5JbWFnZSkge1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgSW1hZ2UgbW9kZSBhbHJlYWR5IGFjdGl2YXRlZGAsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBJbWFnZSBtb2RlIGFjdGl2YXRlZGAsIDApO1xuICAgIGN1cnJlbnRNb2RlID0gTW9kZS5JbWFnZTtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xufSk7XG5yZWFkSGFzaEFuZEFjdCgpO1xud2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xuICAgIC8qaWYgKGV2ZW50LnN0YXRlKSB7XG4gICAgICAgIGN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhID0gZXZlbnQuc3RhdGUuY3VycmVudERpcmVjdG9yeURlc2NyaXB0b3JTaGFcbiAgICAgICAgY3VycmVudENsaWVudElkID0gZXZlbnQuc3RhdGUuY3VycmVudENsaWVudElkXG4gICAgICAgIGN1cnJlbnRQaWN0dXJlSW5kZXggPSBldmVudC5zdGF0ZS5jdXJyZW50UGljdHVyZUluZGV4IHx8IDBcbiBcbiAgICAgICAgaWYgKCFjdXJyZW50Q2xpZW50SWQpXG4gICAgICAgICAgICBlbChcIiNtZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRkZW5cIilcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZyb21IYXNoKClcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9Ki9cbn07XG5BdXRoLm1lKCkudGhlbih1c2VyID0+IFVpVG9vbC5lbCgndXNlci1pZCcpLmlubmVyVGV4dCA9IHVzZXIudXVpZCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IEtCID0gMTAyNDtcbmNvbnN0IE1CID0gMTAyNCAqIEtCO1xuY29uc3QgR0IgPSAxMDI0ICogTUI7XG5jb25zdCBUQiA9IDEwMjQgKiBHQjtcbmZ1bmN0aW9uIGZyaWVuZGx5U2l6ZShzaXplKSB7XG4gICAgaWYgKHNpemUgPiAyICogVEIpXG4gICAgICAgIHJldHVybiBgJHsoc2l6ZSAvIFRCKS50b0ZpeGVkKDEpfSBUQmIgKCR7c2l6ZX0gYnl0ZXMpYDtcbiAgICBpZiAoc2l6ZSA+IDIgKiBHQilcbiAgICAgICAgcmV0dXJuIGAkeyhzaXplIC8gR0IpLnRvRml4ZWQoMSl9IEdiICgke3NpemV9IGJ5dGVzKWA7XG4gICAgaWYgKHNpemUgPiAyICogTUIpXG4gICAgICAgIHJldHVybiBgJHsoc2l6ZSAvIE1CKS50b0ZpeGVkKDEpfSBNYiAoJHtzaXplfSBieXRlcylgO1xuICAgIGlmIChzaXplID4gMiAqIEtCKVxuICAgICAgICByZXR1cm4gYCR7KHNpemUgLyBLQikudG9GaXhlZCgxKX0ga2IgKCR7c2l6ZX0gYnl0ZXMpYDtcbiAgICBpZiAoc2l6ZSA+IDEpXG4gICAgICAgIHJldHVybiBgJHtzaXplfSBieXRlc2A7XG4gICAgaWYgKHNpemUgPT0gMSlcbiAgICAgICAgcmV0dXJuIGAxIGJ5dGVgO1xuICAgIHJldHVybiBgZW1wdHlgO1xufVxubGV0IGlzU2hvd24gPSBmYWxzZTtcbmNvbnN0IHRlbXBsYXRlID0gYFxuPGRpdiBjbGFzcz1cIm11aS1jb250YWluZXJcIj5cbiAgICA8ZGl2IGNsYXNzPSdtdWktcGFuZWwnPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJ0aXRsZVwiIGNsYXNzPVwibXVpLS10ZXh0LXRpdGxlXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2PnNoYTogPHNwYW4geC1pZD0nc2hhJz48L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXY+c2l6ZTogPHNwYW4geC1pZD0nc2l6ZSc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2Pm1pbWUgdHlwZTogPHNwYW4geC1pZD0nbWltZVR5cGUnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXY+PGEgeC1pZD1cImRvd25sb2FkXCIgaHJlZj1cIiNcIj5kb3dubG9hZCBsaW5rPC9hPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiB4LWlkPVwiZXh0cmFzXCI+PC9kaXY+XG5cbiAgICAgICAgPGRpdj5uYW1lczogPHNwYW4geC1pZD0nbmFtZXMnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdj53cml0ZSBkYXRlczogPHNwYW4geC1pZD0nd3JpdGVEYXRlcyc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2PnBhcmVudHM6IDxkaXYgeC1pZD0ncGFyZW50cyc+PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXY+c291cmNlczogPGRpdiB4LWlkPSdzb3VyY2VzJz48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdj5leGlmOiA8ZGl2IHgtaWQ9XCJleGlmXCI+PC9kaXY+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2IHgtaWQ9XCJjbG9zZVwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0IG11aS1idG4tLXByaW1hcnlcIj5DbG9zZTwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmNvbnN0IGNvbnRlbnQgPSB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlKTtcbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgJ2tleWJvYXJkJzogZmFsc2UsXG4gICAgJ3N0YXRpYyc6IHRydWUsXG4gICAgJ29uY2xvc2UnOiBmdW5jdGlvbiAoKSB7IH1cbn07XG5jb250ZW50LmNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGhpc3RvcnkuYmFjaygpO1xufSk7XG5mdW5jdGlvbiBoaWRlKCkge1xuICAgIGlmICghaXNTaG93bilcbiAgICAgICAgcmV0dXJuO1xuICAgIGlzU2hvd24gPSBmYWxzZTtcbiAgICBtdWkub3ZlcmxheSgnb2ZmJyk7XG59XG5leHBvcnRzLmhpZGUgPSBoaWRlO1xuZnVuY3Rpb24gc2hvdyhpdGVtKSB7XG4gICAgY29udGVudC50aXRsZS5pbm5lclRleHQgPSBgJHtpdGVtLm5hbWV9IGRldGFpbHNgO1xuICAgIGNvbnRlbnQuc2hhLmlubmVyVGV4dCA9IGl0ZW0uc2hhO1xuICAgIGNvbnRlbnQubWltZVR5cGUuaW5uZXJUZXh0ID0gaXRlbS5taW1lVHlwZTtcbiAgICBjb250ZW50LnNpemUuaW5uZXJUZXh0ID0gZnJpZW5kbHlTaXplKGl0ZW0uc2l6ZSk7XG4gICAgY29udGVudC5kb3dubG9hZC5ocmVmID0gUmVzdC5nZXRTaGFDb250ZW50VXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlLCBpdGVtLm5hbWUsIHRydWUsIHRydWUpO1xuICAgIGlmIChpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSB7XG4gICAgICAgIGNvbnRlbnQuZXh0cmFzLmlubmVySFRNTCA9IGA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtSZXN0LmdldFNoYUNvbnRlbnRVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGl0ZW0ubmFtZSwgdHJ1ZSwgZmFsc2UpfVwiPjxpbWcgc3JjPVwiJHtSZXN0LmdldFNoYUltYWdlVGh1bWJuYWlsVXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKX1cIi8+PC9hPjxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PmA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb250ZW50LmV4dHJhcy5pbm5lckhUTUwgPSAnJztcbiAgICB9XG4gICAgaWYgKCFpc1Nob3duKVxuICAgICAgICBtdWkub3ZlcmxheSgnb24nLCBvcHRpb25zLCBjb250ZW50LnJvb3QpO1xuICAgIGlzU2hvd24gPSB0cnVlO1xuICAgIGNvbnN0IGxvYWRJbmZvID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBpbmZvID0gYXdhaXQgUmVzdC5nZXRTaGFJbmZvKGl0ZW0uc2hhKTtcbiAgICAgICAgaWYgKCFpbmZvKSB7XG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQ2Fubm90IGxvYWQgZGV0YWlsZWQgaW5mb3JtYXRpb24uLi5gLCAtMSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudC5taW1lVHlwZS5pbm5lclRleHQgPSBpbmZvLm1pbWVUeXBlcy5qb2luKCcsICcpO1xuICAgICAgICBjb250ZW50Lm5hbWVzLmlubmVyVGV4dCA9IGluZm8ubmFtZXMuam9pbignLCAnKTtcbiAgICAgICAgY29udGVudC53cml0ZURhdGVzLmlubmVyVGV4dCA9IGluZm8ud3JpdGVEYXRlcy5tYXAoZCA9PiBuZXcgRGF0ZShkIC8gMTAwMCkudG9EYXRlU3RyaW5nKCkpLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnRlbnQuc2l6ZS5pbm5lclRleHQgPSBpbmZvLnNpemVzLm1hcChmcmllbmRseVNpemUpLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnRlbnQucGFyZW50cy5pbm5lckhUTUwgPSBpbmZvLnBhcmVudHMubWFwKHAgPT4gYDxkaXY+PGEgaHJlZj1cIiMvZGlyZWN0b3JpZXMvJHtwfT9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGAke2l0ZW0ubmFtZX0ncyBwYXJlbnRzYCl9XCI+JHtwfTwvYT48L2Rpdj5gKS5qb2luKCcnKTtcbiAgICAgICAgY29udGVudC5zb3VyY2VzLmlubmVySFRNTCA9IGluZm8uc291cmNlcy5tYXAocyA9PiBgPGRpdj48YSBocmVmPVwiIy9yZWZzLyR7c31cIj4ke3N9PC9hPjwvZGl2PmApLmpvaW4oJycpO1xuICAgICAgICBpZiAoaW5mby5leGlmcyAmJiBpbmZvLmV4aWZzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGVudC5leGlmLmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJtdWktdGFibGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPlByb3BlcnR5PC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aD5WYWx1ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAke2luZm8uZXhpZnMubWFwKGV4aWYgPT4gT2JqZWN0LmVudHJpZXMoZXhpZikubWFwKChba2V5LCB2YWx1ZV0pID0+IGA8dHI+PHRkPiR7a2V5fTwvdGQ+PHRkPiR7dmFsdWV9PC90ZD48L3RyPmApLmpvaW4oJycpKS5qb2luKCcnKX1cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50LmV4aWYuaW5uZXJIVE1MID0gYG5vIGV4aWYgZGF0YWA7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGxvYWRJbmZvKCk7XG59XG5leHBvcnRzLnNob3cgPSBzaG93O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5mby1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGdvU2hhSW5mbyhpdGVtKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgIy9pbmZvLyR7ZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGl0ZW0pKX1gO1xufVxuZXhwb3J0cy5nb1NoYUluZm8gPSBnb1NoYUluZm87XG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2NhdGlvbnMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmxldCBtZXNzYWdlcyA9IFtdO1xuY29uc3QgcG9wdXBUZW1wbGF0ZSA9IGBcbiAgICA8ZGl2IHgtaWQ9XCJtZXNzYWdlc1wiPlxuICAgIDwvZGl2PmA7XG5sZXQgcG9wdXAgPSB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHBvcHVwVGVtcGxhdGUpO1xuZnVuY3Rpb24gcmVmcmVzaCgpIHtcbiAgICBwb3B1cC5tZXNzYWdlcy5pbm5lckhUTUwgPSBtZXNzYWdlcy5tYXAobWVzc2FnZSA9PiB7XG4gICAgICAgIGxldCBzdHlsZSA9ICcnO1xuICAgICAgICBpZiAobWVzc2FnZS5mZWVsaW5nID4gMClcbiAgICAgICAgICAgIHN0eWxlID0gYGJhY2tncm91bmQtY29sb3I6ICM3MGNhODU7IGNvbG9yOiB3aGl0ZTtgO1xuICAgICAgICBlbHNlIGlmIChtZXNzYWdlLmZlZWxpbmcgPCAwKVxuICAgICAgICAgICAgc3R5bGUgPSBgYmFja2dyb3VuZC1jb2xvcjogI0Y0NDMzNjsgY29sb3I6IHdoaXRlO2A7XG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm11aS1wYW5lbCB4LW1lc3NhZ2UtcGFuZWxcIiBzdHlsZT1cIiR7c3R5bGV9XCI+JHttZXNzYWdlLmh0bWx9PC9kaXY+YDtcbiAgICB9KS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIGRpc3BsYXlNZXNzYWdlKGh0bWwsIGZlZWxpbmcpIHtcbiAgICBtZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgaHRtbCxcbiAgICAgICAgZmVlbGluZ1xuICAgIH0pO1xuICAgIHJlZnJlc2goKTtcbiAgICBpZiAoIXBvcHVwLnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocG9wdXAucm9vdCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG1lc3NhZ2VzLnNoaWZ0KCk7XG4gICAgICAgIHJlZnJlc2goKTtcbiAgICAgICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHBvcHVwLnJvb3QpO1xuICAgIH0sIDQwMDApO1xufVxuZXhwb3J0cy5kaXNwbGF5TWVzc2FnZSA9IGRpc3BsYXlNZXNzYWdlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWVzc2FnZXMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBleHRlbnNpb25Gcm9tTWltZVR5cGUobWltZVR5cGUpIHtcbiAgICBmb3IgKGxldCBbZXh0ZW5zaW9uLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0cy5NaW1lVHlwZXMpKSB7XG4gICAgICAgIGlmIChtaW1lVHlwZSA9PSB2YWx1ZSlcbiAgICAgICAgICAgIHJldHVybiBleHRlbnNpb247XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuZXhwb3J0cy5leHRlbnNpb25Gcm9tTWltZVR5cGUgPSBleHRlbnNpb25Gcm9tTWltZVR5cGU7XG5leHBvcnRzLk1pbWVUeXBlcyA9IHtcbiAgICBcIjNkbWxcIjogXCJ0ZXh0L3ZuZC5pbjNkLjNkbWxcIixcbiAgICBcIjNkc1wiOiBcImltYWdlL3gtM2RzXCIsXG4gICAgXCIzZzJcIjogXCJ2aWRlby8zZ3BwMlwiLFxuICAgIFwiM2dwXCI6IFwidmlkZW8vM2dwcFwiLFxuICAgIFwiN3pcIjogXCJhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWRcIixcbiAgICBcImFhYlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcImFhY1wiOiBcImF1ZGlvL3gtYWFjXCIsXG4gICAgXCJhYW1cIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtbWFwXCIsXG4gICAgXCJhYXNcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtc2VnXCIsXG4gICAgXCJhYndcIjogXCJhcHBsaWNhdGlvbi94LWFiaXdvcmRcIixcbiAgICBcImFjXCI6IFwiYXBwbGljYXRpb24vcGtpeC1hdHRyLWNlcnRcIixcbiAgICBcImFjY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWVyaWNhbmR5bmFtaWNzLmFjY1wiLFxuICAgIFwiYWNlXCI6IFwiYXBwbGljYXRpb24veC1hY2UtY29tcHJlc3NlZFwiLFxuICAgIFwiYWN1XCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvYm9sXCIsXG4gICAgXCJhY3V0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXCIsXG4gICAgXCJhZHBcIjogXCJhdWRpby9hZHBjbVwiLFxuICAgIFwiYWVwXCI6IFwiYXBwbGljYXRpb24vdm5kLmF1ZGlvZ3JhcGhcIixcbiAgICBcImFmbVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwiYWZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImFoZWFkXCI6IFwiYXBwbGljYXRpb24vdm5kLmFoZWFkLnNwYWNlXCIsXG4gICAgXCJhaVwiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcImFpZlwiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlmY1wiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlmZlwiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlyXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmFpci1hcHBsaWNhdGlvbi1pbnN0YWxsZXItcGFja2FnZSt6aXBcIixcbiAgICBcImFpdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kdmIuYWl0XCIsXG4gICAgXCJhbWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1pZ2EuYW1pXCIsXG4gICAgXCJhcGVcIjogXCJhdWRpby9hcGVcIixcbiAgICBcImFwa1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbmRyb2lkLnBhY2thZ2UtYXJjaGl2ZVwiLFxuICAgIFwiYXBwY2FjaGVcIjogXCJ0ZXh0L2NhY2hlLW1hbmlmZXN0XCIsXG4gICAgXCJhcHBsaWNhdGlvblwiOiBcImFwcGxpY2F0aW9uL3gtbXMtYXBwbGljYXRpb25cIixcbiAgICBcImFwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1hcHByb2FjaFwiLFxuICAgIFwiYXJjXCI6IFwiYXBwbGljYXRpb24veC1mcmVlYXJjXCIsXG4gICAgXCJhc2FcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc2F4XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJhc2NcIjogXCJhcHBsaWNhdGlvbi9wZ3Atc2lnbmF0dXJlXCIsXG4gICAgXCJhc2N4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNmXCI6IFwidmlkZW8veC1tcy1hc2ZcIixcbiAgICBcImFzaHhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc21cIjogXCJ0ZXh0L3gtYXNtXCIsXG4gICAgXCJhc214XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNvXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjY3BhYy5zaW1wbHkuYXNvXCIsXG4gICAgXCJhc3BcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc3B4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXN4XCI6IFwidmlkZW8veC1tcy1hc2ZcIixcbiAgICBcImF0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXCIsXG4gICAgXCJhdG9tXCI6IFwiYXBwbGljYXRpb24vYXRvbSt4bWxcIixcbiAgICBcImF0b21jYXRcIjogXCJhcHBsaWNhdGlvbi9hdG9tY2F0K3htbFwiLFxuICAgIFwiYXRvbXN2Y1wiOiBcImFwcGxpY2F0aW9uL2F0b21zdmMreG1sXCIsXG4gICAgXCJhdHhcIjogXCJhcHBsaWNhdGlvbi92bmQuYW50aXguZ2FtZS1jb21wb25lbnRcIixcbiAgICBcImF1XCI6IFwiYXVkaW8vYmFzaWNcIixcbiAgICBcImF2aVwiOiBcInZpZGVvL3gtbXN2aWRlb1wiLFxuICAgIFwiYXdcIjogXCJhcHBsaWNhdGlvbi9hcHBsaXh3YXJlXCIsXG4gICAgXCJheGRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhemZcIjogXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpmXCIsXG4gICAgXCJhenNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpzXCIsXG4gICAgXCJhendcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1hem9uLmVib29rXCIsXG4gICAgXCJiYXRcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImJjcGlvXCI6IFwiYXBwbGljYXRpb24veC1iY3Bpb1wiLFxuICAgIFwiYmRmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWJkZlwiLFxuICAgIFwiYmRtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbSt3YnhtbFwiLFxuICAgIFwiYmVkXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlYWx2bmMuYmVkXCIsXG4gICAgXCJiaDJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c3Byc1wiLFxuICAgIFwiYmluXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJibGJcIjogXCJhcHBsaWNhdGlvbi94LWJsb3JiXCIsXG4gICAgXCJibG9yYlwiOiBcImFwcGxpY2F0aW9uL3gtYmxvcmJcIixcbiAgICBcImJtaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ibWlcIixcbiAgICBcImJtcFwiOiBcImltYWdlL2JtcFwiLFxuICAgIFwiYm9va1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJib3hcIjogXCJhcHBsaWNhdGlvbi92bmQucHJldmlld3N5c3RlbXMuYm94XCIsXG4gICAgXCJib3pcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXAyXCIsXG4gICAgXCJicGtcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImJ0aWZcIjogXCJpbWFnZS9wcnMuYnRpZlwiLFxuICAgIFwiYnpcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXBcIixcbiAgICBcImJ6MlwiOiBcImFwcGxpY2F0aW9uL3gtYnppcDJcIixcbiAgICBcImNcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiYzExYW1jXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsdWV0cnVzdC5jYXJ0b21vYmlsZS1jb25maWdcIixcbiAgICBcImMxMWFtelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnLXBrZ1wiLFxuICAgIFwiYzRkXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNGdcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0dVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjYWJcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtY2FiLWNvbXByZXNzZWRcIixcbiAgICBcImNhZlwiOiBcImF1ZGlvL3gtY2FmXCIsXG4gICAgXCJjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJjYXJcIjogXCJhcHBsaWNhdGlvbi92bmQuY3VybC5jYXJcIixcbiAgICBcImNhdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc2VjY2F0XCIsXG4gICAgXCJjYjdcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2JhXCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNiclwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnRcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2J6XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNjXCI6IFwidGV4dC94LWNcIixcbiAgICBcImNjdFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImNjeG1sXCI6IFwiYXBwbGljYXRpb24vY2N4bWwreG1sXCIsXG4gICAgXCJjZGJjbXNnXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvbnRhY3QuY21zZ1wiLFxuICAgIFwiY2RmXCI6IFwiYXBwbGljYXRpb24veC1uZXRjZGZcIixcbiAgICBcImNka2V5XCI6IFwiYXBwbGljYXRpb24vdm5kLm1lZGlhc3RhdGlvbi5jZGtleVwiLFxuICAgIFwiY2RtaWFcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWNhcGFiaWxpdHlcIixcbiAgICBcImNkbWljXCI6IFwiYXBwbGljYXRpb24vY2RtaS1jb250YWluZXJcIixcbiAgICBcImNkbWlkXCI6IFwiYXBwbGljYXRpb24vY2RtaS1kb21haW5cIixcbiAgICBcImNkbWlvXCI6IFwiYXBwbGljYXRpb24vY2RtaS1vYmplY3RcIixcbiAgICBcImNkbWlxXCI6IFwiYXBwbGljYXRpb24vY2RtaS1xdWV1ZVwiLFxuICAgIFwiY2R4XCI6IFwiY2hlbWljYWwveC1jZHhcIixcbiAgICBcImNkeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmNoZW1kcmF3K3htbFwiLFxuICAgIFwiY2R5XCI6IFwiYXBwbGljYXRpb24vdm5kLmNpbmRlcmVsbGFcIixcbiAgICBcImNlclwiOiBcImFwcGxpY2F0aW9uL3BraXgtY2VydFwiLFxuICAgIFwiY2ZjXCI6IFwiYXBwbGljYXRpb24veC1jb2xkZnVzaW9uXCIsXG4gICAgXCJjZm1cIjogXCJhcHBsaWNhdGlvbi94LWNvbGRmdXNpb25cIixcbiAgICBcImNmc1wiOiBcImFwcGxpY2F0aW9uL3gtY2ZzLWNvbXByZXNzZWRcIixcbiAgICBcImNnbVwiOiBcImltYWdlL2NnbVwiLFxuICAgIFwiY2hhdFwiOiBcImFwcGxpY2F0aW9uL3gtY2hhdFwiLFxuICAgIFwiY2htXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWh0bWxoZWxwXCIsXG4gICAgXCJjaHJ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rY2hhcnRcIixcbiAgICBcImNpZlwiOiBcImNoZW1pY2FsL3gtY2lmXCIsXG4gICAgXCJjaWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWNlcnRpZmljYXRlLWlzc3VlLWluaXRpYXRpb25cIixcbiAgICBcImNpbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1hcnRnYWxyeVwiLFxuICAgIFwiY2xhXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsYXltb3JlXCIsXG4gICAgXCJjbGFzc1wiOiBcImFwcGxpY2F0aW9uL2phdmEtdm1cIixcbiAgICBcImNsa2tcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5rZXlib2FyZFwiLFxuICAgIFwiY2xrcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLnBhbGV0dGVcIixcbiAgICBcImNsa3RcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci50ZW1wbGF0ZVwiLFxuICAgIFwiY2xrd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLndvcmRiYW5rXCIsXG4gICAgXCJjbGt4XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXJcIixcbiAgICBcImNscFwiOiBcImFwcGxpY2F0aW9uL3gtbXNjbGlwXCIsXG4gICAgXCJjbWNcIjogXCJhcHBsaWNhdGlvbi92bmQuY29zbW9jYWxsZXJcIixcbiAgICBcImNtZGZcIjogXCJjaGVtaWNhbC94LWNtZGZcIixcbiAgICBcImNtbFwiOiBcImNoZW1pY2FsL3gtY21sXCIsXG4gICAgXCJjbXBcIjogXCJhcHBsaWNhdGlvbi92bmQueWVsbG93cml2ZXItY3VzdG9tLW1lbnVcIixcbiAgICBcImNteFwiOiBcImltYWdlL3gtY214XCIsXG4gICAgXCJjb2RcIjogXCJhcHBsaWNhdGlvbi92bmQucmltLmNvZFwiLFxuICAgIFwiY29tXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJjb25mXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiY3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtY3Bpb1wiLFxuICAgIFwiY3BwXCI6IFwidGV4dC94LWNcIixcbiAgICBcImNwdFwiOiBcImFwcGxpY2F0aW9uL21hYy1jb21wYWN0cHJvXCIsXG4gICAgXCJjcmRcIjogXCJhcHBsaWNhdGlvbi94LW1zY2FyZGZpbGVcIixcbiAgICBcImNybFwiOiBcImFwcGxpY2F0aW9uL3BraXgtY3JsXCIsXG4gICAgXCJjcnRcIjogXCJhcHBsaWNhdGlvbi94LXg1MDktY2EtY2VydFwiLFxuICAgIFwiY3J4XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJjcnlwdG9ub3RlXCI6IFwiYXBwbGljYXRpb24vdm5kLnJpZy5jcnlwdG9ub3RlXCIsXG4gICAgXCJjc1wiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImNzaFwiOiBcImFwcGxpY2F0aW9uL3gtY3NoXCIsXG4gICAgXCJjc21sXCI6IFwiY2hlbWljYWwveC1jc21sXCIsXG4gICAgXCJjc3BcIjogXCJhcHBsaWNhdGlvbi92bmQuY29tbW9uc3BhY2VcIixcbiAgICBcImNzc1wiOiBcInRleHQvY3NzXCIsXG4gICAgXCJjc3RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjc3ZcIjogXCJ0ZXh0L2NzdlwiLFxuICAgIFwiY3VcIjogXCJhcHBsaWNhdGlvbi9jdS1zZWVtZVwiLFxuICAgIFwiY3VybFwiOiBcInRleHQvdm5kLmN1cmxcIixcbiAgICBcImN3d1wiOiBcImFwcGxpY2F0aW9uL3Bycy5jd3dcIixcbiAgICBcImN4dFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImN4eFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJkYWVcIjogXCJtb2RlbC92bmQuY29sbGFkYSt4bWxcIixcbiAgICBcImRhZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGFmXCIsXG4gICAgXCJkYXJ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRhcnRcIixcbiAgICBcImRhdGFsZXNzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFwiLFxuICAgIFwiZGF2bW91bnRcIjogXCJhcHBsaWNhdGlvbi9kYXZtb3VudCt4bWxcIixcbiAgICBcImRia1wiOiBcImFwcGxpY2F0aW9uL2RvY2Jvb2sreG1sXCIsXG4gICAgXCJkY3JcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJkY3VybFwiOiBcInRleHQvdm5kLmN1cmwuZGN1cmxcIixcbiAgICBcImRkMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vbWEuZGQyK3htbFwiLFxuICAgIFwiZGRkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kZGRcIixcbiAgICBcImRlYlwiOiBcImFwcGxpY2F0aW9uL3gtZGViaWFuLXBhY2thZ2VcIixcbiAgICBcImRlZlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImRlcGxveVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGVyXCI6IFwiYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcIixcbiAgICBcImRmYWNcIjogXCJhcHBsaWNhdGlvbi92bmQuZHJlYW1mYWN0b3J5XCIsXG4gICAgXCJkZ2NcIjogXCJhcHBsaWNhdGlvbi94LWRnYy1jb21wcmVzc2VkXCIsXG4gICAgXCJkaWNcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiZGlyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZGlzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5kaXNcIixcbiAgICBcImRpc3RcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRpc3R6XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkanZcIjogXCJpbWFnZS92bmQuZGp2dVwiLFxuICAgIFwiZGp2dVwiOiBcImltYWdlL3ZuZC5kanZ1XCIsXG4gICAgXCJkbGxcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImRtZ1wiOiBcImFwcGxpY2F0aW9uL3gtYXBwbGUtZGlza2ltYWdlXCIsXG4gICAgXCJkbXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJkbXNcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRuYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kbmFcIixcbiAgICBcImRvY1wiOiBcImFwcGxpY2F0aW9uL21zd29yZFwiLFxuICAgIFwiZG9jbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwiZG9jeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCIsXG4gICAgXCJkb3RcIjogXCJhcHBsaWNhdGlvbi9tc3dvcmRcIixcbiAgICBcImRvdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcImRvdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC50ZW1wbGF0ZVwiLFxuICAgIFwiZHBcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnaS5kcFwiLFxuICAgIFwiZHBnXCI6IFwiYXBwbGljYXRpb24vdm5kLmRwZ3JhcGhcIixcbiAgICBcImRyYVwiOiBcImF1ZGlvL3ZuZC5kcmFcIixcbiAgICBcImRzY1wiOiBcInRleHQvcHJzLmxpbmVzLnRhZ1wiLFxuICAgIFwiZHNzY1wiOiBcImFwcGxpY2F0aW9uL2Rzc2MrZGVyXCIsXG4gICAgXCJkdGJcIjogXCJhcHBsaWNhdGlvbi94LWR0Ym9vayt4bWxcIixcbiAgICBcImR0ZFwiOiBcImFwcGxpY2F0aW9uL3htbC1kdGRcIixcbiAgICBcImR0c1wiOiBcImF1ZGlvL3ZuZC5kdHNcIixcbiAgICBcImR0c2hkXCI6IFwiYXVkaW8vdm5kLmR0cy5oZFwiLFxuICAgIFwiZHVtcFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZHZiXCI6IFwidmlkZW8vdm5kLmR2Yi5maWxlXCIsXG4gICAgXCJkdmlcIjogXCJhcHBsaWNhdGlvbi94LWR2aVwiLFxuICAgIFwiZHdmXCI6IFwibW9kZWwvdm5kLmR3ZlwiLFxuICAgIFwiZHdnXCI6IFwiaW1hZ2Uvdm5kLmR3Z1wiLFxuICAgIFwiZHhmXCI6IFwiaW1hZ2Uvdm5kLmR4ZlwiLFxuICAgIFwiZHhwXCI6IFwiYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLmR4cFwiLFxuICAgIFwiZHhyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZWNlbHA0ODAwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwNDgwMFwiLFxuICAgIFwiZWNlbHA3NDcwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwNzQ3MFwiLFxuICAgIFwiZWNlbHA5NjAwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwOTYwMFwiLFxuICAgIFwiZWNtYVwiOiBcImFwcGxpY2F0aW9uL2VjbWFzY3JpcHRcIixcbiAgICBcImVkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZG1cIixcbiAgICBcImVkeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZHhcIixcbiAgICBcImVmaWZcIjogXCJhcHBsaWNhdGlvbi92bmQucGljc2VsXCIsXG4gICAgXCJlaTZcIjogXCJhcHBsaWNhdGlvbi92bmQucGcub3Nhc2xpXCIsXG4gICAgXCJlbGNcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImVtZlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwiZW1sXCI6IFwibWVzc2FnZS9yZmM4MjJcIixcbiAgICBcImVtbWFcIjogXCJhcHBsaWNhdGlvbi9lbW1hK3htbFwiLFxuICAgIFwiZW16XCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJlb2xcIjogXCJhdWRpby92bmQuZGlnaXRhbC13aW5kc1wiLFxuICAgIFwiZW90XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWZvbnRvYmplY3RcIixcbiAgICBcImVwc1wiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcImVwdWJcIjogXCJhcHBsaWNhdGlvbi9lcHViK3ppcFwiLFxuICAgIFwiZXMzXCI6IFwiYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFwiLFxuICAgIFwiZXNhXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2kuc3Vic3lzdGVtXCIsXG4gICAgXCJlc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uZXNmXCIsXG4gICAgXCJldDNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXN6aWdubzMreG1sXCIsXG4gICAgXCJldHhcIjogXCJ0ZXh0L3gtc2V0ZXh0XCIsXG4gICAgXCJldmFcIjogXCJhcHBsaWNhdGlvbi94LWV2YVwiLFxuICAgIFwiZXZ5XCI6IFwiYXBwbGljYXRpb24veC1lbnZveVwiLFxuICAgIFwiZXhlXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJleGlcIjogXCJhcHBsaWNhdGlvbi9leGlcIixcbiAgICBcImV4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5leHRcIixcbiAgICBcImV6XCI6IFwiYXBwbGljYXRpb24vYW5kcmV3LWluc2V0XCIsXG4gICAgXCJlejJcIjogXCJhcHBsaWNhdGlvbi92bmQuZXpwaXgtYWxidW1cIixcbiAgICBcImV6M1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lenBpeC1wYWNrYWdlXCIsXG4gICAgXCJmXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImY0dlwiOiBcInZpZGVvL3gtZjR2XCIsXG4gICAgXCJmNzdcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZjkwXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImZic1wiOiBcImltYWdlL3ZuZC5mYXN0Ymlkc2hlZXRcIixcbiAgICBcImZjZHRcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZm9ybXNjZW50cmFsLmZjZHRcIixcbiAgICBcImZjc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pc2FjLmZjc1wiLFxuICAgIFwiZmRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkZlwiLFxuICAgIFwiZmVfbGF1bmNoXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlbm92by5mY3NlbGF5b3V0LWxpbmtcIixcbiAgICBcImZnNVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzZ3BcIixcbiAgICBcImZnZFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImZoXCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg0XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg1XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg3XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmhjXCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmlnXCI6IFwiYXBwbGljYXRpb24veC14ZmlnXCIsXG4gICAgXCJmbGFjXCI6IFwiYXVkaW8veC1mbGFjXCIsXG4gICAgXCJmbGlcIjogXCJ2aWRlby94LWZsaVwiLFxuICAgIFwiZmxvXCI6IFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguZmxvXCIsXG4gICAgXCJmbHZcIjogXCJ2aWRlby94LWZsdlwiLFxuICAgIFwiZmx3XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5raXZpb1wiLFxuICAgIFwiZmx4XCI6IFwidGV4dC92bmQuZm1pLmZsZXhzdG9yXCIsXG4gICAgXCJmbHlcIjogXCJ0ZXh0L3ZuZC5mbHlcIixcbiAgICBcImZtXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImZuY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcm9nYW5zLmZuY1wiLFxuICAgIFwiZm9yXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImZweFwiOiBcImltYWdlL3ZuZC5mcHhcIixcbiAgICBcImZyYW1lXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImZzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mc2Mud2VibGF1bmNoXCIsXG4gICAgXCJmc3RcIjogXCJpbWFnZS92bmQuZnN0XCIsXG4gICAgXCJmdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuZmx1eHRpbWUuY2xpcFwiLFxuICAgIFwiZnRpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuc2VyLXdlYi1mdW5kcy10cmFuc2Zlci1pbml0aWF0aW9uXCIsXG4gICAgXCJmdnRcIjogXCJ2aWRlby92bmQuZnZ0XCIsXG4gICAgXCJmeHBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZnhwXCIsXG4gICAgXCJmeHBsXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFwiLFxuICAgIFwiZnpzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1enp5c2hlZXRcIixcbiAgICBcImcyd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9wbGFuXCIsXG4gICAgXCJnM1wiOiBcImltYWdlL2czZmF4XCIsXG4gICAgXCJnM3dcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2Vvc3BhY2VcIixcbiAgICBcImdhY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtYWNjb3VudFwiLFxuICAgIFwiZ2FtXCI6IFwiYXBwbGljYXRpb24veC10YWRzXCIsXG4gICAgXCJnYnJcIjogXCJhcHBsaWNhdGlvbi9ycGtpLWdob3N0YnVzdGVyc1wiLFxuICAgIFwiZ2NhXCI6IFwiYXBwbGljYXRpb24veC1nY2EtY29tcHJlc3NlZFwiLFxuICAgIFwiZ2RsXCI6IFwibW9kZWwvdm5kLmdkbFwiLFxuICAgIFwiZ2VvXCI6IFwiYXBwbGljYXRpb24vdm5kLmR5bmFnZW9cIixcbiAgICBcImdleFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclwiLFxuICAgIFwiZ2diXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLmZpbGVcIixcbiAgICBcImdndFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9nZWJyYS50b29sXCIsXG4gICAgXCJnaGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWhlbHBcIixcbiAgICBcImdpZlwiOiBcImltYWdlL2dpZlwiLFxuICAgIFwiZ2ltXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pZGVudGl0eS1tZXNzYWdlXCIsXG4gICAgXCJnbWxcIjogXCJhcHBsaWNhdGlvbi9nbWwreG1sXCIsXG4gICAgXCJnbXhcIjogXCJhcHBsaWNhdGlvbi92bmQuZ214XCIsXG4gICAgXCJnbnVtZXJpY1wiOiBcImFwcGxpY2F0aW9uL3gtZ251bWVyaWNcIixcbiAgICBcImdwaFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mbG9ncmFwaGl0XCIsXG4gICAgXCJncHhcIjogXCJhcHBsaWNhdGlvbi9ncHgreG1sXCIsXG4gICAgXCJncWZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3JhZmVxXCIsXG4gICAgXCJncXNcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3JhZmVxXCIsXG4gICAgXCJncmFtXCI6IFwiYXBwbGljYXRpb24vc3Jnc1wiLFxuICAgIFwiZ3JhbXBzXCI6IFwiYXBwbGljYXRpb24veC1ncmFtcHMteG1sXCIsXG4gICAgXCJncmVcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbWV0cnktZXhwbG9yZXJcIixcbiAgICBcImdydlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaW5qZWN0b3JcIixcbiAgICBcImdyeG1sXCI6IFwiYXBwbGljYXRpb24vc3Jncyt4bWxcIixcbiAgICBcImdzZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1naG9zdHNjcmlwdFwiLFxuICAgIFwiZ3RhclwiOiBcImFwcGxpY2F0aW9uL3gtZ3RhclwiLFxuICAgIFwiZ3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLW1lc3NhZ2VcIixcbiAgICBcImd0d1wiOiBcIm1vZGVsL3ZuZC5ndHdcIixcbiAgICBcImd2XCI6IFwidGV4dC92bmQuZ3JhcGh2aXpcIixcbiAgICBcImd4ZlwiOiBcImFwcGxpY2F0aW9uL2d4ZlwiLFxuICAgIFwiZ3h0XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb25leHRcIixcbiAgICBcImd6XCI6IFwiYXBwbGljYXRpb24veC1nemlwXCIsXG4gICAgXCJoXCI6IFwidGV4dC94LWNcIixcbiAgICBcImgyNjFcIjogXCJ2aWRlby9oMjYxXCIsXG4gICAgXCJoMjYzXCI6IFwidmlkZW8vaDI2M1wiLFxuICAgIFwiaDI2NFwiOiBcInZpZGVvL2gyNjRcIixcbiAgICBcImhhbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYWwreG1sXCIsXG4gICAgXCJoYmNpXCI6IFwiYXBwbGljYXRpb24vdm5kLmhiY2lcIixcbiAgICBcImhkZlwiOiBcImFwcGxpY2F0aW9uL3gtaGRmXCIsXG4gICAgXCJoaFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJobHBcIjogXCJhcHBsaWNhdGlvbi93aW5obHBcIixcbiAgICBcImhwZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBnbFwiLFxuICAgIFwiaHBpZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocGlkXCIsXG4gICAgXCJocHNcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBzXCIsXG4gICAgXCJocXhcIjogXCJhcHBsaWNhdGlvbi9tYWMtYmluaGV4NDBcIixcbiAgICBcImh0YVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiaHRjXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodGtlXCI6IFwiYXBwbGljYXRpb24vdm5kLmtlbmFtZWFhcHBcIixcbiAgICBcImh0bVwiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHRtbFwiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi1kaWNcIixcbiAgICBcImh2cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtdm9pY2VcIixcbiAgICBcImh2c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtc2NyaXB0XCIsXG4gICAgXCJpMmdcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJnZW9cIixcbiAgICBcImljY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pY2Nwcm9maWxlXCIsXG4gICAgXCJpY2VcIjogXCJ4LWNvbmZlcmVuY2UveC1jb29sdGFsa1wiLFxuICAgIFwiaWNtXCI6IFwiYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcIixcbiAgICBcImljb1wiOiBcImltYWdlL3gtaWNvblwiLFxuICAgIFwiaWNzXCI6IFwidGV4dC9jYWxlbmRhclwiLFxuICAgIFwiaWVmXCI6IFwiaW1hZ2UvaWVmXCIsXG4gICAgXCJpZmJcIjogXCJ0ZXh0L2NhbGVuZGFyXCIsXG4gICAgXCJpZm1cIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuZm9ybWRhdGFcIixcbiAgICBcImlnZXNcIjogXCJtb2RlbC9pZ2VzXCIsXG4gICAgXCJpZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaWdsb2FkZXJcIixcbiAgICBcImlnbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnNvcnMuaWdtXCIsXG4gICAgXCJpZ3NcIjogXCJtb2RlbC9pZ2VzXCIsXG4gICAgXCJpZ3hcIjogXCJhcHBsaWNhdGlvbi92bmQubWljcm9ncmFmeC5pZ3hcIixcbiAgICBcImlpZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5pbnRlcmNoYW5nZVwiLFxuICAgIFwiaW1wXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjY3BhYy5zaW1wbHkuaW1wXCIsXG4gICAgXCJpbXNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtaW1zXCIsXG4gICAgXCJpblwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImluaVwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImlua1wiOiBcImFwcGxpY2F0aW9uL2lua21sK3htbFwiLFxuICAgIFwiaW5rbWxcIjogXCJhcHBsaWNhdGlvbi9pbmttbCt4bWxcIixcbiAgICBcImluc3RhbGxcIjogXCJhcHBsaWNhdGlvbi94LWluc3RhbGwtaW5zdHJ1Y3Rpb25zXCIsXG4gICAgXCJpb3RhXCI6IFwiYXBwbGljYXRpb24vdm5kLmFzdHJhZWEtc29mdHdhcmUuaW90YVwiLFxuICAgIFwiaXBhXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJpcGZpeFwiOiBcImFwcGxpY2F0aW9uL2lwZml4XCIsXG4gICAgXCJpcGtcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQucGFja2FnZVwiLFxuICAgIFwiaXJtXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5yaWdodHMtbWFuYWdlbWVudFwiLFxuICAgIFwiaXJwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlyZXBvc2l0b3J5LnBhY2thZ2UreG1sXCIsXG4gICAgXCJpc29cIjogXCJhcHBsaWNhdGlvbi94LWlzbzk2NjAtaW1hZ2VcIixcbiAgICBcIml0cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtdGVtcGxhdGVcIixcbiAgICBcIml2cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnBcIixcbiAgICBcIml2dVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnVcIixcbiAgICBcImphZFwiOiBcInRleHQvdm5kLnN1bi5qMm1lLmFwcC1kZXNjcmlwdG9yXCIsXG4gICAgXCJqYW1cIjogXCJhcHBsaWNhdGlvbi92bmQuamFtXCIsXG4gICAgXCJqYXJcIjogXCJhcHBsaWNhdGlvbi9qYXZhLWFyY2hpdmVcIixcbiAgICBcImphdmFcIjogXCJ0ZXh0L3gtamF2YS1zb3VyY2VcIixcbiAgICBcImppc3BcIjogXCJhcHBsaWNhdGlvbi92bmQuamlzcFwiLFxuICAgIFwiamx0XCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWpseXRcIixcbiAgICBcImpubHBcIjogXCJhcHBsaWNhdGlvbi94LWphdmEtam5scC1maWxlXCIsXG4gICAgXCJqb2RhXCI6IFwiYXBwbGljYXRpb24vdm5kLmpvb3N0LmpvZGEtYXJjaGl2ZVwiLFxuICAgIFwianBlXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBlZ1wiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZ1wiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZ21cIjogXCJ2aWRlby9qcG1cIixcbiAgICBcImpwZ3ZcIjogXCJ2aWRlby9qcGVnXCIsXG4gICAgXCJqcG1cIjogXCJ2aWRlby9qcG1cIixcbiAgICBcImpzXCI6IFwidGV4dC9qYXZhc2NyaXB0XCIsXG4gICAgXCJqc29uXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIFwianNvbm1sXCI6IFwiYXBwbGljYXRpb24vanNvbm1sK2pzb25cIixcbiAgICBcImthclwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcImthcmJvblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2FyYm9uXCIsXG4gICAgXCJrZm9cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtmb3JtdWxhXCIsXG4gICAgXCJraWFcIjogXCJhcHBsaWNhdGlvbi92bmQua2lkc3BpcmF0aW9uXCIsXG4gICAgXCJrbWxcIjogXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWVhcnRoLmttbCt4bWxcIixcbiAgICBcImttelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua216XCIsXG4gICAgXCJrbmVcIjogXCJhcHBsaWNhdGlvbi92bmQua2luYXJcIixcbiAgICBcImtucFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raW5hclwiLFxuICAgIFwia29uXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rb250b3VyXCIsXG4gICAgXCJrcHJcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcIixcbiAgICBcImtwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3ByZXNlbnRlclwiLFxuICAgIFwia3B4eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcy1rZXlwb2ludFwiLFxuICAgIFwia3NwXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rc3ByZWFkXCIsXG4gICAgXCJrdHJcIjogXCJhcHBsaWNhdGlvbi92bmQua2Fob290elwiLFxuICAgIFwia3R4XCI6IFwiaW1hZ2Uva3R4XCIsXG4gICAgXCJrdHpcIjogXCJhcHBsaWNhdGlvbi92bmQua2Fob290elwiLFxuICAgIFwia3dkXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFwiLFxuICAgIFwia3d0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFwiLFxuICAgIFwibGFzeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmxhcy5sYXMreG1sXCIsXG4gICAgXCJsYXRleFwiOiBcImFwcGxpY2F0aW9uL3gtbGF0ZXhcIixcbiAgICBcImxiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5kZXNrdG9wXCIsXG4gICAgXCJsYmVcIjogXCJhcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZXhjaGFuZ2UreG1sXCIsXG4gICAgXCJsZXNcIjogXCJhcHBsaWNhdGlvbi92bmQuaGhlLmxlc3Nvbi1wbGF5ZXJcIixcbiAgICBcImxoYVwiOiBcImFwcGxpY2F0aW9uL3gtbHpoLWNvbXByZXNzZWRcIixcbiAgICBcImxpbms2NlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yb3V0ZTY2Lmxpbms2Nit4bWxcIixcbiAgICBcImxpc3RcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJsaXN0MzgyMFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJsaXN0YWZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImxua1wiOiBcImFwcGxpY2F0aW9uL3gtbXMtc2hvcnRjdXRcIixcbiAgICBcImxvZ1wiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImxvc3R4bWxcIjogXCJhcHBsaWNhdGlvbi9sb3N0K3htbFwiLFxuICAgIFwibHJmXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJscm1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtbHJtXCIsXG4gICAgXCJsdGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5sdGZcIixcbiAgICBcImx2cFwiOiBcImF1ZGlvL3ZuZC5sdWNlbnQudm9pY2VcIixcbiAgICBcImx3cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy13b3JkcHJvXCIsXG4gICAgXCJselwiOiBcImFwcGxpY2F0aW9uL3gtbHppcFwiLFxuICAgIFwibHpoXCI6IFwiYXBwbGljYXRpb24veC1semgtY29tcHJlc3NlZFwiLFxuICAgIFwibHptYVwiOiBcImFwcGxpY2F0aW9uL3gtbHptYVwiLFxuICAgIFwibHpvXCI6IFwiYXBwbGljYXRpb24veC1sem9wXCIsXG4gICAgXCJtMTNcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtMTRcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtMXZcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtMjFcIjogXCJhcHBsaWNhdGlvbi9tcDIxXCIsXG4gICAgXCJtMmFcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtMnZcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtM2FcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtM3VcIjogXCJhdWRpby94LW1wZWd1cmxcIixcbiAgICBcIm0zdThcIjogXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiLFxuICAgIFwibTRhXCI6IFwiYXVkaW8vbXA0XCIsXG4gICAgXCJtNHVcIjogXCJ2aWRlby92bmQubXBlZ3VybFwiLFxuICAgIFwibTR2XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtYVwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJtYWRzXCI6IFwiYXBwbGljYXRpb24vbWFkcyt4bWxcIixcbiAgICBcIm1hZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lY293aW4uY2hhcnRcIixcbiAgICBcIm1ha2VyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcIm1hblwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1hclwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwibWF0aG1sXCI6IFwiYXBwbGljYXRpb24vbWF0aG1sK3htbFwiLFxuICAgIFwibWJcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibWJrXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tYmtcIixcbiAgICBcIm1ib3hcIjogXCJhcHBsaWNhdGlvbi9tYm94XCIsXG4gICAgXCJtYzFcIjogXCJhcHBsaWNhdGlvbi92bmQubWVkY2FsY2RhdGFcIixcbiAgICBcIm1jZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tY2RcIixcbiAgICBcIm1jdXJsXCI6IFwidGV4dC92bmQuY3VybC5tY3VybFwiLFxuICAgICdtZCc6ICd0ZXh0L3BsYWluJyxcbiAgICBcIm1kYlwiOiBcImFwcGxpY2F0aW9uL3gtbXNhY2Nlc3NcIixcbiAgICBcIm1kaVwiOiBcImltYWdlL3ZuZC5tcy1tb2RpXCIsXG4gICAgXCJtZVwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1lc2hcIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJtZXRhNFwiOiBcImFwcGxpY2F0aW9uL21ldGFsaW5rNCt4bWxcIixcbiAgICBcIm1ldGFsaW5rXCI6IFwiYXBwbGljYXRpb24vbWV0YWxpbmsreG1sXCIsXG4gICAgXCJtZXRzXCI6IFwiYXBwbGljYXRpb24vbWV0cyt4bWxcIixcbiAgICBcIm1mbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZm1wXCIsXG4gICAgXCJtZnRcIjogXCJhcHBsaWNhdGlvbi9ycGtpLW1hbmlmZXN0XCIsXG4gICAgXCJtZ3BcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnZW8ubWFwZ3VpZGUucGFja2FnZVwiLFxuICAgIFwibWd6XCI6IFwiYXBwbGljYXRpb24vdm5kLnByb3RldXMubWFnYXppbmVcIixcbiAgICBcIm1pZFwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcIm1pZGlcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJtaWVcIjogXCJhcHBsaWNhdGlvbi94LW1pZVwiLFxuICAgIFwibWlmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1pZlwiLFxuICAgIFwibWltZVwiOiBcIm1lc3NhZ2UvcmZjODIyXCIsXG4gICAgXCJtajJcIjogXCJ2aWRlby9tajJcIixcbiAgICBcIm1qcDJcIjogXCJ2aWRlby9tajJcIixcbiAgICBcIm1rM2RcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJta2FcIjogXCJhdWRpby94LW1hdHJvc2thXCIsXG4gICAgXCJta3NcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJta3ZcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJtbHBcIjogXCJhcHBsaWNhdGlvbi92bmQuZG9sYnkubWxwXCIsXG4gICAgXCJtbWRcIjogXCJhcHBsaWNhdGlvbi92bmQuY2hpcG51dHMua2FyYW9rZS1tbWRcIixcbiAgICBcIm1tZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zbWFmXCIsXG4gICAgXCJtbXJcIjogXCJpbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1tbXJcIixcbiAgICBcIm1uZ1wiOiBcInZpZGVvL3gtbW5nXCIsXG4gICAgXCJtbnlcIjogXCJhcHBsaWNhdGlvbi94LW1zbW9uZXlcIixcbiAgICBcIm1vYmlcIjogXCJhcHBsaWNhdGlvbi94LW1vYmlwb2NrZXQtZWJvb2tcIixcbiAgICBcIm1vZHNcIjogXCJhcHBsaWNhdGlvbi9tb2RzK3htbFwiLFxuICAgIFwibW92XCI6IFwidmlkZW8vcXVpY2t0aW1lXCIsXG4gICAgXCJtb3ZpZVwiOiBcInZpZGVvL3gtc2dpLW1vdmllXCIsXG4gICAgXCJtcDJcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcDIxXCI6IFwiYXBwbGljYXRpb24vbXAyMVwiLFxuICAgIFwibXAyYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wM1wiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm9wdXNcIjogXCJhdWRpby9vcHVzXCIsXG4gICAgXCJtcDRcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wNGFcIjogXCJhdWRpby9tcDRcIixcbiAgICBcIm1wNHNcIjogXCJhcHBsaWNhdGlvbi9tcDRcIixcbiAgICBcIm1wNHZcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uY2VydGlmaWNhdGVcIixcbiAgICBcIm1wZVwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZWdcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGdcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGc0XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcGdhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXBrZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5pbnN0YWxsZXIreG1sXCIsXG4gICAgXCJtcG1cIjogXCJhcHBsaWNhdGlvbi92bmQuYmx1ZWljZS5tdWx0aXBhc3NcIixcbiAgICBcIm1wblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uYXBwbGljYXRpb25cIixcbiAgICBcIm1wcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XCIsXG4gICAgXCJtcHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcHJvamVjdFwiLFxuICAgIFwibXB5XCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5taW5pcGF5XCIsXG4gICAgXCJtcXlcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1xeVwiLFxuICAgIFwibXJjXCI6IFwiYXBwbGljYXRpb24vbWFyY1wiLFxuICAgIFwibXJjeFwiOiBcImFwcGxpY2F0aW9uL21hcmN4bWwreG1sXCIsXG4gICAgXCJtc1wiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1zY21sXCI6IFwiYXBwbGljYXRpb24vbWVkaWFzZXJ2ZXJjb250cm9sK3htbFwiLFxuICAgIFwibXNlZWRcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5tc2VlZFwiLFxuICAgIFwibXNlcVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tc2VxXCIsXG4gICAgXCJtc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24ubXNmXCIsXG4gICAgXCJtc2hcIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJtc2lcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcIm1zbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXNsXCIsXG4gICAgXCJtc3R5XCI6IFwiYXBwbGljYXRpb24vdm5kLm11dmVlLnN0eWxlXCIsXG4gICAgLy9cIm10c1wiOiBcIm1vZGVsL3ZuZC5tdHNcIixcbiAgICBcIm10c1wiOiBcInZpZGVvL210c1wiLFxuICAgIFwibXVzXCI6IFwiYXBwbGljYXRpb24vdm5kLm11c2ljaWFuXCIsXG4gICAgXCJtdXNpY3htbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWNvcmRhcmUubXVzaWN4bWwreG1sXCIsXG4gICAgXCJtdmJcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtd2ZcIjogXCJhcHBsaWNhdGlvbi92bmQubWZlclwiLFxuICAgIFwibXhmXCI6IFwiYXBwbGljYXRpb24vbXhmXCIsXG4gICAgXCJteGxcIjogXCJhcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sXCIsXG4gICAgXCJteG1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJteHNcIjogXCJhcHBsaWNhdGlvbi92bmQudHJpc2NhcGUubXhzXCIsXG4gICAgXCJteHVcIjogXCJ2aWRlby92bmQubXBlZ3VybFwiLFxuICAgIFwibi1nYWdlXCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcIm4zXCI6IFwidGV4dC9uM1wiLFxuICAgIFwibmJcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibmJwXCI6IFwiYXBwbGljYXRpb24vdm5kLndvbGZyYW0ucGxheWVyXCIsXG4gICAgXCJuY1wiOiBcImFwcGxpY2F0aW9uL3gtbmV0Y2RmXCIsXG4gICAgXCJuY3hcIjogXCJhcHBsaWNhdGlvbi94LWR0Ym5jeCt4bWxcIixcbiAgICBcIm5mb1wiOiBcInRleHQveC1uZm9cIixcbiAgICBcIm5nZGF0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5kYXRhXCIsXG4gICAgXCJuaXRmXCI6IFwiYXBwbGljYXRpb24vdm5kLm5pdGZcIixcbiAgICBcIm5sdVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uZXVyb2xhbmd1YWdlLm5sdVwiLFxuICAgIFwibm1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmVubGl2ZW5cIixcbiAgICBcIm5uZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1kaXJlY3RvcnlcIixcbiAgICBcIm5uc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1zZWFsZXJcIixcbiAgICBcIm5ud1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC13ZWJcIixcbiAgICBcIm5weFwiOiBcImltYWdlL3ZuZC5uZXQtZnB4XCIsXG4gICAgXCJuc2NcIjogXCJhcHBsaWNhdGlvbi94LWNvbmZlcmVuY2VcIixcbiAgICBcIm5zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1ub3Rlc1wiLFxuICAgIFwibnRmXCI6IFwiYXBwbGljYXRpb24vdm5kLm5pdGZcIixcbiAgICBcIm56YlwiOiBcImFwcGxpY2F0aW9uL3gtbnpiXCIsXG4gICAgXCJvYTJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5czJcIixcbiAgICBcIm9hM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzM1wiLFxuICAgIFwib2FzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNcIixcbiAgICBcIm9iZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNiaW5kZXJcIixcbiAgICBcIm9ialwiOiBcImFwcGxpY2F0aW9uL3gtdGdpZlwiLFxuICAgIFwib2RhXCI6IFwiYXBwbGljYXRpb24vb2RhXCIsXG4gICAgXCJvZGJcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmRhdGFiYXNlXCIsXG4gICAgXCJvZGNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0XCIsXG4gICAgXCJvZGZcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGFcIixcbiAgICBcIm9kZnRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGEtdGVtcGxhdGVcIixcbiAgICBcIm9kZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3NcIixcbiAgICBcIm9kaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2VcIixcbiAgICBcIm9kbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC1tYXN0ZXJcIixcbiAgICBcIm9kcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uXCIsXG4gICAgXCJvZHNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0XCIsXG4gICAgXCJvZHRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHRcIixcbiAgICBcIm9nYVwiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwib2dnXCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJvZ3ZcIjogXCJ2aWRlby9vZ2dcIixcbiAgICBcIm9neFwiOiBcImFwcGxpY2F0aW9uL29nZ1wiLFxuICAgIFwib21kb2NcIjogXCJhcHBsaWNhdGlvbi9vbWRvYyt4bWxcIixcbiAgICBcIm9uZXBrZ1wiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRtcFwiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRvY1wiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRvYzJcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvcGZcIjogXCJhcHBsaWNhdGlvbi9vZWJwcy1wYWNrYWdlK3htbFwiLFxuICAgIFwib3BtbFwiOiBcInRleHQveC1vcG1sXCIsXG4gICAgXCJvcHJjXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcIm9yZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1vcmdhbml6ZXJcIixcbiAgICBcIm9zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0XCIsXG4gICAgXCJvc2ZwdmdcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLm9wZW5zY29yZWZvcm1hdC5vc2ZwdmcreG1sXCIsXG4gICAgXCJvdGNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0LXRlbXBsYXRlXCIsXG4gICAgXCJvdGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtb3RmXCIsXG4gICAgXCJvdGdcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzLXRlbXBsYXRlXCIsXG4gICAgXCJvdGhcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtd2ViXCIsXG4gICAgXCJvdGlcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlLXRlbXBsYXRlXCIsXG4gICAgXCJvdHBcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbi10ZW1wbGF0ZVwiLFxuICAgIFwib3RzXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldC10ZW1wbGF0ZVwiLFxuICAgIFwib3R0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXRlbXBsYXRlXCIsXG4gICAgXCJveHBzXCI6IFwiYXBwbGljYXRpb24vb3hwc1wiLFxuICAgIFwib3h0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW5vZmZpY2VvcmcuZXh0ZW5zaW9uXCIsXG4gICAgXCJwXCI6IFwidGV4dC94LXBhc2NhbFwiLFxuICAgIFwicDEwXCI6IFwiYXBwbGljYXRpb24vcGtjczEwXCIsXG4gICAgXCJwMTJcIjogXCJhcHBsaWNhdGlvbi94LXBrY3MxMlwiLFxuICAgIFwicDdiXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcIixcbiAgICBcInA3Y1wiOiBcImFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcIixcbiAgICBcInA3bVwiOiBcImFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcIixcbiAgICBcInA3clwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydHJlcXJlc3BcIixcbiAgICBcInA3c1wiOiBcImFwcGxpY2F0aW9uL3BrY3M3LXNpZ25hdHVyZVwiLFxuICAgIFwicDhcIjogXCJhcHBsaWNhdGlvbi9wa2NzOFwiLFxuICAgIFwicGFzXCI6IFwidGV4dC94LXBhc2NhbFwiLFxuICAgIFwicGF3XCI6IFwiYXBwbGljYXRpb24vdm5kLnBhd2FhZmlsZVwiLFxuICAgIFwicGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLnBvd2VyYnVpbGRlcjZcIixcbiAgICBcInBibVwiOiBcImltYWdlL3gtcG9ydGFibGUtYml0bWFwXCIsXG4gICAgXCJwY2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwicGNmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXBjZlwiLFxuICAgIFwicGNsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLXBjbFwiLFxuICAgIFwicGNseGxcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtcGNseGxcIixcbiAgICBcInBjdFwiOiBcImltYWdlL3gtcGljdFwiLFxuICAgIFwicGN1cmxcIjogXCJhcHBsaWNhdGlvbi92bmQuY3VybC5wY3VybFwiLFxuICAgIFwicGN4XCI6IFwiaW1hZ2UveC1wY3hcIixcbiAgICBcInBkYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJwZGZcIjogXCJhcHBsaWNhdGlvbi9wZGZcIixcbiAgICBcInBmYVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZiXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZm1cIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmclwiOiBcImFwcGxpY2F0aW9uL2ZvbnQtdGRwZnJcIixcbiAgICBcInBmeFwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczEyXCIsXG4gICAgXCJwZ21cIjogXCJpbWFnZS94LXBvcnRhYmxlLWdyYXltYXBcIixcbiAgICBcInBnblwiOiBcImFwcGxpY2F0aW9uL3gtY2hlc3MtcGduXCIsXG4gICAgXCJwZ3BcIjogXCJhcHBsaWNhdGlvbi9wZ3AtZW5jcnlwdGVkXCIsXG4gICAgXCJwaGFyXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJwaHBcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJwaHBzXCI6IFwiYXBwbGljYXRpb24veC1odHRwZC1waHBzXCIsXG4gICAgXCJwaWNcIjogXCJpbWFnZS94LXBpY3RcIixcbiAgICBcInBrZ1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwicGtpXCI6IFwiYXBwbGljYXRpb24vcGtpeGNtcFwiLFxuICAgIFwicGtpcGF0aFwiOiBcImFwcGxpY2F0aW9uL3BraXgtcGtpcGF0aFwiLFxuICAgIFwicGxiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LWxhcmdlXCIsXG4gICAgXCJwbGNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnBsY1wiLFxuICAgIFwicGxmXCI6IFwiYXBwbGljYXRpb24vdm5kLnBvY2tldGxlYXJuXCIsXG4gICAgXCJwbGlzdFwiOiBcImFwcGxpY2F0aW9uL3gtcGxpc3RcIixcbiAgICBcInBsc1wiOiBcImFwcGxpY2F0aW9uL3Bscyt4bWxcIixcbiAgICBcInBtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdGMtcG9zbWxcIixcbiAgICBcInBuZ1wiOiBcImltYWdlL3BuZ1wiLFxuICAgIFwicG5tXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1hbnltYXBcIixcbiAgICBcInBvcnRwa2dcIjogXCJhcHBsaWNhdGlvbi92bmQubWFjcG9ydHMucG9ydHBrZ1wiLFxuICAgIFwicG90XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBvdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBvdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwudGVtcGxhdGVcIixcbiAgICBcInBwYW1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXBzLXBwZFwiLFxuICAgIFwicHBtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1waXhtYXBcIixcbiAgICBcInBwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwcHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGVzaG93Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHBzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZXNob3dcIixcbiAgICBcInBwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwcHRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQucHJlc2VudGF0aW9uLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHB0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIixcbiAgICBcInBxYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJwcmNcIjogXCJhcHBsaWNhdGlvbi94LW1vYmlwb2NrZXQtZWJvb2tcIixcbiAgICBcInByZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1mcmVlbGFuY2VcIixcbiAgICBcInByZlwiOiBcImFwcGxpY2F0aW9uL3BpY3MtcnVsZXNcIixcbiAgICBcInBzXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwicHNiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LXNtYWxsXCIsXG4gICAgXCJwc2RcIjogXCJpbWFnZS92bmQuYWRvYmUucGhvdG9zaG9wXCIsXG4gICAgXCJwc2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtbGludXgtcHNmXCIsXG4gICAgXCJwc2tjeG1sXCI6IFwiYXBwbGljYXRpb24vcHNrYyt4bWxcIixcbiAgICBcInB0aWRcIjogXCJhcHBsaWNhdGlvbi92bmQucHZpLnB0aWQxXCIsXG4gICAgXCJwdWJcIjogXCJhcHBsaWNhdGlvbi94LW1zcHVibGlzaGVyXCIsXG4gICAgXCJwdmJcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctdmFyXCIsXG4gICAgXCJwd25cIjogXCJhcHBsaWNhdGlvbi92bmQuM20ucG9zdC1pdC1ub3Rlc1wiLFxuICAgIFwicHlhXCI6IFwiYXVkaW8vdm5kLm1zLXBsYXlyZWFkeS5tZWRpYS5weWFcIixcbiAgICBcInB5dlwiOiBcInZpZGVvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHl2XCIsXG4gICAgXCJxYW1cIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24ucXVpY2thbmltZVwiLFxuICAgIFwicWJvXCI6IFwiYXBwbGljYXRpb24vdm5kLmludHUucWJvXCIsXG4gICAgXCJxZnhcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50dS5xZnhcIixcbiAgICBcInFwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wdWJsaXNoYXJlLWRlbHRhLXRyZWVcIixcbiAgICBcInF0XCI6IFwidmlkZW8vcXVpY2t0aW1lXCIsXG4gICAgXCJxd2RcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF3dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhiXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGRcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXh0XCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJyYVwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvXCIsXG4gICAgXCJyYW1cIjogXCJhdWRpby94LXBuLXJlYWxhdWRpb1wiLFxuICAgIFwicmFyXCI6IFwiYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZFwiLFxuICAgIFwicmFzXCI6IFwiaW1hZ2UveC1jbXUtcmFzdGVyXCIsXG4gICAgXCJyYlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInJjcHJvZmlsZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcHVucGx1Z2dlZC5yY3Byb2ZpbGVcIixcbiAgICBcInJkZlwiOiBcImFwcGxpY2F0aW9uL3JkZit4bWxcIixcbiAgICBcInJkelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kYXRhLXZpc2lvbi5yZHpcIixcbiAgICBcInJlcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5idXNpbmVzc29iamVjdHNcIixcbiAgICBcInJlc1wiOiBcImFwcGxpY2F0aW9uL3gtZHRicmVzb3VyY2UreG1sXCIsXG4gICAgXCJyZXN4XCI6IFwidGV4dC94bWxcIixcbiAgICBcInJnYlwiOiBcImltYWdlL3gtcmdiXCIsXG4gICAgXCJyaWZcIjogXCJhcHBsaWNhdGlvbi9yZWdpbmZvK3htbFwiLFxuICAgIFwicmlwXCI6IFwiYXVkaW8vdm5kLnJpcFwiLFxuICAgIFwicmlzXCI6IFwiYXBwbGljYXRpb24veC1yZXNlYXJjaC1pbmZvLXN5c3RlbXNcIixcbiAgICBcInJsXCI6IFwiYXBwbGljYXRpb24vcmVzb3VyY2UtbGlzdHMreG1sXCIsXG4gICAgXCJybGNcIjogXCJpbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1ybGNcIixcbiAgICBcInJsZFwiOiBcImFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzLWRpZmYreG1sXCIsXG4gICAgXCJybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWFcIixcbiAgICBcInJtaVwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcInJtcFwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvLXBsdWdpblwiLFxuICAgIFwicm1zXCI6IFwiYXBwbGljYXRpb24vdm5kLmpjcC5qYXZhbWUubWlkbGV0LXJtc1wiLFxuICAgIFwicm12YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWEtdmJyXCIsXG4gICAgXCJybmNcIjogXCJhcHBsaWNhdGlvbi9yZWxheC1uZy1jb21wYWN0LXN5bnRheFwiLFxuICAgIFwicm9hXCI6IFwiYXBwbGljYXRpb24vcnBraS1yb2FcIixcbiAgICBcInJvZmZcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJycDlcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvYW50by5ycDlcIixcbiAgICBcInJwbVwiOiBcImFwcGxpY2F0aW9uL3gtcnBtXCIsXG4gICAgXCJycHNzXCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldHNcIixcbiAgICBcInJwc3RcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEucmFkaW8tcHJlc2V0XCIsXG4gICAgXCJycVwiOiBcImFwcGxpY2F0aW9uL3NwYXJxbC1xdWVyeVwiLFxuICAgIFwicnNcIjogXCJhcHBsaWNhdGlvbi9ybHMtc2VydmljZXMreG1sXCIsXG4gICAgXCJyc2RcIjogXCJhcHBsaWNhdGlvbi9yc2QreG1sXCIsXG4gICAgXCJyc3NcIjogXCJhcHBsaWNhdGlvbi9yc3MreG1sXCIsXG4gICAgXCJydGZcIjogXCJhcHBsaWNhdGlvbi9ydGZcIixcbiAgICBcInJ0eFwiOiBcInRleHQvcmljaHRleHRcIixcbiAgICBcInNcIjogXCJ0ZXh0L3gtYXNtXCIsXG4gICAgXCJzM21cIjogXCJhdWRpby9zM21cIixcbiAgICBcInM3elwiOiBcImFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFwiLFxuICAgIFwic2FmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5zbWFmLWF1ZGlvXCIsXG4gICAgXCJzYWZhcmlleHR6XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJzYXNzXCI6IFwidGV4dC94LXNhc3NcIixcbiAgICBcInNibWxcIjogXCJhcHBsaWNhdGlvbi9zYm1sK3htbFwiLFxuICAgIFwic2NcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLnNlY3VyZS1jb250YWluZXJcIixcbiAgICBcInNjZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNzY2hlZHVsZVwiLFxuICAgIFwic2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLXNjcmVlbmNhbVwiLFxuICAgIFwic2NxXCI6IFwiYXBwbGljYXRpb24vc2N2cC1jdi1yZXF1ZXN0XCIsXG4gICAgXCJzY3NcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLWN2LXJlc3BvbnNlXCIsXG4gICAgXCJzY3NzXCI6IFwidGV4dC94LXNjc3NcIixcbiAgICBcInNjdXJsXCI6IFwidGV4dC92bmQuY3VybC5zY3VybFwiLFxuICAgIFwic2RhXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5kcmF3XCIsXG4gICAgXCJzZGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmNhbGNcIixcbiAgICBcInNkZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uaW1wcmVzc1wiLFxuICAgIFwic2RrZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zb2xlbnQuc2RrbSt4bWxcIixcbiAgICBcInNka21cIjogXCJhcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXCIsXG4gICAgXCJzZHBcIjogXCJhcHBsaWNhdGlvbi9zZHBcIixcbiAgICBcInNkd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyXCIsXG4gICAgXCJzZWVcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VlbWFpbFwiLFxuICAgIFwic2VlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLnNlZWRcIixcbiAgICBcInNlbWFcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtYVwiLFxuICAgIFwic2VtZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1kXCIsXG4gICAgXCJzZW1mXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWZcIixcbiAgICBcInNlclwiOiBcImFwcGxpY2F0aW9uL2phdmEtc2VyaWFsaXplZC1vYmplY3RcIixcbiAgICBcInNldHBheVwiOiBcImFwcGxpY2F0aW9uL3NldC1wYXltZW50LWluaXRpYXRpb25cIixcbiAgICBcInNldHJlZ1wiOiBcImFwcGxpY2F0aW9uL3NldC1yZWdpc3RyYXRpb24taW5pdGlhdGlvblwiLFxuICAgIFwic2ZkLWhkc3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLmh5ZHJvc3RhdGl4LnNvZi1kYXRhXCIsXG4gICAgXCJzZnNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3BvdGZpcmUuc2ZzXCIsXG4gICAgXCJzZnZcIjogXCJ0ZXh0L3gtc2Z2XCIsXG4gICAgXCJzZ2lcIjogXCJpbWFnZS9zZ2lcIixcbiAgICBcInNnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyLWdsb2JhbFwiLFxuICAgIFwic2dtXCI6IFwidGV4dC9zZ21sXCIsXG4gICAgXCJzZ21sXCI6IFwidGV4dC9zZ21sXCIsXG4gICAgXCJzaFwiOiBcImFwcGxpY2F0aW9uL3gtc2hcIixcbiAgICBcInNoYXJcIjogXCJhcHBsaWNhdGlvbi94LXNoYXJcIixcbiAgICBcInNoZlwiOiBcImFwcGxpY2F0aW9uL3NoZit4bWxcIixcbiAgICBcInNpZFwiOiBcImltYWdlL3gtbXJzaWQtaW1hZ2VcIixcbiAgICBcInNpZ1wiOiBcImFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcIixcbiAgICBcInNpbFwiOiBcImF1ZGlvL3NpbGtcIixcbiAgICBcInNpbG9cIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJzaXNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJzaXN4XCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwic2l0XCI6IFwiYXBwbGljYXRpb24veC1zdHVmZml0XCIsXG4gICAgXCJzaXR4XCI6IFwiYXBwbGljYXRpb24veC1zdHVmZml0eFwiLFxuICAgIFwic2tkXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza3BcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2t0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNsZG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5zbGlkZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInNsZHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVcIixcbiAgICBcInNsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5zYWx0XCIsXG4gICAgXCJzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEuc3RlcGNoYXJ0XCIsXG4gICAgXCJzbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLm1hdGhcIixcbiAgICBcInNtaVwiOiBcImFwcGxpY2F0aW9uL3NtaWwreG1sXCIsXG4gICAgXCJzbWlsXCI6IFwiYXBwbGljYXRpb24vc21pbCt4bWxcIixcbiAgICBcInNtdlwiOiBcInZpZGVvL3gtc212XCIsXG4gICAgXCJzbXppcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEucGFja2FnZVwiLFxuICAgIFwic25kXCI6IFwiYXVkaW8vYmFzaWNcIixcbiAgICBcInNuZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1zbmZcIixcbiAgICBcInNvXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJzcGNcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRpZmljYXRlc1wiLFxuICAgIFwic3BmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5zbWFmLXBocmFzZVwiLFxuICAgIFwic3BsXCI6IFwiYXBwbGljYXRpb24veC1mdXR1cmVzcGxhc2hcIixcbiAgICBcInNwb3RcIjogXCJ0ZXh0L3ZuZC5pbjNkLnNwb3RcIixcbiAgICBcInNwcFwiOiBcImFwcGxpY2F0aW9uL3NjdnAtdnAtcmVzcG9uc2VcIixcbiAgICBcInNwcVwiOiBcImFwcGxpY2F0aW9uL3NjdnAtdnAtcmVxdWVzdFwiLFxuICAgIFwic3B4XCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJzcWxcIjogXCJhcHBsaWNhdGlvbi94LXNxbFwiLFxuICAgIFwic3JjXCI6IFwiYXBwbGljYXRpb24veC13YWlzLXNvdXJjZVwiLFxuICAgIFwic3J0XCI6IFwiYXBwbGljYXRpb24veC1zdWJyaXBcIixcbiAgICBcInNydVwiOiBcImFwcGxpY2F0aW9uL3NydSt4bWxcIixcbiAgICBcInNyeFwiOiBcImFwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK3htbFwiLFxuICAgIFwic3NkbFwiOiBcImFwcGxpY2F0aW9uL3NzZGwreG1sXCIsXG4gICAgXCJzc2VcIjogXCJhcHBsaWNhdGlvbi92bmQua29kYWstZGVzY3JpcHRvclwiLFxuICAgIFwic3NmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnNzZlwiLFxuICAgIFwic3NtbFwiOiBcImFwcGxpY2F0aW9uL3NzbWwreG1sXCIsXG4gICAgXCJzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zYWlsaW5ndHJhY2tlci50cmFja1wiLFxuICAgIFwic3RjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsYy50ZW1wbGF0ZVwiLFxuICAgIFwic3RkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuZHJhdy50ZW1wbGF0ZVwiLFxuICAgIFwic3RmXCI6IFwiYXBwbGljYXRpb24vdm5kLnd0LnN0ZlwiLFxuICAgIFwic3RpXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzcy50ZW1wbGF0ZVwiLFxuICAgIFwic3RrXCI6IFwiYXBwbGljYXRpb24vaHlwZXJzdHVkaW9cIixcbiAgICBcInN0bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc3RsXCIsXG4gICAgXCJzdHJcIjogXCJhcHBsaWNhdGlvbi92bmQucGcuZm9ybWF0XCIsXG4gICAgXCJzdHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXIudGVtcGxhdGVcIixcbiAgICBcInN0eWxcIjogXCJ0ZXh0L3gtc3R5bFwiLFxuICAgIFwic3ViXCI6IFwiaW1hZ2Uvdm5kLmR2Yi5zdWJ0aXRsZVwiLFxuICAgIFwic3VzXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1cy1jYWxlbmRhclwiLFxuICAgIFwic3VzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcIixcbiAgICBcInN2NGNwaW9cIjogXCJhcHBsaWNhdGlvbi94LXN2NGNwaW9cIixcbiAgICBcInN2NGNyY1wiOiBcImFwcGxpY2F0aW9uL3gtc3Y0Y3JjXCIsXG4gICAgXCJzdmNcIjogXCJhcHBsaWNhdGlvbi92bmQuZHZiLnNlcnZpY2VcIixcbiAgICBcInN2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdmRcIixcbiAgICBcInN2Z1wiOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICBcInN2Z3pcIjogXCJpbWFnZS9zdmcreG1sXCIsXG4gICAgXCJzd2FcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJzd2ZcIjogXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiLFxuICAgIFwic3dpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFyaXN0YW5ldHdvcmtzLnN3aVwiLFxuICAgIFwic3hjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsY1wiLFxuICAgIFwic3hkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuZHJhd1wiLFxuICAgIFwic3hnXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLmdsb2JhbFwiLFxuICAgIFwic3hpXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzc1wiLFxuICAgIFwic3htXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwubWF0aFwiLFxuICAgIFwic3h3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyXCIsXG4gICAgXCJ0XCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwidDNcIjogXCJhcHBsaWNhdGlvbi94LXQzdm0taW1hZ2VcIixcbiAgICBcInRhZ2xldFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5teW5mY1wiLFxuICAgIFwidGFvXCI6IFwiYXBwbGljYXRpb24vdm5kLnRhby5pbnRlbnQtbW9kdWxlLWFyY2hpdmVcIixcbiAgICBcInRhclwiOiBcImFwcGxpY2F0aW9uL3gtdGFyXCIsXG4gICAgXCJ0Y2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAyLnRjYXBcIixcbiAgICBcInRjbFwiOiBcImFwcGxpY2F0aW9uL3gtdGNsXCIsXG4gICAgXCJ0ZWFjaGVyXCI6IFwiYXBwbGljYXRpb24vdm5kLnNtYXJ0LnRlYWNoZXJcIixcbiAgICBcInRlaVwiOiBcImFwcGxpY2F0aW9uL3RlaSt4bWxcIixcbiAgICBcInRlaWNvcnB1c1wiOiBcImFwcGxpY2F0aW9uL3RlaSt4bWxcIixcbiAgICBcInRleFwiOiBcImFwcGxpY2F0aW9uL3gtdGV4XCIsXG4gICAgXCJ0ZXhpXCI6IFwiYXBwbGljYXRpb24veC10ZXhpbmZvXCIsXG4gICAgXCJ0ZXhpbmZvXCI6IFwiYXBwbGljYXRpb24veC10ZXhpbmZvXCIsXG4gICAgXCJ0ZXh0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwidGZpXCI6IFwiYXBwbGljYXRpb24vdGhyYXVkK3htbFwiLFxuICAgIFwidGZtXCI6IFwiYXBwbGljYXRpb24veC10ZXgtdGZtXCIsXG4gICAgXCJ0Z2FcIjogXCJpbWFnZS94LXRnYVwiLFxuICAgIFwidGd6XCI6IFwiYXBwbGljYXRpb24veC1nemlwXCIsXG4gICAgXCJ0aG14XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLW9mZmljZXRoZW1lXCIsXG4gICAgXCJ0aWZcIjogXCJpbWFnZS90aWZmXCIsXG4gICAgXCJ0aWZmXCI6IFwiaW1hZ2UvdGlmZlwiLFxuICAgIFwidG1vXCI6IFwiYXBwbGljYXRpb24vdm5kLnRtb2JpbGUtbGl2ZXR2XCIsXG4gICAgXCJ0b3JyZW50XCI6IFwiYXBwbGljYXRpb24veC1iaXR0b3JyZW50XCIsXG4gICAgXCJ0cGxcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtdGVtcGxhdGVcIixcbiAgICBcInRwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50cmlkLnRwdFwiLFxuICAgIFwidHJcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJ0cmFcIjogXCJhcHBsaWNhdGlvbi92bmQudHJ1ZWFwcFwiLFxuICAgIFwidHJtXCI6IFwiYXBwbGljYXRpb24veC1tc3Rlcm1pbmFsXCIsXG4gICAgXCJ0c2RcIjogXCJhcHBsaWNhdGlvbi90aW1lc3RhbXBlZC1kYXRhXCIsXG4gICAgXCJ0c3ZcIjogXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsXG4gICAgXCJ0dGNcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHRmXCIsXG4gICAgXCJ0dGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHRmXCIsXG4gICAgXCJ0dGxcIjogXCJ0ZXh0L3R1cnRsZVwiLFxuICAgIFwidHdkXCI6IFwiYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclwiLFxuICAgIFwidHdkc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaW10ZWNoLW1pbmRtYXBwZXJcIixcbiAgICBcInR4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW5vbWF0aXgudHV4ZWRvXCIsXG4gICAgXCJ0eGZcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnR4ZlwiLFxuICAgIFwidHh0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwidTMyXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwidWRlYlwiOiBcImFwcGxpY2F0aW9uL3gtZGViaWFuLXBhY2thZ2VcIixcbiAgICBcInVmZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51ZmRsXCIsXG4gICAgXCJ1ZmRsXCI6IFwiYXBwbGljYXRpb24vdm5kLnVmZGxcIixcbiAgICBcInVseFwiOiBcImFwcGxpY2F0aW9uL3gtZ2x1bHhcIixcbiAgICBcInVtalwiOiBcImFwcGxpY2F0aW9uL3ZuZC51bWFqaW5cIixcbiAgICBcInVuaXR5d2ViXCI6IFwiYXBwbGljYXRpb24vdm5kLnVuaXR5XCIsXG4gICAgXCJ1b21sXCI6IFwiYXBwbGljYXRpb24vdm5kLnVvbWwreG1sXCIsXG4gICAgXCJ1cmlcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1cmlzXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXJsc1wiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVzdGFyXCI6IFwiYXBwbGljYXRpb24veC11c3RhclwiLFxuICAgIFwidXR6XCI6IFwiYXBwbGljYXRpb24vdm5kLnVpcS50aGVtZVwiLFxuICAgIFwidXVcIjogXCJ0ZXh0L3gtdXVlbmNvZGVcIixcbiAgICBcInV2YVwiOiBcImF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXCIsXG4gICAgXCJ1dmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dmZcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dmdcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dmhcIjogXCJ2aWRlby92bmQuZGVjZS5oZFwiLFxuICAgIFwidXZpXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZtXCI6IFwidmlkZW8vdm5kLmRlY2UubW9iaWxlXCIsXG4gICAgXCJ1dnBcIjogXCJ2aWRlby92bmQuZGVjZS5wZFwiLFxuICAgIFwidXZzXCI6IFwidmlkZW8vdm5kLmRlY2Uuc2RcIixcbiAgICBcInV2dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnR0bWwreG1sXCIsXG4gICAgXCJ1dnVcIjogXCJ2aWRlby92bmQudXZ2dS5tcDRcIixcbiAgICBcInV2dlwiOiBcInZpZGVvL3ZuZC5kZWNlLnZpZGVvXCIsXG4gICAgXCJ1dnZhXCI6IFwiYXVkaW8vdm5kLmRlY2UuYXVkaW9cIixcbiAgICBcInV2dmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dnZmXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZ2Z1wiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2dmhcIjogXCJ2aWRlby92bmQuZGVjZS5oZFwiLFxuICAgIFwidXZ2aVwiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2dm1cIjogXCJ2aWRlby92bmQuZGVjZS5tb2JpbGVcIixcbiAgICBcInV2dnBcIjogXCJ2aWRlby92bmQuZGVjZS5wZFwiLFxuICAgIFwidXZ2c1wiOiBcInZpZGVvL3ZuZC5kZWNlLnNkXCIsXG4gICAgXCJ1dnZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcIixcbiAgICBcInV2dnVcIjogXCJ2aWRlby92bmQudXZ2dS5tcDRcIixcbiAgICBcInV2dnZcIjogXCJ2aWRlby92bmQuZGVjZS52aWRlb1wiLFxuICAgIFwidXZ2eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXCIsXG4gICAgXCJ1dnZ6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuemlwXCIsXG4gICAgXCJ1dnhcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS51bnNwZWNpZmllZFwiLFxuICAgIFwidXZ6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuemlwXCIsXG4gICAgXCJ2Y2FyZFwiOiBcInRleHQvdmNhcmRcIixcbiAgICBcInZjZFwiOiBcImFwcGxpY2F0aW9uL3gtY2RsaW5rXCIsXG4gICAgXCJ2Y2ZcIjogXCJ0ZXh0L3gtdmNhcmRcIixcbiAgICBcInZjZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdmNhcmRcIixcbiAgICBcInZjc1wiOiBcInRleHQveC12Y2FsZW5kYXJcIixcbiAgICBcInZjeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52Y3hcIixcbiAgICBcInZpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb25hcnlcIixcbiAgICBcInZpdlwiOiBcInZpZGVvL3ZuZC52aXZvXCIsXG4gICAgXCJ2b2JcIjogXCJ2aWRlby94LW1zLXZvYlwiLFxuICAgIFwidm9yXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXJcIixcbiAgICBcInZveFwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcInZybWxcIjogXCJtb2RlbC92cm1sXCIsXG4gICAgXCJ2c2RcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC52c2ZcIixcbiAgICBcInZzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnN0XCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c3dcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZ0dVwiOiBcIm1vZGVsL3ZuZC52dHVcIixcbiAgICBcInZ4bWxcIjogXCJhcHBsaWNhdGlvbi92b2ljZXhtbCt4bWxcIixcbiAgICBcInczZFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcIndhZFwiOiBcImFwcGxpY2F0aW9uL3gtZG9vbVwiLFxuICAgIFwid2F2XCI6IFwiYXVkaW8veC13YXZcIixcbiAgICBcIndheFwiOiBcImF1ZGlvL3gtbXMtd2F4XCIsXG4gICAgXCJ3Ym1wXCI6IFwiaW1hZ2Uvdm5kLndhcC53Ym1wXCIsXG4gICAgXCJ3YnNcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpdGljYWx0b29scy53YnMreG1sXCIsXG4gICAgXCJ3YnhtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud2J4bWxcIixcbiAgICBcIndjbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid2RiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3ZHBcIjogXCJpbWFnZS92bmQubXMtcGhvdG9cIixcbiAgICBcIndlYmFcIjogXCJhdWRpby93ZWJtXCIsXG4gICAgXCJ3ZWJtXCI6IFwidmlkZW8vd2VibVwiLFxuICAgIFwid2VicFwiOiBcImltYWdlL3dlYnBcIixcbiAgICBcIndnXCI6IFwiYXBwbGljYXRpb24vdm5kLnBtaS53aWRnZXRcIixcbiAgICBcIndndFwiOiBcImFwcGxpY2F0aW9uL3dpZGdldFwiLFxuICAgIFwid2tzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3bVwiOiBcInZpZGVvL3gtbXMtd21cIixcbiAgICBcIndtYVwiOiBcImF1ZGlvL3gtbXMtd21hXCIsXG4gICAgXCJ3bWRcIjogXCJhcHBsaWNhdGlvbi94LW1zLXdtZFwiLFxuICAgIFwid21mXCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJ3bWxcIjogXCJ0ZXh0L3ZuZC53YXAud21sXCIsXG4gICAgXCJ3bWxjXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53bWxjXCIsXG4gICAgXCJ3bWxzXCI6IFwidGV4dC92bmQud2FwLndtbHNjcmlwdFwiLFxuICAgIFwid21sc2NcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndtbHNjcmlwdGNcIixcbiAgICBcIndtdlwiOiBcInZpZGVvL3gtbXMtd212XCIsXG4gICAgXCJ3bXhcIjogXCJ2aWRlby94LW1zLXdteFwiLFxuICAgIFwid216XCI6IFwiYXBwbGljYXRpb24veC1tcy13bXpcIixcbiAgICBcIndvZmZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtd29mZlwiLFxuICAgIFwid3BkXCI6IFwiYXBwbGljYXRpb24vdm5kLndvcmRwZXJmZWN0XCIsXG4gICAgXCJ3cGxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd3BsXCIsXG4gICAgXCJ3cHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndxZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53cWRcIixcbiAgICBcIndyaVwiOiBcImFwcGxpY2F0aW9uL3gtbXN3cml0ZVwiLFxuICAgIFwid3JsXCI6IFwibW9kZWwvdnJtbFwiLFxuICAgIFwid3NkbFwiOiBcImFwcGxpY2F0aW9uL3dzZGwreG1sXCIsXG4gICAgXCJ3c3BvbGljeVwiOiBcImFwcGxpY2F0aW9uL3dzcG9saWN5K3htbFwiLFxuICAgIFwid3RiXCI6IFwiYXBwbGljYXRpb24vdm5kLndlYnR1cmJvXCIsXG4gICAgXCJ3dnhcIjogXCJ2aWRlby94LW1zLXd2eFwiLFxuICAgIFwieDMyXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwieDNkXCI6IFwibW9kZWwveDNkK3htbFwiLFxuICAgIFwieDNkYlwiOiBcIm1vZGVsL3gzZCtiaW5hcnlcIixcbiAgICBcIngzZGJ6XCI6IFwibW9kZWwveDNkK2JpbmFyeVwiLFxuICAgIFwieDNkdlwiOiBcIm1vZGVsL3gzZCt2cm1sXCIsXG4gICAgXCJ4M2R2elwiOiBcIm1vZGVsL3gzZCt2cm1sXCIsXG4gICAgXCJ4M2R6XCI6IFwibW9kZWwveDNkK3htbFwiLFxuICAgIFwieGFtbFwiOiBcImFwcGxpY2F0aW9uL3hhbWwreG1sXCIsXG4gICAgXCJ4YXBcIjogXCJhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LWFwcFwiLFxuICAgIFwieGFyXCI6IFwiYXBwbGljYXRpb24vdm5kLnhhcmFcIixcbiAgICBcInhiYXBcIjogXCJhcHBsaWNhdGlvbi94LW1zLXhiYXBcIixcbiAgICBcInhiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzLmJpbmRlclwiLFxuICAgIFwieGJtXCI6IFwiaW1hZ2UveC14Yml0bWFwXCIsXG4gICAgXCJ4ZGZcIjogXCJhcHBsaWNhdGlvbi94Y2FwLWRpZmYreG1sXCIsXG4gICAgXCJ4ZG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3htbFwiLFxuICAgIFwieGRwXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLnhkcCt4bWxcIixcbiAgICBcInhkc3NjXCI6IFwiYXBwbGljYXRpb24vZHNzYyt4bWxcIixcbiAgICBcInhkd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzXCIsXG4gICAgXCJ4ZW5jXCI6IFwiYXBwbGljYXRpb24veGVuYyt4bWxcIixcbiAgICBcInhlclwiOiBcImFwcGxpY2F0aW9uL3BhdGNoLW9wcy1lcnJvcit4bWxcIixcbiAgICBcInhmZGZcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUueGZkZlwiLFxuICAgIFwieGZkbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC54ZmRsXCIsXG4gICAgXCJ4aHRcIjogXCJhcHBsaWNhdGlvbi94aHRtbCt4bWxcIixcbiAgICBcInhodG1sXCI6IFwiYXBwbGljYXRpb24veGh0bWwreG1sXCIsXG4gICAgXCJ4aHZtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieGlmXCI6IFwiaW1hZ2Uvdm5kLnhpZmZcIixcbiAgICBcInhsYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxmXCI6IFwiYXBwbGljYXRpb24veC14bGlmZit4bWxcIixcbiAgICBcInhsbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHNiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0LmJpbmFyeS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsc21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHN4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXRcIixcbiAgICBcInhsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGx0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZVwiLFxuICAgIFwieGx3XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bVwiOiBcImF1ZGlvL3htXCIsXG4gICAgXCJ4bWxcIjogXCJhcHBsaWNhdGlvbi94bWxcIixcbiAgICBcInhvXCI6IFwiYXBwbGljYXRpb24vdm5kLm9scGMtc3VnYXJcIixcbiAgICBcInhvcFwiOiBcImFwcGxpY2F0aW9uL3hvcCt4bWxcIixcbiAgICBcInhwaVwiOiBcImFwcGxpY2F0aW9uL3gteHBpbnN0YWxsXCIsXG4gICAgXCJ4cGxcIjogXCJhcHBsaWNhdGlvbi94cHJvYyt4bWxcIixcbiAgICBcInhwbVwiOiBcImltYWdlL3gteHBpeG1hcFwiLFxuICAgIFwieHByXCI6IFwiYXBwbGljYXRpb24vdm5kLmlzLXhwclwiLFxuICAgIFwieHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXhwc2RvY3VtZW50XCIsXG4gICAgXCJ4cHdcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJjb24uZm9ybW5ldFwiLFxuICAgIFwieHB4XCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyY29uLmZvcm1uZXRcIixcbiAgICBcInhzbFwiOiBcImFwcGxpY2F0aW9uL3htbFwiLFxuICAgIFwieHNsdFwiOiBcImFwcGxpY2F0aW9uL3hzbHQreG1sXCIsXG4gICAgXCJ4c21cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sK3htbFwiLFxuICAgIFwieHNwZlwiOiBcImFwcGxpY2F0aW9uL3hzcGYreG1sXCIsXG4gICAgXCJ4dWxcIjogXCJhcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sXCIsXG4gICAgXCJ4dm1cIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInh2bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInh3ZFwiOiBcImltYWdlL3gteHdpbmRvd2R1bXBcIixcbiAgICBcInh5elwiOiBcImNoZW1pY2FsL3gteHl6XCIsXG4gICAgXCJ4elwiOiBcImFwcGxpY2F0aW9uL3gteHpcIixcbiAgICBcInlhbWxcIjogXCJ0ZXh0L3lhbWxcIixcbiAgICBcInlhbmdcIjogXCJhcHBsaWNhdGlvbi95YW5nXCIsXG4gICAgXCJ5aW5cIjogXCJhcHBsaWNhdGlvbi95aW4reG1sXCIsXG4gICAgXCJ5bWxcIjogXCJ0ZXh0L3lhbWxcIixcbiAgICBcInpcIjogXCJhcHBsaWNhdGlvbi94LWNvbXByZXNzXCIsXG4gICAgXCJ6MVwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInoyXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejNcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NFwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno1XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejZcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6N1wiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno4XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiemF6XCI6IFwiYXBwbGljYXRpb24vdm5kLnp6YXp6LmRlY2sreG1sXCIsXG4gICAgXCJ6aXBcIjogXCJhcHBsaWNhdGlvbi96aXBcIixcbiAgICBcInppclwiOiBcImFwcGxpY2F0aW9uL3ZuZC56dWxcIixcbiAgICBcInppcnpcIjogXCJhcHBsaWNhdGlvbi92bmQuenVsXCIsXG4gICAgXCJ6bW1cIjogXCJhcHBsaWNhdGlvbi92bmQuaGFuZGhlbGQtZW50ZXJ0YWlubWVudCt4bWxcIixcbiAgICBcIjEyM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy0xLTItM1wiXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWltZS10eXBlcy1tb2R1bGUuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5hc3luYyBmdW5jdGlvbiBhZnRlckZldGNoKHJlc3BvbnNlKSB7XG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgYmFkIHJlc3BvbnNlIDogJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSB8fCAnYXBwbGljYXRpb24vanNvbic7XG4gICAgbGV0IHNjaSA9IHJlY2VpdmVkQ29udGVudFR5cGUuaW5kZXhPZignOycpO1xuICAgIGlmIChzY2kgPj0gMClcbiAgICAgICAgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlY2VpdmVkQ29udGVudFR5cGUuc3Vic3RyKDAsIHNjaSk7XG4gICAgaWYgKHJlY2VpdmVkQ29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cbmZ1bmN0aW9uIGdldERhdGEodXJsLCBoZWFkZXJzID0gbnVsbCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInXG4gICAgfTtcbiAgICBpZiAoaGVhZGVycylcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0gaGVhZGVycztcbiAgICByZXR1cm4gZmV0Y2godXJsLCBvcHRpb25zKVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZ2V0RGF0YSA9IGdldERhdGE7XG5mdW5jdGlvbiBwb3N0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucG9zdERhdGEgPSBwb3N0RGF0YTtcbmZ1bmN0aW9uIHB1dERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucHV0RGF0YSA9IHB1dERhdGE7XG5mdW5jdGlvbiBkZWxldGVEYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmRlbGV0ZURhdGEgPSBkZWxldGVEYXRhO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PSBcImhvbWUubHRlY29uc3VsdGluZy5mclwiID8gXCJodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mclwiIDogXCJodHRwczovL2xvY2FsaG9zdDo1MDA1XCI7XG5hc3luYyBmdW5jdGlvbiBzZWFyY2goc2VhcmNoVGV4dCwgbWltZVR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgIG5hbWU6IHNlYXJjaFRleHQsXG4gICAgICAgICAgICBtaW1lVHlwZTogbWltZVR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyByZXN1bHREaXJlY3RvcmllcywgcmVzdWx0RmlsZXNkZGQsIGl0ZW1zIH0gPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NlYXJjaGAsIHNlYXJjaFNwZWMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IHJlc3VsdERpcmVjdG9yaWVzLFxuICAgICAgICAgICAgZmlsZXM6IHJlc3VsdEZpbGVzZGRkLFxuICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLnNlYXJjaCA9IHNlYXJjaDtcbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEV4KHNlYXJjaFNwZWMpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHJlc3VsdERpcmVjdG9yaWVzLCByZXN1bHRGaWxlc2RkZCwgaXRlbXMgfSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2VhcmNoYCwgc2VhcmNoU3BlYyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXJlY3RvcmllczogcmVzdWx0RGlyZWN0b3JpZXMsXG4gICAgICAgICAgICBmaWxlczogcmVzdWx0RmlsZXNkZGQsXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuc2VhcmNoRXggPSBzZWFyY2hFeDtcbmFzeW5jIGZ1bmN0aW9uIGdldERpcmVjdG9yeURlc2NyaXB0b3Ioc2hhKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT1hcHBsaWNhdGlvbi9qc29uYCk7XG59XG5leHBvcnRzLmdldERpcmVjdG9yeURlc2NyaXB0b3IgPSBnZXREaXJlY3RvcnlEZXNjcmlwdG9yO1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3JlZnNgKTtcbn1cbmV4cG9ydHMuZ2V0UmVmZXJlbmNlcyA9IGdldFJlZmVyZW5jZXM7XG5hc3luYyBmdW5jdGlvbiBnZXRSZWZlcmVuY2UobmFtZSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcmVmcy8ke25hbWV9YCk7XG59XG5leHBvcnRzLmdldFJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZTtcbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1pdChzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPWFwcGxpY2F0aW9uL2pzb25gKTtcbn1cbmV4cG9ydHMuZ2V0Q29tbWl0ID0gZ2V0Q29tbWl0O1xuYXN5bmMgZnVuY3Rpb24gZ2V0U2hhSW5mbyhzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vaW5mb2ApO1xufVxuZXhwb3J0cy5nZXRTaGFJbmZvID0gZ2V0U2hhSW5mbztcbmZ1bmN0aW9uIGdldFNoYUNvbnRlbnRVcmwoc2hhLCBtaW1lVHlwZSwgbmFtZSwgd2l0aFBoYW50b20sIGlzRG93bmxvYWQpIHtcbiAgICBpZiAoIXNoYSlcbiAgICAgICAgcmV0dXJuICcjJztcbiAgICBsZXQgYmFzZSA9IHdpdGhQaGFudG9tID9cbiAgICAgICAgYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50LyR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfT90eXBlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG1pbWVUeXBlKX1gIDpcbiAgICAgICAgYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9JHtlbmNvZGVVUklDb21wb25lbnQobWltZVR5cGUpfWA7XG4gICAgaWYgKGlzRG93bmxvYWQpXG4gICAgICAgIGJhc2UgKz0gYCZmaWxlTmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChuYW1lIHx8IHNoYSl9YDtcbiAgICByZXR1cm4gYmFzZTtcbn1cbmV4cG9ydHMuZ2V0U2hhQ29udGVudFVybCA9IGdldFNoYUNvbnRlbnRVcmw7XG5mdW5jdGlvbiBnZXRTaGFJbWFnZVRodW1ibmFpbFVybChzaGEsIG1pbWVUeXBlKSB7XG4gICAgcmV0dXJuIGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vcGx1Z2lucy9pbWFnZS90aHVtYm5haWw/dHlwZT0ke21pbWVUeXBlfWA7XG59XG5leHBvcnRzLmdldFNoYUltYWdlVGh1bWJuYWlsVXJsID0gZ2V0U2hhSW1hZ2VUaHVtYm5haWxVcmw7XG5mdW5jdGlvbiBnZXRTaGFJbWFnZU1lZGl1bVRodW1ibmFpbFVybChzaGEsIG1pbWVUeXBlKSB7XG4gICAgcmV0dXJuIGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vcGx1Z2lucy9pbWFnZS9tZWRpdW0/dHlwZT0ke21pbWVUeXBlfWA7XG59XG5leHBvcnRzLmdldFNoYUltYWdlTWVkaXVtVGh1bWJuYWlsVXJsID0gZ2V0U2hhSW1hZ2VNZWRpdW1UaHVtYm5haWxVcmw7XG5hc3luYyBmdW5jdGlvbiBwdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdE5hbWUsIHNoYSwgbWltZVR5cGUsIG5hbWUpIHtcbiAgICBsZXQgcGF5bG9hZCA9IHtcbiAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgICAgICAgICAgICAgaXNEaXJlY3Rvcnk6IG1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICAgICAgICAgIG1pbWVUeXBlLFxuICAgICAgICAgICAgICAgIHNoYVxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5wdXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3BsdWdpbnMvcGxheWxpc3RzLyR7cGxheWxpc3ROYW1lfWAsIHBheWxvYWQpO1xufVxuZXhwb3J0cy5wdXRJdGVtVG9QbGF5bGlzdCA9IHB1dEl0ZW1Ub1BsYXlsaXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzdC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgxIHgtaWQ9XCJ0aXRsZVwiIGNsYXNzPVwiYW5pbWF0ZWQtLXF1aWNrXCI+UmFjY29vbjwvaDE+XG4gICAgICAgIDxoNCB4LWlkPVwic3ViVGl0bGVcIj5TZWFyY2ggZm9yIHNvbmdzPC9oND5cbiAgICAgICAgPGZvcm0geC1pZD1cImZvcm1cIiBjbGFzcz1cIm11aS1mb3JtLS1pbmxpbmVcIj5cbiAgICAgICAgICAgIDwhLS10aGlzIGlzIGEgbGl0dGxlIGhhY2sgdG8gaGF2ZSB0aGluZ3MgY2VudGVyZWQtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIj7wn5SNPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLXRleHRmaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB4LWlkPVwidGVybVwiIHR5cGU9XCJ0ZXh0XCIgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCIgYXV0b2ZvY3VzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHJvbGU9XCJzdWJtaXRcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPvCflI08L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgICA8c3Bhbj48YSB4LWlkPSdhdWRpb01vZGUnIGhyZWY9XCIjXCI+8J+OtjwvYT4mbmJzcDs8YSB4LWlkPSdpbWFnZU1vZGUnIGhyZWY9XCIjXCI+77iP8J+Onu+4jzwvYT48L3NwYW4+XG4gICAgICAgIDxiciAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVRpdGxlOiAodGVtcGxhdGUsIGRpc3BsYXllZCkgPT4ge1xuICAgICAgICBpZiAoZGlzcGxheWVkKSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QucmVtb3ZlKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zdWJUaXRsZS5zdHlsZS5kaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LmFkZCgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICAgICAgdGVtcGxhdGUuc3ViVGl0bGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZWFyY2gtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IHdhaXQgPSAoZHVyYXRpb24pID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbikpO1xuY29uc3QgcmFuZCA9IG1heCA9PiBNYXRoLmZsb29yKG1heCAqIE1hdGgucmFuZG9tKCkpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lcic+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyPlNsaWRlc2hvdzwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cIml0ZW1zXCIgY2xhc3M9XCJtdWktcGFuZWwgeC1zbGlkZXNob3dcIj48L2Rpdj5cbiAgICAgICAgc3BlZWQ6IDxpbnB1dCB4LWlkPVwic3BlZWRcIiB0eXBlPVwicmFuZ2VcIiBtaW49XCI1MFwiIG1heD1cIjMwMDBcIiB2YWx1ZT1cIjIwMDBcIi8+XG4gICAgICAgIG5iIHJvd3M6IDxpbnB1dCB4LWlkPVwibmJSb3dzXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjFcIiBtYXg9XCIxNTBcIiB2YWx1ZT1cIjFcIi8+XG4gICAgICAgIG5iIGltYWdlczogPGlucHV0IHgtaWQ9XCJuYkltYWdlc1wiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgbWF4PVwiMTAwXCIgdmFsdWU9XCIzXCIvPlxuICAgICAgICBpbnRlcnZhbDogPGlucHV0IHgtaWQ9XCJpbnRlcnZhbFwiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgbWF4PVwiMzY1XCIgdmFsdWU9XCIxNVwiIHZhbHVlPVwiNTBcIi8+XG4gICAgICAgIDxpbnB1dCB4LWlkPVwiZGF0ZVwiIHR5cGU9XCJyYW5nZVwiIG1pbj1cIi0kezM2NSAqIDIwfVwiIG1heD1cIjBcIiB2YWx1ZT1cIjBcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCIvPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJyZW1hcmtcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgbGV0IGVscyA9IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKTtcbiAgICBjb25zdCByZW1vdmVSYW5kb21JbWFnZSA9ICgpID0+IHtcbiAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IHBpY2tSYW5kb21JbWFnZSgpO1xuICAgICAgICBpZiAoaW1hZ2VFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gaW1hZ2VFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aClcbiAgICAgICAgICAgICAgICBwYXJlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZUVsZW1lbnQ7XG4gICAgfTtcbiAgICBjb25zdCBhZGRSYW5kb21JbWFnZSA9IChuYkRlc2lyZWRSb3dzKSA9PiB7XG4gICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgbGV0IHJvdyA9IG51bGw7XG4gICAgICAgIGlmIChlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoIDwgbmJEZXNpcmVkUm93cykge1xuICAgICAgICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBlbHMuaXRlbXMuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvdyA9IGVscy5pdGVtcy5jaGlsZHJlbi5pdGVtKHJhbmQoZWxzLml0ZW1zLmNoaWxkcmVuLmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChpbWFnZUVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gaW1hZ2VFbGVtZW50O1xuICAgIH07XG4gICAgY29uc3QgcGlja1JhbmRvbUltYWdlID0gKCkgPT4ge1xuICAgICAgICBsZXQgcG9zc2libGVFbGVtZW50cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCByb3cgb2YgZWxzLml0ZW1zLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbWcgb2Ygcm93LmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRWxlbWVudHMucHVzaChpbWcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcG9zc2libGVFbGVtZW50cy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlRWxlbWVudHNbcmFuZChwb3NzaWJsZUVsZW1lbnRzLmxlbmd0aCldO1xuICAgIH07XG4gICAgY29uc3QgZW51bUltYWdlcyA9IChzKSA9PiB7XG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IGVscy5pdGVtcy5jaGlsZHJlbi5sZW5ndGg7IHJvd0lkeCsrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSBlbHMuaXRlbXMuY2hpbGRyZW4uaXRlbShyb3dJZHgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3cuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzLmFkZChyb3cuY2hpbGRyZW4uaXRlbShpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGltYWdlc0NvdW50ID0gKCkgPT4ge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoOyByb3dJZHgrKykge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gZWxzLml0ZW1zLmNoaWxkcmVuLml0ZW0ocm93SWR4KTtcbiAgICAgICAgICAgIGNvdW50ICs9IHJvdy5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IHBvc3NpYmxlSW1hZ2VzID0gW107XG4gICAgICAgIGxldCBsYXN0U2VhcmNoRGF0ZSA9IG51bGw7XG4gICAgICAgIGxldCBsYXN0U2VhcmNoSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICBsZXQgY3VycmVudE9mZnNldCA9IDA7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVGcm9tTm93SW5NcyA9IChwYXJzZUludChlbHMuZGF0ZS52YWx1ZSB8fCAnMCcpKSAqIDEwMDAgKiA2MCAqIDYwICogMjQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJbkRheXMgPSBwYXJzZUludChlbHMuaW50ZXJ2YWwudmFsdWUpIHx8IDE7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJbk1zID0gaW50ZXJ2YWxJbkRheXMgKiAxMDAwICogNjAgKiA2MCAqIDI0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iV2FudGVkSW1hZ2VzID0gcGFyc2VJbnQoZWxzLm5iSW1hZ2VzLnZhbHVlKSB8fCAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iRGVzaXJlZFJvd3MgPSBwYXJzZUludChlbHMubmJSb3dzLnZhbHVlKSB8fCAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXREdXJhdGlvbkluTXMgPSBwYXJzZUludChlbHMuc3BlZWQudmFsdWUpIHx8IDIwMDA7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgdGltZUZyb21Ob3dJbk1zO1xuICAgICAgICAgICAgICAgIGxldCBkb1NlYXJjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0U2VhcmNoRGF0ZSAhPSB0aW1lRnJvbU5vd0luTXMgfHwgbGFzdFNlYXJjaEludGVydmFsICE9IGludGVydmFsSW5Ncykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZG9TZWFyY2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBhbGwgY3VycmVudCBpbWFnZXMgYXJlIG5vIG1vcmUgcGFydCBvZiB0aGUgbGFzdCBzZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGVudW1JbWFnZXModG9SZW1vdmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICghcG9zc2libGVJbWFnZXMgfHwgIXBvc3NpYmxlSW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkb1NlYXJjaCA9ICFmaW5pc2hlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRvU2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWFyY2hEYXRlID0gdGltZUZyb21Ob3dJbk1zO1xuICAgICAgICAgICAgICAgICAgICBsYXN0U2VhcmNoSW50ZXJ2YWwgPSBpbnRlcnZhbEluTXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBkbyBhIHNlYXJjaCBvbiAke2NlbnRlcn0gKy8tICR7aW50ZXJ2YWxJbkRheXN9IEAgJHtjdXJyZW50T2Zmc2V0fWApO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlOiAnaW1hZ2UvJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBub0RpcmVjdG9yeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogY3VycmVudE9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVNaW46IGNlbnRlciAtIGludGVydmFsSW5NcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVNYXg6IGNlbnRlciArIGludGVydmFsSW5Nc1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUmVzdC5zZWFyY2hFeChzZWFyY2hTcGVjKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zc2libGVJbWFnZXMgPSByZXN1bHRzICYmIHJlc3VsdHMuaXRlbXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUltYWdlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ICs9IHBvc3NpYmxlSW1hZ2VzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9mZnNldCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gcG9zc2libGVJbWFnZXMubGVuZ3RoID09IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUltYWdlcyAmJiBwb3NzaWJsZUltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxzLnJlbWFyay5pbm5lckhUTUwgPSBgJHtuZXcgRGF0ZShjZW50ZXIpLnRvRGF0ZVN0cmluZygpfSA6ICR7bmJXYW50ZWRJbWFnZXN9IGltYWdlcyBvbiAke25iRGVzaXJlZFJvd3N9IHJvd3MgKy8tICR7aW50ZXJ2YWxJbkRheXN9IGRheXMgKEAke2N1cnJlbnRPZmZzZXR9KWA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZXNDb3VudCgpID4gbmJXYW50ZWRJbWFnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSByZW1vdmVSYW5kb21JbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZS5oYXMoaW1hZ2VFbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZXNDb3VudCgpIDwgbmJXYW50ZWRJbWFnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUVsZW1lbnQgPSBhZGRSYW5kb21JbWFnZShuYkRlc2lyZWRSb3dzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IHBpY2tSYW5kb21JbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlLmhhcyhpbWFnZUVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvUmVtb3ZlLmRlbGV0ZShpbWFnZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlSW5kZXggPSByYW5kKHBvc3NpYmxlSW1hZ2VzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3VzZWRJbWFnZV0gPSBwb3NzaWJsZUltYWdlcy5zcGxpY2UoaW1hZ2VJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlZEltYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5zcmMgPSBSZXN0LmdldFNoYUltYWdlVGh1bWJuYWlsVXJsKHVzZWRJbWFnZS5zaGEsIHVzZWRJbWFnZS5taW1lVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVscy5yZW1hcmsuaW5uZXJIVE1MID0gYCR7bmV3IERhdGUoY2VudGVyKS50b0RhdGVTdHJpbmcoKX0sIG5vIG1vcmUgaW1hZ2UsIGNoYW5nZSB0aGUgY3Vyc29yc2A7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZS5zaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZm9yRWFjaChpbWFnZUVsZW1lbnQgPT4gaW1hZ2VFbGVtZW50cy5wdXNoKGltYWdlRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IGltYWdlRWxlbWVudHNbcmFuZChpbWFnZUVsZW1lbnRzLmxlbmd0aCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgd2FpdCh3YWl0RHVyYXRpb25Jbk1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgZXJyb3IgaW4gc2xpZGVzaG93LCB3YWl0aW5nIDVzYCwgLTEpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdhaXQoNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBlbHM7XG59XG5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNsaWRlc2hvdy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgZWxlbWVudHNEYXRhID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbihvYmosIGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IFVpVG9vbHMuZWxGcm9tSHRtbChodG1sKTtcbiAgICBvYmpbJ3Jvb3QnXSA9IHJvb3Q7XG4gICAgVWlUb29scy5lbHMocm9vdCwgYFt4LWlkXWApLmZvckVhY2goZSA9PiBvYmpbZS5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSBlKTtcbiAgICBpZiAocm9vdC5oYXNBdHRyaWJ1dGUoJ3gtaWQnKSlcbiAgICAgICAgb2JqW3Jvb3QuZ2V0QXR0cmlidXRlKCd4LWlkJyldID0gcm9vdDtcbiAgICBlbGVtZW50c0RhdGEuc2V0KHJvb3QsIG9iaik7XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5leHBvcnRzLmNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbiA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbjtcbmZ1bmN0aW9uIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpIHtcbiAgICBjb25zdCBkYXRhID0gZWxlbWVudHNEYXRhLmdldChyb290KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbmV4cG9ydHMuZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEgPSBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YTtcbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UoaHRtbCkge1xuICAgIGxldCByb290ID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKHt9LCBodG1sKTtcbiAgICByZXR1cm4gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCk7XG59XG5leHBvcnRzLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UgPSBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlO1xuY29uc3QgRU1QVFlfTE9DQVRJT04gPSB7IGVsZW1lbnQ6IG51bGwsIGNoaWxkSW5kZXg6IC0xIH07XG5mdW5jdGlvbiB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZWxlbWVudHMsIGV2ZW50KSB7XG4gICAgbGV0IGVscyA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyhlbGVtZW50cykpO1xuICAgIGxldCBjID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBwID0gbnVsbDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChlbHMuaGFzKGMpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgICAgICAgY2hpbGRJbmRleDogcCAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMuY2hpbGRyZW4sIHApXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjID09IGVsZW1lbnRzLnJvb3QpXG4gICAgICAgICAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG4gICAgICAgIHAgPSBjO1xuICAgICAgICBjID0gYy5wYXJlbnRFbGVtZW50O1xuICAgIH0gd2hpbGUgKGMpO1xuICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbn1cbmV4cG9ydHMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uID0gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGVzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZWwoaWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufVxuZXhwb3J0cy5lbCA9IGVsO1xuZnVuY3Rpb24gZWxzKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmVscyA9IGVscztcbmZ1bmN0aW9uIGVsRnJvbUh0bWwoaHRtbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBwYXJlbnQuY2hpbGRyZW4uaXRlbSgwKTtcbn1cbmV4cG9ydHMuZWxGcm9tSHRtbCA9IGVsRnJvbUh0bWw7XG5mdW5jdGlvbiBzdG9wRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxuZXhwb3J0cy5zdG9wRXZlbnQgPSBzdG9wRXZlbnQ7XG5mdW5jdGlvbiogaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChzdGFydCkge1xuICAgIHdoaWxlIChzdGFydCkge1xuICAgICAgICB5aWVsZCBzdGFydDtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmV4cG9ydHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudCA9IGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11aS10b29sLmpzLm1hcCJdLCJzb3VyY2VSb290IjoiIn0=
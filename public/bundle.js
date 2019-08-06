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
        this.playImmediately = false;
        this.largeDisplay = false;
        this.queue = [];
        this.currentIndex = -1;
        // if scroll to playing item is required after a playlist redraw
        this.scrollToPlayingItem = true;
        this.playImmediately = !!localStorage.getItem(`play-immediately`);
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
                    this.playImmediately = !!checkbox.value;
                    localStorage.setItem(`play-immediately`, this.playImmediately);
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
        this.queue.push(item);
        localStorage.setItem('playlist-backup', JSON.stringify(this.queue));
        if (this.playImmediately || !this.isPlaying())
            this.play(this.queue.length - 1);
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
                html += this.playlistItemHtml(i, item.name, false);
            }
            if (this.itemUnroller && this.itemUnroller.hasNext())
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`;
            html += `<div class="mui--text-dark-secondary"><a x-id='clear-playlist' href='#'>clear playlist</a></div>`;
            html += `<div class="mui--text-dark-secondary"><label>Play immediately <input x-id='play-immediately' value='${this.playImmediately}' type="checkbox"/></label></div>`;
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
const SettingsPanel = __webpack_require__(/*! ./settings-panel */ "./public/settings-panel.js");
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
    let showSearch = true;
    let showSettings = false;
    let hash = '';
    if (window.location.hash && window.location.hash.startsWith('#'))
        hash = window.location.hash.substr(1);
    let parsed = parseURL(hash);
    if (parsed.pathname.startsWith('/search/')) {
        searchItems(parsed.pathname.substr('/search/'.length));
    }
    else if (parsed.pathname == '/settings') {
        setContent(settingsPanel.root);
        showSearch = false;
        showSettings = true;
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
    showIf(!hideAudioJukebox, audioPanel);
    showIf(showSearch, searchPanel);
    showIf(showSettings, settingsPanel);
}
const showIf = (condition, panel) => {
    if (condition)
        panel.root.classList.remove('is-hidden');
    else
        panel.root.classList.add('is-hidden');
};
var Mode;
(function (Mode) {
    Mode[Mode["Audio"] = 0] = "Audio";
    Mode[Mode["Image"] = 1] = "Image";
})(Mode || (Mode = {}));
const settingsPanel = SettingsPanel.create();
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
const MimeTypes = __webpack_require__(/*! ./mime-types-module */ "./public/mime-types-module.js");
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
        <div>audio metadata: <div x-id="audioMetadata"></div></div>
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
    let fullName = item.name;
    let extension = '.' + MimeTypes.extensionFromMimeType(item.mimeType);
    if (!fullName.endsWith(extension))
        fullName += extension;
    content.download.href = Rest.getShaContentUrl(item.sha, item.mimeType, fullName, true, true);
    if (item.mimeType.startsWith('image/')) {
        content.extras.innerHTML = `<a target="_blank" href="${Rest.getShaContentUrl(item.sha, item.mimeType, item.name, true, false)}"><img src="${Rest.getShaImageThumbnailUrl(item.sha, item.mimeType)}"/></a><div class="mui-divider"></div>`;
    }
    else {
        content.extras.innerHTML = '';
    }
    if (!isShown)
        mui.overlay('on', options, content.root);
    isShown = true;
    content.names.innerText = `...`;
    content.writeDates.innerText = `...`;
    content.parents.innerHTML = `...`;
    content.sources.innerHTML = `...`;
    content.exif.innerHTML = `...`;
    content.audioMetadata.innerHTML = `...`;
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
        if (info.audioMetadata && info.audioMetadata.length) {
            content.audioMetadata.innerHTML = `<pre>${JSON.stringify(info.audioMetadata, null, 2)}</pre>`;
        }
        else {
            content.audioMetadata.innerHTML = `no audio metadata`;
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
    // special common types :
    if (mimeType == "audio/mpeg")
        return "mp3";
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
async function getJobs() {
    return await Network.getData(`${exports.HEXA_BACKUP_BASE_URL}/jobs`);
}
exports.getJobs = getJobs;
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
async function enqueueYoutubeDownload(youtubeUrl) {
    Network.postData(`${exports.HEXA_BACKUP_BASE_URL}/plugins/youtube/fetch`, { url: youtubeUrl });
}
exports.enqueueYoutubeDownload = enqueueYoutubeDownload;
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

/***/ "./public/settings-panel.js":
/*!**********************************!*\
  !*** ./public/settings-panel.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const UiTool = __webpack_require__(/*! ./ui-tool */ "./public/ui-tool.js");
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const Messages = __webpack_require__(/*! ./messages */ "./public/messages.js");
const Auth = __webpack_require__(/*! ./auth */ "./public/auth.js");
const template = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1>Settings</h1>
        <h2>Youtube Download</h2>
        <div class="mui-panel">
            <form x-id="youtubedlForm" class="mui-form">
                <div class="mui-textfield">
                    <input x-id="youtubedlUrl" type="text">
                </div>
                <button role="submit" class="mui-btn mui-btn--flat">Download</button>
            </form>
            <a x-id="youtubeDlPlaylistLink" href='#'>Go to Youtube downloaded list</a>
        </div>

        <h2>Running jobs</h2>
        <div class="mui-panel">
            <pre x-id="runningJobs"></pre>
            <button x-id="refreshJobs" class="mui-btn mui-btn--flat">Refresh</button>
        </div>
    </div>    
</div>`;
async function refreshJobs(els) {
    let res = await Rest.getJobs();
    let jobs = [];
    if (res.running)
        jobs.push(res.running);
    if (res.waiting)
        jobs = jobs.concat(res.waiting);
    els.runningJobs.innerHTML = `
        <table class="mui-table">
            <thead>
                <tr>
                <th>State</th>
                <th>Type</th>
                <th>Name</th>
                </tr>
            </thead>
            <tbody>
                ${jobs.map((job, index) => `<tr><td>${index == 0 ? 'Running' : 'Waiting'}</td><td>${job.clientName}</td><td>${job.name}</td></tr>`).join('')}
            </tbody>
        </table>`;
}
function create() {
    let els = templates_1.createTemplateInstance(template);
    els.youtubedlForm.addEventListener('submit', async (event) => {
        UiTool.stopEvent(event);
        await Rest.enqueueYoutubeDownload(els.youtubedlUrl.value);
        els.youtubedlUrl.value = '';
        els.youtubedlUrl.blur();
        Messages.displayMessage(`Downloading from youtube`, 1);
        refreshJobs(els);
    });
    Auth.me().then(user => {
        els.youtubeDlPlaylistLink.href = `#/refs/PLUGIN-YOUTUBEDOWNLOAD-${user.uuid.toUpperCase()}`;
    });
    els.refreshJobs.addEventListener('click', event => {
        UiTool.stopEvent(event);
        refreshJobs(els);
    });
    refreshJobs(els);
    return els;
}
exports.create = create;
//# sourceMappingURL=settings-panel.js.map

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2h0bWwtc25pcHBldHMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2ltYWdlLWRldGFpbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZm8tcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2xvY2F0aW9ucy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbWVzc2FnZXMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL21pbWUtdHlwZXMtbW9kdWxlLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9uZXR3b3JrLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9yZXN0LmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zZWFyY2gtcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3NldHRpbmdzLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zbGlkZXNob3cuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3RlbXBsYXRlcy5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdWktdG9vbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBMEMsZ0NBQWdDO0FBQzFFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZ0VBQXdELGtCQUFr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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q0E7QUFDQSxxQzs7Ozs7Ozs7Ozs7O0FDdEtBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RCxnQkFBZ0IsbUJBQU8sQ0FBQyxzQ0FBVztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQzVDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vcHVibGljL2luZGV4LmpzXCIpO1xuIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBNaW1lVHlwZXMgPSByZXF1aXJlKFwiLi9taW1lLXR5cGVzLW1vZHVsZVwiKTtcbmNvbnN0IE1lc3NhZ2VzID0gcmVxdWlyZShcIi4vbWVzc2FnZXNcIik7XG5jb25zdCBMb2NhdGlvbnMgPSByZXF1aXJlKFwiLi9sb2NhdGlvbnNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPVwiYXVkaW8tZm9vdGVyIG11aS1wYW5lbFwiPlxuICAgIDxoMyBjbGFzcz1cIngtd2hlbi1sYXJnZS1kaXNwbGF5XCI+UGxheWxpc3Q8L2gzPlxuICAgIDxkaXYgeC1pZD1cInBsYXlsaXN0XCI+PC9kaXY+XG4gICAgPGRpdiB4LWlkPVwiZXhwYW5kZXJcIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWNlbnRlclwiPuKYsDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJ4LWhvcml6b250YWwtZmxleFwiIHN0eWxlPVwid2lkdGg6MTAwJTtcIj5cbiAgICAgICAgPGEgeC1pZD1cImluZm9CdXR0b25cIiBocmVmPVwiI1wiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mYWJcIj5JbmZvPC9hPlxuICAgICAgICA8YXVkaW8geC1pZD1cInBsYXllclwiIGNsYXNzPVwiYXVkaW8tcGxheWVyXCIgY29udHJvbHMgcHJlbG9hZD1cIm1ldGFkYXRhXCI+PC9hdWRpbz5cbiAgICAgICAgPGEgeC1pZD1cImFkZFBsYXlsaXN0QnV0dG9uXCIgaHJlZj1cIiN0b3RvXCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZhYlwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogI2ZmNDA4MTczOyBjb2xvcjogd2hpdGU7XCI+KyBQTC48L2E+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5hdWRpb1BhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIHBsYXk6IChlbGVtZW50cywgbmFtZSwgc2hhLCBtaW1lVHlwZSkgPT4ge1xuICAgICAgICBlbGVtZW50cy5wbGF5ZXIuc2V0QXR0cmlidXRlKCdzcmMnLCBSZXN0LmdldFNoYUNvbnRlbnRVcmwoc2hhLCBtaW1lVHlwZSwgbmFtZSwgZmFsc2UsIGZhbHNlKSk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBtaW1lVHlwZSk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5wbGF5KCk7XG4gICAgICAgIGVsZW1lbnRzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShcImlzLWhpZGRlblwiKTtcbiAgICB9LFxufTtcbmNsYXNzIEF1ZGlvSnVrZWJveCB7XG4gICAgY29uc3RydWN0b3IoYXVkaW9QYW5lbCkge1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwgPSBhdWRpb1BhbmVsO1xuICAgICAgICB0aGlzLnBsYXlJbW1lZGlhdGVseSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIC8vIGlmIHNjcm9sbCB0byBwbGF5aW5nIGl0ZW0gaXMgcmVxdWlyZWQgYWZ0ZXIgYSBwbGF5bGlzdCByZWRyYXdcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wbGF5SW1tZWRpYXRlbHkgPSAhIWxvY2FsU3RvcmFnZS5nZXRJdGVtKGBwbGF5LWltbWVkaWF0ZWx5YCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcXVldWUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnKSk7XG4gICAgICAgICAgICBpZiAocXVldWUgJiYgcXVldWUgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZXJyb3IgbG9hZGluZyBxdWV1ZSBmcm9tIGxvY2FsIHN0b3JhZ2VgLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cyA9IFVpVG9vbHMuZWxzKHRoaXMuYXVkaW9QYW5lbC5yb290LCAnLngtd2hlbi1sYXJnZS1kaXNwbGF5Jyk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlOZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEF1ZGlvIHBsYXllciBlbmNvdW50ZXIgYW4gZXJyb3IsIHBsYXlpbmcgbmV4dCBzb25nYCwgLTEpO1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdzdGFsbGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEF1ZGlvIHBsYXllciBpcyBzdGFsbGVkIChsb3cgbmV0d29yaz8pYCwgLTEpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmV4cGFuZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSAhdGhpcy5sYXJnZURpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBVaVRvb2xzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QXR0ciA9IGUuZ2V0QXR0cmlidXRlKCd4LXF1ZXVlLWluZGV4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleEF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4QXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gTmFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QucXVlcnlTZWxlY3RvcihgW3gtaWQ9J3BsYXktaW1tZWRpYXRlbHknXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0ncGxheS1pbW1lZGlhdGVseSddYCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheUltbWVkaWF0ZWx5ID0gISFjaGVja2JveC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYHBsYXktaW1tZWRpYXRlbHlgLCB0aGlzLnBsYXlJbW1lZGlhdGVseSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmFkZFBsYXlsaXN0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBVaVRvb2xzLnN0b3BFdmVudChldmVudCk7XG4gICAgICAgICAgICBjb25zdCBwbGF5bGlzdCA9ICdmYXZvcml0ZXMnOyAvLyB0b2RvIHNob3VsZCBiZSBhIHBhcmFtZXRlci4uLlxuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgQ2Fubm90IGFkZCB0byBwbGF5bGlzdCwgbm90aGluZyBwbGF5aW5nYCwgLTEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBNaW1lVHlwZXMuZXh0ZW5zaW9uRnJvbU1pbWVUeXBlKGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgYXdhaXQgUmVzdC5wdXRJdGVtVG9QbGF5bGlzdChwbGF5bGlzdCwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGAke2l0ZW0ubmFtZX0uJHtleHRlbnNpb259YCk7XG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShg8J+RjSAke2l0ZW0ubmFtZX0gYWRkZWQgdG8gcGxheWxpc3QgJyR7cGxheWxpc3R9J2AsIDEpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmluZm9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIFVpVG9vbHMuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAgICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYE5vdGhpbmcgcGxheWluZ2AsIC0xKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBMb2NhdGlvbnMuZ29TaGFJbmZvKHtcbiAgICAgICAgICAgICAgICBzaGE6IGl0ZW0uc2hhLFxuICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICBtaW1lVHlwZTogaXRlbS5taW1lVHlwZSxcbiAgICAgICAgICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgICAgICAgICAgc2l6ZTogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBjdXJyZW50SXRlbSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgMCB8fCB0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgfVxuICAgIGFkZEFuZFBsYXkoaXRlbSkge1xuICAgICAgICBpdGVtID0ge1xuICAgICAgICAgICAgc2hhOiBpdGVtLnNoYSxcbiAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBpdGVtLm1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLnNoYSA9PSBpdGVtLnNoYSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgIH1cbiAgICBwbGF5TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlOZXh0VW5yb2xsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1VbnJvbGxlci51bnJvbGwoKTtcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRJdGVtVW5yb2xsZXIoaXRlbVVucm9sbGVyKSB7XG4gICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gaXRlbVVucm9sbGVyO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBwdXNoUXVldWVBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaWYgKCFpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXVlKSk7XG4gICAgICAgIGlmICh0aGlzLnBsYXlJbW1lZGlhdGVseSB8fCAhdGhpcy5pc1BsYXlpbmcoKSlcbiAgICAgICAgICAgIHRoaXMucGxheSh0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgJHtpdGVtLm5hbWV9IGFkZGVkIHRvIHBsYXlsaXN0YCwgMCk7XG4gICAgfVxuICAgIHBsYXkoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnF1ZXVlW2luZGV4XTtcbiAgICAgICAgICAgIGV4cG9ydHMuYXVkaW9QYW5lbC5wbGF5KHRoaXMuYXVkaW9QYW5lbCwgaXRlbS5uYW1lLCBpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbeC1mb3Itc2hhPScke2l0ZW0uc2hhLnN1YnN0cigwLCA1KX0nXWApLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLXdlaWdodGVkJykpO1xuICAgICAgICAgICAgZG9jdW1lbnQudGl0bGUgPSBgJHtpdGVtLm5hbWV9IHBsYXlpbmcgYnkgUmFjY29vbmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC50aXRsZSA9IGBSYWNjb29uYDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnJlc2hUaW1lcilcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlZnJlc2hUaW1lcik7XG4gICAgICAgIHRoaXMucmVmcmVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlYWxSZWZyZXNoUGxheWxpc3QoKSwgMTApO1xuICAgIH1cbiAgICByZWFsUmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAoIXRoaXMucXVldWUgfHwgIXRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPlRoZXJlIGFyZSBubyBpdGVtcyBpbiB5b3VyIHBsYXlsaXN0LiBDbGljayBvbiBzb25ncyB0byBwbGF5IHRoZW0uPC9zcGFuPic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBodG1sID0gYGA7XG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbChpLCBpdGVtLm5hbWUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPjxhIHgtaWQ9J2NsZWFyLXBsYXlsaXN0JyBocmVmPScjJz5jbGVhciBwbGF5bGlzdDwvYT48L2Rpdj5gO1xuICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPjxsYWJlbD5QbGF5IGltbWVkaWF0ZWx5IDxpbnB1dCB4LWlkPSdwbGF5LWltbWVkaWF0ZWx5JyB2YWx1ZT0nJHt0aGlzLnBsYXlJbW1lZGlhdGVseX0nIHR5cGU9XCJjaGVja2JveFwiLz48L2xhYmVsPjwvZGl2PmA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LmFkZCgnaXMtaGlkZGVuJykpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID49IDAgJiYgdGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5wbGF5bGlzdEl0ZW1IdG1sKHRoaXMuY3VycmVudEluZGV4LCB0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4XS5uYW1lLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMuY3VycmVudEluZGV4ICsgMX1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+Zm9sbG93ZWQgYnkgJyR7dGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleCArIDFdLm5hbWUuc3Vic3RyKDAsIDIwKX0nIC4uLjwvZGl2PmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXRlbVVucm9sbGVyICYmIHRoaXMuaXRlbVVucm9sbGVyLmhhc05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5xdWV1ZS5sZW5ndGh9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeSBpcy1vbmVsaW5ldGV4dFwiPiR7dGhpcy5pdGVtVW5yb2xsZXIubmFtZSgpfTwvZGl2PmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAvLyBhZnRlciByZWZyZXNoIHN0ZXBzXG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSAmJiB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbFRvcCA9IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGxheWxpc3RJdGVtSHRtbChpbmRleCwgbmFtZSwgb25lTGluZVRleHQpIHtcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtcXVldWUtaW5kZXg9XCIke2luZGV4fVwiIGNsYXNzPVwib25jbGljayAke29uZUxpbmVUZXh0ID8gJ2lzLW9uZWxpbmV0ZXh0JyA6ICcnfSAke2luZGV4ID09IHRoaXMuY3VycmVudEluZGV4ID8gJ211aS0tdGV4dC1oZWFkbGluZScgOiAnJ31cIj4ke25hbWV9PC9kaXY+YDtcbiAgICB9XG4gICAgaXNQbGF5aW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdWRpb1BhbmVsLnBsYXllci5jdXJyZW50U3JjXG4gICAgICAgICAgICAmJiB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmN1cnJlbnRUaW1lID4gMFxuICAgICAgICAgICAgJiYgIXRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIucGF1c2VkXG4gICAgICAgICAgICAmJiAhdGhpcy5hdWRpb1BhbmVsLnBsYXllci5lbmRlZFxuICAgICAgICAgICAgJiYgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5yZWFkeVN0YXRlID4gMjtcbiAgICB9XG59XG5leHBvcnRzLkF1ZGlvSnVrZWJveCA9IEF1ZGlvSnVrZWJveDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1ZGlvLXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5mdW5jdGlvbiB3YWl0KGR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbikpO1xufVxubGV0IGF1dGhlbnRpY2F0ZWRVc2VyID0gbnVsbDtcbmNsYXNzIEF1dGgge1xuICAgIG9uRXJyb3IoKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gICAgYXN5bmMgbG9vcCgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvYXV0aGApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL3NldENvb2tpZWAsIHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cmVzcG9uc2UudG9rZW59YCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXMgfHwgIXJlcy5saWZldGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHNldENvb2tpZWAsIHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhdXRoZW50aWNhdGVkVXNlciA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9tZWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IG9idGFpbiBhdXRoIHRva2VuYCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3QgcmVmcmVzaCBhdXRoICgke2Vycn0pYCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBldmVyeSAzMCBtaW51dGVzXG4gICAgICAgICAgICBhd2FpdCB3YWl0KDEwMDAgKiA2MCAqIDMwKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGF1dG9SZW5ld0F1dGgoKSB7XG4gICAgbGV0IGF1dGggPSBuZXcgQXV0aCgpO1xuICAgIGF1dGgubG9vcCgpO1xufVxuZXhwb3J0cy5hdXRvUmVuZXdBdXRoID0gYXV0b1JlbmV3QXV0aDtcbmFzeW5jIGZ1bmN0aW9uIG1lKCkge1xuICAgIGlmICghYXV0aGVudGljYXRlZFVzZXIpXG4gICAgICAgIGF1dGhlbnRpY2F0ZWRVc2VyID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL21lYCk7XG4gICAgcmV0dXJuIGF1dGhlbnRpY2F0ZWRVc2VyO1xufVxuZXhwb3J0cy5tZSA9IG1lO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXV0aC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBTbmlwcGV0cyA9IHJlcXVpcmUoXCIuL2h0bWwtc25pcHBldHNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDIgeC1pZD1cInRpdGxlXCI+PC9oMj5cbiAgICAgICAgPGRpdiB4LWlkPVwiaXRlbXNcIiBjbGFzcz1cIm11aS1wYW5lbFwiPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuZGlyZWN0b3J5UGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgc2V0TG9hZGluZzogKGVsZW1lbnRzLCB0aXRsZSkgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgTG9hZGluZyAnJHt0aXRsZX0nIC4uLmA7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGBgO1xuICAgIH0sXG4gICAgZGlzcGxheVNlYXJjaGluZzogKGVsZW1lbnRzLCB0ZXJtKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPlNlYXJjaGluZyAnJHt0ZXJtfScgLi4uPC9kaXY+YDtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYGA7XG4gICAgfSxcbiAgICBzZXRWYWx1ZXM6IChlbGVtZW50cywgdmFsdWVzKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGAke3ZhbHVlcy5uYW1lfWA7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmNsYXNzTGlzdC5yZW1vdmUoJ3gtaW1hZ2UtcGFuZWwnKTtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuY2xhc3NMaXN0LmFkZCgneC1pdGVtcy1wYW5lbCcpO1xuICAgICAgICBpZiAodmFsdWVzLml0ZW1zICYmIHZhbHVlcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IHZhbHVlcy5pdGVtcy5tYXAoU25pcHBldHMuaXRlbVRvSHRtbCkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50cy5pdGVtcy5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLWhpbnRcIj5ObyByZXN1bHRzPC9kaXY+YDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2V0SW1hZ2VzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSB2YWx1ZXMudGVybTtcbiAgICAgICAgZWxlbWVudHMuaXRlbXMuY2xhc3NMaXN0LmFkZCgneC1pbWFnZS1wYW5lbCcpO1xuICAgICAgICBlbGVtZW50cy5pdGVtcy5jbGFzc0xpc3QucmVtb3ZlKCd4LWl0ZW1zLXBhbmVsJyk7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IHZhbHVlcy5pdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdj48aW1nIGNsYXNzPVwieC1pbWFnZS16b29tLWFjdGlvbiBvbmNsaWNrXCIgbG9hZGluZz1cImxhenlcIiBzcmM9XCJibGFuay5qcGVnXCIgZGF0YS1zcmM9XCIke1Jlc3QuZ2V0U2hhSW1hZ2VUaHVtYm5haWxVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpfVwiLz48L2Rpdj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2PiR7U25pcHBldHMuaXRlbVRvSHRtbChpdGVtKX08L2Rpdj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5qb2luKCcnKTtcbiAgICAgICAgbGV0IG5iRmlyc3QgPSAyNTtcbiAgICAgICAgbGV0IHRpbWVBZnRlciA9IDIwMDA7XG4gICAgICAgIGxldCB0b09ic2VydmUgPSB2YWx1ZXMuaXRlbXNcbiAgICAgICAgICAgIC5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoeyBpdGVtLCBpbmRleCB9KSlcbiAgICAgICAgICAgIC5maWx0ZXIoZSA9PiBlLml0ZW0ubWltZVR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpO1xuICAgICAgICBsZXQgbGF6eUltYWdlT2JzZXJ2ZXIgPSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKGVudHJpZXMsIG9ic2VydmVyKSB7XG4gICAgICAgICAgICBlbnRyaWVzLmZvckVhY2goZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsYXp5SW1hZ2UgPSBlbnRyeS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGxhenlJbWFnZS5zcmMgPSBsYXp5SW1hZ2UuZ2V0QXR0cmlidXRlKCdkYXRhLXNyYycpO1xuICAgICAgICAgICAgICAgICAgICBsYXp5SW1hZ2VPYnNlcnZlci51bm9ic2VydmUobGF6eUltYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRvT2JzZXJ2ZS5zbGljZSgwLCBuYkZpcnN0KS5mb3JFYWNoKGUgPT4gbGF6eUltYWdlT2JzZXJ2ZXIub2JzZXJ2ZShlbGVtZW50cy5pdGVtcy5jaGlsZHJlbi5pdGVtKGUuaW5kZXgpLmNoaWxkcmVuLml0ZW0oMCkpKTtcbiAgICAgICAgaWYgKHRvT2JzZXJ2ZS5sZW5ndGggPiBuYkZpcnN0KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0b09ic2VydmUuc2xpY2UobmJGaXJzdCkuZm9yRWFjaChlID0+IGxhenlJbWFnZU9ic2VydmVyLm9ic2VydmUoZWxlbWVudHMuaXRlbXMuY2hpbGRyZW4uaXRlbShlLmluZGV4KS5jaGlsZHJlbi5pdGVtKDApKSk7XG4gICAgICAgICAgICB9LCB0aW1lQWZ0ZXIpO1xuICAgICAgICB9XG4gICAgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RvcnktcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmZ1bmN0aW9uIGl0ZW1Ub0h0bWwoZikge1xuICAgIGlmIChmLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKVxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJvbmNsaWNrXCI+PGk+JHtmLm5hbWV9IC4uLjwvaT48L2Rpdj5gO1xuICAgIGVsc2UgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3JlZmVyZW5jZScpXG4gICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgZWxzZSBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcGxheWxpc3QnKVxuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJvbmNsaWNrXCI+PGk+JHtmLm5hbWV9IC4uLjwvaT48L2Rpdj5gO1xuICAgIGVsc2UgaWYgKGYubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpXG4gICAgICAgIHJldHVybiBgPGRpdiB4LWZvci1zaGE9XCIke2Yuc2hhICYmIGYuc2hhLnN1YnN0cigwLCA1KX1cIiBjbGFzcz1cIm9uY2xpY2tcIj4ke2YubmFtZX08L2Rpdj5gO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEgJiYgZi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPjxhIGhyZWY9XCIke1Jlc3QuZ2V0U2hhQ29udGVudFVybChmLnNoYSwgZi5taW1lVHlwZSwgZi5uYW1lLCB0cnVlLCBmYWxzZSl9XCIgdGFyZ2V0PVwiX2JsYW5rXCI+JHtmLm5hbWV9PC9hPiA8YSBjbGFzcz1cIngtaW5mby1kaXNwbGF5LWFjdGlvbiBtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIiBocmVmPVwiI1wiPmluZm88L2E+PC9kaXY+YDtcbn1cbmV4cG9ydHMuaXRlbVRvSHRtbCA9IGl0ZW1Ub0h0bWw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sLXNuaXBwZXRzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBNZXNzYWdlcyA9IHJlcXVpcmUoXCIuL21lc3NhZ2VzXCIpO1xuY29uc3QgTG9jYXRpb25zID0gcmVxdWlyZShcIi4vbG9jYXRpb25zXCIpO1xubGV0IGN1cnJlbnRVbnJvbGxlciA9IG51bGw7XG5sZXQgc2hvd25JdGVtID0gbnVsbDtcbmNvbnN0IHRlbXBsYXRlID0gYFxuICAgIDxkaXYgY2xhc3M9XCJ4LWltYWdlLWRldGFpbFwiPlxuICAgICAgICA8YSB4LWlkPVwiZG93bmxvYWRMaW5rXCI+PGltZyB4LWlkPVwiaW1hZ2VcIi8+PC9hPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJ0b29sYmFyXCI+XG4gICAgICAgIDxidXR0b24geC1pZD1cImluZm9cIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPkluZm88L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB4LWlkPVwicHJldmlvdXNcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPlByZXZpb3VzPC9idXR0b24+XG4gICAgICAgIDxidXR0b24geC1pZD1cImNsb3NlXCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIj5DbG9zZTwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHgtaWQ9XCJuZXh0XCIgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIj5OZXh0PC9idXR0b24+XG4gICAgICAgIDxidXR0b24geC1pZD1cImRpYXBvcmFtYVwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+RGlhcG88L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+YDtcbmNvbnN0IGVsZW1lbnQgPSB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlKTtcbmVsZW1lbnQuaW5mby5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoc2hvd25JdGVtKSB7XG4gICAgICAgIHN0b3BEaWFwb3JhbWEoKTtcbiAgICAgICAgTG9jYXRpb25zLmdvU2hhSW5mbyhzaG93bkl0ZW0pO1xuICAgIH1cbn0pO1xuZWxlbWVudC5wcmV2aW91cy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoY3VycmVudFVucm9sbGVyKSB7XG4gICAgICAgIGxldCBwcmV2aW91c0l0ZW0gPSBjdXJyZW50VW5yb2xsZXIucHJldmlvdXMoKTtcbiAgICAgICAgaWYgKHByZXZpb3VzSXRlbSlcbiAgICAgICAgICAgIHNob3dJbnRlcm5hbChwcmV2aW91c0l0ZW0pO1xuICAgIH1cbn0pO1xuZWxlbWVudC5uZXh0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIHNob3dOZXh0KCk7XG59KTtcbmZ1bmN0aW9uIHNob3dOZXh0KCkge1xuICAgIGlmIChjdXJyZW50VW5yb2xsZXIpIHtcbiAgICAgICAgbGV0IG5leHRJdGVtID0gY3VycmVudFVucm9sbGVyLm5leHQoKTtcbiAgICAgICAgaWYgKG5leHRJdGVtKVxuICAgICAgICAgICAgc2hvd0ludGVybmFsKG5leHRJdGVtKTtcbiAgICB9XG59XG5sZXQgZGlhcG9yYW1hVGltZXIgPSBudWxsO1xuZWxlbWVudC5kaWFwb3JhbWEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgaWYgKGRpYXBvcmFtYVRpbWVyKSB7XG4gICAgICAgIHN0b3BEaWFwb3JhbWEoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgU3RhcnQgZGlhcG9yYW1hYCwgMCk7XG4gICAgZGlhcG9yYW1hVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiBzaG93TmV4dCgpLCAyMDAwKTtcbiAgICBpZiAoY3VycmVudFVucm9sbGVyKSB7XG4gICAgICAgIGxldCBuZXh0SXRlbSA9IGN1cnJlbnRVbnJvbGxlci5uZXh0KCk7XG4gICAgICAgIGlmIChuZXh0SXRlbSlcbiAgICAgICAgICAgIHNob3dJbnRlcm5hbChuZXh0SXRlbSk7XG4gICAgfVxufSk7XG5mdW5jdGlvbiBzdG9wRGlhcG9yYW1hKCkge1xuICAgIGlmIChkaWFwb3JhbWFUaW1lcikge1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgRGlhcG9yYW1hIHN0b3BwZWRgLCAwKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbChkaWFwb3JhbWFUaW1lcik7XG4gICAgICAgIGRpYXBvcmFtYVRpbWVyID0gbnVsbDtcbiAgICB9XG59XG5lbGVtZW50LmNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIHN0b3BEaWFwb3JhbWEoKTtcbiAgICBjdXJyZW50VW5yb2xsZXIgPSBudWxsO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignaGVhZGVyJykuc3R5bGUuZGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICBpZiAoIWVsZW1lbnQucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIGVsZW1lbnQucm9vdC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQucm9vdCk7XG59KTtcbmZ1bmN0aW9uIHNob3coaXRlbSwgdW5yb2xsZXIpIHtcbiAgICBjdXJyZW50VW5yb2xsZXIgPSB1bnJvbGxlcjtcbiAgICBzaG93SW50ZXJuYWwoaXRlbSk7XG59XG5leHBvcnRzLnNob3cgPSBzaG93O1xuZnVuY3Rpb24gc2hvd0ludGVybmFsKGl0ZW0pIHtcbiAgICBzaG93bkl0ZW0gPSBpdGVtO1xuICAgIGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignaGVhZGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAoIWVsZW1lbnQucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbGVtZW50LnJvb3QpO1xuICAgIGVsZW1lbnQuaW1hZ2Uuc3JjID0gUmVzdC5nZXRTaGFJbWFnZU1lZGl1bVRodW1ibmFpbFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSk7XG4gICAgZWxlbWVudC5pbWFnZS5hbHQgPSBpdGVtLm5hbWU7XG4gICAgZWxlbWVudC5kb3dubG9hZExpbmsuaHJlZiA9IFJlc3QuZ2V0U2hhQ29udGVudFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSwgaXRlbS5uYW1lLCB0cnVlLCB0cnVlKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWltYWdlLWRldGFpbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1wYW5lbFwiKTtcbmNvbnN0IEF1ZGlvUGFuZWwgPSByZXF1aXJlKFwiLi9hdWRpby1wYW5lbFwiKTtcbmNvbnN0IERpcmVjdG9yeVBhbmVsID0gcmVxdWlyZShcIi4vZGlyZWN0b3J5LXBhbmVsXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBBdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbmNvbnN0IFRlbXBsYXRlcyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IE1pbWVUeXBlcyA9IHJlcXVpcmUoXCIuL21pbWUtdHlwZXMtbW9kdWxlXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IFNsaWRlc2hvdyA9IHJlcXVpcmUoXCIuL3NsaWRlc2hvd1wiKTtcbmNvbnN0IEluZm9QYW5lbCA9IHJlcXVpcmUoXCIuL2luZm8tcGFuZWxcIik7XG5jb25zdCBJbWFnZURldGFpbHMgPSByZXF1aXJlKFwiLi9pbWFnZS1kZXRhaWxcIik7XG5jb25zdCBMb2NhdGlvbnMgPSByZXF1aXJlKFwiLi9sb2NhdGlvbnNcIik7XG5jb25zdCBTZXR0aW5nc1BhbmVsID0gcmVxdWlyZShcIi4vc2V0dGluZ3MtcGFuZWxcIik7XG4vKlxuaGFzaCB1cmxzIDpcblxuLSAnJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIy8nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9tZVxuLSAnIy9zZWFyY2gvOnRlcm0gICAgICAgICAgICAgICAgICAgc2VhcmNoXG4tICcjL2RpcmVjdG9yaWVzLzpzaGE/bmFtZT14eHggICAgICBkaXJlY3Rvcnlcbi0gJyMvYnJvd3NlJ1xuLSAnIy9yZWZzLzpuYW1lJ1xuKi9cbmZ1bmN0aW9uIHBhcnNlVVJMKHVybCkge1xuICAgIHZhciBwYXJzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyksIHNlYXJjaE9iamVjdCA9IHt9LCBxdWVyaWVzLCBzcGxpdCwgaTtcbiAgICAvLyBMZXQgdGhlIGJyb3dzZXIgZG8gdGhlIHdvcmtcbiAgICBwYXJzZXIuaHJlZiA9IHVybDtcbiAgICAvLyBDb252ZXJ0IHF1ZXJ5IHN0cmluZyB0byBvYmplY3RcbiAgICBxdWVyaWVzID0gcGFyc2VyLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpLnNwbGl0KCcmJyk7XG4gICAgZm9yIChpID0gMDsgaSA8IHF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3BsaXQgPSBxdWVyaWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgIHNlYXJjaE9iamVjdFtzcGxpdFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQoc3BsaXRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRobmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHBhcnNlci5wYXRobmFtZSksXG4gICAgICAgIHNlYXJjaE9iamVjdDogc2VhcmNoT2JqZWN0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlYWRIYXNoQW5kQWN0KCkge1xuICAgIGxldCBoaWRlQXVkaW9KdWtlYm94ID0gZmFsc2U7XG4gICAgbGV0IGhpZGVJbmZvUGFuZWwgPSB0cnVlO1xuICAgIGxldCBzaG93U2VhcmNoID0gdHJ1ZTtcbiAgICBsZXQgc2hvd1NldHRpbmdzID0gZmFsc2U7XG4gICAgbGV0IGhhc2ggPSAnJztcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggJiYgd2luZG93LmxvY2F0aW9uLmhhc2guc3RhcnRzV2l0aCgnIycpKVxuICAgICAgICBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xuICAgIGxldCBwYXJzZWQgPSBwYXJzZVVSTChoYXNoKTtcbiAgICBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9zZWFyY2gvJykpIHtcbiAgICAgICAgc2VhcmNoSXRlbXMocGFyc2VkLnBhdGhuYW1lLnN1YnN0cignL3NlYXJjaC8nLmxlbmd0aCkpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUgPT0gJy9zZXR0aW5ncycpIHtcbiAgICAgICAgc2V0Q29udGVudChzZXR0aW5nc1BhbmVsLnJvb3QpO1xuICAgICAgICBzaG93U2VhcmNoID0gZmFsc2U7XG4gICAgICAgIHNob3dTZXR0aW5ncyA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvZGlyZWN0b3JpZXMvJykpIHtcbiAgICAgICAgY29uc3Qgc2hhID0gcGFyc2VkLnBhdGhuYW1lLnN1YnN0cmluZygnL2RpcmVjdG9yaWVzLycubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcnNlZC5zZWFyY2hPYmplY3QubmFtZSB8fCBzaGE7XG4gICAgICAgIGxvYWREaXJlY3Rvcnkoe1xuICAgICAgICAgICAgbGFzdFdyaXRlOiAwLFxuICAgICAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICAgICAgc2l6ZTogMCxcbiAgICAgICAgICAgIHNoYSxcbiAgICAgICAgICAgIG5hbWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZSA9PSAnL2Jyb3dzZScpIHtcbiAgICAgICAgbG9hZFJlZmVyZW5jZXMoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9yZWZzLycpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvcmVmcy8nLmxlbmd0aCk7XG4gICAgICAgIGxvYWRSZWZlcmVuY2UobmFtZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBhcnNlZC5wYXRobmFtZSA9PSAnL3BsYXlsaXN0cycpIHtcbiAgICAgICAgbG9hZFBsYXlsaXN0cygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL3BsYXlsaXN0cy8nKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyc2VkLnBhdGhuYW1lLnN1YnN0cmluZygnL3BsYXlsaXN0cy8nLmxlbmd0aCk7XG4gICAgICAgIGxvYWRQbGF5bGlzdChuYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lID09ICcvc2xpZGVzaG93Jykge1xuICAgICAgICBoaWRlQXVkaW9KdWtlYm94ID0gdHJ1ZTtcbiAgICAgICAgc2hvd1NsaWRlc2hvdygpO1xuICAgIH1cbiAgICBlbHNlIGlmIChwYXJzZWQucGF0aG5hbWUuc3RhcnRzV2l0aCgnL2luZm8vJykpIHtcbiAgICAgICAgaGlkZUluZm9QYW5lbCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpdGVtID0gSlNPTi5wYXJzZShwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvaW5mby8nLmxlbmd0aCkpO1xuICAgICAgICBzaG93SW5mbyhpdGVtKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGB1bmtvd24gcGF0aCAke3BhcnNlZC5wYXRobmFtZX1gKTtcbiAgICB9XG4gICAgaWYgKGhpZGVJbmZvUGFuZWwpXG4gICAgICAgIEluZm9QYW5lbC5oaWRlKCk7XG4gICAgc2hvd0lmKCFoaWRlQXVkaW9KdWtlYm94LCBhdWRpb1BhbmVsKTtcbiAgICBzaG93SWYoc2hvd1NlYXJjaCwgc2VhcmNoUGFuZWwpO1xuICAgIHNob3dJZihzaG93U2V0dGluZ3MsIHNldHRpbmdzUGFuZWwpO1xufVxuY29uc3Qgc2hvd0lmID0gKGNvbmRpdGlvbiwgcGFuZWwpID0+IHtcbiAgICBpZiAoY29uZGl0aW9uKVxuICAgICAgICBwYW5lbC5yb290LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpO1xuICAgIGVsc2VcbiAgICAgICAgcGFuZWwucm9vdC5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKTtcbn07XG52YXIgTW9kZTtcbihmdW5jdGlvbiAoTW9kZSkge1xuICAgIE1vZGVbTW9kZVtcIkF1ZGlvXCJdID0gMF0gPSBcIkF1ZGlvXCI7XG4gICAgTW9kZVtNb2RlW1wiSW1hZ2VcIl0gPSAxXSA9IFwiSW1hZ2VcIjtcbn0pKE1vZGUgfHwgKE1vZGUgPSB7fSkpO1xuY29uc3Qgc2V0dGluZ3NQYW5lbCA9IFNldHRpbmdzUGFuZWwuY3JlYXRlKCk7XG5jb25zdCBzZWFyY2hQYW5lbCA9IFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9QYW5lbCA9IEF1ZGlvUGFuZWwuYXVkaW9QYW5lbC5jcmVhdGUoKTtcbmNvbnN0IGF1ZGlvSnVrZWJveCA9IG5ldyBBdWRpb1BhbmVsLkF1ZGlvSnVrZWJveChhdWRpb1BhbmVsKTtcbmNvbnN0IGRpcmVjdG9yeVBhbmVsID0gRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuY3JlYXRlKCk7XG5sZXQgc2xpZGVzaG93ID0gbnVsbDtcbmxldCBsYXN0RGlzcGxheWVkRmlsZXMgPSBudWxsO1xubGV0IGxhc3RTZWFyY2hUZXJtID0gbnVsbDsgLy8gSEFDSyB2ZXJ5IHRlbXBvcmFyeVxubGV0IGFjdHVhbENvbnRlbnQgPSBudWxsO1xubGV0IGN1cnJlbnRNb2RlID0gTW9kZS5BdWRpbztcbmZ1bmN0aW9uIHNldENvbnRlbnQoY29udGVudCkge1xuICAgIGlmIChjb250ZW50ID09PSBhY3R1YWxDb250ZW50KVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudCAmJiBhY3R1YWxDb250ZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoYWN0dWFsQ29udGVudCk7XG4gICAgYWN0dWFsQ29udGVudCA9IGNvbnRlbnQ7XG4gICAgaWYgKGFjdHVhbENvbnRlbnQpXG4gICAgICAgIFVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKGNvbnRlbnQsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbn1cbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW9QYW5lbC5yb290KTtcblVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKHNlYXJjaFBhbmVsLnJvb3QsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbkF1dGguYXV0b1JlbmV3QXV0aCgpO1xuLyoqXG4gKiBXYWl0ZXIgdG9vbFxuICovXG5jb25zdCBiZWdpbldhaXQgPSAoY2FsbGJhY2spID0+IHtcbiAgICBsZXQgaXNEb25lID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCgoKSA9PiBpc0RvbmUgfHwgY2FsbGJhY2soKSwgNTAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgICAgICBpc0RvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4vKipcbiAqIEV2ZW50c1xuICovXG5mdW5jdGlvbiBiZWF1dGlmeU5hbWVzKGl0ZW1zKSB7XG4gICAgcmV0dXJuIGl0ZW1zLm1hcChmaWxlID0+IHtcbiAgICAgICAgaWYgKGZpbGUubWltZVR5cGUuc3RhcnRzV2l0aCgnYXVkaW8vJykpIHtcbiAgICAgICAgICAgIGxldCBkb3QgPSBmaWxlLm5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgICAgICAgIGlmIChkb3QpXG4gICAgICAgICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5uYW1lLnN1YnN0cmluZygwLCBkb3QpO1xuICAgICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5uYW1lLnJlcGxhY2UoLydfJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLycgICcvZywgJyAnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9bIF0qLVsgXSovZywgJyAtICcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gZ29TaGFJbmZvKGl0ZW0pIHtcbiAgICBMb2NhdGlvbnMuZ29TaGFJbmZvKGl0ZW0pO1xufVxuZnVuY3Rpb24gZ29TZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgY29uc3QgdXJsID0gYCMvc2VhcmNoLyR7dGVybX1gO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xufVxuZnVuY3Rpb24gZ29Mb2FkRGlyZWN0b3J5KHNoYSwgbmFtZSkge1xuICAgIGNvbnN0IHVybCA9IGAjL2RpcmVjdG9yaWVzLyR7c2hhfT9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGxhc3RTZWFyY2hUZXJtID8gKGxhc3RTZWFyY2hUZXJtICsgJy8nICsgbmFtZSkgOiBuYW1lKX1gO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xufVxuZnVuY3Rpb24gZ29SZWZlcmVuY2UobmFtZSkge1xuICAgIGNvbnN0IHVybCA9IGAjL3JlZnMvJHtuYW1lfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5mdW5jdGlvbiBnb1BsYXlsaXN0KG5hbWUpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGAjL3BsYXlsaXN0cy8ke25hbWV9YDtcbn1cbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaEl0ZW1zKHRlcm0pIHtcbiAgICBTZWFyY2hQYW5lbC5zZWFyY2hQYW5lbC5kaXNwbGF5VGl0bGUoc2VhcmNoUGFuZWwsIGZhbHNlKTtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBTdGlsbCBzZWFyY2hpbmcgJyR7dGVybX0nIC4uLmAsIDApKTtcbiAgICBsZXQgbWltZVR5cGUgPSAnJSc7XG4gICAgc3dpdGNoIChjdXJyZW50TW9kZSkge1xuICAgICAgICBjYXNlIE1vZGUuQXVkaW86XG4gICAgICAgICAgICBtaW1lVHlwZSA9ICdhdWRpby8lJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1vZGUuSW1hZ2U6XG4gICAgICAgICAgICBtaW1lVHlwZSA9ICdpbWFnZS8lJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBsZXQgcmVzID0gYXdhaXQgUmVzdC5zZWFyY2godGVybSwgbWltZVR5cGUpO1xuICAgIGlmICghcmVzKSB7XG4gICAgICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgRXJyb3Igb2NjdXJyZWQsIHJldHJ5IHBsZWFzZS4uLmAsIC0xKTtcbiAgICB9XG4gICAgLy8gZmlyc3QgZmlsZXMgdGhlbiBkaXJlY3Rvcmllc1xuICAgIHJlcy5pdGVtcyA9IHJlcy5pdGVtc1xuICAgICAgICAuZmlsdGVyKGkgPT4gaS5taW1lVHlwZSAhPSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JylcbiAgICAgICAgLmNvbmNhdChyZXMuaXRlbXMuZmlsdGVyKGkgPT4gaS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JykpO1xuICAgIHJlcy5pdGVtcyA9IGJlYXV0aWZ5TmFtZXMocmVzLml0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgc3dpdGNoIChjdXJyZW50TW9kZSkge1xuICAgICAgICBjYXNlIE1vZGUuQXVkaW86XG4gICAgICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRWYWx1ZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBgUmVzdWx0cyBmb3IgJyR7dGVybX0nYCxcbiAgICAgICAgICAgICAgICBpdGVtczogcmVzLml0ZW1zXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIE1vZGUuSW1hZ2U6XG4gICAgICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRJbWFnZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgICAgICAgICB0ZXJtOiB0ZXJtLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiByZXMuaXRlbXNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufVxuc2VhcmNoUGFuZWwuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBldmVudCA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgbGV0IHRlcm0gPSBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlO1xuICAgIHNlYXJjaFBhbmVsLnRlcm0uYmx1cigpO1xuICAgIGdvU2VhcmNoSXRlbXModGVybSk7XG59KTtcbmZ1bmN0aW9uIGdldE1pbWVUeXBlKGYpIHtcbiAgICBpZiAoZi5pc0RpcmVjdG9yeSlcbiAgICAgICAgcmV0dXJuICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknO1xuICAgIGxldCBwb3MgPSBmLm5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAocG9zID49IDApIHtcbiAgICAgICAgbGV0IGV4dGVuc2lvbiA9IGYubmFtZS5zdWJzdHIocG9zICsgMSkudG9Mb2NhbGVMb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGV4dGVuc2lvbiBpbiBNaW1lVHlwZXMuTWltZVR5cGVzKVxuICAgICAgICAgICAgcmV0dXJuIE1pbWVUeXBlcy5NaW1lVHlwZXNbZXh0ZW5zaW9uXTtcbiAgICB9XG4gICAgcmV0dXJuICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xufVxuZnVuY3Rpb24gZGlyZWN0b3J5RGVzY3JpcHRvclRvRmlsZURlc2NyaXB0b3IoZCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNoYTogZC5jb250ZW50U2hhLFxuICAgICAgICBuYW1lOiBkLm5hbWUsXG4gICAgICAgIG1pbWVUeXBlOiBnZXRNaW1lVHlwZShkKSxcbiAgICAgICAgbGFzdFdyaXRlOiBkLmxhc3RXcml0ZSxcbiAgICAgICAgc2l6ZTogZC5zaXplXG4gICAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWREaXJlY3RvcnkoaXRlbSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBpdGVtLm5hbWUpO1xuICAgIH0pO1xuICAgIGxldCBkaXJlY3RvcnlEZXNjcmlwdG9yID0gYXdhaXQgUmVzdC5nZXREaXJlY3RvcnlEZXNjcmlwdG9yKGl0ZW0uc2hhKTtcbiAgICBsZXQgaXRlbXMgPSBkaXJlY3RvcnlEZXNjcmlwdG9yLmZpbGVzLm1hcChkaXJlY3RvcnlEZXNjcmlwdG9yVG9GaWxlRGVzY3JpcHRvcik7XG4gICAgaXRlbXMgPSBiZWF1dGlmeU5hbWVzKGl0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9IGl0ZW0ubmFtZTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgIHN3aXRjaCAoY3VycmVudE1vZGUpIHtcbiAgICAgICAgY2FzZSBNb2RlLkF1ZGlvOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBNb2RlLkltYWdlOlxuICAgICAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0SW1hZ2VzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgICAgICAgICAgdGVybTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkUmVmZXJlbmNlcygpIHtcbiAgICBsZXQgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIFwiUmVmZXJlbmNlc1wiKTtcbiAgICB9KTtcbiAgICBsZXQgcmVmZXJlbmNlcyA9IGF3YWl0IFJlc3QuZ2V0UmVmZXJlbmNlcygpO1xuICAgIGxldCBpdGVtcyA9IHJlZmVyZW5jZXMubWFwKHJlZmVyZW5jZSA9PiAoe1xuICAgICAgICBuYW1lOiByZWZlcmVuY2UsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9yZWZlcmVuY2UnLFxuICAgICAgICBzaGE6IHJlZmVyZW5jZSxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSBpdGVtcztcbiAgICBsYXN0U2VhcmNoVGVybSA9ICcnO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0VmFsdWVzKGRpcmVjdG9yeVBhbmVsLCB7XG4gICAgICAgIG5hbWU6IFwiUmVmZXJlbmNlc1wiLFxuICAgICAgICBpdGVtc1xuICAgIH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gbG9hZFBsYXlsaXN0cygpIHtcbiAgICBsZXQgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIFwiUGxheWxpc3RzXCIpO1xuICAgIH0pO1xuICAgIGxldCByZWZlcmVuY2VzID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2VzKCk7XG4gICAgbGV0IHVzZXIgPSBhd2FpdCBBdXRoLm1lKCk7XG4gICAgY29uc3QgcHJlZml4ID0gYFBMVUdJTi1QTEFZTElTVFMtJHt1c2VyLnV1aWQudG9VcHBlckNhc2UoKX0tYDtcbiAgICBsZXQgaXRlbXMgPSByZWZlcmVuY2VzXG4gICAgICAgIC5maWx0ZXIocmVmZXJlbmNlID0+IHJlZmVyZW5jZS50b1VwcGVyQ2FzZSgpLnN0YXJ0c1dpdGgocHJlZml4KSlcbiAgICAgICAgLm1hcChyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnN1YnN0cihwcmVmaXgubGVuZ3RoKSlcbiAgICAgICAgLm1hcChyZWZlcmVuY2UgPT4gcmVmZXJlbmNlLnN1YnN0cigwLCAxKS50b1VwcGVyQ2FzZSgpICsgcmVmZXJlbmNlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAubWFwKHJlZmVyZW5jZSA9PiAoe1xuICAgICAgICBuYW1lOiByZWZlcmVuY2UsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9wbGF5bGlzdCcsXG4gICAgICAgIHNoYTogcmVmZXJlbmNlLFxuICAgICAgICBzaXplOiAwXG4gICAgfSkpO1xuICAgIGxhc3REaXNwbGF5ZWRGaWxlcyA9IGl0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gJyc7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRWYWx1ZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgbmFtZTogXCJQbGF5bGlzdHNcIixcbiAgICAgICAgaXRlbXNcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQbGF5bGlzdChuYW1lKSB7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoZGlyZWN0b3J5UGFuZWwucm9vdCk7XG4gICAgICAgIERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLnNldExvYWRpbmcoZGlyZWN0b3J5UGFuZWwsIGBQbGF5bGlzdCAnJHtuYW1lfSdgKTtcbiAgICB9KTtcbiAgICBsZXQgdXNlciA9IGF3YWl0IEF1dGgubWUoKTtcbiAgICBsZXQgcmVmZXJlbmNlID0gYXdhaXQgUmVzdC5nZXRSZWZlcmVuY2UoYFBMVUdJTi1QTEFZTElTVFMtJHt1c2VyLnV1aWQudG9VcHBlckNhc2UoKX0tJHtuYW1lLnRvVXBwZXJDYXNlKCl9YCk7XG4gICAgbGV0IGNvbW1pdCA9IGF3YWl0IFJlc3QuZ2V0Q29tbWl0KHJlZmVyZW5jZS5jdXJyZW50Q29tbWl0U2hhKTtcbiAgICB3YWl0aW5nLmRvbmUoKTtcbiAgICBhd2FpdCBsb2FkRGlyZWN0b3J5KHtcbiAgICAgICAgc2hhOiBjb21taXQuZGlyZWN0b3J5RGVzY3JpcHRvclNoYSxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknLFxuICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgIHNpemU6IDBcbiAgICB9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZWZlcmVuY2UobmFtZSkge1xuICAgIGNvbnN0IHdhaXRpbmcgPSBiZWdpbldhaXQoKCkgPT4ge1xuICAgICAgICBzZXRDb250ZW50KGRpcmVjdG9yeVBhbmVsLnJvb3QpO1xuICAgICAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRMb2FkaW5nKGRpcmVjdG9yeVBhbmVsLCBgUmVmZXJlbmNlICcke25hbWV9J2ApO1xuICAgIH0pO1xuICAgIGxldCByZWZlcmVuY2UgPSBhd2FpdCBSZXN0LmdldFJlZmVyZW5jZShuYW1lKTtcbiAgICBsZXQgY29tbWl0ID0gYXdhaXQgUmVzdC5nZXRDb21taXQocmVmZXJlbmNlLmN1cnJlbnRDb21taXRTaGEpO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIGF3YWl0IGxvYWREaXJlY3Rvcnkoe1xuICAgICAgICBzaGE6IGNvbW1pdC5kaXJlY3RvcnlEZXNjcmlwdG9yU2hhLFxuICAgICAgICBuYW1lLFxuICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgIGxhc3RXcml0ZTogMCxcbiAgICAgICAgc2l6ZTogMFxuICAgIH0pO1xufVxuZnVuY3Rpb24gaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCwgZXZlbnQpIHtcbiAgICBsZXQgaXRlbSA9IGxhc3REaXNwbGF5ZWRGaWxlc1tjaGlsZEluZGV4XTtcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygneC1pbmZvLWRpc3BsYXktYWN0aW9uJykpIHtcbiAgICAgICAgZ29TaGFJbmZvKGl0ZW0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCd4LWltYWdlLXpvb20tYWN0aW9uJykpIHtcbiAgICAgICAgbGV0IHVucm9sbGVkSXRlbXMgPSBsYXN0RGlzcGxheWVkRmlsZXM7XG4gICAgICAgIGxldCBjdXJyZW50UG9zaXRpb24gPSBjaGlsZEluZGV4O1xuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmV4dFBvc2l0aW9uID0gY3VycmVudFBvc2l0aW9uICsgZGlyZWN0aW9uO1xuICAgICAgICAgICAgd2hpbGUgKG5leHRQb3NpdGlvbiA+PSAwICYmIG5leHRQb3NpdGlvbiA8IHVucm9sbGVkSXRlbXMubGVuZ3RoICYmICF1bnJvbGxlZEl0ZW1zW25leHRQb3NpdGlvbl0ubWltZVR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpIHtcbiAgICAgICAgICAgICAgICBuZXh0UG9zaXRpb24gKz0gZGlyZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5leHRQb3NpdGlvbiA+PSAwICYmIG5leHRQb3NpdGlvbiA8IHVucm9sbGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bnJvbGxlZEl0ZW1zW25leHRQb3NpdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgSW1hZ2VEZXRhaWxzLnNob3coaXRlbSwge1xuICAgICAgICAgICAgbmV4dDogKCkgPT4gbmV4dFBvc2l0aW9uKDEpLFxuICAgICAgICAgICAgcHJldmlvdXM6ICgpID0+IG5leHRQb3NpdGlvbigtMSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSB7XG4gICAgICAgIGdvTG9hZERpcmVjdG9yeShpdGVtLnNoYSwgaXRlbS5uYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vcmVmZXJlbmNlJykge1xuICAgICAgICBnb1JlZmVyZW5jZShpdGVtLnNoYSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGl0ZW0ubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL3BsYXlsaXN0Jykge1xuICAgICAgICBnb1BsYXlsaXN0KGl0ZW0uc2hhKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICBhdWRpb0p1a2Vib3guYWRkQW5kUGxheShpdGVtKTtcbiAgICAgICAgLy8gc2V0IGFuIHVucm9sbGVyXG4gICAgICAgIGlmIChjaGlsZEluZGV4ID49IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRlcm0gPSBsYXN0U2VhcmNoVGVybTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxlZEl0ZW1zID0gbGFzdERpc3BsYXllZEZpbGVzLnNsaWNlKGNoaWxkSW5kZXggKyAxKS5maWx0ZXIoZiA9PiBmLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAodW5yb2xsZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRoZW4gJyR7dW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleF0ubmFtZS5zdWJzdHIoMCwgMjApfScgYW5kICR7dW5yb2xsZWRJdGVtcy5sZW5ndGggLSB1bnJvbGxJbmRleCAtIDF9IG90aGVyICcke3Rlcm19JyBpdGVtcy4uLmA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGZpbmlzaGVkICcke3Rlcm19IHNvbmdzYDtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiB1bnJvbGxlZEl0ZW1zW3Vucm9sbEluZGV4KytdLFxuICAgICAgICAgICAgICAgICAgICBoYXNOZXh0OiAoKSA9PiB1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNob3dTbGlkZXNob3coKSB7XG4gICAgaWYgKCFzbGlkZXNob3cpXG4gICAgICAgIHNsaWRlc2hvdyA9IFNsaWRlc2hvdy5jcmVhdGUoKTtcbiAgICBzZXRDb250ZW50KHNsaWRlc2hvdy5yb290KTtcbn1cbmZ1bmN0aW9uIHNob3dJbmZvKGl0ZW0pIHtcbiAgICBJbmZvUGFuZWwuc2hvdyhpdGVtKTtcbn1cbmRpcmVjdG9yeVBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIGRpcmVjdG9yeVBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihkaXJlY3RvcnlQYW5lbCwgZXZlbnQpO1xuICAgIGlmIChsYXN0RGlzcGxheWVkRmlsZXMgJiYgZWxlbWVudCA9PSBkaXJlY3RvcnlQYW5lbC5pdGVtcyAmJiBjaGlsZEluZGV4ID49IDAgJiYgY2hpbGRJbmRleCA8IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCwgZXZlbnQpO1xuICAgIH1cbn0pO1xuc2VhcmNoUGFuZWwuYXVkaW9Nb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGlmIChjdXJyZW50TW9kZSA9PSBNb2RlLkF1ZGlvKSB7XG4gICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBBdWRpbyBtb2RlIGFscmVhZHkgYWN0aXZhdGVkYCwgMCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgTWVzc2FnZXMuZGlzcGxheU1lc3NhZ2UoYEF1ZGlvIG1vZGUgYWN0aXZhdGVkYCwgMCk7XG4gICAgY3VycmVudE1vZGUgPSBNb2RlLkF1ZGlvO1xuICAgIHJlYWRIYXNoQW5kQWN0KCk7XG59KTtcbnNlYXJjaFBhbmVsLmltYWdlTW9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoY3VycmVudE1vZGUgPT0gTW9kZS5JbWFnZSkge1xuICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgSW1hZ2UgbW9kZSBhbHJlYWR5IGFjdGl2YXRlZGAsIDApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBJbWFnZSBtb2RlIGFjdGl2YXRlZGAsIDApO1xuICAgIGN1cnJlbnRNb2RlID0gTW9kZS5JbWFnZTtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xufSk7XG5yZWFkSGFzaEFuZEFjdCgpO1xud2luZG93Lm9ucG9wc3RhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZWFkSGFzaEFuZEFjdCgpO1xuICAgIC8qaWYgKGV2ZW50LnN0YXRlKSB7XG4gICAgICAgIGN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhID0gZXZlbnQuc3RhdGUuY3VycmVudERpcmVjdG9yeURlc2NyaXB0b3JTaGFcbiAgICAgICAgY3VycmVudENsaWVudElkID0gZXZlbnQuc3RhdGUuY3VycmVudENsaWVudElkXG4gICAgICAgIGN1cnJlbnRQaWN0dXJlSW5kZXggPSBldmVudC5zdGF0ZS5jdXJyZW50UGljdHVyZUluZGV4IHx8IDBcbiBcbiAgICAgICAgaWYgKCFjdXJyZW50Q2xpZW50SWQpXG4gICAgICAgICAgICBlbChcIiNtZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRkZW5cIilcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZyb21IYXNoKClcbiBcbiAgICAgICAgc3luY1VpKClcbiAgICB9Ki9cbn07XG5BdXRoLm1lKCkudGhlbih1c2VyID0+IFVpVG9vbC5lbCgndXNlci1pZCcpLmlubmVyVGV4dCA9IHVzZXIudXVpZCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IE1pbWVUeXBlcyA9IHJlcXVpcmUoXCIuL21pbWUtdHlwZXMtbW9kdWxlXCIpO1xuY29uc3QgS0IgPSAxMDI0O1xuY29uc3QgTUIgPSAxMDI0ICogS0I7XG5jb25zdCBHQiA9IDEwMjQgKiBNQjtcbmNvbnN0IFRCID0gMTAyNCAqIEdCO1xuZnVuY3Rpb24gZnJpZW5kbHlTaXplKHNpemUpIHtcbiAgICBpZiAoc2l6ZSA+IDIgKiBUQilcbiAgICAgICAgcmV0dXJuIGAkeyhzaXplIC8gVEIpLnRvRml4ZWQoMSl9IFRCYiAoJHtzaXplfSBieXRlcylgO1xuICAgIGlmIChzaXplID4gMiAqIEdCKVxuICAgICAgICByZXR1cm4gYCR7KHNpemUgLyBHQikudG9GaXhlZCgxKX0gR2IgKCR7c2l6ZX0gYnl0ZXMpYDtcbiAgICBpZiAoc2l6ZSA+IDIgKiBNQilcbiAgICAgICAgcmV0dXJuIGAkeyhzaXplIC8gTUIpLnRvRml4ZWQoMSl9IE1iICgke3NpemV9IGJ5dGVzKWA7XG4gICAgaWYgKHNpemUgPiAyICogS0IpXG4gICAgICAgIHJldHVybiBgJHsoc2l6ZSAvIEtCKS50b0ZpeGVkKDEpfSBrYiAoJHtzaXplfSBieXRlcylgO1xuICAgIGlmIChzaXplID4gMSlcbiAgICAgICAgcmV0dXJuIGAke3NpemV9IGJ5dGVzYDtcbiAgICBpZiAoc2l6ZSA9PSAxKVxuICAgICAgICByZXR1cm4gYDEgYnl0ZWA7XG4gICAgcmV0dXJuIGBlbXB0eWA7XG59XG5sZXQgaXNTaG93biA9IGZhbHNlO1xuY29uc3QgdGVtcGxhdGUgPSBgXG48ZGl2IGNsYXNzPVwibXVpLWNvbnRhaW5lclwiPlxuICAgIDxkaXYgY2xhc3M9J211aS1wYW5lbCc+XG4gICAgICAgIDxkaXYgeC1pZD1cInRpdGxlXCIgY2xhc3M9XCJtdWktLXRleHQtdGl0bGVcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1kaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXY+c2hhOiA8c3BhbiB4LWlkPSdzaGEnPjwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPGRpdj5zaXplOiA8c3BhbiB4LWlkPSdzaXplJz48L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXY+bWltZSB0eXBlOiA8c3BhbiB4LWlkPSdtaW1lVHlwZSc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdj48YSB4LWlkPVwiZG93bmxvYWRcIiBocmVmPVwiI1wiPmRvd25sb2FkIGxpbms8L2E+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2IHgtaWQ9XCJleHRyYXNcIj48L2Rpdj5cblxuICAgICAgICA8ZGl2Pm5hbWVzOiA8c3BhbiB4LWlkPSduYW1lcyc+PC9zcGFuPjwvZGl2PlxuICAgICAgICA8ZGl2PndyaXRlIGRhdGVzOiA8c3BhbiB4LWlkPSd3cml0ZURhdGVzJz48L3NwYW4+PC9kaXY+XG4gICAgICAgIDxkaXY+cGFyZW50czogPGRpdiB4LWlkPSdwYXJlbnRzJz48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdj5zb3VyY2VzOiA8ZGl2IHgtaWQ9J3NvdXJjZXMnPjwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2PmV4aWY6IDxkaXYgeC1pZD1cImV4aWZcIj48L2Rpdj48L2Rpdj5cbiAgICAgICAgPGRpdj5hdWRpbyBtZXRhZGF0YTogPGRpdiB4LWlkPVwiYXVkaW9NZXRhZGF0YVwiPjwvZGl2PjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5cbiAgICAgICAgPGRpdiB4LWlkPVwiY2xvc2VcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdCBtdWktYnRuLS1wcmltYXJ5XCI+Q2xvc2U8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5jb25zdCBjb250ZW50ID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSk7XG5jb25zdCBvcHRpb25zID0ge1xuICAgICdrZXlib2FyZCc6IGZhbHNlLFxuICAgICdzdGF0aWMnOiB0cnVlLFxuICAgICdvbmNsb3NlJzogZnVuY3Rpb24gKCkgeyB9XG59O1xuY29udGVudC5jbG9zZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBoaXN0b3J5LmJhY2soKTtcbn0pO1xuZnVuY3Rpb24gaGlkZSgpIHtcbiAgICBpZiAoIWlzU2hvd24pXG4gICAgICAgIHJldHVybjtcbiAgICBpc1Nob3duID0gZmFsc2U7XG4gICAgbXVpLm92ZXJsYXkoJ29mZicpO1xufVxuZXhwb3J0cy5oaWRlID0gaGlkZTtcbmZ1bmN0aW9uIHNob3coaXRlbSkge1xuICAgIGNvbnRlbnQudGl0bGUuaW5uZXJUZXh0ID0gYCR7aXRlbS5uYW1lfSBkZXRhaWxzYDtcbiAgICBjb250ZW50LnNoYS5pbm5lclRleHQgPSBpdGVtLnNoYTtcbiAgICBjb250ZW50Lm1pbWVUeXBlLmlubmVyVGV4dCA9IGl0ZW0ubWltZVR5cGU7XG4gICAgY29udGVudC5zaXplLmlubmVyVGV4dCA9IGZyaWVuZGx5U2l6ZShpdGVtLnNpemUpO1xuICAgIGxldCBmdWxsTmFtZSA9IGl0ZW0ubmFtZTtcbiAgICBsZXQgZXh0ZW5zaW9uID0gJy4nICsgTWltZVR5cGVzLmV4dGVuc2lvbkZyb21NaW1lVHlwZShpdGVtLm1pbWVUeXBlKTtcbiAgICBpZiAoIWZ1bGxOYW1lLmVuZHNXaXRoKGV4dGVuc2lvbikpXG4gICAgICAgIGZ1bGxOYW1lICs9IGV4dGVuc2lvbjtcbiAgICBjb250ZW50LmRvd25sb2FkLmhyZWYgPSBSZXN0LmdldFNoYUNvbnRlbnRVcmwoaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUsIGZ1bGxOYW1lLCB0cnVlLCB0cnVlKTtcbiAgICBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdpbWFnZS8nKSkge1xuICAgICAgICBjb250ZW50LmV4dHJhcy5pbm5lckhUTUwgPSBgPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiR7UmVzdC5nZXRTaGFDb250ZW50VXJsKGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlLCBpdGVtLm5hbWUsIHRydWUsIGZhbHNlKX1cIj48aW1nIHNyYz1cIiR7UmVzdC5nZXRTaGFJbWFnZVRodW1ibmFpbFVybChpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSl9XCIvPjwvYT48ZGl2IGNsYXNzPVwibXVpLWRpdmlkZXJcIj48L2Rpdj5gO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29udGVudC5leHRyYXMuaW5uZXJIVE1MID0gJyc7XG4gICAgfVxuICAgIGlmICghaXNTaG93bilcbiAgICAgICAgbXVpLm92ZXJsYXkoJ29uJywgb3B0aW9ucywgY29udGVudC5yb290KTtcbiAgICBpc1Nob3duID0gdHJ1ZTtcbiAgICBjb250ZW50Lm5hbWVzLmlubmVyVGV4dCA9IGAuLi5gO1xuICAgIGNvbnRlbnQud3JpdGVEYXRlcy5pbm5lclRleHQgPSBgLi4uYDtcbiAgICBjb250ZW50LnBhcmVudHMuaW5uZXJIVE1MID0gYC4uLmA7XG4gICAgY29udGVudC5zb3VyY2VzLmlubmVySFRNTCA9IGAuLi5gO1xuICAgIGNvbnRlbnQuZXhpZi5pbm5lckhUTUwgPSBgLi4uYDtcbiAgICBjb250ZW50LmF1ZGlvTWV0YWRhdGEuaW5uZXJIVE1MID0gYC4uLmA7XG4gICAgY29uc3QgbG9hZEluZm8gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBSZXN0LmdldFNoYUluZm8oaXRlbS5zaGEpO1xuICAgICAgICBpZiAoIWluZm8pIHtcbiAgICAgICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBDYW5ub3QgbG9hZCBkZXRhaWxlZCBpbmZvcm1hdGlvbi4uLmAsIC0xKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250ZW50Lm1pbWVUeXBlLmlubmVyVGV4dCA9IGluZm8ubWltZVR5cGVzLmpvaW4oJywgJyk7XG4gICAgICAgIGNvbnRlbnQubmFtZXMuaW5uZXJUZXh0ID0gaW5mby5uYW1lcy5qb2luKCcsICcpO1xuICAgICAgICBjb250ZW50LndyaXRlRGF0ZXMuaW5uZXJUZXh0ID0gaW5mby53cml0ZURhdGVzLm1hcChkID0+IG5ldyBEYXRlKGQgLyAxMDAwKS50b0RhdGVTdHJpbmcoKSkuam9pbignLCAnKTtcbiAgICAgICAgY29udGVudC5zaXplLmlubmVyVGV4dCA9IGluZm8uc2l6ZXMubWFwKGZyaWVuZGx5U2l6ZSkuam9pbignLCAnKTtcbiAgICAgICAgY29udGVudC5wYXJlbnRzLmlubmVySFRNTCA9IGluZm8ucGFyZW50cy5tYXAocCA9PiBgPGRpdj48YSBocmVmPVwiIy9kaXJlY3Rvcmllcy8ke3B9P25hbWU9JHtlbmNvZGVVUklDb21wb25lbnQoYCR7aXRlbS5uYW1lfSdzIHBhcmVudHNgKX1cIj4ke3B9PC9hPjwvZGl2PmApLmpvaW4oJycpO1xuICAgICAgICBjb250ZW50LnNvdXJjZXMuaW5uZXJIVE1MID0gaW5mby5zb3VyY2VzLm1hcChzID0+IGA8ZGl2PjxhIGhyZWY9XCIjL3JlZnMvJHtzfVwiPiR7c308L2E+PC9kaXY+YCkuam9pbignJyk7XG4gICAgICAgIGlmIChpbmZvLmV4aWZzICYmIGluZm8uZXhpZnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb250ZW50LmV4aWYuaW5uZXJIVE1MID0gYFxuICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cIm11aS10YWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+UHJvcGVydHk8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPlZhbHVlPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgICR7aW5mby5leGlmcy5tYXAoZXhpZiA9PiBPYmplY3QuZW50cmllcyhleGlmKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4gYDx0cj48dGQ+JHtrZXl9PC90ZD48dGQ+JHt2YWx1ZX08L3RkPjwvdHI+YCkuam9pbignJykpLmpvaW4oJycpfVxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgIDwvdGFibGU+YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQuZXhpZi5pbm5lckhUTUwgPSBgbm8gZXhpZiBkYXRhYDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5mby5hdWRpb01ldGFkYXRhICYmIGluZm8uYXVkaW9NZXRhZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXVkaW9NZXRhZGF0YS5pbm5lckhUTUwgPSBgPHByZT4ke0pTT04uc3RyaW5naWZ5KGluZm8uYXVkaW9NZXRhZGF0YSwgbnVsbCwgMil9PC9wcmU+YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQuYXVkaW9NZXRhZGF0YS5pbm5lckhUTUwgPSBgbm8gYXVkaW8gbWV0YWRhdGFgO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBsb2FkSW5mbygpO1xufVxuZXhwb3J0cy5zaG93ID0gc2hvdztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZm8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBnb1NoYUluZm8oaXRlbSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gYCMvaW5mby8ke2VuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShpdGVtKSl9YDtcbn1cbmV4cG9ydHMuZ29TaGFJbmZvID0gZ29TaGFJbmZvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bG9jYXRpb25zLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5sZXQgbWVzc2FnZXMgPSBbXTtcbmNvbnN0IHBvcHVwVGVtcGxhdGUgPSBgXG4gICAgPGRpdiB4LWlkPVwibWVzc2FnZXNcIj5cbiAgICA8L2Rpdj5gO1xubGV0IHBvcHVwID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZShwb3B1cFRlbXBsYXRlKTtcbmZ1bmN0aW9uIHJlZnJlc2goKSB7XG4gICAgcG9wdXAubWVzc2FnZXMuaW5uZXJIVE1MID0gbWVzc2FnZXMubWFwKG1lc3NhZ2UgPT4ge1xuICAgICAgICBsZXQgc3R5bGUgPSAnJztcbiAgICAgICAgaWYgKG1lc3NhZ2UuZmVlbGluZyA+IDApXG4gICAgICAgICAgICBzdHlsZSA9IGBiYWNrZ3JvdW5kLWNvbG9yOiAjNzBjYTg1OyBjb2xvcjogd2hpdGU7YDtcbiAgICAgICAgZWxzZSBpZiAobWVzc2FnZS5mZWVsaW5nIDwgMClcbiAgICAgICAgICAgIHN0eWxlID0gYGJhY2tncm91bmQtY29sb3I6ICNGNDQzMzY7IGNvbG9yOiB3aGl0ZTtgO1xuICAgICAgICByZXR1cm4gYDxkaXYgY2xhc3M9XCJtdWktcGFuZWwgeC1tZXNzYWdlLXBhbmVsXCIgc3R5bGU9XCIke3N0eWxlfVwiPiR7bWVzc2FnZS5odG1sfTwvZGl2PmA7XG4gICAgfSkuam9pbignJyk7XG59XG5mdW5jdGlvbiBkaXNwbGF5TWVzc2FnZShodG1sLCBmZWVsaW5nKSB7XG4gICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgIGh0bWwsXG4gICAgICAgIGZlZWxpbmdcbiAgICB9KTtcbiAgICByZWZyZXNoKCk7XG4gICAgaWYgKCFwb3B1cC5yb290LmlzQ29ubmVjdGVkKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHBvcHVwLnJvb3QpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBtZXNzYWdlcy5zaGlmdCgpO1xuICAgICAgICByZWZyZXNoKCk7XG4gICAgICAgIGlmICghbWVzc2FnZXMubGVuZ3RoKVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChwb3B1cC5yb290KTtcbiAgICB9LCA0MDAwKTtcbn1cbmV4cG9ydHMuZGlzcGxheU1lc3NhZ2UgPSBkaXNwbGF5TWVzc2FnZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lc3NhZ2VzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZXh0ZW5zaW9uRnJvbU1pbWVUeXBlKG1pbWVUeXBlKSB7XG4gICAgLy8gc3BlY2lhbCBjb21tb24gdHlwZXMgOlxuICAgIGlmIChtaW1lVHlwZSA9PSBcImF1ZGlvL21wZWdcIilcbiAgICAgICAgcmV0dXJuIFwibXAzXCI7XG4gICAgZm9yIChsZXQgW2V4dGVuc2lvbiwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGV4cG9ydHMuTWltZVR5cGVzKSkge1xuICAgICAgICBpZiAobWltZVR5cGUgPT0gdmFsdWUpXG4gICAgICAgICAgICByZXR1cm4gZXh0ZW5zaW9uO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydHMuZXh0ZW5zaW9uRnJvbU1pbWVUeXBlID0gZXh0ZW5zaW9uRnJvbU1pbWVUeXBlO1xuZXhwb3J0cy5NaW1lVHlwZXMgPSB7XG4gICAgXCIzZG1sXCI6IFwidGV4dC92bmQuaW4zZC4zZG1sXCIsXG4gICAgXCIzZHNcIjogXCJpbWFnZS94LTNkc1wiLFxuICAgIFwiM2cyXCI6IFwidmlkZW8vM2dwcDJcIixcbiAgICBcIjNncFwiOiBcInZpZGVvLzNncHBcIixcbiAgICBcIjd6XCI6IFwiYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkXCIsXG4gICAgXCJhYWJcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJhYWNcIjogXCJhdWRpby94LWFhY1wiLFxuICAgIFwiYWFtXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLW1hcFwiLFxuICAgIFwiYWFzXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLXNlZ1wiLFxuICAgIFwiYWJ3XCI6IFwiYXBwbGljYXRpb24veC1hYml3b3JkXCIsXG4gICAgXCJhY1wiOiBcImFwcGxpY2F0aW9uL3BraXgtYXR0ci1jZXJ0XCIsXG4gICAgXCJhY2NcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1lcmljYW5keW5hbWljcy5hY2NcIixcbiAgICBcImFjZVwiOiBcImFwcGxpY2F0aW9uL3gtYWNlLWNvbXByZXNzZWRcIixcbiAgICBcImFjdVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb2JvbFwiLFxuICAgIFwiYWN1dGNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ycFwiLFxuICAgIFwiYWRwXCI6IFwiYXVkaW8vYWRwY21cIixcbiAgICBcImFlcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hdWRpb2dyYXBoXCIsXG4gICAgXCJhZm1cIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcImFmcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJhaGVhZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5haGVhZC5zcGFjZVwiLFxuICAgIFwiYWlcIjogXCJhcHBsaWNhdGlvbi9wb3N0c2NyaXB0XCIsXG4gICAgXCJhaWZcIjogXCJhdWRpby94LWFpZmZcIixcbiAgICBcImFpZmNcIjogXCJhdWRpby94LWFpZmZcIixcbiAgICBcImFpZmZcIjogXCJhdWRpby94LWFpZmZcIixcbiAgICBcImFpclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5haXItYXBwbGljYXRpb24taW5zdGFsbGVyLXBhY2thZ2UremlwXCIsXG4gICAgXCJhaXRcIjogXCJhcHBsaWNhdGlvbi92bmQuZHZiLmFpdFwiLFxuICAgIFwiYW1pXCI6IFwiYXBwbGljYXRpb24vdm5kLmFtaWdhLmFtaVwiLFxuICAgIFwiYXBlXCI6IFwiYXVkaW8vYXBlXCIsXG4gICAgXCJhcGtcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmVcIixcbiAgICBcImFwcGNhY2hlXCI6IFwidGV4dC9jYWNoZS1tYW5pZmVzdFwiLFxuICAgIFwiYXBwbGljYXRpb25cIjogXCJhcHBsaWNhdGlvbi94LW1zLWFwcGxpY2F0aW9uXCIsXG4gICAgXCJhcHJcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtYXBwcm9hY2hcIixcbiAgICBcImFyY1wiOiBcImFwcGxpY2F0aW9uL3gtZnJlZWFyY1wiLFxuICAgIFwiYXNhXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNheFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiYXNjXCI6IFwiYXBwbGljYXRpb24vcGdwLXNpZ25hdHVyZVwiLFxuICAgIFwiYXNjeFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzZlwiOiBcInZpZGVvL3gtbXMtYXNmXCIsXG4gICAgXCJhc2h4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNtXCI6IFwidGV4dC94LWFzbVwiLFxuICAgIFwiYXNteFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmFzb1wiLFxuICAgIFwiYXNwXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNweFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImFzeFwiOiBcInZpZGVvL3gtbXMtYXNmXCIsXG4gICAgXCJhdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWN1Y29ycFwiLFxuICAgIFwiYXRvbVwiOiBcImFwcGxpY2F0aW9uL2F0b20reG1sXCIsXG4gICAgXCJhdG9tY2F0XCI6IFwiYXBwbGljYXRpb24vYXRvbWNhdCt4bWxcIixcbiAgICBcImF0b21zdmNcIjogXCJhcHBsaWNhdGlvbi9hdG9tc3ZjK3htbFwiLFxuICAgIFwiYXR4XCI6IFwiYXBwbGljYXRpb24vdm5kLmFudGl4LmdhbWUtY29tcG9uZW50XCIsXG4gICAgXCJhdVwiOiBcImF1ZGlvL2Jhc2ljXCIsXG4gICAgXCJhdmlcIjogXCJ2aWRlby94LW1zdmlkZW9cIixcbiAgICBcImF3XCI6IFwiYXBwbGljYXRpb24vYXBwbGl4d2FyZVwiLFxuICAgIFwiYXhkXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXpmXCI6IFwiYXBwbGljYXRpb24vdm5kLmFpcnppcC5maWxlc2VjdXJlLmF6ZlwiLFxuICAgIFwiYXpzXCI6IFwiYXBwbGljYXRpb24vdm5kLmFpcnppcC5maWxlc2VjdXJlLmF6c1wiLFxuICAgIFwiYXp3XCI6IFwiYXBwbGljYXRpb24vdm5kLmFtYXpvbi5lYm9va1wiLFxuICAgIFwiYmF0XCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJiY3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtYmNwaW9cIixcbiAgICBcImJkZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1iZGZcIixcbiAgICBcImJkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW5jbWwuZG0rd2J4bWxcIixcbiAgICBcImJlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWFsdm5jLmJlZFwiLFxuICAgIFwiYmgyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNwcnNcIixcbiAgICBcImJpblwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiYmxiXCI6IFwiYXBwbGljYXRpb24veC1ibG9yYlwiLFxuICAgIFwiYmxvcmJcIjogXCJhcHBsaWNhdGlvbi94LWJsb3JiXCIsXG4gICAgXCJibWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYm1pXCIsXG4gICAgXCJibXBcIjogXCJpbWFnZS9ibXBcIixcbiAgICBcImJvb2tcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJhbWVtYWtlclwiLFxuICAgIFwiYm94XCI6IFwiYXBwbGljYXRpb24vdm5kLnByZXZpZXdzeXN0ZW1zLmJveFwiLFxuICAgIFwiYm96XCI6IFwiYXBwbGljYXRpb24veC1iemlwMlwiLFxuICAgIFwiYnBrXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJidGlmXCI6IFwiaW1hZ2UvcHJzLmJ0aWZcIixcbiAgICBcImJ6XCI6IFwiYXBwbGljYXRpb24veC1iemlwXCIsXG4gICAgXCJiejJcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXAyXCIsXG4gICAgXCJjXCI6IFwidGV4dC94LWNcIixcbiAgICBcImMxMWFtY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnXCIsXG4gICAgXCJjMTFhbXpcIjogXCJhcHBsaWNhdGlvbi92bmQuY2x1ZXRydXN0LmNhcnRvbW9iaWxlLWNvbmZpZy1wa2dcIixcbiAgICBcImM0ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNGZcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRnXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNHVcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiY2FiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWNhYi1jb21wcmVzc2VkXCIsXG4gICAgXCJjYWZcIjogXCJhdWRpby94LWNhZlwiLFxuICAgIFwiY2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwiY2FyXCI6IFwiYXBwbGljYXRpb24vdm5kLmN1cmwuY2FyXCIsXG4gICAgXCJjYXRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcGtpLnNlY2NhdFwiLFxuICAgIFwiY2I3XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNiYVwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnJcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2J0XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNielwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjY1wiOiBcInRleHQveC1jXCIsXG4gICAgXCJjY3RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjY3htbFwiOiBcImFwcGxpY2F0aW9uL2NjeG1sK3htbFwiLFxuICAgIFwiY2RiY21zZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jb250YWN0LmNtc2dcIixcbiAgICBcImNkZlwiOiBcImFwcGxpY2F0aW9uL3gtbmV0Y2RmXCIsXG4gICAgXCJjZGtleVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZWRpYXN0YXRpb24uY2RrZXlcIixcbiAgICBcImNkbWlhXCI6IFwiYXBwbGljYXRpb24vY2RtaS1jYXBhYmlsaXR5XCIsXG4gICAgXCJjZG1pY1wiOiBcImFwcGxpY2F0aW9uL2NkbWktY29udGFpbmVyXCIsXG4gICAgXCJjZG1pZFwiOiBcImFwcGxpY2F0aW9uL2NkbWktZG9tYWluXCIsXG4gICAgXCJjZG1pb1wiOiBcImFwcGxpY2F0aW9uL2NkbWktb2JqZWN0XCIsXG4gICAgXCJjZG1pcVwiOiBcImFwcGxpY2F0aW9uL2NkbWktcXVldWVcIixcbiAgICBcImNkeFwiOiBcImNoZW1pY2FsL3gtY2R4XCIsXG4gICAgXCJjZHhtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jaGVtZHJhdyt4bWxcIixcbiAgICBcImNkeVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jaW5kZXJlbGxhXCIsXG4gICAgXCJjZXJcIjogXCJhcHBsaWNhdGlvbi9wa2l4LWNlcnRcIixcbiAgICBcImNmY1wiOiBcImFwcGxpY2F0aW9uL3gtY29sZGZ1c2lvblwiLFxuICAgIFwiY2ZtXCI6IFwiYXBwbGljYXRpb24veC1jb2xkZnVzaW9uXCIsXG4gICAgXCJjZnNcIjogXCJhcHBsaWNhdGlvbi94LWNmcy1jb21wcmVzc2VkXCIsXG4gICAgXCJjZ21cIjogXCJpbWFnZS9jZ21cIixcbiAgICBcImNoYXRcIjogXCJhcHBsaWNhdGlvbi94LWNoYXRcIixcbiAgICBcImNobVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1odG1saGVscFwiLFxuICAgIFwiY2hydFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2NoYXJ0XCIsXG4gICAgXCJjaWZcIjogXCJjaGVtaWNhbC94LWNpZlwiLFxuICAgIFwiY2lpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuc2VyLXdlYi1jZXJ0aWZpY2F0ZS1pc3N1ZS1pbml0aWF0aW9uXCIsXG4gICAgXCJjaWxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtYXJ0Z2FscnlcIixcbiAgICBcImNsYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbGF5bW9yZVwiLFxuICAgIFwiY2xhc3NcIjogXCJhcHBsaWNhdGlvbi9qYXZhLXZtXCIsXG4gICAgXCJjbGtrXCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIua2V5Ym9hcmRcIixcbiAgICBcImNsa3BcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5wYWxldHRlXCIsXG4gICAgXCJjbGt0XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXIudGVtcGxhdGVcIixcbiAgICBcImNsa3dcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci53b3JkYmFua1wiLFxuICAgIFwiY2xreFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyXCIsXG4gICAgXCJjbHBcIjogXCJhcHBsaWNhdGlvbi94LW1zY2xpcFwiLFxuICAgIFwiY21jXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvc21vY2FsbGVyXCIsXG4gICAgXCJjbWRmXCI6IFwiY2hlbWljYWwveC1jbWRmXCIsXG4gICAgXCJjbWxcIjogXCJjaGVtaWNhbC94LWNtbFwiLFxuICAgIFwiY21wXCI6IFwiYXBwbGljYXRpb24vdm5kLnllbGxvd3JpdmVyLWN1c3RvbS1tZW51XCIsXG4gICAgXCJjbXhcIjogXCJpbWFnZS94LWNteFwiLFxuICAgIFwiY29kXCI6IFwiYXBwbGljYXRpb24vdm5kLnJpbS5jb2RcIixcbiAgICBcImNvbVwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiY29uZlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImNwaW9cIjogXCJhcHBsaWNhdGlvbi94LWNwaW9cIixcbiAgICBcImNwcFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJjcHRcIjogXCJhcHBsaWNhdGlvbi9tYWMtY29tcGFjdHByb1wiLFxuICAgIFwiY3JkXCI6IFwiYXBwbGljYXRpb24veC1tc2NhcmRmaWxlXCIsXG4gICAgXCJjcmxcIjogXCJhcHBsaWNhdGlvbi9wa2l4LWNybFwiLFxuICAgIFwiY3J0XCI6IFwiYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcIixcbiAgICBcImNyeFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiY3J5cHRvbm90ZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yaWcuY3J5cHRvbm90ZVwiLFxuICAgIFwiY3NcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJjc2hcIjogXCJhcHBsaWNhdGlvbi94LWNzaFwiLFxuICAgIFwiY3NtbFwiOiBcImNoZW1pY2FsL3gtY3NtbFwiLFxuICAgIFwiY3NwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvbW1vbnNwYWNlXCIsXG4gICAgXCJjc3NcIjogXCJ0ZXh0L2Nzc1wiLFxuICAgIFwiY3N0XCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiY3N2XCI6IFwidGV4dC9jc3ZcIixcbiAgICBcImN1XCI6IFwiYXBwbGljYXRpb24vY3Utc2VlbWVcIixcbiAgICBcImN1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsXCIsXG4gICAgXCJjd3dcIjogXCJhcHBsaWNhdGlvbi9wcnMuY3d3XCIsXG4gICAgXCJjeHRcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjeHhcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiZGFlXCI6IFwibW9kZWwvdm5kLmNvbGxhZGEreG1sXCIsXG4gICAgXCJkYWZcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLmRhZlwiLFxuICAgIFwiZGFydFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kYXJ0XCIsXG4gICAgXCJkYXRhbGVzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLnNlZWRcIixcbiAgICBcImRhdm1vdW50XCI6IFwiYXBwbGljYXRpb24vZGF2bW91bnQreG1sXCIsXG4gICAgXCJkYmtcIjogXCJhcHBsaWNhdGlvbi9kb2Nib29rK3htbFwiLFxuICAgIFwiZGNyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZGN1cmxcIjogXCJ0ZXh0L3ZuZC5jdXJsLmRjdXJsXCIsXG4gICAgXCJkZDJcIjogXCJhcHBsaWNhdGlvbi92bmQub21hLmRkMit4bWxcIixcbiAgICBcImRkZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZGRkXCIsXG4gICAgXCJkZWJcIjogXCJhcHBsaWNhdGlvbi94LWRlYmlhbi1wYWNrYWdlXCIsXG4gICAgXCJkZWZcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJkZXBsb3lcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRlclwiOiBcImFwcGxpY2F0aW9uL3gteDUwOS1jYS1jZXJ0XCIsXG4gICAgXCJkZmFjXCI6IFwiYXBwbGljYXRpb24vdm5kLmRyZWFtZmFjdG9yeVwiLFxuICAgIFwiZGdjXCI6IFwiYXBwbGljYXRpb24veC1kZ2MtY29tcHJlc3NlZFwiLFxuICAgIFwiZGljXCI6IFwidGV4dC94LWNcIixcbiAgICBcImRpclwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImRpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGlzXCIsXG4gICAgXCJkaXN0XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkaXN0elwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGp2XCI6IFwiaW1hZ2Uvdm5kLmRqdnVcIixcbiAgICBcImRqdnVcIjogXCJpbWFnZS92bmQuZGp2dVwiLFxuICAgIFwiZGxsXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJkbWdcIjogXCJhcHBsaWNhdGlvbi94LWFwcGxlLWRpc2tpbWFnZVwiLFxuICAgIFwiZG1wXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwiZG1zXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkbmFcIjogXCJhcHBsaWNhdGlvbi92bmQuZG5hXCIsXG4gICAgXCJkb2NcIjogXCJhcHBsaWNhdGlvbi9tc3dvcmRcIixcbiAgICBcImRvY21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29yZC5kb2N1bWVudC5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcImRvY3hcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudFwiLFxuICAgIFwiZG90XCI6IFwiYXBwbGljYXRpb24vbXN3b3JkXCIsXG4gICAgXCJkb3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJkb3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwudGVtcGxhdGVcIixcbiAgICBcImRwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2kuZHBcIixcbiAgICBcImRwZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcGdyYXBoXCIsXG4gICAgXCJkcmFcIjogXCJhdWRpby92bmQuZHJhXCIsXG4gICAgXCJkc2NcIjogXCJ0ZXh0L3Bycy5saW5lcy50YWdcIixcbiAgICBcImRzc2NcIjogXCJhcHBsaWNhdGlvbi9kc3NjK2RlclwiLFxuICAgIFwiZHRiXCI6IFwiYXBwbGljYXRpb24veC1kdGJvb2sreG1sXCIsXG4gICAgXCJkdGRcIjogXCJhcHBsaWNhdGlvbi94bWwtZHRkXCIsXG4gICAgXCJkdHNcIjogXCJhdWRpby92bmQuZHRzXCIsXG4gICAgXCJkdHNoZFwiOiBcImF1ZGlvL3ZuZC5kdHMuaGRcIixcbiAgICBcImR1bXBcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImR2YlwiOiBcInZpZGVvL3ZuZC5kdmIuZmlsZVwiLFxuICAgIFwiZHZpXCI6IFwiYXBwbGljYXRpb24veC1kdmlcIixcbiAgICBcImR3ZlwiOiBcIm1vZGVsL3ZuZC5kd2ZcIixcbiAgICBcImR3Z1wiOiBcImltYWdlL3ZuZC5kd2dcIixcbiAgICBcImR4ZlwiOiBcImltYWdlL3ZuZC5keGZcIixcbiAgICBcImR4cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zcG90ZmlyZS5keHBcIixcbiAgICBcImR4clwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImVjZWxwNDgwMFwiOiBcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDQ4MDBcIixcbiAgICBcImVjZWxwNzQ3MFwiOiBcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDc0NzBcIixcbiAgICBcImVjZWxwOTYwMFwiOiBcImF1ZGlvL3ZuZC5udWVyYS5lY2VscDk2MDBcIixcbiAgICBcImVjbWFcIjogXCJhcHBsaWNhdGlvbi9lY21hc2NyaXB0XCIsXG4gICAgXCJlZG1cIjogXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZWRtXCIsXG4gICAgXCJlZHhcIjogXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZWR4XCIsXG4gICAgXCJlZmlmXCI6IFwiYXBwbGljYXRpb24vdm5kLnBpY3NlbFwiLFxuICAgIFwiZWk2XCI6IFwiYXBwbGljYXRpb24vdm5kLnBnLm9zYXNsaVwiLFxuICAgIFwiZWxjXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJlbWZcIjogXCJhcHBsaWNhdGlvbi94LW1zbWV0YWZpbGVcIixcbiAgICBcImVtbFwiOiBcIm1lc3NhZ2UvcmZjODIyXCIsXG4gICAgXCJlbW1hXCI6IFwiYXBwbGljYXRpb24vZW1tYSt4bWxcIixcbiAgICBcImVtelwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwiZW9sXCI6IFwiYXVkaW8vdm5kLmRpZ2l0YWwtd2luZHNcIixcbiAgICBcImVvdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1mb250b2JqZWN0XCIsXG4gICAgXCJlcHNcIjogXCJhcHBsaWNhdGlvbi9wb3N0c2NyaXB0XCIsXG4gICAgXCJlcHViXCI6IFwiYXBwbGljYXRpb24vZXB1Yit6aXBcIixcbiAgICBcImVzM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lc3ppZ25vMyt4bWxcIixcbiAgICBcImVzYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vc2dpLnN1YnN5c3RlbVwiLFxuICAgIFwiZXNmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLmVzZlwiLFxuICAgIFwiZXQzXCI6IFwiYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFwiLFxuICAgIFwiZXR4XCI6IFwidGV4dC94LXNldGV4dFwiLFxuICAgIFwiZXZhXCI6IFwiYXBwbGljYXRpb24veC1ldmFcIixcbiAgICBcImV2eVwiOiBcImFwcGxpY2F0aW9uL3gtZW52b3lcIixcbiAgICBcImV4ZVwiOiBcImFwcGxpY2F0aW9uL3gtbXNkb3dubG9hZFwiLFxuICAgIFwiZXhpXCI6IFwiYXBwbGljYXRpb24vZXhpXCIsXG4gICAgXCJleHRcIjogXCJhcHBsaWNhdGlvbi92bmQubm92YWRpZ20uZXh0XCIsXG4gICAgXCJlelwiOiBcImFwcGxpY2F0aW9uL2FuZHJldy1pbnNldFwiLFxuICAgIFwiZXoyXCI6IFwiYXBwbGljYXRpb24vdm5kLmV6cGl4LWFsYnVtXCIsXG4gICAgXCJlejNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXpwaXgtcGFja2FnZVwiLFxuICAgIFwiZlwiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmNHZcIjogXCJ2aWRlby94LWY0dlwiLFxuICAgIFwiZjc3XCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImY5MFwiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmYnNcIjogXCJpbWFnZS92bmQuZmFzdGJpZHNoZWV0XCIsXG4gICAgXCJmY2R0XCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZvcm1zY2VudHJhbC5mY2R0XCIsXG4gICAgXCJmY3NcIjogXCJhcHBsaWNhdGlvbi92bmQuaXNhYy5mY3NcIixcbiAgICBcImZkZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZGZcIixcbiAgICBcImZlX2xhdW5jaFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZW5vdm8uZmNzZWxheW91dC1saW5rXCIsXG4gICAgXCJmZzVcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c2dwXCIsXG4gICAgXCJmZ2RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJmaFwiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoNFwiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoNVwiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoN1wiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZoY1wiOiBcImltYWdlL3gtZnJlZWhhbmRcIixcbiAgICBcImZpZ1wiOiBcImFwcGxpY2F0aW9uL3gteGZpZ1wiLFxuICAgIFwiZmxhY1wiOiBcImF1ZGlvL3gtZmxhY1wiLFxuICAgIFwiZmxpXCI6IFwidmlkZW8veC1mbGlcIixcbiAgICBcImZsb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5taWNyb2dyYWZ4LmZsb1wiLFxuICAgIFwiZmx2XCI6IFwidmlkZW8veC1mbHZcIixcbiAgICBcImZsd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2l2aW9cIixcbiAgICBcImZseFwiOiBcInRleHQvdm5kLmZtaS5mbGV4c3RvclwiLFxuICAgIFwiZmx5XCI6IFwidGV4dC92bmQuZmx5XCIsXG4gICAgXCJmbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJmbmNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5mbmNcIixcbiAgICBcImZvclwiOiBcInRleHQveC1mb3J0cmFuXCIsXG4gICAgXCJmcHhcIjogXCJpbWFnZS92bmQuZnB4XCIsXG4gICAgXCJmcmFtZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJmc2NcIjogXCJhcHBsaWNhdGlvbi92bmQuZnNjLndlYmxhdW5jaFwiLFxuICAgIFwiZnN0XCI6IFwiaW1hZ2Uvdm5kLmZzdFwiLFxuICAgIFwiZnRjXCI6IFwiYXBwbGljYXRpb24vdm5kLmZsdXh0aW1lLmNsaXBcIixcbiAgICBcImZ0aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbnNlci13ZWItZnVuZHMtdHJhbnNmZXItaW5pdGlhdGlvblwiLFxuICAgIFwiZnZ0XCI6IFwidmlkZW8vdm5kLmZ2dFwiLFxuICAgIFwiZnhwXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFwiLFxuICAgIFwiZnhwbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5meHBcIixcbiAgICBcImZ6c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdXp6eXNoZWV0XCIsXG4gICAgXCJnMndcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvcGxhblwiLFxuICAgIFwiZzNcIjogXCJpbWFnZS9nM2ZheFwiLFxuICAgIFwiZzN3XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb3NwYWNlXCIsXG4gICAgXCJnYWNcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWFjY291bnRcIixcbiAgICBcImdhbVwiOiBcImFwcGxpY2F0aW9uL3gtdGFkc1wiLFxuICAgIFwiZ2JyXCI6IFwiYXBwbGljYXRpb24vcnBraS1naG9zdGJ1c3RlcnNcIixcbiAgICBcImdjYVwiOiBcImFwcGxpY2F0aW9uL3gtZ2NhLWNvbXByZXNzZWRcIixcbiAgICBcImdkbFwiOiBcIm1vZGVsL3ZuZC5nZGxcIixcbiAgICBcImdlb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5keW5hZ2VvXCIsXG4gICAgXCJnZXhcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbWV0cnktZXhwbG9yZXJcIixcbiAgICBcImdnYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9nZWJyYS5maWxlXCIsXG4gICAgXCJnZ3RcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvZ2VicmEudG9vbFwiLFxuICAgIFwiZ2hmXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1oZWxwXCIsXG4gICAgXCJnaWZcIjogXCJpbWFnZS9naWZcIixcbiAgICBcImdpbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaWRlbnRpdHktbWVzc2FnZVwiLFxuICAgIFwiZ21sXCI6IFwiYXBwbGljYXRpb24vZ21sK3htbFwiLFxuICAgIFwiZ214XCI6IFwiYXBwbGljYXRpb24vdm5kLmdteFwiLFxuICAgIFwiZ251bWVyaWNcIjogXCJhcHBsaWNhdGlvbi94LWdudW1lcmljXCIsXG4gICAgXCJncGhcIjogXCJhcHBsaWNhdGlvbi92bmQuZmxvZ3JhcGhpdFwiLFxuICAgIFwiZ3B4XCI6IFwiYXBwbGljYXRpb24vZ3B4K3htbFwiLFxuICAgIFwiZ3FmXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyYWZlcVwiLFxuICAgIFwiZ3FzXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyYWZlcVwiLFxuICAgIFwiZ3JhbVwiOiBcImFwcGxpY2F0aW9uL3NyZ3NcIixcbiAgICBcImdyYW1wc1wiOiBcImFwcGxpY2F0aW9uL3gtZ3JhbXBzLXhtbFwiLFxuICAgIFwiZ3JlXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb21ldHJ5LWV4cGxvcmVyXCIsXG4gICAgXCJncnZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWluamVjdG9yXCIsXG4gICAgXCJncnhtbFwiOiBcImFwcGxpY2F0aW9uL3NyZ3MreG1sXCIsXG4gICAgXCJnc2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtZ2hvc3RzY3JpcHRcIixcbiAgICBcImd0YXJcIjogXCJhcHBsaWNhdGlvbi94LWd0YXJcIixcbiAgICBcImd0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdG9vbC1tZXNzYWdlXCIsXG4gICAgXCJndHdcIjogXCJtb2RlbC92bmQuZ3R3XCIsXG4gICAgXCJndlwiOiBcInRleHQvdm5kLmdyYXBodml6XCIsXG4gICAgXCJneGZcIjogXCJhcHBsaWNhdGlvbi9neGZcIixcbiAgICBcImd4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9uZXh0XCIsXG4gICAgXCJnelwiOiBcImFwcGxpY2F0aW9uL3gtZ3ppcFwiLFxuICAgIFwiaFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJoMjYxXCI6IFwidmlkZW8vaDI2MVwiLFxuICAgIFwiaDI2M1wiOiBcInZpZGVvL2gyNjNcIixcbiAgICBcImgyNjRcIjogXCJ2aWRlby9oMjY0XCIsXG4gICAgXCJoYWxcIjogXCJhcHBsaWNhdGlvbi92bmQuaGFsK3htbFwiLFxuICAgIFwiaGJjaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYmNpXCIsXG4gICAgXCJoZGZcIjogXCJhcHBsaWNhdGlvbi94LWhkZlwiLFxuICAgIFwiaGhcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiaGxwXCI6IFwiYXBwbGljYXRpb24vd2luaGxwXCIsXG4gICAgXCJocGdsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWhwZ2xcIixcbiAgICBcImhwaWRcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBpZFwiLFxuICAgIFwiaHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWhwc1wiLFxuICAgIFwiaHF4XCI6IFwiYXBwbGljYXRpb24vbWFjLWJpbmhleDQwXCIsXG4gICAgXCJodGFcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImh0Y1wiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHRrZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZW5hbWVhYXBwXCIsXG4gICAgXCJodG1cIjogXCJ0ZXh0L2h0bWxcIixcbiAgICBcImh0bWxcIjogXCJ0ZXh0L2h0bWxcIixcbiAgICBcImh2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtZGljXCIsXG4gICAgXCJodnBcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LXZvaWNlXCIsXG4gICAgXCJodnNcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLmh2LXNjcmlwdFwiLFxuICAgIFwiaTJnXCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyZ2VvXCIsXG4gICAgXCJpY2NcIjogXCJhcHBsaWNhdGlvbi92bmQuaWNjcHJvZmlsZVwiLFxuICAgIFwiaWNlXCI6IFwieC1jb25mZXJlbmNlL3gtY29vbHRhbGtcIixcbiAgICBcImljbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pY2Nwcm9maWxlXCIsXG4gICAgXCJpY29cIjogXCJpbWFnZS94LWljb25cIixcbiAgICBcImljc1wiOiBcInRleHQvY2FsZW5kYXJcIixcbiAgICBcImllZlwiOiBcImltYWdlL2llZlwiLFxuICAgIFwiaWZiXCI6IFwidGV4dC9jYWxlbmRhclwiLFxuICAgIFwiaWZtXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLmZvcm1kYXRhXCIsXG4gICAgXCJpZ2VzXCI6IFwibW9kZWwvaWdlc1wiLFxuICAgIFwiaWdsXCI6IFwiYXBwbGljYXRpb24vdm5kLmlnbG9hZGVyXCIsXG4gICAgXCJpZ21cIjogXCJhcHBsaWNhdGlvbi92bmQuaW5zb3JzLmlnbVwiLFxuICAgIFwiaWdzXCI6IFwibW9kZWwvaWdlc1wiLFxuICAgIFwiaWd4XCI6IFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguaWd4XCIsXG4gICAgXCJpaWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuaW50ZXJjaGFuZ2VcIixcbiAgICBcImltcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY2NwYWMuc2ltcGx5LmltcFwiLFxuICAgIFwiaW1zXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWltc1wiLFxuICAgIFwiaW5cIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJpbmlcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJpbmtcIjogXCJhcHBsaWNhdGlvbi9pbmttbCt4bWxcIixcbiAgICBcImlua21sXCI6IFwiYXBwbGljYXRpb24vaW5rbWwreG1sXCIsXG4gICAgXCJpbnN0YWxsXCI6IFwiYXBwbGljYXRpb24veC1pbnN0YWxsLWluc3RydWN0aW9uc1wiLFxuICAgIFwiaW90YVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hc3RyYWVhLXNvZnR3YXJlLmlvdGFcIixcbiAgICBcImlwYVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiaXBmaXhcIjogXCJhcHBsaWNhdGlvbi9pcGZpeFwiLFxuICAgIFwiaXBrXCI6IFwiYXBwbGljYXRpb24vdm5kLnNoYW5hLmluZm9ybWVkLnBhY2thZ2VcIixcbiAgICBcImlybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ucmlnaHRzLW1hbmFnZW1lbnRcIixcbiAgICBcImlycFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcmVwb3NpdG9yeS5wYWNrYWdlK3htbFwiLFxuICAgIFwiaXNvXCI6IFwiYXBwbGljYXRpb24veC1pc285NjYwLWltYWdlXCIsXG4gICAgXCJpdHBcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuZm9ybXRlbXBsYXRlXCIsXG4gICAgXCJpdnBcIjogXCJhcHBsaWNhdGlvbi92bmQuaW1tZXJ2aXNpb24taXZwXCIsXG4gICAgXCJpdnVcIjogXCJhcHBsaWNhdGlvbi92bmQuaW1tZXJ2aXNpb24taXZ1XCIsXG4gICAgXCJqYWRcIjogXCJ0ZXh0L3ZuZC5zdW4uajJtZS5hcHAtZGVzY3JpcHRvclwiLFxuICAgIFwiamFtXCI6IFwiYXBwbGljYXRpb24vdm5kLmphbVwiLFxuICAgIFwiamFyXCI6IFwiYXBwbGljYXRpb24vamF2YS1hcmNoaXZlXCIsXG4gICAgXCJqYXZhXCI6IFwidGV4dC94LWphdmEtc291cmNlXCIsXG4gICAgXCJqaXNwXCI6IFwiYXBwbGljYXRpb24vdm5kLmppc3BcIixcbiAgICBcImpsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1qbHl0XCIsXG4gICAgXCJqbmxwXCI6IFwiYXBwbGljYXRpb24veC1qYXZhLWpubHAtZmlsZVwiLFxuICAgIFwiam9kYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5qb29zdC5qb2RhLWFyY2hpdmVcIixcbiAgICBcImpwZVwiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZWdcIjogXCJpbWFnZS9qcGVnXCIsXG4gICAgXCJqcGdcIjogXCJpbWFnZS9qcGVnXCIsXG4gICAgXCJqcGdtXCI6IFwidmlkZW8vanBtXCIsXG4gICAgXCJqcGd2XCI6IFwidmlkZW8vanBlZ1wiLFxuICAgIFwianBtXCI6IFwidmlkZW8vanBtXCIsXG4gICAgXCJqc1wiOiBcInRleHQvamF2YXNjcmlwdFwiLFxuICAgIFwianNvblwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICBcImpzb25tbFwiOiBcImFwcGxpY2F0aW9uL2pzb25tbCtqc29uXCIsXG4gICAgXCJrYXJcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJrYXJib25cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmthcmJvblwiLFxuICAgIFwia2ZvXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rZm9ybXVsYVwiLFxuICAgIFwia2lhXCI6IFwiYXBwbGljYXRpb24vdm5kLmtpZHNwaXJhdGlvblwiLFxuICAgIFwia21sXCI6IFwiYXBwbGljYXRpb24vdm5kLmdvb2dsZS1lYXJ0aC5rbWwreG1sXCIsXG4gICAgXCJrbXpcIjogXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWVhcnRoLmttelwiLFxuICAgIFwia25lXCI6IFwiYXBwbGljYXRpb24vdm5kLmtpbmFyXCIsXG4gICAgXCJrbnBcIjogXCJhcHBsaWNhdGlvbi92bmQua2luYXJcIixcbiAgICBcImtvblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua29udG91clwiLFxuICAgIFwia3ByXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rcHJlc2VudGVyXCIsXG4gICAgXCJrcHRcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcIixcbiAgICBcImtweHhcIjogXCJhcHBsaWNhdGlvbi92bmQuZHMta2V5cG9pbnRcIixcbiAgICBcImtzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3NwcmVhZFwiLFxuICAgIFwia3RyXCI6IFwiYXBwbGljYXRpb24vdm5kLmthaG9vdHpcIixcbiAgICBcImt0eFwiOiBcImltYWdlL2t0eFwiLFxuICAgIFwia3R6XCI6IFwiYXBwbGljYXRpb24vdm5kLmthaG9vdHpcIixcbiAgICBcImt3ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3dvcmRcIixcbiAgICBcImt3dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3dvcmRcIixcbiAgICBcImxhc3htbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sYXMubGFzK3htbFwiLFxuICAgIFwibGF0ZXhcIjogXCJhcHBsaWNhdGlvbi94LWxhdGV4XCIsXG4gICAgXCJsYmRcIjogXCJhcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZGVza3RvcFwiLFxuICAgIFwibGJlXCI6IFwiYXBwbGljYXRpb24vdm5kLmxsYW1hZ3JhcGhpY3MubGlmZS1iYWxhbmNlLmV4Y2hhbmdlK3htbFwiLFxuICAgIFwibGVzXCI6IFwiYXBwbGljYXRpb24vdm5kLmhoZS5sZXNzb24tcGxheWVyXCIsXG4gICAgXCJsaGFcIjogXCJhcHBsaWNhdGlvbi94LWx6aC1jb21wcmVzc2VkXCIsXG4gICAgXCJsaW5rNjZcIjogXCJhcHBsaWNhdGlvbi92bmQucm91dGU2Ni5saW5rNjYreG1sXCIsXG4gICAgXCJsaXN0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwibGlzdDM4MjBcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLm1vZGNhcFwiLFxuICAgIFwibGlzdGFmcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJsbmtcIjogXCJhcHBsaWNhdGlvbi94LW1zLXNob3J0Y3V0XCIsXG4gICAgXCJsb2dcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJsb3N0eG1sXCI6IFwiYXBwbGljYXRpb24vbG9zdCt4bWxcIixcbiAgICBcImxyZlwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwibHJtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWxybVwiLFxuICAgIFwibHRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyb2dhbnMubHRmXCIsXG4gICAgXCJsdnBcIjogXCJhdWRpby92bmQubHVjZW50LnZvaWNlXCIsXG4gICAgXCJsd3BcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtd29yZHByb1wiLFxuICAgIFwibHpcIjogXCJhcHBsaWNhdGlvbi94LWx6aXBcIixcbiAgICBcImx6aFwiOiBcImFwcGxpY2F0aW9uL3gtbHpoLWNvbXByZXNzZWRcIixcbiAgICBcImx6bWFcIjogXCJhcHBsaWNhdGlvbi94LWx6bWFcIixcbiAgICBcImx6b1wiOiBcImFwcGxpY2F0aW9uL3gtbHpvcFwiLFxuICAgIFwibTEzXCI6IFwiYXBwbGljYXRpb24veC1tc21lZGlhdmlld1wiLFxuICAgIFwibTE0XCI6IFwiYXBwbGljYXRpb24veC1tc21lZGlhdmlld1wiLFxuICAgIFwibTF2XCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibTIxXCI6IFwiYXBwbGljYXRpb24vbXAyMVwiLFxuICAgIFwibTJhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibTJ2XCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibTNhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibTN1XCI6IFwiYXVkaW8veC1tcGVndXJsXCIsXG4gICAgXCJtM3U4XCI6IFwiYXBwbGljYXRpb24vdm5kLmFwcGxlLm1wZWd1cmxcIixcbiAgICBcIm00YVwiOiBcImF1ZGlvL21wNFwiLFxuICAgIFwibTR1XCI6IFwidmlkZW8vdm5kLm1wZWd1cmxcIixcbiAgICBcIm00dlwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibWFcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibWFkc1wiOiBcImFwcGxpY2F0aW9uL21hZHMreG1sXCIsXG4gICAgXCJtYWdcIjogXCJhcHBsaWNhdGlvbi92bmQuZWNvd2luLmNoYXJ0XCIsXG4gICAgXCJtYWtlclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJtYW5cIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJtYXJcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcIm1hdGhtbFwiOiBcImFwcGxpY2F0aW9uL21hdGhtbCt4bWxcIixcbiAgICBcIm1iXCI6IFwiYXBwbGljYXRpb24vbWF0aGVtYXRpY2FcIixcbiAgICBcIm1ia1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubWJrXCIsXG4gICAgXCJtYm94XCI6IFwiYXBwbGljYXRpb24vbWJveFwiLFxuICAgIFwibWMxXCI6IFwiYXBwbGljYXRpb24vdm5kLm1lZGNhbGNkYXRhXCIsXG4gICAgXCJtY2RcIjogXCJhcHBsaWNhdGlvbi92bmQubWNkXCIsXG4gICAgXCJtY3VybFwiOiBcInRleHQvdm5kLmN1cmwubWN1cmxcIixcbiAgICAnbWQnOiAndGV4dC9wbGFpbicsXG4gICAgXCJtZGJcIjogXCJhcHBsaWNhdGlvbi94LW1zYWNjZXNzXCIsXG4gICAgXCJtZGlcIjogXCJpbWFnZS92bmQubXMtbW9kaVwiLFxuICAgIFwibWVcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJtZXNoXCI6IFwibW9kZWwvbWVzaFwiLFxuICAgIFwibWV0YTRcIjogXCJhcHBsaWNhdGlvbi9tZXRhbGluazQreG1sXCIsXG4gICAgXCJtZXRhbGlua1wiOiBcImFwcGxpY2F0aW9uL21ldGFsaW5rK3htbFwiLFxuICAgIFwibWV0c1wiOiBcImFwcGxpY2F0aW9uL21ldHMreG1sXCIsXG4gICAgXCJtZm1cIjogXCJhcHBsaWNhdGlvbi92bmQubWZtcFwiLFxuICAgIFwibWZ0XCI6IFwiYXBwbGljYXRpb24vcnBraS1tYW5pZmVzdFwiLFxuICAgIFwibWdwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2VvLm1hcGd1aWRlLnBhY2thZ2VcIixcbiAgICBcIm1nelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wcm90ZXVzLm1hZ2F6aW5lXCIsXG4gICAgXCJtaWRcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJtaWRpXCI6IFwiYXVkaW8vbWlkaVwiLFxuICAgIFwibWllXCI6IFwiYXBwbGljYXRpb24veC1taWVcIixcbiAgICBcIm1pZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5taWZcIixcbiAgICBcIm1pbWVcIjogXCJtZXNzYWdlL3JmYzgyMlwiLFxuICAgIFwibWoyXCI6IFwidmlkZW8vbWoyXCIsXG4gICAgXCJtanAyXCI6IFwidmlkZW8vbWoyXCIsXG4gICAgXCJtazNkXCI6IFwidmlkZW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWthXCI6IFwiYXVkaW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWtzXCI6IFwidmlkZW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWt2XCI6IFwidmlkZW8veC1tYXRyb3NrYVwiLFxuICAgIFwibWxwXCI6IFwiYXBwbGljYXRpb24vdm5kLmRvbGJ5Lm1scFwiLFxuICAgIFwibW1kXCI6IFwiYXBwbGljYXRpb24vdm5kLmNoaXBudXRzLmthcmFva2UtbW1kXCIsXG4gICAgXCJtbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc21hZlwiLFxuICAgIFwibW1yXCI6IFwiaW1hZ2Uvdm5kLmZ1aml4ZXJveC5lZG1pY3MtbW1yXCIsXG4gICAgXCJtbmdcIjogXCJ2aWRlby94LW1uZ1wiLFxuICAgIFwibW55XCI6IFwiYXBwbGljYXRpb24veC1tc21vbmV5XCIsXG4gICAgXCJtb2JpXCI6IFwiYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rXCIsXG4gICAgXCJtb2RzXCI6IFwiYXBwbGljYXRpb24vbW9kcyt4bWxcIixcbiAgICBcIm1vdlwiOiBcInZpZGVvL3F1aWNrdGltZVwiLFxuICAgIFwibW92aWVcIjogXCJ2aWRlby94LXNnaS1tb3ZpZVwiLFxuICAgIFwibXAyXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXAyMVwiOiBcImFwcGxpY2F0aW9uL21wMjFcIixcbiAgICBcIm1wMmFcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcDNcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJvcHVzXCI6IFwiYXVkaW8vb3B1c1wiLFxuICAgIFwibXA0XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcDRhXCI6IFwiYXVkaW8vbXA0XCIsXG4gICAgXCJtcDRzXCI6IFwiYXBwbGljYXRpb24vbXA0XCIsXG4gICAgXCJtcDR2XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcGNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9waHVuLmNlcnRpZmljYXRlXCIsXG4gICAgXCJtcGVcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGVnXCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibXBnXCI6IFwidmlkZW8vbXBlZ1wiLFxuICAgIFwibXBnNFwiOiBcInZpZGVvL21wNFwiLFxuICAgIFwibXBnYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wa2dcIjogXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbFwiLFxuICAgIFwibXBtXCI6IFwiYXBwbGljYXRpb24vdm5kLmJsdWVpY2UubXVsdGlwYXNzXCIsXG4gICAgXCJtcG5cIjogXCJhcHBsaWNhdGlvbi92bmQubW9waHVuLmFwcGxpY2F0aW9uXCIsXG4gICAgXCJtcHBcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcHJvamVjdFwiLFxuICAgIFwibXB0XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXByb2plY3RcIixcbiAgICBcIm1weVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubWluaXBheVwiLFxuICAgIFwibXF5XCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tcXlcIixcbiAgICBcIm1yY1wiOiBcImFwcGxpY2F0aW9uL21hcmNcIixcbiAgICBcIm1yY3hcIjogXCJhcHBsaWNhdGlvbi9tYXJjeG1sK3htbFwiLFxuICAgIFwibXNcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJtc2NtbFwiOiBcImFwcGxpY2F0aW9uL21lZGlhc2VydmVyY29udHJvbCt4bWxcIixcbiAgICBcIm1zZWVkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24ubXNlZWRcIixcbiAgICBcIm1zZXFcIjogXCJhcHBsaWNhdGlvbi92bmQubXNlcVwiLFxuICAgIFwibXNmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLm1zZlwiLFxuICAgIFwibXNoXCI6IFwibW9kZWwvbWVzaFwiLFxuICAgIFwibXNpXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJtc2xcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1zbFwiLFxuICAgIFwibXN0eVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tdXZlZS5zdHlsZVwiLFxuICAgIC8vXCJtdHNcIjogXCJtb2RlbC92bmQubXRzXCIsXG4gICAgXCJtdHNcIjogXCJ2aWRlby9tdHNcIixcbiAgICBcIm11c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tdXNpY2lhblwiLFxuICAgIFwibXVzaWN4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sK3htbFwiLFxuICAgIFwibXZiXCI6IFwiYXBwbGljYXRpb24veC1tc21lZGlhdmlld1wiLFxuICAgIFwibXdmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1mZXJcIixcbiAgICBcIm14ZlwiOiBcImFwcGxpY2F0aW9uL214ZlwiLFxuICAgIFwibXhsXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlY29yZGFyZS5tdXNpY3htbFwiLFxuICAgIFwibXhtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwibXhzXCI6IFwiYXBwbGljYXRpb24vdm5kLnRyaXNjYXBlLm14c1wiLFxuICAgIFwibXh1XCI6IFwidmlkZW8vdm5kLm1wZWd1cmxcIixcbiAgICBcIm4tZ2FnZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5uLWdhZ2Uuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJuM1wiOiBcInRleHQvbjNcIixcbiAgICBcIm5iXCI6IFwiYXBwbGljYXRpb24vbWF0aGVtYXRpY2FcIixcbiAgICBcIm5icFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53b2xmcmFtLnBsYXllclwiLFxuICAgIFwibmNcIjogXCJhcHBsaWNhdGlvbi94LW5ldGNkZlwiLFxuICAgIFwibmN4XCI6IFwiYXBwbGljYXRpb24veC1kdGJuY3greG1sXCIsXG4gICAgXCJuZm9cIjogXCJ0ZXh0L3gtbmZvXCIsXG4gICAgXCJuZ2RhdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5uLWdhZ2UuZGF0YVwiLFxuICAgIFwibml0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uaXRmXCIsXG4gICAgXCJubHVcIjogXCJhcHBsaWNhdGlvbi92bmQubmV1cm9sYW5ndWFnZS5ubHVcIixcbiAgICBcIm5tbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lbmxpdmVuXCIsXG4gICAgXCJubmRcIjogXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtZGlyZWN0b3J5XCIsXG4gICAgXCJubnNcIjogXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtc2VhbGVyXCIsXG4gICAgXCJubndcIjogXCJhcHBsaWNhdGlvbi92bmQubm9ibGVuZXQtd2ViXCIsXG4gICAgXCJucHhcIjogXCJpbWFnZS92bmQubmV0LWZweFwiLFxuICAgIFwibnNjXCI6IFwiYXBwbGljYXRpb24veC1jb25mZXJlbmNlXCIsXG4gICAgXCJuc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtbm90ZXNcIixcbiAgICBcIm50ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uaXRmXCIsXG4gICAgXCJuemJcIjogXCJhcHBsaWNhdGlvbi94LW56YlwiLFxuICAgIFwib2EyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXMyXCIsXG4gICAgXCJvYTNcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5czNcIixcbiAgICBcIm9hc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzXCIsXG4gICAgXCJvYmRcIjogXCJhcHBsaWNhdGlvbi94LW1zYmluZGVyXCIsXG4gICAgXCJvYmpcIjogXCJhcHBsaWNhdGlvbi94LXRnaWZcIixcbiAgICBcIm9kYVwiOiBcImFwcGxpY2F0aW9uL29kYVwiLFxuICAgIFwib2RiXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5kYXRhYmFzZVwiLFxuICAgIFwib2RjXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydFwiLFxuICAgIFwib2RmXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhXCIsXG4gICAgXCJvZGZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5mb3JtdWxhLXRlbXBsYXRlXCIsXG4gICAgXCJvZGdcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzXCIsXG4gICAgXCJvZGlcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlXCIsXG4gICAgXCJvZG1cIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtbWFzdGVyXCIsXG4gICAgXCJvZHBcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvblwiLFxuICAgIFwib2RzXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldFwiLFxuICAgIFwib2R0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0XCIsXG4gICAgXCJvZ2FcIjogXCJhdWRpby9vZ2dcIixcbiAgICBcIm9nZ1wiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwib2d2XCI6IFwidmlkZW8vb2dnXCIsXG4gICAgXCJvZ3hcIjogXCJhcHBsaWNhdGlvbi9vZ2dcIixcbiAgICBcIm9tZG9jXCI6IFwiYXBwbGljYXRpb24vb21kb2MreG1sXCIsXG4gICAgXCJvbmVwa2dcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvbmV0bXBcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvbmV0b2NcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvbmV0b2MyXCI6IFwiYXBwbGljYXRpb24vb25lbm90ZVwiLFxuICAgIFwib3BmXCI6IFwiYXBwbGljYXRpb24vb2VicHMtcGFja2FnZSt4bWxcIixcbiAgICBcIm9wbWxcIjogXCJ0ZXh0L3gtb3BtbFwiLFxuICAgIFwib3ByY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJvcmdcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtb3JnYW5pemVyXCIsXG4gICAgXCJvc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLm9wZW5zY29yZWZvcm1hdFwiLFxuICAgIFwib3NmcHZnXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5vcGVuc2NvcmVmb3JtYXQub3NmcHZnK3htbFwiLFxuICAgIFwib3RjXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5jaGFydC10ZW1wbGF0ZVwiLFxuICAgIFwib3RmXCI6IFwiYXBwbGljYXRpb24veC1mb250LW90ZlwiLFxuICAgIFwib3RnXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5ncmFwaGljcy10ZW1wbGF0ZVwiLFxuICAgIFwib3RoXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXdlYlwiLFxuICAgIFwib3RpXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5pbWFnZS10ZW1wbGF0ZVwiLFxuICAgIFwib3RwXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb24tdGVtcGxhdGVcIixcbiAgICBcIm90c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQtdGVtcGxhdGVcIixcbiAgICBcIm90dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC10ZW1wbGF0ZVwiLFxuICAgIFwib3hwc1wiOiBcImFwcGxpY2F0aW9uL294cHNcIixcbiAgICBcIm94dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVub2ZmaWNlb3JnLmV4dGVuc2lvblwiLFxuICAgIFwicFwiOiBcInRleHQveC1wYXNjYWxcIixcbiAgICBcInAxMFwiOiBcImFwcGxpY2F0aW9uL3BrY3MxMFwiLFxuICAgIFwicDEyXCI6IFwiYXBwbGljYXRpb24veC1wa2NzMTJcIixcbiAgICBcInA3YlwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydGlmaWNhdGVzXCIsXG4gICAgXCJwN2NcIjogXCJhcHBsaWNhdGlvbi9wa2NzNy1taW1lXCIsXG4gICAgXCJwN21cIjogXCJhcHBsaWNhdGlvbi9wa2NzNy1taW1lXCIsXG4gICAgXCJwN3JcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRyZXFyZXNwXCIsXG4gICAgXCJwN3NcIjogXCJhcHBsaWNhdGlvbi9wa2NzNy1zaWduYXR1cmVcIixcbiAgICBcInA4XCI6IFwiYXBwbGljYXRpb24vcGtjczhcIixcbiAgICBcInBhc1wiOiBcInRleHQveC1wYXNjYWxcIixcbiAgICBcInBhd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYXdhYWZpbGVcIixcbiAgICBcInBiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wb3dlcmJ1aWxkZXI2XCIsXG4gICAgXCJwYm1cIjogXCJpbWFnZS94LXBvcnRhYmxlLWJpdG1hcFwiLFxuICAgIFwicGNhcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50Y3BkdW1wLnBjYXBcIixcbiAgICBcInBjZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1wY2ZcIixcbiAgICBcInBjbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1wY2xcIixcbiAgICBcInBjbHhsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLXBjbHhsXCIsXG4gICAgXCJwY3RcIjogXCJpbWFnZS94LXBpY3RcIixcbiAgICBcInBjdXJsXCI6IFwiYXBwbGljYXRpb24vdm5kLmN1cmwucGN1cmxcIixcbiAgICBcInBjeFwiOiBcImltYWdlL3gtcGN4XCIsXG4gICAgXCJwZGJcIjogXCJhcHBsaWNhdGlvbi92bmQucGFsbVwiLFxuICAgIFwicGRmXCI6IFwiYXBwbGljYXRpb24vcGRmXCIsXG4gICAgXCJwZmFcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmYlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZtXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZnJcIjogXCJhcHBsaWNhdGlvbi9mb250LXRkcGZyXCIsXG4gICAgXCJwZnhcIjogXCJhcHBsaWNhdGlvbi94LXBrY3MxMlwiLFxuICAgIFwicGdtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1ncmF5bWFwXCIsXG4gICAgXCJwZ25cIjogXCJhcHBsaWNhdGlvbi94LWNoZXNzLXBnblwiLFxuICAgIFwicGdwXCI6IFwiYXBwbGljYXRpb24vcGdwLWVuY3J5cHRlZFwiLFxuICAgIFwicGhhclwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwicGhwXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwicGhwc1wiOiBcImFwcGxpY2F0aW9uL3gtaHR0cGQtcGhwc1wiLFxuICAgIFwicGljXCI6IFwiaW1hZ2UveC1waWN0XCIsXG4gICAgXCJwa2dcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcInBraVwiOiBcImFwcGxpY2F0aW9uL3BraXhjbXBcIixcbiAgICBcInBraXBhdGhcIjogXCJhcHBsaWNhdGlvbi9wa2l4LXBraXBhdGhcIixcbiAgICBcInBsYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1sYXJnZVwiLFxuICAgIFwicGxjXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5wbGNcIixcbiAgICBcInBsZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wb2NrZXRsZWFyblwiLFxuICAgIFwicGxpc3RcIjogXCJhcHBsaWNhdGlvbi94LXBsaXN0XCIsXG4gICAgXCJwbHNcIjogXCJhcHBsaWNhdGlvbi9wbHMreG1sXCIsXG4gICAgXCJwbWxcIjogXCJhcHBsaWNhdGlvbi92bmQuY3RjLXBvc21sXCIsXG4gICAgXCJwbmdcIjogXCJpbWFnZS9wbmdcIixcbiAgICBcInBubVwiOiBcImltYWdlL3gtcG9ydGFibGUtYW55bWFwXCIsXG4gICAgXCJwb3J0cGtnXCI6IFwiYXBwbGljYXRpb24vdm5kLm1hY3BvcnRzLnBvcnRwa2dcIixcbiAgICBcInBvdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwb3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwb3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnRlbXBsYXRlXCIsXG4gICAgXCJwcGFtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuYWRkaW4ubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJwcGRcIjogXCJhcHBsaWNhdGlvbi92bmQuY3Vwcy1wcGRcIixcbiAgICBcInBwbVwiOiBcImltYWdlL3gtcG9ydGFibGUtcGl4bWFwXCIsXG4gICAgXCJwcHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFwiLFxuICAgIFwicHBzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnNsaWRlc2hvdy5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwc3hcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVzaG93XCIsXG4gICAgXCJwcHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludFwiLFxuICAgIFwicHB0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50LnByZXNlbnRhdGlvbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uXCIsXG4gICAgXCJwcWFcIjogXCJhcHBsaWNhdGlvbi92bmQucGFsbVwiLFxuICAgIFwicHJjXCI6IFwiYXBwbGljYXRpb24veC1tb2JpcG9ja2V0LWVib29rXCIsXG4gICAgXCJwcmVcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtZnJlZWxhbmNlXCIsXG4gICAgXCJwcmZcIjogXCJhcHBsaWNhdGlvbi9waWNzLXJ1bGVzXCIsXG4gICAgXCJwc1wiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcInBzYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwLnBpYy1idy1zbWFsbFwiLFxuICAgIFwicHNkXCI6IFwiaW1hZ2Uvdm5kLmFkb2JlLnBob3Rvc2hvcFwiLFxuICAgIFwicHNmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWxpbnV4LXBzZlwiLFxuICAgIFwicHNrY3htbFwiOiBcImFwcGxpY2F0aW9uL3Bza2MreG1sXCIsXG4gICAgXCJwdGlkXCI6IFwiYXBwbGljYXRpb24vdm5kLnB2aS5wdGlkMVwiLFxuICAgIFwicHViXCI6IFwiYXBwbGljYXRpb24veC1tc3B1Ymxpc2hlclwiLFxuICAgIFwicHZiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LXZhclwiLFxuICAgIFwicHduXCI6IFwiYXBwbGljYXRpb24vdm5kLjNtLnBvc3QtaXQtbm90ZXNcIixcbiAgICBcInB5YVwiOiBcImF1ZGlvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHlhXCIsXG4gICAgXCJweXZcIjogXCJ2aWRlby92bmQubXMtcGxheXJlYWR5Lm1lZGlhLnB5dlwiLFxuICAgIFwicWFtXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnF1aWNrYW5pbWVcIixcbiAgICBcInFib1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnR1LnFib1wiLFxuICAgIFwicWZ4XCI6IFwiYXBwbGljYXRpb24vdm5kLmludHUucWZ4XCIsXG4gICAgXCJxcHNcIjogXCJhcHBsaWNhdGlvbi92bmQucHVibGlzaGFyZS1kZWx0YS10cmVlXCIsXG4gICAgXCJxdFwiOiBcInZpZGVvL3F1aWNrdGltZVwiLFxuICAgIFwicXdkXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxd3RcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhkXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGxcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicmFcIjogXCJhdWRpby94LXBuLXJlYWxhdWRpb1wiLFxuICAgIFwicmFtXCI6IFwiYXVkaW8veC1wbi1yZWFsYXVkaW9cIixcbiAgICBcInJhclwiOiBcImFwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWRcIixcbiAgICBcInJhc1wiOiBcImltYWdlL3gtY211LXJhc3RlclwiLFxuICAgIFwicmJcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJyY3Byb2ZpbGVcIjogXCJhcHBsaWNhdGlvbi92bmQuaXB1bnBsdWdnZWQucmNwcm9maWxlXCIsXG4gICAgXCJyZGZcIjogXCJhcHBsaWNhdGlvbi9yZGYreG1sXCIsXG4gICAgXCJyZHpcIjogXCJhcHBsaWNhdGlvbi92bmQuZGF0YS12aXNpb24ucmR6XCIsXG4gICAgXCJyZXBcIjogXCJhcHBsaWNhdGlvbi92bmQuYnVzaW5lc3NvYmplY3RzXCIsXG4gICAgXCJyZXNcIjogXCJhcHBsaWNhdGlvbi94LWR0YnJlc291cmNlK3htbFwiLFxuICAgIFwicmVzeFwiOiBcInRleHQveG1sXCIsXG4gICAgXCJyZ2JcIjogXCJpbWFnZS94LXJnYlwiLFxuICAgIFwicmlmXCI6IFwiYXBwbGljYXRpb24vcmVnaW5mbyt4bWxcIixcbiAgICBcInJpcFwiOiBcImF1ZGlvL3ZuZC5yaXBcIixcbiAgICBcInJpc1wiOiBcImFwcGxpY2F0aW9uL3gtcmVzZWFyY2gtaW5mby1zeXN0ZW1zXCIsXG4gICAgXCJybFwiOiBcImFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzK3htbFwiLFxuICAgIFwicmxjXCI6IFwiaW1hZ2Uvdm5kLmZ1aml4ZXJveC5lZG1pY3MtcmxjXCIsXG4gICAgXCJybGRcIjogXCJhcHBsaWNhdGlvbi9yZXNvdXJjZS1saXN0cy1kaWZmK3htbFwiLFxuICAgIFwicm1cIjogXCJhcHBsaWNhdGlvbi92bmQucm4tcmVhbG1lZGlhXCIsXG4gICAgXCJybWlcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJybXBcIjogXCJhdWRpby94LXBuLXJlYWxhdWRpby1wbHVnaW5cIixcbiAgICBcInJtc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5qY3AuamF2YW1lLm1pZGxldC1ybXNcIixcbiAgICBcInJtdmJcIjogXCJhcHBsaWNhdGlvbi92bmQucm4tcmVhbG1lZGlhLXZiclwiLFxuICAgIFwicm5jXCI6IFwiYXBwbGljYXRpb24vcmVsYXgtbmctY29tcGFjdC1zeW50YXhcIixcbiAgICBcInJvYVwiOiBcImFwcGxpY2F0aW9uL3Jwa2ktcm9hXCIsXG4gICAgXCJyb2ZmXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwicnA5XCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb2FudG8ucnA5XCIsXG4gICAgXCJycG1cIjogXCJhcHBsaWNhdGlvbi94LXJwbVwiLFxuICAgIFwicnBzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2tpYS5yYWRpby1wcmVzZXRzXCIsXG4gICAgXCJycHN0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldFwiLFxuICAgIFwicnFcIjogXCJhcHBsaWNhdGlvbi9zcGFycWwtcXVlcnlcIixcbiAgICBcInJzXCI6IFwiYXBwbGljYXRpb24vcmxzLXNlcnZpY2VzK3htbFwiLFxuICAgIFwicnNkXCI6IFwiYXBwbGljYXRpb24vcnNkK3htbFwiLFxuICAgIFwicnNzXCI6IFwiYXBwbGljYXRpb24vcnNzK3htbFwiLFxuICAgIFwicnRmXCI6IFwiYXBwbGljYXRpb24vcnRmXCIsXG4gICAgXCJydHhcIjogXCJ0ZXh0L3JpY2h0ZXh0XCIsXG4gICAgXCJzXCI6IFwidGV4dC94LWFzbVwiLFxuICAgIFwiczNtXCI6IFwiYXVkaW8vczNtXCIsXG4gICAgXCJzN3pcIjogXCJhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWRcIixcbiAgICBcInNhZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1hdWRpb1wiLFxuICAgIFwic2FmYXJpZXh0elwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwic2Fzc1wiOiBcInRleHQveC1zYXNzXCIsXG4gICAgXCJzYm1sXCI6IFwiYXBwbGljYXRpb24vc2JtbCt4bWxcIixcbiAgICBcInNjXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5zZWN1cmUtY29udGFpbmVyXCIsXG4gICAgXCJzY2RcIjogXCJhcHBsaWNhdGlvbi94LW1zc2NoZWR1bGVcIixcbiAgICBcInNjbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1zY3JlZW5jYW1cIixcbiAgICBcInNjcVwiOiBcImFwcGxpY2F0aW9uL3NjdnAtY3YtcmVxdWVzdFwiLFxuICAgIFwic2NzXCI6IFwiYXBwbGljYXRpb24vc2N2cC1jdi1yZXNwb25zZVwiLFxuICAgIFwic2Nzc1wiOiBcInRleHQveC1zY3NzXCIsXG4gICAgXCJzY3VybFwiOiBcInRleHQvdm5kLmN1cmwuc2N1cmxcIixcbiAgICBcInNkYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uZHJhd1wiLFxuICAgIFwic2RjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5jYWxjXCIsXG4gICAgXCJzZGRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmltcHJlc3NcIixcbiAgICBcInNka2RcIjogXCJhcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXCIsXG4gICAgXCJzZGttXCI6IFwiYXBwbGljYXRpb24vdm5kLnNvbGVudC5zZGttK3htbFwiLFxuICAgIFwic2RwXCI6IFwiYXBwbGljYXRpb24vc2RwXCIsXG4gICAgXCJzZHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlclwiLFxuICAgIFwic2VlXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlZW1haWxcIixcbiAgICBcInNlZWRcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5zZWVkXCIsXG4gICAgXCJzZW1hXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWFcIixcbiAgICBcInNlbWRcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtZFwiLFxuICAgIFwic2VtZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1mXCIsXG4gICAgXCJzZXJcIjogXCJhcHBsaWNhdGlvbi9qYXZhLXNlcmlhbGl6ZWQtb2JqZWN0XCIsXG4gICAgXCJzZXRwYXlcIjogXCJhcHBsaWNhdGlvbi9zZXQtcGF5bWVudC1pbml0aWF0aW9uXCIsXG4gICAgXCJzZXRyZWdcIjogXCJhcHBsaWNhdGlvbi9zZXQtcmVnaXN0cmF0aW9uLWluaXRpYXRpb25cIixcbiAgICBcInNmZC1oZHN0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oeWRyb3N0YXRpeC5zb2YtZGF0YVwiLFxuICAgIFwic2ZzXCI6IFwiYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLnNmc1wiLFxuICAgIFwic2Z2XCI6IFwidGV4dC94LXNmdlwiLFxuICAgIFwic2dpXCI6IFwiaW1hZ2Uvc2dpXCIsXG4gICAgXCJzZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLndyaXRlci1nbG9iYWxcIixcbiAgICBcInNnbVwiOiBcInRleHQvc2dtbFwiLFxuICAgIFwic2dtbFwiOiBcInRleHQvc2dtbFwiLFxuICAgIFwic2hcIjogXCJhcHBsaWNhdGlvbi94LXNoXCIsXG4gICAgXCJzaGFyXCI6IFwiYXBwbGljYXRpb24veC1zaGFyXCIsXG4gICAgXCJzaGZcIjogXCJhcHBsaWNhdGlvbi9zaGYreG1sXCIsXG4gICAgXCJzaWRcIjogXCJpbWFnZS94LW1yc2lkLWltYWdlXCIsXG4gICAgXCJzaWdcIjogXCJhcHBsaWNhdGlvbi9wZ3Atc2lnbmF0dXJlXCIsXG4gICAgXCJzaWxcIjogXCJhdWRpby9zaWxrXCIsXG4gICAgXCJzaWxvXCI6IFwibW9kZWwvbWVzaFwiLFxuICAgIFwic2lzXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwic2lzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcInNpdFwiOiBcImFwcGxpY2F0aW9uL3gtc3R1ZmZpdFwiLFxuICAgIFwic2l0eFwiOiBcImFwcGxpY2F0aW9uL3gtc3R1ZmZpdHhcIixcbiAgICBcInNrZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza21cIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2twXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJzbGRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJzbGR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnNsaWRlXCIsXG4gICAgXCJzbHRcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uc2FsdFwiLFxuICAgIFwic21cIjogXCJhcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnN0ZXBjaGFydFwiLFxuICAgIFwic21mXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5tYXRoXCIsXG4gICAgXCJzbWlcIjogXCJhcHBsaWNhdGlvbi9zbWlsK3htbFwiLFxuICAgIFwic21pbFwiOiBcImFwcGxpY2F0aW9uL3NtaWwreG1sXCIsXG4gICAgXCJzbXZcIjogXCJ2aWRlby94LXNtdlwiLFxuICAgIFwic216aXBcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RlcG1hbmlhLnBhY2thZ2VcIixcbiAgICBcInNuZFwiOiBcImF1ZGlvL2Jhc2ljXCIsXG4gICAgXCJzbmZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtc25mXCIsXG4gICAgXCJzb1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwic3BjXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcIixcbiAgICBcInNwZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuc21hZi1waHJhc2VcIixcbiAgICBcInNwbFwiOiBcImFwcGxpY2F0aW9uL3gtZnV0dXJlc3BsYXNoXCIsXG4gICAgXCJzcG90XCI6IFwidGV4dC92bmQuaW4zZC5zcG90XCIsXG4gICAgXCJzcHBcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLXZwLXJlc3BvbnNlXCIsXG4gICAgXCJzcHFcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLXZwLXJlcXVlc3RcIixcbiAgICBcInNweFwiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwic3FsXCI6IFwiYXBwbGljYXRpb24veC1zcWxcIixcbiAgICBcInNyY1wiOiBcImFwcGxpY2F0aW9uL3gtd2Fpcy1zb3VyY2VcIixcbiAgICBcInNydFwiOiBcImFwcGxpY2F0aW9uL3gtc3VicmlwXCIsXG4gICAgXCJzcnVcIjogXCJhcHBsaWNhdGlvbi9zcnUreG1sXCIsXG4gICAgXCJzcnhcIjogXCJhcHBsaWNhdGlvbi9zcGFycWwtcmVzdWx0cyt4bWxcIixcbiAgICBcInNzZGxcIjogXCJhcHBsaWNhdGlvbi9zc2RsK3htbFwiLFxuICAgIFwic3NlXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvZGFrLWRlc2NyaXB0b3JcIixcbiAgICBcInNzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5zc2ZcIixcbiAgICBcInNzbWxcIjogXCJhcHBsaWNhdGlvbi9zc21sK3htbFwiLFxuICAgIFwic3RcIjogXCJhcHBsaWNhdGlvbi92bmQuc2FpbGluZ3RyYWNrZXIudHJhY2tcIixcbiAgICBcInN0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmNhbGMudGVtcGxhdGVcIixcbiAgICBcInN0ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXcudGVtcGxhdGVcIixcbiAgICBcInN0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC53dC5zdGZcIixcbiAgICBcInN0aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3MudGVtcGxhdGVcIixcbiAgICBcInN0a1wiOiBcImFwcGxpY2F0aW9uL2h5cGVyc3R1ZGlvXCIsXG4gICAgXCJzdGxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcGtpLnN0bFwiLFxuICAgIFwic3RyXCI6IFwiYXBwbGljYXRpb24vdm5kLnBnLmZvcm1hdFwiLFxuICAgIFwic3R3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLnRlbXBsYXRlXCIsXG4gICAgXCJzdHlsXCI6IFwidGV4dC94LXN0eWxcIixcbiAgICBcInN1YlwiOiBcImltYWdlL3ZuZC5kdmIuc3VidGl0bGVcIixcbiAgICBcInN1c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcIixcbiAgICBcInN1c3BcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VzLWNhbGVuZGFyXCIsXG4gICAgXCJzdjRjcGlvXCI6IFwiYXBwbGljYXRpb24veC1zdjRjcGlvXCIsXG4gICAgXCJzdjRjcmNcIjogXCJhcHBsaWNhdGlvbi94LXN2NGNyY1wiLFxuICAgIFwic3ZjXCI6IFwiYXBwbGljYXRpb24vdm5kLmR2Yi5zZXJ2aWNlXCIsXG4gICAgXCJzdmRcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ZkXCIsXG4gICAgXCJzdmdcIjogXCJpbWFnZS9zdmcreG1sXCIsXG4gICAgXCJzdmd6XCI6IFwiaW1hZ2Uvc3ZnK3htbFwiLFxuICAgIFwic3dhXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwic3dmXCI6IFwiYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2hcIixcbiAgICBcInN3aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcmlzdGFuZXR3b3Jrcy5zd2lcIixcbiAgICBcInN4Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmNhbGNcIixcbiAgICBcInN4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmRyYXdcIixcbiAgICBcInN4Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlci5nbG9iYWxcIixcbiAgICBcInN4aVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLmltcHJlc3NcIixcbiAgICBcInN4bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLm1hdGhcIixcbiAgICBcInN4d1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdW4ueG1sLndyaXRlclwiLFxuICAgIFwidFwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcInQzXCI6IFwiYXBwbGljYXRpb24veC10M3ZtLWltYWdlXCIsXG4gICAgXCJ0YWdsZXRcIjogXCJhcHBsaWNhdGlvbi92bmQubXluZmNcIixcbiAgICBcInRhb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC50YW8uaW50ZW50LW1vZHVsZS1hcmNoaXZlXCIsXG4gICAgXCJ0YXJcIjogXCJhcHBsaWNhdGlvbi94LXRhclwiLFxuICAgIFwidGNhcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC4zZ3BwMi50Y2FwXCIsXG4gICAgXCJ0Y2xcIjogXCJhcHBsaWNhdGlvbi94LXRjbFwiLFxuICAgIFwidGVhY2hlclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zbWFydC50ZWFjaGVyXCIsXG4gICAgXCJ0ZWlcIjogXCJhcHBsaWNhdGlvbi90ZWkreG1sXCIsXG4gICAgXCJ0ZWljb3JwdXNcIjogXCJhcHBsaWNhdGlvbi90ZWkreG1sXCIsXG4gICAgXCJ0ZXhcIjogXCJhcHBsaWNhdGlvbi94LXRleFwiLFxuICAgIFwidGV4aVwiOiBcImFwcGxpY2F0aW9uL3gtdGV4aW5mb1wiLFxuICAgIFwidGV4aW5mb1wiOiBcImFwcGxpY2F0aW9uL3gtdGV4aW5mb1wiLFxuICAgIFwidGV4dFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInRmaVwiOiBcImFwcGxpY2F0aW9uL3RocmF1ZCt4bWxcIixcbiAgICBcInRmbVwiOiBcImFwcGxpY2F0aW9uL3gtdGV4LXRmbVwiLFxuICAgIFwidGdhXCI6IFwiaW1hZ2UveC10Z2FcIixcbiAgICBcInRnelwiOiBcImFwcGxpY2F0aW9uL3gtZ3ppcFwiLFxuICAgIFwidGhteFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1vZmZpY2V0aGVtZVwiLFxuICAgIFwidGlmXCI6IFwiaW1hZ2UvdGlmZlwiLFxuICAgIFwidGlmZlwiOiBcImltYWdlL3RpZmZcIixcbiAgICBcInRtb1wiOiBcImFwcGxpY2F0aW9uL3ZuZC50bW9iaWxlLWxpdmV0dlwiLFxuICAgIFwidG9ycmVudFwiOiBcImFwcGxpY2F0aW9uL3gtYml0dG9ycmVudFwiLFxuICAgIFwidHBsXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLXRlbXBsYXRlXCIsXG4gICAgXCJ0cHRcIjogXCJhcHBsaWNhdGlvbi92bmQudHJpZC50cHRcIixcbiAgICBcInRyXCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwidHJhXCI6IFwiYXBwbGljYXRpb24vdm5kLnRydWVhcHBcIixcbiAgICBcInRybVwiOiBcImFwcGxpY2F0aW9uL3gtbXN0ZXJtaW5hbFwiLFxuICAgIFwidHNkXCI6IFwiYXBwbGljYXRpb24vdGltZXN0YW1wZWQtZGF0YVwiLFxuICAgIFwidHN2XCI6IFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiLFxuICAgIFwidHRjXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR0ZlwiLFxuICAgIFwidHRmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR0ZlwiLFxuICAgIFwidHRsXCI6IFwidGV4dC90dXJ0bGVcIixcbiAgICBcInR3ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaW10ZWNoLW1pbmRtYXBwZXJcIixcbiAgICBcInR3ZHNcIjogXCJhcHBsaWNhdGlvbi92bmQuc2ltdGVjaC1taW5kbWFwcGVyXCIsXG4gICAgXCJ0eGRcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2Vub21hdGl4LnR1eGVkb1wiLFxuICAgIFwidHhmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy50eGZcIixcbiAgICBcInR4dFwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInUzMlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcInVkZWJcIjogXCJhcHBsaWNhdGlvbi94LWRlYmlhbi1wYWNrYWdlXCIsXG4gICAgXCJ1ZmRcIjogXCJhcHBsaWNhdGlvbi92bmQudWZkbFwiLFxuICAgIFwidWZkbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51ZmRsXCIsXG4gICAgXCJ1bHhcIjogXCJhcHBsaWNhdGlvbi94LWdsdWx4XCIsXG4gICAgXCJ1bWpcIjogXCJhcHBsaWNhdGlvbi92bmQudW1hamluXCIsXG4gICAgXCJ1bml0eXdlYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC51bml0eVwiLFxuICAgIFwidW9tbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51b21sK3htbFwiLFxuICAgIFwidXJpXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXJpc1wiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVybHNcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1c3RhclwiOiBcImFwcGxpY2F0aW9uL3gtdXN0YXJcIixcbiAgICBcInV0elwiOiBcImFwcGxpY2F0aW9uL3ZuZC51aXEudGhlbWVcIixcbiAgICBcInV1XCI6IFwidGV4dC94LXV1ZW5jb2RlXCIsXG4gICAgXCJ1dmFcIjogXCJhdWRpby92bmQuZGVjZS5hdWRpb1wiLFxuICAgIFwidXZkXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZmXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZnXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZoXCI6IFwidmlkZW8vdm5kLmRlY2UuaGRcIixcbiAgICBcInV2aVwiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2bVwiOiBcInZpZGVvL3ZuZC5kZWNlLm1vYmlsZVwiLFxuICAgIFwidXZwXCI6IFwidmlkZW8vdm5kLmRlY2UucGRcIixcbiAgICBcInV2c1wiOiBcInZpZGVvL3ZuZC5kZWNlLnNkXCIsXG4gICAgXCJ1dnRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS50dG1sK3htbFwiLFxuICAgIFwidXZ1XCI6IFwidmlkZW8vdm5kLnV2dnUubXA0XCIsXG4gICAgXCJ1dnZcIjogXCJ2aWRlby92bmQuZGVjZS52aWRlb1wiLFxuICAgIFwidXZ2YVwiOiBcImF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXCIsXG4gICAgXCJ1dnZkXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZ2ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLmRhdGFcIixcbiAgICBcInV2dmdcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dnZoXCI6IFwidmlkZW8vdm5kLmRlY2UuaGRcIixcbiAgICBcInV2dmlcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dnZtXCI6IFwidmlkZW8vdm5kLmRlY2UubW9iaWxlXCIsXG4gICAgXCJ1dnZwXCI6IFwidmlkZW8vdm5kLmRlY2UucGRcIixcbiAgICBcInV2dnNcIjogXCJ2aWRlby92bmQuZGVjZS5zZFwiLFxuICAgIFwidXZ2dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnR0bWwreG1sXCIsXG4gICAgXCJ1dnZ1XCI6IFwidmlkZW8vdm5kLnV2dnUubXA0XCIsXG4gICAgXCJ1dnZ2XCI6IFwidmlkZW8vdm5kLmRlY2UudmlkZW9cIixcbiAgICBcInV2dnhcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS51bnNwZWNpZmllZFwiLFxuICAgIFwidXZ2elwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnppcFwiLFxuICAgIFwidXZ4XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudW5zcGVjaWZpZWRcIixcbiAgICBcInV2elwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnppcFwiLFxuICAgIFwidmNhcmRcIjogXCJ0ZXh0L3ZjYXJkXCIsXG4gICAgXCJ2Y2RcIjogXCJhcHBsaWNhdGlvbi94LWNkbGlua1wiLFxuICAgIFwidmNmXCI6IFwidGV4dC94LXZjYXJkXCIsXG4gICAgXCJ2Y2dcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXZjYXJkXCIsXG4gICAgXCJ2Y3NcIjogXCJ0ZXh0L3gtdmNhbGVuZGFyXCIsXG4gICAgXCJ2Y3hcIjogXCJhcHBsaWNhdGlvbi92bmQudmN4XCIsXG4gICAgXCJ2aXNcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9uYXJ5XCIsXG4gICAgXCJ2aXZcIjogXCJ2aWRlby92bmQudml2b1wiLFxuICAgIFwidm9iXCI6IFwidmlkZW8veC1tcy12b2JcIixcbiAgICBcInZvclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyXCIsXG4gICAgXCJ2b3hcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtYmluXCIsXG4gICAgXCJ2cm1sXCI6IFwibW9kZWwvdnJtbFwiLFxuICAgIFwidnNkXCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c2ZcIjogXCJhcHBsaWNhdGlvbi92bmQudnNmXCIsXG4gICAgXCJ2c3NcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnN3XCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2dHVcIjogXCJtb2RlbC92bmQudnR1XCIsXG4gICAgXCJ2eG1sXCI6IFwiYXBwbGljYXRpb24vdm9pY2V4bWwreG1sXCIsXG4gICAgXCJ3M2RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJ3YWRcIjogXCJhcHBsaWNhdGlvbi94LWRvb21cIixcbiAgICBcIndhdlwiOiBcImF1ZGlvL3gtd2F2XCIsXG4gICAgXCJ3YXhcIjogXCJhdWRpby94LW1zLXdheFwiLFxuICAgIFwid2JtcFwiOiBcImltYWdlL3ZuZC53YXAud2JtcFwiLFxuICAgIFwid2JzXCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaXRpY2FsdG9vbHMud2JzK3htbFwiLFxuICAgIFwid2J4bWxcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndieG1sXCIsXG4gICAgXCJ3Y21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndkYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid2RwXCI6IFwiaW1hZ2Uvdm5kLm1zLXBob3RvXCIsXG4gICAgXCJ3ZWJhXCI6IFwiYXVkaW8vd2VibVwiLFxuICAgIFwid2VibVwiOiBcInZpZGVvL3dlYm1cIixcbiAgICBcIndlYnBcIjogXCJpbWFnZS93ZWJwXCIsXG4gICAgXCJ3Z1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wbWkud2lkZ2V0XCIsXG4gICAgXCJ3Z3RcIjogXCJhcHBsaWNhdGlvbi93aWRnZXRcIixcbiAgICBcIndrc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid21cIjogXCJ2aWRlby94LW1zLXdtXCIsXG4gICAgXCJ3bWFcIjogXCJhdWRpby94LW1zLXdtYVwiLFxuICAgIFwid21kXCI6IFwiYXBwbGljYXRpb24veC1tcy13bWRcIixcbiAgICBcIndtZlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwid21sXCI6IFwidGV4dC92bmQud2FwLndtbFwiLFxuICAgIFwid21sY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud21sY1wiLFxuICAgIFwid21sc1wiOiBcInRleHQvdm5kLndhcC53bWxzY3JpcHRcIixcbiAgICBcIndtbHNjXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53bWxzY3JpcHRjXCIsXG4gICAgXCJ3bXZcIjogXCJ2aWRlby94LW1zLXdtdlwiLFxuICAgIFwid214XCI6IFwidmlkZW8veC1tcy13bXhcIixcbiAgICBcIndtelwiOiBcImFwcGxpY2F0aW9uL3gtbXMtd216XCIsXG4gICAgXCJ3b2ZmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXdvZmZcIixcbiAgICBcIndwZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53b3JkcGVyZmVjdFwiLFxuICAgIFwid3BsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdwbFwiLFxuICAgIFwid3BzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3cWRcIjogXCJhcHBsaWNhdGlvbi92bmQud3FkXCIsXG4gICAgXCJ3cmlcIjogXCJhcHBsaWNhdGlvbi94LW1zd3JpdGVcIixcbiAgICBcIndybFwiOiBcIm1vZGVsL3ZybWxcIixcbiAgICBcIndzZGxcIjogXCJhcHBsaWNhdGlvbi93c2RsK3htbFwiLFxuICAgIFwid3Nwb2xpY3lcIjogXCJhcHBsaWNhdGlvbi93c3BvbGljeSt4bWxcIixcbiAgICBcInd0YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC53ZWJ0dXJib1wiLFxuICAgIFwid3Z4XCI6IFwidmlkZW8veC1tcy13dnhcIixcbiAgICBcIngzMlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcIngzZFwiOiBcIm1vZGVsL3gzZCt4bWxcIixcbiAgICBcIngzZGJcIjogXCJtb2RlbC94M2QrYmluYXJ5XCIsXG4gICAgXCJ4M2RielwiOiBcIm1vZGVsL3gzZCtiaW5hcnlcIixcbiAgICBcIngzZHZcIjogXCJtb2RlbC94M2QrdnJtbFwiLFxuICAgIFwieDNkdnpcIjogXCJtb2RlbC94M2QrdnJtbFwiLFxuICAgIFwieDNkelwiOiBcIm1vZGVsL3gzZCt4bWxcIixcbiAgICBcInhhbWxcIjogXCJhcHBsaWNhdGlvbi94YW1sK3htbFwiLFxuICAgIFwieGFwXCI6IFwiYXBwbGljYXRpb24veC1zaWx2ZXJsaWdodC1hcHBcIixcbiAgICBcInhhclwiOiBcImFwcGxpY2F0aW9uL3ZuZC54YXJhXCIsXG4gICAgXCJ4YmFwXCI6IFwiYXBwbGljYXRpb24veC1tcy14YmFwXCIsXG4gICAgXCJ4YmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrcy5iaW5kZXJcIixcbiAgICBcInhibVwiOiBcImltYWdlL3gteGJpdG1hcFwiLFxuICAgIFwieGRmXCI6IFwiYXBwbGljYXRpb24veGNhcC1kaWZmK3htbFwiLFxuICAgIFwieGRtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbSt4bWxcIixcbiAgICBcInhkcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5hZG9iZS54ZHAreG1sXCIsXG4gICAgXCJ4ZHNzY1wiOiBcImFwcGxpY2F0aW9uL2Rzc2MreG1sXCIsXG4gICAgXCJ4ZHdcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXhlcm94LmRvY3V3b3Jrc1wiLFxuICAgIFwieGVuY1wiOiBcImFwcGxpY2F0aW9uL3hlbmMreG1sXCIsXG4gICAgXCJ4ZXJcIjogXCJhcHBsaWNhdGlvbi9wYXRjaC1vcHMtZXJyb3IreG1sXCIsXG4gICAgXCJ4ZmRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLnhmZGZcIixcbiAgICBcInhmZGxcIjogXCJhcHBsaWNhdGlvbi92bmQueGZkbFwiLFxuICAgIFwieGh0XCI6IFwiYXBwbGljYXRpb24veGh0bWwreG1sXCIsXG4gICAgXCJ4aHRtbFwiOiBcImFwcGxpY2F0aW9uL3hodG1sK3htbFwiLFxuICAgIFwieGh2bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInhpZlwiOiBcImltYWdlL3ZuZC54aWZmXCIsXG4gICAgXCJ4bGFcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsYW1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuYWRkaW4ubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bGNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsZlwiOiBcImFwcGxpY2F0aW9uL3gteGxpZmYreG1sXCIsXG4gICAgXCJ4bG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxzYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5zaGVldC5iaW5hcnkubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwieGxzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0XCIsXG4gICAgXCJ4bHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWxcIixcbiAgICBcInhsdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHR4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGVcIixcbiAgICBcInhsd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieG1cIjogXCJhdWRpby94bVwiLFxuICAgIFwieG1sXCI6IFwiYXBwbGljYXRpb24veG1sXCIsXG4gICAgXCJ4b1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vbHBjLXN1Z2FyXCIsXG4gICAgXCJ4b3BcIjogXCJhcHBsaWNhdGlvbi94b3AreG1sXCIsXG4gICAgXCJ4cGlcIjogXCJhcHBsaWNhdGlvbi94LXhwaW5zdGFsbFwiLFxuICAgIFwieHBsXCI6IFwiYXBwbGljYXRpb24veHByb2MreG1sXCIsXG4gICAgXCJ4cG1cIjogXCJpbWFnZS94LXhwaXhtYXBcIixcbiAgICBcInhwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcy14cHJcIixcbiAgICBcInhwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy14cHNkb2N1bWVudFwiLFxuICAgIFwieHB3XCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyY29uLmZvcm1uZXRcIixcbiAgICBcInhweFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnRlcmNvbi5mb3JtbmV0XCIsXG4gICAgXCJ4c2xcIjogXCJhcHBsaWNhdGlvbi94bWxcIixcbiAgICBcInhzbHRcIjogXCJhcHBsaWNhdGlvbi94c2x0K3htbFwiLFxuICAgIFwieHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbCt4bWxcIixcbiAgICBcInhzcGZcIjogXCJhcHBsaWNhdGlvbi94c3BmK3htbFwiLFxuICAgIFwieHVsXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vemlsbGEueHVsK3htbFwiLFxuICAgIFwieHZtXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJ4dm1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJ4d2RcIjogXCJpbWFnZS94LXh3aW5kb3dkdW1wXCIsXG4gICAgXCJ4eXpcIjogXCJjaGVtaWNhbC94LXh5elwiLFxuICAgIFwieHpcIjogXCJhcHBsaWNhdGlvbi94LXh6XCIsXG4gICAgXCJ5YW1sXCI6IFwidGV4dC95YW1sXCIsXG4gICAgXCJ5YW5nXCI6IFwiYXBwbGljYXRpb24veWFuZ1wiLFxuICAgIFwieWluXCI6IFwiYXBwbGljYXRpb24veWluK3htbFwiLFxuICAgIFwieW1sXCI6IFwidGV4dC95YW1sXCIsXG4gICAgXCJ6XCI6IFwiYXBwbGljYXRpb24veC1jb21wcmVzc1wiLFxuICAgIFwiejFcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6MlwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInozXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejRcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NVwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno2XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejdcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6OFwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInphelwiOiBcImFwcGxpY2F0aW9uL3ZuZC56emF6ei5kZWNrK3htbFwiLFxuICAgIFwiemlwXCI6IFwiYXBwbGljYXRpb24vemlwXCIsXG4gICAgXCJ6aXJcIjogXCJhcHBsaWNhdGlvbi92bmQuenVsXCIsXG4gICAgXCJ6aXJ6XCI6IFwiYXBwbGljYXRpb24vdm5kLnp1bFwiLFxuICAgIFwiem1tXCI6IFwiYXBwbGljYXRpb24vdm5kLmhhbmRoZWxkLWVudGVydGFpbm1lbnQreG1sXCIsXG4gICAgXCIxMjNcIjogXCJhcHBsaWNhdGlvbi92bmQubG90dXMtMS0yLTNcIlxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pbWUtdHlwZXMtbW9kdWxlLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuYXN5bmMgZnVuY3Rpb24gYWZ0ZXJGZXRjaChyZXNwb25zZSkge1xuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYGJhZCByZXNwb25zZSA6ICR7SlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpfWApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IHJlY2VpdmVkQ29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgfHwgJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgIGxldCBzY2kgPSByZWNlaXZlZENvbnRlbnRUeXBlLmluZGV4T2YoJzsnKTtcbiAgICBpZiAoc2NpID49IDApXG4gICAgICAgIHJlY2VpdmVkQ29udGVudFR5cGUgPSByZWNlaXZlZENvbnRlbnRUeXBlLnN1YnN0cigwLCBzY2kpO1xuICAgIGlmIChyZWNlaXZlZENvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG59XG5mdW5jdGlvbiBnZXREYXRhKHVybCwgaGVhZGVycyA9IG51bGwpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJ1xuICAgIH07XG4gICAgaWYgKGhlYWRlcnMpXG4gICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IGhlYWRlcnM7XG4gICAgcmV0dXJuIGZldGNoKHVybCwgb3B0aW9ucylcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmdldERhdGEgPSBnZXREYXRhO1xuZnVuY3Rpb24gcG9zdERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLnBvc3REYXRhID0gcG9zdERhdGE7XG5mdW5jdGlvbiBwdXREYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLnB1dERhdGEgPSBwdXREYXRhO1xuZnVuY3Rpb24gZGVsZXRlRGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5kZWxldGVEYXRhID0gZGVsZXRlRGF0YTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5ldHdvcmsuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmV4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT0gXCJob21lLmx0ZWNvbnN1bHRpbmcuZnJcIiA/IFwiaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnJcIiA6IFwiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwNVwiO1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoKHNlYXJjaFRleHQsIG1pbWVUeXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHNlYXJjaFNwZWMgPSB7XG4gICAgICAgICAgICBuYW1lOiBzZWFyY2hUZXh0LFxuICAgICAgICAgICAgbWltZVR5cGU6IG1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0RGlyZWN0b3JpZXMsIHJlc3VsdEZpbGVzZGRkLCBpdGVtcyB9ID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zZWFyY2hgLCBzZWFyY2hTcGVjKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzOiByZXN1bHREaXJlY3RvcmllcyxcbiAgICAgICAgICAgIGZpbGVzOiByZXN1bHRGaWxlc2RkZCxcbiAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5zZWFyY2ggPSBzZWFyY2g7XG5hc3luYyBmdW5jdGlvbiBzZWFyY2hFeChzZWFyY2hTcGVjKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyByZXN1bHREaXJlY3RvcmllcywgcmVzdWx0RmlsZXNkZGQsIGl0ZW1zIH0gPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NlYXJjaGAsIHNlYXJjaFNwZWMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IHJlc3VsdERpcmVjdG9yaWVzLFxuICAgICAgICAgICAgZmlsZXM6IHJlc3VsdEZpbGVzZGRkLFxuICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLnNlYXJjaEV4ID0gc2VhcmNoRXg7XG5hc3luYyBmdW5jdGlvbiBnZXRKb2JzKCkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vam9ic2ApO1xufVxuZXhwb3J0cy5nZXRKb2JzID0gZ2V0Sm9icztcbmFzeW5jIGZ1bmN0aW9uIGdldERpcmVjdG9yeURlc2NyaXB0b3Ioc2hhKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT1hcHBsaWNhdGlvbi9qc29uYCk7XG59XG5leHBvcnRzLmdldERpcmVjdG9yeURlc2NyaXB0b3IgPSBnZXREaXJlY3RvcnlEZXNjcmlwdG9yO1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3JlZnNgKTtcbn1cbmV4cG9ydHMuZ2V0UmVmZXJlbmNlcyA9IGdldFJlZmVyZW5jZXM7XG5hc3luYyBmdW5jdGlvbiBnZXRSZWZlcmVuY2UobmFtZSkge1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLmdldERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcmVmcy8ke25hbWV9YCk7XG59XG5leHBvcnRzLmdldFJlZmVyZW5jZSA9IGdldFJlZmVyZW5jZTtcbmFzeW5jIGZ1bmN0aW9uIGdldENvbW1pdChzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPWFwcGxpY2F0aW9uL2pzb25gKTtcbn1cbmV4cG9ydHMuZ2V0Q29tbWl0ID0gZ2V0Q29tbWl0O1xuYXN5bmMgZnVuY3Rpb24gZ2V0U2hhSW5mbyhzaGEpIHtcbiAgICByZXR1cm4gYXdhaXQgTmV0d29yay5nZXREYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vaW5mb2ApO1xufVxuZXhwb3J0cy5nZXRTaGFJbmZvID0gZ2V0U2hhSW5mbztcbmFzeW5jIGZ1bmN0aW9uIGVucXVldWVZb3V0dWJlRG93bmxvYWQoeW91dHViZVVybCkge1xuICAgIE5ldHdvcmsucG9zdERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcGx1Z2lucy95b3V0dWJlL2ZldGNoYCwgeyB1cmw6IHlvdXR1YmVVcmwgfSk7XG59XG5leHBvcnRzLmVucXVldWVZb3V0dWJlRG93bmxvYWQgPSBlbnF1ZXVlWW91dHViZURvd25sb2FkO1xuZnVuY3Rpb24gZ2V0U2hhQ29udGVudFVybChzaGEsIG1pbWVUeXBlLCBuYW1lLCB3aXRoUGhhbnRvbSwgaXNEb3dubG9hZCkge1xuICAgIGlmICghc2hhKVxuICAgICAgICByZXR1cm4gJyMnO1xuICAgIGxldCBiYXNlID0gd2l0aFBoYW50b20gP1xuICAgICAgICBgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQvJHtlbmNvZGVVUklDb21wb25lbnQobmFtZSl9P3R5cGU9JHtlbmNvZGVVUklDb21wb25lbnQobWltZVR5cGUpfWAgOlxuICAgICAgICBgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT0ke2VuY29kZVVSSUNvbXBvbmVudChtaW1lVHlwZSl9YDtcbiAgICBpZiAoaXNEb3dubG9hZClcbiAgICAgICAgYmFzZSArPSBgJmZpbGVOYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUgfHwgc2hhKX1gO1xuICAgIHJldHVybiBiYXNlO1xufVxuZXhwb3J0cy5nZXRTaGFDb250ZW50VXJsID0gZ2V0U2hhQ29udGVudFVybDtcbmZ1bmN0aW9uIGdldFNoYUltYWdlVGh1bWJuYWlsVXJsKHNoYSwgbWltZVR5cGUpIHtcbiAgICByZXR1cm4gYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9wbHVnaW5zL2ltYWdlL3RodW1ibmFpbD90eXBlPSR7bWltZVR5cGV9YDtcbn1cbmV4cG9ydHMuZ2V0U2hhSW1hZ2VUaHVtYm5haWxVcmwgPSBnZXRTaGFJbWFnZVRodW1ibmFpbFVybDtcbmZ1bmN0aW9uIGdldFNoYUltYWdlTWVkaXVtVGh1bWJuYWlsVXJsKHNoYSwgbWltZVR5cGUpIHtcbiAgICByZXR1cm4gYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9wbHVnaW5zL2ltYWdlL21lZGl1bT90eXBlPSR7bWltZVR5cGV9YDtcbn1cbmV4cG9ydHMuZ2V0U2hhSW1hZ2VNZWRpdW1UaHVtYm5haWxVcmwgPSBnZXRTaGFJbWFnZU1lZGl1bVRodW1ibmFpbFVybDtcbmFzeW5jIGZ1bmN0aW9uIHB1dEl0ZW1Ub1BsYXlsaXN0KHBsYXlsaXN0TmFtZSwgc2hhLCBtaW1lVHlwZSwgbmFtZSkge1xuICAgIGxldCBwYXlsb2FkID0ge1xuICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICBpc0RpcmVjdG9yeTogbWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgICAgICAgICAgbWltZVR5cGUsXG4gICAgICAgICAgICAgICAgc2hhXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9O1xuICAgIHJldHVybiBhd2FpdCBOZXR3b3JrLnB1dERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vcGx1Z2lucy9wbGF5bGlzdHMvJHtwbGF5bGlzdE5hbWV9YCwgcGF5bG9hZCk7XG59XG5leHBvcnRzLnB1dEl0ZW1Ub1BsYXlsaXN0ID0gcHV0SXRlbVRvUGxheWxpc3Q7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXN0LmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDEgeC1pZD1cInRpdGxlXCIgY2xhc3M9XCJhbmltYXRlZC0tcXVpY2tcIj5SYWNjb29uPC9oMT5cbiAgICAgICAgPGg0IHgtaWQ9XCJzdWJUaXRsZVwiPlNlYXJjaCBmb3Igc29uZ3M8L2g0PlxuICAgICAgICA8Zm9ybSB4LWlkPVwiZm9ybVwiIGNsYXNzPVwibXVpLWZvcm0tLWlubGluZVwiPlxuICAgICAgICAgICAgPCEtLXRoaXMgaXMgYSBsaXR0bGUgaGFjayB0byBoYXZlIHRoaW5ncyBjZW50ZXJlZC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiPvCflI08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktdGV4dGZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHgtaWQ9XCJ0ZXJtXCIgdHlwZT1cInRleHRcIiBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIiBhdXRvZm9jdXM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gcm9sZT1cInN1Ym1pdFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+8J+UjTwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDxzcGFuPjxhIHgtaWQ9J2F1ZGlvTW9kZScgaHJlZj1cIiNcIj7wn462PC9hPiZuYnNwOzxhIHgtaWQ9J2ltYWdlTW9kZScgaHJlZj1cIiNcIj7vuI/wn46e77iPPC9hPjwvc3Bhbj5cbiAgICAgICAgPGJyIC8+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5zZWFyY2hQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBkaXNwbGF5VGl0bGU6ICh0ZW1wbGF0ZSwgZGlzcGxheWVkKSA9PiB7XG4gICAgICAgIGlmIChkaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLnRpdGxlLmNsYXNzTGlzdC5yZW1vdmUoJ2hleGEtLXJlZHVjZWQnKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLnN1YlRpdGxlLnN0eWxlLmRpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QuYWRkKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zdWJUaXRsZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IEF1dGggPSByZXF1aXJlKFwiLi9hdXRoXCIpO1xuY29uc3QgdGVtcGxhdGUgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDE+U2V0dGluZ3M8L2gxPlxuICAgICAgICA8aDI+WW91dHViZSBEb3dubG9hZDwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdWktcGFuZWxcIj5cbiAgICAgICAgICAgIDxmb3JtIHgtaWQ9XCJ5b3V0dWJlZGxGb3JtXCIgY2xhc3M9XCJtdWktZm9ybVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktdGV4dGZpZWxkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB4LWlkPVwieW91dHViZWRsVXJsXCIgdHlwZT1cInRleHRcIj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHJvbGU9XCJzdWJtaXRcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPkRvd25sb2FkPC9idXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8YSB4LWlkPVwieW91dHViZURsUGxheWxpc3RMaW5rXCIgaHJlZj0nIyc+R28gdG8gWW91dHViZSBkb3dubG9hZGVkIGxpc3Q8L2E+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxoMj5SdW5uaW5nIGpvYnM8L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLXBhbmVsXCI+XG4gICAgICAgICAgICA8cHJlIHgtaWQ9XCJydW5uaW5nSm9ic1wiPjwvcHJlPlxuICAgICAgICAgICAgPGJ1dHRvbiB4LWlkPVwicmVmcmVzaEpvYnNcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPlJlZnJlc2g8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+ICAgIFxuPC9kaXY+YDtcbmFzeW5jIGZ1bmN0aW9uIHJlZnJlc2hKb2JzKGVscykge1xuICAgIGxldCByZXMgPSBhd2FpdCBSZXN0LmdldEpvYnMoKTtcbiAgICBsZXQgam9icyA9IFtdO1xuICAgIGlmIChyZXMucnVubmluZylcbiAgICAgICAgam9icy5wdXNoKHJlcy5ydW5uaW5nKTtcbiAgICBpZiAocmVzLndhaXRpbmcpXG4gICAgICAgIGpvYnMgPSBqb2JzLmNvbmNhdChyZXMud2FpdGluZyk7XG4gICAgZWxzLnJ1bm5pbmdKb2JzLmlubmVySFRNTCA9IGBcbiAgICAgICAgPHRhYmxlIGNsYXNzPVwibXVpLXRhYmxlXCI+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgIDx0aD5TdGF0ZTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlR5cGU8L3RoPlxuICAgICAgICAgICAgICAgIDx0aD5OYW1lPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAke2pvYnMubWFwKChqb2IsIGluZGV4KSA9PiBgPHRyPjx0ZD4ke2luZGV4ID09IDAgPyAnUnVubmluZycgOiAnV2FpdGluZyd9PC90ZD48dGQ+JHtqb2IuY2xpZW50TmFtZX08L3RkPjx0ZD4ke2pvYi5uYW1lfTwvdGQ+PC90cj5gKS5qb2luKCcnKX1cbiAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgIDwvdGFibGU+YDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBsZXQgZWxzID0gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZSk7XG4gICAgZWxzLnlvdXR1YmVkbEZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgICAgICBhd2FpdCBSZXN0LmVucXVldWVZb3V0dWJlRG93bmxvYWQoZWxzLnlvdXR1YmVkbFVybC52YWx1ZSk7XG4gICAgICAgIGVscy55b3V0dWJlZGxVcmwudmFsdWUgPSAnJztcbiAgICAgICAgZWxzLnlvdXR1YmVkbFVybC5ibHVyKCk7XG4gICAgICAgIE1lc3NhZ2VzLmRpc3BsYXlNZXNzYWdlKGBEb3dubG9hZGluZyBmcm9tIHlvdXR1YmVgLCAxKTtcbiAgICAgICAgcmVmcmVzaEpvYnMoZWxzKTtcbiAgICB9KTtcbiAgICBBdXRoLm1lKCkudGhlbih1c2VyID0+IHtcbiAgICAgICAgZWxzLnlvdXR1YmVEbFBsYXlsaXN0TGluay5ocmVmID0gYCMvcmVmcy9QTFVHSU4tWU9VVFVCRURPV05MT0FELSR7dXNlci51dWlkLnRvVXBwZXJDYXNlKCl9YDtcbiAgICB9KTtcbiAgICBlbHMucmVmcmVzaEpvYnMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgICAgICByZWZyZXNoSm9icyhlbHMpO1xuICAgIH0pO1xuICAgIHJlZnJlc2hKb2JzKGVscyk7XG4gICAgcmV0dXJuIGVscztcbn1cbmV4cG9ydHMuY3JlYXRlID0gY3JlYXRlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2V0dGluZ3MtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgTWVzc2FnZXMgPSByZXF1aXJlKFwiLi9tZXNzYWdlc1wiKTtcbmNvbnN0IHdhaXQgPSAoZHVyYXRpb24pID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbikpO1xuY29uc3QgcmFuZCA9IG1heCA9PiBNYXRoLmZsb29yKG1heCAqIE1hdGgucmFuZG9tKCkpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lcic+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyPlNsaWRlc2hvdzwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cIml0ZW1zXCIgY2xhc3M9XCJtdWktcGFuZWwgeC1zbGlkZXNob3dcIj48L2Rpdj5cbiAgICAgICAgc3BlZWQ6IDxpbnB1dCB4LWlkPVwic3BlZWRcIiB0eXBlPVwicmFuZ2VcIiBtaW49XCI1MFwiIG1heD1cIjMwMDBcIiB2YWx1ZT1cIjIwMDBcIi8+XG4gICAgICAgIG5iIHJvd3M6IDxpbnB1dCB4LWlkPVwibmJSb3dzXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIjFcIiBtYXg9XCIxNTBcIiB2YWx1ZT1cIjFcIi8+XG4gICAgICAgIG5iIGltYWdlczogPGlucHV0IHgtaWQ9XCJuYkltYWdlc1wiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgbWF4PVwiMTAwXCIgdmFsdWU9XCIzXCIvPlxuICAgICAgICBpbnRlcnZhbDogPGlucHV0IHgtaWQ9XCJpbnRlcnZhbFwiIHR5cGU9XCJudW1iZXJcIiBtaW49XCIxXCIgbWF4PVwiMzY1XCIgdmFsdWU9XCIxNVwiIHZhbHVlPVwiNTBcIi8+XG4gICAgICAgIDxpbnB1dCB4LWlkPVwiZGF0ZVwiIHR5cGU9XCJyYW5nZVwiIG1pbj1cIi0kezM2NSAqIDIwfVwiIG1heD1cIjBcIiB2YWx1ZT1cIjBcIiBzdHlsZT1cIndpZHRoOjEwMCU7XCIvPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJyZW1hcmtcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5mdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgbGV0IGVscyA9IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKTtcbiAgICBjb25zdCByZW1vdmVSYW5kb21JbWFnZSA9ICgpID0+IHtcbiAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IHBpY2tSYW5kb21JbWFnZSgpO1xuICAgICAgICBpZiAoaW1hZ2VFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gaW1hZ2VFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICBwYXJlbnQucmVtb3ZlQ2hpbGQoaW1hZ2VFbGVtZW50KTtcbiAgICAgICAgICAgIGlmICghcGFyZW50LmNoaWxkcmVuLmxlbmd0aClcbiAgICAgICAgICAgICAgICBwYXJlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChwYXJlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZUVsZW1lbnQ7XG4gICAgfTtcbiAgICBjb25zdCBhZGRSYW5kb21JbWFnZSA9IChuYkRlc2lyZWRSb3dzKSA9PiB7XG4gICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgbGV0IHJvdyA9IG51bGw7XG4gICAgICAgIGlmIChlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoIDwgbmJEZXNpcmVkUm93cykge1xuICAgICAgICAgICAgcm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBlbHMuaXRlbXMuYXBwZW5kQ2hpbGQocm93KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJvdyA9IGVscy5pdGVtcy5jaGlsZHJlbi5pdGVtKHJhbmQoZWxzLml0ZW1zLmNoaWxkcmVuLmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICAgIHJvdy5hcHBlbmRDaGlsZChpbWFnZUVsZW1lbnQpO1xuICAgICAgICByZXR1cm4gaW1hZ2VFbGVtZW50O1xuICAgIH07XG4gICAgY29uc3QgcGlja1JhbmRvbUltYWdlID0gKCkgPT4ge1xuICAgICAgICBsZXQgcG9zc2libGVFbGVtZW50cyA9IFtdO1xuICAgICAgICBmb3IgKGxldCByb3cgb2YgZWxzLml0ZW1zLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbWcgb2Ygcm93LmNoaWxkcmVuKVxuICAgICAgICAgICAgICAgIHBvc3NpYmxlRWxlbWVudHMucHVzaChpbWcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcG9zc2libGVFbGVtZW50cy5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHBvc3NpYmxlRWxlbWVudHNbcmFuZChwb3NzaWJsZUVsZW1lbnRzLmxlbmd0aCldO1xuICAgIH07XG4gICAgY29uc3QgZW51bUltYWdlcyA9IChzKSA9PiB7XG4gICAgICAgIGZvciAobGV0IHJvd0lkeCA9IDA7IHJvd0lkeCA8IGVscy5pdGVtcy5jaGlsZHJlbi5sZW5ndGg7IHJvd0lkeCsrKSB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSBlbHMuaXRlbXMuY2hpbGRyZW4uaXRlbShyb3dJZHgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3cuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzLmFkZChyb3cuY2hpbGRyZW4uaXRlbShpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGltYWdlc0NvdW50ID0gKCkgPT4ge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBmb3IgKGxldCByb3dJZHggPSAwOyByb3dJZHggPCBlbHMuaXRlbXMuY2hpbGRyZW4ubGVuZ3RoOyByb3dJZHgrKykge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gZWxzLml0ZW1zLmNoaWxkcmVuLml0ZW0ocm93SWR4KTtcbiAgICAgICAgICAgIGNvdW50ICs9IHJvdy5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH07XG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IHBvc3NpYmxlSW1hZ2VzID0gW107XG4gICAgICAgIGxldCBsYXN0U2VhcmNoRGF0ZSA9IG51bGw7XG4gICAgICAgIGxldCBsYXN0U2VhcmNoSW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICBsZXQgY3VycmVudE9mZnNldCA9IDA7XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlO1xuICAgICAgICBsZXQgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVGcm9tTm93SW5NcyA9IChwYXJzZUludChlbHMuZGF0ZS52YWx1ZSB8fCAnMCcpKSAqIDEwMDAgKiA2MCAqIDYwICogMjQ7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJbkRheXMgPSBwYXJzZUludChlbHMuaW50ZXJ2YWwudmFsdWUpIHx8IDE7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWxJbk1zID0gaW50ZXJ2YWxJbkRheXMgKiAxMDAwICogNjAgKiA2MCAqIDI0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iV2FudGVkSW1hZ2VzID0gcGFyc2VJbnQoZWxzLm5iSW1hZ2VzLnZhbHVlKSB8fCAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5iRGVzaXJlZFJvd3MgPSBwYXJzZUludChlbHMubmJSb3dzLnZhbHVlKSB8fCAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdhaXREdXJhdGlvbkluTXMgPSBwYXJzZUludChlbHMuc3BlZWQudmFsdWUpIHx8IDIwMDA7XG4gICAgICAgICAgICAgICAgbGV0IGNlbnRlciA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgdGltZUZyb21Ob3dJbk1zO1xuICAgICAgICAgICAgICAgIGxldCBkb1NlYXJjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChsYXN0U2VhcmNoRGF0ZSAhPSB0aW1lRnJvbU5vd0luTXMgfHwgbGFzdFNlYXJjaEludGVydmFsICE9IGludGVydmFsSW5Ncykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZG9TZWFyY2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBhbGwgY3VycmVudCBpbWFnZXMgYXJlIG5vIG1vcmUgcGFydCBvZiB0aGUgbGFzdCBzZWFyY2hcbiAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUgPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIGVudW1JbWFnZXModG9SZW1vdmUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICghcG9zc2libGVJbWFnZXMgfHwgIXBvc3NpYmxlSW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkb1NlYXJjaCA9ICFmaW5pc2hlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRvU2VhcmNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWFyY2hEYXRlID0gdGltZUZyb21Ob3dJbk1zO1xuICAgICAgICAgICAgICAgICAgICBsYXN0U2VhcmNoSW50ZXJ2YWwgPSBpbnRlcnZhbEluTXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBkbyBhIHNlYXJjaCBvbiAke2NlbnRlcn0gKy8tICR7aW50ZXJ2YWxJbkRheXN9IEAgJHtjdXJyZW50T2Zmc2V0fWApO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbWVUeXBlOiAnaW1hZ2UvJScsXG4gICAgICAgICAgICAgICAgICAgICAgICBub0RpcmVjdG9yeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbWl0OiAxMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogY3VycmVudE9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVNaW46IGNlbnRlciAtIGludGVydmFsSW5NcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVNYXg6IGNlbnRlciArIGludGVydmFsSW5Nc1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUmVzdC5zZWFyY2hFeChzZWFyY2hTcGVjKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zc2libGVJbWFnZXMgPSByZXN1bHRzICYmIHJlc3VsdHMuaXRlbXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUltYWdlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50T2Zmc2V0ICs9IHBvc3NpYmxlSW1hZ2VzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE9mZnNldCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gcG9zc2libGVJbWFnZXMubGVuZ3RoID09IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZUltYWdlcyAmJiBwb3NzaWJsZUltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxzLnJlbWFyay5pbm5lckhUTUwgPSBgJHtuZXcgRGF0ZShjZW50ZXIpLnRvRGF0ZVN0cmluZygpfSA6ICR7bmJXYW50ZWRJbWFnZXN9IGltYWdlcyBvbiAke25iRGVzaXJlZFJvd3N9IHJvd3MgKy8tICR7aW50ZXJ2YWxJbkRheXN9IGRheXMgKEAke2N1cnJlbnRPZmZzZXR9KWA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZXNDb3VudCgpID4gbmJXYW50ZWRJbWFnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZUVsZW1lbnQgPSByZW1vdmVSYW5kb21JbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZS5oYXMoaW1hZ2VFbGVtZW50KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZXNDb3VudCgpIDwgbmJXYW50ZWRJbWFnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUVsZW1lbnQgPSBhZGRSYW5kb21JbWFnZShuYkRlc2lyZWRSb3dzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IHBpY2tSYW5kb21JbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRvUmVtb3ZlLmhhcyhpbWFnZUVsZW1lbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvUmVtb3ZlLmRlbGV0ZShpbWFnZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlSW5kZXggPSByYW5kKHBvc3NpYmxlSW1hZ2VzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgW3VzZWRJbWFnZV0gPSBwb3NzaWJsZUltYWdlcy5zcGxpY2UoaW1hZ2VJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlZEltYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5zcmMgPSBSZXN0LmdldFNoYUltYWdlVGh1bWJuYWlsVXJsKHVzZWRJbWFnZS5zaGEsIHVzZWRJbWFnZS5taW1lVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVscy5yZW1hcmsuaW5uZXJIVE1MID0gYCR7bmV3IERhdGUoY2VudGVyKS50b0RhdGVTdHJpbmcoKX0sIG5vIG1vcmUgaW1hZ2UsIGNoYW5nZSB0aGUgY3Vyc29yc2A7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1JlbW92ZS5zaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2VFbGVtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZm9yRWFjaChpbWFnZUVsZW1lbnQgPT4gaW1hZ2VFbGVtZW50cy5wdXNoKGltYWdlRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlRWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlRWxlbWVudCA9IGltYWdlRWxlbWVudHNbcmFuZChpbWFnZUVsZW1lbnRzLmxlbmd0aCldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9SZW1vdmUuZGVsZXRlKGltYWdlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgd2FpdCh3YWl0RHVyYXRpb25Jbk1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBNZXNzYWdlcy5kaXNwbGF5TWVzc2FnZShgZXJyb3IgaW4gc2xpZGVzaG93LCB3YWl0aW5nIDVzYCwgLTEpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHdhaXQoNTAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBlbHM7XG59XG5leHBvcnRzLmNyZWF0ZSA9IGNyZWF0ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNsaWRlc2hvdy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgZWxlbWVudHNEYXRhID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbihvYmosIGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IFVpVG9vbHMuZWxGcm9tSHRtbChodG1sKTtcbiAgICBvYmpbJ3Jvb3QnXSA9IHJvb3Q7XG4gICAgVWlUb29scy5lbHMocm9vdCwgYFt4LWlkXWApLmZvckVhY2goZSA9PiBvYmpbZS5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSBlKTtcbiAgICBpZiAocm9vdC5oYXNBdHRyaWJ1dGUoJ3gtaWQnKSlcbiAgICAgICAgb2JqW3Jvb3QuZ2V0QXR0cmlidXRlKCd4LWlkJyldID0gcm9vdDtcbiAgICBlbGVtZW50c0RhdGEuc2V0KHJvb3QsIG9iaik7XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5leHBvcnRzLmNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbiA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbjtcbmZ1bmN0aW9uIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpIHtcbiAgICBjb25zdCBkYXRhID0gZWxlbWVudHNEYXRhLmdldChyb290KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbmV4cG9ydHMuZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEgPSBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YTtcbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UoaHRtbCkge1xuICAgIGxldCByb290ID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKHt9LCBodG1sKTtcbiAgICByZXR1cm4gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCk7XG59XG5leHBvcnRzLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UgPSBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlO1xuY29uc3QgRU1QVFlfTE9DQVRJT04gPSB7IGVsZW1lbnQ6IG51bGwsIGNoaWxkSW5kZXg6IC0xIH07XG5mdW5jdGlvbiB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZWxlbWVudHMsIGV2ZW50KSB7XG4gICAgbGV0IGVscyA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyhlbGVtZW50cykpO1xuICAgIGxldCBjID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBwID0gbnVsbDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChlbHMuaGFzKGMpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgICAgICAgY2hpbGRJbmRleDogcCAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMuY2hpbGRyZW4sIHApXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjID09IGVsZW1lbnRzLnJvb3QpXG4gICAgICAgICAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG4gICAgICAgIHAgPSBjO1xuICAgICAgICBjID0gYy5wYXJlbnRFbGVtZW50O1xuICAgIH0gd2hpbGUgKGMpO1xuICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbn1cbmV4cG9ydHMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uID0gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGVzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZWwoaWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufVxuZXhwb3J0cy5lbCA9IGVsO1xuZnVuY3Rpb24gZWxzKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmVscyA9IGVscztcbmZ1bmN0aW9uIGVsRnJvbUh0bWwoaHRtbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBwYXJlbnQuY2hpbGRyZW4uaXRlbSgwKTtcbn1cbmV4cG9ydHMuZWxGcm9tSHRtbCA9IGVsRnJvbUh0bWw7XG5mdW5jdGlvbiBzdG9wRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxuZXhwb3J0cy5zdG9wRXZlbnQgPSBzdG9wRXZlbnQ7XG5mdW5jdGlvbiogaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChzdGFydCkge1xuICAgIHdoaWxlIChzdGFydCkge1xuICAgICAgICB5aWVsZCBzdGFydDtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmV4cG9ydHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudCA9IGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11aS10b29sLmpzLm1hcCJdLCJzb3VyY2VSb290IjoiIn0=
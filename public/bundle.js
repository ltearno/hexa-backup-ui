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
const PLAYER = 'player';
const PLAYLIST = 'playlist';
const EXPANDER = 'expander';
const templateHtml = `
<div class="audio-footer mui-panel">
    <h3 class="x-when-large-display">Playlist</h3>
    <div x-id="${PLAYLIST}"></div>
    <div x-id="${EXPANDER}" class="onclick mui--text-center">☰</div>
    <audio x-id="${PLAYER}" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>
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
            console.error(`error`, err);
        }
        this.audioPanel.player.addEventListener('ended', () => {
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
        this.expandedElements = UiTools.els(this.audioPanel.root, '.x-when-large-display');
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
const Rest = __webpack_require__(/*! ./rest */ "./public/rest.js");
const Auth = __webpack_require__(/*! ./auth */ "./public/auth.js");
const Templates = __webpack_require__(/*! ./templates */ "./public/templates.js");
let contents = [];
function addContent(content) {
    contents.push(content);
    UiTool.el('content-wrapper').insertBefore(content, UiTool.el('first-element-after-contents'));
}
function clearContents() {
    const contentWrapper = UiTool.el('content-wrapper');
    contents.forEach(element => contentWrapper.removeChild(element));
    contents = [];
}
const searchPanel = SearchPanel.searchPanel.create();
const searchResultPanel = SearchResultPanel.searchResultPanel.create();
const audioPanel = AudioPanel.audioPanel.create();
document.body.appendChild(audioPanel.root);
addContent(searchPanel.root);
const audioJukebox = new AudioPanel.AudioJukebox(audioPanel);
Auth.autoRenewAuth();
/**
 * Events
 */
let lastDisplayedFiles = null;
let lastSearchTerm = null; // HACK very temporary
searchPanel.form.addEventListener('submit', async (event) => {
    UiTool.stopEvent(event);
    let term = searchPanel.term.value;
    SearchPanel.searchPanel.displayTitle(searchPanel, false);
    SearchResultPanel.searchResultPanel.displaySearching(searchResultPanel, term);
    if (!searchResultPanel.root.isConnected)
        addContent(searchResultPanel.root);
    let res = await Rest.search(term, 'audio/%');
    // arrange and beautify names
    res.items = res.items.map(file => {
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
    lastDisplayedFiles = res.items;
    lastSearchTerm = term;
    SearchResultPanel.searchResultPanel.setValues(searchResultPanel, {
        term: searchPanel.term.value,
        items: res.items
    });
});
searchResultPanel.root.addEventListener('click', event => {
    // todo : knownledge to do that is in files-panel
    let { element, childIndex } = Templates.templateGetEventLocation(searchResultPanel, event);
    if (lastDisplayedFiles && element == searchResultPanel.files && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
        audioJukebox.addAndPlay(lastDisplayedFiles[childIndex]);
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
                            return `then '${unrolledItems[unrollIndex].name.substr(0, 20)}' and ${unrolledItems.length - unrollIndex - 1} other '${term}' searched items...`;
                        return `finished '${term} songs`;
                    },
                    unroll: () => unrolledItems[unrollIndex++],
                    hasNext: () => unrollIndex >= 0 && unrollIndex < unrolledItems.length
                });
            }
        }
    }
});
//# sourceMappingURL=index.js.map

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
    return fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrer: 'no-referrer',
        headers
    })
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
const TID_Title = 'title';
const TID_SearchForm = 'form';
const TID_SearchTerm = 'term';
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h1 x-id="${TID_Title}" class="animated--quick">Raccoon</h1>
        <form x-id="${TID_SearchForm}" class="mui-form--inline">
            <!--this is a little hack to have things centered-->
            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>
            <div class="mui-textfield mui-textfield--float-label">
                <input x-id="${TID_SearchTerm}" type="text" style="text-align: center;" autofocus>
                <label>Search an audio title</label>
            </div>
            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>
        </form>
        <br />
    </div>
</div>`;
exports.searchPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    displayTitle: (template, displayed) => {
        if (displayed)
            template.title.classList.remove('hexa--reduced');
        else
            template.title.classList.add('hexa--reduced');
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
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="files"></div>
    </div>
</div>`;
exports.searchResultPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    displaySearching: (elements, term) => {
        elements.title.innerHTML = `<div class="mui--text-dark-hint">Searching '${term}' ...</div>`;
    },
    setValues: (elements, values) => {
        elements.title.innerHTML = `Results for '${values.term}'`;
        if (values.items && values.items.length) {
            elements.files.innerHTML = values.items.map(f => {
                if (f.mimeType == 'application/directory')
                    return `<div class="onclick">-> <i>${f.name}</i></div>`;
                return `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`;
            }).join('');
        }
        else {
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbmV0d29yay5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zZWFyY2gtcmVzdWx0LXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy90ZW1wbGF0ZXMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3VpLXRvb2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQSxDQUFjO0FBQ2QsOENB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QUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSwrQzs7Ozs7Ozs7Ozs7O0FDN0JBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RCxnQkFBZ0IsbUJBQU8sQ0FBQyxzQ0FBVztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxxQzs7Ozs7Ozs7Ozs7O0FDMUNBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9wdWJsaWMvaW5kZXguanNcIik7XG4iLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBVaVRvb2xzID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IFBMQVlFUiA9ICdwbGF5ZXInO1xuY29uc3QgUExBWUxJU1QgPSAncGxheWxpc3QnO1xuY29uc3QgRVhQQU5ERVIgPSAnZXhwYW5kZXInO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz1cImF1ZGlvLWZvb3RlciBtdWktcGFuZWxcIj5cbiAgICA8aDMgY2xhc3M9XCJ4LXdoZW4tbGFyZ2UtZGlzcGxheVwiPlBsYXlsaXN0PC9oMz5cbiAgICA8ZGl2IHgtaWQ9XCIke1BMQVlMSVNUfVwiPjwvZGl2PlxuICAgIDxkaXYgeC1pZD1cIiR7RVhQQU5ERVJ9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1jZW50ZXJcIj7imLA8L2Rpdj5cbiAgICA8YXVkaW8geC1pZD1cIiR7UExBWUVSfVwiIGNsYXNzPVwiYXVkaW8tcGxheWVyXCIgY2xhc3M9XCJtdWktLXB1bGwtcmlnaHRcIiBjb250cm9scyBwcmVsb2FkPVwibWV0YWRhdGFcIj48L2F1ZGlvPlxuPC9kaXY+YDtcbmV4cG9ydHMuYXVkaW9QYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBwbGF5OiAoZWxlbWVudHMsIG5hbWUsIHNoYSwgbWltZVR5cGUpID0+IHtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgnc3JjJywgYCR7UmVzdC5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2hhLyR7c2hhfS9jb250ZW50P3R5cGU9JHttaW1lVHlwZX1gKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnNldEF0dHJpYnV0ZSgndHlwZScsIG1pbWVUeXBlKTtcbiAgICAgICAgZWxlbWVudHMucGxheWVyLnBsYXkoKTtcbiAgICAgICAgZWxlbWVudHMucm9vdC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtaGlkZGVuXCIpO1xuICAgIH0sXG59O1xuY2xhc3MgQXVkaW9KdWtlYm94IHtcbiAgICBjb25zdHJ1Y3RvcihhdWRpb1BhbmVsKSB7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbCA9IGF1ZGlvUGFuZWw7XG4gICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAtMTtcbiAgICAgICAgLy8gaWYgc2Nyb2xsIHRvIHBsYXlpbmcgaXRlbSBpcyByZXF1aXJlZCBhZnRlciBhIHBsYXlsaXN0IHJlZHJhd1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHF1ZXVlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncGxheWxpc3QtYmFja3VwJykpO1xuICAgICAgICAgICAgaWYgKHF1ZXVlICYmIHF1ZXVlIGluc3RhbmNlb2YgQXJyYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IHF1ZXVlO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yYCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdzdGFsbGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YWxsZWQsIHRyeSBuZXh0Jyk7XG4gICAgICAgICAgICB0aGlzLnBsYXlOZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwuZXhwYW5kZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9ICF0aGlzLmxhcmdlRGlzcGxheTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBlIG9mIFVpVG9vbHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhBdHRyID0gZS5nZXRBdHRyaWJ1dGUoJ3gtcXVldWUtaW5kZXgnKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4QXR0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoaW5kZXhBdHRyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSBOYU4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXlOZXh0VW5yb2xsZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gdGVtcGxhdGVzXzEudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKHRoaXMuYXVkaW9QYW5lbCwgZXZlbnQpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0ICYmIGNoaWxkSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgPT0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnF1ZXJ5U2VsZWN0b3IoYFt4LWlkPSdjbGVhci1wbGF5bGlzdCddYCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbY3VycmVudEl0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdwbGF5bGlzdC1iYWNrdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMgPSBVaVRvb2xzLmVscyh0aGlzLmF1ZGlvUGFuZWwucm9vdCwgJy54LXdoZW4tbGFyZ2UtZGlzcGxheScpO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBjdXJyZW50SXRlbSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgMCB8fCB0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgfVxuICAgIGFkZEFuZFBsYXkoaXRlbSkge1xuICAgICAgICBpdGVtID0ge1xuICAgICAgICAgICAgc2hhOiBpdGVtLnNoYSxcbiAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBpdGVtLm1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLnNoYSA9PSBpdGVtLnNoYSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgIH1cbiAgICBwbGF5TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlOZXh0VW5yb2xsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1VbnJvbGxlci51bnJvbGwoKTtcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRJdGVtVW5yb2xsZXIoaXRlbVVucm9sbGVyKSB7XG4gICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gaXRlbVVucm9sbGVyO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBwdXNoUXVldWVBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGl0ZW0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncGxheWxpc3QtYmFja3VwJywgSlNPTi5zdHJpbmdpZnkodGhpcy5xdWV1ZSkpO1xuICAgICAgICB0aGlzLnBsYXkodGhpcy5xdWV1ZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgcGxheShpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucXVldWVbaW5kZXhdO1xuICAgICAgICAgICAgZXhwb3J0cy5hdWRpb1BhbmVsLnBsYXkodGhpcy5hdWRpb1BhbmVsLCBpdGVtLm5hbWUsIGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFt4LWZvci1zaGE9JyR7aXRlbS5zaGEuc3Vic3RyKDAsIDUpfSddYCkuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LmFkZCgnaXMtd2VpZ2h0ZWQnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAodGhpcy5yZWZyZXNoVGltZXIpXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZWZyZXNoVGltZXIpO1xuICAgICAgICB0aGlzLnJlZnJlc2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZWFsUmVmcmVzaFBsYXlsaXN0KCksIDEwKTtcbiAgICB9XG4gICAgcmVhbFJlZnJlc2hQbGF5bGlzdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnF1ZXVlIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5KVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj5UaGVyZSBhcmUgbm8gaXRlbXMgaW4geW91ciBwbGF5bGlzdC4gQ2xpY2sgb24gc29uZ3MgdG8gcGxheSB0aGVtLjwvc3Bhbj4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaHRtbCA9IGBgO1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMucXVldWVbaV07XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwoaSwgaXRlbS5uYW1lLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj48YSB4LWlkPSdjbGVhci1wbGF5bGlzdCcgaHJlZj0nIyc+Y2xlYXIgcGxheWxpc3Q8L2E+PC9kaXY+YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gMCAmJiB0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwodGhpcy5jdXJyZW50SW5kZXgsIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdLm5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5jdXJyZW50SW5kZXggKyAxfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj5mb2xsb3dlZCBieSAnJHt0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4ICsgMV0ubmFtZS5zdWJzdHIoMCwgMjApfScgLi4uPC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIC8vIGFmdGVyIHJlZnJlc2ggc3RlcHNcbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5ICYmIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsVG9wID0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5bGlzdEl0ZW1IdG1sKGluZGV4LCBuYW1lLCBvbmVMaW5lVGV4dCkge1xuICAgICAgICByZXR1cm4gYDxkaXYgeC1xdWV1ZS1pbmRleD1cIiR7aW5kZXh9XCIgY2xhc3M9XCJvbmNsaWNrICR7b25lTGluZVRleHQgPyAnaXMtb25lbGluZXRleHQnIDogJyd9ICR7aW5kZXggPT0gdGhpcy5jdXJyZW50SW5kZXggPyAnbXVpLS10ZXh0LWhlYWRsaW5lJyA6ICcnfVwiPiR7bmFtZX08L2Rpdj5gO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9KdWtlYm94ID0gQXVkaW9KdWtlYm94O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXVkaW8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmZ1bmN0aW9uIHdhaXQoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKSk7XG59XG5jbGFzcyBBdXRoIHtcbiAgICBvbkVycm9yKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfVxuICAgIGFzeW5jIGxvb3AoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL2F1dGhgKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlcyA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9zZXRDb29raWVgLCB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Jlc3BvbnNlLnRva2VufWAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzIHx8ICFyZXMubGlmZXRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBzZXRDb29raWVgLCByZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBvYnRhaW4gYXV0aCB0b2tlbmApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHJlZnJlc2ggYXV0aCAoJHtlcnJ9KWApO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXZlcnkgMzAgbWludXRlc1xuICAgICAgICAgICAgYXdhaXQgd2FpdCgxMDAwICogNjAgKiAzMCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhdXRvUmVuZXdBdXRoKCkge1xuICAgIGxldCBhdXRoID0gbmV3IEF1dGgoKTtcbiAgICBhdXRoLmxvb3AoKTtcbn1cbmV4cG9ydHMuYXV0b1JlbmV3QXV0aCA9IGF1dG9SZW5ld0F1dGg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRoLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgVWlUb29sID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IFNlYXJjaFBhbmVsID0gcmVxdWlyZShcIi4vc2VhcmNoLXBhbmVsXCIpO1xuY29uc3QgU2VhcmNoUmVzdWx0UGFuZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtcmVzdWx0LXBhbmVsXCIpO1xuY29uc3QgQXVkaW9QYW5lbCA9IHJlcXVpcmUoXCIuL2F1ZGlvLXBhbmVsXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBBdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbmNvbnN0IFRlbXBsYXRlcyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmxldCBjb250ZW50cyA9IFtdO1xuZnVuY3Rpb24gYWRkQ29udGVudChjb250ZW50KSB7XG4gICAgY29udGVudHMucHVzaChjb250ZW50KTtcbiAgICBVaVRvb2wuZWwoJ2NvbnRlbnQtd3JhcHBlcicpLmluc2VydEJlZm9yZShjb250ZW50LCBVaVRvb2wuZWwoJ2ZpcnN0LWVsZW1lbnQtYWZ0ZXItY29udGVudHMnKSk7XG59XG5mdW5jdGlvbiBjbGVhckNvbnRlbnRzKCkge1xuICAgIGNvbnN0IGNvbnRlbnRXcmFwcGVyID0gVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKTtcbiAgICBjb250ZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY29udGVudFdyYXBwZXIucmVtb3ZlQ2hpbGQoZWxlbWVudCkpO1xuICAgIGNvbnRlbnRzID0gW107XG59XG5jb25zdCBzZWFyY2hQYW5lbCA9IFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmNyZWF0ZSgpO1xuY29uc3Qgc2VhcmNoUmVzdWx0UGFuZWwgPSBTZWFyY2hSZXN1bHRQYW5lbC5zZWFyY2hSZXN1bHRQYW5lbC5jcmVhdGUoKTtcbmNvbnN0IGF1ZGlvUGFuZWwgPSBBdWRpb1BhbmVsLmF1ZGlvUGFuZWwuY3JlYXRlKCk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1ZGlvUGFuZWwucm9vdCk7XG5hZGRDb250ZW50KHNlYXJjaFBhbmVsLnJvb3QpO1xuY29uc3QgYXVkaW9KdWtlYm94ID0gbmV3IEF1ZGlvUGFuZWwuQXVkaW9KdWtlYm94KGF1ZGlvUGFuZWwpO1xuQXV0aC5hdXRvUmVuZXdBdXRoKCk7XG4vKipcbiAqIEV2ZW50c1xuICovXG5sZXQgbGFzdERpc3BsYXllZEZpbGVzID0gbnVsbDtcbmxldCBsYXN0U2VhcmNoVGVybSA9IG51bGw7IC8vIEhBQ0sgdmVyeSB0ZW1wb3JhcnlcbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgbGV0IHRlcm0gPSBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlO1xuICAgIFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmRpc3BsYXlUaXRsZShzZWFyY2hQYW5lbCwgZmFsc2UpO1xuICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLmRpc3BsYXlTZWFyY2hpbmcoc2VhcmNoUmVzdWx0UGFuZWwsIHRlcm0pO1xuICAgIGlmICghc2VhcmNoUmVzdWx0UGFuZWwucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgYWRkQ29udGVudChzZWFyY2hSZXN1bHRQYW5lbC5yb290KTtcbiAgICBsZXQgcmVzID0gYXdhaXQgUmVzdC5zZWFyY2godGVybSwgJ2F1ZGlvLyUnKTtcbiAgICAvLyBhcnJhbmdlIGFuZCBiZWF1dGlmeSBuYW1lc1xuICAgIHJlcy5pdGVtcyA9IHJlcy5pdGVtcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIGlmIChmaWxlLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKSB7XG4gICAgICAgICAgICBsZXQgZG90ID0gZmlsZS5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICAgICAgICBpZiAoZG90KVxuICAgICAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5zdWJzdHJpbmcoMCwgZG90KTtcbiAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC8nXycvZywgJyAnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nICAnL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvWyBdKi1bIF0qL2csICcgLSAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICB9KTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLnNldFZhbHVlcyhzZWFyY2hSZXN1bHRQYW5lbCwge1xuICAgICAgICB0ZXJtOiBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlLFxuICAgICAgICBpdGVtczogcmVzLml0ZW1zXG4gICAgfSk7XG59KTtcbnNlYXJjaFJlc3VsdFBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgLy8gdG9kbyA6IGtub3dubGVkZ2UgdG8gZG8gdGhhdCBpcyBpbiBmaWxlcy1wYW5lbFxuICAgIGxldCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IFRlbXBsYXRlcy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oc2VhcmNoUmVzdWx0UGFuZWwsIGV2ZW50KTtcbiAgICBpZiAobGFzdERpc3BsYXllZEZpbGVzICYmIGVsZW1lbnQgPT0gc2VhcmNoUmVzdWx0UGFuZWwuZmlsZXMgJiYgY2hpbGRJbmRleCA+PSAwICYmIGNoaWxkSW5kZXggPCBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGF1ZGlvSnVrZWJveC5hZGRBbmRQbGF5KGxhc3REaXNwbGF5ZWRGaWxlc1tjaGlsZEluZGV4XSk7XG4gICAgICAgIC8vIHNldCBhbiB1bnJvbGxlclxuICAgICAgICBpZiAoY2hpbGRJbmRleCA+PSBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgYXVkaW9KdWtlYm94LnNldEl0ZW1VbnJvbGxlcihudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0ZXJtID0gbGFzdFNlYXJjaFRlcm07XG4gICAgICAgICAgICBsZXQgdW5yb2xsZWRJdGVtcyA9IGxhc3REaXNwbGF5ZWRGaWxlcy5zbGljZShjaGlsZEluZGV4ICsgMSkuZmlsdGVyKGYgPT4gZi5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSk7XG4gICAgICAgICAgICBsZXQgdW5yb2xsSW5kZXggPSAwO1xuICAgICAgICAgICAgaWYgKHVucm9sbGVkSXRlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYXVkaW9KdWtlYm94LnNldEl0ZW1VbnJvbGxlcih7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGB0aGVuICcke3Vucm9sbGVkSXRlbXNbdW5yb2xsSW5kZXhdLm5hbWUuc3Vic3RyKDAsIDIwKX0nIGFuZCAke3Vucm9sbGVkSXRlbXMubGVuZ3RoIC0gdW5yb2xsSW5kZXggLSAxfSBvdGhlciAnJHt0ZXJtfScgc2VhcmNoZWQgaXRlbXMuLi5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBmaW5pc2hlZCAnJHt0ZXJtfSBzb25nc2A7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVucm9sbDogKCkgPT4gdW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleCsrXSxcbiAgICAgICAgICAgICAgICAgICAgaGFzTmV4dDogKCkgPT4gdW5yb2xsSW5kZXggPj0gMCAmJiB1bnJvbGxJbmRleCA8IHVucm9sbGVkSXRlbXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuYXN5bmMgZnVuY3Rpb24gYWZ0ZXJGZXRjaChyZXNwb25zZSkge1xuICAgIGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYGJhZCByZXNwb25zZSA6ICR7SlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpfWApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IHJlY2VpdmVkQ29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykgfHwgJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgIGxldCBzY2kgPSByZWNlaXZlZENvbnRlbnRUeXBlLmluZGV4T2YoJzsnKTtcbiAgICBpZiAoc2NpID49IDApXG4gICAgICAgIHJlY2VpdmVkQ29udGVudFR5cGUgPSByZWNlaXZlZENvbnRlbnRUeXBlLnN1YnN0cigwLCBzY2kpO1xuICAgIGlmIChyZWNlaXZlZENvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG59XG5mdW5jdGlvbiBnZXREYXRhKHVybCwgaGVhZGVycyA9IG51bGwpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmdldERhdGEgPSBnZXREYXRhO1xuZnVuY3Rpb24gcG9zdERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLnBvc3REYXRhID0gcG9zdERhdGE7XG5mdW5jdGlvbiBwdXREYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLnB1dERhdGEgPSBwdXREYXRhO1xuZnVuY3Rpb24gZGVsZXRlRGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5kZWxldGVEYXRhID0gZGVsZXRlRGF0YTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW5ldHdvcmsuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmV4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkwgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT0gXCJob21lLmx0ZWNvbnN1bHRpbmcuZnJcIiA/IFwiaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnJcIiA6IFwiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwNVwiO1xuYXN5bmMgZnVuY3Rpb24gc2VhcmNoKHNlYXJjaFRleHQsIG1pbWVUeXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IHNlYXJjaFNwZWMgPSB7XG4gICAgICAgICAgICBuYW1lOiBzZWFyY2hUZXh0LFxuICAgICAgICAgICAgbWltZVR5cGU6IG1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHsgcmVzdWx0RGlyZWN0b3JpZXMsIHJlc3VsdEZpbGVzZGRkLCBpdGVtcyB9ID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zZWFyY2hgLCBzZWFyY2hTcGVjKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzOiByZXN1bHREaXJlY3RvcmllcyxcbiAgICAgICAgICAgIGZpbGVzOiByZXN1bHRGaWxlc2RkZCxcbiAgICAgICAgICAgIGl0ZW1zXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5zZWFyY2ggPSBzZWFyY2g7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZXN0LmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBUSURfVGl0bGUgPSAndGl0bGUnO1xuY29uc3QgVElEX1NlYXJjaEZvcm0gPSAnZm9ybSc7XG5jb25zdCBUSURfU2VhcmNoVGVybSA9ICd0ZXJtJztcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXItZmx1aWQnPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMSB4LWlkPVwiJHtUSURfVGl0bGV9XCIgY2xhc3M9XCJhbmltYXRlZC0tcXVpY2tcIj5SYWNjb29uPC9oMT5cbiAgICAgICAgPGZvcm0geC1pZD1cIiR7VElEX1NlYXJjaEZvcm19XCIgY2xhc3M9XCJtdWktZm9ybS0taW5saW5lXCI+XG4gICAgICAgICAgICA8IS0tdGhpcyBpcyBhIGxpdHRsZSBoYWNrIHRvIGhhdmUgdGhpbmdzIGNlbnRlcmVkLS0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCIgc3R5bGU9XCJ2aXNpYmlsaXR5OiBoaWRkZW47XCI+8J+UjTwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm11aS10ZXh0ZmllbGQgbXVpLXRleHRmaWVsZC0tZmxvYXQtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgeC1pZD1cIiR7VElEX1NlYXJjaFRlcm19XCIgdHlwZT1cInRleHRcIiBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIiBhdXRvZm9jdXM+XG4gICAgICAgICAgICAgICAgPGxhYmVsPlNlYXJjaCBhbiBhdWRpbyB0aXRsZTwvbGFiZWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gcm9sZT1cInN1Ym1pdFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+8J+UjTwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDxiciAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVRpdGxlOiAodGVtcGxhdGUsIGRpc3BsYXllZCkgPT4ge1xuICAgICAgICBpZiAoZGlzcGxheWVkKVxuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LnJlbW92ZSgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QuYWRkKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyIHgtaWQ9XCJ0aXRsZVwiPjwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cImZpbGVzXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5zZWFyY2hSZXN1bHRQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBkaXNwbGF5U2VhcmNoaW5nOiAoZWxlbWVudHMsIHRlcm0pID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+U2VhcmNoaW5nICcke3Rlcm19JyAuLi48L2Rpdj5gO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgUmVzdWx0cyBmb3IgJyR7dmFsdWVzLnRlcm19J2A7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuZmlsZXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChmID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwib25jbGlja1wiPi0+IDxpPiR7Zi5uYW1lfTwvaT48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdiB4LWZvci1zaGE9XCIke2Yuc2hhLnN1YnN0cigwLCA1KX1cIiBjbGFzcz1cIm9uY2xpY2tcIj4ke2YubmFtZX08L2Rpdj5gO1xuICAgICAgICAgICAgfSkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50cy5maWxlcy5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLWhpbnRcIj5ObyByZXN1bHRzPC9kaXY+YDtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2VhcmNoLXJlc3VsdC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgZWxlbWVudHNEYXRhID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbihvYmosIGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IFVpVG9vbHMuZWxGcm9tSHRtbChodG1sKTtcbiAgICBvYmpbJ3Jvb3QnXSA9IHJvb3Q7XG4gICAgVWlUb29scy5lbHMocm9vdCwgYFt4LWlkXWApLmZvckVhY2goZSA9PiBvYmpbZS5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSBlKTtcbiAgICBlbGVtZW50c0RhdGEuc2V0KHJvb3QsIG9iaik7XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5leHBvcnRzLmNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbiA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbjtcbmZ1bmN0aW9uIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpIHtcbiAgICBjb25zdCBkYXRhID0gZWxlbWVudHNEYXRhLmdldChyb290KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbmV4cG9ydHMuZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEgPSBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YTtcbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UoaHRtbCkge1xuICAgIGxldCByb290ID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKHt9LCBodG1sKTtcbiAgICByZXR1cm4gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCk7XG59XG5leHBvcnRzLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UgPSBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlO1xuY29uc3QgRU1QVFlfTE9DQVRJT04gPSB7IGVsZW1lbnQ6IG51bGwsIGNoaWxkSW5kZXg6IC0xIH07XG5mdW5jdGlvbiB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZWxlbWVudHMsIGV2ZW50KSB7XG4gICAgbGV0IGVscyA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyhlbGVtZW50cykpO1xuICAgIGxldCBjID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBwID0gbnVsbDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChlbHMuaGFzKGMpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgICAgICAgY2hpbGRJbmRleDogcCAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMuY2hpbGRyZW4sIHApXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjID09IGVsZW1lbnRzLnJvb3QpXG4gICAgICAgICAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG4gICAgICAgIHAgPSBjO1xuICAgICAgICBjID0gYy5wYXJlbnRFbGVtZW50O1xuICAgIH0gd2hpbGUgKGMpO1xuICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbn1cbmV4cG9ydHMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uID0gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGVzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZWwoaWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufVxuZXhwb3J0cy5lbCA9IGVsO1xuZnVuY3Rpb24gZWxzKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmVscyA9IGVscztcbmZ1bmN0aW9uIGVsRnJvbUh0bWwoaHRtbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBwYXJlbnQuY2hpbGRyZW4uaXRlbSgwKTtcbn1cbmV4cG9ydHMuZWxGcm9tSHRtbCA9IGVsRnJvbUh0bWw7XG5mdW5jdGlvbiBzdG9wRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxuZXhwb3J0cy5zdG9wRXZlbnQgPSBzdG9wRXZlbnQ7XG5mdW5jdGlvbiogaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChzdGFydCkge1xuICAgIHdoaWxlIChzdGFydCkge1xuICAgICAgICB5aWVsZCBzdGFydDtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmV4cG9ydHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudCA9IGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11aS10b29sLmpzLm1hcCJdLCJzb3VyY2VSb290IjoiIn0=
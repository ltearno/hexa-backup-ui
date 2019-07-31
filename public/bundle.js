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
            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length)
                this.audioPanel.playlist.innerHTML = this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, true);
            else
                this.audioPanel.playlist.innerHTML = "";
            if (this.currentIndex < this.queue.length - 1) {
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.currentIndex + 1}" class="onclick mui--text-dark-secondary is-onelinetext">${this.queue[this.currentIndex + 1]}</div>`;
            }
            else if (this.itemUnroller && this.itemUnroller.hasNext()) {
                html += `<div style="flex-shrink: 0;" x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`;
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
        let term = lastSearchTerm;
        let unrollIndex = childIndex + 1;
        let files = lastDisplayedFiles;
        audioJukebox.setItemUnroller({
            name: () => {
                if (unrollIndex >= 0 && unrollIndex < files.length)
                    return `then '${files[unrollIndex].name.substr(0, 20)}' and other '${term}' search...`;
                return `finished '${term} songs`;
            },
            unroll: () => files[unrollIndex++],
            hasNext: () => unrollIndex >= 0 && unrollIndex < files.length
        });
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
            <div class="mui-textfield">
                <input placeholder="Search an audio title" x-id="${TID_SearchTerm}" type="text" autofocus>
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
                    return `<div>${JSON.stringify(f)}</div>`;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbmV0d29yay5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zZWFyY2gtcmVzdWx0LXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy90ZW1wbGF0ZXMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3VpLXRvb2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQSxDQUFjO0FBQ2QsOENB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QWM7QUFDNUQsZ0JBQWdCLG1CQUFPLENBQUMsc0NBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQzFDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vcHVibGljL2luZGV4LmpzXCIpO1xuIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBQTEFZRVIgPSAncGxheWVyJztcbmNvbnN0IFBMQVlMSVNUID0gJ3BsYXlsaXN0JztcbmNvbnN0IEVYUEFOREVSID0gJ2V4cGFuZGVyJztcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9XCJhdWRpby1mb290ZXIgbXVpLXBhbmVsXCI+XG4gICAgPGgzIGNsYXNzPVwieC13aGVuLWxhcmdlLWRpc3BsYXlcIj5QbGF5bGlzdDwvaDM+XG4gICAgPGRpdiB4LWlkPVwiJHtQTEFZTElTVH1cIj48L2Rpdj5cbiAgICA8ZGl2IHgtaWQ9XCIke0VYUEFOREVSfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtY2VudGVyXCI+4piwPC9kaXY+XG4gICAgPGF1ZGlvIHgtaWQ9XCIke1BMQVlFUn1cIiBjbGFzcz1cImF1ZGlvLXBsYXllclwiIGNsYXNzPVwibXVpLS1wdWxsLXJpZ2h0XCIgY29udHJvbHMgcHJlbG9hZD1cIm1ldGFkYXRhXCI+PC9hdWRpbz5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIGAke1Jlc3QuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPSR7bWltZVR5cGV9YCk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBtaW1lVHlwZSk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5wbGF5KCk7XG4gICAgICAgIGVsZW1lbnRzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShcImlzLWhpZGRlblwiKTtcbiAgICB9LFxufTtcbmNsYXNzIEF1ZGlvSnVrZWJveCB7XG4gICAgY29uc3RydWN0b3IoYXVkaW9QYW5lbCkge1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwgPSBhdWRpb1BhbmVsO1xuICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIC8vIGlmIHNjcm9sbCB0byBwbGF5aW5nIGl0ZW0gaXMgcmVxdWlyZWQgYWZ0ZXIgYSBwbGF5bGlzdCByZWRyYXdcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBxdWV1ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcpKTtcbiAgICAgICAgICAgIGlmIChxdWV1ZSAmJiBxdWV1ZSBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBlcnJvcmAsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5leHBhbmRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gIXRoaXMubGFyZ2VEaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgVWlUb29scy5pdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleEF0dHIgPSBlLmdldEF0dHJpYnV0ZSgneC1xdWV1ZS1pbmRleCcpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXhBdHRyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbmRleEF0dHIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IE5hTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgeyBlbGVtZW50LCBjaGlsZEluZGV4IH0gPSB0ZW1wbGF0ZXNfMS50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24odGhpcy5hdWRpb1BhbmVsLCBldmVudCk7XG4gICAgICAgICAgICBpZiAoZWxlbWVudCA9PSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QgJiYgY2hpbGRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QucXVlcnlTZWxlY3RvcihgW3gtaWQ9J2NsZWFyLXBsYXlsaXN0J11gKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IFtjdXJyZW50SXRlbV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cyA9IFVpVG9vbHMuZWxzKHRoaXMuYXVkaW9QYW5lbC5yb290LCAnLngtd2hlbi1sYXJnZS1kaXNwbGF5Jyk7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgfVxuICAgIGN1cnJlbnRJdGVtKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCAwIHx8IHRoaXMuY3VycmVudEluZGV4ID49IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4XTtcbiAgICB9XG4gICAgYWRkQW5kUGxheShpdGVtKSB7XG4gICAgICAgIGl0ZW0gPSB7XG4gICAgICAgICAgICBzaGE6IGl0ZW0uc2hhLFxuICAgICAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICAgICAgbWltZVR5cGU6IGl0ZW0ubWltZVR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICBpZiAoY3VycmVudEl0ZW0gJiYgY3VycmVudEl0ZW0uc2hhID09IGl0ZW0uc2hhKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgfVxuICAgIHBsYXlOZXh0KCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggKyAxIDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMucGxheSh0aGlzLmN1cnJlbnRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGxheU5leHRVbnJvbGxlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXRlbVVucm9sbGVyKSB7XG4gICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMuaXRlbVVucm9sbGVyLnVucm9sbCgpO1xuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXRlbVVucm9sbGVyLmhhc05leHQoKSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaFF1ZXVlQW5kUGxheShpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHNldEl0ZW1VbnJvbGxlcihpdGVtVW5yb2xsZXIpIHtcbiAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBpdGVtVW5yb2xsZXI7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgfVxuICAgIHB1c2hRdWV1ZUFuZFBsYXkoaXRlbSkge1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXVlKSk7XG4gICAgICAgIHRoaXMucGxheSh0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBwbGF5KGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5xdWV1ZVtpbmRleF07XG4gICAgICAgICAgICBleHBvcnRzLmF1ZGlvUGFuZWwucGxheSh0aGlzLmF1ZGlvUGFuZWwsIGl0ZW0ubmFtZSwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW3gtZm9yLXNoYT0nJHtpdGVtLnNoYS5zdWJzdHIoMCwgNSl9J11gKS5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy13ZWlnaHRlZCcpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnJlc2hUaW1lcilcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlZnJlc2hUaW1lcik7XG4gICAgICAgIHRoaXMucmVmcmVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlYWxSZWZyZXNoUGxheWxpc3QoKSwgMTApO1xuICAgIH1cbiAgICByZWFsUmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAoIXRoaXMucXVldWUgfHwgIXRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPlRoZXJlIGFyZSBubyBpdGVtcyBpbiB5b3VyIHBsYXlsaXN0LiBDbGljayBvbiBzb25ncyB0byBwbGF5IHRoZW0uPC9zcGFuPic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBodG1sID0gYGA7XG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbChpLCBpdGVtLm5hbWUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPjxhIHgtaWQ9J2NsZWFyLXBsYXlsaXN0JyBocmVmPScjJz5jbGVhciBwbGF5bGlzdDwvYT48L2Rpdj5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA+PSAwICYmIHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IHRoaXMucGxheWxpc3RJdGVtSHRtbCh0aGlzLmN1cnJlbnRJbmRleCwgdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF0ubmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5jdXJyZW50SW5kZXggKyAxfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXggKyAxXX08L2Rpdj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAvLyBhZnRlciByZWZyZXNoIHN0ZXBzXG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSAmJiB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0pIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbFRvcCA9IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcGxheWxpc3RJdGVtSHRtbChpbmRleCwgbmFtZSwgb25lTGluZVRleHQpIHtcbiAgICAgICAgcmV0dXJuIGA8ZGl2IHgtcXVldWUtaW5kZXg9XCIke2luZGV4fVwiIGNsYXNzPVwib25jbGljayAke29uZUxpbmVUZXh0ID8gJ2lzLW9uZWxpbmV0ZXh0JyA6ICcnfSAke2luZGV4ID09IHRoaXMuY3VycmVudEluZGV4ID8gJ211aS0tdGV4dC1oZWFkbGluZScgOiAnJ31cIj4ke25hbWV9PC9kaXY+YDtcbiAgICB9XG59XG5leHBvcnRzLkF1ZGlvSnVrZWJveCA9IEF1ZGlvSnVrZWJveDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1ZGlvLXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5mdW5jdGlvbiB3YWl0KGR1cmF0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBkdXJhdGlvbikpO1xufVxuY2xhc3MgQXV0aCB7XG4gICAgb25FcnJvcigpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgICBhc3luYyBsb29wKCkge1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci9hdXRoYCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXMgPSBhd2FpdCBOZXR3b3JrLmdldERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL3dlbGwta25vd24vdjEvc2V0Q29va2llYCwgeyAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtyZXNwb25zZS50b2tlbn1gIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlcyB8fCAhcmVzLmxpZmV0aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3Qgc2V0Q29va2llYCwgcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3Qgb2J0YWluIGF1dGggdG9rZW5gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCByZWZyZXNoIGF1dGggKCR7ZXJyfSlgKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGV2ZXJ5IDMwIG1pbnV0ZXNcbiAgICAgICAgICAgIGF3YWl0IHdhaXQoMTAwMCAqIDYwICogMzApO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXV0b1JlbmV3QXV0aCgpIHtcbiAgICBsZXQgYXV0aCA9IG5ldyBBdXRoKCk7XG4gICAgYXV0aC5sb29wKCk7XG59XG5leHBvcnRzLmF1dG9SZW5ld0F1dGggPSBhdXRvUmVuZXdBdXRoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXV0aC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbCA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBTZWFyY2hQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1wYW5lbFwiKTtcbmNvbnN0IFNlYXJjaFJlc3VsdFBhbmVsID0gcmVxdWlyZShcIi4vc2VhcmNoLXJlc3VsdC1wYW5lbFwiKTtcbmNvbnN0IEF1ZGlvUGFuZWwgPSByZXF1aXJlKFwiLi9hdWRpby1wYW5lbFwiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgQXV0aCA9IHJlcXVpcmUoXCIuL2F1dGhcIik7XG5jb25zdCBUZW1wbGF0ZXMgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5sZXQgY29udGVudHMgPSBbXTtcbmZ1bmN0aW9uIGFkZENvbnRlbnQoY29udGVudCkge1xuICAgIGNvbnRlbnRzLnB1c2goY29udGVudCk7XG4gICAgVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoY29udGVudCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xufVxuZnVuY3Rpb24gY2xlYXJDb250ZW50cygpIHtcbiAgICBjb25zdCBjb250ZW50V3JhcHBlciA9IFVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJyk7XG4gICAgY29udGVudHMuZm9yRWFjaChlbGVtZW50ID0+IGNvbnRlbnRXcmFwcGVyLnJlbW92ZUNoaWxkKGVsZW1lbnQpKTtcbiAgICBjb250ZW50cyA9IFtdO1xufVxuY29uc3Qgc2VhcmNoUGFuZWwgPSBTZWFyY2hQYW5lbC5zZWFyY2hQYW5lbC5jcmVhdGUoKTtcbmNvbnN0IHNlYXJjaFJlc3VsdFBhbmVsID0gU2VhcmNoUmVzdWx0UGFuZWwuc2VhcmNoUmVzdWx0UGFuZWwuY3JlYXRlKCk7XG5jb25zdCBhdWRpb1BhbmVsID0gQXVkaW9QYW5lbC5hdWRpb1BhbmVsLmNyZWF0ZSgpO1xuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdWRpb1BhbmVsLnJvb3QpO1xuYWRkQ29udGVudChzZWFyY2hQYW5lbC5yb290KTtcbmNvbnN0IGF1ZGlvSnVrZWJveCA9IG5ldyBBdWRpb1BhbmVsLkF1ZGlvSnVrZWJveChhdWRpb1BhbmVsKTtcbkF1dGguYXV0b1JlbmV3QXV0aCgpO1xuLyoqXG4gKiBFdmVudHNcbiAqL1xubGV0IGxhc3REaXNwbGF5ZWRGaWxlcyA9IG51bGw7XG5sZXQgbGFzdFNlYXJjaFRlcm0gPSBudWxsOyAvLyBIQUNLIHZlcnkgdGVtcG9yYXJ5XG5zZWFyY2hQYW5lbC5mb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGFzeW5jIChldmVudCkgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGxldCB0ZXJtID0gc2VhcmNoUGFuZWwudGVybS52YWx1ZTtcbiAgICBTZWFyY2hQYW5lbC5zZWFyY2hQYW5lbC5kaXNwbGF5VGl0bGUoc2VhcmNoUGFuZWwsIGZhbHNlKTtcbiAgICBTZWFyY2hSZXN1bHRQYW5lbC5zZWFyY2hSZXN1bHRQYW5lbC5kaXNwbGF5U2VhcmNoaW5nKHNlYXJjaFJlc3VsdFBhbmVsLCB0ZXJtKTtcbiAgICBpZiAoIXNlYXJjaFJlc3VsdFBhbmVsLnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIGFkZENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgbGV0IHJlcyA9IGF3YWl0IFJlc3Quc2VhcmNoKHRlcm0sICdhdWRpby8lJyk7XG4gICAgLy8gYXJyYW5nZSBhbmQgYmVhdXRpZnkgbmFtZXNcbiAgICByZXMuaXRlbXMgPSByZXMuaXRlbXMubWFwKGZpbGUgPT4ge1xuICAgICAgICBpZiAoZmlsZS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICAgICAgbGV0IGRvdCA9IGZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICAgICAgaWYgKGRvdClcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUuc3Vic3RyaW5nKDAsIGRvdCk7XG4gICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvJ18nL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvJyAgJy9nLCAnICcpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1sgXSotWyBdKi9nLCAnIC0gJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfSk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gcmVzLml0ZW1zO1xuICAgIGxhc3RTZWFyY2hUZXJtID0gdGVybTtcbiAgICBTZWFyY2hSZXN1bHRQYW5lbC5zZWFyY2hSZXN1bHRQYW5lbC5zZXRWYWx1ZXMoc2VhcmNoUmVzdWx0UGFuZWwsIHtcbiAgICAgICAgdGVybTogc2VhcmNoUGFuZWwudGVybS52YWx1ZSxcbiAgICAgICAgaXRlbXM6IHJlcy5pdGVtc1xuICAgIH0pO1xufSk7XG5zZWFyY2hSZXN1bHRQYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgIC8vIHRvZG8gOiBrbm93bmxlZGdlIHRvIGRvIHRoYXQgaXMgaW4gZmlsZXMtcGFuZWxcbiAgICBsZXQgeyBlbGVtZW50LCBjaGlsZEluZGV4IH0gPSBUZW1wbGF0ZXMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKHNlYXJjaFJlc3VsdFBhbmVsLCBldmVudCk7XG4gICAgaWYgKGxhc3REaXNwbGF5ZWRGaWxlcyAmJiBlbGVtZW50ID09IHNlYXJjaFJlc3VsdFBhbmVsLmZpbGVzICYmIGNoaWxkSW5kZXggPj0gMCAmJiBjaGlsZEluZGV4IDwgbGFzdERpc3BsYXllZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICBhdWRpb0p1a2Vib3guYWRkQW5kUGxheShsYXN0RGlzcGxheWVkRmlsZXNbY2hpbGRJbmRleF0pO1xuICAgICAgICAvLyBzZXQgYW4gdW5yb2xsZXJcbiAgICAgICAgbGV0IHRlcm0gPSBsYXN0U2VhcmNoVGVybTtcbiAgICAgICAgbGV0IHVucm9sbEluZGV4ID0gY2hpbGRJbmRleCArIDE7XG4gICAgICAgIGxldCBmaWxlcyA9IGxhc3REaXNwbGF5ZWRGaWxlcztcbiAgICAgICAgYXVkaW9KdWtlYm94LnNldEl0ZW1VbnJvbGxlcih7XG4gICAgICAgICAgICBuYW1lOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCBmaWxlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgdGhlbiAnJHtmaWxlc1t1bnJvbGxJbmRleF0ubmFtZS5zdWJzdHIoMCwgMjApfScgYW5kIG90aGVyICcke3Rlcm19JyBzZWFyY2guLi5gO1xuICAgICAgICAgICAgICAgIHJldHVybiBgZmluaXNoZWQgJyR7dGVybX0gc29uZ3NgO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVucm9sbDogKCkgPT4gZmlsZXNbdW5yb2xsSW5kZXgrK10sXG4gICAgICAgICAgICBoYXNOZXh0OiAoKSA9PiB1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgZmlsZXMubGVuZ3RoXG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5hc3luYyBmdW5jdGlvbiBhZnRlckZldGNoKHJlc3BvbnNlKSB7XG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgYmFkIHJlc3BvbnNlIDogJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSB8fCAnYXBwbGljYXRpb24vanNvbic7XG4gICAgbGV0IHNjaSA9IHJlY2VpdmVkQ29udGVudFR5cGUuaW5kZXhPZignOycpO1xuICAgIGlmIChzY2kgPj0gMClcbiAgICAgICAgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlY2VpdmVkQ29udGVudFR5cGUuc3Vic3RyKDAsIHNjaSk7XG4gICAgaWYgKHJlY2VpdmVkQ29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cbmZ1bmN0aW9uIGdldERhdGEodXJsLCBoZWFkZXJzID0gbnVsbCkge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnNcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZ2V0RGF0YSA9IGdldERhdGE7XG5mdW5jdGlvbiBwb3N0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucG9zdERhdGEgPSBwb3N0RGF0YTtcbmZ1bmN0aW9uIHB1dERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucHV0RGF0YSA9IHB1dERhdGE7XG5mdW5jdGlvbiBkZWxldGVEYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmRlbGV0ZURhdGEgPSBkZWxldGVEYXRhO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PSBcImhvbWUubHRlY29uc3VsdGluZy5mclwiID8gXCJodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mclwiIDogXCJodHRwczovL2xvY2FsaG9zdDo1MDA1XCI7XG5hc3luYyBmdW5jdGlvbiBzZWFyY2goc2VhcmNoVGV4dCwgbWltZVR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgIG5hbWU6IHNlYXJjaFRleHQsXG4gICAgICAgICAgICBtaW1lVHlwZTogbWltZVR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyByZXN1bHREaXJlY3RvcmllcywgcmVzdWx0RmlsZXNkZGQsIGl0ZW1zIH0gPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NlYXJjaGAsIHNlYXJjaFNwZWMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IHJlc3VsdERpcmVjdG9yaWVzLFxuICAgICAgICAgICAgZmlsZXM6IHJlc3VsdEZpbGVzZGRkLFxuICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLnNlYXJjaCA9IHNlYXJjaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc3QuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFRJRF9UaXRsZSA9ICd0aXRsZSc7XG5jb25zdCBUSURfU2VhcmNoRm9ybSA9ICdmb3JtJztcbmNvbnN0IFRJRF9TZWFyY2hUZXJtID0gJ3Rlcm0nO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgxIHgtaWQ9XCIke1RJRF9UaXRsZX1cIiBjbGFzcz1cImFuaW1hdGVkLS1xdWlja1wiPlJhY2Nvb248L2gxPlxuICAgICAgICA8Zm9ybSB4LWlkPVwiJHtUSURfU2VhcmNoRm9ybX1cIiBjbGFzcz1cIm11aS1mb3JtLS1pbmxpbmVcIj5cbiAgICAgICAgICAgIDwhLS10aGlzIGlzIGEgbGl0dGxlIGhhY2sgdG8gaGF2ZSB0aGluZ3MgY2VudGVyZWQtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIj7wn5SNPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLXRleHRmaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBwbGFjZWhvbGRlcj1cIlNlYXJjaCBhbiBhdWRpbyB0aXRsZVwiIHgtaWQ9XCIke1RJRF9TZWFyY2hUZXJtfVwiIHR5cGU9XCJ0ZXh0XCIgYXV0b2ZvY3VzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHJvbGU9XCJzdWJtaXRcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPvCflI08L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgICA8YnIgLz5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLnNlYXJjaFBhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIGRpc3BsYXlUaXRsZTogKHRlbXBsYXRlLCBkaXNwbGF5ZWQpID0+IHtcbiAgICAgICAgaWYgKGRpc3BsYXllZClcbiAgICAgICAgICAgIHRlbXBsYXRlLnRpdGxlLmNsYXNzTGlzdC5yZW1vdmUoJ2hleGEtLXJlZHVjZWQnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LmFkZCgnaGV4YS0tcmVkdWNlZCcpO1xuICAgIH1cbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZWFyY2gtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXItZmx1aWQnPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMiB4LWlkPVwidGl0bGVcIj48L2gyPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJmaWxlc1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUmVzdWx0UGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVNlYXJjaGluZzogKGVsZW1lbnRzLCB0ZXJtKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnRpdGxlLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPlNlYXJjaGluZyAnJHt0ZXJtfScgLi4uPC9kaXY+YDtcbiAgICB9LFxuICAgIHNldFZhbHVlczogKGVsZW1lbnRzLCB2YWx1ZXMpID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYFJlc3VsdHMgZm9yICcke3ZhbHVlcy50ZXJtfSdgO1xuICAgICAgICBpZiAodmFsdWVzLml0ZW1zICYmIHZhbHVlcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZpbGVzLmlubmVySFRNTCA9IHZhbHVlcy5pdGVtcy5tYXAoZiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdj4ke0pTT04uc3RyaW5naWZ5KGYpfTwvZGl2PmA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPiR7Zi5uYW1lfTwvZGl2PmA7XG4gICAgICAgICAgICB9KS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZpbGVzLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZWFyY2gtcmVzdWx0LXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBlbGVtZW50c0RhdGEgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKG9iaiwgaHRtbCkge1xuICAgIGxldCByb290ID0gVWlUb29scy5lbEZyb21IdG1sKGh0bWwpO1xuICAgIG9ialsncm9vdCddID0gcm9vdDtcbiAgICBVaVRvb2xzLmVscyhyb290LCBgW3gtaWRdYCkuZm9yRWFjaChlID0+IG9ialtlLmdldEF0dHJpYnV0ZSgneC1pZCcpXSA9IGUpO1xuICAgIGVsZW1lbnRzRGF0YS5zZXQocm9vdCwgb2JqKTtcbiAgICByZXR1cm4gcm9vdDtcbn1cbmV4cG9ydHMuY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuO1xuZnVuY3Rpb24gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCkge1xuICAgIGNvbnN0IGRhdGEgPSBlbGVtZW50c0RhdGEuZ2V0KHJvb3QpO1xuICAgIHJldHVybiBkYXRhO1xufVxuZXhwb3J0cy5nZXRUZW1wbGF0ZUluc3RhbmNlRGF0YSA9IGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhO1xuZnVuY3Rpb24gY3JlYXRlVGVtcGxhdGVJbnN0YW5jZShodG1sKSB7XG4gICAgbGV0IHJvb3QgPSBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4oe30sIGh0bWwpO1xuICAgIHJldHVybiBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YShyb290KTtcbn1cbmV4cG9ydHMuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSA9IGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2U7XG5jb25zdCBFTVBUWV9MT0NBVElPTiA9IHsgZWxlbWVudDogbnVsbCwgY2hpbGRJbmRleDogLTEgfTtcbmZ1bmN0aW9uIHRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihlbGVtZW50cywgZXZlbnQpIHtcbiAgICBsZXQgZWxzID0gbmV3IFNldChPYmplY3QudmFsdWVzKGVsZW1lbnRzKSk7XG4gICAgbGV0IGMgPSBldmVudC50YXJnZXQ7XG4gICAgbGV0IHAgPSBudWxsO1xuICAgIGRvIHtcbiAgICAgICAgaWYgKGVscy5oYXMoYykpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudDogYyxcbiAgICAgICAgICAgICAgICBjaGlsZEluZGV4OiBwICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYy5jaGlsZHJlbiwgcClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGMgPT0gZWxlbWVudHMucm9vdClcbiAgICAgICAgICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbiAgICAgICAgcCA9IGM7XG4gICAgICAgIGMgPSBjLnBhcmVudEVsZW1lbnQ7XG4gICAgfSB3aGlsZSAoYyk7XG4gICAgcmV0dXJuIEVNUFRZX0xPQ0FUSU9OO1xufVxuZXhwb3J0cy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24gPSB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb247XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZW1wbGF0ZXMuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5mdW5jdGlvbiBlbChpZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG59XG5leHBvcnRzLmVsID0gZWw7XG5mdW5jdGlvbiBlbHMoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn1cbmV4cG9ydHMuZWxzID0gZWxzO1xuZnVuY3Rpb24gZWxGcm9tSHRtbChodG1sKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgcGFyZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIHBhcmVudC5jaGlsZHJlbi5pdGVtKDApO1xufVxuZXhwb3J0cy5lbEZyb21IdG1sID0gZWxGcm9tSHRtbDtcbmZ1bmN0aW9uIHN0b3BFdmVudChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5leHBvcnRzLnN0b3BFdmVudCA9IHN0b3BFdmVudDtcbmZ1bmN0aW9uKiBpdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50KHN0YXJ0KSB7XG4gICAgd2hpbGUgKHN0YXJ0KSB7XG4gICAgICAgIHlpZWxkIHN0YXJ0O1xuICAgICAgICBzdGFydCA9IHN0YXJ0LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxufVxuZXhwb3J0cy5pdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50ID0gaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVpLXRvb2wuanMubWFwIl0sInNvdXJjZVJvb3QiOiIifQ==
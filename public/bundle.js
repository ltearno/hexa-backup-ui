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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbmV0d29yay5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zZWFyY2gtcmVzdWx0LXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy90ZW1wbGF0ZXMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3VpLXRvb2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQSxDQUFjO0FBQ2QsOENB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QzVELGdCQUFnQixtQkFBTyxDQUFDLHNDQUFXO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHFDOzs7Ozs7Ozs7Ozs7QUMxQ0EsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3B1YmxpYy9pbmRleC5qc1wiKTtcbiIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgUExBWUVSID0gJ3BsYXllcic7XG5jb25zdCBQTEFZTElTVCA9ICdwbGF5bGlzdCc7XG5jb25zdCBFWFBBTkRFUiA9ICdleHBhbmRlcic7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPVwiYXVkaW8tZm9vdGVyIG11aS1wYW5lbFwiPlxuICAgIDxoMyBjbGFzcz1cIngtd2hlbi1sYXJnZS1kaXNwbGF5XCI+UGxheWxpc3Q8L2gzPlxuICAgIDxkaXYgeC1pZD1cIiR7UExBWUxJU1R9XCI+PC9kaXY+XG4gICAgPGRpdiB4LWlkPVwiJHtFWFBBTkRFUn1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWNlbnRlclwiPuKYsDwvZGl2PlxuICAgIDxhdWRpbyB4LWlkPVwiJHtQTEFZRVJ9XCIgY2xhc3M9XCJhdWRpby1wbGF5ZXJcIiBjbGFzcz1cIm11aS0tcHVsbC1yaWdodFwiIGNvbnRyb2xzIHByZWxvYWQ9XCJtZXRhZGF0YVwiPjwvYXVkaW8+XG48L2Rpdj5gO1xuZXhwb3J0cy5hdWRpb1BhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIHBsYXk6IChlbGVtZW50cywgbmFtZSwgc2hhLCBtaW1lVHlwZSkgPT4ge1xuICAgICAgICBlbGVtZW50cy5wbGF5ZXIuc2V0QXR0cmlidXRlKCdzcmMnLCBgJHtSZXN0LkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT0ke21pbWVUeXBlfWApO1xuICAgICAgICBlbGVtZW50cy5wbGF5ZXIuc2V0QXR0cmlidXRlKCd0eXBlJywgbWltZVR5cGUpO1xuICAgICAgICBlbGVtZW50cy5wbGF5ZXIucGxheSgpO1xuICAgICAgICBlbGVtZW50cy5yb290LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRkZW5cIik7XG4gICAgfSxcbn07XG5jbGFzcyBBdWRpb0p1a2Vib3gge1xuICAgIGNvbnN0cnVjdG9yKGF1ZGlvUGFuZWwpIHtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsID0gYXVkaW9QYW5lbDtcbiAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IC0xO1xuICAgICAgICAvLyBpZiBzY3JvbGwgdG8gcGxheWluZyBpdGVtIGlzIHJlcXVpcmVkIGFmdGVyIGEgcGxheWxpc3QgcmVkcmF3XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IHRydWU7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcXVldWUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnKSk7XG4gICAgICAgICAgICBpZiAocXVldWUgJiYgcXVldWUgaW5zdGFuY2VvZiBBcnJheSlcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gcXVldWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZXJyb3JgLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignZW5kZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXlOZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwuZXhwYW5kZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9ICF0aGlzLmxhcmdlRGlzcGxheTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBlIG9mIFVpVG9vbHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXhBdHRyID0gZS5nZXRBdHRyaWJ1dGUoJ3gtcXVldWUtaW5kZXgnKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4QXR0ciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoaW5kZXhBdHRyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSBOYU4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXlOZXh0VW5yb2xsZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gdGVtcGxhdGVzXzEudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKHRoaXMuYXVkaW9QYW5lbCwgZXZlbnQpO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0ICYmIGNoaWxkSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgPT0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnF1ZXJ5U2VsZWN0b3IoYFt4LWlkPSdjbGVhci1wbGF5bGlzdCddYCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRJdGVtID0gdGhpcy5jdXJyZW50SXRlbSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbY3VycmVudEl0ZW1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdwbGF5bGlzdC1iYWNrdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmV4cGFuZGVkRWxlbWVudHMgPSBVaVRvb2xzLmVscyh0aGlzLmF1ZGlvUGFuZWwucm9vdCwgJy54LXdoZW4tbGFyZ2UtZGlzcGxheScpO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBjdXJyZW50SXRlbSgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgMCB8fCB0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnF1ZXVlLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgfVxuICAgIGFkZEFuZFBsYXkoaXRlbSkge1xuICAgICAgICBpdGVtID0ge1xuICAgICAgICAgICAgc2hhOiBpdGVtLnNoYSxcbiAgICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBpdGVtLm1pbWVUeXBlXG4gICAgICAgIH07XG4gICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJdGVtICYmIGN1cnJlbnRJdGVtLnNoYSA9PSBpdGVtLnNoYSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgIH1cbiAgICBwbGF5TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlOZXh0VW5yb2xsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1VbnJvbGxlci51bnJvbGwoKTtcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRJdGVtVW5yb2xsZXIoaXRlbVVucm9sbGVyKSB7XG4gICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gaXRlbVVucm9sbGVyO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBwdXNoUXVldWVBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGl0ZW0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncGxheWxpc3QtYmFja3VwJywgSlNPTi5zdHJpbmdpZnkodGhpcy5xdWV1ZSkpO1xuICAgICAgICB0aGlzLnBsYXkodGhpcy5xdWV1ZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgcGxheShpbmRleCkge1xuICAgICAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMucXVldWVbaW5kZXhdO1xuICAgICAgICAgICAgZXhwb3J0cy5hdWRpb1BhbmVsLnBsYXkodGhpcy5hdWRpb1BhbmVsLCBpdGVtLm5hbWUsIGl0ZW0uc2hhLCBpdGVtLm1pbWVUeXBlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFt4LWZvci1zaGE9JyR7aXRlbS5zaGEuc3Vic3RyKDAsIDUpfSddYCkuZm9yRWFjaChlID0+IGUuY2xhc3NMaXN0LmFkZCgnaXMtd2VpZ2h0ZWQnKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAodGhpcy5yZWZyZXNoVGltZXIpXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5yZWZyZXNoVGltZXIpO1xuICAgICAgICB0aGlzLnJlZnJlc2hUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5yZWFsUmVmcmVzaFBsYXlsaXN0KCksIDEwKTtcbiAgICB9XG4gICAgcmVhbFJlZnJlc2hQbGF5bGlzdCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnF1ZXVlIHx8ICF0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5KVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj5UaGVyZSBhcmUgbm8gaXRlbXMgaW4geW91ciBwbGF5bGlzdC4gQ2xpY2sgb24gc29uZ3MgdG8gcGxheSB0aGVtLjwvc3Bhbj4nO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaHRtbCA9IGBgO1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbSA9IHRoaXMucXVldWVbaV07XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwoaSwgaXRlbS5uYW1lLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1zZWNvbmRhcnlcIj48YSB4LWlkPSdjbGVhci1wbGF5bGlzdCcgaHJlZj0nIyc+Y2xlYXIgcGxheWxpc3Q8L2E+PC9kaXY+YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gMCAmJiB0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwodGhpcy5jdXJyZW50SW5kZXgsIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdLm5hbWUsIHRydWUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8ZGl2IHN0eWxlPVwiZmxleC1zaHJpbms6IDA7XCIgeC1xdWV1ZS1pbmRleD1cIiR7dGhpcy5jdXJyZW50SW5kZXggKyAxfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj5mb2xsb3dlZCBieSAnJHt0aGlzLnF1ZXVlW3RoaXMuY3VycmVudEluZGV4ICsgMV0ubmFtZS5zdWJzdHIoMCwgMjApfScgLi4uPC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5pdGVtVW5yb2xsZXIgJiYgdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLnF1ZXVlLmxlbmd0aH1cIiBjbGFzcz1cIm9uY2xpY2sgbXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5IGlzLW9uZWxpbmV0ZXh0XCI+JHt0aGlzLml0ZW1VbnJvbGxlci5uYW1lKCl9PC9kaXY+YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIC8vIGFmdGVyIHJlZnJlc2ggc3RlcHNcbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5ICYmIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsVG9wID0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5bGlzdEl0ZW1IdG1sKGluZGV4LCBuYW1lLCBvbmVMaW5lVGV4dCkge1xuICAgICAgICByZXR1cm4gYDxkaXYgeC1xdWV1ZS1pbmRleD1cIiR7aW5kZXh9XCIgY2xhc3M9XCJvbmNsaWNrICR7b25lTGluZVRleHQgPyAnaXMtb25lbGluZXRleHQnIDogJyd9ICR7aW5kZXggPT0gdGhpcy5jdXJyZW50SW5kZXggPyAnbXVpLS10ZXh0LWhlYWRsaW5lJyA6ICcnfVwiPiR7bmFtZX08L2Rpdj5gO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9KdWtlYm94ID0gQXVkaW9KdWtlYm94O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXVkaW8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmZ1bmN0aW9uIHdhaXQoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKSk7XG59XG5jbGFzcyBBdXRoIHtcbiAgICBvbkVycm9yKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfVxuICAgIGFzeW5jIGxvb3AoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL2F1dGhgKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlcyA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9zZXRDb29raWVgLCB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Jlc3BvbnNlLnRva2VufWAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzIHx8ICFyZXMubGlmZXRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBzZXRDb29raWVgLCByZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBvYnRhaW4gYXV0aCB0b2tlbmApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHJlZnJlc2ggYXV0aCAoJHtlcnJ9KWApO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXZlcnkgMzAgbWludXRlc1xuICAgICAgICAgICAgYXdhaXQgd2FpdCgxMDAwICogNjAgKiAzMCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhdXRvUmVuZXdBdXRoKCkge1xuICAgIGxldCBhdXRoID0gbmV3IEF1dGgoKTtcbiAgICBhdXRoLmxvb3AoKTtcbn1cbmV4cG9ydHMuYXV0b1JlbmV3QXV0aCA9IGF1dG9SZW5ld0F1dGg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRoLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgVWlUb29sID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IFNlYXJjaFBhbmVsID0gcmVxdWlyZShcIi4vc2VhcmNoLXBhbmVsXCIpO1xuY29uc3QgU2VhcmNoUmVzdWx0UGFuZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtcmVzdWx0LXBhbmVsXCIpO1xuY29uc3QgQXVkaW9QYW5lbCA9IHJlcXVpcmUoXCIuL2F1ZGlvLXBhbmVsXCIpO1xuY29uc3QgUmVzdCA9IHJlcXVpcmUoXCIuL3Jlc3RcIik7XG5jb25zdCBBdXRoID0gcmVxdWlyZShcIi4vYXV0aFwiKTtcbmNvbnN0IFRlbXBsYXRlcyA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmxldCBjb250ZW50cyA9IFtdO1xuZnVuY3Rpb24gYWRkQ29udGVudChjb250ZW50KSB7XG4gICAgY29udGVudHMucHVzaChjb250ZW50KTtcbiAgICBVaVRvb2wuZWwoJ2NvbnRlbnQtd3JhcHBlcicpLmluc2VydEJlZm9yZShjb250ZW50LCBVaVRvb2wuZWwoJ2ZpcnN0LWVsZW1lbnQtYWZ0ZXItY29udGVudHMnKSk7XG59XG5mdW5jdGlvbiBjbGVhckNvbnRlbnRzKCkge1xuICAgIGNvbnN0IGNvbnRlbnRXcmFwcGVyID0gVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKTtcbiAgICBjb250ZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4gY29udGVudFdyYXBwZXIucmVtb3ZlQ2hpbGQoZWxlbWVudCkpO1xuICAgIGNvbnRlbnRzID0gW107XG59XG5jb25zdCBzZWFyY2hQYW5lbCA9IFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmNyZWF0ZSgpO1xuY29uc3Qgc2VhcmNoUmVzdWx0UGFuZWwgPSBTZWFyY2hSZXN1bHRQYW5lbC5zZWFyY2hSZXN1bHRQYW5lbC5jcmVhdGUoKTtcbmNvbnN0IGF1ZGlvUGFuZWwgPSBBdWRpb1BhbmVsLmF1ZGlvUGFuZWwuY3JlYXRlKCk7XG5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1ZGlvUGFuZWwucm9vdCk7XG5hZGRDb250ZW50KHNlYXJjaFBhbmVsLnJvb3QpO1xuY29uc3QgYXVkaW9KdWtlYm94ID0gbmV3IEF1ZGlvUGFuZWwuQXVkaW9KdWtlYm94KGF1ZGlvUGFuZWwpO1xuQXV0aC5hdXRvUmVuZXdBdXRoKCk7XG4vKipcbiAqIEV2ZW50c1xuICovXG5sZXQgbGFzdERpc3BsYXllZEZpbGVzID0gbnVsbDtcbmxldCBsYXN0U2VhcmNoVGVybSA9IG51bGw7IC8vIEhBQ0sgdmVyeSB0ZW1wb3JhcnlcbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgVWlUb29sLnN0b3BFdmVudChldmVudCk7XG4gICAgbGV0IHRlcm0gPSBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlO1xuICAgIFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmRpc3BsYXlUaXRsZShzZWFyY2hQYW5lbCwgZmFsc2UpO1xuICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLmRpc3BsYXlTZWFyY2hpbmcoc2VhcmNoUmVzdWx0UGFuZWwsIHRlcm0pO1xuICAgIGlmICghc2VhcmNoUmVzdWx0UGFuZWwucm9vdC5pc0Nvbm5lY3RlZClcbiAgICAgICAgYWRkQ29udGVudChzZWFyY2hSZXN1bHRQYW5lbC5yb290KTtcbiAgICBsZXQgcmVzID0gYXdhaXQgUmVzdC5zZWFyY2godGVybSwgJ2F1ZGlvLyUnKTtcbiAgICAvLyBhcnJhbmdlIGFuZCBiZWF1dGlmeSBuYW1lc1xuICAgIHJlcy5pdGVtcyA9IHJlcy5pdGVtcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIGlmIChmaWxlLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKSB7XG4gICAgICAgICAgICBsZXQgZG90ID0gZmlsZS5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICAgICAgICBpZiAoZG90KVxuICAgICAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5zdWJzdHJpbmcoMCwgZG90KTtcbiAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC8nXycvZywgJyAnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nICAnL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvWyBdKi1bIF0qL2csICcgLSAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICB9KTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLnNldFZhbHVlcyhzZWFyY2hSZXN1bHRQYW5lbCwge1xuICAgICAgICB0ZXJtOiBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlLFxuICAgICAgICBpdGVtczogcmVzLml0ZW1zXG4gICAgfSk7XG59KTtcbnNlYXJjaFJlc3VsdFBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldmVudCA9PiB7XG4gICAgLy8gdG9kbyA6IGtub3dubGVkZ2UgdG8gZG8gdGhhdCBpcyBpbiBmaWxlcy1wYW5lbFxuICAgIGxldCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IFRlbXBsYXRlcy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oc2VhcmNoUmVzdWx0UGFuZWwsIGV2ZW50KTtcbiAgICBpZiAobGFzdERpc3BsYXllZEZpbGVzICYmIGVsZW1lbnQgPT0gc2VhcmNoUmVzdWx0UGFuZWwuZmlsZXMgJiYgY2hpbGRJbmRleCA+PSAwICYmIGNoaWxkSW5kZXggPCBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGF1ZGlvSnVrZWJveC5hZGRBbmRQbGF5KGxhc3REaXNwbGF5ZWRGaWxlc1tjaGlsZEluZGV4XSk7XG4gICAgICAgIC8vIHNldCBhbiB1bnJvbGxlclxuICAgICAgICBsZXQgdGVybSA9IGxhc3RTZWFyY2hUZXJtO1xuICAgICAgICBsZXQgdW5yb2xsSW5kZXggPSBjaGlsZEluZGV4ICsgMTtcbiAgICAgICAgbGV0IGZpbGVzID0gbGFzdERpc3BsYXllZEZpbGVzO1xuICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgIG5hbWU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodW5yb2xsSW5kZXggPj0gMCAmJiB1bnJvbGxJbmRleCA8IGZpbGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGB0aGVuICcke2ZpbGVzW3Vucm9sbEluZGV4XS5uYW1lLnN1YnN0cigwLCAyMCl9JyBhbmQgb3RoZXIgJyR7dGVybX0nIHNlYXJjaC4uLmA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBmaW5pc2hlZCAnJHt0ZXJtfSBzb25nc2A7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiBmaWxlc1t1bnJvbGxJbmRleCsrXSxcbiAgICAgICAgICAgIGhhc05leHQ6ICgpID0+IHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCBmaWxlcy5sZW5ndGhcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmFzeW5jIGZ1bmN0aW9uIGFmdGVyRmV0Y2gocmVzcG9uc2UpIHtcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBiYWQgcmVzcG9uc2UgOiAke0pTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICBsZXQgc2NpID0gcmVjZWl2ZWRDb250ZW50VHlwZS5pbmRleE9mKCc7Jyk7XG4gICAgaWYgKHNjaSA+PSAwKVxuICAgICAgICByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVjZWl2ZWRDb250ZW50VHlwZS5zdWJzdHIoMCwgc2NpKTtcbiAgICBpZiAocmVjZWl2ZWRDb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xufVxuZnVuY3Rpb24gZ2V0RGF0YSh1cmwsIGhlYWRlcnMgPSBudWxsKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyc1xuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5nZXREYXRhID0gZ2V0RGF0YTtcbmZ1bmN0aW9uIHBvc3REYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wb3N0RGF0YSA9IHBvc3REYXRhO1xuZnVuY3Rpb24gcHV0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wdXREYXRhID0gcHV0RGF0YTtcbmZ1bmN0aW9uIGRlbGV0ZURhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZGVsZXRlRGF0YSA9IGRlbGV0ZURhdGE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5leHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwiaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgPyBcImh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgOiBcImh0dHBzOi8vbG9jYWxob3N0OjUwMDVcIjtcbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaChzZWFyY2hUZXh0LCBtaW1lVHlwZSkge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzZWFyY2hTcGVjID0ge1xuICAgICAgICAgICAgbmFtZTogc2VhcmNoVGV4dCxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBtaW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7IHJlc3VsdERpcmVjdG9yaWVzLCByZXN1bHRGaWxlc2RkZCwgaXRlbXMgfSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYCR7ZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTH0vc2VhcmNoYCwgc2VhcmNoU3BlYyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaXJlY3RvcmllczogcmVzdWx0RGlyZWN0b3JpZXMsXG4gICAgICAgICAgICBmaWxlczogcmVzdWx0RmlsZXNkZGQsXG4gICAgICAgICAgICBpdGVtc1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuc2VhcmNoID0gc2VhcmNoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzdC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgVElEX1RpdGxlID0gJ3RpdGxlJztcbmNvbnN0IFRJRF9TZWFyY2hGb3JtID0gJ2Zvcm0nO1xuY29uc3QgVElEX1NlYXJjaFRlcm0gPSAndGVybSc7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDEgeC1pZD1cIiR7VElEX1RpdGxlfVwiIGNsYXNzPVwiYW5pbWF0ZWQtLXF1aWNrXCI+UmFjY29vbjwvaDE+XG4gICAgICAgIDxmb3JtIHgtaWQ9XCIke1RJRF9TZWFyY2hGb3JtfVwiIGNsYXNzPVwibXVpLWZvcm0tLWlubGluZVwiPlxuICAgICAgICAgICAgPCEtLXRoaXMgaXMgYSBsaXR0bGUgaGFjayB0byBoYXZlIHRoaW5ncyBjZW50ZXJlZC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiPvCflI08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktdGV4dGZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHBsYWNlaG9sZGVyPVwiU2VhcmNoIGFuIGF1ZGlvIHRpdGxlXCIgeC1pZD1cIiR7VElEX1NlYXJjaFRlcm19XCIgdHlwZT1cInRleHRcIiBhdXRvZm9jdXM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gcm9sZT1cInN1Ym1pdFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+8J+UjTwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDxiciAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVRpdGxlOiAodGVtcGxhdGUsIGRpc3BsYXllZCkgPT4ge1xuICAgICAgICBpZiAoZGlzcGxheWVkKVxuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LnJlbW92ZSgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QuYWRkKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgyIHgtaWQ9XCJ0aXRsZVwiPjwvaDI+XG4gICAgICAgIDxkaXYgeC1pZD1cImZpbGVzXCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5zZWFyY2hSZXN1bHRQYW5lbCA9IHtcbiAgICBjcmVhdGU6ICgpID0+IHRlbXBsYXRlc18xLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UodGVtcGxhdGVIdG1sKSxcbiAgICBkaXNwbGF5U2VhcmNoaW5nOiAoZWxlbWVudHMsIHRlcm0pID0+IHtcbiAgICAgICAgZWxlbWVudHMudGl0bGUuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+U2VhcmNoaW5nICcke3Rlcm19JyAuLi48L2Rpdj5gO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgUmVzdWx0cyBmb3IgJyR7dmFsdWVzLnRlcm19J2A7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuZmlsZXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChmID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2PiR7SlNPTi5zdHJpbmdpZnkoZil9PC9kaXY+YDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+JHtmLm5hbWV9PC9kaXY+YDtcbiAgICAgICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudHMuZmlsZXMuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+Tm8gcmVzdWx0czwvZGl2PmA7XG4gICAgICAgIH1cbiAgICB9LFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1yZXN1bHQtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2xzID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IGVsZW1lbnRzRGF0YSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4ob2JqLCBodG1sKSB7XG4gICAgbGV0IHJvb3QgPSBVaVRvb2xzLmVsRnJvbUh0bWwoaHRtbCk7XG4gICAgb2JqWydyb290J10gPSByb290O1xuICAgIFVpVG9vbHMuZWxzKHJvb3QsIGBbeC1pZF1gKS5mb3JFYWNoKGUgPT4gb2JqW2UuZ2V0QXR0cmlidXRlKCd4LWlkJyldID0gZSk7XG4gICAgZWxlbWVudHNEYXRhLnNldChyb290LCBvYmopO1xuICAgIHJldHVybiByb290O1xufVxuZXhwb3J0cy5jcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4gPSBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW47XG5mdW5jdGlvbiBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YShyb290KSB7XG4gICAgY29uc3QgZGF0YSA9IGVsZW1lbnRzRGF0YS5nZXQocm9vdCk7XG4gICAgcmV0dXJuIGRhdGE7XG59XG5leHBvcnRzLmdldFRlbXBsYXRlSW5zdGFuY2VEYXRhID0gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGE7XG5mdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlKGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbih7fSwgaHRtbCk7XG4gICAgcmV0dXJuIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpO1xufVxuZXhwb3J0cy5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlID0gY3JlYXRlVGVtcGxhdGVJbnN0YW5jZTtcbmNvbnN0IEVNUFRZX0xPQ0FUSU9OID0geyBlbGVtZW50OiBudWxsLCBjaGlsZEluZGV4OiAtMSB9O1xuZnVuY3Rpb24gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKGVsZW1lbnRzLCBldmVudCkge1xuICAgIGxldCBlbHMgPSBuZXcgU2V0KE9iamVjdC52YWx1ZXMoZWxlbWVudHMpKTtcbiAgICBsZXQgYyA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgcCA9IG51bGw7XG4gICAgZG8ge1xuICAgICAgICBpZiAoZWxzLmhhcyhjKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBjLFxuICAgICAgICAgICAgICAgIGNoaWxkSW5kZXg6IHAgJiYgQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjLmNoaWxkcmVuLCBwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYyA9PSBlbGVtZW50cy5yb290KVxuICAgICAgICAgICAgcmV0dXJuIEVNUFRZX0xPQ0FUSU9OO1xuICAgICAgICBwID0gYztcbiAgICAgICAgYyA9IGMucGFyZW50RWxlbWVudDtcbiAgICB9IHdoaWxlIChjKTtcbiAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG59XG5leHBvcnRzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbiA9IHRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlcy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGVsKGlkKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbn1cbmV4cG9ydHMuZWwgPSBlbDtcbmZ1bmN0aW9uIGVscyhlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufVxuZXhwb3J0cy5lbHMgPSBlbHM7XG5mdW5jdGlvbiBlbEZyb21IdG1sKGh0bWwpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gcGFyZW50LmNoaWxkcmVuLml0ZW0oMCk7XG59XG5leHBvcnRzLmVsRnJvbUh0bWwgPSBlbEZyb21IdG1sO1xuZnVuY3Rpb24gc3RvcEV2ZW50KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbn1cbmV4cG9ydHMuc3RvcEV2ZW50ID0gc3RvcEV2ZW50O1xuZnVuY3Rpb24qIGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoc3RhcnQpIHtcbiAgICB3aGlsZSAoc3RhcnQpIHtcbiAgICAgICAgeWllbGQgc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucGFyZW50RWxlbWVudDtcbiAgICB9XG59XG5leHBvcnRzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQgPSBpdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dWktdG9vbC5qcy5tYXAiXSwic291cmNlUm9vdCI6IiJ9
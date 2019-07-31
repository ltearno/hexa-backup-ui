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
    <div x-id="${PLAYLIST}" class="mui--text-center"></div>
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
                        if (index < this.queue.length)
                            this.play(index);
                        else
                            this.playNext(); // will fetch from unroller if present
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
        else if (this.itemUnroller) {
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
        if (index == this.queue.length - 1) {
            this.audioPanel.playlist.scrollTop += 100000;
        }
    }
    refreshPlaylist() {
        if (this.refreshTimer)
            clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(() => this.realRefreshPlaylist(), 10);
    }
    realRefreshPlaylist() {
        if (this.largeDisplay)
            this.expandedElements.forEach(e => e.classList.remove('is-hidden'));
        else
            this.expandedElements.forEach(e => e.classList.add('is-hidden'));
        if (!this.queue || !this.queue.length) {
            if (this.largeDisplay)
                this.audioPanel.playlist.innerHTML = '<span class="mui--text-dark-secondary">There are no items in your playlist. Click on songs to play them.</span>';
            else
                this.audioPanel.playlist.innerHTML = '';
            return;
        }
        if (this.largeDisplay) {
            let html = ``;
            for (let i = 0; i < this.queue.length; i++) {
                let item = this.queue[i];
                html += this.playlistItemHtml(i, item.name, false);
            }
            this.audioPanel.playlist.innerHTML = html;
        }
        else {
            if (this.currentIndex >= 0 && this.currentIndex < this.queue.length)
                this.audioPanel.playlist.innerHTML = this.playlistItemHtml(this.currentIndex, this.queue[this.currentIndex].name, true);
            else
                this.audioPanel.playlist.innerHTML = "";
        }
        if (this.itemUnroller && this.itemUnroller.hasNext())
            this.audioPanel.playlist.innerHTML += `<div x-queue-index="${this.queue.length}" class="onclick mui--text-dark-secondary is-onelinetext">${this.itemUnroller.name()}</div>`;
        if (this.largeDisplay)
            this.audioPanel.playlist.innerHTML += `<div class="mui--text-dark-secondary"><a x-id='clear-playlist' href='#'>clear playlist</a></div>`;
        // after refresh steps
        if (this.largeDisplay && this.scrollToPlayingItem) {
            this.scrollToPlayingItem = false;
            if (this.currentIndex >= 0) {
                let e = this.audioPanel.playlist.querySelector(`[x-queue-index='${this.currentIndex}']`);
                if (e) {
                    e.scrollIntoView();
                }
            }
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

/***/ "./public/files-panel.js":
/*!*******************************!*\
  !*** ./public/files-panel.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
const templates_1 = __webpack_require__(/*! ./templates */ "./public/templates.js");
const TID_SearchTerm = 'term';
const TID_Files = 'files';
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2>Results for '<span x-id="${TID_SearchTerm}"></span>'</h2>
        <div x-id="${TID_Files}"></div>
    </div>
</div>`;
exports.filesPanel = {
    create: () => templates_1.createTemplateInstance(templateHtml),
    displaySearching: (elements, term) => {
        elements.term.innerText = term;
        elements.files.innerHTML = `<div class="mui--text-dark-hint">Searching ...</div>`;
    },
    setValues: (elements, values) => {
        elements.term.innerText = values.term;
        if (values.files && values.files.length)
            elements.files.innerHTML = values.files.map(f => `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`).join('');
        else
            elements.files.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
    },
};
//# sourceMappingURL=files-panel.js.map

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
const FilesPanel = __webpack_require__(/*! ./files-panel */ "./public/files-panel.js");
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
const filesPanel = FilesPanel.filesPanel.create();
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
    FilesPanel.filesPanel.displaySearching(filesPanel, term);
    if (!filesPanel.root.isConnected)
        addContent(filesPanel.root);
    let res = await Rest.search(term, 'audio/%');
    // HACK seulement parceque c'est de l'audio
    res.files = res.files.map(file => {
        let dot = file.name.lastIndexOf('.');
        if (dot)
            file.name = file.name.substring(0, dot);
        file.name = file.name.replace(/'_'/g, ' ')
            .replace(/'  '/g, ' ')
            .replace(/[ ]*-[ ]*/g, ' - ');
        return file;
    });
    lastDisplayedFiles = res.files;
    lastSearchTerm = term;
    FilesPanel.filesPanel.setValues(filesPanel, {
        term: searchPanel.term.value,
        files: res.files
    });
});
filesPanel.root.addEventListener('click', event => {
    // todo : knownledge to do that is in files-panel
    let { element, childIndex } = Templates.templateGetEventLocation(filesPanel, event);
    if (lastDisplayedFiles && element == filesPanel.files && childIndex >= 0 && childIndex < lastDisplayedFiles.length) {
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
        const { resultDirectories, resultFilesddd } = await Network.postData(`${exports.HEXA_BACKUP_BASE_URL}/search`, searchSpec);
        return {
            directories: resultDirectories,
            files: resultFilesddd
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9maWxlcy1wYW5lbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL25ldHdvcmsuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3Jlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3NlYXJjaC1wYW5lbC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvdGVtcGxhdGVzLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy91aS10b29sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGtEQUEwQyxnQ0FBZ0M7QUFDMUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxnRUFBd0Qsa0JBQWtCO0FBQzFFO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUF5QyxpQ0FBaUM7QUFDMUUsd0hBQWdILG1CQUFtQixFQUFFO0FBQ3JJO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRkEsQ0FBYztBQUNkLDhDQUE4QyxjQUFj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O0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQzFDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vcHVibGljL2luZGV4LmpzXCIpO1xuIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBQTEFZRVIgPSAncGxheWVyJztcbmNvbnN0IFBMQVlMSVNUID0gJ3BsYXlsaXN0JztcbmNvbnN0IEVYUEFOREVSID0gJ2V4cGFuZGVyJztcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9XCJhdWRpby1mb290ZXIgbXVpLXBhbmVsXCI+XG4gICAgPGgzIGNsYXNzPVwieC13aGVuLWxhcmdlLWRpc3BsYXlcIj5QbGF5bGlzdDwvaDM+XG4gICAgPGRpdiB4LWlkPVwiJHtQTEFZTElTVH1cIiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj48L2Rpdj5cbiAgICA8ZGl2IHgtaWQ9XCIke0VYUEFOREVSfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtY2VudGVyXCI+4piwPC9kaXY+XG4gICAgPGF1ZGlvIHgtaWQ9XCIke1BMQVlFUn1cIiBjbGFzcz1cImF1ZGlvLXBsYXllclwiIGNsYXNzPVwibXVpLS1wdWxsLXJpZ2h0XCIgY29udHJvbHMgcHJlbG9hZD1cIm1ldGFkYXRhXCI+PC9hdWRpbz5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIGAke1Jlc3QuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPSR7bWltZVR5cGV9YCk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBtaW1lVHlwZSk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5wbGF5KCk7XG4gICAgICAgIGVsZW1lbnRzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShcImlzLWhpZGRlblwiKTtcbiAgICB9LFxufTtcbmNsYXNzIEF1ZGlvSnVrZWJveCB7XG4gICAgY29uc3RydWN0b3IoYXVkaW9QYW5lbCkge1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwgPSBhdWRpb1BhbmVsO1xuICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIC8vIGlmIHNjcm9sbCB0byBwbGF5aW5nIGl0ZW0gaXMgcmVxdWlyZWQgYWZ0ZXIgYSBwbGF5bGlzdCByZWRyYXdcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBxdWV1ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcpKTtcbiAgICAgICAgICAgIGlmIChxdWV1ZSAmJiBxdWV1ZSBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBlcnJvcmAsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5leHBhbmRlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFyZ2VEaXNwbGF5ID0gIXRoaXMubGFyZ2VEaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgVWlUb29scy5pdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleEF0dHIgPSBlLmdldEF0dHJpYnV0ZSgneC1xdWV1ZS1pbmRleCcpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXhBdHRyID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludChpbmRleEF0dHIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IE5hTikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5KGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXlOZXh0KCk7IC8vIHdpbGwgZmV0Y2ggZnJvbSB1bnJvbGxlciBpZiBwcmVzZW50XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzID0gVWlUb29scy5lbHModGhpcy5hdWRpb1BhbmVsLnJvb3QsICcueC13aGVuLWxhcmdlLWRpc3BsYXknKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgY3VycmVudEl0ZW0oKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IDAgfHwgdGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgIH1cbiAgICBhZGRBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaXRlbSA9IHtcbiAgICAgICAgICAgIHNoYTogaXRlbS5zaGEsXG4gICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICBtaW1lVHlwZTogaXRlbS5taW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGlmIChjdXJyZW50SXRlbSAmJiBjdXJyZW50SXRlbS5zaGEgPT0gaXRlbS5zaGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIHRoaXMucHVzaFF1ZXVlQW5kUGxheShpdGVtKTtcbiAgICB9XG4gICAgcGxheU5leHQoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCArIDEgPCB0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRoaXMuY3VycmVudEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5pdGVtVW5yb2xsZXIpIHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5pdGVtVW5yb2xsZXIudW5yb2xsKCk7XG4gICAgICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pdGVtVW5yb2xsZXIuaGFzTmV4dCgpKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtVW5yb2xsZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0SXRlbVVucm9sbGVyKGl0ZW1VbnJvbGxlcikge1xuICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IGl0ZW1VbnJvbGxlcjtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgcHVzaFF1ZXVlQW5kUGxheShpdGVtKSB7XG4gICAgICAgIHRoaXMucXVldWUucHVzaChpdGVtKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcsIEpTT04uc3RyaW5naWZ5KHRoaXMucXVldWUpKTtcbiAgICAgICAgdGhpcy5wbGF5KHRoaXMucXVldWUubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIHBsYXkoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnF1ZXVlW2luZGV4XTtcbiAgICAgICAgICAgIGV4cG9ydHMuYXVkaW9QYW5lbC5wbGF5KHRoaXMuYXVkaW9QYW5lbCwgaXRlbS5uYW1lLCBpdGVtLnNoYSwgaXRlbS5taW1lVHlwZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbeC1mb3Itc2hhPScke2l0ZW0uc2hhLnN1YnN0cigwLCA1KX0nXWApLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLXdlaWdodGVkJykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA9PSB0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxUb3AgKz0gMTAwMDAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlZnJlc2hQbGF5bGlzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMucmVmcmVzaFRpbWVyKVxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucmVmcmVzaFRpbWVyKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVhbFJlZnJlc2hQbGF5bGlzdCgpLCAxMCk7XG4gICAgfVxuICAgIHJlYWxSZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSlcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuZXhwYW5kZWRFbGVtZW50cy5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy1oaWRkZW4nKSk7XG4gICAgICAgIGlmICghdGhpcy5xdWV1ZSB8fCAhdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSlcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPVwibXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5XCI+VGhlcmUgYXJlIG5vIGl0ZW1zIGluIHlvdXIgcGxheWxpc3QuIENsaWNrIG9uIHNvbmdzIHRvIHBsYXkgdGhlbS48L3NwYW4+JztcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5KSB7XG4gICAgICAgICAgICBsZXQgaHRtbCA9IGBgO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLnF1ZXVlW2ldO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gdGhpcy5wbGF5bGlzdEl0ZW1IdG1sKGksIGl0ZW0ubmFtZSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gMCAmJiB0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSB0aGlzLnBsYXlsaXN0SXRlbUh0bWwodGhpcy5jdXJyZW50SW5kZXgsIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdLm5hbWUsIHRydWUpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MICs9IGA8ZGl2IHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpXG4gICAgICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MICs9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstc2Vjb25kYXJ5XCI+PGEgeC1pZD0nY2xlYXItcGxheWxpc3QnIGhyZWY9JyMnPmNsZWFyIHBsYXlsaXN0PC9hPjwvZGl2PmA7XG4gICAgICAgIC8vIGFmdGVyIHJlZnJlc2ggc3RlcHNcbiAgICAgICAgaWYgKHRoaXMubGFyZ2VEaXNwbGF5ICYmIHRoaXMuc2Nyb2xsVG9QbGF5aW5nSXRlbSkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBlID0gdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LnF1ZXJ5U2VsZWN0b3IoYFt4LXF1ZXVlLWluZGV4PScke3RoaXMuY3VycmVudEluZGV4fSddYCk7XG4gICAgICAgICAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwbGF5bGlzdEl0ZW1IdG1sKGluZGV4LCBuYW1lLCBvbmVMaW5lVGV4dCkge1xuICAgICAgICByZXR1cm4gYDxkaXYgeC1xdWV1ZS1pbmRleD1cIiR7aW5kZXh9XCIgY2xhc3M9XCJvbmNsaWNrICR7b25lTGluZVRleHQgPyAnaXMtb25lbGluZXRleHQnIDogJyd9ICR7aW5kZXggPT0gdGhpcy5jdXJyZW50SW5kZXggPyAnbXVpLS10ZXh0LWhlYWRsaW5lJyA6ICcnfVwiPiR7bmFtZX08L2Rpdj5gO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9KdWtlYm94ID0gQXVkaW9KdWtlYm94O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXVkaW8tcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBOZXR3b3JrID0gcmVxdWlyZShcIi4vbmV0d29ya1wiKTtcbmZ1bmN0aW9uIHdhaXQoZHVyYXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIGR1cmF0aW9uKSk7XG59XG5jbGFzcyBBdXRoIHtcbiAgICBvbkVycm9yKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfVxuICAgIGFzeW5jIGxvb3AoKSB7XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IE5ldHdvcmsucG9zdERhdGEoYGh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyL2F1dGhgKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlcyA9IGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvd2VsbC1rbm93bi92MS9zZXRDb29raWVgLCB7ICdBdXRob3JpemF0aW9uJzogYEJlYXJlciAke3Jlc3BvbnNlLnRva2VufWAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzIHx8ICFyZXMubGlmZXRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBzZXRDb29raWVgLCByZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGNhbm5vdCBvYnRhaW4gYXV0aCB0b2tlbmApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHJlZnJlc2ggYXV0aCAoJHtlcnJ9KWApO1xuICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZXZlcnkgMzAgbWludXRlc1xuICAgICAgICAgICAgYXdhaXQgd2FpdCgxMDAwICogNjAgKiAzMCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhdXRvUmVuZXdBdXRoKCkge1xuICAgIGxldCBhdXRoID0gbmV3IEF1dGgoKTtcbiAgICBhdXRoLmxvb3AoKTtcbn1cbmV4cG9ydHMuYXV0b1JlbmV3QXV0aCA9IGF1dG9SZW5ld0F1dGg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRoLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBUSURfU2VhcmNoVGVybSA9ICd0ZXJtJztcbmNvbnN0IFRJRF9GaWxlcyA9ICdmaWxlcyc7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDI+UmVzdWx0cyBmb3IgJzxzcGFuIHgtaWQ9XCIke1RJRF9TZWFyY2hUZXJtfVwiPjwvc3Bhbj4nPC9oMj5cbiAgICAgICAgPGRpdiB4LWlkPVwiJHtUSURfRmlsZXN9XCI+PC9kaXY+XG4gICAgPC9kaXY+XG48L2Rpdj5gO1xuZXhwb3J0cy5maWxlc1BhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIGRpc3BsYXlTZWFyY2hpbmc6IChlbGVtZW50cywgdGVybSkgPT4ge1xuICAgICAgICBlbGVtZW50cy50ZXJtLmlubmVyVGV4dCA9IHRlcm07XG4gICAgICAgIGVsZW1lbnRzLmZpbGVzLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPlNlYXJjaGluZyAuLi48L2Rpdj5gO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50ZXJtLmlubmVyVGV4dCA9IHZhbHVlcy50ZXJtO1xuICAgICAgICBpZiAodmFsdWVzLmZpbGVzICYmIHZhbHVlcy5maWxlcy5sZW5ndGgpXG4gICAgICAgICAgICBlbGVtZW50cy5maWxlcy5pbm5lckhUTUwgPSB2YWx1ZXMuZmlsZXMubWFwKGYgPT4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+JHtmLm5hbWV9PC9kaXY+YCkuam9pbignJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVsZW1lbnRzLmZpbGVzLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgIH0sXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZmlsZXMtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2wgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgU2VhcmNoUGFuZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtcGFuZWxcIik7XG5jb25zdCBGaWxlc1BhbmVsID0gcmVxdWlyZShcIi4vZmlsZXMtcGFuZWxcIik7XG5jb25zdCBBdWRpb1BhbmVsID0gcmVxdWlyZShcIi4vYXVkaW8tcGFuZWxcIik7XG5jb25zdCBSZXN0ID0gcmVxdWlyZShcIi4vcmVzdFwiKTtcbmNvbnN0IEF1dGggPSByZXF1aXJlKFwiLi9hdXRoXCIpO1xuY29uc3QgVGVtcGxhdGVzID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xubGV0IGNvbnRlbnRzID0gW107XG5mdW5jdGlvbiBhZGRDb250ZW50KGNvbnRlbnQpIHtcbiAgICBjb250ZW50cy5wdXNoKGNvbnRlbnQpO1xuICAgIFVpVG9vbC5lbCgnY29udGVudC13cmFwcGVyJykuaW5zZXJ0QmVmb3JlKGNvbnRlbnQsIFVpVG9vbC5lbCgnZmlyc3QtZWxlbWVudC1hZnRlci1jb250ZW50cycpKTtcbn1cbmZ1bmN0aW9uIGNsZWFyQ29udGVudHMoKSB7XG4gICAgY29uc3QgY29udGVudFdyYXBwZXIgPSBVaVRvb2wuZWwoJ2NvbnRlbnQtd3JhcHBlcicpO1xuICAgIGNvbnRlbnRzLmZvckVhY2goZWxlbWVudCA9PiBjb250ZW50V3JhcHBlci5yZW1vdmVDaGlsZChlbGVtZW50KSk7XG4gICAgY29udGVudHMgPSBbXTtcbn1cbmNvbnN0IHNlYXJjaFBhbmVsID0gU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuY3JlYXRlKCk7XG5jb25zdCBmaWxlc1BhbmVsID0gRmlsZXNQYW5lbC5maWxlc1BhbmVsLmNyZWF0ZSgpO1xuY29uc3QgYXVkaW9QYW5lbCA9IEF1ZGlvUGFuZWwuYXVkaW9QYW5lbC5jcmVhdGUoKTtcbmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXVkaW9QYW5lbC5yb290KTtcbmFkZENvbnRlbnQoc2VhcmNoUGFuZWwucm9vdCk7XG5jb25zdCBhdWRpb0p1a2Vib3ggPSBuZXcgQXVkaW9QYW5lbC5BdWRpb0p1a2Vib3goYXVkaW9QYW5lbCk7XG5BdXRoLmF1dG9SZW5ld0F1dGgoKTtcbi8qKlxuICogRXZlbnRzXG4gKi9cbmxldCBsYXN0RGlzcGxheWVkRmlsZXMgPSBudWxsO1xubGV0IGxhc3RTZWFyY2hUZXJtID0gbnVsbDsgLy8gSEFDSyB2ZXJ5IHRlbXBvcmFyeVxuc2VhcmNoUGFuZWwuZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBVaVRvb2wuc3RvcEV2ZW50KGV2ZW50KTtcbiAgICBsZXQgdGVybSA9IHNlYXJjaFBhbmVsLnRlcm0udmFsdWU7XG4gICAgU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuZGlzcGxheVRpdGxlKHNlYXJjaFBhbmVsLCBmYWxzZSk7XG4gICAgRmlsZXNQYW5lbC5maWxlc1BhbmVsLmRpc3BsYXlTZWFyY2hpbmcoZmlsZXNQYW5lbCwgdGVybSk7XG4gICAgaWYgKCFmaWxlc1BhbmVsLnJvb3QuaXNDb25uZWN0ZWQpXG4gICAgICAgIGFkZENvbnRlbnQoZmlsZXNQYW5lbC5yb290KTtcbiAgICBsZXQgcmVzID0gYXdhaXQgUmVzdC5zZWFyY2godGVybSwgJ2F1ZGlvLyUnKTtcbiAgICAvLyBIQUNLIHNldWxlbWVudCBwYXJjZXF1ZSBjJ2VzdCBkZSBsJ2F1ZGlvXG4gICAgcmVzLmZpbGVzID0gcmVzLmZpbGVzLm1hcChmaWxlID0+IHtcbiAgICAgICAgbGV0IGRvdCA9IGZpbGUubmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgICBpZiAoZG90KVxuICAgICAgICAgICAgZmlsZS5uYW1lID0gZmlsZS5uYW1lLnN1YnN0cmluZygwLCBkb3QpO1xuICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLm5hbWUucmVwbGFjZSgvJ18nL2csICcgJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8nICAnL2csICcgJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bIF0qLVsgXSovZywgJyAtICcpO1xuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICB9KTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuZmlsZXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIEZpbGVzUGFuZWwuZmlsZXNQYW5lbC5zZXRWYWx1ZXMoZmlsZXNQYW5lbCwge1xuICAgICAgICB0ZXJtOiBzZWFyY2hQYW5lbC50ZXJtLnZhbHVlLFxuICAgICAgICBmaWxlczogcmVzLmZpbGVzXG4gICAgfSk7XG59KTtcbmZpbGVzUGFuZWwucm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2ZW50ID0+IHtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIGZpbGVzLXBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihmaWxlc1BhbmVsLCBldmVudCk7XG4gICAgaWYgKGxhc3REaXNwbGF5ZWRGaWxlcyAmJiBlbGVtZW50ID09IGZpbGVzUGFuZWwuZmlsZXMgJiYgY2hpbGRJbmRleCA+PSAwICYmIGNoaWxkSW5kZXggPCBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGF1ZGlvSnVrZWJveC5hZGRBbmRQbGF5KGxhc3REaXNwbGF5ZWRGaWxlc1tjaGlsZEluZGV4XSk7XG4gICAgICAgIC8vIHNldCBhbiB1bnJvbGxlclxuICAgICAgICBsZXQgdGVybSA9IGxhc3RTZWFyY2hUZXJtO1xuICAgICAgICBsZXQgdW5yb2xsSW5kZXggPSBjaGlsZEluZGV4ICsgMTtcbiAgICAgICAgbGV0IGZpbGVzID0gbGFzdERpc3BsYXllZEZpbGVzO1xuICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgIG5hbWU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodW5yb2xsSW5kZXggPj0gMCAmJiB1bnJvbGxJbmRleCA8IGZpbGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGB0aGVuICcke2ZpbGVzW3Vucm9sbEluZGV4XS5uYW1lLnN1YnN0cigwLCAyMCl9JyBhbmQgb3RoZXIgJyR7dGVybX0nIHNlYXJjaC4uLmA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGBmaW5pc2hlZCAnJHt0ZXJtfSBzb25nc2A7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiBmaWxlc1t1bnJvbGxJbmRleCsrXSxcbiAgICAgICAgICAgIGhhc05leHQ6ICgpID0+IHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCBmaWxlcy5sZW5ndGhcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmFzeW5jIGZ1bmN0aW9uIGFmdGVyRmV0Y2gocmVzcG9uc2UpIHtcbiAgICBpZiAoIXJlc3BvbnNlIHx8ICFyZXNwb25zZS5vaykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBiYWQgcmVzcG9uc2UgOiAke0pTT04uc3RyaW5naWZ5KHJlc3BvbnNlKX1gKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICBsZXQgc2NpID0gcmVjZWl2ZWRDb250ZW50VHlwZS5pbmRleE9mKCc7Jyk7XG4gICAgaWYgKHNjaSA+PSAwKVxuICAgICAgICByZWNlaXZlZENvbnRlbnRUeXBlID0gcmVjZWl2ZWRDb250ZW50VHlwZS5zdWJzdHIoMCwgc2NpKTtcbiAgICBpZiAocmVjZWl2ZWRDb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xufVxuZnVuY3Rpb24gZ2V0RGF0YSh1cmwsIGhlYWRlcnMgPSBudWxsKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyc1xuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5nZXREYXRhID0gZ2V0RGF0YTtcbmZ1bmN0aW9uIHBvc3REYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wb3N0RGF0YSA9IHBvc3REYXRhO1xuZnVuY3Rpb24gcHV0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IGNvbnRlbnRUeXBlIH0sXG4gICAgICAgIGJvZHk6IGNvbnRlbnRUeXBlID09ICdhcHBsaWNhdGlvbi9qc29uJyA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogZGF0YVxuICAgIH0pXG4gICAgICAgIC50aGVuKGFmdGVyRmV0Y2gpO1xufVxuZXhwb3J0cy5wdXREYXRhID0gcHV0RGF0YTtcbmZ1bmN0aW9uIGRlbGV0ZURhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZGVsZXRlRGF0YSA9IGRlbGV0ZURhdGE7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1uZXR3b3JrLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgTmV0d29yayA9IHJlcXVpcmUoXCIuL25ldHdvcmtcIik7XG5leHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwiaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgPyBcImh0dHBzOi8vaG9tZS5sdGVjb25zdWx0aW5nLmZyXCIgOiBcImh0dHBzOi8vbG9jYWxob3N0OjUwMDVcIjtcbmFzeW5jIGZ1bmN0aW9uIHNlYXJjaChzZWFyY2hUZXh0LCBtaW1lVHlwZSkge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBzZWFyY2hTcGVjID0ge1xuICAgICAgICAgICAgbmFtZTogc2VhcmNoVGV4dCxcbiAgICAgICAgICAgIG1pbWVUeXBlOiBtaW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB7IHJlc3VsdERpcmVjdG9yaWVzLCByZXN1bHRGaWxlc2RkZCB9ID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zZWFyY2hgLCBzZWFyY2hTcGVjKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpcmVjdG9yaWVzOiByZXN1bHREaXJlY3RvcmllcyxcbiAgICAgICAgICAgIGZpbGVzOiByZXN1bHRGaWxlc2RkZFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuc2VhcmNoID0gc2VhcmNoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzdC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgVElEX1RpdGxlID0gJ3RpdGxlJztcbmNvbnN0IFRJRF9TZWFyY2hGb3JtID0gJ2Zvcm0nO1xuY29uc3QgVElEX1NlYXJjaFRlcm0gPSAndGVybSc7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDEgeC1pZD1cIiR7VElEX1RpdGxlfVwiIGNsYXNzPVwiYW5pbWF0ZWQtLXF1aWNrXCI+UmFjY29vbjwvaDE+XG4gICAgICAgIDxmb3JtIHgtaWQ9XCIke1RJRF9TZWFyY2hGb3JtfVwiIGNsYXNzPVwibXVpLWZvcm0tLWlubGluZVwiPlxuICAgICAgICAgICAgPCEtLXRoaXMgaXMgYSBsaXR0bGUgaGFjayB0byBoYXZlIHRoaW5ncyBjZW50ZXJlZC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiIHN0eWxlPVwidmlzaWJpbGl0eTogaGlkZGVuO1wiPvCflI08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktdGV4dGZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHBsYWNlaG9sZGVyPVwiU2VhcmNoIGFuIGF1ZGlvIHRpdGxlXCIgeC1pZD1cIiR7VElEX1NlYXJjaFRlcm19XCIgdHlwZT1cInRleHRcIiBhdXRvZm9jdXM+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gcm9sZT1cInN1Ym1pdFwiIGNsYXNzPVwibXVpLWJ0biBtdWktYnRuLS1mbGF0XCI+8J+UjTwvYnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgICAgIDxiciAvPlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuc2VhcmNoUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgZGlzcGxheVRpdGxlOiAodGVtcGxhdGUsIGRpc3BsYXllZCkgPT4ge1xuICAgICAgICBpZiAoZGlzcGxheWVkKVxuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LnJlbW92ZSgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0ZW1wbGF0ZS50aXRsZS5jbGFzc0xpc3QuYWRkKCdoZXhhLS1yZWR1Y2VkJyk7XG4gICAgfVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFVpVG9vbHMgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgZWxlbWVudHNEYXRhID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbihvYmosIGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IFVpVG9vbHMuZWxGcm9tSHRtbChodG1sKTtcbiAgICBvYmpbJ3Jvb3QnXSA9IHJvb3Q7XG4gICAgVWlUb29scy5lbHMocm9vdCwgYFt4LWlkXWApLmZvckVhY2goZSA9PiBvYmpbZS5nZXRBdHRyaWJ1dGUoJ3gtaWQnKV0gPSBlKTtcbiAgICBlbGVtZW50c0RhdGEuc2V0KHJvb3QsIG9iaik7XG4gICAgcmV0dXJuIHJvb3Q7XG59XG5leHBvcnRzLmNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbiA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbjtcbmZ1bmN0aW9uIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpIHtcbiAgICBjb25zdCBkYXRhID0gZWxlbWVudHNEYXRhLmdldChyb290KTtcbiAgICByZXR1cm4gZGF0YTtcbn1cbmV4cG9ydHMuZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEgPSBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YTtcbmZ1bmN0aW9uIGNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UoaHRtbCkge1xuICAgIGxldCByb290ID0gY3JlYXRlRWxlbWVudEFuZExvY2F0ZUNoaWxkcmVuKHt9LCBodG1sKTtcbiAgICByZXR1cm4gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGEocm9vdCk7XG59XG5leHBvcnRzLmNyZWF0ZVRlbXBsYXRlSW5zdGFuY2UgPSBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlO1xuY29uc3QgRU1QVFlfTE9DQVRJT04gPSB7IGVsZW1lbnQ6IG51bGwsIGNoaWxkSW5kZXg6IC0xIH07XG5mdW5jdGlvbiB0ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZWxlbWVudHMsIGV2ZW50KSB7XG4gICAgbGV0IGVscyA9IG5ldyBTZXQoT2JqZWN0LnZhbHVlcyhlbGVtZW50cykpO1xuICAgIGxldCBjID0gZXZlbnQudGFyZ2V0O1xuICAgIGxldCBwID0gbnVsbDtcbiAgICBkbyB7XG4gICAgICAgIGlmIChlbHMuaGFzKGMpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGMsXG4gICAgICAgICAgICAgICAgY2hpbGRJbmRleDogcCAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGMuY2hpbGRyZW4sIHApXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjID09IGVsZW1lbnRzLnJvb3QpXG4gICAgICAgICAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG4gICAgICAgIHAgPSBjO1xuICAgICAgICBjID0gYy5wYXJlbnRFbGVtZW50O1xuICAgIH0gd2hpbGUgKGMpO1xuICAgIHJldHVybiBFTVBUWV9MT0NBVElPTjtcbn1cbmV4cG9ydHMudGVtcGxhdGVHZXRFdmVudExvY2F0aW9uID0gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dGVtcGxhdGVzLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gZWwoaWQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xufVxuZXhwb3J0cy5lbCA9IGVsO1xuZnVuY3Rpb24gZWxzKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5leHBvcnRzLmVscyA9IGVscztcbmZ1bmN0aW9uIGVsRnJvbUh0bWwoaHRtbCkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHBhcmVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiBwYXJlbnQuY2hpbGRyZW4uaXRlbSgwKTtcbn1cbmV4cG9ydHMuZWxGcm9tSHRtbCA9IGVsRnJvbUh0bWw7XG5mdW5jdGlvbiBzdG9wRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xufVxuZXhwb3J0cy5zdG9wRXZlbnQgPSBzdG9wRXZlbnQ7XG5mdW5jdGlvbiogaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudChzdGFydCkge1xuICAgIHdoaWxlIChzdGFydCkge1xuICAgICAgICB5aWVsZCBzdGFydDtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5wYXJlbnRFbGVtZW50O1xuICAgIH1cbn1cbmV4cG9ydHMuaXRlcl9wYXRoX3RvX3Jvb3RfZWxlbWVudCA9IGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11aS10b29sLmpzLm1hcCJdLCJzb3VyY2VSb290IjoiIn0=
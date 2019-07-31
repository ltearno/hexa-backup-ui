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
        console.log(`item: `, item);
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
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items"></div>
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
            elements.items.innerHTML = values.items.map(f => {
                if (f.mimeType == 'application/directory')
                    return `<div class="onclick"><i>${f.name} ...</i></div>`;
                return `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`;
            }).join('');
        }
        else {
            elements.items.innerHTML = `<div class="mui--text-dark-hint">No results</div>`;
        }
    },
};
//# sourceMappingURL=directory-panel.js.map

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
    document.scrollingElement.scrollTop = 0;
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
    document.scrollingElement.scrollTop = 0;
    const url = `#/directories/${sha}?name=${encodeURIComponent(name)}`;
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
function itemDefaultAction(childIndex) {
    let item = lastDisplayedFiles[childIndex];
    if (item.mimeType == 'application/directory') {
        goLoadDirectory(item.sha, item.name);
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
    else {
        window.location.href = `${Rest.HEXA_BACKUP_BASE_URL}/sha/${item.sha}/content?type=${item.mimeType}`;
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

/***/ "./public/mime-types-module.js":
/*!*************************************!*\
  !*** ./public/mime-types-module.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
﻿
Object.defineProperty(exports, "__esModule", { value: true });
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
const templateHtml = `
<div class='mui-container-fluid'>
    <div class="mui--text-center">
        <h2 x-id="title"></h2>
        <div x-id="items"></div>
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
            elements.items.innerHTML = values.items.map(f => {
                if (f.mimeType == 'application/directory')
                    return `<div class="onclick"><i>${f.name} ...</i></div>`;
                return `<div x-for-sha="${f.sha.substr(0, 5)}" class="onclick">${f.name}</div>`;
            }).join('');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2F1ZGlvLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9hdXRoLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9kaXJlY3RvcnktcGFuZWwuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2luZGV4LmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9taW1lLXR5cGVzLW1vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvbmV0d29yay5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvcmVzdC5qcyIsIndlYnBhY2s6Ly8vLi9wdWJsaWMvc2VhcmNoLXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9zZWFyY2gtcmVzdWx0LXBhbmVsLmpzIiwid2VicGFjazovLy8uL3B1YmxpYy90ZW1wbGF0ZXMuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL3VpLXRvb2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsb0JBQW9CLG1CQUFPLENBQUMsMENBQWE7QUFDekMsYUFBYSxtQkFBTyxDQUFDLGdDQUFRO0FBQzdCLGdCQUFnQixtQkFBTyxDQUFDLHNDQUFXO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixTQUFTO0FBQzFCLGlCQUFpQixTQUFTO0FBQzFCLG1CQUFtQixPQUFPO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLDBCQUEwQixPQUFPLElBQUksZ0JBQWdCLFNBQVM7QUFDN0c7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixzQkFBc0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELHNCQUFzQjtBQUMzRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsdUJBQXVCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9ELG1CQUFtQixrQkFBa0IsNERBQTRELHlCQUF5QjtBQUM5SztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCxtQkFBbUIsc0JBQXNCLHlFQUF5RSxxREFBcUQ7QUFDL047QUFDQTtBQUNBLHdEQUF3RCxtQkFBbUIsa0JBQWtCLDREQUE0RCx5QkFBeUI7QUFDbEw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxNQUFNLG1CQUFtQixvQ0FBb0MsR0FBRyx1REFBdUQsSUFBSSxLQUFLO0FBQ3RLO0FBQ0E7QUFDQTtBQUNBLHVDOzs7Ozs7Ozs7Ozs7QUNsTUEsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVELGdCQUFnQixtQkFBTyxDQUFDLHNDQUFXO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhHQUE4Ryw0QkFBNEIsZUFBZSxHQUFHO0FBQzVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsSUFBSTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQzs7Ozs7Ozs7Ozs7O0FDeENBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RCxvQkFBb0IsbUJBQU8sQ0FBQywwQ0FBYTtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxNQUFNO0FBQ3JEO0FBQ0EsS0FBSztBQUNMO0FBQ0Esc0NBQXNDLFlBQVk7QUFDbEQ7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELE9BQU87QUFDN0QsMENBQTBDLG1CQUFtQixvQkFBb0IsT0FBTztBQUN4RixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSwyQzs7Ozs7Ozs7Ozs7O0FDOUJBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RCxlQUFlLG1CQUFPLENBQUMsc0NBQVc7QUFDbEMsb0JBQW9CLG1CQUFPLENBQUMsZ0RBQWdCO0FBQzVDLDBCQUEwQixtQkFBTyxDQUFDLDhEQUF1QjtBQUN6RCxtQkFBbUIsbUJBQU8sQ0FBQyw4Q0FBZTtBQUMxQyx1QkFBdUIsbUJBQU8sQ0FBQyxzREFBbUI7QUFDbEQsYUFBYSxtQkFBTyxDQUFDLGdDQUFRO0FBQzdCLGFBQWEsbUJBQU8sQ0FBQyxnQ0FBUTtBQUM3QixrQkFBa0IsbUJBQU8sQ0FBQywwQ0FBYTtBQUN2QyxrQkFBa0IsbUJBQU8sQ0FBQywwREFBcUI7QUFDL0M7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtEQUErRDtBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsb0JBQW9CO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixLQUFLO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyxJQUFJLFFBQVEseUJBQXlCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLDhDQUE4QyxRQUFRLHVDQUF1QyxVQUFVLEtBQUs7QUFDeEosNENBQTRDLEtBQUs7QUFDakQscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsMEJBQTBCLE9BQU8sU0FBUyxnQkFBZ0IsY0FBYztBQUMxRztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsc0JBQXNCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EsU0FBUyxzQkFBc0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQSxpQzs7Ozs7Ozs7Ozs7O0FDL09BLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDOzs7Ozs7Ozs7Ozs7QUNsZ0NBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0Esd0NBQXdDLHlCQUF5QjtBQUNqRTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsOEJBQThCO0FBQ2hEO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiw4QkFBOEI7QUFDaEQ7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLDhCQUE4QjtBQUNoRDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxtQzs7Ozs7Ozs7Ozs7O0FDekVBLENBQWM7QUFDZCw4Q0FBOEMsY0FBYztBQUM1RCxnQkFBZ0IsbUJBQU8sQ0FBQyxzQ0FBVztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsMkNBQTJDLDZCQUE2Qiw2QkFBNkI7QUFDcEg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLDZCQUE2QixPQUFPLElBQUk7QUFDNUU7QUFDQTtBQUNBLGdDOzs7Ozs7Ozs7Ozs7QUMxQkEsQ0FBYztBQUNkLDhDQUE4QyxjQUFjO0FBQzVELG9CQUFvQixtQkFBTyxDQUFDLDBDQUFhO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFO0FBQ3pFO0FBQ0EseUVBQXlFO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0M7Ozs7Ozs7Ozs7OztBQ2hDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsb0JBQW9CLG1CQUFPLENBQUMsMENBQWE7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRkFBa0YsS0FBSztBQUN2RjtBQUNBLEtBQUs7QUFDTDtBQUNBLG1EQUFtRCxZQUFZO0FBQy9EO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxPQUFPO0FBQzdELDBDQUEwQyxtQkFBbUIsb0JBQW9CLE9BQU87QUFDeEYsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsK0M7Ozs7Ozs7Ozs7OztBQzlCQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQsZ0JBQWdCLG1CQUFPLENBQUMsc0NBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EscUM7Ozs7Ozs7Ozs7OztBQzFDQSxDQUFjO0FBQ2QsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vcHVibGljL2luZGV4LmpzXCIpO1xuIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgVWlUb29scyA9IHJlcXVpcmUoXCIuL3VpLXRvb2xcIik7XG5jb25zdCBQTEFZRVIgPSAncGxheWVyJztcbmNvbnN0IFBMQVlMSVNUID0gJ3BsYXlsaXN0JztcbmNvbnN0IEVYUEFOREVSID0gJ2V4cGFuZGVyJztcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9XCJhdWRpby1mb290ZXIgbXVpLXBhbmVsXCI+XG4gICAgPGgzIGNsYXNzPVwieC13aGVuLWxhcmdlLWRpc3BsYXlcIj5QbGF5bGlzdDwvaDM+XG4gICAgPGRpdiB4LWlkPVwiJHtQTEFZTElTVH1cIj48L2Rpdj5cbiAgICA8ZGl2IHgtaWQ9XCIke0VYUEFOREVSfVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtY2VudGVyXCI+4piwPC9kaXY+XG4gICAgPGF1ZGlvIHgtaWQ9XCIke1BMQVlFUn1cIiBjbGFzcz1cImF1ZGlvLXBsYXllclwiIGNsYXNzPVwibXVpLS1wdWxsLXJpZ2h0XCIgY29udHJvbHMgcHJlbG9hZD1cIm1ldGFkYXRhXCI+PC9hdWRpbz5cbjwvZGl2PmA7XG5leHBvcnRzLmF1ZGlvUGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgcGxheTogKGVsZW1lbnRzLCBuYW1lLCBzaGEsIG1pbWVUeXBlKSA9PiB7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3NyYycsIGAke1Jlc3QuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NoYS8ke3NoYX0vY29udGVudD90eXBlPSR7bWltZVR5cGV9YCk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBtaW1lVHlwZSk7XG4gICAgICAgIGVsZW1lbnRzLnBsYXllci5wbGF5KCk7XG4gICAgICAgIGVsZW1lbnRzLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShcImlzLWhpZGRlblwiKTtcbiAgICB9LFxufTtcbmNsYXNzIEF1ZGlvSnVrZWJveCB7XG4gICAgY29uc3RydWN0b3IoYXVkaW9QYW5lbCkge1xuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwgPSBhdWRpb1BhbmVsO1xuICAgICAgICB0aGlzLmxhcmdlRGlzcGxheSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gLTE7XG4gICAgICAgIC8vIGlmIHNjcm9sbCB0byBwbGF5aW5nIGl0ZW0gaXMgcmVxdWlyZWQgYWZ0ZXIgYSBwbGF5bGlzdCByZWRyYXdcbiAgICAgICAgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtID0gdHJ1ZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBxdWV1ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3BsYXlsaXN0LWJhY2t1cCcpKTtcbiAgICAgICAgICAgIGlmIChxdWV1ZSAmJiBxdWV1ZSBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBxdWV1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBlcnJvcmAsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXllci5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignc3RhbGxlZCcsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGFsbGVkLCB0cnkgbmV4dCcpO1xuICAgICAgICAgICAgdGhpcy5wbGF5TmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hdWRpb1BhbmVsLmV4cGFuZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXJnZURpc3BsYXkgPSAhdGhpcy5sYXJnZURpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXVkaW9QYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBVaVRvb2xzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4QXR0ciA9IGUuZ2V0QXR0cmlidXRlKCd4LXF1ZXVlLWluZGV4Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleEF0dHIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGluZGV4QXR0cik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gTmFOKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5TmV4dFVucm9sbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IHRlbXBsYXRlc18xLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbih0aGlzLmF1ZGlvUGFuZWwsIGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChlbGVtZW50ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdCAmJiBjaGlsZEluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09IHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5xdWVyeVNlbGVjdG9yKGBbeC1pZD0nY2xlYXItcGxheWxpc3QnXWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50SXRlbSA9IHRoaXMuY3VycmVudEl0ZW0oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXVlID0gW2N1cnJlbnRJdGVtXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncGxheWxpc3QtYmFja3VwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFBsYXlsaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzID0gVWlUb29scy5lbHModGhpcy5hdWRpb1BhbmVsLnJvb3QsICcueC13aGVuLWxhcmdlLWRpc3BsYXknKTtcbiAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICB9XG4gICAgY3VycmVudEl0ZW0oKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA8IDAgfHwgdGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5xdWV1ZS5sZW5ndGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgIH1cbiAgICBhZGRBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaXRlbSA9IHtcbiAgICAgICAgICAgIHNoYTogaXRlbS5zaGEsXG4gICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICBtaW1lVHlwZTogaXRlbS5taW1lVHlwZVxuICAgICAgICB9O1xuICAgICAgICBsZXQgY3VycmVudEl0ZW0gPSB0aGlzLmN1cnJlbnRJdGVtKCk7XG4gICAgICAgIGlmIChjdXJyZW50SXRlbSAmJiBjdXJyZW50SXRlbS5zaGEgPT0gaXRlbS5zaGEpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnNvbGUubG9nKGBpdGVtOiBgLCBpdGVtKTtcbiAgICAgICAgdGhpcy5wdXNoUXVldWVBbmRQbGF5KGl0ZW0pO1xuICAgIH1cbiAgICBwbGF5TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucGxheU5leHRVbnJvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlOZXh0VW5yb2xsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlcikge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLml0ZW1VbnJvbGxlci51bnJvbGwoKTtcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hRdWV1ZUFuZFBsYXkoaXRlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1VbnJvbGxlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUGxheWxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRJdGVtVW5yb2xsZXIoaXRlbVVucm9sbGVyKSB7XG4gICAgICAgIHRoaXMuaXRlbVVucm9sbGVyID0gaXRlbVVucm9sbGVyO1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgIH1cbiAgICBwdXNoUXVldWVBbmRQbGF5KGl0ZW0pIHtcbiAgICAgICAgaWYgKCFpdGVtLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSB0cnVlO1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goaXRlbSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwbGF5bGlzdC1iYWNrdXAnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnF1ZXVlKSk7XG4gICAgICAgIHRoaXMucGxheSh0aGlzLnF1ZXVlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBwbGF5KGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICB0aGlzLmN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLnJlZnJlc2hQbGF5bGlzdCgpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gdGhpcy5xdWV1ZVtpbmRleF07XG4gICAgICAgICAgICBleHBvcnRzLmF1ZGlvUGFuZWwucGxheSh0aGlzLmF1ZGlvUGFuZWwsIGl0ZW0ubmFtZSwgaXRlbS5zaGEsIGl0ZW0ubWltZVR5cGUpO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW3gtZm9yLXNoYT0nJHtpdGVtLnNoYS5zdWJzdHIoMCwgNSl9J11gKS5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QuYWRkKCdpcy13ZWlnaHRlZCcpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZWZyZXNoUGxheWxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlZnJlc2hUaW1lcilcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnJlZnJlc2hUaW1lcik7XG4gICAgICAgIHRoaXMucmVmcmVzaFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLnJlYWxSZWZyZXNoUGxheWxpc3QoKSwgMTApO1xuICAgIH1cbiAgICByZWFsUmVmcmVzaFBsYXlsaXN0KCkge1xuICAgICAgICBpZiAoIXRoaXMucXVldWUgfHwgIXRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkpXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICc8c3BhbiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPlRoZXJlIGFyZSBubyBpdGVtcyBpbiB5b3VyIHBsYXlsaXN0LiBDbGljayBvbiBzb25ncyB0byBwbGF5IHRoZW0uPC9zcGFuPic7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1BhbmVsLnBsYXlsaXN0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBodG1sID0gYGA7XG4gICAgICAgIGlmICh0aGlzLmxhcmdlRGlzcGxheSkge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5xdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCBpdGVtID0gdGhpcy5xdWV1ZVtpXTtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbChpLCBpdGVtLm5hbWUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpXG4gICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLXNlY29uZGFyeVwiPjxhIHgtaWQ9J2NsZWFyLXBsYXlsaXN0JyBocmVmPScjJz5jbGVhciBwbGF5bGlzdDwvYT48L2Rpdj5gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5leHBhbmRlZEVsZW1lbnRzLmZvckVhY2goZSA9PiBlLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA+PSAwICYmIHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9IHRoaXMucGxheWxpc3RJdGVtSHRtbCh0aGlzLmN1cnJlbnRJbmRleCwgdGhpcy5xdWV1ZVt0aGlzLmN1cnJlbnRJbmRleF0ubmFtZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5xdWV1ZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxkaXYgc3R5bGU9XCJmbGV4LXNocmluazogMDtcIiB4LXF1ZXVlLWluZGV4PVwiJHt0aGlzLmN1cnJlbnRJbmRleCArIDF9XCIgY2xhc3M9XCJvbmNsaWNrIG11aS0tdGV4dC1kYXJrLXNlY29uZGFyeSBpcy1vbmVsaW5ldGV4dFwiPmZvbGxvd2VkIGJ5ICcke3RoaXMucXVldWVbdGhpcy5jdXJyZW50SW5kZXggKyAxXS5uYW1lLnN1YnN0cigwLCAyMCl9JyAuLi48L2Rpdj5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLml0ZW1VbnJvbGxlciAmJiB0aGlzLml0ZW1VbnJvbGxlci5oYXNOZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGRpdiBzdHlsZT1cImZsZXgtc2hyaW5rOiAwO1wiIHgtcXVldWUtaW5kZXg9XCIke3RoaXMucXVldWUubGVuZ3RofVwiIGNsYXNzPVwib25jbGljayBtdWktLXRleHQtZGFyay1zZWNvbmRhcnkgaXMtb25lbGluZXRleHRcIj4ke3RoaXMuaXRlbVVucm9sbGVyLm5hbWUoKX08L2Rpdj5gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgLy8gYWZ0ZXIgcmVmcmVzaCBzdGVwc1xuICAgICAgICBpZiAodGhpcy5sYXJnZURpc3BsYXkgJiYgdGhpcy5zY3JvbGxUb1BsYXlpbmdJdGVtKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFRvUGxheWluZ0l0ZW0gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYXVkaW9QYW5lbC5wbGF5bGlzdC5zY3JvbGxUb3AgPSB0aGlzLmF1ZGlvUGFuZWwucGxheWxpc3Quc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHBsYXlsaXN0SXRlbUh0bWwoaW5kZXgsIG5hbWUsIG9uZUxpbmVUZXh0KSB7XG4gICAgICAgIHJldHVybiBgPGRpdiB4LXF1ZXVlLWluZGV4PVwiJHtpbmRleH1cIiBjbGFzcz1cIm9uY2xpY2sgJHtvbmVMaW5lVGV4dCA/ICdpcy1vbmVsaW5ldGV4dCcgOiAnJ30gJHtpbmRleCA9PSB0aGlzLmN1cnJlbnRJbmRleCA/ICdtdWktLXRleHQtaGVhZGxpbmUnIDogJyd9XCI+JHtuYW1lfTwvZGl2PmA7XG4gICAgfVxufVxuZXhwb3J0cy5BdWRpb0p1a2Vib3ggPSBBdWRpb0p1a2Vib3g7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdWRpby1wYW5lbC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZnVuY3Rpb24gd2FpdChkdXJhdGlvbikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZHVyYXRpb24pKTtcbn1cbmNsYXNzIEF1dGgge1xuICAgIG9uRXJyb3IoKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gICAgYXN5bmMgbG9vcCgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgTmV0d29yay5wb3N0RGF0YShgaHR0cHM6Ly9ob21lLmx0ZWNvbnN1bHRpbmcuZnIvYXV0aGApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS50b2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzID0gYXdhaXQgTmV0d29yay5nZXREYXRhKGBodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mci93ZWxsLWtub3duL3YxL3NldENvb2tpZWAsIHsgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cmVzcG9uc2UudG9rZW59YCB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXMgfHwgIXJlcy5saWZldGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IHNldENvb2tpZWAsIHJlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgY2Fubm90IG9idGFpbiBhdXRoIHRva2VuYCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBjYW5ub3QgcmVmcmVzaCBhdXRoICgke2Vycn0pYCk7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBldmVyeSAzMCBtaW51dGVzXG4gICAgICAgICAgICBhd2FpdCB3YWl0KDEwMDAgKiA2MCAqIDMwKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGF1dG9SZW5ld0F1dGgoKSB7XG4gICAgbGV0IGF1dGggPSBuZXcgQXV0aCgpO1xuICAgIGF1dGgubG9vcCgpO1xufVxuZXhwb3J0cy5hdXRvUmVuZXdBdXRoID0gYXV0b1JlbmV3QXV0aDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWF1dGguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0ZW1wbGF0ZXNfMSA9IHJlcXVpcmUoXCIuL3RlbXBsYXRlc1wiKTtcbmNvbnN0IHRlbXBsYXRlSHRtbCA9IGBcbjxkaXYgY2xhc3M9J211aS1jb250YWluZXItZmx1aWQnPlxuICAgIDxkaXYgY2xhc3M9XCJtdWktLXRleHQtY2VudGVyXCI+XG4gICAgICAgIDxoMiB4LWlkPVwidGl0bGVcIj48L2gyPlxuICAgICAgICA8ZGl2IHgtaWQ9XCJpdGVtc1wiPjwvZGl2PlxuICAgIDwvZGl2PlxuPC9kaXY+YDtcbmV4cG9ydHMuZGlyZWN0b3J5UGFuZWwgPSB7XG4gICAgY3JlYXRlOiAoKSA9PiB0ZW1wbGF0ZXNfMS5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlKHRlbXBsYXRlSHRtbCksXG4gICAgc2V0TG9hZGluZzogKGVsZW1lbnRzLCB0aXRsZSkgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgTG9hZGluZyAnJHt0aXRsZX0nIC4uLmA7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGBgO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgJHt2YWx1ZXMubmFtZX1gO1xuICAgICAgICBpZiAodmFsdWVzLml0ZW1zICYmIHZhbHVlcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IHZhbHVlcy5pdGVtcy5tYXAoZiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGYubWltZVR5cGUgPT0gJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz1cIm9uY2xpY2tcIj48aT4ke2YubmFtZX0gLi4uPC9pPjwvZGl2PmA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IHgtZm9yLXNoYT1cIiR7Zi5zaGEuc3Vic3RyKDAsIDUpfVwiIGNsYXNzPVwib25jbGlja1wiPiR7Zi5uYW1lfTwvZGl2PmA7XG4gICAgICAgICAgICB9KS5qb2luKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWRhcmstaGludFwiPk5vIHJlc3VsdHM8L2Rpdj5gO1xuICAgICAgICB9XG4gICAgfSxcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaXJlY3RvcnktcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2wgPSByZXF1aXJlKFwiLi91aS10b29sXCIpO1xuY29uc3QgU2VhcmNoUGFuZWwgPSByZXF1aXJlKFwiLi9zZWFyY2gtcGFuZWxcIik7XG5jb25zdCBTZWFyY2hSZXN1bHRQYW5lbCA9IHJlcXVpcmUoXCIuL3NlYXJjaC1yZXN1bHQtcGFuZWxcIik7XG5jb25zdCBBdWRpb1BhbmVsID0gcmVxdWlyZShcIi4vYXVkaW8tcGFuZWxcIik7XG5jb25zdCBEaXJlY3RvcnlQYW5lbCA9IHJlcXVpcmUoXCIuL2RpcmVjdG9yeS1wYW5lbFwiKTtcbmNvbnN0IFJlc3QgPSByZXF1aXJlKFwiLi9yZXN0XCIpO1xuY29uc3QgQXV0aCA9IHJlcXVpcmUoXCIuL2F1dGhcIik7XG5jb25zdCBUZW1wbGF0ZXMgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCBNaW1lVHlwZXMgPSByZXF1aXJlKFwiLi9taW1lLXR5cGVzLW1vZHVsZVwiKTtcbi8qXG5oYXNoIHVybHMgOlxuXG4tICcnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob21lXG4tICcjLycgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob21lXG4tICcjJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob21lXG4tICcjL3NlYXJjaC86dGVybSAgICAgICAgICAgICAgICAgICBzZWFyY2hcbi0gJyMvZGlyZWN0b3JpZXMvOnNoYT9uYW1lPXh4eCAgICAgIGRpcmVjdG9yeVxuKi9cbmZ1bmN0aW9uIHBhcnNlVVJMKHVybCkge1xuICAgIHZhciBwYXJzZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyksIHNlYXJjaE9iamVjdCA9IHt9LCBxdWVyaWVzLCBzcGxpdCwgaTtcbiAgICAvLyBMZXQgdGhlIGJyb3dzZXIgZG8gdGhlIHdvcmtcbiAgICBwYXJzZXIuaHJlZiA9IHVybDtcbiAgICAvLyBDb252ZXJ0IHF1ZXJ5IHN0cmluZyB0byBvYmplY3RcbiAgICBxdWVyaWVzID0gcGFyc2VyLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpLnNwbGl0KCcmJyk7XG4gICAgZm9yIChpID0gMDsgaSA8IHF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3BsaXQgPSBxdWVyaWVzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgIHNlYXJjaE9iamVjdFtzcGxpdFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQoc3BsaXRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBwYXRobmFtZTogZGVjb2RlVVJJQ29tcG9uZW50KHBhcnNlci5wYXRobmFtZSksXG4gICAgICAgIHNlYXJjaE9iamVjdDogc2VhcmNoT2JqZWN0XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlYWRIYXNoQW5kQWN0KCkge1xuICAgIGxldCBoYXNoID0gJyc7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN0YXJ0c1dpdGgoJyMnKSlcbiAgICAgICAgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgICBsZXQgcGFyc2VkID0gcGFyc2VVUkwoaGFzaCk7XG4gICAgaWYgKHBhcnNlZC5wYXRobmFtZS5zdGFydHNXaXRoKCcvc2VhcmNoLycpKSB7XG4gICAgICAgIHNlYXJjaEl0ZW1zKHBhcnNlZC5wYXRobmFtZS5zdWJzdHIoJy9zZWFyY2gvJy5sZW5ndGgpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAocGFyc2VkLnBhdGhuYW1lLnN0YXJ0c1dpdGgoJy9kaXJlY3Rvcmllcy8nKSkge1xuICAgICAgICBjb25zdCBzaGEgPSBwYXJzZWQucGF0aG5hbWUuc3Vic3RyaW5nKCcvZGlyZWN0b3JpZXMvJy5sZW5ndGgpO1xuICAgICAgICBjb25zdCBuYW1lID0gcGFyc2VkLnNlYXJjaE9iamVjdC5uYW1lIHx8IHNoYTtcbiAgICAgICAgbG9hZERpcmVjdG9yeSh7XG4gICAgICAgICAgICBsYXN0V3JpdGU6IDAsXG4gICAgICAgICAgICBtaW1lVHlwZTogJ2FwcGxpY2F0aW9uL2RpcmVjdG9yeScsXG4gICAgICAgICAgICBzaXplOiAwLFxuICAgICAgICAgICAgc2hhLFxuICAgICAgICAgICAgbmFtZVxuICAgICAgICB9KTtcbiAgICB9XG59XG5jb25zdCBzZWFyY2hQYW5lbCA9IFNlYXJjaFBhbmVsLnNlYXJjaFBhbmVsLmNyZWF0ZSgpO1xuY29uc3Qgc2VhcmNoUmVzdWx0UGFuZWwgPSBTZWFyY2hSZXN1bHRQYW5lbC5zZWFyY2hSZXN1bHRQYW5lbC5jcmVhdGUoKTtcbmNvbnN0IGF1ZGlvUGFuZWwgPSBBdWRpb1BhbmVsLmF1ZGlvUGFuZWwuY3JlYXRlKCk7XG5jb25zdCBhdWRpb0p1a2Vib3ggPSBuZXcgQXVkaW9QYW5lbC5BdWRpb0p1a2Vib3goYXVkaW9QYW5lbCk7XG5jb25zdCBkaXJlY3RvcnlQYW5lbCA9IERpcmVjdG9yeVBhbmVsLmRpcmVjdG9yeVBhbmVsLmNyZWF0ZSgpO1xubGV0IGFjdHVhbENvbnRlbnQgPSBudWxsO1xuZnVuY3Rpb24gc2V0Q29udGVudChjb250ZW50KSB7XG4gICAgaWYgKGNvbnRlbnQgPT09IGFjdHVhbENvbnRlbnQpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAoYWN0dWFsQ29udGVudClcbiAgICAgICAgYWN0dWFsQ29udGVudC5wYXJlbnRFbGVtZW50ICYmIGFjdHVhbENvbnRlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChhY3R1YWxDb250ZW50KTtcbiAgICBhY3R1YWxDb250ZW50ID0gY29udGVudDtcbiAgICBpZiAoYWN0dWFsQ29udGVudClcbiAgICAgICAgVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoY29udGVudCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xufVxuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhdWRpb1BhbmVsLnJvb3QpO1xuVWlUb29sLmVsKCdjb250ZW50LXdyYXBwZXInKS5pbnNlcnRCZWZvcmUoc2VhcmNoUGFuZWwucm9vdCwgVWlUb29sLmVsKCdmaXJzdC1lbGVtZW50LWFmdGVyLWNvbnRlbnRzJykpO1xuQXV0aC5hdXRvUmVuZXdBdXRoKCk7XG4vKipcbiAqIFdhaXRlciB0b29sXG4gKi9cbmNvbnN0IGJlZ2luV2FpdCA9IChjYWxsYmFjaykgPT4ge1xuICAgIGxldCBpc0RvbmUgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IGlzRG9uZSB8fCBjYWxsYmFjaygpLCA1MDApO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgICAgIGlzRG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbi8qKlxuICogRXZlbnRzXG4gKi9cbmxldCBsYXN0RGlzcGxheWVkRmlsZXMgPSBudWxsO1xubGV0IGxhc3RTZWFyY2hUZXJtID0gbnVsbDsgLy8gSEFDSyB2ZXJ5IHRlbXBvcmFyeVxuZnVuY3Rpb24gYmVhdXRpZnlOYW1lcyhpdGVtcykge1xuICAgIHJldHVybiBpdGVtcy5tYXAoZmlsZSA9PiB7XG4gICAgICAgIGlmIChmaWxlLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKSB7XG4gICAgICAgICAgICBsZXQgZG90ID0gZmlsZS5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICAgICAgICBpZiAoZG90KVxuICAgICAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5zdWJzdHJpbmcoMCwgZG90KTtcbiAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUubmFtZS5yZXBsYWNlKC8nXycvZywgJyAnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nICAnL2csICcgJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvWyBdKi1bIF0qL2csICcgLSAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGdvU2VhcmNoSXRlbXModGVybSkge1xuICAgIGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICBjb25zdCB1cmwgPSBgIy9zZWFyY2gvJHt0ZXJtfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5hc3luYyBmdW5jdGlvbiBzZWFyY2hJdGVtcyh0ZXJtKSB7XG4gICAgU2VhcmNoUGFuZWwuc2VhcmNoUGFuZWwuZGlzcGxheVRpdGxlKHNlYXJjaFBhbmVsLCBmYWxzZSk7XG4gICAgY29uc3Qgd2FpdGluZyA9IGJlZ2luV2FpdCgoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgICAgIFNlYXJjaFJlc3VsdFBhbmVsLnNlYXJjaFJlc3VsdFBhbmVsLmRpc3BsYXlTZWFyY2hpbmcoc2VhcmNoUmVzdWx0UGFuZWwsIHRlcm0pO1xuICAgIH0pO1xuICAgIGxldCByZXMgPSBhd2FpdCBSZXN0LnNlYXJjaCh0ZXJtLCAnYXVkaW8vJScpO1xuICAgIC8vIGZpcnN0IGZpbGVzIHRoZW4gZGlyZWN0b3JpZXNcbiAgICByZXMuaXRlbXMgPSByZXMuaXRlbXMuZmlsdGVyKGkgPT4gIWkubWltZVR5cGUuc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vZGlyZWN0b3J5JykpLmNvbmNhdChyZXMuaXRlbXMuZmlsdGVyKGkgPT4gaS5taW1lVHlwZS5zdGFydHNXaXRoKCdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSkpO1xuICAgIHJlcy5pdGVtcyA9IGJlYXV0aWZ5TmFtZXMocmVzLml0ZW1zKTtcbiAgICBsYXN0RGlzcGxheWVkRmlsZXMgPSByZXMuaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSB0ZXJtO1xuICAgIHdhaXRpbmcuZG9uZSgpO1xuICAgIHNldENvbnRlbnQoc2VhcmNoUmVzdWx0UGFuZWwucm9vdCk7XG4gICAgU2VhcmNoUmVzdWx0UGFuZWwuc2VhcmNoUmVzdWx0UGFuZWwuc2V0VmFsdWVzKHNlYXJjaFJlc3VsdFBhbmVsLCB7XG4gICAgICAgIHRlcm06IHRlcm0sXG4gICAgICAgIGl0ZW1zOiByZXMuaXRlbXNcbiAgICB9KTtcbn1cbnNlYXJjaFBhbmVsLmZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZXZlbnQgPT4ge1xuICAgIFVpVG9vbC5zdG9wRXZlbnQoZXZlbnQpO1xuICAgIGxldCB0ZXJtID0gc2VhcmNoUGFuZWwudGVybS52YWx1ZTtcbiAgICBnb1NlYXJjaEl0ZW1zKHRlcm0pO1xufSk7XG5mdW5jdGlvbiBnZXRNaW1lVHlwZShmKSB7XG4gICAgaWYgKGYuaXNEaXJlY3RvcnkpXG4gICAgICAgIHJldHVybiAnYXBwbGljYXRpb24vZGlyZWN0b3J5JztcbiAgICBsZXQgcG9zID0gZi5uYW1lLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgaWYgKHBvcyA+PSAwKSB7XG4gICAgICAgIGxldCBleHRlbnNpb24gPSBmLm5hbWUuc3Vic3RyKHBvcyArIDEpLnRvTG9jYWxlTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmIChleHRlbnNpb24gaW4gTWltZVR5cGVzLk1pbWVUeXBlcylcbiAgICAgICAgICAgIHJldHVybiBNaW1lVHlwZXMuTWltZVR5cGVzW2V4dGVuc2lvbl07XG4gICAgfVxuICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJztcbn1cbmZ1bmN0aW9uIGRpcmVjdG9yeURlc2NyaXB0b3JUb0ZpbGVEZXNjcmlwdG9yKGQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzaGE6IGQuY29udGVudFNoYSxcbiAgICAgICAgbmFtZTogZC5uYW1lLFxuICAgICAgICBtaW1lVHlwZTogZ2V0TWltZVR5cGUoZCksXG4gICAgICAgIGxhc3RXcml0ZTogZC5sYXN0V3JpdGUsXG4gICAgICAgIHNpemU6IGQuc2l6ZVxuICAgIH07XG59XG5mdW5jdGlvbiBnb0xvYWREaXJlY3Rvcnkoc2hhLCBuYW1lKSB7XG4gICAgZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgIGNvbnN0IHVybCA9IGAjL2RpcmVjdG9yaWVzLyR7c2hhfT9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KG5hbWUpfWA7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkRGlyZWN0b3J5KGl0ZW0pIHtcbiAgICBjb25zdCB3YWl0aW5nID0gYmVnaW5XYWl0KCgpID0+IHtcbiAgICAgICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICAgICAgRGlyZWN0b3J5UGFuZWwuZGlyZWN0b3J5UGFuZWwuc2V0TG9hZGluZyhkaXJlY3RvcnlQYW5lbCwgaXRlbS5uYW1lKTtcbiAgICB9KTtcbiAgICBsZXQgZGlyZWN0b3J5RGVzY3JpcHRvciA9IGF3YWl0IFJlc3QuZ2V0RGlyZWN0b3J5RGVzY3JpcHRvcihpdGVtLnNoYSk7XG4gICAgbGV0IGl0ZW1zID0gZGlyZWN0b3J5RGVzY3JpcHRvci5maWxlcy5tYXAoZGlyZWN0b3J5RGVzY3JpcHRvclRvRmlsZURlc2NyaXB0b3IpO1xuICAgIGl0ZW1zID0gYmVhdXRpZnlOYW1lcyhpdGVtcyk7XG4gICAgbGFzdERpc3BsYXllZEZpbGVzID0gaXRlbXM7XG4gICAgbGFzdFNlYXJjaFRlcm0gPSBpdGVtLm5hbWU7XG4gICAgd2FpdGluZy5kb25lKCk7XG4gICAgc2V0Q29udGVudChkaXJlY3RvcnlQYW5lbC5yb290KTtcbiAgICBEaXJlY3RvcnlQYW5lbC5kaXJlY3RvcnlQYW5lbC5zZXRWYWx1ZXMoZGlyZWN0b3J5UGFuZWwsIHtcbiAgICAgICAgbmFtZTogaXRlbS5uYW1lLFxuICAgICAgICBpdGVtc1xuICAgIH0pO1xufVxuZnVuY3Rpb24gaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCkge1xuICAgIGxldCBpdGVtID0gbGFzdERpc3BsYXllZEZpbGVzW2NoaWxkSW5kZXhdO1xuICAgIGlmIChpdGVtLm1pbWVUeXBlID09ICdhcHBsaWNhdGlvbi9kaXJlY3RvcnknKSB7XG4gICAgICAgIGdvTG9hZERpcmVjdG9yeShpdGVtLnNoYSwgaXRlbS5uYW1lKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXRlbS5taW1lVHlwZS5zdGFydHNXaXRoKCdhdWRpby8nKSkge1xuICAgICAgICBhdWRpb0p1a2Vib3guYWRkQW5kUGxheShpdGVtKTtcbiAgICAgICAgLy8gc2V0IGFuIHVucm9sbGVyXG4gICAgICAgIGlmIChjaGlsZEluZGV4ID49IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IHRlcm0gPSBsYXN0U2VhcmNoVGVybTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxlZEl0ZW1zID0gbGFzdERpc3BsYXllZEZpbGVzLnNsaWNlKGNoaWxkSW5kZXggKyAxKS5maWx0ZXIoZiA9PiBmLm1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2F1ZGlvLycpKTtcbiAgICAgICAgICAgIGxldCB1bnJvbGxJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAodW5yb2xsZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhdWRpb0p1a2Vib3guc2V0SXRlbVVucm9sbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVucm9sbEluZGV4ID49IDAgJiYgdW5yb2xsSW5kZXggPCB1bnJvbGxlZEl0ZW1zLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYHRoZW4gJyR7dW5yb2xsZWRJdGVtc1t1bnJvbGxJbmRleF0ubmFtZS5zdWJzdHIoMCwgMjApfScgYW5kICR7dW5yb2xsZWRJdGVtcy5sZW5ndGggLSB1bnJvbGxJbmRleCAtIDF9IG90aGVyICcke3Rlcm19JyBpdGVtcy4uLmA7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGZpbmlzaGVkICcke3Rlcm19IHNvbmdzYDtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdW5yb2xsOiAoKSA9PiB1bnJvbGxlZEl0ZW1zW3Vucm9sbEluZGV4KytdLFxuICAgICAgICAgICAgICAgICAgICBoYXNOZXh0OiAoKSA9PiB1bnJvbGxJbmRleCA+PSAwICYmIHVucm9sbEluZGV4IDwgdW5yb2xsZWRJdGVtcy5sZW5ndGhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBgJHtSZXN0LkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtpdGVtLnNoYX0vY29udGVudD90eXBlPSR7aXRlbS5taW1lVHlwZX1gO1xuICAgIH1cbn1cbnNlYXJjaFJlc3VsdFBhbmVsLnJvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAvLyB0b2RvIDoga25vd25sZWRnZSB0byBkbyB0aGF0IGlzIGluIHNlYXJjaFJlc3VsdFBhbmVsXG4gICAgbGV0IHsgZWxlbWVudCwgY2hpbGRJbmRleCB9ID0gVGVtcGxhdGVzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbihzZWFyY2hSZXN1bHRQYW5lbCwgZXZlbnQpO1xuICAgIGlmIChsYXN0RGlzcGxheWVkRmlsZXMgJiYgZWxlbWVudCA9PSBzZWFyY2hSZXN1bHRQYW5lbC5pdGVtcyAmJiBjaGlsZEluZGV4ID49IDAgJiYgY2hpbGRJbmRleCA8IGxhc3REaXNwbGF5ZWRGaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaXRlbURlZmF1bHRBY3Rpb24oY2hpbGRJbmRleCk7XG4gICAgfVxufSk7XG5kaXJlY3RvcnlQYW5lbC5yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgLy8gdG9kbyA6IGtub3dubGVkZ2UgdG8gZG8gdGhhdCBpcyBpbiBkaXJlY3RvcnlQYW5lbFxuICAgIGxldCB7IGVsZW1lbnQsIGNoaWxkSW5kZXggfSA9IFRlbXBsYXRlcy50ZW1wbGF0ZUdldEV2ZW50TG9jYXRpb24oZGlyZWN0b3J5UGFuZWwsIGV2ZW50KTtcbiAgICBpZiAobGFzdERpc3BsYXllZEZpbGVzICYmIGVsZW1lbnQgPT0gZGlyZWN0b3J5UGFuZWwuaXRlbXMgJiYgY2hpbGRJbmRleCA+PSAwICYmIGNoaWxkSW5kZXggPCBsYXN0RGlzcGxheWVkRmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGl0ZW1EZWZhdWx0QWN0aW9uKGNoaWxkSW5kZXgpO1xuICAgIH1cbn0pO1xucmVhZEhhc2hBbmRBY3QoKTtcbndpbmRvdy5vbnBvcHN0YXRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgcmVhZEhhc2hBbmRBY3QoKTtcbiAgICAvKmlmIChldmVudC5zdGF0ZSkge1xuICAgICAgICBjdXJyZW50RGlyZWN0b3J5RGVzY3JpcHRvclNoYSA9IGV2ZW50LnN0YXRlLmN1cnJlbnREaXJlY3RvcnlEZXNjcmlwdG9yU2hhXG4gICAgICAgIGN1cnJlbnRDbGllbnRJZCA9IGV2ZW50LnN0YXRlLmN1cnJlbnRDbGllbnRJZFxuICAgICAgICBjdXJyZW50UGljdHVyZUluZGV4ID0gZXZlbnQuc3RhdGUuY3VycmVudFBpY3R1cmVJbmRleCB8fCAwXG5cbiAgICAgICAgaWYgKCFjdXJyZW50Q2xpZW50SWQpXG4gICAgICAgICAgICBlbChcIiNtZW51XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1oaWRkZW5cIilcblxuICAgICAgICBzeW5jVWkoKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZnJvbUhhc2goKVxuXG4gICAgICAgIHN5bmNVaSgpXG4gICAgfSovXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk1pbWVUeXBlcyA9IHtcbiAgICBcIjNkbWxcIjogXCJ0ZXh0L3ZuZC5pbjNkLjNkbWxcIixcbiAgICBcIjNkc1wiOiBcImltYWdlL3gtM2RzXCIsXG4gICAgXCIzZzJcIjogXCJ2aWRlby8zZ3BwMlwiLFxuICAgIFwiM2dwXCI6IFwidmlkZW8vM2dwcFwiLFxuICAgIFwiN3pcIjogXCJhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWRcIixcbiAgICBcImFhYlwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcImFhY1wiOiBcImF1ZGlvL3gtYWFjXCIsXG4gICAgXCJhYW1cIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtbWFwXCIsXG4gICAgXCJhYXNcIjogXCJhcHBsaWNhdGlvbi94LWF1dGhvcndhcmUtc2VnXCIsXG4gICAgXCJhYndcIjogXCJhcHBsaWNhdGlvbi94LWFiaXdvcmRcIixcbiAgICBcImFjXCI6IFwiYXBwbGljYXRpb24vcGtpeC1hdHRyLWNlcnRcIixcbiAgICBcImFjY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbWVyaWNhbmR5bmFtaWNzLmFjY1wiLFxuICAgIFwiYWNlXCI6IFwiYXBwbGljYXRpb24veC1hY2UtY29tcHJlc3NlZFwiLFxuICAgIFwiYWN1XCI6IFwiYXBwbGljYXRpb24vdm5kLmFjdWNvYm9sXCIsXG4gICAgXCJhY3V0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXCIsXG4gICAgXCJhZHBcIjogXCJhdWRpby9hZHBjbVwiLFxuICAgIFwiYWVwXCI6IFwiYXBwbGljYXRpb24vdm5kLmF1ZGlvZ3JhcGhcIixcbiAgICBcImFmbVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwiYWZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImFoZWFkXCI6IFwiYXBwbGljYXRpb24vdm5kLmFoZWFkLnNwYWNlXCIsXG4gICAgXCJhaVwiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcImFpZlwiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlmY1wiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlmZlwiOiBcImF1ZGlvL3gtYWlmZlwiLFxuICAgIFwiYWlyXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmFpci1hcHBsaWNhdGlvbi1pbnN0YWxsZXItcGFja2FnZSt6aXBcIixcbiAgICBcImFpdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kdmIuYWl0XCIsXG4gICAgXCJhbWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1pZ2EuYW1pXCIsXG4gICAgXCJhcGVcIjogXCJhdWRpby9hcGVcIixcbiAgICBcImFwa1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hbmRyb2lkLnBhY2thZ2UtYXJjaGl2ZVwiLFxuICAgIFwiYXBwY2FjaGVcIjogXCJ0ZXh0L2NhY2hlLW1hbmlmZXN0XCIsXG4gICAgXCJhcHBsaWNhdGlvblwiOiBcImFwcGxpY2F0aW9uL3gtbXMtYXBwbGljYXRpb25cIixcbiAgICBcImFwclwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1hcHByb2FjaFwiLFxuICAgIFwiYXJjXCI6IFwiYXBwbGljYXRpb24veC1mcmVlYXJjXCIsXG4gICAgXCJhc2FcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc2F4XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJhc2NcIjogXCJhcHBsaWNhdGlvbi9wZ3Atc2lnbmF0dXJlXCIsXG4gICAgXCJhc2N4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNmXCI6IFwidmlkZW8veC1tcy1hc2ZcIixcbiAgICBcImFzaHhcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc21cIjogXCJ0ZXh0L3gtYXNtXCIsXG4gICAgXCJhc214XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXNvXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjY3BhYy5zaW1wbHkuYXNvXCIsXG4gICAgXCJhc3BcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhc3B4XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiYXN4XCI6IFwidmlkZW8veC1tcy1hc2ZcIixcbiAgICBcImF0Y1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hY3Vjb3JwXCIsXG4gICAgXCJhdG9tXCI6IFwiYXBwbGljYXRpb24vYXRvbSt4bWxcIixcbiAgICBcImF0b21jYXRcIjogXCJhcHBsaWNhdGlvbi9hdG9tY2F0K3htbFwiLFxuICAgIFwiYXRvbXN2Y1wiOiBcImFwcGxpY2F0aW9uL2F0b21zdmMreG1sXCIsXG4gICAgXCJhdHhcIjogXCJhcHBsaWNhdGlvbi92bmQuYW50aXguZ2FtZS1jb21wb25lbnRcIixcbiAgICBcImF1XCI6IFwiYXVkaW8vYmFzaWNcIixcbiAgICBcImF2aVwiOiBcInZpZGVvL3gtbXN2aWRlb1wiLFxuICAgIFwiYXdcIjogXCJhcHBsaWNhdGlvbi9hcHBsaXh3YXJlXCIsXG4gICAgXCJheGRcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJhemZcIjogXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpmXCIsXG4gICAgXCJhenNcIjogXCJhcHBsaWNhdGlvbi92bmQuYWlyemlwLmZpbGVzZWN1cmUuYXpzXCIsXG4gICAgXCJhendcIjogXCJhcHBsaWNhdGlvbi92bmQuYW1hem9uLmVib29rXCIsXG4gICAgXCJiYXRcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImJjcGlvXCI6IFwiYXBwbGljYXRpb24veC1iY3Bpb1wiLFxuICAgIFwiYmRmXCI6IFwiYXBwbGljYXRpb24veC1mb250LWJkZlwiLFxuICAgIFwiYmRtXCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bmNtbC5kbSt3YnhtbFwiLFxuICAgIFwiYmVkXCI6IFwiYXBwbGljYXRpb24vdm5kLnJlYWx2bmMuYmVkXCIsXG4gICAgXCJiaDJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5c3Byc1wiLFxuICAgIFwiYmluXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJibGJcIjogXCJhcHBsaWNhdGlvbi94LWJsb3JiXCIsXG4gICAgXCJibG9yYlwiOiBcImFwcGxpY2F0aW9uL3gtYmxvcmJcIixcbiAgICBcImJtaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ibWlcIixcbiAgICBcImJtcFwiOiBcImltYWdlL2JtcFwiLFxuICAgIFwiYm9va1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcmFtZW1ha2VyXCIsXG4gICAgXCJib3hcIjogXCJhcHBsaWNhdGlvbi92bmQucHJldmlld3N5c3RlbXMuYm94XCIsXG4gICAgXCJib3pcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXAyXCIsXG4gICAgXCJicGtcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImJ0aWZcIjogXCJpbWFnZS9wcnMuYnRpZlwiLFxuICAgIFwiYnpcIjogXCJhcHBsaWNhdGlvbi94LWJ6aXBcIixcbiAgICBcImJ6MlwiOiBcImFwcGxpY2F0aW9uL3gtYnppcDJcIixcbiAgICBcImNcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiYzExYW1jXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsdWV0cnVzdC5jYXJ0b21vYmlsZS1jb25maWdcIixcbiAgICBcImMxMWFtelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbHVldHJ1c3QuY2FydG9tb2JpbGUtY29uZmlnLXBrZ1wiLFxuICAgIFwiYzRkXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0ZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjNGdcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvbmsuYzRncm91cFwiLFxuICAgIFwiYzRwXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsb25rLmM0Z3JvdXBcIixcbiAgICBcImM0dVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jbG9uay5jNGdyb3VwXCIsXG4gICAgXCJjYWJcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtY2FiLWNvbXByZXNzZWRcIixcbiAgICBcImNhZlwiOiBcImF1ZGlvL3gtY2FmXCIsXG4gICAgXCJjYXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJjYXJcIjogXCJhcHBsaWNhdGlvbi92bmQuY3VybC5jYXJcIixcbiAgICBcImNhdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc2VjY2F0XCIsXG4gICAgXCJjYjdcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2JhXCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNiclwiOiBcImFwcGxpY2F0aW9uL3gtY2JyXCIsXG4gICAgXCJjYnRcIjogXCJhcHBsaWNhdGlvbi94LWNiclwiLFxuICAgIFwiY2J6XCI6IFwiYXBwbGljYXRpb24veC1jYnJcIixcbiAgICBcImNjXCI6IFwidGV4dC94LWNcIixcbiAgICBcImNjdFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImNjeG1sXCI6IFwiYXBwbGljYXRpb24vY2N4bWwreG1sXCIsXG4gICAgXCJjZGJjbXNnXCI6IFwiYXBwbGljYXRpb24vdm5kLmNvbnRhY3QuY21zZ1wiLFxuICAgIFwiY2RmXCI6IFwiYXBwbGljYXRpb24veC1uZXRjZGZcIixcbiAgICBcImNka2V5XCI6IFwiYXBwbGljYXRpb24vdm5kLm1lZGlhc3RhdGlvbi5jZGtleVwiLFxuICAgIFwiY2RtaWFcIjogXCJhcHBsaWNhdGlvbi9jZG1pLWNhcGFiaWxpdHlcIixcbiAgICBcImNkbWljXCI6IFwiYXBwbGljYXRpb24vY2RtaS1jb250YWluZXJcIixcbiAgICBcImNkbWlkXCI6IFwiYXBwbGljYXRpb24vY2RtaS1kb21haW5cIixcbiAgICBcImNkbWlvXCI6IFwiYXBwbGljYXRpb24vY2RtaS1vYmplY3RcIixcbiAgICBcImNkbWlxXCI6IFwiYXBwbGljYXRpb24vY2RtaS1xdWV1ZVwiLFxuICAgIFwiY2R4XCI6IFwiY2hlbWljYWwveC1jZHhcIixcbiAgICBcImNkeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmNoZW1kcmF3K3htbFwiLFxuICAgIFwiY2R5XCI6IFwiYXBwbGljYXRpb24vdm5kLmNpbmRlcmVsbGFcIixcbiAgICBcImNlclwiOiBcImFwcGxpY2F0aW9uL3BraXgtY2VydFwiLFxuICAgIFwiY2ZjXCI6IFwiYXBwbGljYXRpb24veC1jb2xkZnVzaW9uXCIsXG4gICAgXCJjZm1cIjogXCJhcHBsaWNhdGlvbi94LWNvbGRmdXNpb25cIixcbiAgICBcImNmc1wiOiBcImFwcGxpY2F0aW9uL3gtY2ZzLWNvbXByZXNzZWRcIixcbiAgICBcImNnbVwiOiBcImltYWdlL2NnbVwiLFxuICAgIFwiY2hhdFwiOiBcImFwcGxpY2F0aW9uL3gtY2hhdFwiLFxuICAgIFwiY2htXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWh0bWxoZWxwXCIsXG4gICAgXCJjaHJ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rY2hhcnRcIixcbiAgICBcImNpZlwiOiBcImNoZW1pY2FsL3gtY2lmXCIsXG4gICAgXCJjaWlcIjogXCJhcHBsaWNhdGlvbi92bmQuYW5zZXItd2ViLWNlcnRpZmljYXRlLWlzc3VlLWluaXRpYXRpb25cIixcbiAgICBcImNpbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1hcnRnYWxyeVwiLFxuICAgIFwiY2xhXCI6IFwiYXBwbGljYXRpb24vdm5kLmNsYXltb3JlXCIsXG4gICAgXCJjbGFzc1wiOiBcImFwcGxpY2F0aW9uL2phdmEtdm1cIixcbiAgICBcImNsa2tcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci5rZXlib2FyZFwiLFxuICAgIFwiY2xrcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLnBhbGV0dGVcIixcbiAgICBcImNsa3RcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpY2suY2xpY2tlci50ZW1wbGF0ZVwiLFxuICAgIFwiY2xrd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5jcmljay5jbGlja2VyLndvcmRiYW5rXCIsXG4gICAgXCJjbGt4XCI6IFwiYXBwbGljYXRpb24vdm5kLmNyaWNrLmNsaWNrZXJcIixcbiAgICBcImNscFwiOiBcImFwcGxpY2F0aW9uL3gtbXNjbGlwXCIsXG4gICAgXCJjbWNcIjogXCJhcHBsaWNhdGlvbi92bmQuY29zbW9jYWxsZXJcIixcbiAgICBcImNtZGZcIjogXCJjaGVtaWNhbC94LWNtZGZcIixcbiAgICBcImNtbFwiOiBcImNoZW1pY2FsL3gtY21sXCIsXG4gICAgXCJjbXBcIjogXCJhcHBsaWNhdGlvbi92bmQueWVsbG93cml2ZXItY3VzdG9tLW1lbnVcIixcbiAgICBcImNteFwiOiBcImltYWdlL3gtY214XCIsXG4gICAgXCJjb2RcIjogXCJhcHBsaWNhdGlvbi92bmQucmltLmNvZFwiLFxuICAgIFwiY29tXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJjb25mXCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwiY3Bpb1wiOiBcImFwcGxpY2F0aW9uL3gtY3Bpb1wiLFxuICAgIFwiY3BwXCI6IFwidGV4dC94LWNcIixcbiAgICBcImNwdFwiOiBcImFwcGxpY2F0aW9uL21hYy1jb21wYWN0cHJvXCIsXG4gICAgXCJjcmRcIjogXCJhcHBsaWNhdGlvbi94LW1zY2FyZGZpbGVcIixcbiAgICBcImNybFwiOiBcImFwcGxpY2F0aW9uL3BraXgtY3JsXCIsXG4gICAgXCJjcnRcIjogXCJhcHBsaWNhdGlvbi94LXg1MDktY2EtY2VydFwiLFxuICAgIFwiY3J4XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJjcnlwdG9ub3RlXCI6IFwiYXBwbGljYXRpb24vdm5kLnJpZy5jcnlwdG9ub3RlXCIsXG4gICAgXCJjc1wiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImNzaFwiOiBcImFwcGxpY2F0aW9uL3gtY3NoXCIsXG4gICAgXCJjc21sXCI6IFwiY2hlbWljYWwveC1jc21sXCIsXG4gICAgXCJjc3BcIjogXCJhcHBsaWNhdGlvbi92bmQuY29tbW9uc3BhY2VcIixcbiAgICBcImNzc1wiOiBcInRleHQvY3NzXCIsXG4gICAgXCJjc3RcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJjc3ZcIjogXCJ0ZXh0L2NzdlwiLFxuICAgIFwiY3VcIjogXCJhcHBsaWNhdGlvbi9jdS1zZWVtZVwiLFxuICAgIFwiY3VybFwiOiBcInRleHQvdm5kLmN1cmxcIixcbiAgICBcImN3d1wiOiBcImFwcGxpY2F0aW9uL3Bycy5jd3dcIixcbiAgICBcImN4dFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImN4eFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJkYWVcIjogXCJtb2RlbC92bmQuY29sbGFkYSt4bWxcIixcbiAgICBcImRhZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMuZGFmXCIsXG4gICAgXCJkYXJ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRhcnRcIixcbiAgICBcImRhdGFsZXNzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkc24uc2VlZFwiLFxuICAgIFwiZGF2bW91bnRcIjogXCJhcHBsaWNhdGlvbi9kYXZtb3VudCt4bWxcIixcbiAgICBcImRia1wiOiBcImFwcGxpY2F0aW9uL2RvY2Jvb2sreG1sXCIsXG4gICAgXCJkY3JcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJkY3VybFwiOiBcInRleHQvdm5kLmN1cmwuZGN1cmxcIixcbiAgICBcImRkMlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vbWEuZGQyK3htbFwiLFxuICAgIFwiZGRkXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml4ZXJveC5kZGRcIixcbiAgICBcImRlYlwiOiBcImFwcGxpY2F0aW9uL3gtZGViaWFuLXBhY2thZ2VcIixcbiAgICBcImRlZlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImRlcGxveVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZGVyXCI6IFwiYXBwbGljYXRpb24veC14NTA5LWNhLWNlcnRcIixcbiAgICBcImRmYWNcIjogXCJhcHBsaWNhdGlvbi92bmQuZHJlYW1mYWN0b3J5XCIsXG4gICAgXCJkZ2NcIjogXCJhcHBsaWNhdGlvbi94LWRnYy1jb21wcmVzc2VkXCIsXG4gICAgXCJkaWNcIjogXCJ0ZXh0L3gtY1wiLFxuICAgIFwiZGlyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZGlzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5kaXNcIixcbiAgICBcImRpc3RcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRpc3R6XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJkanZcIjogXCJpbWFnZS92bmQuZGp2dVwiLFxuICAgIFwiZGp2dVwiOiBcImltYWdlL3ZuZC5kanZ1XCIsXG4gICAgXCJkbGxcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcImRtZ1wiOiBcImFwcGxpY2F0aW9uL3gtYXBwbGUtZGlza2ltYWdlXCIsXG4gICAgXCJkbXBcIjogXCJhcHBsaWNhdGlvbi92bmQudGNwZHVtcC5wY2FwXCIsXG4gICAgXCJkbXNcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImRuYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kbmFcIixcbiAgICBcImRvY1wiOiBcImFwcGxpY2F0aW9uL21zd29yZFwiLFxuICAgIFwiZG9jbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3JkLmRvY3VtZW50Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwiZG9jeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50XCIsXG4gICAgXCJkb3RcIjogXCJhcHBsaWNhdGlvbi9tc3dvcmRcIixcbiAgICBcImRvdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29yZC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcImRvdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC50ZW1wbGF0ZVwiLFxuICAgIFwiZHBcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnaS5kcFwiLFxuICAgIFwiZHBnXCI6IFwiYXBwbGljYXRpb24vdm5kLmRwZ3JhcGhcIixcbiAgICBcImRyYVwiOiBcImF1ZGlvL3ZuZC5kcmFcIixcbiAgICBcImRzY1wiOiBcInRleHQvcHJzLmxpbmVzLnRhZ1wiLFxuICAgIFwiZHNzY1wiOiBcImFwcGxpY2F0aW9uL2Rzc2MrZGVyXCIsXG4gICAgXCJkdGJcIjogXCJhcHBsaWNhdGlvbi94LWR0Ym9vayt4bWxcIixcbiAgICBcImR0ZFwiOiBcImFwcGxpY2F0aW9uL3htbC1kdGRcIixcbiAgICBcImR0c1wiOiBcImF1ZGlvL3ZuZC5kdHNcIixcbiAgICBcImR0c2hkXCI6IFwiYXVkaW8vdm5kLmR0cy5oZFwiLFxuICAgIFwiZHVtcFwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiZHZiXCI6IFwidmlkZW8vdm5kLmR2Yi5maWxlXCIsXG4gICAgXCJkdmlcIjogXCJhcHBsaWNhdGlvbi94LWR2aVwiLFxuICAgIFwiZHdmXCI6IFwibW9kZWwvdm5kLmR3ZlwiLFxuICAgIFwiZHdnXCI6IFwiaW1hZ2Uvdm5kLmR3Z1wiLFxuICAgIFwiZHhmXCI6IFwiaW1hZ2Uvdm5kLmR4ZlwiLFxuICAgIFwiZHhwXCI6IFwiYXBwbGljYXRpb24vdm5kLnNwb3RmaXJlLmR4cFwiLFxuICAgIFwiZHhyXCI6IFwiYXBwbGljYXRpb24veC1kaXJlY3RvclwiLFxuICAgIFwiZWNlbHA0ODAwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwNDgwMFwiLFxuICAgIFwiZWNlbHA3NDcwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwNzQ3MFwiLFxuICAgIFwiZWNlbHA5NjAwXCI6IFwiYXVkaW8vdm5kLm51ZXJhLmVjZWxwOTYwMFwiLFxuICAgIFwiZWNtYVwiOiBcImFwcGxpY2F0aW9uL2VjbWFzY3JpcHRcIixcbiAgICBcImVkbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZG1cIixcbiAgICBcImVkeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5lZHhcIixcbiAgICBcImVmaWZcIjogXCJhcHBsaWNhdGlvbi92bmQucGljc2VsXCIsXG4gICAgXCJlaTZcIjogXCJhcHBsaWNhdGlvbi92bmQucGcub3Nhc2xpXCIsXG4gICAgXCJlbGNcIjogXCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIixcbiAgICBcImVtZlwiOiBcImFwcGxpY2F0aW9uL3gtbXNtZXRhZmlsZVwiLFxuICAgIFwiZW1sXCI6IFwibWVzc2FnZS9yZmM4MjJcIixcbiAgICBcImVtbWFcIjogXCJhcHBsaWNhdGlvbi9lbW1hK3htbFwiLFxuICAgIFwiZW16XCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJlb2xcIjogXCJhdWRpby92bmQuZGlnaXRhbC13aW5kc1wiLFxuICAgIFwiZW90XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWZvbnRvYmplY3RcIixcbiAgICBcImVwc1wiOiBcImFwcGxpY2F0aW9uL3Bvc3RzY3JpcHRcIixcbiAgICBcImVwdWJcIjogXCJhcHBsaWNhdGlvbi9lcHViK3ppcFwiLFxuICAgIFwiZXMzXCI6IFwiYXBwbGljYXRpb24vdm5kLmVzemlnbm8zK3htbFwiLFxuICAgIFwiZXNhXCI6IFwiYXBwbGljYXRpb24vdm5kLm9zZ2kuc3Vic3lzdGVtXCIsXG4gICAgXCJlc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24uZXNmXCIsXG4gICAgXCJldDNcIjogXCJhcHBsaWNhdGlvbi92bmQuZXN6aWdubzMreG1sXCIsXG4gICAgXCJldHhcIjogXCJ0ZXh0L3gtc2V0ZXh0XCIsXG4gICAgXCJldmFcIjogXCJhcHBsaWNhdGlvbi94LWV2YVwiLFxuICAgIFwiZXZ5XCI6IFwiYXBwbGljYXRpb24veC1lbnZveVwiLFxuICAgIFwiZXhlXCI6IFwiYXBwbGljYXRpb24veC1tc2Rvd25sb2FkXCIsXG4gICAgXCJleGlcIjogXCJhcHBsaWNhdGlvbi9leGlcIixcbiAgICBcImV4dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub3ZhZGlnbS5leHRcIixcbiAgICBcImV6XCI6IFwiYXBwbGljYXRpb24vYW5kcmV3LWluc2V0XCIsXG4gICAgXCJlejJcIjogXCJhcHBsaWNhdGlvbi92bmQuZXpwaXgtYWxidW1cIixcbiAgICBcImV6M1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lenBpeC1wYWNrYWdlXCIsXG4gICAgXCJmXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImY0dlwiOiBcInZpZGVvL3gtZjR2XCIsXG4gICAgXCJmNzdcIjogXCJ0ZXh0L3gtZm9ydHJhblwiLFxuICAgIFwiZjkwXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImZic1wiOiBcImltYWdlL3ZuZC5mYXN0Ymlkc2hlZXRcIixcbiAgICBcImZjZHRcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZm9ybXNjZW50cmFsLmZjZHRcIixcbiAgICBcImZjc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pc2FjLmZjc1wiLFxuICAgIFwiZmRmXCI6IFwiYXBwbGljYXRpb24vdm5kLmZkZlwiLFxuICAgIFwiZmVfbGF1bmNoXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlbm92by5mY3NlbGF5b3V0LWxpbmtcIixcbiAgICBcImZnNVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzZ3BcIixcbiAgICBcImZnZFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcImZoXCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg0XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg1XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmg3XCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmhjXCI6IFwiaW1hZ2UveC1mcmVlaGFuZFwiLFxuICAgIFwiZmlnXCI6IFwiYXBwbGljYXRpb24veC14ZmlnXCIsXG4gICAgXCJmbGFjXCI6IFwiYXVkaW8veC1mbGFjXCIsXG4gICAgXCJmbGlcIjogXCJ2aWRlby94LWZsaVwiLFxuICAgIFwiZmxvXCI6IFwiYXBwbGljYXRpb24vdm5kLm1pY3JvZ3JhZnguZmxvXCIsXG4gICAgXCJmbHZcIjogXCJ2aWRlby94LWZsdlwiLFxuICAgIFwiZmx3XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5raXZpb1wiLFxuICAgIFwiZmx4XCI6IFwidGV4dC92bmQuZm1pLmZsZXhzdG9yXCIsXG4gICAgXCJmbHlcIjogXCJ0ZXh0L3ZuZC5mbHlcIixcbiAgICBcImZtXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImZuY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mcm9nYW5zLmZuY1wiLFxuICAgIFwiZm9yXCI6IFwidGV4dC94LWZvcnRyYW5cIixcbiAgICBcImZweFwiOiBcImltYWdlL3ZuZC5mcHhcIixcbiAgICBcImZyYW1lXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcImZzY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mc2Mud2VibGF1bmNoXCIsXG4gICAgXCJmc3RcIjogXCJpbWFnZS92bmQuZnN0XCIsXG4gICAgXCJmdGNcIjogXCJhcHBsaWNhdGlvbi92bmQuZmx1eHRpbWUuY2xpcFwiLFxuICAgIFwiZnRpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFuc2VyLXdlYi1mdW5kcy10cmFuc2Zlci1pbml0aWF0aW9uXCIsXG4gICAgXCJmdnRcIjogXCJ2aWRlby92bmQuZnZ0XCIsXG4gICAgXCJmeHBcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUuZnhwXCIsXG4gICAgXCJmeHBsXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLmZ4cFwiLFxuICAgIFwiZnpzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1enp5c2hlZXRcIixcbiAgICBcImcyd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9wbGFuXCIsXG4gICAgXCJnM1wiOiBcImltYWdlL2czZmF4XCIsXG4gICAgXCJnM3dcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2Vvc3BhY2VcIixcbiAgICBcImdhY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtYWNjb3VudFwiLFxuICAgIFwiZ2FtXCI6IFwiYXBwbGljYXRpb24veC10YWRzXCIsXG4gICAgXCJnYnJcIjogXCJhcHBsaWNhdGlvbi9ycGtpLWdob3N0YnVzdGVyc1wiLFxuICAgIFwiZ2NhXCI6IFwiYXBwbGljYXRpb24veC1nY2EtY29tcHJlc3NlZFwiLFxuICAgIFwiZ2RsXCI6IFwibW9kZWwvdm5kLmdkbFwiLFxuICAgIFwiZ2VvXCI6IFwiYXBwbGljYXRpb24vdm5kLmR5bmFnZW9cIixcbiAgICBcImdleFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9tZXRyeS1leHBsb3JlclwiLFxuICAgIFwiZ2diXCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb2dlYnJhLmZpbGVcIixcbiAgICBcImdndFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW9nZWJyYS50b29sXCIsXG4gICAgXCJnaGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLWhlbHBcIixcbiAgICBcImdpZlwiOiBcImltYWdlL2dpZlwiLFxuICAgIFwiZ2ltXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS1pZGVudGl0eS1tZXNzYWdlXCIsXG4gICAgXCJnbWxcIjogXCJhcHBsaWNhdGlvbi9nbWwreG1sXCIsXG4gICAgXCJnbXhcIjogXCJhcHBsaWNhdGlvbi92bmQuZ214XCIsXG4gICAgXCJnbnVtZXJpY1wiOiBcImFwcGxpY2F0aW9uL3gtZ251bWVyaWNcIixcbiAgICBcImdwaFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mbG9ncmFwaGl0XCIsXG4gICAgXCJncHhcIjogXCJhcHBsaWNhdGlvbi9ncHgreG1sXCIsXG4gICAgXCJncWZcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3JhZmVxXCIsXG4gICAgXCJncXNcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3JhZmVxXCIsXG4gICAgXCJncmFtXCI6IFwiYXBwbGljYXRpb24vc3Jnc1wiLFxuICAgIFwiZ3JhbXBzXCI6IFwiYXBwbGljYXRpb24veC1ncmFtcHMteG1sXCIsXG4gICAgXCJncmVcIjogXCJhcHBsaWNhdGlvbi92bmQuZ2VvbWV0cnktZXhwbG9yZXJcIixcbiAgICBcImdydlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtaW5qZWN0b3JcIixcbiAgICBcImdyeG1sXCI6IFwiYXBwbGljYXRpb24vc3Jncyt4bWxcIixcbiAgICBcImdzZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1naG9zdHNjcmlwdFwiLFxuICAgIFwiZ3RhclwiOiBcImFwcGxpY2F0aW9uL3gtZ3RhclwiLFxuICAgIFwiZ3RtXCI6IFwiYXBwbGljYXRpb24vdm5kLmdyb292ZS10b29sLW1lc3NhZ2VcIixcbiAgICBcImd0d1wiOiBcIm1vZGVsL3ZuZC5ndHdcIixcbiAgICBcImd2XCI6IFwidGV4dC92bmQuZ3JhcGh2aXpcIixcbiAgICBcImd4ZlwiOiBcImFwcGxpY2F0aW9uL2d4ZlwiLFxuICAgIFwiZ3h0XCI6IFwiYXBwbGljYXRpb24vdm5kLmdlb25leHRcIixcbiAgICBcImd6XCI6IFwiYXBwbGljYXRpb24veC1nemlwXCIsXG4gICAgXCJoXCI6IFwidGV4dC94LWNcIixcbiAgICBcImgyNjFcIjogXCJ2aWRlby9oMjYxXCIsXG4gICAgXCJoMjYzXCI6IFwidmlkZW8vaDI2M1wiLFxuICAgIFwiaDI2NFwiOiBcInZpZGVvL2gyNjRcIixcbiAgICBcImhhbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5oYWwreG1sXCIsXG4gICAgXCJoYmNpXCI6IFwiYXBwbGljYXRpb24vdm5kLmhiY2lcIixcbiAgICBcImhkZlwiOiBcImFwcGxpY2F0aW9uL3gtaGRmXCIsXG4gICAgXCJoaFwiOiBcInRleHQveC1jXCIsXG4gICAgXCJobHBcIjogXCJhcHBsaWNhdGlvbi93aW5obHBcIixcbiAgICBcImhwZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBnbFwiLFxuICAgIFwiaHBpZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ocC1ocGlkXCIsXG4gICAgXCJocHNcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtaHBzXCIsXG4gICAgXCJocXhcIjogXCJhcHBsaWNhdGlvbi9tYWMtYmluaGV4NDBcIixcbiAgICBcImh0YVwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwiaHRjXCI6IFwidGV4dC9odG1sXCIsXG4gICAgXCJodGtlXCI6IFwiYXBwbGljYXRpb24vdm5kLmtlbmFtZWFhcHBcIixcbiAgICBcImh0bVwiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHRtbFwiOiBcInRleHQvaHRtbFwiLFxuICAgIFwiaHZkXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5odi1kaWNcIixcbiAgICBcImh2cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtdm9pY2VcIixcbiAgICBcImh2c1wiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEuaHYtc2NyaXB0XCIsXG4gICAgXCJpMmdcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJnZW9cIixcbiAgICBcImljY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5pY2Nwcm9maWxlXCIsXG4gICAgXCJpY2VcIjogXCJ4LWNvbmZlcmVuY2UveC1jb29sdGFsa1wiLFxuICAgIFwiaWNtXCI6IFwiYXBwbGljYXRpb24vdm5kLmljY3Byb2ZpbGVcIixcbiAgICBcImljb1wiOiBcImltYWdlL3gtaWNvblwiLFxuICAgIFwiaWNzXCI6IFwidGV4dC9jYWxlbmRhclwiLFxuICAgIFwiaWVmXCI6IFwiaW1hZ2UvaWVmXCIsXG4gICAgXCJpZmJcIjogXCJ0ZXh0L2NhbGVuZGFyXCIsXG4gICAgXCJpZm1cIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQuZm9ybWRhdGFcIixcbiAgICBcImlnZXNcIjogXCJtb2RlbC9pZ2VzXCIsXG4gICAgXCJpZ2xcIjogXCJhcHBsaWNhdGlvbi92bmQuaWdsb2FkZXJcIixcbiAgICBcImlnbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbnNvcnMuaWdtXCIsXG4gICAgXCJpZ3NcIjogXCJtb2RlbC9pZ2VzXCIsXG4gICAgXCJpZ3hcIjogXCJhcHBsaWNhdGlvbi92bmQubWljcm9ncmFmeC5pZ3hcIixcbiAgICBcImlpZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5pbnRlcmNoYW5nZVwiLFxuICAgIFwiaW1wXCI6IFwiYXBwbGljYXRpb24vdm5kLmFjY3BhYy5zaW1wbHkuaW1wXCIsXG4gICAgXCJpbXNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtaW1zXCIsXG4gICAgXCJpblwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImluaVwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImlua1wiOiBcImFwcGxpY2F0aW9uL2lua21sK3htbFwiLFxuICAgIFwiaW5rbWxcIjogXCJhcHBsaWNhdGlvbi9pbmttbCt4bWxcIixcbiAgICBcImluc3RhbGxcIjogXCJhcHBsaWNhdGlvbi94LWluc3RhbGwtaW5zdHJ1Y3Rpb25zXCIsXG4gICAgXCJpb3RhXCI6IFwiYXBwbGljYXRpb24vdm5kLmFzdHJhZWEtc29mdHdhcmUuaW90YVwiLFxuICAgIFwiaXBhXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJpcGZpeFwiOiBcImFwcGxpY2F0aW9uL2lwZml4XCIsXG4gICAgXCJpcGtcIjogXCJhcHBsaWNhdGlvbi92bmQuc2hhbmEuaW5mb3JtZWQucGFja2FnZVwiLFxuICAgIFwiaXJtXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5yaWdodHMtbWFuYWdlbWVudFwiLFxuICAgIFwiaXJwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlyZXBvc2l0b3J5LnBhY2thZ2UreG1sXCIsXG4gICAgXCJpc29cIjogXCJhcHBsaWNhdGlvbi94LWlzbzk2NjAtaW1hZ2VcIixcbiAgICBcIml0cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaGFuYS5pbmZvcm1lZC5mb3JtdGVtcGxhdGVcIixcbiAgICBcIml2cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnBcIixcbiAgICBcIml2dVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pbW1lcnZpc2lvbi1pdnVcIixcbiAgICBcImphZFwiOiBcInRleHQvdm5kLnN1bi5qMm1lLmFwcC1kZXNjcmlwdG9yXCIsXG4gICAgXCJqYW1cIjogXCJhcHBsaWNhdGlvbi92bmQuamFtXCIsXG4gICAgXCJqYXJcIjogXCJhcHBsaWNhdGlvbi9qYXZhLWFyY2hpdmVcIixcbiAgICBcImphdmFcIjogXCJ0ZXh0L3gtamF2YS1zb3VyY2VcIixcbiAgICBcImppc3BcIjogXCJhcHBsaWNhdGlvbi92bmQuamlzcFwiLFxuICAgIFwiamx0XCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLWpseXRcIixcbiAgICBcImpubHBcIjogXCJhcHBsaWNhdGlvbi94LWphdmEtam5scC1maWxlXCIsXG4gICAgXCJqb2RhXCI6IFwiYXBwbGljYXRpb24vdm5kLmpvb3N0LmpvZGEtYXJjaGl2ZVwiLFxuICAgIFwianBlXCI6IFwiaW1hZ2UvanBlZ1wiLFxuICAgIFwianBlZ1wiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZ1wiOiBcImltYWdlL2pwZWdcIixcbiAgICBcImpwZ21cIjogXCJ2aWRlby9qcG1cIixcbiAgICBcImpwZ3ZcIjogXCJ2aWRlby9qcGVnXCIsXG4gICAgXCJqcG1cIjogXCJ2aWRlby9qcG1cIixcbiAgICBcImpzXCI6IFwidGV4dC9qYXZhc2NyaXB0XCIsXG4gICAgXCJqc29uXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgIFwianNvbm1sXCI6IFwiYXBwbGljYXRpb24vanNvbm1sK2pzb25cIixcbiAgICBcImthclwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcImthcmJvblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua2FyYm9uXCIsXG4gICAgXCJrZm9cIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtmb3JtdWxhXCIsXG4gICAgXCJraWFcIjogXCJhcHBsaWNhdGlvbi92bmQua2lkc3BpcmF0aW9uXCIsXG4gICAgXCJrbWxcIjogXCJhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLWVhcnRoLmttbCt4bWxcIixcbiAgICBcImttelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nb29nbGUtZWFydGgua216XCIsXG4gICAgXCJrbmVcIjogXCJhcHBsaWNhdGlvbi92bmQua2luYXJcIixcbiAgICBcImtucFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5raW5hclwiLFxuICAgIFwia29uXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rb250b3VyXCIsXG4gICAgXCJrcHJcIjogXCJhcHBsaWNhdGlvbi92bmQua2RlLmtwcmVzZW50ZXJcIixcbiAgICBcImtwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rZGUua3ByZXNlbnRlclwiLFxuICAgIFwia3B4eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kcy1rZXlwb2ludFwiLFxuICAgIFwia3NwXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rc3ByZWFkXCIsXG4gICAgXCJrdHJcIjogXCJhcHBsaWNhdGlvbi92bmQua2Fob290elwiLFxuICAgIFwia3R4XCI6IFwiaW1hZ2Uva3R4XCIsXG4gICAgXCJrdHpcIjogXCJhcHBsaWNhdGlvbi92bmQua2Fob290elwiLFxuICAgIFwia3dkXCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFwiLFxuICAgIFwia3d0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtkZS5rd29yZFwiLFxuICAgIFwibGFzeG1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmxhcy5sYXMreG1sXCIsXG4gICAgXCJsYXRleFwiOiBcImFwcGxpY2F0aW9uL3gtbGF0ZXhcIixcbiAgICBcImxiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sbGFtYWdyYXBoaWNzLmxpZmUtYmFsYW5jZS5kZXNrdG9wXCIsXG4gICAgXCJsYmVcIjogXCJhcHBsaWNhdGlvbi92bmQubGxhbWFncmFwaGljcy5saWZlLWJhbGFuY2UuZXhjaGFuZ2UreG1sXCIsXG4gICAgXCJsZXNcIjogXCJhcHBsaWNhdGlvbi92bmQuaGhlLmxlc3Nvbi1wbGF5ZXJcIixcbiAgICBcImxoYVwiOiBcImFwcGxpY2F0aW9uL3gtbHpoLWNvbXByZXNzZWRcIixcbiAgICBcImxpbms2NlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yb3V0ZTY2Lmxpbms2Nit4bWxcIixcbiAgICBcImxpc3RcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJsaXN0MzgyMFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pYm0ubW9kY2FwXCIsXG4gICAgXCJsaXN0YWZwXCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5tb2RjYXBcIixcbiAgICBcImxua1wiOiBcImFwcGxpY2F0aW9uL3gtbXMtc2hvcnRjdXRcIixcbiAgICBcImxvZ1wiOiBcInRleHQvcGxhaW5cIixcbiAgICBcImxvc3R4bWxcIjogXCJhcHBsaWNhdGlvbi9sb3N0K3htbFwiLFxuICAgIFwibHJmXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJscm1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtbHJtXCIsXG4gICAgXCJsdGZcIjogXCJhcHBsaWNhdGlvbi92bmQuZnJvZ2Fucy5sdGZcIixcbiAgICBcImx2cFwiOiBcImF1ZGlvL3ZuZC5sdWNlbnQudm9pY2VcIixcbiAgICBcImx3cFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy13b3JkcHJvXCIsXG4gICAgXCJselwiOiBcImFwcGxpY2F0aW9uL3gtbHppcFwiLFxuICAgIFwibHpoXCI6IFwiYXBwbGljYXRpb24veC1semgtY29tcHJlc3NlZFwiLFxuICAgIFwibHptYVwiOiBcImFwcGxpY2F0aW9uL3gtbHptYVwiLFxuICAgIFwibHpvXCI6IFwiYXBwbGljYXRpb24veC1sem9wXCIsXG4gICAgXCJtMTNcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtMTRcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtMXZcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtMjFcIjogXCJhcHBsaWNhdGlvbi9tcDIxXCIsXG4gICAgXCJtMmFcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtMnZcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtM2FcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtM3VcIjogXCJhdWRpby94LW1wZWd1cmxcIixcbiAgICBcIm0zdThcIjogXCJhcHBsaWNhdGlvbi92bmQuYXBwbGUubXBlZ3VybFwiLFxuICAgIFwibTRhXCI6IFwiYXVkaW8vbXA0XCIsXG4gICAgXCJtNHVcIjogXCJ2aWRlby92bmQubXBlZ3VybFwiLFxuICAgIFwibTR2XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtYVwiOiBcImFwcGxpY2F0aW9uL21hdGhlbWF0aWNhXCIsXG4gICAgXCJtYWRzXCI6IFwiYXBwbGljYXRpb24vbWFkcyt4bWxcIixcbiAgICBcIm1hZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5lY293aW4uY2hhcnRcIixcbiAgICBcIm1ha2VyXCI6IFwiYXBwbGljYXRpb24vdm5kLmZyYW1lbWFrZXJcIixcbiAgICBcIm1hblwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1hclwiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwibWF0aG1sXCI6IFwiYXBwbGljYXRpb24vbWF0aG1sK3htbFwiLFxuICAgIFwibWJcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibWJrXCI6IFwiYXBwbGljYXRpb24vdm5kLm1vYml1cy5tYmtcIixcbiAgICBcIm1ib3hcIjogXCJhcHBsaWNhdGlvbi9tYm94XCIsXG4gICAgXCJtYzFcIjogXCJhcHBsaWNhdGlvbi92bmQubWVkY2FsY2RhdGFcIixcbiAgICBcIm1jZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tY2RcIixcbiAgICBcIm1jdXJsXCI6IFwidGV4dC92bmQuY3VybC5tY3VybFwiLFxuICAgICdtZCc6ICd0ZXh0L3BsYWluJyxcbiAgICBcIm1kYlwiOiBcImFwcGxpY2F0aW9uL3gtbXNhY2Nlc3NcIixcbiAgICBcIm1kaVwiOiBcImltYWdlL3ZuZC5tcy1tb2RpXCIsXG4gICAgXCJtZVwiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1lc2hcIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJtZXRhNFwiOiBcImFwcGxpY2F0aW9uL21ldGFsaW5rNCt4bWxcIixcbiAgICBcIm1ldGFsaW5rXCI6IFwiYXBwbGljYXRpb24vbWV0YWxpbmsreG1sXCIsXG4gICAgXCJtZXRzXCI6IFwiYXBwbGljYXRpb24vbWV0cyt4bWxcIixcbiAgICBcIm1mbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tZm1wXCIsXG4gICAgXCJtZnRcIjogXCJhcHBsaWNhdGlvbi9ycGtpLW1hbmlmZXN0XCIsXG4gICAgXCJtZ3BcIjogXCJhcHBsaWNhdGlvbi92bmQub3NnZW8ubWFwZ3VpZGUucGFja2FnZVwiLFxuICAgIFwibWd6XCI6IFwiYXBwbGljYXRpb24vdm5kLnByb3RldXMubWFnYXppbmVcIixcbiAgICBcIm1pZFwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcIm1pZGlcIjogXCJhdWRpby9taWRpXCIsXG4gICAgXCJtaWVcIjogXCJhcHBsaWNhdGlvbi94LW1pZVwiLFxuICAgIFwibWlmXCI6IFwiYXBwbGljYXRpb24vdm5kLm1pZlwiLFxuICAgIFwibWltZVwiOiBcIm1lc3NhZ2UvcmZjODIyXCIsXG4gICAgXCJtajJcIjogXCJ2aWRlby9tajJcIixcbiAgICBcIm1qcDJcIjogXCJ2aWRlby9tajJcIixcbiAgICBcIm1rM2RcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJta2FcIjogXCJhdWRpby94LW1hdHJvc2thXCIsXG4gICAgXCJta3NcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJta3ZcIjogXCJ2aWRlby94LW1hdHJvc2thXCIsXG4gICAgXCJtbHBcIjogXCJhcHBsaWNhdGlvbi92bmQuZG9sYnkubWxwXCIsXG4gICAgXCJtbWRcIjogXCJhcHBsaWNhdGlvbi92bmQuY2hpcG51dHMua2FyYW9rZS1tbWRcIixcbiAgICBcIm1tZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zbWFmXCIsXG4gICAgXCJtbXJcIjogXCJpbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1tbXJcIixcbiAgICBcIm1uZ1wiOiBcInZpZGVvL3gtbW5nXCIsXG4gICAgXCJtbnlcIjogXCJhcHBsaWNhdGlvbi94LW1zbW9uZXlcIixcbiAgICBcIm1vYmlcIjogXCJhcHBsaWNhdGlvbi94LW1vYmlwb2NrZXQtZWJvb2tcIixcbiAgICBcIm1vZHNcIjogXCJhcHBsaWNhdGlvbi9tb2RzK3htbFwiLFxuICAgIFwibW92XCI6IFwidmlkZW8vcXVpY2t0aW1lXCIsXG4gICAgXCJtb3ZpZVwiOiBcInZpZGVvL3gtc2dpLW1vdmllXCIsXG4gICAgXCJtcDJcIjogXCJhdWRpby9tcGVnXCIsXG4gICAgXCJtcDIxXCI6IFwiYXBwbGljYXRpb24vbXAyMVwiLFxuICAgIFwibXAyYVwiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm1wM1wiOiBcImF1ZGlvL21wZWdcIixcbiAgICBcIm9wdXNcIjogXCJhdWRpby9vcHVzXCIsXG4gICAgXCJtcDRcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wNGFcIjogXCJhdWRpby9tcDRcIixcbiAgICBcIm1wNHNcIjogXCJhcHBsaWNhdGlvbi9tcDRcIixcbiAgICBcIm1wNHZcIjogXCJ2aWRlby9tcDRcIixcbiAgICBcIm1wY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uY2VydGlmaWNhdGVcIixcbiAgICBcIm1wZVwiOiBcInZpZGVvL21wZWdcIixcbiAgICBcIm1wZWdcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGdcIjogXCJ2aWRlby9tcGVnXCIsXG4gICAgXCJtcGc0XCI6IFwidmlkZW8vbXA0XCIsXG4gICAgXCJtcGdhXCI6IFwiYXVkaW8vbXBlZ1wiLFxuICAgIFwibXBrZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5hcHBsZS5pbnN0YWxsZXIreG1sXCIsXG4gICAgXCJtcG1cIjogXCJhcHBsaWNhdGlvbi92bmQuYmx1ZWljZS5tdWx0aXBhc3NcIixcbiAgICBcIm1wblwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb3BodW4uYXBwbGljYXRpb25cIixcbiAgICBcIm1wcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wcm9qZWN0XCIsXG4gICAgXCJtcHRcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcHJvamVjdFwiLFxuICAgIFwibXB5XCI6IFwiYXBwbGljYXRpb24vdm5kLmlibS5taW5pcGF5XCIsXG4gICAgXCJtcXlcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLm1xeVwiLFxuICAgIFwibXJjXCI6IFwiYXBwbGljYXRpb24vbWFyY1wiLFxuICAgIFwibXJjeFwiOiBcImFwcGxpY2F0aW9uL21hcmN4bWwreG1sXCIsXG4gICAgXCJtc1wiOiBcInRleHQvdHJvZmZcIixcbiAgICBcIm1zY21sXCI6IFwiYXBwbGljYXRpb24vbWVkaWFzZXJ2ZXJjb250cm9sK3htbFwiLFxuICAgIFwibXNlZWRcIjogXCJhcHBsaWNhdGlvbi92bmQuZmRzbi5tc2VlZFwiLFxuICAgIFwibXNlcVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tc2VxXCIsXG4gICAgXCJtc2ZcIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24ubXNmXCIsXG4gICAgXCJtc2hcIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJtc2lcIjogXCJhcHBsaWNhdGlvbi94LW1zZG93bmxvYWRcIixcbiAgICBcIm1zbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tb2JpdXMubXNsXCIsXG4gICAgXCJtc3R5XCI6IFwiYXBwbGljYXRpb24vdm5kLm11dmVlLnN0eWxlXCIsXG4gICAgLy9cIm10c1wiOiBcIm1vZGVsL3ZuZC5tdHNcIixcbiAgICBcIm10c1wiOiBcInZpZGVvL210c1wiLFxuICAgIFwibXVzXCI6IFwiYXBwbGljYXRpb24vdm5kLm11c2ljaWFuXCIsXG4gICAgXCJtdXNpY3htbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5yZWNvcmRhcmUubXVzaWN4bWwreG1sXCIsXG4gICAgXCJtdmJcIjogXCJhcHBsaWNhdGlvbi94LW1zbWVkaWF2aWV3XCIsXG4gICAgXCJtd2ZcIjogXCJhcHBsaWNhdGlvbi92bmQubWZlclwiLFxuICAgIFwibXhmXCI6IFwiYXBwbGljYXRpb24vbXhmXCIsXG4gICAgXCJteGxcIjogXCJhcHBsaWNhdGlvbi92bmQucmVjb3JkYXJlLm11c2ljeG1sXCIsXG4gICAgXCJteG1sXCI6IFwiYXBwbGljYXRpb24veHYreG1sXCIsXG4gICAgXCJteHNcIjogXCJhcHBsaWNhdGlvbi92bmQudHJpc2NhcGUubXhzXCIsXG4gICAgXCJteHVcIjogXCJ2aWRlby92bmQubXBlZ3VybFwiLFxuICAgIFwibi1nYWdlXCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5zeW1iaWFuLmluc3RhbGxcIixcbiAgICBcIm4zXCI6IFwidGV4dC9uM1wiLFxuICAgIFwibmJcIjogXCJhcHBsaWNhdGlvbi9tYXRoZW1hdGljYVwiLFxuICAgIFwibmJwXCI6IFwiYXBwbGljYXRpb24vdm5kLndvbGZyYW0ucGxheWVyXCIsXG4gICAgXCJuY1wiOiBcImFwcGxpY2F0aW9uL3gtbmV0Y2RmXCIsXG4gICAgXCJuY3hcIjogXCJhcHBsaWNhdGlvbi94LWR0Ym5jeCt4bWxcIixcbiAgICBcIm5mb1wiOiBcInRleHQveC1uZm9cIixcbiAgICBcIm5nZGF0XCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLm4tZ2FnZS5kYXRhXCIsXG4gICAgXCJuaXRmXCI6IFwiYXBwbGljYXRpb24vdm5kLm5pdGZcIixcbiAgICBcIm5sdVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5uZXVyb2xhbmd1YWdlLm5sdVwiLFxuICAgIFwibm1sXCI6IFwiYXBwbGljYXRpb24vdm5kLmVubGl2ZW5cIixcbiAgICBcIm5uZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1kaXJlY3RvcnlcIixcbiAgICBcIm5uc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC1zZWFsZXJcIixcbiAgICBcIm5ud1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ub2JsZW5ldC13ZWJcIixcbiAgICBcIm5weFwiOiBcImltYWdlL3ZuZC5uZXQtZnB4XCIsXG4gICAgXCJuc2NcIjogXCJhcHBsaWNhdGlvbi94LWNvbmZlcmVuY2VcIixcbiAgICBcIm5zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1ub3Rlc1wiLFxuICAgIFwibnRmXCI6IFwiYXBwbGljYXRpb24vdm5kLm5pdGZcIixcbiAgICBcIm56YlwiOiBcImFwcGxpY2F0aW9uL3gtbnpiXCIsXG4gICAgXCJvYTJcIjogXCJhcHBsaWNhdGlvbi92bmQuZnVqaXRzdS5vYXN5czJcIixcbiAgICBcIm9hM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppdHN1Lm9hc3lzM1wiLFxuICAgIFwib2FzXCI6IFwiYXBwbGljYXRpb24vdm5kLmZ1aml0c3Uub2FzeXNcIixcbiAgICBcIm9iZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNiaW5kZXJcIixcbiAgICBcIm9ialwiOiBcImFwcGxpY2F0aW9uL3gtdGdpZlwiLFxuICAgIFwib2RhXCI6IFwiYXBwbGljYXRpb24vb2RhXCIsXG4gICAgXCJvZGJcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmRhdGFiYXNlXCIsXG4gICAgXCJvZGNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0XCIsXG4gICAgXCJvZGZcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGFcIixcbiAgICBcIm9kZnRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmZvcm11bGEtdGVtcGxhdGVcIixcbiAgICBcIm9kZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuZ3JhcGhpY3NcIixcbiAgICBcIm9kaVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuaW1hZ2VcIixcbiAgICBcIm9kbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dC1tYXN0ZXJcIixcbiAgICBcIm9kcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uXCIsXG4gICAgXCJvZHNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0XCIsXG4gICAgXCJvZHRcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHRcIixcbiAgICBcIm9nYVwiOiBcImF1ZGlvL29nZ1wiLFxuICAgIFwib2dnXCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJvZ3ZcIjogXCJ2aWRlby9vZ2dcIixcbiAgICBcIm9neFwiOiBcImFwcGxpY2F0aW9uL29nZ1wiLFxuICAgIFwib21kb2NcIjogXCJhcHBsaWNhdGlvbi9vbWRvYyt4bWxcIixcbiAgICBcIm9uZXBrZ1wiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRtcFwiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRvY1wiOiBcImFwcGxpY2F0aW9uL29uZW5vdGVcIixcbiAgICBcIm9uZXRvYzJcIjogXCJhcHBsaWNhdGlvbi9vbmVub3RlXCIsXG4gICAgXCJvcGZcIjogXCJhcHBsaWNhdGlvbi9vZWJwcy1wYWNrYWdlK3htbFwiLFxuICAgIFwib3BtbFwiOiBcInRleHQveC1vcG1sXCIsXG4gICAgXCJvcHJjXCI6IFwiYXBwbGljYXRpb24vdm5kLnBhbG1cIixcbiAgICBcIm9yZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1vcmdhbml6ZXJcIixcbiAgICBcIm9zZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC55YW1haGEub3BlbnNjb3JlZm9ybWF0XCIsXG4gICAgXCJvc2ZwdmdcIjogXCJhcHBsaWNhdGlvbi92bmQueWFtYWhhLm9wZW5zY29yZWZvcm1hdC5vc2ZwdmcreG1sXCIsXG4gICAgXCJvdGNcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmNoYXJ0LXRlbXBsYXRlXCIsXG4gICAgXCJvdGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtb3RmXCIsXG4gICAgXCJvdGdcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmdyYXBoaWNzLXRlbXBsYXRlXCIsXG4gICAgXCJvdGhcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQtd2ViXCIsXG4gICAgXCJvdGlcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LmltYWdlLXRlbXBsYXRlXCIsXG4gICAgXCJvdHBcIjogXCJhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbi10ZW1wbGF0ZVwiLFxuICAgIFwib3RzXCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldC10ZW1wbGF0ZVwiLFxuICAgIFwib3R0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC50ZXh0LXRlbXBsYXRlXCIsXG4gICAgXCJveHBzXCI6IFwiYXBwbGljYXRpb24vb3hwc1wiLFxuICAgIFwib3h0XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW5vZmZpY2VvcmcuZXh0ZW5zaW9uXCIsXG4gICAgXCJwXCI6IFwidGV4dC94LXBhc2NhbFwiLFxuICAgIFwicDEwXCI6IFwiYXBwbGljYXRpb24vcGtjczEwXCIsXG4gICAgXCJwMTJcIjogXCJhcHBsaWNhdGlvbi94LXBrY3MxMlwiLFxuICAgIFwicDdiXCI6IFwiYXBwbGljYXRpb24veC1wa2NzNy1jZXJ0aWZpY2F0ZXNcIixcbiAgICBcInA3Y1wiOiBcImFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcIixcbiAgICBcInA3bVwiOiBcImFwcGxpY2F0aW9uL3BrY3M3LW1pbWVcIixcbiAgICBcInA3clwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczctY2VydHJlcXJlc3BcIixcbiAgICBcInA3c1wiOiBcImFwcGxpY2F0aW9uL3BrY3M3LXNpZ25hdHVyZVwiLFxuICAgIFwicDhcIjogXCJhcHBsaWNhdGlvbi9wa2NzOFwiLFxuICAgIFwicGFzXCI6IFwidGV4dC94LXBhc2NhbFwiLFxuICAgIFwicGF3XCI6IFwiYXBwbGljYXRpb24vdm5kLnBhd2FhZmlsZVwiLFxuICAgIFwicGJkXCI6IFwiYXBwbGljYXRpb24vdm5kLnBvd2VyYnVpbGRlcjZcIixcbiAgICBcInBibVwiOiBcImltYWdlL3gtcG9ydGFibGUtYml0bWFwXCIsXG4gICAgXCJwY2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLnRjcGR1bXAucGNhcFwiLFxuICAgIFwicGNmXCI6IFwiYXBwbGljYXRpb24veC1mb250LXBjZlwiLFxuICAgIFwicGNsXCI6IFwiYXBwbGljYXRpb24vdm5kLmhwLXBjbFwiLFxuICAgIFwicGNseGxcIjogXCJhcHBsaWNhdGlvbi92bmQuaHAtcGNseGxcIixcbiAgICBcInBjdFwiOiBcImltYWdlL3gtcGljdFwiLFxuICAgIFwicGN1cmxcIjogXCJhcHBsaWNhdGlvbi92bmQuY3VybC5wY3VybFwiLFxuICAgIFwicGN4XCI6IFwiaW1hZ2UveC1wY3hcIixcbiAgICBcInBkYlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJwZGZcIjogXCJhcHBsaWNhdGlvbi9wZGZcIixcbiAgICBcInBmYVwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC10eXBlMVwiLFxuICAgIFwicGZiXCI6IFwiYXBwbGljYXRpb24veC1mb250LXR5cGUxXCIsXG4gICAgXCJwZm1cIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHlwZTFcIixcbiAgICBcInBmclwiOiBcImFwcGxpY2F0aW9uL2ZvbnQtdGRwZnJcIixcbiAgICBcInBmeFwiOiBcImFwcGxpY2F0aW9uL3gtcGtjczEyXCIsXG4gICAgXCJwZ21cIjogXCJpbWFnZS94LXBvcnRhYmxlLWdyYXltYXBcIixcbiAgICBcInBnblwiOiBcImFwcGxpY2F0aW9uL3gtY2hlc3MtcGduXCIsXG4gICAgXCJwZ3BcIjogXCJhcHBsaWNhdGlvbi9wZ3AtZW5jcnlwdGVkXCIsXG4gICAgXCJwaGFyXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJwaHBcIjogXCJ0ZXh0L3BsYWluXCIsXG4gICAgXCJwaHBzXCI6IFwiYXBwbGljYXRpb24veC1odHRwZC1waHBzXCIsXG4gICAgXCJwaWNcIjogXCJpbWFnZS94LXBpY3RcIixcbiAgICBcInBrZ1wiOiBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiLFxuICAgIFwicGtpXCI6IFwiYXBwbGljYXRpb24vcGtpeGNtcFwiLFxuICAgIFwicGtpcGF0aFwiOiBcImFwcGxpY2F0aW9uL3BraXgtcGtpcGF0aFwiLFxuICAgIFwicGxiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LWxhcmdlXCIsXG4gICAgXCJwbGNcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnBsY1wiLFxuICAgIFwicGxmXCI6IFwiYXBwbGljYXRpb24vdm5kLnBvY2tldGxlYXJuXCIsXG4gICAgXCJwbGlzdFwiOiBcImFwcGxpY2F0aW9uL3gtcGxpc3RcIixcbiAgICBcInBsc1wiOiBcImFwcGxpY2F0aW9uL3Bscyt4bWxcIixcbiAgICBcInBtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdGMtcG9zbWxcIixcbiAgICBcInBuZ1wiOiBcImltYWdlL3BuZ1wiLFxuICAgIFwicG5tXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1hbnltYXBcIixcbiAgICBcInBvcnRwa2dcIjogXCJhcHBsaWNhdGlvbi92bmQubWFjcG9ydHMucG9ydHBrZ1wiLFxuICAgIFwicG90XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnRcIixcbiAgICBcInBvdG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBvdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwudGVtcGxhdGVcIixcbiAgICBcInBwYW1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInBwZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5jdXBzLXBwZFwiLFxuICAgIFwicHBtXCI6IFwiaW1hZ2UveC1wb3J0YWJsZS1waXhtYXBcIixcbiAgICBcInBwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwcHNtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQuc2xpZGVzaG93Lm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHBzeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5zbGlkZXNob3dcIixcbiAgICBcInBwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50XCIsXG4gICAgXCJwcHRtXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQucHJlc2VudGF0aW9uLm1hY3JvZW5hYmxlZC4xMlwiLFxuICAgIFwicHB0eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb25cIixcbiAgICBcInBxYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5wYWxtXCIsXG4gICAgXCJwcmNcIjogXCJhcHBsaWNhdGlvbi94LW1vYmlwb2NrZXQtZWJvb2tcIixcbiAgICBcInByZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy1mcmVlbGFuY2VcIixcbiAgICBcInByZlwiOiBcImFwcGxpY2F0aW9uL3BpY3MtcnVsZXNcIixcbiAgICBcInBzXCI6IFwiYXBwbGljYXRpb24vcG9zdHNjcmlwdFwiLFxuICAgIFwicHNiXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAucGljLWJ3LXNtYWxsXCIsXG4gICAgXCJwc2RcIjogXCJpbWFnZS92bmQuYWRvYmUucGhvdG9zaG9wXCIsXG4gICAgXCJwc2ZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtbGludXgtcHNmXCIsXG4gICAgXCJwc2tjeG1sXCI6IFwiYXBwbGljYXRpb24vcHNrYyt4bWxcIixcbiAgICBcInB0aWRcIjogXCJhcHBsaWNhdGlvbi92bmQucHZpLnB0aWQxXCIsXG4gICAgXCJwdWJcIjogXCJhcHBsaWNhdGlvbi94LW1zcHVibGlzaGVyXCIsXG4gICAgXCJwdmJcIjogXCJhcHBsaWNhdGlvbi92bmQuM2dwcC5waWMtYnctdmFyXCIsXG4gICAgXCJwd25cIjogXCJhcHBsaWNhdGlvbi92bmQuM20ucG9zdC1pdC1ub3Rlc1wiLFxuICAgIFwicHlhXCI6IFwiYXVkaW8vdm5kLm1zLXBsYXlyZWFkeS5tZWRpYS5weWFcIixcbiAgICBcInB5dlwiOiBcInZpZGVvL3ZuZC5tcy1wbGF5cmVhZHkubWVkaWEucHl2XCIsXG4gICAgXCJxYW1cIjogXCJhcHBsaWNhdGlvbi92bmQuZXBzb24ucXVpY2thbmltZVwiLFxuICAgIFwicWJvXCI6IFwiYXBwbGljYXRpb24vdm5kLmludHUucWJvXCIsXG4gICAgXCJxZnhcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50dS5xZnhcIixcbiAgICBcInFwc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5wdWJsaXNoYXJlLWRlbHRhLXRyZWVcIixcbiAgICBcInF0XCI6IFwidmlkZW8vcXVpY2t0aW1lXCIsXG4gICAgXCJxd2RcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF3dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXhiXCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJxeGRcIjogXCJhcHBsaWNhdGlvbi92bmQucXVhcmsucXVhcmt4cHJlc3NcIixcbiAgICBcInF4bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5xdWFyay5xdWFya3hwcmVzc1wiLFxuICAgIFwicXh0XCI6IFwiYXBwbGljYXRpb24vdm5kLnF1YXJrLnF1YXJreHByZXNzXCIsXG4gICAgXCJyYVwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvXCIsXG4gICAgXCJyYW1cIjogXCJhdWRpby94LXBuLXJlYWxhdWRpb1wiLFxuICAgIFwicmFyXCI6IFwiYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZFwiLFxuICAgIFwicmFzXCI6IFwiaW1hZ2UveC1jbXUtcmFzdGVyXCIsXG4gICAgXCJyYlwiOiBcInRleHQvcGxhaW5cIixcbiAgICBcInJjcHJvZmlsZVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5pcHVucGx1Z2dlZC5yY3Byb2ZpbGVcIixcbiAgICBcInJkZlwiOiBcImFwcGxpY2F0aW9uL3JkZit4bWxcIixcbiAgICBcInJkelwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kYXRhLXZpc2lvbi5yZHpcIixcbiAgICBcInJlcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5idXNpbmVzc29iamVjdHNcIixcbiAgICBcInJlc1wiOiBcImFwcGxpY2F0aW9uL3gtZHRicmVzb3VyY2UreG1sXCIsXG4gICAgXCJyZXN4XCI6IFwidGV4dC94bWxcIixcbiAgICBcInJnYlwiOiBcImltYWdlL3gtcmdiXCIsXG4gICAgXCJyaWZcIjogXCJhcHBsaWNhdGlvbi9yZWdpbmZvK3htbFwiLFxuICAgIFwicmlwXCI6IFwiYXVkaW8vdm5kLnJpcFwiLFxuICAgIFwicmlzXCI6IFwiYXBwbGljYXRpb24veC1yZXNlYXJjaC1pbmZvLXN5c3RlbXNcIixcbiAgICBcInJsXCI6IFwiYXBwbGljYXRpb24vcmVzb3VyY2UtbGlzdHMreG1sXCIsXG4gICAgXCJybGNcIjogXCJpbWFnZS92bmQuZnVqaXhlcm94LmVkbWljcy1ybGNcIixcbiAgICBcInJsZFwiOiBcImFwcGxpY2F0aW9uL3Jlc291cmNlLWxpc3RzLWRpZmYreG1sXCIsXG4gICAgXCJybVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWFcIixcbiAgICBcInJtaVwiOiBcImF1ZGlvL21pZGlcIixcbiAgICBcInJtcFwiOiBcImF1ZGlvL3gtcG4tcmVhbGF1ZGlvLXBsdWdpblwiLFxuICAgIFwicm1zXCI6IFwiYXBwbGljYXRpb24vdm5kLmpjcC5qYXZhbWUubWlkbGV0LXJtc1wiLFxuICAgIFwicm12YlwiOiBcImFwcGxpY2F0aW9uL3ZuZC5ybi1yZWFsbWVkaWEtdmJyXCIsXG4gICAgXCJybmNcIjogXCJhcHBsaWNhdGlvbi9yZWxheC1uZy1jb21wYWN0LXN5bnRheFwiLFxuICAgIFwicm9hXCI6IFwiYXBwbGljYXRpb24vcnBraS1yb2FcIixcbiAgICBcInJvZmZcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJycDlcIjogXCJhcHBsaWNhdGlvbi92bmQuY2xvYW50by5ycDlcIixcbiAgICBcInJwbVwiOiBcImFwcGxpY2F0aW9uL3gtcnBtXCIsXG4gICAgXCJycHNzXCI6IFwiYXBwbGljYXRpb24vdm5kLm5va2lhLnJhZGlvLXByZXNldHNcIixcbiAgICBcInJwc3RcIjogXCJhcHBsaWNhdGlvbi92bmQubm9raWEucmFkaW8tcHJlc2V0XCIsXG4gICAgXCJycVwiOiBcImFwcGxpY2F0aW9uL3NwYXJxbC1xdWVyeVwiLFxuICAgIFwicnNcIjogXCJhcHBsaWNhdGlvbi9ybHMtc2VydmljZXMreG1sXCIsXG4gICAgXCJyc2RcIjogXCJhcHBsaWNhdGlvbi9yc2QreG1sXCIsXG4gICAgXCJyc3NcIjogXCJhcHBsaWNhdGlvbi9yc3MreG1sXCIsXG4gICAgXCJydGZcIjogXCJhcHBsaWNhdGlvbi9ydGZcIixcbiAgICBcInJ0eFwiOiBcInRleHQvcmljaHRleHRcIixcbiAgICBcInNcIjogXCJ0ZXh0L3gtYXNtXCIsXG4gICAgXCJzM21cIjogXCJhdWRpby9zM21cIixcbiAgICBcInM3elwiOiBcImFwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZFwiLFxuICAgIFwic2FmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5zbWFmLWF1ZGlvXCIsXG4gICAgXCJzYWZhcmlleHR6XCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJzYXNzXCI6IFwidGV4dC94LXNhc3NcIixcbiAgICBcInNibWxcIjogXCJhcHBsaWNhdGlvbi9zYm1sK3htbFwiLFxuICAgIFwic2NcIjogXCJhcHBsaWNhdGlvbi92bmQuaWJtLnNlY3VyZS1jb250YWluZXJcIixcbiAgICBcInNjZFwiOiBcImFwcGxpY2F0aW9uL3gtbXNzY2hlZHVsZVwiLFxuICAgIFwic2NtXCI6IFwiYXBwbGljYXRpb24vdm5kLmxvdHVzLXNjcmVlbmNhbVwiLFxuICAgIFwic2NxXCI6IFwiYXBwbGljYXRpb24vc2N2cC1jdi1yZXF1ZXN0XCIsXG4gICAgXCJzY3NcIjogXCJhcHBsaWNhdGlvbi9zY3ZwLWN2LXJlc3BvbnNlXCIsXG4gICAgXCJzY3NzXCI6IFwidGV4dC94LXNjc3NcIixcbiAgICBcInNjdXJsXCI6IFwidGV4dC92bmQuY3VybC5zY3VybFwiLFxuICAgIFwic2RhXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi5kcmF3XCIsXG4gICAgXCJzZGNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLmNhbGNcIixcbiAgICBcInNkZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24uaW1wcmVzc1wiLFxuICAgIFwic2RrZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zb2xlbnQuc2RrbSt4bWxcIixcbiAgICBcInNka21cIjogXCJhcHBsaWNhdGlvbi92bmQuc29sZW50LnNka20reG1sXCIsXG4gICAgXCJzZHBcIjogXCJhcHBsaWNhdGlvbi9zZHBcIixcbiAgICBcInNkd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyXCIsXG4gICAgXCJzZWVcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VlbWFpbFwiLFxuICAgIFwic2VlZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mZHNuLnNlZWRcIixcbiAgICBcInNlbWFcIjogXCJhcHBsaWNhdGlvbi92bmQuc2VtYVwiLFxuICAgIFwic2VtZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zZW1kXCIsXG4gICAgXCJzZW1mXCI6IFwiYXBwbGljYXRpb24vdm5kLnNlbWZcIixcbiAgICBcInNlclwiOiBcImFwcGxpY2F0aW9uL2phdmEtc2VyaWFsaXplZC1vYmplY3RcIixcbiAgICBcInNldHBheVwiOiBcImFwcGxpY2F0aW9uL3NldC1wYXltZW50LWluaXRpYXRpb25cIixcbiAgICBcInNldHJlZ1wiOiBcImFwcGxpY2F0aW9uL3NldC1yZWdpc3RyYXRpb24taW5pdGlhdGlvblwiLFxuICAgIFwic2ZkLWhkc3R4XCI6IFwiYXBwbGljYXRpb24vdm5kLmh5ZHJvc3RhdGl4LnNvZi1kYXRhXCIsXG4gICAgXCJzZnNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3BvdGZpcmUuc2ZzXCIsXG4gICAgXCJzZnZcIjogXCJ0ZXh0L3gtc2Z2XCIsXG4gICAgXCJzZ2lcIjogXCJpbWFnZS9zZ2lcIixcbiAgICBcInNnbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGFyZGl2aXNpb24ud3JpdGVyLWdsb2JhbFwiLFxuICAgIFwic2dtXCI6IFwidGV4dC9zZ21sXCIsXG4gICAgXCJzZ21sXCI6IFwidGV4dC9zZ21sXCIsXG4gICAgXCJzaFwiOiBcImFwcGxpY2F0aW9uL3gtc2hcIixcbiAgICBcInNoYXJcIjogXCJhcHBsaWNhdGlvbi94LXNoYXJcIixcbiAgICBcInNoZlwiOiBcImFwcGxpY2F0aW9uL3NoZit4bWxcIixcbiAgICBcInNpZFwiOiBcImltYWdlL3gtbXJzaWQtaW1hZ2VcIixcbiAgICBcInNpZ1wiOiBcImFwcGxpY2F0aW9uL3BncC1zaWduYXR1cmVcIixcbiAgICBcInNpbFwiOiBcImF1ZGlvL3NpbGtcIixcbiAgICBcInNpbG9cIjogXCJtb2RlbC9tZXNoXCIsXG4gICAgXCJzaXNcIjogXCJhcHBsaWNhdGlvbi92bmQuc3ltYmlhbi5pbnN0YWxsXCIsXG4gICAgXCJzaXN4XCI6IFwiYXBwbGljYXRpb24vdm5kLnN5bWJpYW4uaW5zdGFsbFwiLFxuICAgIFwic2l0XCI6IFwiYXBwbGljYXRpb24veC1zdHVmZml0XCIsXG4gICAgXCJzaXR4XCI6IFwiYXBwbGljYXRpb24veC1zdHVmZml0eFwiLFxuICAgIFwic2tkXCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNrbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5rb2FuXCIsXG4gICAgXCJza3BcIjogXCJhcHBsaWNhdGlvbi92bmQua29hblwiLFxuICAgIFwic2t0XCI6IFwiYXBwbGljYXRpb24vdm5kLmtvYW5cIixcbiAgICBcInNsZG1cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludC5zbGlkZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInNsZHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwuc2xpZGVcIixcbiAgICBcInNsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5lcHNvbi5zYWx0XCIsXG4gICAgXCJzbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEuc3RlcGNoYXJ0XCIsXG4gICAgXCJzbWZcIjogXCJhcHBsaWNhdGlvbi92bmQuc3RhcmRpdmlzaW9uLm1hdGhcIixcbiAgICBcInNtaVwiOiBcImFwcGxpY2F0aW9uL3NtaWwreG1sXCIsXG4gICAgXCJzbWlsXCI6IFwiYXBwbGljYXRpb24vc21pbCt4bWxcIixcbiAgICBcInNtdlwiOiBcInZpZGVvL3gtc212XCIsXG4gICAgXCJzbXppcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdGVwbWFuaWEucGFja2FnZVwiLFxuICAgIFwic25kXCI6IFwiYXVkaW8vYmFzaWNcIixcbiAgICBcInNuZlwiOiBcImFwcGxpY2F0aW9uL3gtZm9udC1zbmZcIixcbiAgICBcInNvXCI6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gICAgXCJzcGNcIjogXCJhcHBsaWNhdGlvbi94LXBrY3M3LWNlcnRpZmljYXRlc1wiLFxuICAgIFwic3BmXCI6IFwiYXBwbGljYXRpb24vdm5kLnlhbWFoYS5zbWFmLXBocmFzZVwiLFxuICAgIFwic3BsXCI6IFwiYXBwbGljYXRpb24veC1mdXR1cmVzcGxhc2hcIixcbiAgICBcInNwb3RcIjogXCJ0ZXh0L3ZuZC5pbjNkLnNwb3RcIixcbiAgICBcInNwcFwiOiBcImFwcGxpY2F0aW9uL3NjdnAtdnAtcmVzcG9uc2VcIixcbiAgICBcInNwcVwiOiBcImFwcGxpY2F0aW9uL3NjdnAtdnAtcmVxdWVzdFwiLFxuICAgIFwic3B4XCI6IFwiYXVkaW8vb2dnXCIsXG4gICAgXCJzcWxcIjogXCJhcHBsaWNhdGlvbi94LXNxbFwiLFxuICAgIFwic3JjXCI6IFwiYXBwbGljYXRpb24veC13YWlzLXNvdXJjZVwiLFxuICAgIFwic3J0XCI6IFwiYXBwbGljYXRpb24veC1zdWJyaXBcIixcbiAgICBcInNydVwiOiBcImFwcGxpY2F0aW9uL3NydSt4bWxcIixcbiAgICBcInNyeFwiOiBcImFwcGxpY2F0aW9uL3NwYXJxbC1yZXN1bHRzK3htbFwiLFxuICAgIFwic3NkbFwiOiBcImFwcGxpY2F0aW9uL3NzZGwreG1sXCIsXG4gICAgXCJzc2VcIjogXCJhcHBsaWNhdGlvbi92bmQua29kYWstZGVzY3JpcHRvclwiLFxuICAgIFwic3NmXCI6IFwiYXBwbGljYXRpb24vdm5kLmVwc29uLnNzZlwiLFxuICAgIFwic3NtbFwiOiBcImFwcGxpY2F0aW9uL3NzbWwreG1sXCIsXG4gICAgXCJzdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zYWlsaW5ndHJhY2tlci50cmFja1wiLFxuICAgIFwic3RjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsYy50ZW1wbGF0ZVwiLFxuICAgIFwic3RkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuZHJhdy50ZW1wbGF0ZVwiLFxuICAgIFwic3RmXCI6IFwiYXBwbGljYXRpb24vdm5kLnd0LnN0ZlwiLFxuICAgIFwic3RpXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzcy50ZW1wbGF0ZVwiLFxuICAgIFwic3RrXCI6IFwiYXBwbGljYXRpb24vaHlwZXJzdHVkaW9cIixcbiAgICBcInN0bFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1wa2kuc3RsXCIsXG4gICAgXCJzdHJcIjogXCJhcHBsaWNhdGlvbi92bmQucGcuZm9ybWF0XCIsXG4gICAgXCJzdHdcIjogXCJhcHBsaWNhdGlvbi92bmQuc3VuLnhtbC53cml0ZXIudGVtcGxhdGVcIixcbiAgICBcInN0eWxcIjogXCJ0ZXh0L3gtc3R5bFwiLFxuICAgIFwic3ViXCI6IFwiaW1hZ2Uvdm5kLmR2Yi5zdWJ0aXRsZVwiLFxuICAgIFwic3VzXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1cy1jYWxlbmRhclwiLFxuICAgIFwic3VzcFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdXMtY2FsZW5kYXJcIixcbiAgICBcInN2NGNwaW9cIjogXCJhcHBsaWNhdGlvbi94LXN2NGNwaW9cIixcbiAgICBcInN2NGNyY1wiOiBcImFwcGxpY2F0aW9uL3gtc3Y0Y3JjXCIsXG4gICAgXCJzdmNcIjogXCJhcHBsaWNhdGlvbi92bmQuZHZiLnNlcnZpY2VcIixcbiAgICBcInN2ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5zdmRcIixcbiAgICBcInN2Z1wiOiBcImltYWdlL3N2Zyt4bWxcIixcbiAgICBcInN2Z3pcIjogXCJpbWFnZS9zdmcreG1sXCIsXG4gICAgXCJzd2FcIjogXCJhcHBsaWNhdGlvbi94LWRpcmVjdG9yXCIsXG4gICAgXCJzd2ZcIjogXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiLFxuICAgIFwic3dpXCI6IFwiYXBwbGljYXRpb24vdm5kLmFyaXN0YW5ldHdvcmtzLnN3aVwiLFxuICAgIFwic3hjXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuY2FsY1wiLFxuICAgIFwic3hkXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuZHJhd1wiLFxuICAgIFwic3hnXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyLmdsb2JhbFwiLFxuICAgIFwic3hpXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwuaW1wcmVzc1wiLFxuICAgIFwic3htXCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwubWF0aFwiLFxuICAgIFwic3h3XCI6IFwiYXBwbGljYXRpb24vdm5kLnN1bi54bWwud3JpdGVyXCIsXG4gICAgXCJ0XCI6IFwidGV4dC90cm9mZlwiLFxuICAgIFwidDNcIjogXCJhcHBsaWNhdGlvbi94LXQzdm0taW1hZ2VcIixcbiAgICBcInRhZ2xldFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5teW5mY1wiLFxuICAgIFwidGFvXCI6IFwiYXBwbGljYXRpb24vdm5kLnRhby5pbnRlbnQtbW9kdWxlLWFyY2hpdmVcIixcbiAgICBcInRhclwiOiBcImFwcGxpY2F0aW9uL3gtdGFyXCIsXG4gICAgXCJ0Y2FwXCI6IFwiYXBwbGljYXRpb24vdm5kLjNncHAyLnRjYXBcIixcbiAgICBcInRjbFwiOiBcImFwcGxpY2F0aW9uL3gtdGNsXCIsXG4gICAgXCJ0ZWFjaGVyXCI6IFwiYXBwbGljYXRpb24vdm5kLnNtYXJ0LnRlYWNoZXJcIixcbiAgICBcInRlaVwiOiBcImFwcGxpY2F0aW9uL3RlaSt4bWxcIixcbiAgICBcInRlaWNvcnB1c1wiOiBcImFwcGxpY2F0aW9uL3RlaSt4bWxcIixcbiAgICBcInRleFwiOiBcImFwcGxpY2F0aW9uL3gtdGV4XCIsXG4gICAgXCJ0ZXhpXCI6IFwiYXBwbGljYXRpb24veC10ZXhpbmZvXCIsXG4gICAgXCJ0ZXhpbmZvXCI6IFwiYXBwbGljYXRpb24veC10ZXhpbmZvXCIsXG4gICAgXCJ0ZXh0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwidGZpXCI6IFwiYXBwbGljYXRpb24vdGhyYXVkK3htbFwiLFxuICAgIFwidGZtXCI6IFwiYXBwbGljYXRpb24veC10ZXgtdGZtXCIsXG4gICAgXCJ0Z2FcIjogXCJpbWFnZS94LXRnYVwiLFxuICAgIFwidGd6XCI6IFwiYXBwbGljYXRpb24veC1nemlwXCIsXG4gICAgXCJ0aG14XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLW9mZmljZXRoZW1lXCIsXG4gICAgXCJ0aWZcIjogXCJpbWFnZS90aWZmXCIsXG4gICAgXCJ0aWZmXCI6IFwiaW1hZ2UvdGlmZlwiLFxuICAgIFwidG1vXCI6IFwiYXBwbGljYXRpb24vdm5kLnRtb2JpbGUtbGl2ZXR2XCIsXG4gICAgXCJ0b3JyZW50XCI6IFwiYXBwbGljYXRpb24veC1iaXR0b3JyZW50XCIsXG4gICAgXCJ0cGxcIjogXCJhcHBsaWNhdGlvbi92bmQuZ3Jvb3ZlLXRvb2wtdGVtcGxhdGVcIixcbiAgICBcInRwdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC50cmlkLnRwdFwiLFxuICAgIFwidHJcIjogXCJ0ZXh0L3Ryb2ZmXCIsXG4gICAgXCJ0cmFcIjogXCJhcHBsaWNhdGlvbi92bmQudHJ1ZWFwcFwiLFxuICAgIFwidHJtXCI6IFwiYXBwbGljYXRpb24veC1tc3Rlcm1pbmFsXCIsXG4gICAgXCJ0c2RcIjogXCJhcHBsaWNhdGlvbi90aW1lc3RhbXBlZC1kYXRhXCIsXG4gICAgXCJ0c3ZcIjogXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsXG4gICAgXCJ0dGNcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHRmXCIsXG4gICAgXCJ0dGZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtdHRmXCIsXG4gICAgXCJ0dGxcIjogXCJ0ZXh0L3R1cnRsZVwiLFxuICAgIFwidHdkXCI6IFwiYXBwbGljYXRpb24vdm5kLnNpbXRlY2gtbWluZG1hcHBlclwiLFxuICAgIFwidHdkc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5zaW10ZWNoLW1pbmRtYXBwZXJcIixcbiAgICBcInR4ZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5nZW5vbWF0aXgudHV4ZWRvXCIsXG4gICAgXCJ0eGZcIjogXCJhcHBsaWNhdGlvbi92bmQubW9iaXVzLnR4ZlwiLFxuICAgIFwidHh0XCI6IFwidGV4dC9wbGFpblwiLFxuICAgIFwidTMyXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwidWRlYlwiOiBcImFwcGxpY2F0aW9uL3gtZGViaWFuLXBhY2thZ2VcIixcbiAgICBcInVmZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC51ZmRsXCIsXG4gICAgXCJ1ZmRsXCI6IFwiYXBwbGljYXRpb24vdm5kLnVmZGxcIixcbiAgICBcInVseFwiOiBcImFwcGxpY2F0aW9uL3gtZ2x1bHhcIixcbiAgICBcInVtalwiOiBcImFwcGxpY2F0aW9uL3ZuZC51bWFqaW5cIixcbiAgICBcInVuaXR5d2ViXCI6IFwiYXBwbGljYXRpb24vdm5kLnVuaXR5XCIsXG4gICAgXCJ1b21sXCI6IFwiYXBwbGljYXRpb24vdm5kLnVvbWwreG1sXCIsXG4gICAgXCJ1cmlcIjogXCJ0ZXh0L3VyaS1saXN0XCIsXG4gICAgXCJ1cmlzXCI6IFwidGV4dC91cmktbGlzdFwiLFxuICAgIFwidXJsc1wiOiBcInRleHQvdXJpLWxpc3RcIixcbiAgICBcInVzdGFyXCI6IFwiYXBwbGljYXRpb24veC11c3RhclwiLFxuICAgIFwidXR6XCI6IFwiYXBwbGljYXRpb24vdm5kLnVpcS50aGVtZVwiLFxuICAgIFwidXVcIjogXCJ0ZXh0L3gtdXVlbmNvZGVcIixcbiAgICBcInV2YVwiOiBcImF1ZGlvL3ZuZC5kZWNlLmF1ZGlvXCIsXG4gICAgXCJ1dmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dmZcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dmdcIjogXCJpbWFnZS92bmQuZGVjZS5ncmFwaGljXCIsXG4gICAgXCJ1dmhcIjogXCJ2aWRlby92bmQuZGVjZS5oZFwiLFxuICAgIFwidXZpXCI6IFwiaW1hZ2Uvdm5kLmRlY2UuZ3JhcGhpY1wiLFxuICAgIFwidXZtXCI6IFwidmlkZW8vdm5kLmRlY2UubW9iaWxlXCIsXG4gICAgXCJ1dnBcIjogXCJ2aWRlby92bmQuZGVjZS5wZFwiLFxuICAgIFwidXZzXCI6IFwidmlkZW8vdm5kLmRlY2Uuc2RcIixcbiAgICBcInV2dFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnR0bWwreG1sXCIsXG4gICAgXCJ1dnVcIjogXCJ2aWRlby92bmQudXZ2dS5tcDRcIixcbiAgICBcInV2dlwiOiBcInZpZGVvL3ZuZC5kZWNlLnZpZGVvXCIsXG4gICAgXCJ1dnZhXCI6IFwiYXVkaW8vdm5kLmRlY2UuYXVkaW9cIixcbiAgICBcInV2dmRcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS5kYXRhXCIsXG4gICAgXCJ1dnZmXCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuZGF0YVwiLFxuICAgIFwidXZ2Z1wiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2dmhcIjogXCJ2aWRlby92bmQuZGVjZS5oZFwiLFxuICAgIFwidXZ2aVwiOiBcImltYWdlL3ZuZC5kZWNlLmdyYXBoaWNcIixcbiAgICBcInV2dm1cIjogXCJ2aWRlby92bmQuZGVjZS5tb2JpbGVcIixcbiAgICBcInV2dnBcIjogXCJ2aWRlby92bmQuZGVjZS5wZFwiLFxuICAgIFwidXZ2c1wiOiBcInZpZGVvL3ZuZC5kZWNlLnNkXCIsXG4gICAgXCJ1dnZ0XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UudHRtbCt4bWxcIixcbiAgICBcInV2dnVcIjogXCJ2aWRlby92bmQudXZ2dS5tcDRcIixcbiAgICBcInV2dnZcIjogXCJ2aWRlby92bmQuZGVjZS52aWRlb1wiLFxuICAgIFwidXZ2eFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5kZWNlLnVuc3BlY2lmaWVkXCIsXG4gICAgXCJ1dnZ6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuemlwXCIsXG4gICAgXCJ1dnhcIjogXCJhcHBsaWNhdGlvbi92bmQuZGVjZS51bnNwZWNpZmllZFwiLFxuICAgIFwidXZ6XCI6IFwiYXBwbGljYXRpb24vdm5kLmRlY2UuemlwXCIsXG4gICAgXCJ2Y2FyZFwiOiBcInRleHQvdmNhcmRcIixcbiAgICBcInZjZFwiOiBcImFwcGxpY2F0aW9uL3gtY2RsaW5rXCIsXG4gICAgXCJ2Y2ZcIjogXCJ0ZXh0L3gtdmNhcmRcIixcbiAgICBcInZjZ1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5ncm9vdmUtdmNhcmRcIixcbiAgICBcInZjc1wiOiBcInRleHQveC12Y2FsZW5kYXJcIixcbiAgICBcInZjeFwiOiBcImFwcGxpY2F0aW9uL3ZuZC52Y3hcIixcbiAgICBcInZpc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb25hcnlcIixcbiAgICBcInZpdlwiOiBcInZpZGVvL3ZuZC52aXZvXCIsXG4gICAgXCJ2b2JcIjogXCJ2aWRlby94LW1zLXZvYlwiLFxuICAgIFwidm9yXCI6IFwiYXBwbGljYXRpb24vdm5kLnN0YXJkaXZpc2lvbi53cml0ZXJcIixcbiAgICBcInZveFwiOiBcImFwcGxpY2F0aW9uL3gtYXV0aG9yd2FyZS1iaW5cIixcbiAgICBcInZybWxcIjogXCJtb2RlbC92cm1sXCIsXG4gICAgXCJ2c2RcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZzZlwiOiBcImFwcGxpY2F0aW9uL3ZuZC52c2ZcIixcbiAgICBcInZzc1wiOiBcImFwcGxpY2F0aW9uL3ZuZC52aXNpb1wiLFxuICAgIFwidnN0XCI6IFwiYXBwbGljYXRpb24vdm5kLnZpc2lvXCIsXG4gICAgXCJ2c3dcIjogXCJhcHBsaWNhdGlvbi92bmQudmlzaW9cIixcbiAgICBcInZ0dVwiOiBcIm1vZGVsL3ZuZC52dHVcIixcbiAgICBcInZ4bWxcIjogXCJhcHBsaWNhdGlvbi92b2ljZXhtbCt4bWxcIixcbiAgICBcInczZFwiOiBcImFwcGxpY2F0aW9uL3gtZGlyZWN0b3JcIixcbiAgICBcIndhZFwiOiBcImFwcGxpY2F0aW9uL3gtZG9vbVwiLFxuICAgIFwid2F2XCI6IFwiYXVkaW8veC13YXZcIixcbiAgICBcIndheFwiOiBcImF1ZGlvL3gtbXMtd2F4XCIsXG4gICAgXCJ3Ym1wXCI6IFwiaW1hZ2Uvdm5kLndhcC53Ym1wXCIsXG4gICAgXCJ3YnNcIjogXCJhcHBsaWNhdGlvbi92bmQuY3JpdGljYWx0b29scy53YnMreG1sXCIsXG4gICAgXCJ3YnhtbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53YXAud2J4bWxcIixcbiAgICBcIndjbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy13b3Jrc1wiLFxuICAgIFwid2RiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3ZHBcIjogXCJpbWFnZS92bmQubXMtcGhvdG9cIixcbiAgICBcIndlYmFcIjogXCJhdWRpby93ZWJtXCIsXG4gICAgXCJ3ZWJtXCI6IFwidmlkZW8vd2VibVwiLFxuICAgIFwid2VicFwiOiBcImltYWdlL3dlYnBcIixcbiAgICBcIndnXCI6IFwiYXBwbGljYXRpb24vdm5kLnBtaS53aWRnZXRcIixcbiAgICBcIndndFwiOiBcImFwcGxpY2F0aW9uL3dpZGdldFwiLFxuICAgIFwid2tzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXdvcmtzXCIsXG4gICAgXCJ3bVwiOiBcInZpZGVvL3gtbXMtd21cIixcbiAgICBcIndtYVwiOiBcImF1ZGlvL3gtbXMtd21hXCIsXG4gICAgXCJ3bWRcIjogXCJhcHBsaWNhdGlvbi94LW1zLXdtZFwiLFxuICAgIFwid21mXCI6IFwiYXBwbGljYXRpb24veC1tc21ldGFmaWxlXCIsXG4gICAgXCJ3bWxcIjogXCJ0ZXh0L3ZuZC53YXAud21sXCIsXG4gICAgXCJ3bWxjXCI6IFwiYXBwbGljYXRpb24vdm5kLndhcC53bWxjXCIsXG4gICAgXCJ3bWxzXCI6IFwidGV4dC92bmQud2FwLndtbHNjcmlwdFwiLFxuICAgIFwid21sc2NcIjogXCJhcHBsaWNhdGlvbi92bmQud2FwLndtbHNjcmlwdGNcIixcbiAgICBcIndtdlwiOiBcInZpZGVvL3gtbXMtd212XCIsXG4gICAgXCJ3bXhcIjogXCJ2aWRlby94LW1zLXdteFwiLFxuICAgIFwid216XCI6IFwiYXBwbGljYXRpb24veC1tcy13bXpcIixcbiAgICBcIndvZmZcIjogXCJhcHBsaWNhdGlvbi94LWZvbnQtd29mZlwiLFxuICAgIFwid3BkXCI6IFwiYXBwbGljYXRpb24vdm5kLndvcmRwZXJmZWN0XCIsXG4gICAgXCJ3cGxcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd3BsXCIsXG4gICAgXCJ3cHNcIjogXCJhcHBsaWNhdGlvbi92bmQubXMtd29ya3NcIixcbiAgICBcIndxZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC53cWRcIixcbiAgICBcIndyaVwiOiBcImFwcGxpY2F0aW9uL3gtbXN3cml0ZVwiLFxuICAgIFwid3JsXCI6IFwibW9kZWwvdnJtbFwiLFxuICAgIFwid3NkbFwiOiBcImFwcGxpY2F0aW9uL3dzZGwreG1sXCIsXG4gICAgXCJ3c3BvbGljeVwiOiBcImFwcGxpY2F0aW9uL3dzcG9saWN5K3htbFwiLFxuICAgIFwid3RiXCI6IFwiYXBwbGljYXRpb24vdm5kLndlYnR1cmJvXCIsXG4gICAgXCJ3dnhcIjogXCJ2aWRlby94LW1zLXd2eFwiLFxuICAgIFwieDMyXCI6IFwiYXBwbGljYXRpb24veC1hdXRob3J3YXJlLWJpblwiLFxuICAgIFwieDNkXCI6IFwibW9kZWwveDNkK3htbFwiLFxuICAgIFwieDNkYlwiOiBcIm1vZGVsL3gzZCtiaW5hcnlcIixcbiAgICBcIngzZGJ6XCI6IFwibW9kZWwveDNkK2JpbmFyeVwiLFxuICAgIFwieDNkdlwiOiBcIm1vZGVsL3gzZCt2cm1sXCIsXG4gICAgXCJ4M2R2elwiOiBcIm1vZGVsL3gzZCt2cm1sXCIsXG4gICAgXCJ4M2R6XCI6IFwibW9kZWwveDNkK3htbFwiLFxuICAgIFwieGFtbFwiOiBcImFwcGxpY2F0aW9uL3hhbWwreG1sXCIsXG4gICAgXCJ4YXBcIjogXCJhcHBsaWNhdGlvbi94LXNpbHZlcmxpZ2h0LWFwcFwiLFxuICAgIFwieGFyXCI6IFwiYXBwbGljYXRpb24vdm5kLnhhcmFcIixcbiAgICBcInhiYXBcIjogXCJhcHBsaWNhdGlvbi94LW1zLXhiYXBcIixcbiAgICBcInhiZFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzLmJpbmRlclwiLFxuICAgIFwieGJtXCI6IFwiaW1hZ2UveC14Yml0bWFwXCIsXG4gICAgXCJ4ZGZcIjogXCJhcHBsaWNhdGlvbi94Y2FwLWRpZmYreG1sXCIsXG4gICAgXCJ4ZG1cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sLmRtK3htbFwiLFxuICAgIFwieGRwXCI6IFwiYXBwbGljYXRpb24vdm5kLmFkb2JlLnhkcCt4bWxcIixcbiAgICBcInhkc3NjXCI6IFwiYXBwbGljYXRpb24vZHNzYyt4bWxcIixcbiAgICBcInhkd1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5mdWppeGVyb3guZG9jdXdvcmtzXCIsXG4gICAgXCJ4ZW5jXCI6IFwiYXBwbGljYXRpb24veGVuYyt4bWxcIixcbiAgICBcInhlclwiOiBcImFwcGxpY2F0aW9uL3BhdGNoLW9wcy1lcnJvcit4bWxcIixcbiAgICBcInhmZGZcIjogXCJhcHBsaWNhdGlvbi92bmQuYWRvYmUueGZkZlwiLFxuICAgIFwieGZkbFwiOiBcImFwcGxpY2F0aW9uL3ZuZC54ZmRsXCIsXG4gICAgXCJ4aHRcIjogXCJhcHBsaWNhdGlvbi94aHRtbCt4bWxcIixcbiAgICBcInhodG1sXCI6IFwiYXBwbGljYXRpb24veGh0bWwreG1sXCIsXG4gICAgXCJ4aHZtbFwiOiBcImFwcGxpY2F0aW9uL3h2K3htbFwiLFxuICAgIFwieGlmXCI6IFwiaW1hZ2Uvdm5kLnhpZmZcIixcbiAgICBcInhsYVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxhbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsY1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxmXCI6IFwiYXBwbGljYXRpb24veC14bGlmZit4bWxcIixcbiAgICBcInhsbVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGxzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bHNiXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsLnNoZWV0LmJpbmFyeS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsc21cIjogXCJhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyXCIsXG4gICAgXCJ4bHN4XCI6IFwiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXRcIixcbiAgICBcInhsdFwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbFwiLFxuICAgIFwieGx0bVwiOiBcImFwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTJcIixcbiAgICBcInhsdHhcIjogXCJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC50ZW1wbGF0ZVwiLFxuICAgIFwieGx3XCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsXCIsXG4gICAgXCJ4bVwiOiBcImF1ZGlvL3htXCIsXG4gICAgXCJ4bWxcIjogXCJhcHBsaWNhdGlvbi94bWxcIixcbiAgICBcInhvXCI6IFwiYXBwbGljYXRpb24vdm5kLm9scGMtc3VnYXJcIixcbiAgICBcInhvcFwiOiBcImFwcGxpY2F0aW9uL3hvcCt4bWxcIixcbiAgICBcInhwaVwiOiBcImFwcGxpY2F0aW9uL3gteHBpbnN0YWxsXCIsXG4gICAgXCJ4cGxcIjogXCJhcHBsaWNhdGlvbi94cHJvYyt4bWxcIixcbiAgICBcInhwbVwiOiBcImltYWdlL3gteHBpeG1hcFwiLFxuICAgIFwieHByXCI6IFwiYXBwbGljYXRpb24vdm5kLmlzLXhwclwiLFxuICAgIFwieHBzXCI6IFwiYXBwbGljYXRpb24vdm5kLm1zLXhwc2RvY3VtZW50XCIsXG4gICAgXCJ4cHdcIjogXCJhcHBsaWNhdGlvbi92bmQuaW50ZXJjb24uZm9ybW5ldFwiLFxuICAgIFwieHB4XCI6IFwiYXBwbGljYXRpb24vdm5kLmludGVyY29uLmZvcm1uZXRcIixcbiAgICBcInhzbFwiOiBcImFwcGxpY2F0aW9uL3htbFwiLFxuICAgIFwieHNsdFwiOiBcImFwcGxpY2F0aW9uL3hzbHQreG1sXCIsXG4gICAgXCJ4c21cIjogXCJhcHBsaWNhdGlvbi92bmQuc3luY21sK3htbFwiLFxuICAgIFwieHNwZlwiOiBcImFwcGxpY2F0aW9uL3hzcGYreG1sXCIsXG4gICAgXCJ4dWxcIjogXCJhcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sXCIsXG4gICAgXCJ4dm1cIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInh2bWxcIjogXCJhcHBsaWNhdGlvbi94dit4bWxcIixcbiAgICBcInh3ZFwiOiBcImltYWdlL3gteHdpbmRvd2R1bXBcIixcbiAgICBcInh5elwiOiBcImNoZW1pY2FsL3gteHl6XCIsXG4gICAgXCJ4elwiOiBcImFwcGxpY2F0aW9uL3gteHpcIixcbiAgICBcInlhbWxcIjogXCJ0ZXh0L3lhbWxcIixcbiAgICBcInlhbmdcIjogXCJhcHBsaWNhdGlvbi95YW5nXCIsXG4gICAgXCJ5aW5cIjogXCJhcHBsaWNhdGlvbi95aW4reG1sXCIsXG4gICAgXCJ5bWxcIjogXCJ0ZXh0L3lhbWxcIixcbiAgICBcInpcIjogXCJhcHBsaWNhdGlvbi94LWNvbXByZXNzXCIsXG4gICAgXCJ6MVwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcInoyXCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejNcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6NFwiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno1XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiejZcIjogXCJhcHBsaWNhdGlvbi94LXptYWNoaW5lXCIsXG4gICAgXCJ6N1wiOiBcImFwcGxpY2F0aW9uL3gtem1hY2hpbmVcIixcbiAgICBcIno4XCI6IFwiYXBwbGljYXRpb24veC16bWFjaGluZVwiLFxuICAgIFwiemF6XCI6IFwiYXBwbGljYXRpb24vdm5kLnp6YXp6LmRlY2sreG1sXCIsXG4gICAgXCJ6aXBcIjogXCJhcHBsaWNhdGlvbi96aXBcIixcbiAgICBcInppclwiOiBcImFwcGxpY2F0aW9uL3ZuZC56dWxcIixcbiAgICBcInppcnpcIjogXCJhcHBsaWNhdGlvbi92bmQuenVsXCIsXG4gICAgXCJ6bW1cIjogXCJhcHBsaWNhdGlvbi92bmQuaGFuZGhlbGQtZW50ZXJ0YWlubWVudCt4bWxcIixcbiAgICBcIjEyM1wiOiBcImFwcGxpY2F0aW9uL3ZuZC5sb3R1cy0xLTItM1wiXG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWltZS10eXBlcy1tb2R1bGUuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5hc3luYyBmdW5jdGlvbiBhZnRlckZldGNoKHJlc3BvbnNlKSB7XG4gICAgaWYgKCFyZXNwb25zZSB8fCAhcmVzcG9uc2Uub2spIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgYmFkIHJlc3BvbnNlIDogJHtKU09OLnN0cmluZ2lmeShyZXNwb25zZSl9YCk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSB8fCAnYXBwbGljYXRpb24vanNvbic7XG4gICAgbGV0IHNjaSA9IHJlY2VpdmVkQ29udGVudFR5cGUuaW5kZXhPZignOycpO1xuICAgIGlmIChzY2kgPj0gMClcbiAgICAgICAgcmVjZWl2ZWRDb250ZW50VHlwZSA9IHJlY2VpdmVkQ29udGVudFR5cGUuc3Vic3RyKDAsIHNjaSk7XG4gICAgaWYgKHJlY2VpdmVkQ29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nKVxuICAgICAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcbn1cbmZ1bmN0aW9uIGdldERhdGEodXJsLCBoZWFkZXJzID0gbnVsbCkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIG1vZGU6ICdjb3JzJyxcbiAgICAgICAgY2FjaGU6ICduby1jYWNoZScsXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICByZWRpcmVjdDogJ2ZvbGxvdycsXG4gICAgICAgIHJlZmVycmVyOiAnbm8tcmVmZXJyZXInXG4gICAgfTtcbiAgICBpZiAoaGVhZGVycylcbiAgICAgICAgb3B0aW9ucy5oZWFkZXJzID0gaGVhZGVycztcbiAgICByZXR1cm4gZmV0Y2godXJsLCBvcHRpb25zKVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMuZ2V0RGF0YSA9IGdldERhdGE7XG5mdW5jdGlvbiBwb3N0RGF0YSh1cmwsIGRhdGEgPSB7fSwgY29udGVudFR5cGUgPSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICByZXR1cm4gZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucG9zdERhdGEgPSBwb3N0RGF0YTtcbmZ1bmN0aW9uIHB1dERhdGEodXJsLCBkYXRhID0ge30sIGNvbnRlbnRUeXBlID0gJ2FwcGxpY2F0aW9uL2pzb24nKSB7XG4gICAgcmV0dXJuIGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6ICdQVVQnLFxuICAgICAgICBtb2RlOiAnY29ycycsXG4gICAgICAgIGNhY2hlOiAnbm8tY2FjaGUnLFxuICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgcmVkaXJlY3Q6ICdmb2xsb3cnLFxuICAgICAgICByZWZlcnJlcjogJ25vLXJlZmVycmVyJyxcbiAgICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBjb250ZW50VHlwZSB9LFxuICAgICAgICBib2R5OiBjb250ZW50VHlwZSA9PSAnYXBwbGljYXRpb24vanNvbicgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IGRhdGFcbiAgICB9KVxuICAgICAgICAudGhlbihhZnRlckZldGNoKTtcbn1cbmV4cG9ydHMucHV0RGF0YSA9IHB1dERhdGE7XG5mdW5jdGlvbiBkZWxldGVEYXRhKHVybCwgZGF0YSA9IHt9LCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIHJldHVybiBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgbW9kZTogJ2NvcnMnLFxuICAgICAgICBjYWNoZTogJ25vLWNhY2hlJyxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIHJlZGlyZWN0OiAnZm9sbG93JyxcbiAgICAgICAgcmVmZXJyZXI6ICduby1yZWZlcnJlcicsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogY29udGVudFR5cGUgfSxcbiAgICAgICAgYm9keTogY29udGVudFR5cGUgPT0gJ2FwcGxpY2F0aW9uL2pzb24nID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBkYXRhXG4gICAgfSlcbiAgICAgICAgLnRoZW4oYWZ0ZXJGZXRjaCk7XG59XG5leHBvcnRzLmRlbGV0ZURhdGEgPSBkZWxldGVEYXRhO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bmV0d29yay5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IE5ldHdvcmsgPSByZXF1aXJlKFwiLi9uZXR3b3JrXCIpO1xuZXhwb3J0cy5IRVhBX0JBQ0tVUF9CQVNFX1VSTCA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PSBcImhvbWUubHRlY29uc3VsdGluZy5mclwiID8gXCJodHRwczovL2hvbWUubHRlY29uc3VsdGluZy5mclwiIDogXCJodHRwczovL2xvY2FsaG9zdDo1MDA1XCI7XG5hc3luYyBmdW5jdGlvbiBzZWFyY2goc2VhcmNoVGV4dCwgbWltZVR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBsZXQgc2VhcmNoU3BlYyA9IHtcbiAgICAgICAgICAgIG5hbWU6IHNlYXJjaFRleHQsXG4gICAgICAgICAgICBtaW1lVHlwZTogbWltZVR5cGVcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgeyByZXN1bHREaXJlY3RvcmllcywgcmVzdWx0RmlsZXNkZGQsIGl0ZW1zIH0gPSBhd2FpdCBOZXR3b3JrLnBvc3REYXRhKGAke2V4cG9ydHMuSEVYQV9CQUNLVVBfQkFTRV9VUkx9L3NlYXJjaGAsIHNlYXJjaFNwZWMpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlyZWN0b3JpZXM6IHJlc3VsdERpcmVjdG9yaWVzLFxuICAgICAgICAgICAgZmlsZXM6IHJlc3VsdEZpbGVzZGRkLFxuICAgICAgICAgICAgaXRlbXNcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLnNlYXJjaCA9IHNlYXJjaDtcbmFzeW5jIGZ1bmN0aW9uIGdldERpcmVjdG9yeURlc2NyaXB0b3Ioc2hhKSB7XG4gICAgcmV0dXJuIGF3YWl0IE5ldHdvcmsuZ2V0RGF0YShgJHtleHBvcnRzLkhFWEFfQkFDS1VQX0JBU0VfVVJMfS9zaGEvJHtzaGF9L2NvbnRlbnQ/dHlwZT1hcHBsaWNhdGlvbi9qc29uYCk7XG59XG5leHBvcnRzLmdldERpcmVjdG9yeURlc2NyaXB0b3IgPSBnZXREaXJlY3RvcnlEZXNjcmlwdG9yO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cmVzdC5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRlbXBsYXRlc18xID0gcmVxdWlyZShcIi4vdGVtcGxhdGVzXCIpO1xuY29uc3QgdGVtcGxhdGVIdG1sID0gYFxuPGRpdiBjbGFzcz0nbXVpLWNvbnRhaW5lci1mbHVpZCc+XG4gICAgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgPGgxIHgtaWQ9XCJ0aXRsZVwiIGNsYXNzPVwiYW5pbWF0ZWQtLXF1aWNrXCI+UmFjY29vbjwvaDE+XG4gICAgICAgIDxoNCB4LWlkPVwic3ViVGl0bGVcIj5TZWFyY2ggZm9yIHNvbmdzPC9oND5cbiAgICAgICAgPGZvcm0geC1pZD1cImZvcm1cIiBjbGFzcz1cIm11aS1mb3JtLS1pbmxpbmVcIj5cbiAgICAgICAgICAgIDwhLS10aGlzIGlzIGEgbGl0dGxlIGhhY2sgdG8gaGF2ZSB0aGluZ3MgY2VudGVyZWQtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdWktYnRuIG11aS1idG4tLWZsYXRcIiBzdHlsZT1cInZpc2liaWxpdHk6IGhpZGRlbjtcIj7wn5SNPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXVpLXRleHRmaWVsZFwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB4LWlkPVwidGVybVwiIHR5cGU9XCJ0ZXh0XCIgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCIgYXV0b2ZvY3VzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHJvbGU9XCJzdWJtaXRcIiBjbGFzcz1cIm11aS1idG4gbXVpLWJ0bi0tZmxhdFwiPvCflI08L2J1dHRvbj5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgICA8YnIgLz5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLnNlYXJjaFBhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIGRpc3BsYXlUaXRsZTogKHRlbXBsYXRlLCBkaXNwbGF5ZWQpID0+IHtcbiAgICAgICAgaWYgKGRpc3BsYXllZCkge1xuICAgICAgICAgICAgdGVtcGxhdGUudGl0bGUuY2xhc3NMaXN0LnJlbW92ZSgnaGV4YS0tcmVkdWNlZCcpO1xuICAgICAgICAgICAgdGVtcGxhdGUuc3ViVGl0bGUuc3R5bGUuZGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlLnRpdGxlLmNsYXNzTGlzdC5hZGQoJ2hleGEtLXJlZHVjZWQnKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLnN1YlRpdGxlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2VhcmNoLXBhbmVsLmpzLm1hcCIsIu+7v1widXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGVtcGxhdGVzXzEgPSByZXF1aXJlKFwiLi90ZW1wbGF0ZXNcIik7XG5jb25zdCB0ZW1wbGF0ZUh0bWwgPSBgXG48ZGl2IGNsYXNzPSdtdWktY29udGFpbmVyLWZsdWlkJz5cbiAgICA8ZGl2IGNsYXNzPVwibXVpLS10ZXh0LWNlbnRlclwiPlxuICAgICAgICA8aDIgeC1pZD1cInRpdGxlXCI+PC9oMj5cbiAgICAgICAgPGRpdiB4LWlkPVwiaXRlbXNcIj48L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PmA7XG5leHBvcnRzLnNlYXJjaFJlc3VsdFBhbmVsID0ge1xuICAgIGNyZWF0ZTogKCkgPT4gdGVtcGxhdGVzXzEuY3JlYXRlVGVtcGxhdGVJbnN0YW5jZSh0ZW1wbGF0ZUh0bWwpLFxuICAgIGRpc3BsYXlTZWFyY2hpbmc6IChlbGVtZW50cywgdGVybSkgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIm11aS0tdGV4dC1kYXJrLWhpbnRcIj5TZWFyY2hpbmcgJyR7dGVybX0nIC4uLjwvZGl2PmA7XG4gICAgICAgIGVsZW1lbnRzLml0ZW1zLmlubmVySFRNTCA9IGBgO1xuICAgIH0sXG4gICAgc2V0VmFsdWVzOiAoZWxlbWVudHMsIHZhbHVlcykgPT4ge1xuICAgICAgICBlbGVtZW50cy50aXRsZS5pbm5lckhUTUwgPSBgUmVzdWx0cyBmb3IgJyR7dmFsdWVzLnRlcm19J2A7XG4gICAgICAgIGlmICh2YWx1ZXMuaXRlbXMgJiYgdmFsdWVzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gdmFsdWVzLml0ZW1zLm1hcChmID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZi5taW1lVHlwZSA9PSAnYXBwbGljYXRpb24vZGlyZWN0b3J5JylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPVwib25jbGlja1wiPjxpPiR7Zi5uYW1lfSAuLi48L2k+PC9kaXY+YDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYDxkaXYgeC1mb3Itc2hhPVwiJHtmLnNoYS5zdWJzdHIoMCwgNSl9XCIgY2xhc3M9XCJvbmNsaWNrXCI+JHtmLm5hbWV9PC9kaXY+YDtcbiAgICAgICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudHMuaXRlbXMuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCJtdWktLXRleHQtZGFyay1oaW50XCI+Tm8gcmVzdWx0czwvZGl2PmA7XG4gICAgICAgIH1cbiAgICB9LFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlYXJjaC1yZXN1bHQtcGFuZWwuanMubWFwIiwi77u/XCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBVaVRvb2xzID0gcmVxdWlyZShcIi4vdWktdG9vbFwiKTtcbmNvbnN0IGVsZW1lbnRzRGF0YSA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4ob2JqLCBodG1sKSB7XG4gICAgbGV0IHJvb3QgPSBVaVRvb2xzLmVsRnJvbUh0bWwoaHRtbCk7XG4gICAgb2JqWydyb290J10gPSByb290O1xuICAgIFVpVG9vbHMuZWxzKHJvb3QsIGBbeC1pZF1gKS5mb3JFYWNoKGUgPT4gb2JqW2UuZ2V0QXR0cmlidXRlKCd4LWlkJyldID0gZSk7XG4gICAgZWxlbWVudHNEYXRhLnNldChyb290LCBvYmopO1xuICAgIHJldHVybiByb290O1xufVxuZXhwb3J0cy5jcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW4gPSBjcmVhdGVFbGVtZW50QW5kTG9jYXRlQ2hpbGRyZW47XG5mdW5jdGlvbiBnZXRUZW1wbGF0ZUluc3RhbmNlRGF0YShyb290KSB7XG4gICAgY29uc3QgZGF0YSA9IGVsZW1lbnRzRGF0YS5nZXQocm9vdCk7XG4gICAgcmV0dXJuIGRhdGE7XG59XG5leHBvcnRzLmdldFRlbXBsYXRlSW5zdGFuY2VEYXRhID0gZ2V0VGVtcGxhdGVJbnN0YW5jZURhdGE7XG5mdW5jdGlvbiBjcmVhdGVUZW1wbGF0ZUluc3RhbmNlKGh0bWwpIHtcbiAgICBsZXQgcm9vdCA9IGNyZWF0ZUVsZW1lbnRBbmRMb2NhdGVDaGlsZHJlbih7fSwgaHRtbCk7XG4gICAgcmV0dXJuIGdldFRlbXBsYXRlSW5zdGFuY2VEYXRhKHJvb3QpO1xufVxuZXhwb3J0cy5jcmVhdGVUZW1wbGF0ZUluc3RhbmNlID0gY3JlYXRlVGVtcGxhdGVJbnN0YW5jZTtcbmNvbnN0IEVNUFRZX0xPQ0FUSU9OID0geyBlbGVtZW50OiBudWxsLCBjaGlsZEluZGV4OiAtMSB9O1xuZnVuY3Rpb24gdGVtcGxhdGVHZXRFdmVudExvY2F0aW9uKGVsZW1lbnRzLCBldmVudCkge1xuICAgIGxldCBlbHMgPSBuZXcgU2V0KE9iamVjdC52YWx1ZXMoZWxlbWVudHMpKTtcbiAgICBsZXQgYyA9IGV2ZW50LnRhcmdldDtcbiAgICBsZXQgcCA9IG51bGw7XG4gICAgZG8ge1xuICAgICAgICBpZiAoZWxzLmhhcyhjKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBjLFxuICAgICAgICAgICAgICAgIGNoaWxkSW5kZXg6IHAgJiYgQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChjLmNoaWxkcmVuLCBwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYyA9PSBlbGVtZW50cy5yb290KVxuICAgICAgICAgICAgcmV0dXJuIEVNUFRZX0xPQ0FUSU9OO1xuICAgICAgICBwID0gYztcbiAgICAgICAgYyA9IGMucGFyZW50RWxlbWVudDtcbiAgICB9IHdoaWxlIChjKTtcbiAgICByZXR1cm4gRU1QVFlfTE9DQVRJT047XG59XG5leHBvcnRzLnRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbiA9IHRlbXBsYXRlR2V0RXZlbnRMb2NhdGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRlbXBsYXRlcy5qcy5tYXAiLCLvu79cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIGVsKGlkKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbn1cbmV4cG9ydHMuZWwgPSBlbDtcbmZ1bmN0aW9uIGVscyhlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufVxuZXhwb3J0cy5lbHMgPSBlbHM7XG5mdW5jdGlvbiBlbEZyb21IdG1sKGh0bWwpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBwYXJlbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gcGFyZW50LmNoaWxkcmVuLml0ZW0oMCk7XG59XG5leHBvcnRzLmVsRnJvbUh0bWwgPSBlbEZyb21IdG1sO1xuZnVuY3Rpb24gc3RvcEV2ZW50KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbn1cbmV4cG9ydHMuc3RvcEV2ZW50ID0gc3RvcEV2ZW50O1xuZnVuY3Rpb24qIGl0ZXJfcGF0aF90b19yb290X2VsZW1lbnQoc3RhcnQpIHtcbiAgICB3aGlsZSAoc3RhcnQpIHtcbiAgICAgICAgeWllbGQgc3RhcnQ7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQucGFyZW50RWxlbWVudDtcbiAgICB9XG59XG5leHBvcnRzLml0ZXJfcGF0aF90b19yb290X2VsZW1lbnQgPSBpdGVyX3BhdGhfdG9fcm9vdF9lbGVtZW50O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dWktdG9vbC5qcy5tYXAiXSwic291cmNlUm9vdCI6IiJ9
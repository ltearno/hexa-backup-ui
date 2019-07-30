!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=new WeakMap;function o(e,t){let n=i.els(e,`[x-id=${t}]`);return n.length?n.item(0):null}function a(e,t){let n=i.elFromHtml(e),a={root:n};for(let e of t)a[e]=o(n,e);return r.set(n,a),n}function s(e){return r.get(e)}t.createElementAndLocateChildren=a,t.getTemplateInstanceData=s,t.createTemplateInstance=function(e,t){return s(a(e,t))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.el=function(e){return document.getElementById(e)},t.els=function(e,t){return e.querySelectorAll(t)},t.elFromHtml=function(e){const t=document.createElement("div");return t.innerHTML=e,t.children.item(0)},t.stopEvent=function(e){e.preventDefault(),e.stopPropagation()}},function(e,t,n){"use strict";async function i(e){if(!e||!e.ok)return console.error(`bad response : ${JSON.stringify(e)}`),null;let t=e.headers.get("Content-Type")||"application/json",n=t.indexOf(";");return n>=0&&(t=t.substr(0,n)),"application/json"==t?await e.json():await e.text()}Object.defineProperty(t,"__esModule",{value:!0}),t.getData=function(e,t=null){return fetch(e,{method:"GET",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:t}).then(i)},t.postData=function(e,t={},n="application/json"){return fetch(e,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)},t.putData=function(e,t={},n="application/json"){return fetch(e,{method:"PUT",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)},t.deleteData=function(e,t={},n="application/json"){return fetch(e,{method:"DELETE",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=n(4),o=n(5),a=n(6),s=n(7),l=n(8);let c=[];function u(e){c.push(e),i.el("content-wrapper").appendChild(e)}const d=r.searchPanel.create(),f=o.filesPanel.create(),h=a.audioPanel.create();document.body.appendChild(h.root),u(d.root);const p=new a.AudioJukebox(h);window.playAudio=async function(e,t,n){p.addAndPlay({name:e,sha:t,mimeType:n})},l.autoRenewAuth(),d.form.addEventListener("submit",async e=>{i.stopEvent(e);let t=d.term.value;r.searchPanel.displayTitle(d,!1),o.filesPanel.displaySearching(f,t);let n=await s.search(t,"audio/%");o.filesPanel.setValues(f,{term:d.term.value,files:n.files}),f.root.isConnected||u(f.root)})},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.searchPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h1 x-id="title" class="animated--quick">Raccoon</h1>\n        <form x-id="form" class="mui-form--inline">\n            \x3c!--this is a little hack to have things centered--\x3e\n            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>\n            <div class="mui-textfield">\n                <input x-id="term" type="text" autofocus>\n            </div>\n            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>\n        </form>\n        <br /><a href="#">Browse</a> - <a href="#">Settings</a>\n    </div>\n</div>',["title","form","term"]),displayTitle:(e,t)=>{t?e.title.classList.remove("hexa--reduced"):e.title.classList.add("hexa--reduced")}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.filesPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h2>Results for \'<span x-id="term"></span>\'</h2>\n        <div x-id="files"></div>\n    </div>\n</div>',["term","files"]),displaySearching:(e,t)=>{e.term.innerText=t,e.files.innerHTML='<div class="mui--text-dark-hint">Searching ...</div>'},setValues:(e,t)=>{e.term.innerText=t.term,t.files&&t.files.length?e.files.innerHTML=t.files.map(e=>`<div onclick='playAudio("${e.name}", "${e.sha}", "${e.mimeType}")'>${e.name}</div>`).join(""):e.files.innerHTML='<div class="mui--text-dark-hint">No results</div>'}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0),r=n(7);t.audioPanel={create:()=>i.createTemplateInstance('\n<div class="audio-footer mui-panel is-hidden">\n    <div x-id="playlist"></div>\n    <h3 x-id="title"></h3>\n    <audio x-id="player" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>\n</div>',["title","player"]),play:(e,t,n,i)=>{e.title.innerText=t,e.player.setAttribute("src",`${r.HEXA_BACKUP_BASE_URL}/sha/${n}/content?type=${i}`),e.player.setAttribute("type",i),e.root.classList.remove("is-hidden"),e.player.play()},setPlaylist(e,t){e.playlist.innerHTML=t}};t.AudioJukebox=class{constructor(e){this.audioPanel=e,this.queue=[],this.currentItem=null,this.audioPanel.player.addEventListener("ended",()=>{let e=this.currentIndex();++e<this.queue.length-1&&this.play(this.queue[e])})}currentIndex(){return this.queue.indexOf(this.currentItem)}addAndPlay(e){let t=this.currentIndex();this.queue.length&&this.queue[0].sha==e.sha||(this.queue.splice(t,0,e),this.play(e)),console.log(JSON.stringify(this.queue)),console.log(this.currentIndex())}play(e){this.currentItem=e,t.audioPanel.setPlaylist(this.audioPanel,this.queue.map(e=>`<div>${e.name} ${e.mimeType} ${e.sha.substr(0,5)}</div>`).join("")),t.audioPanel.play(this.audioPanel,e.name,e.sha,e.mimeType)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(2);t.HEXA_BACKUP_BASE_URL="home.lteconsulting.fr"==window.location.hostname?"https://home.lteconsulting.fr":"https://localhost:5005",t.search=async function(e,n){try{let r={name:e,mimeType:n};const{resultDirectories:o,resultFilesddd:a}=await i.postData(`${t.HEXA_BACKUP_BASE_URL}/search`,r);return{directories:o,files:a}}catch(e){return null}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(2);function r(e){return new Promise(t=>setTimeout(t,e))}class o{onError(){window.location.reload()}async loop(){for(;;){try{let e=await i.postData("https://home.lteconsulting.fr/auth");if(e&&e.token){let t=await i.getData("https://home.lteconsulting.fr/well-known/v1/setCookie",{Authorization:`Bearer ${e.token}`});t&&t.lifetime||(console.error("cannot setCookie",t),this.onError())}else console.error("cannot obtain auth token"),this.onError()}catch(e){console.error(`cannot refresh auth (${e})`),this.onError()}await r(18e5)}}}t.autoRenewAuth=function(){(new o).loop()}}]);
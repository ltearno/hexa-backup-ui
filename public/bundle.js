!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=new WeakMap;function o(e,t){let n=i.els(e,`[x-id=${t}]`);return n.length?n.item(0):null}function s(e,t){let n=i.elFromHtml(e),s={root:n};for(let e of t)s[e]=o(n,e);return r.set(n,s),n}function a(e){return r.get(e)}t.createElementAndLocateChildren=s,t.getTemplateInstanceData=a,t.createTemplateInstance=function(e,t){return a(s(e,t))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.el=function(e){return document.getElementById(e)},t.els=function(e,t){return e.querySelectorAll(t)},t.elFromHtml=function(e){const t=document.createElement("div");return t.innerHTML=e,t.children.item(0)},t.stopEvent=function(e){e.preventDefault(),e.stopPropagation()}},function(e,t,n){"use strict";async function i(e){if(!e||!e.ok)return console.error(`bad response : ${JSON.stringify(e)}`),null;let t=e.headers.get("Content-Type")||"application/json",n=t.indexOf(";");return n>=0&&(t=t.substr(0,n)),"application/json"==t?await e.json():await e.text()}Object.defineProperty(t,"__esModule",{value:!0}),t.getData=function(e,t=null){return fetch(e,{method:"GET",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:t}).then(i)},t.postData=function(e,t={},n="application/json"){return fetch(e,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)},t.putData=function(e,t={},n="application/json"){return fetch(e,{method:"PUT",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)},t.deleteData=function(e,t={},n="application/json"){return fetch(e,{method:"DELETE",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=n(4),o=n(5),s=n(6),a=n(7),l=n(8);let c=[];function u(e){c.push(e),i.el("content-wrapper").appendChild(e)}const d=r.searchPanel.create(),h=o.filesPanel.create(),f=s.audioPanel.create();document.body.appendChild(f.root),u(d.root);const p=new s.AudioJukebox(f);l.autoRenewAuth();let m=null;d.form.addEventListener("submit",async e=>{i.stopEvent(e);let t=d.term.value;r.searchPanel.displayTitle(d,!1),o.filesPanel.displaySearching(h,t);let n=await a.search(t,"audio/%");m=n.files,o.filesPanel.setValues(h,{term:d.term.value,files:n.files}),h.root.isConnected||u(h.root)}),o.templateAddEventListener(h,"click",(e,t,n)=>{m&&t==h.files&&n>=0&&n<m.length&&p.addAndPlay(m[n]),console.log(`click ${t.getAttribute("x-id")}, child ${n}`)})},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.searchPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h1 x-id="title" class="animated--quick">Raccoon</h1>\n        <form x-id="form" class="mui-form--inline">\n            \x3c!--this is a little hack to have things centered--\x3e\n            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>\n            <div class="mui-textfield">\n                <input x-id="term" type="text" autofocus>\n            </div>\n            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>\n        </form>\n        <br /><a href="#">Browse</a> - <a href="#">Settings</a>\n    </div>\n</div>',["title","form","term"]),displayTitle:(e,t)=>{t?e.title.classList.remove("hexa--reduced"):e.title.classList.add("hexa--reduced")}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.templateAddEventListener=function(e,t,n){e.root.addEventListener(t,t=>{let i=new Set(Object.values(e)),r=t.target,o=null;do{if(i.has(r))return void n(t,r,o&&Array.prototype.indexOf.call(r.children,o));if(r==e.root)return;o=r,r=r.parentElement}while(r)})},t.filesPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h2>Results for \'<span x-id="term"></span>\'</h2>\n        <div x-id="files"></div>\n    </div>\n</div>',["term","files"]),displaySearching:(e,t)=>{e.term.innerText=t,e.files.innerHTML='<div class="mui--text-dark-hint">Searching ...</div>'},setValues:(e,t)=>{e.term.innerText=t.term,t.files&&t.files.length?e.files.innerHTML=t.files.map(e=>`<div>${e.name}</div>`).join(""):e.files.innerHTML='<div class="mui--text-dark-hint">No results</div>'}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0),r=n(7);t.audioPanel={create:()=>i.createTemplateInstance('\n<div class="audio-footer mui-panel is-hidden">\n    <div x-id="playlist" class="is-hidden is-fullwidth"></div>\n    <div><h3 x-id="title" style="display: inline;"></h3><span x-id="expander" class="onclick mui--pull-right">&nbsp;&nbsp;☰</span></div>\n    <audio x-id="player" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>\n</div>',["title","player","playlist","expander"]),play:(e,t,n,i)=>{e.title.innerText=t,e.player.setAttribute("src",`${r.HEXA_BACKUP_BASE_URL}/sha/${n}/content?type=${i}`),e.player.setAttribute("type",i),e.root.classList.remove("is-hidden"),e.player.play()},setPlaylist(e,t){e.playlist.innerHTML=t}};t.AudioJukebox=class{constructor(e){this.audioPanel=e,this.queue=[],this.currentIndex=-1,this.audioPanel.player.addEventListener("ended",()=>{this.currentIndex++,this.currentIndex<this.queue.length?this.play(this.currentIndex+1):this.stop()}),this.audioPanel.expander.addEventListener("click",()=>{this.audioPanel.playlist.classList.toggle("is-hidden")})}currentItem(){return this.currentIndex<0||this.currentIndex>=this.queue.length?null:this.queue[this.currentIndex]}addAndPlay(e){let t=this.currentItem();t&&t.sha==e.sha||(this.queue.push(e),this.play(this.queue.length-1))}stop(){this.play(-1)}play(e){if(this.currentIndex=e,this.currentIndex<0&&(this.currentIndex=-1),this.refreshPlaylist(),e>=0&&e<this.queue.length){const n=this.queue[e];t.audioPanel.play(this.audioPanel,n.name,n.sha,n.mimeType)}}refreshPlaylist(){let e="<h3>Playlist</h3>";for(let t=0;t<this.queue.length-1;t++)e+=`<div>${this.queue[t].name}</div>`;t.audioPanel.setPlaylist(this.audioPanel,e)}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(2);t.HEXA_BACKUP_BASE_URL="home.lteconsulting.fr"==window.location.hostname?"https://home.lteconsulting.fr":"https://localhost:5005",t.search=async function(e,n){try{let r={name:e,mimeType:n};const{resultDirectories:o,resultFilesddd:s}=await i.postData(`${t.HEXA_BACKUP_BASE_URL}/search`,r);return{directories:o,files:s}}catch(e){return null}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(2);function r(e){return new Promise(t=>setTimeout(t,e))}class o{onError(){window.location.reload()}async loop(){for(;;){try{let e=await i.postData("https://home.lteconsulting.fr/auth");if(e&&e.token){let t=await i.getData("https://home.lteconsulting.fr/well-known/v1/setCookie",{Authorization:`Bearer ${e.token}`});t&&t.lifetime||(console.error("cannot setCookie",t),this.onError())}else console.error("cannot obtain auth token"),this.onError()}catch(e){console.error(`cannot refresh auth (${e})`),this.onError()}await r(18e5)}}}t.autoRenewAuth=function(){(new o).loop()}}]);
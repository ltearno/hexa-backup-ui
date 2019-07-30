!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=3)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=new WeakMap;function a(e,t){let n=i.elFromHtml(t);return e.root=n,i.els(n,"[x-id]").forEach(t=>e[t.getAttribute("x-id")]=t),r.set(n,e),n}function l(e){return r.get(e)}t.createElementAndLocateChildren=a,t.getTemplateInstanceData=l,t.createTemplateInstance=function(e){return l(a({},e))};const s={element:null,childIndex:-1};t.templateGetEventLocation=function(e,t){let n=new Set(Object.values(e)),i=t.target,r=null;do{if(n.has(i))return{element:i,childIndex:r&&Array.prototype.indexOf.call(i.children,r)};if(i==e.root)return s;r=i,i=i.parentElement}while(i);return s}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.el=function(e){return document.getElementById(e)},t.els=function(e,t){return e.querySelectorAll(t)},t.elFromHtml=function(e){const t=document.createElement("div");return t.innerHTML=e,t.children.item(0)},t.stopEvent=function(e){e.preventDefault(),e.stopPropagation()}},function(e,t,n){"use strict";async function i(e){if(!e||!e.ok)return console.error(`bad response : ${JSON.stringify(e)}`),null;let t=e.headers.get("Content-Type")||"application/json",n=t.indexOf(";");return n>=0&&(t=t.substr(0,n)),"application/json"==t?await e.json():await e.text()}Object.defineProperty(t,"__esModule",{value:!0}),t.getData=function(e,t=null){return fetch(e,{method:"GET",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:t}).then(i)},t.postData=function(e,t={},n="application/json"){return fetch(e,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)},t.putData=function(e,t={},n="application/json"){return fetch(e,{method:"PUT",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)},t.deleteData=function(e,t={},n="application/json"){return fetch(e,{method:"DELETE",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t}).then(i)}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=n(4),a=n(5),l=n(6),s=n(7),o=n(8),c=n(0);let u=[];function d(e){u.push(e),i.el("content-wrapper").insertBefore(e,i.el("first-element-after-contents"))}const h=r.searchPanel.create(),f=a.filesPanel.create(),p=l.audioPanel.create();document.body.appendChild(p.root),d(h.root);const m=new l.AudioJukebox(p);o.autoRenewAuth();let y=null;h.form.addEventListener("submit",async e=>{i.stopEvent(e);let t=h.term.value;r.searchPanel.displayTitle(h,!1),a.filesPanel.displaySearching(f,t),f.root.isConnected||d(f.root);let n=await s.search(t,"audio/%");y=n.files,a.filesPanel.setValues(f,{term:h.term.value,files:n.files})}),f.root.addEventListener("click",e=>{let{element:t,childIndex:n}=c.templateGetEventLocation(f,e);y&&t==f.files&&n>=0&&n<y.length&&m.addAndPlay(y[n])})},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.searchPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h1 x-id="title" class="animated--quick">Raccoon</h1>\n        <form x-id="form" class="mui-form--inline">\n            \x3c!--this is a little hack to have things centered--\x3e\n            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>\n            <div class="mui-textfield">\n                <input placeholder="Search an audio title" x-id="term" type="text" autofocus>\n            </div>\n            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>\n        </form>\n        <br />\n    </div>\n</div>'),displayTitle:(e,t)=>{t?e.title.classList.remove("hexa--reduced"):e.title.classList.add("hexa--reduced")}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.filesPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h2>Results for \'<span x-id="term"></span>\'</h2>\n        <div x-id="files"></div>\n    </div>\n</div>'),displaySearching:(e,t)=>{e.term.innerText=t,e.files.innerHTML='<div class="mui--text-dark-hint">Searching ...</div>'},setValues:(e,t)=>{e.term.innerText=t.term,t.files&&t.files.length?e.files.innerHTML=t.files.map(e=>`<div class="onclick">${e.name}</div>`).join(""):e.files.innerHTML='<div class="mui--text-dark-hint">No results</div>'}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0),r=n(7);t.audioPanel={create:()=>i.createTemplateInstance('\n<div class="audio-footer mui-panel">\n    <div x-id="playlist" class="is-fullwidth mui--text-center"></div>\n    <div x-id="expander" class="onclick mui--text-center">☰</div>\n    <audio x-id="player" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>\n</div>'),play:(e,t,n,i)=>{e.player.setAttribute("src",`${r.HEXA_BACKUP_BASE_URL}/sha/${n}/content?type=${i}`),e.player.setAttribute("type",i),e.player.play(),e.root.classList.remove("is-hidden")}};t.AudioJukebox=class{constructor(e){this.audioPanel=e,this.largeDisplay=!1,this.queue=[],this.currentIndex=-1;try{let e=JSON.parse(localStorage.getItem("playlist-backup"));e&&e instanceof Array&&(this.queue=e)}catch(e){console.error("error",e)}this.audioPanel.player.addEventListener("ended",()=>{this.currentIndex+1<this.queue.length&&this.play(this.currentIndex+1)}),this.audioPanel.expander.addEventListener("click",()=>{this.largeDisplay=!this.largeDisplay,this.refreshPlaylist()}),this.audioPanel.root.addEventListener("click",e=>{const{element:t,childIndex:n}=i.templateGetEventLocation(this.audioPanel,e);if(t==this.audioPanel.playlist&&n>=0){let e=t.children.item(n).getAttribute("x-queue-index");e.length&&this.play(parseInt(e))}}),this.refreshPlaylist()}currentItem(){return this.currentIndex<0||this.currentIndex>=this.queue.length?null:this.queue[this.currentIndex]}addAndPlay(e){e={sha:e.sha,name:e.name,mimeType:e.mimeType};let t=this.currentItem();t&&t.sha==e.sha||(this.queue.push(e),localStorage.setItem("playlist-backup",JSON.stringify(this.queue)),this.currentIndex<0&&this.play(this.queue.length-1))}play(e){if(this.currentIndex=e,this.currentIndex<0&&(this.currentIndex=-1),this.refreshPlaylist(),e>=0&&e<this.queue.length){const n=this.queue[e];t.audioPanel.play(this.audioPanel,n.name,n.sha,n.mimeType)}}refreshPlaylist(){if(this.queue&&this.queue.length)if(this.largeDisplay){let e="<h3>Playlist</h3>";for(let t=0;t<this.queue.length;t++){let n=this.queue[t];e+=this.playlistItemHtml(t,n.name)}this.audioPanel.playlist.innerHTML=e}else this.currentIndex>=0&&this.currentIndex<this.queue.length?this.audioPanel.playlist.innerHTML=this.playlistItemHtml(this.currentIndex,this.queue[this.currentIndex].name):this.audioPanel.playlist.innerHTML="";else this.audioPanel.playlist.innerHTML=""}playlistItemHtml(e,t){return`<div x-queue-index="${e}" class="onclick ${e==this.currentIndex?"mui--text-headline":""}">${t}</div>`}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(2);t.HEXA_BACKUP_BASE_URL="home.lteconsulting.fr"==window.location.hostname?"https://home.lteconsulting.fr":"https://localhost:5005",t.search=async function(e,n){try{let r={name:e,mimeType:n};const{resultDirectories:a,resultFilesddd:l}=await i.postData(`${t.HEXA_BACKUP_BASE_URL}/search`,r);return{directories:a,files:l}}catch(e){return null}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(2);function r(e){return new Promise(t=>setTimeout(t,e))}class a{onError(){window.location.reload()}async loop(){for(;;){try{let e=await i.postData("https://home.lteconsulting.fr/auth");if(e&&e.token){let t=await i.getData("https://home.lteconsulting.fr/well-known/v1/setCookie",{Authorization:`Bearer ${e.token}`});t&&t.lifetime||(console.error("cannot setCookie",t),this.onError())}else console.error("cannot obtain auth token"),this.onError()}catch(e){console.error(`cannot refresh auth (${e})`),this.onError()}await r(18e5)}}}t.autoRenewAuth=function(){(new a).loop()}}]);
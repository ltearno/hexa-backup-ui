!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1);function r(e,t){let n=i.els(e,`[x-id=${t}]`);return n.length?n.item(0):null}const o="template-data";function a(e,t){let n=i.elFromHtml(e),a={root:n};for(let e of t)a[e]=r(n,e);return n[o]=a,n}function l(e){return e[o]}t.createElementAndLocateChildren=a,t.getTemplateInstanceData=l,t.createTemplateInstance=function(e,t){return l(a(e,t))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.el=function(e){return document.getElementById(e)},t.els=function(e,t){return e.querySelectorAll(t)},t.elFromHtml=function(e){const t=document.createElement("div");return t.innerHTML=e,t.children.item(0)},t.stopEvent=function(e){e.preventDefault(),e.stopPropagation()}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(1),r=n(3),o=n(4),a=n(5),l=n(6),s=r.searchPanel.create(),u=o.filesPanel.create(),c=a.audioPanel.create();document.body.appendChild(c.root),s.form.addEventListener("submit",async e=>{i.stopEvent(e);let t=s.term.value,n=await l.search(t,"audio/%");r.searchPanel.displayTitle(s,!1),o.filesPanel.setValues(u,{term:s.term.value,files:n.files}),u.root.isConnected||f(u.root)});let d=[];function f(e){d.push(e),i.el("content-wrapper").appendChild(e)}f(s.root);const p=new class{constructor(e){this.audioPanel=e,this.queue=[],this.currentItem=null,this.audioPanel.player.addEventListener("ended",()=>{let e=this.currentIndex();++e<this.queue.length-1&&this.play(this.queue[e])})}currentIndex(){return this.queue.indexOf(this.currentItem)}addAndPlay(e){let t=this.currentIndex();this.queue.length&&this.queue[0].sha==e.sha||(this.queue.splice(t,0,e),this.play(e)),console.log(JSON.stringify(this.queue)),console.log(this.currentIndex())}play(e){this.currentItem=e,this.audioPanel.title.innerText=e.name,this.audioPanel.player.setAttribute("src",`${l.HEXA_BACKUP_BASE_URL}/sha/${e.sha}/content?type=${e.mimeType}`),this.audioPanel.player.setAttribute("type",e.mimeType),this.audioPanel.root.classList.remove("is-hidden"),this.audioPanel.player.play()}}(c);window.playAudio=async function(e,t,n){p.addAndPlay({name:e,sha:t,mimeType:n})}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.searchPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h1 x-id="title">Raccoon</h1>\n        <form x-id="form" class="mui-form--inline">\n            \x3c!--this is a little hack to have things centered--\x3e\n            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>\n            <div class="mui-textfield">\n                <input x-id="term" type="text">\n            </div>\n            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>\n        </form>\n        <br /><a href="#">Browse</a> - <a href="#">Settings</a>\n    </div>\n</div>',["title","form","term"]),displayTitle:(e,t)=>{e.title.style.display=t?null:"none"}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.filesPanel={create:()=>i.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h2>Results for \'<span x-id="term"></span>\'</h2>\n        <div x-id="files"></div>\n    </div>\n</div>',["term","files"]),setValues:(e,t)=>{e.term.innerText=t.term,e.files.innerHTML=t.files.map(e=>`<div onclick='playAudio("${e.name}", "${e.sha}", "${e.mimeType}")'>${e.name}</div>`).join("")}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(0);t.audioPanel={create:()=>i.createTemplateInstance('\n<div class="audio-footer mui-panel is-hidden">\n    <h3 x-id="title"></h3>\n    <audio x-id="player" class="audio-player" class="mui--pull-right" controls preload="metadata"></audio>\n</div>',["title","player"])}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const i=n(7);t.HEXA_BACKUP_BASE_URL="home.lteconsulting.fr"==window.location.hostname?"https://home.lteconsulting.fr":"https://localhost:5005",t.search=async function(e,n){try{let r={name:e,mimeType:n};const{resultDirectories:o,resultFilesddd:a}=await i.postData(`${t.HEXA_BACKUP_BASE_URL}/search`,r);return{directories:o,files:a}}catch(e){return null}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.postData=async function(e,t,n="application/json"){let i=await fetch(e,{method:"POST",mode:"cors",cache:"no-cache",credentials:"same-origin",redirect:"follow",referrer:"no-referrer",headers:{"Content-Type":n},body:"application/json"==n?JSON.stringify(t):t});console.log("response",i);const r=await async function(e){if(!e||!e.ok)return console.error(`bad response : ${JSON.stringify(e)}`),null;let t=e.headers.get("Content-Type")||"application/json",n=t.indexOf(";");return n>=0&&(t=t.substr(0,n)),console.log(`received contenttype ${t}`),"application/json"==t?await e.json():await e.text()}(i);return console.log("result",r),r}}]);
!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(3);t.searchPanel={create:()=>r.createTemplateInstance('\n<div class=\'mui-container-fluid\'>\n    <div class="mui--text-center">\n        <h1>Raccoon</h1>\n        <form x-id="form" class="mui-form--inline">\n            \x3c!--this is a little hack to have things centered--\x3e\n            <div class="mui-btn mui-btn--flat" style="visibility: hidden;">🔍</div>\n            <div class="mui-textfield">\n                <input x-id="term" type="text">\n            </div>\n            <button role="submit" class="mui-btn mui-btn--flat">🔍</button>\n        </form>\n        <br /><a href="#">Browse</a> - <a href="#">Settings</a>\n    </div>\n</div>',["form","term"])}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.el=function(e){return document.getElementById(e)},t.els=function(e,t){return e.querySelectorAll(t)},t.elFromHtml=function(e){const t=document.createElement("div");return t.innerHTML=e,t.children.item(0)},t.stopEvent=function(e){e.preventDefault(),e.stopPropagation()}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1),o=n(0),i=n(4),l=o.searchPanel.create();l.form.addEventListener("submit",async e=>{r.stopEvent(e);let t=await i.search(l.term.value,"audio/%");c(r.elFromHtml(`<div>${t.files.map(e=>`<div>${e.name}</div>`).join("")}</div>`))});let u=[];function c(e){u.push(e),r.el("content-wrapper").appendChild(e)}c(l.root)},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r=n(1);function o(e,t){let n=r.els(e,`[x-id=${t}]`);return n.length?n.item(0):null}const i="template-data";function l(e,t){let n=r.elFromHtml(e),l={root:n};for(let e of t)l[e]=o(n,e);return n[i]=l,n}function u(e){return e[i]}t.createElementAndLocateChildren=l,t.getTemplateInstanceData=u,t.createTemplateInstance=function(e,t){return u(l(e,t))}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const r="home.lteconsulting.fr"==window.location.hostname?"https://home.lteconsulting.fr":"https://localhost:5005";t.search=async function(e,t){try{let n={name:e,mimeType:t};const o=new Headers;o.set("Content-Type","application/json");const i=await fetch(`${r}/search`,{headers:o,method:"post",body:JSON.stringify(n)}),{resultDirectories:l,resultFilesddd:u}=await i.json();return{directories:l,files:u}}catch(e){return null}}}]);
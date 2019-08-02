"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = require("./rest");
const templates_1 = require("./templates");
const wait = (duration) => new Promise(resolve => setTimeout(resolve, duration));
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2>Slideshow</h2>
        <div x-id="items" class="mui-panel x-slideshow"></div>
        speed: <input x-id="speed" type="range" min="100" max="3000" value="200"/>
        nb images: <input x-id="nbImages" type="range" min="1" max="100" value="12"/>
        interval: <input x-id="interval" type="range" min="0" max="100" value="50"/>
        <input x-id="date" type="range" min="-${365 * 20}" max="0" value="0" style="width:100%;"/>
        <div x-id="remark"></div>
    </div>
</div>`;
function create() {
    let els = templates_1.createTemplateInstance(templateHtml);
    (async () => {
        let possibleImages = [];
        let lastSearchDate = null;
        let lastSearchInterval = null;
        while (true) {
            let searchDate = (parseInt(els.date.value || '0')) * 1000 * 60 * 60 * 24;
            let interval = (parseInt(els.interval.value || '0')) * 1000 * 60 * 60 * 24;
            let center = new Date().getTime() + searchDate;
            if (lastSearchDate != center || lastSearchInterval != interval) {
                lastSearchDate = center;
                lastSearchInterval = interval;
                let searchSpec = {
                    mimeType: 'image/%',
                    noDirectory: true,
                    limit: 10
                };
                searchSpec.dateMin = center - interval;
                searchSpec.dateMax = center + interval;
                console.log(`do a search on ${center} +/- ${interval}`);
                const results = await Rest.searchEx(searchSpec);
                possibleImages = results && results.items;
                console.log(`has`, results);
            }
            if (possibleImages) {
                els.remark.innerHTML = `${possibleImages.length} possible images, date ${new Date(center)}`;
                let imageElement = null;
                if (els.items.children.length < parseInt(els.nbImages.value)) {
                    imageElement = document.createElement('img');
                    els.items.appendChild(imageElement);
                }
                else if (els.items.children.length > parseInt(els.nbImages.value)) {
                    imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length));
                    imageElement.parentElement.removeChild(imageElement);
                }
                else {
                    imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length));
                }
                let item = possibleImages[Math.floor(Math.random() * possibleImages.length)];
                if (item)
                    imageElement.src = Rest.getShaImageThumbnailUrl(item.sha, item.mimeType);
            }
            else {
                els.remark.innerHTML = `no possible image !`;
            }
            await wait(els.speed.value);
        }
    })();
    return els;
}
exports.create = create;
//# sourceMappingURL=slideshow.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rest = require("./rest");
const templates_1 = require("./templates");
const Messages = require("./messages");
const wait = (duration) => new Promise(resolve => setTimeout(resolve, duration));
const templateHtml = `
<div class='mui-container'>
    <div class="mui--text-center">
        <h2>Slideshow</h2>
        <div x-id="items" class="mui-panel x-slideshow"></div>
        speed: <input x-id="speed" type="range" min="100" max="3000" value="2000"/>
        nb images: <input x-id="nbImages" type="range" min="1" max="100" value="12"/>
        interval: <input x-id="interval" type="range" min="1" max="365" value="15" value="50"/>
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
        let currentOffset = 0;
        let finished = false;
        while (true) {
            try {
                const timeFromNowInMs = (parseInt(els.date.value || '0')) * 1000 * 60 * 60 * 24;
                const intervalInDays = parseInt(els.interval.value) || 1;
                const intervalInMs = intervalInDays * 1000 * 60 * 60 * 24;
                const nbDesiredImages = parseInt(els.nbImages.value);
                let waitDurationInMs = parseInt(els.speed.value) || 2000;
                let center = new Date().getTime() + timeFromNowInMs;
                let doSearch = false;
                if (lastSearchDate != timeFromNowInMs || lastSearchInterval != intervalInMs) {
                    currentOffset = 0;
                    doSearch = true;
                }
                else if (!possibleImages || !possibleImages.length) {
                    doSearch = !finished;
                }
                if (doSearch) {
                    lastSearchDate = timeFromNowInMs;
                    lastSearchInterval = intervalInMs;
                    console.log(`do a search on ${center} +/- ${intervalInDays} @ ${currentOffset}`);
                    let searchSpec = {
                        mimeType: 'image/%',
                        noDirectory: true,
                        limit: nbDesiredImages,
                        offset: currentOffset,
                        dateMin: center - intervalInMs,
                        dateMax: center + intervalInMs
                    };
                    const results = await Rest.searchEx(searchSpec);
                    possibleImages = results && results.items;
                    if (possibleImages.length)
                        currentOffset += possibleImages.length;
                    else
                        currentOffset = 0;
                    finished = possibleImages.length == 0;
                }
                if (possibleImages && possibleImages.length) {
                    els.remark.innerHTML = `${nbDesiredImages} images +/- ${intervalInDays} days around date ${new Date(center).toDateString()} (@${currentOffset}), ${possibleImages.length} possible images`;
                    let imageElement = null;
                    if (els.items.children.length < nbDesiredImages) {
                        imageElement = document.createElement('img');
                        els.items.appendChild(imageElement);
                        waitDurationInMs = 200;
                    }
                    else if (els.items.children.length > nbDesiredImages) {
                        imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length));
                        imageElement.parentElement.removeChild(imageElement);
                    }
                    else {
                        imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length));
                    }
                    let imageIndex = Math.floor(Math.random() * possibleImages.length);
                    let [usedImage] = possibleImages.splice(imageIndex, 1);
                    if (usedImage)
                        imageElement.src = Rest.getShaImageThumbnailUrl(usedImage.sha, usedImage.mimeType);
                }
                else {
                    Messages.displayMessage(`no more image, change the cursors`, 0);
                    els.remark.innerHTML = `no more image, change the cursors`;
                    if (els.items.children.length > 0) {
                        let imageElement = els.items.children.item(Math.floor(Math.random() * els.items.children.length));
                        imageElement.parentElement.removeChild(imageElement);
                    }
                }
                await wait(waitDurationInMs);
            }
            catch (err) {
                Messages.displayMessage(`error in slideshow, waiting 5s`, -1);
                await wait(5000);
            }
        }
    })();
    return els;
}
exports.create = create;
//# sourceMappingURL=slideshow.js.map
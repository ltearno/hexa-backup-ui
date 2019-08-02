﻿"use strict";
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
                const nbDesiredSideLength = parseInt(els.nbImages.value) || 1;
                let waitDurationInMs = parseInt(els.speed.value) || 2000;
                const nbWantedImages = nbDesiredSideLength * nbDesiredSideLength;
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
                        limit: nbWantedImages,
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
                const rand = max => Math.floor(max * Math.random());
                const removeRandomImage = () => {
                    let imageElement = pickRandomImage();
                    if (imageElement)
                        imageElement.parentElement.removeChild(imageElement);
                    return imageElement;
                };
                const addRandomImage = () => {
                    let imageElement = document.createElement('img');
                    els.items.appendChild(imageElement);
                    return imageElement;
                };
                const pickRandomImage = () => {
                    let possibleElements = [];
                    for (let row of els.items.children) {
                        for (let img of row.children)
                            possibleElements.push(img);
                    }
                    if (!possibleElements.length)
                        return null;
                    return possibleElements[rand(possibleElements.length)];
                };
                const imagesCount = () => {
                    let count = 0;
                    for (let rowIdx = 0; rowIdx < els.items.children.length; rowIdx++) {
                        const row = els.items.children.item(rowIdx);
                        count += row.children.length;
                    }
                    return count;
                };
                if (possibleImages && possibleImages.length) {
                    els.remark.innerHTML = `${nbWantedImages} images +/- ${intervalInDays} days around date ${new Date(center).toDateString()} (@${currentOffset}), ${possibleImages.length} possible images`;
                    if (imagesCount() > nbWantedImages) {
                        removeRandomImage();
                    }
                    else {
                        let imageElement = null;
                        if (imagesCount() < nbWantedImages) {
                            imageElement = addRandomImage();
                            waitDurationInMs = 200;
                        }
                        else {
                            imageElement = pickRandomImage();
                        }
                        let imageIndex = rand(possibleImages.length);
                        let [usedImage] = possibleImages.splice(imageIndex, 1);
                        if (usedImage)
                            imageElement.src = Rest.getShaImageThumbnailUrl(usedImage.sha, usedImage.mimeType);
                    }
                }
                else {
                    els.remark.innerHTML = `no more image, change the cursors`;
                    if (imagesCount() > 0) {
                        removeRandomImage();
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
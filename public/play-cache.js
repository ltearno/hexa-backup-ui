"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let cache = {};
try {
    cache = JSON.parse(localStorage.getItem('play-cache'));
}
catch (err) {
}
if (!cache || !(typeof cache === 'object'))
    cache = {};
function setPlayed(sha) {
    cache[sha] = true;
    localStorage.setItem('play-cache', JSON.stringify(cache));
}
exports.setPlayed = setPlayed;
function hasBeenPlayed(sha) {
    return cache[sha] || false;
}
exports.hasBeenPlayed = hasBeenPlayed;
function clearCache() {
    cache = {};
    localStorage.setItem('play-cache', JSON.stringify(cache));
}
exports.clearCache = clearCache;
//# sourceMappingURL=play-cache.js.map
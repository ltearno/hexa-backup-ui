"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDirectoryUrl(sha, name, currentTerm) {
    return `#/directories/${sha}?name=${encodeURIComponent(currentTerm ? (currentTerm + '/' + name) : name)}`;
}
exports.getDirectoryUrl = getDirectoryUrl;
function getReferenceUrl(name) {
    return `#/refs/${name}`;
}
exports.getReferenceUrl = getReferenceUrl;
function getPlaylistUrl(name) {
    return `#/playlists/${name}`;
}
exports.getPlaylistUrl = getPlaylistUrl;
function goShaInfo(item) {
    window.location.href = `#/info/${encodeURIComponent(JSON.stringify(item))}`;
}
exports.goShaInfo = goShaInfo;
function goSearchItems(term) {
    const url = `#/search/${term}`;
    window.location.href = url;
}
exports.goSearchItems = goSearchItems;
function goReference(name) {
    window.location.href = getReferenceUrl(name);
}
exports.goReference = goReference;
function goPlaylist(name) {
    window.location.href = getPlaylistUrl(name);
}
exports.goPlaylist = goPlaylist;
//# sourceMappingURL=locations.js.map